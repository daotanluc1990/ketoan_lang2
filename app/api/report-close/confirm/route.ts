import { NextRequest, NextResponse } from 'next/server';
import { appendRbacMeta, requireApiPermission } from '@/lib/rbac/rbac';
import { confirmReportClose } from '@/lib/option-c/report-close';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rbac = requireApiPermission(request, 'report_close_confirm');
  if (!rbac.ok) return rbac.response;
  const body = await request.json().catch(() => null);
  const periodCode = String(body?.periodCode ?? '').trim();
  if (!periodCode) {
    return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Thiếu kỳ báo cáo cần chốt.' } }, { status: 400 });
  }

  try {
    const result = await confirmReportClose({
      reportType: body?.reportType,
      periodCode,
      branch: body?.branch,
      actor: body?.actor ?? rbac.context.actor,
      note: body?.note,
      exceptionReason: body?.exceptionReason,
      missingDataReason: body?.missingDataReason,
      expectedImpact: body?.expectedImpact,
      responsibleOwner: body?.responsibleOwner,
      supplementDueDate: body?.supplementDueDate,
      force: body?.force === true
    });
    return NextResponse.json(appendRbacMeta(result, rbac.context), { status: result.ok ? 200 : 409 });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'REPORT_CLOSE_CONFIRM_FAILED', message: 'Không chốt báo cáo được. Kiểm tra cấu hình Google Sheet và quyền ghi.' } }, { status: 500 });
  }
}

