'use client';

import { useEffect, useState } from 'react';
import ChatView from '@/components/chat/ChatView';
import FloatingSocialButtons from '@/components/FloatingSocialButtons';

export default function Home() {
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetch('/api/config').catch(() => {});
  }, []);

  return (
    <main className="h-dvh w-full max-w-lg mx-auto overflow-hidden bg-white relative">
      <div className="flex flex-col h-full">
        {/* Header - iOS style */}
        <header className="flex items-center gap-3 px-4 py-2.5 bg-white/90 backdrop-blur-lg border-b border-gray-100/80 sticky top-0 z-20">
          <div className="relative w-10 h-10 flex-shrink-0">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Invest Intelligents"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D4AF37]/20"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#D4AF37]/20">
                II
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-gray-900 font-semibold text-[15px] tracking-tight">Invest Intelligents</h1>
            <p className="text-emerald-500 text-[11px] font-medium">En ligne</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 min-h-0">
          <ChatView />
        </div>
      </div>
      <FloatingSocialButtons />
    </main>
  );
}
