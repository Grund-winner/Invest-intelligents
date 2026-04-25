import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/prompt';

const PROVIDERS = [
  { name: 'GLM-4.5 Air', baseUrl: 'https://openrouter.ai/api/v1', model: 'z-ai/glm-4.5-air:free' },
  { name: 'GPT-OSS 120B', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-oss-120b:free' },
  { name: 'Nemotron 120B', baseUrl: 'https://openrouter.ai/api/v1', model: 'nvidia/nemotron-3-super-120b-a12b:free' },
];

async function callProvider(
  provider: typeof PROVIDERS[0],
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://invest-intelligents.vercel.app',
      'X-Title': 'Invest Intelligents',
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider.name} error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.name} returned empty`);
  return content;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, config } = body as {
      messages: Array<{ role: string; content: string }>;
      config?: Record<string, string>;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Use config from client (always fresh from admin) or fallback to defaults
    const configMap = config && Object.keys(config).length > 0 ? config : {};
    const systemPrompt = buildSystemPrompt(configMap);

    for (const provider of PROVIDERS) {
      try {
        const content = await callProvider(provider, messages, systemPrompt);
        return NextResponse.json({ content, provider: provider.name });
      } catch (error) {
        console.error(`${provider.name} failed:`, (error as Error).message);
        continue;
      }
    }

    return NextResponse.json(
      { content: 'Service temporairement indisponible. Reviens dans quelques minutes.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ content: 'Petite erreur technique. Reessaye ?' }, { status: 200 });
  }
}
