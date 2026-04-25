'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import type { Message } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Salut ! Bienvenue chez Invest Intelligents 👋\n\nJe suis là pour répondre à toutes tes questions sur nos abonnements VIP, les formations, les méthodes de paiement... N'hésite pas à me demander ce que tu veux savoir !",
  timestamp: new Date(),
};

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chatMessages = [...messages, userMessage]
        .map((m) => ({ role: m.role, content: m.content }))
        .filter((m) => m.id !== 'welcome');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Oops, une petite erreur. Tu peux réessayer ?',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, j\'ai un petit souci technique là. Tu peux réessayer ?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-[#D4AF37]/50 focus-within:ring-2 focus-within:ring-[#D4AF37]/10 transition-all duration-200 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            rows={1}
            className="flex-1 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 resize-none outline-none max-h-[120px] py-1.5 scrollbar-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white disabled:opacity-30 hover:opacity-90 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Invest Intelligents — Conseiller
        </p>
      </form>
    </div>
  );
}
