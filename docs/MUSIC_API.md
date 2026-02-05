# Music API Documentation

Base URL: `/api/music`

## Endpoints

---

### GET /api/music

Retorna lista de músicas ou uma música específica.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | No | ID específico da música |
| `refresh` | boolean | No | Se `true`, atualiza status de músicas pendentes do Suno |
| `source` | string | No | Filtro: `suno`, `youtube`, `liked`, ou `all` (padrão) |

#### Examples

```bash
# Listar todas as músicas
GET /api/music

# Listar apenas músicas do YouTube
GET /api/music?source=youtube

# Listar músicas curtidas
GET /api/music?source=liked

# Buscar música específica
GET /api/music?id=clxxx123

# Atualizar status de músicas pendentes
GET /api/music?refresh=true
```

#### Response

```json
[
  {
    "id": "clxxx123",
    "sunoId": "abc-123",
    "title": "My Song",
    "lyrics": "Lyrics here...",
    "tags": "rock, indie",
    "audioUrl": "https://cdn.suno.ai/xxx.mp3",
    "videoUrl": "https://cdn.suno.ai/xxx.mp4",
    "imageUrl": "https://cdn.suno.ai/xxx.jpg",
    "status": "complete",
    "model": "chirp-v3",
    "source": "suno",
    "youtubeId": null,
    "isLiked": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### POST /api/music

Cria uma nova música. Suporta 3 modos:

1. **Cadastro Direto** - Música com URL de áudio própria
2. **YouTube** - Música do YouTube via URL
3. **Suno AI** - Gera música via Suno AI

#### 1. Cadastro Direto

Para cadastrar qualquer música com URL de áudio.

```bash
POST /api/music
Content-Type: application/json

{
  "title": "Nome da Música",
  "audioUrl": "https://exemplo.com/audio.mp3",
  "imageUrl": "https://exemplo.com/cover.jpg",
  "videoUrl": "https://exemplo.com/video.mp4",
  "tags": "rock, indie, 2024",
  "lyrics": "Letra da música aqui...",
  "source": "custom"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Título da música |
| `audioUrl` | string | No* | URL do arquivo de áudio |
| `imageUrl` | string | No | URL da capa/thumbnail |
| `videoUrl` | string | No | URL do vídeo |
| `tags` | string | No | Tags separadas por vírgula |
| `lyrics` | string | No | Letra da música |
| `source` | string | No | Fonte: `custom`, `suno`, `youtube` (padrão: `suno`) |

*`audioUrl` é obrigatório se `source` não for `youtube`

#### 2. YouTube

Para adicionar música do YouTube.

```bash
POST /api/music
Content-Type: application/json

{
  "title": "Nome da Música",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "tags": "pop, 80s"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Título da música |
| `youtubeUrl` | string | **Yes** | URL do YouTube (watch, youtu.be, shorts) |
| `tags` | string | No | Tags separadas por vírgula |

#### 3. Suno AI (Geração)

Para gerar música via Suno AI.

```bash
POST /api/music
Content-Type: application/json

{
  "title": "Epic Battle Theme",
  "prompt": "An epic orchestral battle theme with drums and brass",
  "tags": "orchestral, epic, cinematic",
  "make_instrumental": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Yes** | Título da música |
| `prompt` | string | **Yes** | Descrição/letra para gerar |
| `tags` | string | **Yes** | Gênero e estilo |
| `make_instrumental` | boolean | No | Se `true`, gera sem vocal (padrão: `false`) |

#### Response (todos os modos)

```json
{
  "created": {
    "id": "clxxx123",
    "title": "Nome da Música",
    "audioUrl": "https://...",
    "status": "complete",
    "source": "custom",
    ...
  },
  "songs": [
    // Lista completa de todas as músicas (atualizada)
  ]
}
```

---

### PATCH /api/music

Atualiza uma música existente.

```bash
PATCH /api/music?id=clxxx123
Content-Type: application/json

{
  "title": "Novo Título",
  "tags": "novas, tags",
  "isLiked": true
}
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | ID da música |

#### Body Parameters

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Novo título |
| `tags` | string | Novas tags |
| `isLiked` | boolean | Marcar/desmarcar como curtida |

#### Response

```json
{
  "id": "clxxx123",
  "title": "Novo Título",
  "isLiked": true,
  ...
}
```

---

### DELETE /api/music

Remove uma música.

```bash
DELETE /api/music?id=clxxx123
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | ID da música |

#### Response

```json
{
  "success": true
}
```

---

## Music Object Schema

```typescript
interface Music {
  id: string;           // ID único (cuid)
  sunoId?: string;      // ID do Suno (se gerada pelo Suno)
  title: string;        // Título da música
  lyrics?: string;      // Letra
  tags?: string;        // Tags separadas por vírgula
  audioUrl?: string;    // URL do áudio MP3
  videoUrl?: string;    // URL do vídeo MP4
  imageUrl?: string;    // URL da capa/thumbnail
  status: string;       // 'pending' | 'streaming' | 'complete' | 'error'
  model?: string;       // Modelo do Suno usado
  source: string;       // 'suno' | 'youtube' | 'custom'
  youtubeId?: string;   // ID do vídeo YouTube
  isLiked: boolean;     // Se está marcada como favorita
  createdAt: string;    // Data de criação (ISO 8601)
  updatedAt: string;    // Data de atualização (ISO 8601)
}
```

---

## Error Responses

```json
{
  "error": "Error message here"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Parâmetros inválidos ou faltando |
| 404 | Not Found - Música não encontrada |
| 500 | Internal Server Error - Erro no servidor |

---

## Examples for AI Agents

### Cadastrar música nova

```python
import requests

response = requests.post('http://localhost:3000/api/music', json={
    'title': 'Minha Música',
    'audioUrl': 'https://exemplo.com/audio.mp3',
    'imageUrl': 'https://exemplo.com/cover.jpg',
    'tags': 'eletronica, dance',
    'source': 'custom'
})

data = response.json()
new_song = data['created']
all_songs = data['songs']
```

### Listar músicas curtidas

```python
response = requests.get('http://localhost:3000/api/music?source=liked')
liked_songs = response.json()
```

### Curtir uma música

```python
response = requests.patch(
    'http://localhost:3000/api/music?id=clxxx123',
    json={'isLiked': True}
)
```

### Adicionar do YouTube

```python
response = requests.post('http://localhost:3000/api/music', json={
    'title': 'Rick Astley - Never Gonna Give You Up',
    'youtubeUrl': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'tags': 'pop, 80s, classic'
})
```
