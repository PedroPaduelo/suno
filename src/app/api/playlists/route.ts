import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/playlists - List all playlists or get one with musics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific playlist with its musics
      const playlist = await prisma.playlist.findUnique({
        where: { id },
        include: {
          musics: {
            include: {
              music: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      if (!playlist) {
        return NextResponse.json(
          { error: 'Playlist not found' },
          { status: 404 }
        );
      }

      // Transform the response to flatten the music data
      const transformedPlaylist = {
        ...playlist,
        musics: playlist.musics.map((pm) => ({
          ...pm.music,
          position: pm.position,
          addedAt: pm.addedAt,
        })),
      };

      return NextResponse.json(transformedPlaylist);
    }

    // Get all playlists with music count
    const playlists = await prisma.playlist.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { musics: true },
        },
      },
    });

    // Transform to include musicCount
    const transformedPlaylists = playlists.map((p) => ({
      ...p,
      musicCount: p._count.musics,
      _count: undefined,
    }));

    return NextResponse.json(transformedPlaylists);
  } catch (error) {
    console.error('Get playlists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create a new playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/playlists?id=xxx - Update a playlist
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, imageUrl } = body;

    const updateData: { name?: string; description?: string | null; imageUrl?: string | null } = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Playlist name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Update playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists?id=xxx - Delete a playlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.playlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
