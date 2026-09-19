import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // Proxy all backend routes to TRIP//OS backend on port 5000
  app.use('/api', async (req, res, next) => {
    if (req.path === '/generate-itinerary' || req.path === '/health') {
      return next();
    }
    try {
      const backendBase = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
      const backendUrl = `${backendBase}/api${req.url}`;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string' && key.toLowerCase() !== 'host') {
          headers[key] = value;
        }
      }
      const fetchOptions: RequestInit = {
        method: req.method,
        headers
      };
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }
      const backendRes = await fetch(backendUrl, fetchOptions);
      res.status(backendRes.status);
      backendRes.headers.forEach((val, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'content-length') {
          res.setHeader(key, val);
        }
      });
      const data = await backendRes.text();
      res.send(data);
    } catch (err: any) {
      console.warn(`[Proxy Warning] TRIP//OS backend error for ${req.url}:`, err.message);
      res.status(502).json({ error: 'TRIP//OS backend unreachable', details: err.message });
    }
  });

  // Intelligent Itinerary Generation endpoint with Gemini fallback
  app.post('/api/generate-itinerary', async (req, res) => {
    try {
      const { 
        fromLocation, 
        toLocation, 
        friendsCount, 
        budget, 
        transportMode, 
        preferredActivities,
        moodMeter,
        startDate,
        durationDays
      } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ 
          useFallback: true, 
          message: 'No Gemini API key detected. Using local deterministic intelligence engine.' 
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      let moodInstructions = '';
      if (moodMeter) {
        moodInstructions = `\nExplorer Mood & Tolerance Parameters (0 - 100 scale):
- Adventure level: ${moodMeter.adventure}
- Nature preference: ${moodMeter.nature}
- Food & culinary focus: ${moodMeter.food}
- Photography focus: ${moodMeter.photography}
- Nightlife preference: ${moodMeter.nightlife}
- Relaxation & pacing: ${moodMeter.relaxation}
- Budget sensitivity: ${moodMeter.budgetSensitivity}
- Walking tolerance: ${moodMeter.walkingTolerance}
- Crowd tolerance: ${moodMeter.crowdTolerance}
Tailor the timing, physical exertion, pacing, and dining choices in accordance with these biometric and mood preferences.`;
      }

      const numDays = Math.max(1, Math.min(14, Number(durationDays) || 3));
      const prompt = `You are an expert Indian travel itinerary architect. Generate a comprehensive ${numDays}-day travel itinerary from ${fromLocation} to ${toLocation}.
Number of travelers: ${friendsCount}.
Total trip budget in INR: ₹${budget}.
Transport mode: ${transportMode}.
Departure date: ${startDate || 'Upcoming / Flexible'}.
Trip duration: ${numDays} days.
Preferred activities: ${preferredActivities && preferredActivities.length > 0 ? preferredActivities.join(', ') : 'Heritage, Food, Nature, Adventure'}.${moodInstructions}

Provide output strictly as JSON with this exact schema:
{
  "title": "${toLocation.toUpperCase()} CURATED EXPEDITION",
  "topSights": [
    {
      "name": "Attraction name",
      "category": "HISTORICAL / NATURE / ADVENTURE",
      "timing": "09:00 AM - 05:00 PM",
      "entryFee": 150,
      "rating": 4.8,
      "description": "Short vivid description of the attraction."
    }
  ],
  "diningHighlights": [
    {
      "name": "Restaurant / Cafe name",
      "cuisine": "Cuisine type",
      "famousDish": "Signature dish name",
      "avgCostPerPerson": 450,
      "mealType": "LUNCH",
      "rating": 4.7,
      "location": "Locality or market"
    }
  ],
  "popularStays": [
    {
      "name": "Hotel / Hostel / Homestay name",
      "type": "HERITAGE RESORT",
      "rating": 4.8,
      "pricePerNight": 3500,
      "features": ["WiFi", "Breakfast", "Mountain View"],
      "badge": "TRAVELER FAVORITE",
      "distanceFromCenter": "1.2 km from main market"
    }
  ],
  "dayPlans": [
    {
      "dayNumber": 1,
      "title": "Arrival & orientation title",
      "highlights": "Key highlights of the day",
      "dayEstimatedCost": 4500,
      "schedule": [
        {
          "time": "09:00 AM",
          "activity": "Activity description",
          "location": "Place name",
          "cost": 300,
          "tips": "Actionable insider tip"
        }
      ],
      "shoppingRecommendations": [
        {
          "item": "Specialty item",
          "market": "Market name",
          "priceRange": "₹300 - ₹800"
        }
      ]
    }
  ]
}`;

      // Use standard Gemini models from skill guidelines: gemini-3.8-flash with fallback to gemini-flash-latest and gemini-3.1-flash-lite
      const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response = null;

      for (const model of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          // Gracefully try next model if rate-limited or high-demand (503/429)
          console.info(`Model ${model} unavailable (${mErr?.status || mErr?.code || 'retrying'}), testing alternative candidate...`);
        }
      }

      const text = response?.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, plan: parsed });
        } catch (jsonErr) {
          console.info('JSON parsing fallback triggered for AI response.');
        }
      }

      return res.json({ useFallback: true });
    } catch (err: any) {
      console.info('Itinerary generation fallback to local deterministic engine.');
      return res.json({ useFallback: true, error: err?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
