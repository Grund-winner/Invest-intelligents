const DEFAULT_CONFIGS: Record<string, string> = {
  app_name: process.env.NEXT_PUBLIC_APP_NAME || 'Invest Intelligents',
  admin_wa: process.env.NEXT_PUBLIC_ADMIN_WA || '2250596855162',
  admin_tg: process.env.NEXT_PUBLIC_ADMIN_TG || 'mister_bob225',
  vip_whatsapp_channel: process.env.NEXT_PUBLIC_VIP_WHATSAPP_CHANNEL || 'https://whatsapp.com/channel/0029VaB0b4KuJQMR1aAt7J1g',
  telegram_channel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/invest_intelligents',
  price_1: process.env.NEXT_PUBLIC_PRICE_1 || '20.000 FCFA',
  price_3: process.env.NEXT_PUBLIC_PRICE_3 || '50.000 FCFA',
  price_lifetime: process.env.NEXT_PUBLIC_PRICE_LIFETIME || '150.000 FCFA',
  payment_link_1: process.env.NEXT_PUBLIC_PAYMENT_LINK_1 || 'https://bob-academie.mymaketou.store/fr/products/abonnement-1-mois-vip',
  payment_link_3: process.env.NEXT_PUBLIC_PAYMENT_LINK_3 || 'https://bob-academie.mymaketou.store/fr/products/abonnement-3-mois-vip',
  payment_link_lifetime: process.env.NEXT_PUBLIC_PAYMENT_LINK_LIFETIME || 'https://bob-academie.mymaketou.store/fr/products/abonnement-a-vie-vip',
  formation_date: process.env.NEXT_PUBLIC_FORMATION_DATE || 'Prochainement',
  desc_online: process.env.NEXT_PUBLIC_DESC_ONLINE || 'Formation en ligne : via Zoom/Telegram.',
  desc_offline: process.env.NEXT_PUBLIC_DESC_OFFLINE || 'Formation en presentiel : suivi intensif.',
  promotions: process.env.NEXT_PUBLIC_PROMOTIONS || 'Aucune promotion en cours.',
  horaires: process.env.NEXT_PUBLIC_HORAIRES || 'Lun-Ven: 8h-20h (GMT)',
  extra_info: process.env.NEXT_PUBLIC_EXTRA_INFO || 'Bienvenue chez Invest Intelligents !',
};

let configStore: Record<string, string> | null = null;

function getStore(): Record<string, string> {
  if (!configStore) configStore = { ...DEFAULT_CONFIGS };
  return configStore;
}

export function getAllConfigs(): Record<string, string> { return { ...getStore() }; }
export function getConfig(key: string): string { return getStore()[key] || ''; }
export function setConfig(key: string, value: string): void { getStore()[key] = value; }
