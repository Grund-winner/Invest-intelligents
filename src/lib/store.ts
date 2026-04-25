// Simple in-memory config store for Vercel (serverless-compatible)
// Configs persist in memory during the serverless function's warm lifetime
// Defaults are loaded from environment variables or hardcoded values

const DEFAULT_CONFIGS: Record<string, string> = {
  admin_wa: process.env.NEXT_PUBLIC_ADMIN_WA || '2250596855162',
  admin_tg: process.env.NEXT_PUBLIC_ADMIN_TG || 'mister_bob225',
  vip_link: process.env.NEXT_PUBLIC_VIP_LINK || 'https://chat.whatsapp.com/HquB5cMrNZ00wYazC98xpg',
  telegram_channel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/invest_intelligents',
  price_1: process.env.NEXT_PUBLIC_PRICE_1 || '20.000 FCFA',
  price_3: process.env.NEXT_PUBLIC_PRICE_3 || '50.000 FCFA',
  price_lifetime: process.env.NEXT_PUBLIC_PRICE_LIFETIME || '150.000 FCFA',
  addr_trx: process.env.NEXT_PUBLIC_ADDR_TRX || 'NON_CONFIG',
  addr_trc20: process.env.NEXT_PUBLIC_ADDR_TRC20 || 'NON_CONFIG',
  addr_bep20: process.env.NEXT_PUBLIC_ADDR_BEP20 || '0x0f53Fa27782554e11Ab68C2D9fe8F02Cb079e24C',
  payment_link_1: process.env.NEXT_PUBLIC_PAYMENT_LINK_1 || 'https://bob-academie.mymaketou.store/fr/products/abonnement-1-mois-vip',
  payment_link_3: process.env.NEXT_PUBLIC_PAYMENT_LINK_3 || 'https://bob-academie.mymaketou.store/fr/products/abonnement-3-mois-vip',
  payment_link_lifetime: process.env.NEXT_PUBLIC_PAYMENT_LINK_LIFETIME || 'https://bob-academie.mymaketou.store/fr/products/abonnement-a-vie-vip',
  formation_date: process.env.NEXT_PUBLIC_FORMATION_DATE || 'Prochainement',
  desc_online: process.env.NEXT_PUBLIC_DESC_ONLINE || 'Formation en ligne : via Zoom/Telegram.',
  desc_offline: process.env.NEXT_PUBLIC_DESC_OFFLINE || 'Formation en présentiel : suivi intensif.',
  promotions: process.env.NEXT_PUBLIC_PROMOTIONS || 'Aucune promotion en cours pour le moment.',
  horaires: process.env.NEXT_PUBLIC_HORAIRES || 'Lun-Ven: 8h-20h (GMT)',
  extra_info: process.env.NEXT_PUBLIC_EXTRA_INFO || 'Bienvenue chez Invest Intelligents !',
};

// In-memory store initialized with defaults
// On Vercel, this persists across requests within the same serverless instance
let configStore: Record<string, string> | null = null;

function getStore(): Record<string, string> {
  if (!configStore) {
    configStore = { ...DEFAULT_CONFIGS };
  }
  return configStore;
}

export function getAllConfigs(): Record<string, string> {
  return { ...getStore() };
}

export function getConfig(key: string): string {
  return getStore()[key] || '';
}

export function setConfig(key: string, value: string): void {
  const store = getStore();
  store[key] = value;
}
