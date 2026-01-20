import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from utils.indicators import calculate_rsi, calculate_sma, calculate_volatility

def load_model(model_path):
    """Cargar un modelo simulado para demostración académica"""
    print("ADVERTENCIA: Usando modelo SIMULADO para demostración académica")
    print("Este sistema NO realiza predicciones reales ni asesoramiento financiero")
    return {"type": "simulated", "status": "demo_mode"}

def predict_price(model, data):
    """Generar una 'predicción' simulada basada en tendencias simples"""
    if data.empty:
        return 10.50
    
    # Obtener el último precio
    last_price = data['close'].iloc[-1]
    
    # Simular una pequeña variación aleatoria (+/- 2%)
    np.random.seed(int(datetime.now().timestamp()) % 1000)
    variation = np.random.uniform(-0.02, 0.02)
    simulated_price = last_price * (1 + variation)
    
    return round(simulated_price, 2)

def calculate_indicators(data, indicators):
    """Calcular indicadores técnicos con datos reales o simulados"""
    try:
        if 'rsi' in indicators and 'rsi' not in data.columns:
            data = calculate_rsi(data, 14)
        
        if 'sma' in indicators:
            if 'sma_7' not in data.columns:
                data = calculate_sma(data, 7)
            if 'sma_14' not in data.columns:
                data = calculate_sma(data, 14)
        
        if 'volatility' in indicators and 'volatility' not in data.columns:
            data = calculate_volatility(data, 20)
        
        return data
    except Exception as e:
        print(f"Error calculando indicadores (simulado): {str(e)}")
        return data