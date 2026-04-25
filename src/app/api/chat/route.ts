import { NextResponse } from 'next/server';
import { getAllConfigs } from '@/lib/store';
import { buildSystemPrompt } from '@/lib/prompt';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const configMap = getAllConfigs();
    const systemPrompt = buildSystemPrompt(configMap);

    // Use Google Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { content: 'Le service IA est en cours de configuration. Reviens dans quelques minutes.' },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Convert messages to Gemini format
    const geminiHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: `Instructions système (ne réponds pas à ceci, suis juste ces instructions): ${systemPrompt}` }] },
        { role: 'model', parts: [{ text: 'Compris, je suis un conseiller Invest Intelligents. Je vais suivre toutes ces instructions.' }] },
        ...geminiHistory,
      ],
    });

    const result = await chat.sendMessage(lastMessage.content);
    const content = result.response.text() || 'Désolé, une erreur est survenue.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ content: 'Oops, une petite erreur. Tu peux réessayer ?' }, { status: 200 });
  }
}
