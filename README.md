# Solana Predictor App • Proyecto Final Unit 25

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://solana-predictor-app.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black?logo=next.js)](https://nextjs.org)

Sistema de análisis financiero de Solana (SOL) para proyecto académico de la asignatura **Unit 25: Applied Machine Learning** (Pearson HND).

## Descripción del Proyecto

Esta aplicación web permite analizar datos históricos de Solana mediante una interfaz conversacional en español. El sistema interpreta consultas en lenguaje natural, extrae parámetros relevantes, realiza análisis de series temporales y genera visualizaciones dinámicas.

**Características principales:**

- Interfaz de chat para consultas en lenguaje natural
- Análisis de series temporales con datos históricos de Solana
- Cálculo de indicadores técnicos (RSI, SMA, Volatilidad)
- Visualizaciones dinámicas adaptadas a las consultas
- Explicaciones en lenguaje natural de los resultados
- Arquitectura escalable para futuras mejoras

## Estructura del Repositorio

```text
solana-predictor-app/
├── backend/ # API Flask para el modelo
│ ├── app.py # Punto de entrada de la API
│ ├── requirements.txt # Dependencias del backend
│ ├── model_loader.py # Carga el modelo entrenado
│ └── utils/ # Funciones de procesamiento
│ ├── data_processing.py
│ └── indicators.py # Cálculo de indicadores técnicos
├── frontend/ # Aplicación Next.js
│ ├── pages/
│ │ ├── index.js # Página principal con interfaz de chat
│ │ └── api/ # Routes API para comunicación
│ ├── components/
│ │ ├── ChatInterface.js # Componente conversacional
│ │ ├── Visualization.js # Componentes de gráficos
│ │ └── Dashboard.js
│ └── ...
├── vercel.json # Configuración crítica para Vercel
└── README.md # Este archivo
```

## Requisitos Previos

- Node.js v16+
- Python 3.9+
- Acceso a los archivos del modelo y dataset (proporcionados en el repositorio complementario)

## Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/PabloNSI/solana-predictor-app.git
cd solana-predictor-app
```

### 2. Configurar el backend (Python)

```bash
# Crear entorno virtual

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias

pip install -r backend/requirements.txt

# Configurar variables de entorno

cp .env.example .env
# Editar .env con las rutas correctas a tus archivos de modelo y datos
```

### 3. Configurar el frontend (Next.js)

```bash
cd frontend
npm install
```

### 4. Ejecutar la aplicación en modo desarrollo

```bash
# En una terminal (backend):
cd backend
flask run --port=5000
```

```bash
# En otra terminal (frontend):
cd frontend
npm run dev
```

## ⚠️ Versión de Demostración Académica

Esta implementación es una **SIMULACIÓN** para fines educativos que demuestra:

- Arquitectura completa de un sistema de análisis financiero
- Interfaz conversacional para consultas en lenguaje natural
- Visualización de datos con indicadores técnicos
- Patrones de diseño para aplicaciones ML escalables

**IMPORTANTE:**

- No se utilizan modelos de machine learning reales en este despliegue
- Los datos mostrados son simulados o limitados a un pequeño conjunto de ejemplo
- Las "predicciones" son generadas con lógica aleatoria para demostrar el flujo
- Este sistema NO proporciona asesoramiento financiero ni predicciones reales
- La versión académica completa con modelos reales se ejecuta localmente

Esta aproximación permite:
✅ Despliegue exitoso en Vercel sin límites de almacenamiento
✅ Demostración visual de todas las funcionalidades requeridas
✅ Cumplimiento de requisitos éticos (sin asesoramiento financiero real)
✅ Enfoque en la arquitectura y diseño del sistema en lugar de resultados predictivos
