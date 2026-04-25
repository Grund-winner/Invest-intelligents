'use client';

import { useState } from 'react';
import { ChevronDown, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfigSectionProps {
  title: string;
  icon: React.ReactNode;
  fields: Array<{ key: string; label: string }>;
  values: Record<string, string>;
  onSave: (key: string, value: string) => Promise<void>;
}

export default function ConfigSection({ title, icon, fields, values, onSave }: ConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleSave = async (key: string) => {
    const value = localValues[key] ?? values[key] ?? '';
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await onSave(key, value);
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer active:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <span className="text-gray-900 text-sm font-medium">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-medium">{field.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={values[field.key] || ''}
                      onChange={(e) =>
                        setLocalValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.label}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 transition-all duration-200"
                    />
                    <button
                      onClick={() => handleSave(field.key)}
                      disabled={saving[field.key]}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] disabled:opacity-40 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed active:scale-95"
                    >
                      {saved[field.key] ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
