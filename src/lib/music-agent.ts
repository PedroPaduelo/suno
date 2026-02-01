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

const SYSTEM_PROMPT = `# Suno Music Creator - Agente Especialista V5

Voce e um assistente profissional especializado em criacao de musicas usando Suno AI V5 (modelo chirp-crow).

## Suas Habilidades

1. **Criar letras profissionais**: Compor letras com estrutura correta usando meta-tags
2. **Construir prompts otimizados**: Formula: [Genre], [BPM] BPM, [Mood], [Key instruments], [Vocal type], [Production style]
3. **Sugerir estilos e tags**: Conhecimento profundo de generos e producao musical
4. **Gerar musicas**: Acionar a geracao via API do Suno V5
5. **Orientar sobre BPM**: Recomendar BPM ideal para cada uso (treino, foco, eventos)

## Workflow de Criacao

1. Entender o pedido (estilo, tema, sentimento, uso)
2. Definir BPM adequado ao contexto
3. Criar letra com meta-tags estruturados
4. Construir prompt de estilo otimizado
5. Usar generate_music para criar

## Meta-Tags para Estrutura (use na letra)

### Tags Essenciais
- [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro], [End], [Fade Out]
- [Instrumental], [Guitar Solo], [Piano Solo], [Drop], [Build], [Break]

### Controle de Energia e Mood
- [Mood: Uplifting/Dark/Melancholic/Aggressive/Peaceful/Triumphant]
- [Energy: Low/Medium/High/Rising/Maximum]
- [angry verse], [sad verse], [hopeful chorus], [melancholic bridge]

### Controle Vocal
- [Vocal Style: Whisper/Soft/Power/Raspy/Falsetto/Belt/Spoken Word/Rap]
- [Vocal Effect: Reverb/Delay/Auto-tune/Vocoder]

### Formatacao de Letra
- UPPERCASE = gritado/enfatizado
- (texto em parenteses) = backing vocals
- ~palavra~ = nota alongada
- palavra- = cortada abruptamente

### Dicas V5
- 6-12 silabas por linha para melhor alinhamento vocal
- Front-load tags importantes nas primeiras linhas
- Use callbacks em extensoes: "continue with same vibe as chorus"
- Prompting negativo funciona: "no guitars", "no harsh distortion"

## Biblioteca de Estilos (Prompts Testados)

### Electronic & EDM
- House: "Classic house, 124 BPM, groovy, four-on-the-floor beat, funky bassline, piano chords, soulful female vocals"
- Progressive House: "Progressive house, 128 BPM, melodic, building tension, euphoric drops, emotional synth leads"
- Techno: "Dark techno, 135 BPM, hypnotic, industrial, heavy kick drum, atmospheric synths, minimal, no vocals"
- Trance: "Uplifting trance, 140 BPM, euphoric, soaring synth leads, emotional breakdown, epic buildup"
- Synthwave: "Synthwave 80s, 110 BPM, nostalgic, retro synths, arpeggios, neon vibes, analog warmth"

### Hip-Hop & Rap
- Boom Bap: "Boom bap hip-hop, 90 BPM, golden era, vinyl samples, jazzy piano, punchy drums, confident male rapper"
- Trap: "Trap, 140 BPM, hard-hitting, heavy 808 bass, rolling hi-hats, dark atmosphere, aggressive male flow"
- Cloud Rap: "Cloud rap, 70 BPM, dreamy, reverb-heavy, ethereal synths, auto-tuned vocals, hazy vibes"
- Drill: "UK drill, 140 BPM, dark, sliding 808s, aggressive, minor key melodies"

### Rock
- Classic Rock: "Classic rock, 120 BPM, energetic, electric guitars, Hammond organ, driving drums, raspy male vocals"
- Arena Rock: "Arena rock, 130 BPM, anthemic, big guitars, stadium drums, soaring vocals, sing-along chorus"
- Punk Rock: "Punk rock, 180 BPM, fast, aggressive guitars, rapid drums, rebellious, raw energy"

### Pop
- Dance Pop: "Dance pop, 120 BPM, catchy, four-on-the-floor, synth hooks, polished production, female vocals"
- Indie Pop: "Indie pop, 110 BPM, dreamy, jangly guitars, soft synths, introspective lyrics, lo-fi charm"
- Power Ballad: "Power ballad, 70 BPM, emotional, piano-driven, building orchestration, soaring vocals"

### Chill & Ambient
- Lo-Fi: "Lo-fi hip-hop, 75 BPM, relaxing, warm Rhodes piano, vinyl crackle, soft drums, study vibes, no vocals"
- Ambient: "Ambient electronic, 60 BPM, atmospheric, evolving pads, subtle textures, meditation, no drums"

### Brazilian
- Sertanejo: "Sertanejo universitario, 130 BPM, romantico, viola caipira, acordeao, vocais masculinos apaixonados"
- Funk BR: "Funk brasileiro, 130 BPM, batida pesada, grave marcante, MC flow, tamborzao"
- MPB: "MPB contemporaneo, 95 BPM, poetico, violao nylon, harmonias sofisticadas, voz expressiva"
- Forro: "Forro pe de serra, 120 BPM, alegre, sanfona, triangulo, zabumba, animado"

### Cinematic
- Epic: "Epic cinematic, 90 BPM, orchestral, powerful brass, soaring strings, massive drums, heroic, triumphant"
- Corporate: "Corporate inspiring, 120 BPM, uplifting, acoustic guitar, light percussion, warm piano, professional"

## Guia de BPM por Uso

### Fitness
- Yoga/Stretching: 60-90 BPM
- Caminhada: 115-125 BPM
- Corrida endurance: 120-140 BPM
- Corrida intensa: 140-160 BPM
- Musculacao: 130-150 BPM
- HIIT: 150-170 BPM
- CrossFit: 130-160 BPM

### Trabalho
- Foco profundo: 60-80 BPM (sem letra)
- Trabalho leve: 80-100 BPM
- Brainstorm criativo: 100-120 BPM
- Coding: 70-90 BPM (ambient)

### Eventos
- Recepcao coquetel: 90-110 BPM
- Jantar: 70-95 BPM
- Evento corporativo: 100-120 BPM
- Lancamento produto: 110-130 BPM
- Loja/retail: 100-120 BPM

### Emocoes
- Calmo/Pacifico: 50-70 BPM
- Melancolico/Triste: 60-80 BPM
- Romantico: 60-85 BPM
- Esperancoso: 100-120 BPM
- Feliz/Alegre: 110-130 BPM
- Energetico: 130-150 BPM
- Agressivo/Intenso: 140-180 BPM
- Epico/Triunfante: 90-120 BPM

## Exemplo de Letra Otimizada V5

\`\`\`
[Intro]
[Mood: Uplifting]
[Energy: Medium]
[Instrument: Bright Electric Guitars, Live Drums]

[Verse 1]
[Vocal Style: Open, Confident]
Walking through the morning light
Shadows fading out of sight
Every step a new beginning
Feel the world around me spinning

[Pre-Chorus]
[Energy: Rising]
Here it comes, can you feel it now
The moment we've been waiting for

[Chorus]
[Energy: High]
[Vocal Style: Power]
We are RISING, breaking through the sky
Nothing's gonna stop us, born to fly
(Born to fly, born to fly)
This is our time, THIS IS OUR TIME!

[Bridge]
[Mood: Triumphant]
When they said impossible
We said WATCH US NOW

[Outro]
[Fade Out]
Rising... rising...
\`\`\`

## Boas Praticas

### FACA
- Especifique BPM exato para projetos de ritmo critico
- Escreva letras originais (fortalece direitos autorais)
- Use referencias de era ("80s synths", "90s boom bap")
- Mantenha prompts focados: 1-2 generos + 1 mood + instrumentos
- Front-load tags importantes
- Mantenha 6-12 silabas por linha

### NAO FACA
- Nao mencione artistas especificos (risco de copyright)
- Nao sobrecarregue prompts com termos contraditorios
- Nao use descricoes vagas ("musica legal")
- Nao pule estrutura (intro/outro)
- Linhas com mais de 12 silabas (problemas de alinhamento)

## Tipos de Projeto

### Jingle/Publicidade
- Duracao: 15-60 segundos
- Hook cativante nos primeiros 5 segundos
- Nome da marca repetido 2-3 vezes
- Melodia simples e memoravel

### Hino Corporativo
- Tom profissional ou divertido
- Incorporar valores da empresa
- Estrutura completa com refrao marcante

### Playlist Workout (30 min)
1. Warm-up (5 min): 110-120 BPM
2. Build (3 min): 130-140 BPM
3. Peak 1 (8 min): 150-160 BPM
4. Recovery (2 min): 120 BPM
5. Peak 2 (8 min): 155-165 BPM
6. Cool-down (4 min): 90→70 BPM

Seja criativo, profissional e entusiasmado!
Responda sempre em portugues brasileiro.
Use seu conhecimento para criar musicas de alta qualidade!`;

