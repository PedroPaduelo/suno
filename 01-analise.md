# 01-analise.md - Análise do Projeto Suno

## Triagem

| Atributo | Valor |
|----------|-------|
| **Tipo** | Feature / Sistema completo |
| **Prioridade** | P1 (Alta) |
| **Complexidade** | XL (Grande) |

---

## Status Atual

### Build: ✅ OK
- Build Next.js compilou com sucesso
- Apenas 1 warning de ESLint (useEffect com dependência faltando em SyncParty.tsx)

### Servidor: ✅ Rodando
- Porta: 3001
- Frontend carregando corretamente

### API: ❌ Erros identificados

---

## Erros Identificados

### 1. Variáveis de Ambiente Faltantes (CRÍTICO)

| Variável | Status | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | ❌ Faltando | URL de conexão PostgreSQL |
| `SUNO_COOKIE` | ❌ Faltando | Cookies de autenticação do Suno.ai |
| `ANTHROPIC_AUTH_TOKEN` | ❌ Faltando | Token API Anthropic (para chat) |
| `TWOCAPTCHA_KEY` | ⚠️ Opcional | Chave 2captcha para resolver CAPTCHAs |
| `ANTHROPIC_BASE_URL` | ⚠️ Opcional | URL base Anthropic (tem padrão) |

### 2. Warning de ESLint (BAIXA)

**Arquivo**: `src/app/components/SyncParty.tsx:127`

```tsx
// Warning: React Hook useEffect has a missing dependency: 'currentTime'
// Solução: Incluir no array de dependências ou usar useCallback
```

---

## Requisitos Funcionais

### RF-01: Geração de Música
- Gerar músicas a partir de prompts de texto usando a API do Suno.ai
- Suporte a geração básica e customizada (com estilos, instrumentos, etc.)

### RF-02: Extensão e Manipulação de Áudio
- Estender músicas existentes (extend_audio)
- Concatenar múltiplas faixas (concat)
- Recortar porções de áudio (clip)
- Gerar stems (faixas separadas por instrumento)

### RF-03: Letras
- Gerar letras automaticamente (generate_lyrics)
- Obter letras alinhadas com o áudio (get_aligned_lyrics)

### RF-04: Gerenciamento de Músicas
- Armazenar e listar músicas geradas
- Filtrar por source (suno, youtube, liked)
- Buscar música por ID
- Atualizar status de músicas pendentes

### RF-05: Playlists
- Criar, editar e excluir playlists
- Adicionar/remover músicas de playlists
- Listar playlists existentes

### RF-06: Chat com IA
- Interface de chat para interação com modelo de IA
- Integração com Anthropic Claude para geração de prompts
- Histórico de conversas persistido em banco

### RF-07: Sync Party
- Criar sessões de reprodução sincronizada
- Compartilhar código de sala para outros usuários
- Sincronizar play/pause e tempo de reprodução

### RF-08: Player Multimídia
- Reproduzir músicas do Suno
- Reproduzir vídeos do YouTube
- Visualizador de áudio (Canvas)
- Mixer de áudio

### RF-09: Personas
- Listar personas disponíveis no Suno
- Obter detalhes de personas específicas

### RF-10: Limites
- Verificar limites de uso da API (get_limit)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │  Page    │ │Components│ │ Context  │ │   Hooks      │    │
│  │ (page.tsx)│ │  (30+)   │ │PlayerCtx │ │ useSyncSession│    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js Routes)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │/api/generate│ │/api/chat│ │/api/music│ │/api/playlists│    │
│  │/api/custom│ │/api/sync │ │/api/persona│ │/v1/chat/completions│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  SunoApi (lib/SunoApi.ts)            │   │
│  │  - Browser automation (Playwright/Chromium)          │   │
│  │  - Cookie management                                  │   │
│  │  - CAPTCHA solving                                    │   │
│  │  - API calls to studio-api.prod.suno.com             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ music-agent  │ │   claude.ts  │ │     utils.ts       │  │
│  └──────────────┘ └──────────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Prisma)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                      │   │
│  │  - Chat / Message (conversas)                         │   │
│  │  - Music (músicas geradas/YouTube)                   │   │
│  │  - Playlist / PlaylistMusic (playlists)              │   │
│  │  - SyncSession (reprodução sincronizada)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Camada | Tecnologia |
|--------|-------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL, Prisma ORM |
| Browser Automation | Playwright, Chromium, Ghost Cursor |
| AI Integration | Anthropic Claude SDK |
| HTTP Client | Axios |
| Logging | Pino |
| CAPTCHA | 2captcha |

---

## Tarefas para Tasker

### Tarefa 1: Configurar Banco de Dados
- [ ] Fornecer `DATABASE_URL` (string de conexão PostgreSQL)
- [ ] Executar `npx prisma db push` para criar as tabelas

### Tarefa 2: Configurar Autenticação Suno
- [ ] Fornecer `SUNO_COOKIE` (cookies de sessão do Suno.ai)
- [ ] Alternativamente, implementar sistema de autenticação manual

### Tarefa 3: Configurar API Anthropic (para Chat)
- [ ] Fornecer `ANTHROPIC_AUTH_TOKEN` (API key Anthropic)

### Tarefa 4: Fix Warning ESLint
- [ ] Arquivo: `src/app/components/SyncParty.tsx:127`
- [ ] Incluir `currentTime` no array de dependências do useEffect

---

## Contexto de Execução

- **Porta Padrão**: 3001 (dev)
- **Framework**: Next.js 14.1.4
- **Build**: ✅ Sucesso
- **Servidor**: ✅ Rodando em porta 3001
- **Database**: PostgreSQL (precisa DATABASE_URL)
- **Cookies**: Necessários para autenticação no Suno (`SUNO_COOKIE`)
- **CAPTCHA**: Chave da 2captcha (`TWOCAPTCHA_KEY`)
