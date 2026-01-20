import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from utils.indicators import calculate_rsi, calculate_sma, calculate_volatility

def load_model(model_path):
    """Cargar el modelo entrenado desde un archivo .pkl"""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    try:
        model = joblib.load(model_path)
        print(f"Modelo cargado exitosamente: {type(model)}")
        return model
    except Exception as e:
        raise Exception(f"Error al cargar el modelo: {str(e)}")

def predict_price(model, data):
    """Realizar una predicción de precio usando el modelo cargado"""
    try:
        # Verificar que las características necesarias estén presentes
        required_features = ['close', 'volume', 'high', 'low', 'open', 'number_of_trades', 
                            'taker_buy_base_asset_volume', 'rsi', 'sma_7', 'sma_14', 'volatility']
        
        # Asegurar que todas las características necesarias existen
        for feature in required_features:
            if feature not in data.columns and feature != 'target':
                if feature.startswith('sma_'):
                    period = int(feature.split('_')[1])
                    data = calculate_sma(data, period)
                elif feature == 'rsi':
                    data = calculate_rsi(data, 14)
                elif feature == 'volatility':
                    data = calculate_volatility(data, 20)
        
        # Seleccionar solo las características que el modelo espera
        feature_columns = [col for col in data.columns if col != 'target' and col != 'timestamp']
        X = data[feature_columns]
        
        # Realizar predicción
        prediction = model.predict(X)[0]
        return float(prediction)
    
    except Exception as e:
        print(f"Error en la predicción: {str(e)}")
        return None

def calculate_indicators(data, indicators):
    """Calcular los indicadores técnicos solicitados"""
    try:
        if 'rsi' in indicators:
            data = calculate_rsi(data, 14)
        
        if 'sma' in indicators:
            data = calculate_sma(data, 7)
            data = calculate_sma(data, 14)
            data = calculate_sma(data, 30)
        
        if 'volatility' in indicators:
            data = calculate_volatility(data, 20)
        
        return data
    
    except Exception as e:
        print(f"Error calculando indicadores: {str(e)}")
        return data