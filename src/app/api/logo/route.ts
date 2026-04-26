import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'invest2024';

// In-memory logo storage (base64 string)
let logoBase64: string | null = null;

export async function GET() {
  try {
    if (logoBase64) {
      return NextResponse.json({ logo: logoBase64, hasLogo: true });
    }
    return NextResponse.json({ logo: null, hasLogo: false });
  } catch (error) {
    console.error('Logo GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-password');
    if (!authHeader || authHeader !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { logo } = body;

    if (!logo || typeof logo !== 'string') {
      return NextResponse.json({ error: 'Logo data required' }, { status: 400 });
    }

    // Validate it looks like a base64 image
    if (!logo.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Limit size: base64 string should be under 2MB (~2.7M chars)
    if (logo.length > 2_700_000) {
      return NextResponse.json({ error: 'Image trop volumineuse (max 2 MB)' }, { status: 400 });
    }

    logoBase64 = logo;

    return NextResponse.json({ success: true, hasLogo: true });
  } catch (error) {
    console.error('Logo POST error:', error);
    return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-password');
    if (!authHeader || authHeader !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logoBase64 = null;

    return NextResponse.json({ success: true, hasLogo: false });
  } catch (error) {
    console.error('Logo DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 });
  }
}
