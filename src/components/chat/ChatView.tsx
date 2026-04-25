'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import type { Message, ConfigMap } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<ConfigMap>({});
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setIsReady(true);
        // Set welcome message with actual app name
        const appName = data.app_name || 'Invest Intelligents';
        setMessages([{
          id: 'welcome',
          role: 'assistant' as const,
          content: `Salut ! Bienvenue chez ${appName}.\n\nJe suis la pour repondre a toutes tes questions sur nos abonnements VIP, les formations, les methodes de paiement... N'hesite pas a me demander ce que tu veux savoir !`,
          timestamp: new Date(),
        }]);
      })
      .catch(() => {
        setIsReady(true);
        setMessages([{
          id: 'welcome',
          role: 'assistant' as const,
          content: "Salut ! Bienvenue chez Invest Intelligents.\n\nJe suis la pour repondre a toutes tes questions sur nos abonnements VIP, les formations, les methodes de paiement...",
          timestamp: new Date(),
        }]);
      });
  }, []);

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

    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const chatMessages = [...messages, userMessage]
        .map((m) => ({ role: m.role, content: m.content }))
        .filter((m) => m.id !== 'welcome');

      // Send config with each request so AI always has latest values
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, config }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Erreur. Reessaye ?',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Souci technique. Reessaye ?',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };
  const handleQuickAction = (message: string) => { sendMessage(message); };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
    }
  };

  if (!isReady) return null;

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA]">
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 scrollbar-thin">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4">
        <QuickActions onAction={handleQuickAction} />
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-1.5">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_0_0_2px_rgba(212,175,55,0.08)] transition-all duration-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ecrire un message..."
            rows={1}
            className="flex-1 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 resize-none outline-none max-h-[100px] py-1 scrollbar-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white disabled:opacity-20 hover:opacity-90 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed active:scale-90"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
