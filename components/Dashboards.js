import { useState, useEffect } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Loader, AlertTriangle } from 'react-icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const Dashboard = ({ chartData }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [indicatorsInfo, setIndicatorsInfo] = useState([]);

  // Cargar información de indicadores disponibles
  useEffect(() => {
    const fetchIndicatorsInfo = async () => {
      try {
        const response = await fetch('/api/indicators');
        const data = await response.json();
        setIndicatorsInfo(data.available_indicators || []);
      } catch (error) {
        console.error('Error fetching indicators info:', error);
      }
    };

    fetchIndicatorsInfo();
  }, []);

  if (!chartData || !chartData.chart_data || chartData.chart_data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Panel de Análisis</h2>
        <div className="flex-grow flex items-center justify-center text-gray-500">
          <p>No hay datos para visualizar. Haz una consulta en el chat para generar un análisis.</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold mb-2">Indicadores Técnicos Disponibles:</h3>
          <div className="space-y-2">
            {indicatorsInfo.map((indicator, index) => (
              <div key={index} className="border border-gray-200 rounded p-2">
                <h4 className="font-medium">{indicator.name}</h4>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const timestamps = chartData.chart_data.map(d => d.timestamp || d.date);
  const prices = chartData.chart_data.map(d => d.close);
  
  // Determinar tipo de gráfico a mostrar
  let ChartComponent = Line;
  let chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: chartData.lastQuery || 'Análisis de Solana (SOL)'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: determineTimeUnit(timestamps),
        },
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Precio (USD)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  let chartDataConfig = {
    labels: timestamps,
    datasets: [{
      label: 'Precio de Cierre (USD)',
      data: prices,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      tension: 0.3,
      fill: true,
    }]
  };

  // Añadir indicadores si están disponibles
  if (chartData.indicators) {
    if (chartData.indicators.includes('rsi') && chartData.chart_data[0].rsi) {
      chartDataConfig.datasets.push({
        label: 'RSI (14 días)',
        data: chartData.chart_data.map(d => d.rsi),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      });
      
      chartOptions.scales.y1 = {
        position: 'right',
        title: {
          display: true,
          text: 'RSI'
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        }
      };
    }
    
    if (chartData.indicators.includes('sma')) {
      ['sma_7', 'sma_14', 'sma_30'].forEach(sma => {
        if (chartData.chart_data[0][sma]) {
          const period = sma.split('_')[1];
          const color = period === '7' ? 'rgb(75, 192, 192)' : 
                        period === '14' ? 'rgb(255, 159, 64)' : 'rgb(153, 102, 255)';
          
          chartDataConfig.datasets.push({
            label: `SMA (${period} días)`,
            data: chartData.chart_data.map(d => d[sma]),
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          });
        }
      });
    }
    
    if (chartData.indicators.includes('volatility') && chartData.chart_data[0].volatility) {
      chartDataConfig.datasets.push({
        label: 'Volatilidad (20 días)',
        data: chartData.chart_data.map(d => d.volatility),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y1',
        type: 'line',
        fill: true,
      });
    }
  }

  // Si se solicita volumen, crear un gráfico de barras
  if (chartData.metrics && chartData.metrics.includes('volume')) {
    ChartComponent = Bar;
    chartDataConfig = {
      labels: timestamps,
      datasets: [{
        label: 'Volumen de Trading',
        data: chartData.chart_data.map(d => d.volume),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      }]
    };
    
    chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Volumen de Trading de Solana'
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: determineTimeUnit(timestamps),
          },
          title: {
            display: true,
            text: 'Fecha'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Volumen'
          },
          ticks: {
            callback: function(value) {
              if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
              if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
              if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
              return value;
            }
          }
        }
      }
    };
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resultados del Análisis</h2>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            className={`px-3 py-1 text-sm ${activeTab === 'chart' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('chart')}
          >
            Gráfico
          </button>
          <button
            className={`px-3 py-1 text-sm ${activeTab === 'data' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('data')}
          >
            Datos
          </button>
        </div>
      </div>
      
      {activeTab === 'chart' ? (
        <div className="flex-grow min-h-[300px]">
          <ChartComponent 
            data={chartDataConfig} 
            options={chartOptions} 
          />
        </div>
      ) : (
        <div className="flex-grow overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-right">Precio (USD)</th>
                {chartData.metrics.includes('volume') && (
                  <th className="p-2 text-right">Volumen</th>
                )}
              </tr>
            </thead>
            <tbody>
              {chartData.chart_data.slice(-10).reverse().map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{new Date(row.timestamp).toLocaleDateString()}</td>
                  <td className="p-2 text-right">{row.close?.toFixed(2) || 'N/A'}</td>
                  {chartData.metrics.includes('volume') && (
                    <td className="p-2 text-right">
                      {(row.volume / 1e6).toFixed(2)}M
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold mb-2">Resumen del Análisis</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Período Analizado:</p>
            <p>{chartData.time_range?.start} a {chartData.time_range?.end}</p>
          </div>
          <div>
            <p className="font-medium">Último Precio:</p>
            <p>${prices[prices.length-1]?.toFixed(2) || 'N/A'}</p>
          </div>
          {chartData.prediction && (
            <div className="col-span-2 mt-2">
              <p className="font-medium text-blue-600">Predicción:</p>
              <p>${chartData.prediction.toFixed(2)} USD</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Función para determinar la unidad de tiempo apropiada para el eje X
const determineTimeUnit = (timestamps) => {
  if (!timestamps || timestamps.length < 2) return 'day';
  
  const startDate = new Date(timestamps[0]);
  const endDate = new Date(timestamps[timestamps.length - 1]);
  const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 365) return 'year';
  if (diffDays > 30) return 'month';
  if (diffDays > 7) return 'week';
  return 'day';
};

export default Dashboard;