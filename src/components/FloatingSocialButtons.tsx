'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingSocialButtons() {
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const dragDistance = useRef(0);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.vip_whatsapp_channel) setWhatsappLink(data.vip_whatsapp_channel);
        if (data.telegram_channel) setTelegramLink(data.telegram_channel);
        if (data.vip_whatsapp_channel || data.telegram_channel) {
          setIsLoaded(true);
          // Initial position: bottom-right, above safe area
          const x = window.innerWidth - 68;
          const y = window.innerHeight - 140;
          setPos({ x, y });
        }
      })
      .catch(() => {});
  }, []);

  const onDragStart = useCallback((cx: number, cy: number) => {
    setIsDragging(true);
    dragDistance.current = 0;
    dragStart.current = { x: cx, y: cy, posX: pos.x, posY: pos.y };
  }, [pos]);

  const onDragMove = useCallback((cx: number, cy: number) => {
    const dx = cx - dragStart.current.x;
    const dy = cy - dragStart.current.y;
    dragDistance.current = Math.sqrt(dx * dx + dy * dy);
    const size = 56;
    const pad = 8;
    const nx = Math.max(pad, Math.min(dragStart.current.posX + dx, window.innerWidth - size - pad));
    const ny = Math.max(pad, Math.min(dragStart.current.posY + dy, window.innerHeight - size - pad));
    setPos({ x: nx, y: ny });
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    // NO snap-to-edge: the button stays exactly where the user dropped it
  }, []);

  // Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  };
  useEffect(() => {
    if (!isDragging) return;
    const mm = (e: MouseEvent) => onDragMove(e.clientX, e.clientY);
    const mu = () => onDragEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, [isDragging, onDragMove, onDragEnd]);

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    onDragStart(t.clientX, t.clientY);
  };
  useEffect(() => {
    if (!isDragging) return;
    const tm = (e: TouchEvent) => { const t = e.touches[0]; onDragMove(t.clientX, t.clientY); };
    const te = () => onDragEnd();
    window.addEventListener('touchmove', tm, { passive: true });
    window.addEventListener('touchend', te);
    return () => { window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', te); };
  }, [isDragging, onDragMove, onDragEnd]);

  // Close expanded on outside tap
  useEffect(() => {
    if (!isExpanded) return;
    const close = () => setIsExpanded(false);
    const t = setTimeout(() => {
      document.addEventListener('touchstart', close, { once: true });
      document.addEventListener('mousedown', close, { once: true });
    }, 150);
    return () => { clearTimeout(t); };
  }, [isExpanded]);

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (dragDistance.current > 8) return; // Was dragging, not clicking
    setIsExpanded((p) => !p);
  };

  if (!isLoaded) return null;

  const btnSize = 56;

  return (
    <>
      {/* Sub-buttons positioned ABOVE the main button */}
      <AnimatePresence>
        {isExpanded && (
          <div
            className="fixed z-50 flex flex-col items-end gap-2.5"
            style={{
              right: 'auto',
              bottom: 'auto',
              left: pos.x + btnSize / 2,
              top: pos.y - 8,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            {/* Telegram */}
            {telegramLink && (
              <motion.a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 bg-[#0088cc] text-white rounded-full pl-3 pr-4 py-2.5 shadow-lg active:scale-95 transition-transform"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span className="text-xs font-semibold">Telegram</span>
              </motion.a>
            )}

            {/* WhatsApp */}
            {whatsappLink && (
              <motion.a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                transition={{ duration: 0.2, delay: 0.06 }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 bg-[#25D366] text-white rounded-full pl-3 pr-4 py-2.5 shadow-lg active:scale-95 transition-transform"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-xs font-semibold">WhatsApp</span>
              </motion.a>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Main draggable button */}
      <button
        onClick={handleToggle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="fixed z-50 rounded-full shadow-xl flex items-center justify-center cursor-pointer outline-none select-none"
        style={{
          width: btnSize,
          height: btnSize,
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: 'none',
          bottom: 'auto',
          right: 'auto',
          top: 0,
          left: 0,
        }}
      >
        {!isExpanded && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#D4AF37]" style={{ animationDuration: '2.5s' }} />
        )}
        {isExpanded ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="relative z-10">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        )}
      </button>
    </>
  );
}
