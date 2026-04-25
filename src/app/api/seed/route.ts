import { db } from '@/lib/db';

const defaults: Record<string, string> = {
  admin_wa: '2250596855162',
  admin_tg: 'mister_bob225',
  vip_link: 'https://chat.whatsapp.com/HquB5cMrNZ00wYazC98xpg',
  price_1: '20.000 FCFA',
  price_3: '50.000 FCFA',
  price_lifetime: '150.000 FCFA',
  addr_trx: 'NON_CONFIG',
  addr_trc20: 'NON_CONFIG',
  addr_bep20: '0x0f53Fa27782554e11Ab68C2D9fe8F02Cb079e24C',
  payment_link_1: 'https://bob-academie.mymaketou.store/fr/products/abonnement-1-mois-vip',
  payment_link_3: 'https://bob-academie.mymaketou.store/fr/products/abonnement-3-mois-vip',
  payment_link_lifetime: 'https://bob-academie.mymaketou.store/fr/products/abonnement-a-vie-vip',
  formation_date: 'Prochainement',
  desc_online: 'Formation en ligne : via Zoom/Telegram.',
  desc_offline: 'Formation en présentiel : suivi intensif.',
  promotions: 'Aucune promotion en cours pour le moment.',
  horaires: 'Lun-Ven: 8h-20h (GMT)',
  telegram_channel: 'https://t.me/invest_intelligents',
  extra_info: 'Bienvenue chez Invest Intelligents !',
};

export async function POST() {
  try {
    const entries = Object.entries(defaults);

    for (const [key, value] of entries) {
      await db.config.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return Response.json({ success: true, message: 'Configs seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ success: false, error: 'Failed to seed configs' }, { status: 500 });
  }
}
