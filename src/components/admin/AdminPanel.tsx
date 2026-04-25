'use client';

import { useState, useCallback } from 'react';
import { Lock, Shield, CreditCard, GraduationCap, Clock, Megaphone, UserPlus, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfigSection from './ConfigSection';
import type { ConfigMap } from '@/types';

export const ADMIN_PASSWORD = 'invest2024';

const sections = [
  {
    title: 'Application',
    icon: 'app',
    fields: [
      { key: 'app_name', label: 'Nom de l\'application' },
    ],
  },
  {
    title: 'Tarifs',
    icon: 'tag',
    fields: [
      { key: 'price_1', label: 'Prix 1 mois' },
      { key: 'price_3', label: 'Prix 3 mois' },
      { key: 'price_lifetime', label: 'Prix a vie' },
    ],
  },
  {
    title: 'Paiement Mobile Money',
    icon: 'payment',
    fields: [
      { key: 'payment_link_1', label: 'Lien paiement 1 mois' },
      { key: 'payment_link_3', label: 'Lien paiement 3 mois' },
      { key: 'payment_link_lifetime', label: 'Lien paiement a vie' },
    ],
  },
  {
    title: 'Chaines VIP',
    icon: 'channels',
    fields: [
      { key: 'vip_whatsapp_channel', label: 'Chaine WhatsApp VIP' },
      { key: 'telegram_channel', label: 'Chaine Telegram (Signaux)' },
    ],
  },
  {
    title: 'Contacts',
    icon: 'contact',
    fields: [
      { key: 'admin_wa', label: 'WhatsApp Admin' },
      { key: 'admin_tg', label: 'Telegram Admin' },
    ],
  },
  {
    title: 'Formation',
    icon: 'formation',
    fields: [
      { key: 'formation_date', label: 'Date prochaine session' },
      { key: 'desc_online', label: 'Description en ligne' },
      { key: 'desc_offline', label: 'Description presentiel' },
    ],
  },
  {
    title: 'Dynamique',
    icon: 'dynamic',
    fields: [
      { key: 'promotions', label: 'Promotions' },
      { key: 'horaires', label: 'Horaires de disponibilite' },
      { key: 'extra_info', label: 'Informations supplementaires' },
    ],
  },
];

function getSectionIcon(iconName: string) {
  const iconClass = "w-4 h-4 text-[#D4AF37]";
  switch (iconName) {
    case 'app': return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
    case 'tag': return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
    case 'payment': return <CreditCard className={iconClass} />;
    case 'channels': return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
    case 'contact': return <Phone className={iconClass} />;
    case 'formation': return <GraduationCap className={iconClass} />;
    case 'dynamic': return <Clock className={iconClass} />;
    default: return <Shield className={iconClass} />;
  }
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [configs, setConfigs] = useState<ConfigMap>({});

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfigs(data);
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      void fetchConfigs();
    } else {
      setPasswordError('Mot de passe incorrect');
    }
  };

  const handleSave = async (key: string, value: string) => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': ADMIN_PASSWORD,
      },
      body: JSON.stringify({ key, value }),
    });

    if (res.ok) {
      setConfigs((prev) => ({ ...prev, [key]: value }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAFA] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-5 mx-auto">
              <Lock className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h2 className="text-gray-900 font-semibold text-lg mb-1">Acces restreint</h2>
            <p className="text-gray-400 text-sm mb-6">
              Entrez le mot de passe administrateur
            </p>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Mot de passe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200 text-center"
              />
              {passwordError && (
                <p className="text-red-500 text-xs text-center">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white font-medium text-sm hover:opacity-90 transition-opacity duration-200 cursor-pointer active:scale-[0.98]"
              >
                Connexion
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-base">Administration</h1>
            <p className="text-gray-400 text-xs">Gestion des configurations</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {sections.map((section) => (
          <ConfigSection
            key={section.title}
            title={section.title}
            icon={getSectionIcon(section.icon)}
            fields={section.fields}
            values={configs}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
