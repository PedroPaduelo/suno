import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sunoApi } from '@/lib/SunoApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const refresh = searchParams.get('refresh') === 'true';
    const source = searchParams.get('source'); // 'suno' | 'youtube' | 'all' | 'liked'

    if (id) {
      // Get specific music
      const music = await prisma.music.findUnique({
        where: { id },
      });

      if (!music) {
        return NextResponse.json({ error: 'Music not found' }, { status: 404 });
      }

      // Optionally refresh status from Suno (only for Suno music)
      if (refresh && music.status !== 'complete' && music.source === 'suno' && music.sunoId) {
        try {
          const api = await sunoApi();
          const audios = await api.get([music.sunoId]);
          if (audios.length > 0) {
            const audio = audios[0];
            const updated = await prisma.music.update({
              where: { id },
              data: {
                audioUrl: audio.audio_url,
                videoUrl: audio.video_url,
                imageUrl: audio.image_url,
                status: audio.status,
              },
            });
            return NextResponse.json(updated);
          }
        } catch (error) {
          console.error('Failed to refresh music status:', error);
        }
      }

      return NextResponse.json(music);
    }

    // Build where clause based on source filter
    const whereClause: { source?: string; isLiked?: boolean } = {};
    if (source === 'suno') {
      whereClause.source = 'suno';
    } else if (source === 'youtube') {
      whereClause.source = 'youtube';
    } else if (source === 'liked') {
      whereClause.isLiked = true;
    }
    // 'all' or undefined = no filter

    // Get all music with optional filter
    const music = await prisma.music.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    // Auto-fix YouTube thumbnails that are missing
    const youtubeWithoutThumbnails = music.filter(
      (m) => m.source === 'youtube' && m.youtubeId && !m.imageUrl
    );
    if (youtubeWithoutThumbnails.length > 0) {
      for (const m of youtubeWithoutThumbnails) {
        await prisma.music.update({
          where: { id: m.id },
          data: {
            imageUrl: `https://img.youtube.com/vi/${m.youtubeId}/hqdefault.jpg`,
          },
        });
      }
      // Re-fetch to get updated data
      const updatedMusic = await prisma.music.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(updatedMusic);
    }

    // Refresh pending music statuses (only for Suno music)
    if (refresh) {
      const pendingMusic = music.filter(
        (m) => m.status !== 'complete' && m.status !== 'error' && m.source === 'suno' && m.sunoId
      );
      if (pendingMusic.length > 0) {
        try {
          const api = await sunoApi();
          const sunoIds = pendingMusic.map((m) => m.sunoId!);
          const audios = await api.get(sunoIds);

          for (const audio of audios) {
            await prisma.music.updateMany({
              where: { sunoId: audio.id },
              data: {
                audioUrl: audio.audio_url,
                videoUrl: audio.video_url,
                imageUrl: audio.image_url,
                status: audio.status,
              },
            });
          }

          // Return refreshed data
          const refreshedMusic = await prisma.music.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
          });
          return NextResponse.json(refreshedMusic);
        } catch (error) {
          console.error('Failed to refresh music statuses:', error);
        }
      }
    }

    return NextResponse.json(music);
  } catch (error) {
    console.error('Get music error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      tags,
      title,
      make_instrumental,
      youtubeUrl,
      // Direct music registration fields
      audioUrl,
      videoUrl,
      imageUrl,
      lyrics,
      source,
    } = body;

    // Handle direct music registration (no Suno/YouTube required)
    if (audioUrl || (source && source !== 'suno')) {
      if (!title) {
        return NextResponse.json(
          { error: 'title is required' },
          { status: 400 }
        );
      }

      const music = await prisma.music.create({
        data: {
          title,
          tags: tags || null,
          lyrics: lyrics || null,
          audioUrl: audioUrl || null,
          videoUrl: videoUrl || null,
          imageUrl: imageUrl || null,
          source: source || 'suno',
          status: 'complete',
        },
      });

      // Return all songs so frontend can update
      const allMusic = await prisma.music.findMany({
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ created: music, songs: allMusic });
    }

    // Handle YouTube music creation
    if (youtubeUrl) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL' },
          { status: 400 }
        );
      }

      if (!title) {
        return NextResponse.json(
          { error: 'title is required for YouTube music' },
          { status: 400 }
        );
      }

      // Check if this YouTube video already exists
      const existing = await prisma.music.findFirst({
        where: { youtubeId },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'This YouTube video is already in your library' },
          { status: 400 }
        );
      }

      const music = await prisma.music.create({
        data: {
          title,
          tags: tags || null,
          source: 'youtube',
          youtubeId,
          imageUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
          status: 'complete',
        },
      });

      // Return all songs so frontend can update
      const allMusic = await prisma.music.findMany({
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ created: music, songs: allMusic });
    }

    // Handle Suno music creation (existing logic)
    if (!prompt || !tags || !title) {
      return NextResponse.json(
        { error: 'prompt, tags, and title are required' },
        { status: 400 }
      );
    }

    const api = await sunoApi();
    const audios = await api.custom_generate(
      prompt,
      tags,
      title,
      make_instrumental || false,
      undefined,
      false
    );

    // Save to database
    const savedMusic = [];
    for (const audio of audios) {
      const music = await prisma.music.create({
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
          source: 'suno',
        },
      });
      savedMusic.push(music);
    }

    // Return all songs so frontend can update
    const allMusic = await prisma.music.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ created: savedMusic, songs: allMusic });
  } catch (error) {
    console.error('Create music error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const body = await request.json();
    const { isLiked, title, tags } = body;

    const updateData: { isLiked?: boolean; title?: string; tags?: string } = {};

    if (typeof isLiked === 'boolean') {
      updateData.isLiked = isLiked;
    }
    if (title !== undefined) {
      updateData.title = title;
    }
    if (tags !== undefined) {
      updateData.tags = tags;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const music = await prisma.music.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(music);
  } catch (error) {
    console.error('Update music error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.music.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete music error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
