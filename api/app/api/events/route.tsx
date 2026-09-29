import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST – log a generic activity event (generation success/fail, page views, etc.)
export async function POST(request: NextRequest) {
  try {
    const { activityType, eventType, activityId, timeOnPageMs, metadata } = await request.json();

    if (!activityType || typeof activityType !== 'string') {
      return new NextResponse('Missing or invalid "activityType"', { status: 400, headers: corsHeaders });
    }
    if (!eventType || typeof eventType !== 'string') {
      return new NextResponse('Missing or invalid "eventType"', { status: 400, headers: corsHeaders });
    }

    const event = await prisma.activityEvent.create({
      data: {
        activityType,
        eventType,
        activityId: activityId ?? null,
        timeOnPageMs: timeOnPageMs ?? null,
        metadata: metadata ?? undefined,
      },
    });

    return NextResponse.json(event, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Server error', { status: 500, headers: corsHeaders });
  }
}

