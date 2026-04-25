'use client';

import { useEffect, useState } from 'react';
import ChatView from '@/components/chat/ChatView';
import FloatingTelegramButton from '@/components/FloatingTelegramButton';

export default function Home() {
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Warm up the config store
    fetch('/api/config').catch(() => {});
  }, []);

  return (
    <main className="h-dvh w-full overflow-hidden bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <div className="relative w-10 h-10">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Invest Intelligents"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D4AF37]/30"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#D4AF37]/30">
                II
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-base">Invest Intelligents</h1>
            <p className="text-emerald-500 text-xs font-medium">En ligne</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 min-h-0">
          <ChatView />
        </div>
      </div>
      <FloatingTelegramButton />
    </main>
  );
}
