import { NextResponse } from 'next/server';
import { getAllConfigs } from '@/lib/store';
import { buildSystemPrompt } from '@/lib/prompt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const configMap = getAllConfigs();
    const systemPrompt = buildSystemPrompt(configMap);

    // Use z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices?.[0]?.message?.content || 'Désolé, une erreur est survenue.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ content: 'Oops, une petite erreur. Tu peux réessayer ?' }, { status: 200 });
  }
}
