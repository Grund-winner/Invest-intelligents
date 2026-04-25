'use client';

import { useState, useCallback } from 'react';
import { Lock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfigSection from './ConfigSection';
import type { ConfigMap } from '@/types';

export const ADMIN_PASSWORD = 'invest2024';

const sections = [
  {
    title: 'Tarifs',
    icon: '💰',
    fields: [
      { key: 'price_1', label: 'Prix 1 mois' },
      { key: 'price_3', label: 'Prix 3 mois' },
      { key: 'price_lifetime', label: 'Prix à vie' },
    ],
  },
  {
    title: 'Crypto',
    icon: '🪙',
    fields: [
      { key: 'addr_trx', label: 'Adresse TRX (Tron)' },
      { key: 'addr_trc20', label: 'Adresse USDT TRC-20' },
      { key: 'addr_bep20', label: 'Adresse USDT BEP-20' },
    ],
  },
  {
    title: 'Mobile Money',
    icon: '📱',
    fields: [
      { key: 'payment_link_1', label: 'Lien paiement 1 mois' },
      { key: 'payment_link_3', label: 'Lien paiement 3 mois' },
      { key: 'payment_link_lifetime', label: 'Lien paiement à vie' },
    ],
  },
  {
    title: 'Contacts',
    icon: '📞',
    fields: [
      { key: 'admin_wa', label: 'WhatsApp Admin' },
      { key: 'admin_tg', label: 'Telegram Admin' },
      { key: 'vip_link', label: 'Lien groupe VIP' },
      { key: 'telegram_channel', label: 'Chaîne Telegram (Signaux)' },
    ],
  },
  {
    title: 'Formation',
    icon: '🎓',
    fields: [
      { key: 'formation_date', label: 'Date prochaine session' },
      { key: 'desc_online', label: 'Description en ligne' },
      { key: 'desc_offline', label: 'Description présentiel' },
    ],
  },
  {
    title: 'Dynamique',
    icon: '⚡',
    fields: [
      { key: 'promotions', label: 'Promotions' },
      { key: 'horaires', label: 'Horaires de disponibilité' },
      { key: 'extra_info', label: 'Informations supplémentaires' },
    ],
  },
];

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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
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
            <h2 className="text-gray-900 font-semibold text-lg mb-1">Accès restreint</h2>
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
                className="w-full py-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white font-medium text-sm hover:opacity-90 transition-opacity duration-200 cursor-pointer"
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {sections.map((section) => (
          <ConfigSection
            key={section.title}
            title={section.title}
            icon={section.icon}
            fields={section.fields}
            values={configs}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
