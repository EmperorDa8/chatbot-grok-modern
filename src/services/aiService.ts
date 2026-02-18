export type Provider = 'grok' | 'openrouter';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  error?: string;
}

const GROK_BASE_URL = 'https://api.x.ai/v1';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export async function sendMessage(
  provider: Provider,
  apiKey: string,
  messages: Message[],
  model: string
): Promise<ChatResponse> {
  const baseUrl = provider === 'grok' ? GROK_BASE_URL : OPENROUTER_BASE_URL;
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'openrouter' && {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Modern Grok Chat'
        })
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch response');
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
    };
  } catch (error: any) {
    return {
      content: '',
      error: error.message || 'An unknown error occurred',
    };
  }
}
