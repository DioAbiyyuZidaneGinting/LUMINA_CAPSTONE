import { NextResponse } from 'next/server';

/**
 * Proxy route to fetch forecast data from the Python ML API.
 * This avoids exposing the FastAPI URL directly to the browser.
 */
export async function GET() {
  const apiUrl = process.env.FORECAST_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${apiUrl}/forecast`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`ML API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ML Forecast Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch ML forecast', details: error.message },
      { status: 502 }
    );
  }
}
