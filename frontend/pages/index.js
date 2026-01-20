import { useState, useEffect } from 'react';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy tu asistente de análisis financiero de Solana. Puedo ayudarte a analizar datos históricos de precios, volumen y otros indicadores técnicos. ¿Qué te gustaría analizar hoy? Por ejemplo, puedes preguntarme: "Muestra el RSI de los últimos 14 días" o "Gráfico de volumen en 2021".'
    }
  ]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState('checking');

  // Verificar estado del sistema al cargar
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'healthy' && data.model_loaded && data.data_loaded) {
          setSystemStatus('ready');
        } else {
          setSystemStatus('error');
          setError('El sistema no está completamente listo. Modelo o datos no cargados.');
        }
      } catch (err) {
        setSystemStatus('error');
        setError('No se pudo conectar con el servidor. Por favor, inténtalo más tarde.');
      }
    };

    checkSystemStatus();
  }, []);

  const handleSendMessage = async (message) => {
    if (systemStatus !== 'ready') {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'El sistema aún no está listo. Por favor, espera unos momentos o contacta al administrador.'
      }]);
      return;
    }

    // Añadir mensaje del usuario
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message })
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Actualizar datos para visualización
        if (data.data && data.data.chart_data) {
          setChartData({
            ...data.data,
            lastQuery: message
          });
        }
        
        // Añadir respuesta del sistema
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: data.message,
          hasVisualization: !!data.data.chart_data,
          data: data.data
        }]);
      } else {
        throw new Error(data.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error procesando tu solicitud: ' + err.message);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `Lo siento, encontré un error al procesar tu consulta: "${message}". Por favor, intenta reformularla o verifica tu conexión. Error: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <>
      <Head>
        <title>Solana Predictor • Proyecto Final Unit 25</title>
        <meta name="description" content="Sistema de análisis financiero de Solana para proyecto académico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-blue-700 text-white p-4 shadow-md">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Solana Financial Analyzer</h1>
              <p className="text-sm mt-1">Proyecto Final • Unit 25: Applied Machine Learning • Pearson HND</p>
            </div>
            <div className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${
              systemStatus === 'ready' ? 'bg-green-500' : 
              systemStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {systemStatus === 'ready' && '✅ Sistema listo'}
              {systemStatus === 'checking' && '🔄 Verificando sistema...'}
              {systemStatus === 'error' && '❌ Error en el sistema'}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-blue-200 border-t border-blue-600 pt-2">
            <p>Este sistema utiliza datos históricos de Solana (SOL) para análisis educativo. No constituye asesoramiento financiero.</p>
          </div>
        </header>
        
        {/* AÑADE ESTE BLOQUE AQUÍ */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mx-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Demostración Académica</p>
              <p className="text-yellow-700 text-sm">
                Este sistema es una SIMULACIÓN para fines educativos. 
                NO utiliza modelos de ML reales ni proporciona asesoramiento financiero. 
                Los resultados se generan con lógica aleatoria para demostrar la arquitectura del sistema.
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto p-4 flex-grow flex flex-col md:flex-row gap-4">
          <div className="md:w-2/3 flex flex-col">
            <div className="bg-white rounded-lg shadow mb-4 p-4 flex-grow flex flex-col">
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading}
                error={error}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h3 className="font-bold text-lg mb-2">Ejemplos de consultas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Muestra el RSI de los últimos 14 días",
                  "Gráfico de volumen en 2021",
                  "Relación entre precio y número de trades",
                  "Media móvil de 30 días para 2023",
                  "Volatilidad histórica en el último trimestre"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(example)}
                    className="text-left p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:w-1/3">
            <Dashboard chartData={chartData} />
          </div>
        </div>
        
        <footer className="bg-gray-800 text-white p-4 mt-8 text-center">
          <p>Proyecto Final • Unit 25: Applied Machine Learning • Pearson HND</p>
          <p className="text-xs mt-1">Todos los resultados son para fines educativos y no para toma de decisiones financieras</p>
          <p className="text-xs mt-1">© {new Date().getFullYear()} Pablo Soto - Proyecto Académico</p>
        </footer>
      </div>
    </>
  );
}