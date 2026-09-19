/**
 * TRIP//OS Step 6 — Weather Signal Service
 * Uses Open-Meteo (open public API, no key required) with safe fallback
 */

const logger = require("../utils/logger");

const WEATHER_CODE_DESCRIPTIONS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm"
};

/**
 * Fetch current weather and 3-day forecast for coordinates
 */
async function getWeather(latitude, longitude) {
    if (!latitude || !longitude) {
        return getFallbackWeather("Coordinates missing");
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation_probability&timezone=auto`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Weather API returned status ${response.status}`);
        }

        const data = await response.json();
        const current = data.current_weather || {};
        const weatherCode = current.weathercode || 0;
        const condition = WEATHER_CODE_DESCRIPTIONS[weatherCode] || "Clear";

        // Precipitation probability
        const hourlyProb = data.hourly?.precipitation_probability || [];
        const maxRainProb = hourlyProb.length > 0 ? Math.max(...hourlyProb.slice(0, 24)) : 10;

        const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode);

        return {
            temperature: current.temperature,
            windSpeed: current.windspeed,
            condition,
            weatherCode,
            isRaining,
            precipitationProbability: maxRainProb,
            source: "Open-Meteo Live API"
        };

    } catch (err) {
        logger.warn(`Live weather unavailable for [${latitude}, ${longitude}], using fallback:`, err.message);
        return getFallbackWeather(err.message);
    }
}

function getFallbackWeather(reason = "") {
    return {
        temperature: 24,
        windSpeed: 8,
        condition: "Partly cloudy",
        weatherCode: 2,
        isRaining: false,
        precipitationProbability: 15,
        source: "TRIP//OS Weather Fallback",
        notice: reason
    };
}

module.exports = {
    getWeather,
    WEATHER_CODE_DESCRIPTIONS
};
