import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_loader import load_model, predict_price, calculate_indicators
from utils.data_processing import preprocess_input, load_historical_data, extract_parameters, generate_explanation

app = Flask(__name__)
CORS(app)

# Cargar modelo y datos al iniciar
model_path = os.environ.get('MODEL_PATH', 'models/rf_model_best.pkl')
data_path = os.environ.get('DATA_PATH', 'data/sol_1d_data_2025.csv')

try:
    model = load_model(model_path)
    historical_data = load_historical_data(data_path)
    print(f"✅ Modelo cargado exitosamente desde {model_path}")
    print(f"✅ Datos históricos cargados desde {data_path}")
except Exception as e:
    print(f"❌ Error al cargar recursos: {str(e)}")
    model = None
    historical_data = None

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None or historical_data is None:
        return jsonify({
            'status': 'error',
            'message': 'Modelo o datos no disponibles. Verifica la configuración.'
        }), 500
    
    try:
        data = request.json
        user_query = data.get('query', '')
        
        # Extraer parámetros del prompt usando técnicas básicas de NLP
        params = extract_parameters(user_query)
        
        # Procesar datos históricos según parámetros
        processed_data = preprocess_input(historical_data.copy(), params)
        
        # Calcular indicadores técnicos si se solicitan
        if params.get('indicators'):
            processed_data = calculate_indicators(processed_data, params['indicators'])
        
        # Generar predicción si es relevante
        prediction = None
        if any(word in user_query.lower() for word in ['predicción', 'predecir', 'pronóstico', 'forecast']):
            prediction = predict_price(model, processed_data.iloc[-1:])
        
        # Preparar datos para visualización
        chart_data = processed_data.copy()
        if len(chart_data) > 1000:  # Limitar puntos para visualización
            chart_data = chart_data.iloc[-1000:]
        
        # Preparar respuesta
        response = {
            'status': 'success',
            'data': {
                'chart_data': chart_data.to_dict(orient='records'),
                'prediction': prediction,
                'indicators': params.get('indicators', []),
                'time_range': params.get('time_range'),
                'metrics': params.get('metrics', ['close'])
            },
            'message': generate_explanation(user_query, prediction, params)
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error processing request: {str(e)}',
            'details': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'data_loaded': historical_data is not None,
        'data_shape': historical_data.shape if historical_data is not None else None,
        'model_type': str(type(model)) if model is not None else None
    })

@app.route('/api/indicators', methods=['GET'])
def get_indicators_info():
    return jsonify({
        'available_indicators': [
            {
                'name': 'RSI',
                'description': 'Índice de Fuerza Relativa - mide la magnitud de los cambios recientes de precios para evaluar condiciones de sobrecompra o sobreventa',
                'parameters': {'period': 14}
            },
            {
                'name': 'SMA',
                'description': 'Media Móvil Simple - promedio de precios en un período determinado',
                'parameters': {'period': 20}
            },
            {
                'name': 'Volatilidad',
                'description': 'Desviación estándar de los retornos en un período determinado',
                'parameters': {'window': 20}
            }
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=True)