
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ThinkingIcon, ArrowUpIcon, SparklesIcon } from './Icons';
import './ChatBot.css';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  isVisible?: boolean;
}

const LUMO_BOT_SYSTEM_INSTRUCTION = `
You are LUMO BOT, the advanced AI concierge for LUMO STUDIOS. 
LUMO STUDIOS is a design software built to empower creatives through AI. 
You are an expert in futuristic UI/UX design, AI-driven creativity, and high-performance web development.
Your personality is professional, visionary, and supportive. 
When asked about LUMO STUDIOS, explain that it's a software to empower creatives by physicalizing their design concepts through AI.
Keep your responses helpful but brief. Use markdown for formatting where appropriate.
`;

const ChatBot: React.FC<ChatBotProps> = ({ isVisible = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Greetings. I am LUMO BOT. How can I assist your creative sequence today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: LUMO_BOT_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const botText = response.text || "My neural grid is experiencing a momentary sync delay. Please retry.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error('LUMO BOT Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Error: Connection to the neural core was interrupted.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`lumo-bot-container ${isOpen ? 'open' : ''} ${!isVisible ? 'ui-hidden' : ''}`}>
      <button className="lumo-bot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <span className="close-x">&times;</span> : <SparklesIcon />}
        <span className="lumo-bot-label">LUMO BOT</span>
      </button>

      {isOpen && (
        <div className="lumo-bot-window">
          <div className="lumo-bot-header">
            <div className="status-dot"></div>
            <span>LUMO STUDIOS // NEURAL_ASSISTANT</span>
          </div>
          <div className="lumo-bot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`lumo-message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="lumo-message bot">
                <div className="message-bubble typing">
                  <ThinkingIcon /> <span>SYNCING...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="lumo-bot-input">
            <input
              type="text"
              placeholder="Ask LUMO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <ArrowUpIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
