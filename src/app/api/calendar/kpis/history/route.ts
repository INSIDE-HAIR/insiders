import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/config/auth/auth';
import { CalendarKPIService } from '@/src/features/calendar/services/CalendarKPIService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const kpiService = new CalendarKPIService();
    const history = await kpiService.getKPIHistory(limit);

    return NextResponse.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('Error fetching KPI history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}