export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    model_loaded: true,
    data_loaded: true,
    message: 'Demo académica - Sistema en modo simulación'
  });
}