import { addDays, format } from 'date-fns';

export function generateChartData(params) {
  const startDate = new Date(params.time_range.start);
  const endDate = new Date(params.time_range.end);
  const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const dataPoints = Math.min(days, 60); // Limitar a 60 puntos para rendimiento
  
  const data = [];
  let currentDate = new Date(startDate);
  let basePrice = 10.0;
  
  for (let i = 0; i < dataPoints; i++) {
    // Simular variación de precio
    const priceVariation = (Math.random() - 0.5) * 2;
    basePrice = Math.max(5, basePrice + priceVariation);
    
    // Simular volumen correlacionado con volatilidad
    const volumeBase = 1500000;
    const volumeVariation = Math.random() * 1000000;
    
    const dataPoint = {
      timestamp: format(currentDate, 'yyyy-MM-dd HH:mm:ss'),
      open: basePrice * (0.99 + Math.random() * 0.02),
      high: basePrice * (1.01 + Math.random() * 0.03),
      low: basePrice * (0.97 + Math.random() * 0.02),
      close: basePrice,
      volume: volumeBase + volumeVariation,
      number_of_trades: 4000 + Math.floor(Math.random() * 3000)
    };
    
    // Calcular indicadores técnicos simulados si se solicitan
    if (params.indicators.includes('rsi')) {
      dataPoint.rsi = 30 + Math.random() * 70; // RSI entre 30 y 100
    }
    
    if (params.indicators.includes('sma')) {
      dataPoint.sma_7 = basePrice * (0.98 + Math.random() * 0.04);
      dataPoint.sma_14 = basePrice * (0.97 + Math.random() * 0.06);
    }
    
    if (params.indicators.includes('volatility')) {
      dataPoint.volatility = 0.1 + Math.random() * 0.2; // Volatilidad entre 10% y 30%
    }
    
    data.push(dataPoint);
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
}

export function generateExplanation(query, params) {
  const indicatorsText = params.indicators.length > 0 
    ? ` con los indicadores técnicos: ${params.indicators.join(', ')}` 
    : '';
  
  const timeText = params.time_range 
    ? ` para el período ${params.time_range.start} a ${params.time_range.end}` 
    : '';
  
  let predictionText = '';
  if (params.includePrediction) {
    const prediction = (Math.random() * 5 + 10).toFixed(2);
    predictionText = ` La predicción simulada del precio es ${prediction} USD.`;
  }
  
  return `He analizado tu consulta sobre Solana: "${query}"${timeText}${indicatorsText}.${predictionText} 
  RECUERDA: Esta es una DEMOSTRACIÓN ACADÉMICA. Los datos y resultados son SIMULADOS para mostrar la arquitectura del sistema. 
  NO constituye asesoramiento financiero ni utiliza modelos de machine learning reales en este despliegue.`;
}