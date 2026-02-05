import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate a random 6-character code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - Get session state or check if code exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const session = await prisma.syncSession.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      await prisma.syncSession.delete({ where: { id: session.id } });
      return NextResponse.json({ error: 'Session expired' }, { status: 410 });
    }

    return NextResponse.json({
      code: session.code,
      hostId: session.hostId,
      currentMusicId: session.currentMusicId,
      isPlaying: session.isPlaying,
      currentTime: session.currentTime,
      lastUpdate: session.lastUpdate.toISOString(),
    });
  } catch (error) {
    console.error('Error getting sync session:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

// POST - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId } = body;

    if (!hostId) {
      return NextResponse.json({ error: 'hostId is required' }, { status: 400 });
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.syncSession.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Create session that expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session = await prisma.syncSession.create({
      data: {
        code,
        hostId,
        expiresAt,
      },
    });

    return NextResponse.json({
      code: session.code,
      hostId: session.hostId,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating sync session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PUT - Update session state
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, currentMusicId, isPlaying, currentTime } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const session = await prisma.syncSession.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      await prisma.syncSession.delete({ where: { id: session.id } });
      return NextResponse.json({ error: 'Session expired' }, { status: 410 });
    }

    // Update session
    const updated = await prisma.syncSession.update({
      where: { code: code.toUpperCase() },
      data: {
        currentMusicId: currentMusicId ?? session.currentMusicId,
        isPlaying: isPlaying ?? session.isPlaying,
        currentTime: currentTime ?? session.currentTime,
        lastUpdate: new Date(),
      },
    });

    return NextResponse.json({
      code: updated.code,
      currentMusicId: updated.currentMusicId,
      isPlaying: updated.isPlaying,
      currentTime: updated.currentTime,
      lastUpdate: updated.lastUpdate.toISOString(),
    });
  } catch (error) {
    console.error('Error updating sync session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// DELETE - Delete session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    await prisma.syncSession.delete({
      where: { code: code.toUpperCase() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sync session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
