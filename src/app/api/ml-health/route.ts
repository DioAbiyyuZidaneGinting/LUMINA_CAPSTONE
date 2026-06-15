import { NextResponse } from 'next/server';

/**
 * Proxy route to fetch ML model health/metadata from the Python ML API.
 */
export async function GET() {
  const apiUrl = process.env.FORECAST_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`ML API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ML Health Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'ML API not reachable', details: error.message },
      { status: 502 }
    );
  }
}
