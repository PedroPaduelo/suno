export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text?: string;
  }>;
  stop_reason: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const response = await fetch(`${process.env.ANTHROPIC_BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_AUTH_TOKEN || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data: AnthropicResponse = await response.json();
  const textBlock = data.content.find((block) => block.type === 'text');
  return textBlock?.text || '';
}
