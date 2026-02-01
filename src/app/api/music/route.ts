import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sunoApi } from '@/lib/SunoApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const refresh = searchParams.get('refresh') === 'true';

    if (id) {
      // Get specific music
      const music = await prisma.music.findUnique({
        where: { id },
      });

      if (!music) {
        return NextResponse.json({ error: 'Music not found' }, { status: 404 });
      }

      // Optionally refresh status from Suno
      if (refresh && music.status !== 'complete') {
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

    // Get all music
    const music = await prisma.music.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Refresh pending music statuses
    if (refresh) {
      const pendingMusic = music.filter(
        (m) => m.status !== 'complete' && m.status !== 'error'
      );
      if (pendingMusic.length > 0) {
        try {
          const api = await sunoApi();
          const sunoIds = pendingMusic.map((m) => m.sunoId);
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
            orderBy: { createdAt: 'desc' },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, tags, title, make_instrumental } = body;

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
        },
      });
      savedMusic.push(music);
    }

    return NextResponse.json(savedMusic);
  } catch (error) {
    console.error('Create music error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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
