'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

function extractLinks(text: string): { text: string; url: string }[] {
  const urlRegex = /(https?:\/\/[^\s<>"')\]]+)/g;
  const links: { text: string; url: string }[] = [];
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    links.push({
      url: match[1],
      text: getLinkLabel(match[1]),
    });
  }
  return links;
}

function getLinkLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('whatsapp.com')) return '🟢 Ouvrir WhatsApp';
    if (hostname.includes('t.me') || hostname.includes('telegram')) return '🔵 Ouvrir Telegram';
    if (hostname.includes('mymaketou')) return '🛒 Boutique en ligne';
    return '🔗 ' + hostname;
  } catch {
    return '🔗 Lien';
  }
}

function renderFormattedText(text: string): React.ReactNode[] {
  // Remove URLs first (they'll be shown as buttons)
  const cleanText = text.replace(/https?:\/\/[^\s<>"')\]]+/g, '').trim();

  // Parse bold: **text** or *text*
  const parts = cleanText.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(1, -1)}</strong>;
    }
    // Parse <b>text</b>
    const boldParts = part.split(/(<b>[^<]+<\/b>)/g);
    if (boldParts.length > 1) {
      return boldParts.map((bp, j) => {
        if (bp.startsWith('<b>') && bp.endsWith('</b>')) {
          return <strong key={`${i}-${j}`} className="font-semibold">{bp.slice(3, -4)}</strong>;
        }
        return <span key={`${i}-${j}`}>{bp}</span>;
      });
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const links = isAssistant ? extractLinks(message.content) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[82%] sm:max-w-[70%]`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white font-medium rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
          }`}
        >
          {isUser ? message.content : renderFormattedText(message.content)}
        </div>

        {/* Inline link buttons (Telegram-style) */}
        {links.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1.5">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-gray-200 text-blue-600 rounded-lg px-4 py-2 text-xs font-medium border border-gray-200 text-center transition-colors duration-150"
              >
                {link.text}
              </a>
            ))}
          </div>
        )}

        <p className={`text-[10px] text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}
