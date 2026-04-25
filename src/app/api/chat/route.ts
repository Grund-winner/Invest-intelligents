import { NextResponse } from 'next/server';
import { getAllConfigs } from '@/lib/store';
import { buildSystemPrompt } from '@/lib/prompt';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const configMap = getAllConfigs();
    const systemPrompt = buildSystemPrompt(configMap);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { content: 'Le service IA est en cours de configuration. Reviens dans quelques minutes.' },
        { status: 200 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
