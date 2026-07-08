import { NextResponse } from 'next/server';
import { buildPnLWeeklyTrend, buildInventoryWeeklyTrend, buildLossWeeklyTrend, buildSupplierPriceAlerts } from '@/lib/reports/dashboard-insights';

export async function GET() {
  const [pnl, inv, loss, ncc] = await Promise.all([
    buildPnLWeeklyTrend(), buildInventoryWeeklyTrend(), buildLossWeeklyTrend(), buildSupplierPriceAlerts()
  ]);
  return NextResponse.json({ pnl: pnl.length, pnlSample: pnl.slice(0,2), inv: inv.length, invSample: inv.slice(0,2), loss: loss.length, lossSample: loss.slice(0,2), ncc: ncc.length, nccSample: ncc.slice(0,2) });
}
