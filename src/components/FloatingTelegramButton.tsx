'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function getInitialPosition() {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const x = window.innerWidth - 76; // 60px button + 16px padding
  const y = window.innerHeight - 140; // above bottom area
  return { x, y };
}

export default function FloatingTelegramButton() {
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0, startTime: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragDistance = useRef(0);

  // Fetch telegram channel config
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.telegram_channel) {
          setTelegramLink(data.telegram_channel);
          setIsVisible(true);
          setPosition(getInitialPosition());
        }
      })
      .catch(() => {});
  }, []);

  const snapToEdge = useCallback((currentX: number, currentY: number) => {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const buttonSize = window.innerWidth >= 640 ? 60 : 56;
    const padding = 12;

    // Snap to nearest horizontal edge
    const leftDist = currentX - padding;
    const rightDist = windowW - currentX - buttonSize - padding;
    const snappedX = leftDist < rightDist ? padding : windowW - buttonSize - padding;

    // Clamp Y within viewport
    const snappedY = Math.max(padding, Math.min(currentY, windowH - buttonSize - padding));

    setIsSnapping(true);
    setPosition({ x: snappedX, y: snappedY });

    setTimeout(() => setIsSnapping(false), 300);
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragDistance.current = 0;
    dragStart.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
      startTime: Date.now(),
    };
  }, [position]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    dragDistance.current = Math.sqrt(dx * dx + dy * dy);

    const buttonSize = window.innerWidth >= 640 ? 60 : 56;
    const padding = 12;
    const newX = Math.max(padding, Math.min(dragStart.current.posX + dx, window.innerWidth - buttonSize - padding));
    const newY = Math.max(padding, Math.min(dragStart.current.posY + dy, window.innerHeight - buttonSize - padding));

    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    snapToEdge(position.x, position.y);
  }, [position, snapToEdge]);

  const handleClick = () => {
    if (dragDistance.current > 5) return;
    if (telegramLink) {
      window.open(telegramLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isVisible) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const buttonSize = isMobile ? 56 : 60;

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="fixed z-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer outline-none select-none"
      style={{
        width: buttonSize,
        height: buttonSize,
        background: '#0088cc',
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isSnapping ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        bottom: 'auto',
        right: 'auto',
        top: 0,
        left: 0,
      }}
      aria-label="Ouvrir la chaîne Telegram"
    >
      {/* Pulse animation ring */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-25"
        style={{ background: '#0088cc', animationDuration: '2s' }}
      />
      {/* Telegram Paper Plane SVG */}
      <svg
        width={isMobile ? 28 : 30}
        height={isMobile ? 28 : 30}
        viewBox="0 0 24 24"
        fill="white"
        className="relative z-10"
      >
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    </button>
  );
}
