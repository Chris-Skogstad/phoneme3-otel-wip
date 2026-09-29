import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET – aggregated stats for the dashboard
export async function GET(request: NextRequest) {
  try {
    const [
      totalWordSearches,
      totalWordles,
      successCount,
      failCount,
      avgTimeOnPage,
      mostUsedType,
    ] = await Promise.all([
      prisma.wordSearch.count(),
      prisma.wordle.count(),
      prisma.activityEvent.count({ where: { eventType: 'generation_success' } }),
      prisma.activityEvent.count({ where: { eventType: 'generation_failed' } }),
      prisma.activityEvent.aggregate({
        _avg: { timeOnPageMs: true },
        where: { eventType: 'page_view' },
      }),
      prisma.activityEvent.groupBy({
        by: ['activityType'],
        where: { eventType: 'created' },
        _count: true,
        orderBy: { _count: { activityType: 'desc' } },
        take: 1,
      }),
    ]);

    return NextResponse.json(
      {
        status: 'ok',
        totalActivitiesCreated: totalWordSearches + totalWordles,
        totalWordSearches,
        totalWordles,
        successCount,
        failCount,
        avgTimeOnPageMs: avgTimeOnPage._avg.timeOnPageMs ?? 0,
        mostUsedActivityType: mostUsedType[0]?.activityType ?? 'none',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse('Server error', { status: 500, headers: corsHeaders });
  }
}