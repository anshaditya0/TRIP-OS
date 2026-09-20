export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    engine: 'TRIP//OS Cloud Edge Telemetry', 
    timestamp: new Date().toISOString() 
  });
}
