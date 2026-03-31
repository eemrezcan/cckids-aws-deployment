'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const GeminiAssistant = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t('assistant.welcome', 'Merhaba! Ben CCkids Tasarımcısıyım. ✨ Sınıfınız için mobilya seçimi konusunda sana nasıl yardımcı olabilirim?'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: userMsg.text,
          messages: nextMessages,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API failed: ${res.status}`);
      }

      const data = (await res.json()) as { text?: string };

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text || t('assistant.fallback', 'Üzgünüm, şu an bağlantımda bir sorun var. Lütfen tekrar dener misin? 🎈'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t('assistant.error', 'Bir hata oluştu ama sorun değil, tekrar deneyebiliriz! 🛠️'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-cc-pink to-cc-orange text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce group relative border-4 border-white"
          aria-label={t('assistant.open', 'Yapay zeka asistanını aç')}
        >
          <Sparkles className="absolute -top-1 -right-1 text-cc-yellow" size={20} fill="currentColor" />
          <MessageCircle size={32} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-[30px] shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border-4 border-cc-cyan animate-bounce-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-cc-cyan to-blue-400 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold">{t('assistant.title', 'Tasarım Sihirbazı')}</h3>
                <p className="text-xs text-white/80">{t('assistant.subtitle', 'Yapay Zeka Destekli')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto h-80 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-cc-pink text-white rounded-tr-none shadow-md'
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                  <span className="w-2 h-2 bg-cc-pink rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-cc-yellow rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-cc-cyan rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('assistant.ask', 'Bir soru sorun...')}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cc-cyan/50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-cc-cyan text-white p-2 rounded-full hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                aria-label={t('common.send', 'Gönder')}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;
