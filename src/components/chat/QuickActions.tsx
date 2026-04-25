'use client';

import type { QuickAction } from '@/types';
import { motion } from 'framer-motion';

const actions: QuickAction[] = [
  { label: 'Tarifs VIP', icon: '💰', message: 'Quels sont les tarifs de l\'abonnement VIP ?' },
  { label: 'Paiement', icon: '💳', message: 'Comment puis-je payer pour l\'abonnement VIP ?' },
  { label: 'Formation', icon: '🎓', message: 'Quand est la prochaine formation ?' },
  { label: 'Contact', icon: '📞', message: 'Comment contacter le support d\'Invest Intelligents ?' },
  { label: 'Chaîne Telegram', icon: '📡', message: 'C\'est quoi votre chaîne Telegram ?' },
];

interface QuickActionsProps {
  onAction: (message: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-none">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.25 }}
          onClick={() => onAction(action.message)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FEF3C7] border border-amber-200 text-amber-700 text-xs font-medium whitespace-nowrap hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 cursor-pointer flex-shrink-0"
        >
          <span className="text-sm">{action.icon}</span>
          <span>{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
