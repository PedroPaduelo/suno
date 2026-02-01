import { sunoApi, AudioInfo } from './SunoApi';
import prisma from './prisma';

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolUse {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface TextBlock {
  type: 'text';
  text: string;
}

interface AnthropicResponse {
  content: Array<ToolUse | TextBlock>;
  stop_reason: string;
}

const SYSTEM_PROMPT = `Voce e um assistente especialista em criacao de musicas usando a plataforma Suno AI.
Suas habilidades incluem:

1. **Criar letras criativas**: Voce pode compor letras originais e emocionantes para qualquer genero musical.
2. **Sugerir estilos e tags**: Voce conhece diversos estilos musicais e pode sugerir tags apropriadas para a geracao.
3. **Gerar musicas**: Voce pode acionar a geracao de musicas atraves da API do Suno.
4. **Explicar o processo**: Voce pode explicar como a geracao de musica funciona e dar dicas.

Quando o usuario pedir para criar uma musica, voce deve:
1. Primeiro, entender o que ele quer (estilo, tema, sentimento)
2. Criar uma letra criativa ou usar a descricao dele
3. Sugerir tags/estilos adequados
4. Usar a ferramenta generate_music para criar a musica

Tags populares incluem: pop, rock, electronic, jazz, classical, hip-hop, r&b, country, folk, metal, punk, reggae, blues, soul, funk, disco, house, techno, ambient, lo-fi, acoustic, indie, alternative, latin, brazilian, samba, bossa nova, forro, sertanejo, mpb.

Seja criativo, amigavel e entusiasmado com a criacao musical!
Responda sempre em portugues brasileiro.`;

const tools = [
  {
    name: 'generate_music',
    description:
      'Gera uma musica usando a API do Suno. Use esta ferramenta quando o usuario quiser criar uma nova musica. Voce mesmo deve criar a letra criativa baseada no pedido do usuario.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: {
          type: 'string',
          description:
            'A letra completa da musica que voce criou. Seja criativo e escreva versos, refrao, etc.',
        },
        tags: {
          type: 'string',
          description:
            'Tags/estilos da musica separados por virgula (ex: "pop, energetic, upbeat"). Maximo 120 caracteres.',
        },
        title: {
          type: 'string',
          description: 'Titulo da musica.',
        },
        make_instrumental: {
          type: 'boolean',
          description:
            'Se true, gera uma musica instrumental sem vocais. Default: false.',
        },
      },
      required: ['prompt', 'tags', 'title'],
    },
  },
];

async function callClaude(messages: Array<{ role: string; content: unknown }>): Promise<AnthropicResponse> {
  const baseUrl = 'https://api.z.ai/api/anthropic';
  const apiKey = 'a1b0ec2671f246ad8cccc3440e2cbf89.axlWCIyrWxp5fIPW';

  console.log('Calling Claude API:', baseUrl);

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', response.status, error);
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  try {
    const api = await sunoApi();

    if (toolName === 'generate_music') {
      const { prompt, tags, title, make_instrumental } = toolInput as {
        prompt: string;
        tags: string;
        title: string;
        make_instrumental?: boolean;
      };

      const audios = await api.custom_generate(
        prompt,
        tags,
        title,
        make_instrumental || false,
        undefined,
        false
      );

      // Save to database
      for (const audio of audios) {
        await prisma.music.create({
          data: {
            sunoId: audio.id,
            title: audio.title || title,
            lyrics: audio.lyric || prompt,
            tags: audio.tags || tags,
            audioUrl: audio.audio_url,
            videoUrl: audio.video_url,
            imageUrl: audio.image_url,
            status: audio.status,
            model: audio.model_name,
          },
        });
      }

      return JSON.stringify({
        success: true,
        message: `Musica "${title}" iniciada com sucesso! ${audios.length} versao(oes) sendo gerada(s).`,
        songs: audios.map((a) => ({
          id: a.id,
          title: a.title,
          status: a.status,
        })),
      });
    }

    return JSON.stringify({ error: 'Ferramenta desconhecida' });
  } catch (error) {
    console.error('Tool error:', error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

export async function processAgentMessage(
  userMessage: string,
  chatHistory: AgentMessage[]
): Promise<{ response: string; musicGenerated?: AudioInfo[] }> {
  const messages: Array<{ role: string; content: unknown }> = chatHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  messages.push({
    role: 'user',
    content: userMessage,
  });

  let response = await callClaude(messages);

  let finalResponse = '';
  let musicGenerated: AudioInfo[] | undefined;

  // Handle tool use loop
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (block): block is ToolUse => block.type === 'tool_use'
    );
    const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

    for (const toolUse of toolUseBlocks) {
      const result = await handleToolCall(toolUse.name, toolUse.input);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result,
      });

      // If music was generated, parse it
      if (toolUse.name === 'generate_music') {
        try {
          const parsed = JSON.parse(result);
          if (parsed.success && parsed.songs) {
            musicGenerated = parsed.songs;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Continue the conversation with tool results
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    messages.push({
      role: 'user',
      content: toolResults,
    });

    response = await callClaude(messages);
  }

  // Extract final text response
  for (const block of response.content) {
    if (block.type === 'text') {
      finalResponse += block.text;
    }
  }

  return { response: finalResponse, musicGenerated };
}
