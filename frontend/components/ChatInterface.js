import { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertTriangle } from 'react-icons';

const ChatInterface = ({ messages, onSendMessage, isLoading, error }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              <p>{message.text}</p>
              
              {message.hasVisualization && message.data && (
                <div className="mt-2 text-xs text-gray-600 p-2 bg-gray-100 rounded">
                  <p>{message.data.time_range 
                    ? `Análisis de ${message.data.time_range.start} a ${message.data.time_range.end}`
                    : 'Análisis generado'
                  }</p>
                  {message.data.indicators && message.data.indicators.length > 0 && (
                    <p className="mt-1">Indicadores: {message.data.indicators.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <Loader className="animate-spin h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Analizando datos...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu consulta sobre Solana..."
            disabled={isLoading}
            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;