'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/types';

interface LinkInfo {
  text: string;
  url: string;
  type: 'whatsapp' | 'telegram' | 'payment' | 'other';
}

function isChannelUrl(url: string): boolean {
  try {
    const lurl = url.toLowerCase();
    // Block WhatsApp channel links
    if (lurl.includes('whatsapp.com/channel')) return true;
    // Block Telegram channel invite links (t.me/+...)
    const pathname = new URL(url).pathname;
    if (pathname.startsWith('/+')) return true;
    return false;
  } catch {
    return false;
  }
}

function extractLinks(text: string): LinkInfo[] {
  const urlRegex = /(https?:\/\/[^\s<>"')\]]+)/g;
  const links: LinkInfo[] = [];
  let match;
  const seen = new Set<string>();
  while ((match = urlRegex.exec(text)) !== null) {
    if (!seen.has(match[1])) {
      // SKIP channel URLs - they belong on the floating button only
      if (isChannelUrl(match[1])) continue;
      seen.add(match[1]);
      links.push({
        url: match[1],
        ...getLinkInfo(match[1]),
      });
    }
  }
  return links;
}

function getLinkInfo(url: string): { text: string; type: LinkInfo['type'] } {
  try {
    const lurl = url.toLowerCase();
    const hostname = new URL(url).hostname;

    // Payment links (mymaketou store)
    if (hostname.includes('mymaketou')) {
      if (lurl.includes('1-mois')) return { text: 'Abonnement 1 mois', type: 'payment' };
      if (lurl.includes('3-mois')) return { text: 'Abonnement 3 mois', type: 'payment' };
      if (lurl.includes('a-vie') || lurl.includes('vie')) return { text: 'Abonnement a vie', type: 'payment' };
      return { text: 'Effectuer le paiement', type: 'payment' };
    }
    // Direct WhatsApp contact (wa.me/number)
    if (hostname.includes('wa.me')) {
      return { text: 'Contacter sur WhatsApp', type: 'whatsapp' };
    }
    // Direct Telegram contact (t.me/username - NOT t.me/+ invite)
    if (hostname.includes('t.me')) {
      return { text: 'Contacter sur Telegram', type: 'telegram' };
    }
    return { text: 'Ouvrir le lien', type: 'other' };
  } catch {
    return { text: 'Ouvrir le lien', type: 'other' };
  }
}

function getButtonStyle(type: LinkInfo['type']): string {
  switch (type) {
    case 'whatsapp': return 'bg-[#25D366] text-white active:bg-[#1da851]';
    case 'telegram': return 'bg-[#0088cc] text-white active:bg-[#006daa]';
    case 'payment': return 'bg-[#D4AF37] text-white active:bg-[#B8962E]';
    default: return 'bg-gray-100 text-gray-700 active:bg-gray-200';
  }
}

function getButtonIcon(type: LinkInfo['type']): React.ReactNode {
  const s = 14;
  switch (type) {
    case 'whatsapp':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
    case 'telegram':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
    case 'payment':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    default:
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
  }
}

function renderFormattedText(text: string): React.ReactNode[] {
  // Remove URLs first (they become buttons)
  let cleanText = text.replace(/https?:\/\/[^\s<>"')\]]+/g, '').trim();
  // Remove empty brackets/parentheses: (), [], ( ), [ ]
  cleanText = cleanText.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '');
  // Remove dangling brackets like "(-" or "[-" or "(:"
  cleanText = cleanText.replace(/[\(\[]\s*[:\-]?\s*$/gm, '');
  // Remove trailing spaces per line but PRESERVE newlines
  cleanText = cleanText.replace(/[ \t]+$/gm, '');
  // Collapse multiple spaces on same line only (keep newlines intact)
  cleanText = cleanText.replace(/([^\n]) {2,}/g, '$1 ');
  // Limit consecutive newlines to max 2 (one blank line)
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
  cleanText = cleanText.trim();

  // Split by lines to preserve formatting
  const lines = cleanText.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const formatted = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={`b-${i}`}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) return <strong key={`b-${i}`}>{part.slice(1, -1)}</strong>;
      return <span key={`s-${i}`}>{part}</span>;
    });
    return (
      <React.Fragment key={`l-${lineIdx}`}>
        {formatted}
        {lineIdx < lines.length - 1 && '\n'}
      </React.Fragment>
    );
  });
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const urlLinks = isAssistant ? extractLinks(message.content) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[85%]">
        <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white font-medium rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
        }`}>
          {isUser ? message.content : renderFormattedText(message.content)}
        </div>

        {urlLinks.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1.5">
            {urlLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-150 ${getButtonStyle(link.type)}`}
              >
                {getButtonIcon(link.type)}
                {link.text}
              </a>
            ))}
          </div>
        )}

        <p className={`text-[10px] text-gray-300 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}
