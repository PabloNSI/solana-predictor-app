import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re

def load_historical_data(data_path):
    """Cargar datos históricos limitados para demostración"""
    try:
        # Intentar cargar datos reales primero
        if os.path.exists(data_path) and os.path.getsize(data_path) < 1000000:  # Menos de 1MB
            df = pd.read_csv(data_path)
            print(f"✅ Datos cargados exitosamente. Forma: {df.shape}")
        else:
            # Usar datos simulados si no existen o son muy grandes
            print("⚠️ Usando datos SIMULADOS para demostración académica")
            dates = pd.date_range(start='2023-01-01', end='2023-03-31')
            np.random.seed(42)
            prices = np.cumsum(np.random.randn(len(dates)) * 0.5) + 10.0
            
            df = pd.DataFrame({
                'timestamp': dates,
                'open': prices * 0.99,
                'high': prices * 1.01,
                'low': prices * 0.98,
                'close': prices,
                'volume': np.random.randint(1000000, 3000000, len(dates)),
                'number_of_trades': np.random.randint(4000, 7000, len(dates)),
                'taker_buy_base_asset_volume': np.random.randint(500000, 1500000, len(dates))
            })
        
        # Convertir timestamp a datetime si es necesario
        if 'timestamp' in df.columns and not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Ordenar y limpiar
        df.sort_values('timestamp', inplace=True)
        df.drop_duplicates(subset=['timestamp'], keep='last', inplace=True)
        df.reset_index(drop=True, inplace=True)
        
        # Limitar a 1000 filas como máximo para Vercel
        if len(df) > 1000:
            df = df.iloc[-1000:]
        
        return df
    
    except Exception as e:
        # Datos de respaldo mínimo si todo falla
        print(f"❌ Error cargando datos, usando datos mínimos de respaldo: {str(e)}")
        return pd.DataFrame({
            'timestamp': pd.date_range(start='2023-01-01', periods=30, freq='D'),
            'close': [10.0 + i*0.1 for i in range(30)],
            'volume': [1000000 + i*50000 for i in range(30)]
        })

def preprocess_input(data, params):
    """Preprocesar datos según los parámetros extraídos"""
    try:
        # Filtrar por rango de fechas
        if params.get('time_range'):
            start_date = pd.to_datetime(params['time_range']['start'])
            end_date = pd.to_datetime(params['time_range']['end'])
            mask = (data['timestamp'] >= start_date) & (data['timestamp'] <= end_date)
            data = data.loc[mask].copy()
        
        # Si no hay datos en el rango, usar los últimos 30 días
        if len(data) == 0:
            end_date = data['timestamp'].max()
            start_date = end_date - timedelta(days=30)
            mask = (data['timestamp'] >= start_date) & (data['timestamp'] <= end_date)
            data = data.loc[mask].copy()
        
        # Filtrar métricas solicitadas
        requested_metrics = params.get('metrics', ['close', 'volume'])
        available_metrics = ['close', 'open', 'high', 'low', 'volume', 'number_of_trades']
        metrics_to_keep = [m for m in requested_metrics if m in available_metrics]
        
        if not metrics_to_keep:
            metrics_to_keep = ['close', 'volume']
        
        # Asegurar que las columnas necesarias siempre estén presentes
        essential_columns = ['timestamp'] + metrics_to_keep
        data = data[essential_columns].copy()
        
        return data
    
    except Exception as e:
        print(f"Error en preprocesamiento: {str(e)}")
        return data

