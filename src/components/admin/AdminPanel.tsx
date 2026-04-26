'use client';

import { useState, useCallback, useRef } from 'react';
import { Lock, Shield, CreditCard, GraduationCap, Clock, Phone, Camera, Trash2, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfigs(data);
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    }
  }, []);

  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch('/api/logo');
      const data = await res.json();
      if (data.hasLogo && data.logo) {
        setLogoPreview(data.logo);
        setHasLogo(true);
      } else {
        setLogoPreview(null);
        setHasLogo(false);
      }
    } catch {
      setLogoPreview(null);
      setHasLogo(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      void fetchConfigs();
      void fetchLogo();
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image est trop volumineuse. Maximum 2 MB.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setLogoSaving(true);

      try {
        const res = await fetch('/api/logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': ADMIN_PASSWORD,
          },
          body: JSON.stringify({ logo: base64 }),
        });

        if (res.ok) {
          setHasLogo(true);
          setLogoSaved(true);
          setTimeout(() => setLogoSaved(false), 2000);
        } else {
          const data = await res.json();
          alert(data.error || 'Erreur lors de l\'upload');
          setLogoPreview(null);
        }
      } catch {
        alert('Erreur lors de l\'upload');
        setLogoPreview(null);
      } finally {
        setLogoSaving(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoDelete = async () => {
    setLogoSaving(true);
    try {
      const res = await fetch('/api/logo', {
        method: 'DELETE',
        headers: {
          'x-admin-password': ADMIN_PASSWORD,
        },
      });

      if (res.ok) {
        setLogoPreview(null);
        setHasLogo(false);
      }
    } catch {
      // silently fail
    } finally {
      setLogoSaving(false);
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
        {/* Logo Upload Section */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="text-gray-900 text-sm font-medium">Photo de profil</span>
            </div>
          </div>
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-[#D4AF37]/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center text-white font-bold text-lg ring-2 ring-[#D4AF37]/30">
                    II
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoSaving}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-95"
                >
                  {logoSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Enregistre</span>
                    </>
                  ) : logoSaving ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/></svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Importer une image</span>
                    </>
                  )}
                </button>
                {hasLogo && (
                  <button
                    onClick={handleLogoDelete}
                    disabled={logoSaving}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                )}
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  PNG, JPG ou WebP. Max 2 MB. Cette image remplacera le logo dans le header du chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Config sections */}
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
