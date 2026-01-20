import { generateChartData, generateExplanation } from '../../utils/mockData';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { query } = req.body;
    
    // Generar datos simulados basados en la consulta
    const params = extractParameters(query);
    const chartData = generateChartData(params);
    const explanation = generateExplanation(query, params);
    
    res.status(200).json({
      status: 'success',
      data: {
        chart_data: chartData,
        prediction: params.includePrediction ? (Math.random() * 5 + 10).toFixed(2) : null,
        indicators: params.indicators || [],
        time_range: params.time_range,
        metrics: params.metrics || ['close']
      },
      message: explanation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error procesando la solicitud: ' + error.message
    });
  }
}

function extractParameters(query) {
  // Esta función simula el análisis de la consulta
  const lowerQuery = query.toLowerCase();
  const params = {
    metrics: ['close', 'volume'],
    indicators: [],
    time_range: {
      start: '2023-01-01',
      end: '2023-03-31'
    },
    includePrediction: false
  };

  // Detectar indicadores
  if (lowerQuery.includes('rsi')) params.indicators.push('rsi');
  if (lowerQuery.includes('media móvil') || lowerQuery.includes('sma')) params.indicators.push('sma');
  if (lowerQuery.includes('volatilidad')) params.indicators.push('volatility');
  
  // Detectar si pide predicción
  if (lowerQuery.includes('predicción') || lowerQuery.includes('predecir')) {
    params.includePrediction = true;
  }
  
  // Detectar métricas
  if (lowerQuery.includes('volumen')) params.metrics = ['volume'];
  if (lowerQuery.includes('precio')) params.metrics = ['close'];
  
  // Ajustar rango de fechas según consulta
  if (lowerQuery.includes('2021')) {
    params.time_range = { start: '2021-01-01', end: '2021-12-31' };
  } else if (lowerQuery.includes('último mes') || lowerQuery.includes('últimos 30 días')) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    params.time_range = { 
      start: lastMonth.toISOString().split('T')[0], 
      end: today.toISOString().split('T')[0] 
    };
  }
  
  return params;
}