import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/playlists/music - Add music to a playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playlistId, musicId } = body;

    if (!playlistId || !musicId) {
      return NextResponse.json(
        { error: 'playlistId and musicId are required' },
        { status: 400 }
      );
    }

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Check if music exists
    const music = await prisma.music.findUnique({
      where: { id: musicId },
    });

    if (!music) {
      return NextResponse.json(
        { error: 'Music not found' },
        { status: 404 }
      );
    }

    // Check if already in playlist
    const existing = await prisma.playlistMusic.findUnique({
      where: {
        playlistId_musicId: {
          playlistId,
          musicId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Music is already in this playlist' },
        { status: 400 }
      );
    }

    // Get the max position in the playlist
    const maxPosition = await prisma.playlistMusic.aggregate({
      where: { playlistId },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position ?? -1) + 1;

    // Add music to playlist
    const playlistMusic = await prisma.playlistMusic.create({
      data: {
        playlistId,
        musicId,
        position: newPosition,
      },
      include: {
        music: true,
      },
    });

    return NextResponse.json({
      ...playlistMusic.music,
      position: playlistMusic.position,
      addedAt: playlistMusic.addedAt,
    });
  } catch (error) {
    console.error('Add music to playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/music?playlistId=xxx&musicId=xxx - Remove music from playlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const musicId = searchParams.get('musicId');

    if (!playlistId || !musicId) {
      return NextResponse.json(
        { error: 'playlistId and musicId are required' },
        { status: 400 }
      );
    }

    await prisma.playlistMusic.delete({
      where: {
        playlistId_musicId: {
          playlistId,
          musicId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove music from playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/playlists/music - Update music position in playlist
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { playlistId, musicId, position } = body;

    if (!playlistId || !musicId || position === undefined) {
      return NextResponse.json(
        { error: 'playlistId, musicId, and position are required' },
        { status: 400 }
      );
    }

    const playlistMusic = await prisma.playlistMusic.update({
      where: {
        playlistId_musicId: {
          playlistId,
          musicId,
        },
      },
      data: {
        position,
      },
    });

    return NextResponse.json(playlistMusic);
  } catch (error) {
    console.error('Update music position error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
