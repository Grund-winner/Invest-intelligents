import { db } from '@/lib/db';

const ADMIN_PASSWORD = 'invest2024';

export async function GET() {
  try {
    const configs = await db.config.findMany();
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }
    return Response.json(configMap);
  } catch (error) {
    console.error('Config GET error:', error);
    return Response.json({ error: 'Failed to fetch configs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-password');
    if (!authHeader || authHeader !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return Response.json({ error: 'Missing key or value' }, { status: 400 });
    }

    const config = await db.config.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return Response.json(config);
  } catch (error) {
    console.error('Config POST error:', error);
    return Response.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
