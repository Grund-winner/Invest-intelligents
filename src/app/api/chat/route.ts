import { NextResponse } from 'next/server';
import { getAllConfigs } from '@/lib/store';
import { buildSystemPrompt } from '@/lib/prompt';

// AI Providers configuration (OpenAI-compatible API format)
// Uses free models from multiple providers for reliability
const PROVIDERS = [
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    model: 'google/gemma-3-27b-it:free',
  },
  {
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    apiKeyEnv: 'CEREBRAS_API_KEY',
    model: 'llama-3.3-70b',
  },
  {
    name: 'Together',
    baseUrl: 'https://api.together.xyz/v1',
    apiKeyEnv: 'TOGETHER_API_KEY',
    model: 'meta-llama/Llama-3-8b-chat-hf',
  },
];

async function callProvider(
  provider: typeof PROVIDERS[0],
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) throw new Error(`No API key for ${provider.name}`);

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(provider.name === 'OpenRouter'
        ? { 'HTTP-Referer': 'https://invest-intelligent.vercel.app', 'X-Title': 'Invest Intelligents' }
        : {}),
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider.name} API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.name} returned empty content`);
  return content;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const configMap = getAllConfigs();
    const systemPrompt = buildSystemPrompt(configMap);

    // Try each provider in order until one succeeds
    let lastError: Error | null = null;
    for (const provider of PROVIDERS) {
      try {
        const content = await callProvider(provider, messages, systemPrompt);
        return NextResponse.json({ content, provider: provider.name });
      } catch (error) {
        lastError = error as Error;
        console.error(`Provider ${provider.name} failed:`, (error as Error).message);
        // Try next provider
        continue;
      }
    }

    // All providers failed
    console.error('All AI providers failed:', lastError?.message);
    return NextResponse.json(
      { content: 'Tous nos services sont temporairement indisponibles. Reviens dans quelques minutes, on corrige ça vite !' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ content: 'Oops, une petite erreur. Tu peux réessayer ?' }, { status: 200 });
  }
}