def extract_parameters(query):
    """Extraer parámetros del texto usando técnicas de NLP básicas"""
    params = {
        'time_range': {},
        'metrics': ['close', 'volume'],
        'indicators': [],
        'chart_type': 'line'
    }
    
    query_lower = query.lower()
    
    # Detectar métricas solicitadas
    if any(word in query_lower for word in ['volumen', 'volumenes', 'volumenes']):
        params['metrics'] = ['volume']
        if 'precio' in query_lower or 'close' in query_lower:
            params['metrics'] = ['close', 'volume']
            params['chart_type'] = 'dual'
    
    if any(word in query_lower for word in ['precio', 'close', 'apertura', 'open', 'máximo', 'high', 'mínimo', 'low']):
        params['metrics'] = ['close']
        if 'open' in query_lower:
            params['metrics'] = ['open']
        elif 'high' in query_lower or 'máximo' in query_lower:
            params['metrics'] = ['high']
        elif 'low' in query_lower or 'mínimo' in query_lower:
            params['metrics'] = ['low']
    
    if 'operaciones' in query_lower or 'trades' in query_lower:
        params['metrics'] = ['number_of_trades']
    
    # Detectar indicadores técnicos
    if any(word in query_lower for word in ['rsi', 'fuerza relativa']):
        params['indicators'].append('rsi')
    
    if any(word in query_lower for word in ['media móvil', 'sma', 'promedio móvil', 'moving average']):
        params['indicators'].append('sma')
    
    if any(word in query_lower for word in ['volatilidad', 'desviación estándar', 'std dev']):
        params['indicators'].append('volatility')
    
    # Detectar tipo de gráfico
    if 'barra' in query_lower or 'barras' in query_lower:
        params['chart_type'] = 'bar'
    
    if 'vela' in query_lower or 'candle' in query_lower or 'japones' in query_lower:
        params['chart_type'] = 'candlestick'
    
    # Detectar rangos temporales
    current_year = datetime.now().year
    
    # Últimos X días/meses/años
    if 'último mes' in query_lower or 'últimos 30 días' in query_lower:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        params['time_range'] = {'start': start_date.strftime('%Y-%m-%d'), 'end': end_date.strftime('%Y-%m-%d')}
    
    elif 'último trimestre' in query_lower or 'últimos 90 días' in query_lower:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        params['time_range'] = {'start': start_date.strftime('%Y-%m-%d'), 'end': end_date.strftime('%Y-%m-%d')}
    
    elif 'último año' in query_lower:
        end_date = datetime.now()
        start_date = datetime(current_year-1, 1, 1)
        params['time_range'] = {'start': start_date.strftime('%Y-%m-%d'), 'end': end_date.strftime('%Y-%m-%d')}
    
    # Años específicos
    for year in range(2020, current_year+1):
        if str(year) in query_lower:
            params['time_range'] = {
                'start': f'{year}-01-01',
                'end': f'{year}-12-31'
            }
            break
    
    # Si no se especifica rango temporal, usar último mes
    if not params['time_range']:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        params['time_range'] = {'start': start_date.strftime('%Y-%m-%d'), 'end': end_date.strftime('%Y-%m-%d')}
    
    return params

def generate_explanation(query, prediction, params):
    """Generar explicación en lenguaje natural basada en los resultados"""
    explanation = f"Analicé tu consulta sobre Solana: '{query}'. "
    
    # Información temporal
    time_info = ""
    if params.get('time_range'):
        start_date = params['time_range']['start']
        end_date = params['time_range']['end']
        
        # Formatear fechas de manera legible
        start_year = start_date.split('-')[0]
        end_year = end_date.split('-')[0]
        
        if start_year == end_year:
            time_info = f"para el año {start_year}"
        else:
            time_info = f"desde {start_year} hasta {end_year}"
    
    # Información de indicadores
    indicators_info = ""
    if params.get('indicators'):
        indicators_list = ", ".join(params['indicators'])
        indicators_info = f" con los indicadores técnicos: {indicators_list}"
    
    # Construir explicación
    if prediction:
        explanation += f"Basado en el análisis {time_info}{indicators_info}, la predicción del precio es de {prediction:.2f} USD. "
    else:
        explanation += f"He preparado un análisis {time_info}{indicators_info}. "
    
    # Añadir contexto sobre los datos
    explanation += (
        "Este análisis utiliza datos históricos de precios y volumen de Solana (SOL) y es puramente "
        "educativo. No constituye asesoramiento financiero ni una recomendación para invertir. "
        "Los mercados criptográficos son volátiles y los resultados pasados no garantizan resultados futuros."
    )
    
    return explanation