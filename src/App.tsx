import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from './services/aiService';
import type { Message, Provider } from './services/aiService';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY || '';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<Provider>('grok');
  const [apiKey, setApiKey] = useState(GROK_API_KEY);
  const [model, setModel] = useState('grok-beta');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessage(provider, apiKey, [...messages, userMessage], model);

    if (response.error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${response.error}` }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
    }

    setIsLoading(false);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as Provider;
    setProvider(newProvider);
    setModel(newProvider === 'grok' ? 'grok-beta' : 'openai/gpt-3.5-turbo');
    if (newProvider === 'openrouter') {
      setApiKey(OPENROUTER_API_KEY);
    } else if (newProvider === 'grok') {
      setApiKey(GROK_API_KEY);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Modern Grok Chat</h1>
        <div className="controls">
          <select value={provider} onChange={handleProviderChange}>
            <option value="grok">xAI (Grok)</option>
            <option value="openrouter">OpenRouter</option>
          </select>
          <input
            type="text"
            placeholder="Model ID (e.g. grok-beta)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
      </header>

      <main className="chat-container">
        <div className="message-list">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
              <p>Welcome! Select a provider and start chatting.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
          </div>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !apiKey}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
