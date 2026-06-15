import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Live prediction route: queries actual store data from Supabase,
 * aggregates daily sales, sends to the ML model, and returns predictions.
 *
 * Query params:
 *   - horizonDays: number of days to predict (default: 7, max: 30)
 *   - historyDays: number of days of history to include (default: 90)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const horizonDays = Math.min(parseInt(searchParams.get('horizonDays') || '7'), 30);
  const historyDays = parseInt(searchParams.get('historyDays') || '90');

  try {
    // Create server-side Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate cutoff date for history
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - historyDays);

    // Query order items joined with orders to get dates and prices
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        orders!inner(created_at)
      `);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    // Extract and filter items
    const items = (orderItems || [])
      .map((item: any) => ({
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        created_at: Array.isArray(item.orders)
          ? item.orders[0]?.created_at
          : item.orders?.created_at,
      }))
      .filter((item) => item.created_at && new Date(item.created_at) >= cutoffDate);

    // Aggregate by date: sum quantities per day
    const salesMap: Record<string, number> = {};
    let totalRevenue = 0;
    let totalQuantity = 0;

    items.forEach((item) => {
      const dateStr = new Date(item.created_at).toISOString().split('T')[0];
      salesMap[dateStr] = (salesMap[dateStr] || 0) + item.quantity;
      totalRevenue += item.price * item.quantity;
      totalQuantity += item.quantity;
    });

    // Calculate average price per item
    const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

    // Build continuous daily sales array (fill missing days with 0)
    const dailySales: { date: string; total_items: number }[] = [];
    const today = new Date();

    for (let i = historyDays; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailySales.push({
        date: dateStr,
        total_items: salesMap[dateStr] || 0,
      });
    }

    // Call the ML API's /predict endpoint
    const apiUrl = process.env.FORECAST_API_URL || 'http://localhost:8000';
    const mlResponse = await fetch(`${apiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daily_sales: dailySales,
        horizon_days: horizonDays,
        avg_price: avgPrice,
      }),
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      throw new Error(`ML API error (${mlResponse.status}): ${errText}`);
    }

    const predictions = await mlResponse.json();

    return NextResponse.json({
      ...predictions,
      avg_price_used: Math.round(avgPrice * 100) / 100,
      history_days: historyDays,
      total_store_orders: items.length,
    });
  } catch (error: any) {
    console.error('[ML Predict Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate live prediction', details: error.message },
      { status: 502 }
    );
  }
}