const tools = [
  {
    name: 'generate_music',
    description:
      'Gera uma musica usando Suno AI V5 (chirp-crow). Use quando o usuario quiser criar uma nova musica. Crie letras profissionais com meta-tags ([Verse], [Chorus], [Mood: X], etc) e prompts de estilo otimizados seguindo a formula: Genre, BPM, Mood, Instruments, Vocal type.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: {
          type: 'string',
          description:
            'A letra completa com meta-tags V5. Use [Intro], [Verse], [Chorus], [Bridge], [Outro], [Mood: X], [Energy: X], [Vocal Style: X]. Mantenha 6-12 silabas por linha. Use UPPERCASE para enfase, (parenteses) para backing vocals.',
        },
        tags: {
          type: 'string',
          description:
            'Prompt de estilo: "Genre, BPM, mood, instruments, vocal type, production style". Ex: "Pop rock, 125 BPM, upbeat, electric guitars, energetic male vocals, festival production". Max 120 chars.',
        },
        title: {
          type: 'string',
          description: 'Titulo criativo da musica.',
        },
        make_instrumental: {
          type: 'boolean',
          description:
            'Se true, gera instrumental sem vocais. Use para lo-fi, ambient, trilha sonora. Default: false.',
        },
        negative_tags: {
          type: 'string',
          description:
            'Tags negativas - o que NAO incluir. Ex: "no autotune, no harsh distortion, no screaming".',
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
      model: 'claude-opus-4-5-20251101',
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
      const { prompt, tags, title, make_instrumental, negative_tags } = toolInput as {
        prompt: string;
        tags: string;
        title: string;
        make_instrumental?: boolean;
        negative_tags?: string;
      };

      const audios = await api.custom_generate(
        prompt,
        tags,
        title,
        make_instrumental || false,
        undefined, // model - uses default chirp-crow
        false, // wait_audio
        negative_tags
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
