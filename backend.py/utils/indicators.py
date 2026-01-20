import pandas as pd
import numpy as np

def calculate_rsi(data, period=14):
    """Calcular el Índice de Fuerza Relativa (RSI)"""
    try:
        # Calcular cambios de precio
        delta = data['close'].diff()
        
        # Separar ganancias y pérdidas
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        # Calcular promedios
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        
        # Calcular RS y RSI
        rs = avg_gain / avg_loss
        data['rsi'] = 100 - (100 / (1 + rs))
        
        return data
    
    except Exception as e:
        print(f"Error calculando RSI: {str(e)}")
        return data

def calculate_sma(data, period):
    """Calcular Media Móvil Simple (SMA)"""
    try:
        column_name = f'sma_{period}'
        data[column_name] = data['close'].rolling(window=period).mean()
        return data
    
    except Exception as e:
        print(f"Error calculando SMA {period}: {str(e)}")
        return data

def calculate_ema(data, period):
    """Calcular Media Móvil Exponencial (EMA)"""
    try:
        column_name = f'ema_{period}'
        data[column_name] = data['close'].ewm(span=period, adjust=False).mean()
        return data
    
    except Exception as e:
        print(f"Error calculando EMA {period}: {str(e)}")
        return data

def calculate_volatility(data, window=20):
    """Calcular volatilidad histórica (desviación estándar de retornos)"""
    try:
        # Calcular retornos diarios
        data['returns'] = data['close'].pct_change()
        
        # Calcular volatilidad como desviación estándar de los retornos
        data['volatility'] = data['returns'].rolling(window=window).std() * np.sqrt(365)  # Annualized
        
        # Eliminar columna temporal de retornos
        data.drop('returns', axis=1, inplace=True)
        
        return data
    
    except Exception as e:
        print(f"Error calculando volatilidad: {str(e)}")
        return data

def calculate_bollinger_bands(data, period=20, std_dev=2):
    """Calcular Bandas de Bollinger"""
    try:
        # Calcular SMA
        sma = data['close'].rolling(window=period).mean()
        
        # Calcular desviación estándar
        std = data['close'].rolling(window=period).std()
        
        # Calcular bandas
        data['bb_upper'] = sma + (std * std_dev)
        data['bb_lower'] = sma - (std * std_dev)
        data['bb_middle'] = sma
        
        return data
    
    except Exception as e:
        print(f"Error calculando Bandas de Bollinger: {str(e)}")
        return data