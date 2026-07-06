import { NextRequest, NextResponse } from 'next/server';
import { appendRbacMeta, requireApiPermission } from '@/lib/rbac/rbac';
import { buildReportClosePreview } from '@/lib/option-c/report-close';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rbac = requireApiPermission(request, 'report_close_preview');
  if (!rbac.ok) return rbac.response;
  const body = await request.json().catch(() => null);
  const periodCode = String(body?.periodCode ?? '').trim();
  if (!periodCode) {
    return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Thiếu kỳ báo cáo cần preview.' } }, { status: 400 });
  }

  try {
    const result = await buildReportClosePreview({
      reportType: body?.reportType,
      periodCode,
      branch: body?.branch
    });
    return NextResponse.json(appendRbacMeta({ ok: true, data: result }, rbac.context));
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'REPORT_CLOSE_PREVIEW_FAILED', message: 'Không preview được điều kiện chốt báo cáo.' } }, { status: 500 });
  }
}

