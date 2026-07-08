import { AlertTriangle, TrendingDown, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';

export type Alert = {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  detail: string;
  suggestion: string;
};

/**
 * AlertPanel + ActionSuggestion — bảng cảnh báo và đề xuất hành động.
 * Phân loại theo severity (critical/warning/info), mỗi alert có:
 * - Tên cảnh báo
 * - Chi tiết số liệu
 * - Đề xuất hành động cụ thể
 *
 * Dùng cho /tong-quan, /ceo-cfo, và các module tabs.
 */
export function AlertPanel({ alerts, compact = false }: { alerts: Alert[]; compact?: boolean }) {
  if (!alerts.length) {
    return (
      <Card>
        <CardTitle>Cảnh báo & đề xuất</CardTitle>
        <div className="mt-3 grid h-[80px] place-items-center rounded-lg bg-emerald-50/50 text-[12px] font-bold text-emerald-700">
          ✓ Không có cảnh báo. Tất cả KPI trong ngưỡng an toàn.
        </div>
      </Card>
    );
  }

  const bySeverity = {
    critical: alerts.filter((a) => a.severity === 'critical'),
    warning: alerts.filter((a) => a.severity === 'warning'),
    info: alerts.filter((a) => a.severity === 'info'),
  };

  const styleMap = {
    critical: { bg: 'bg-red-50/70', border: 'border-red-200', text: 'text-red-800', icon: AlertTriangle, badge: 'bg-red-600' },
    warning: { bg: 'bg-blue-50/50', border: 'border-blue-200', text: 'text-blue-800', icon: TrendingDown, badge: 'bg-blue-500' },
    info: { bg: 'bg-slate-50/60', border: 'border-slate-200', text: 'text-slate-700', icon: TrendingUp, badge: 'bg-slate-500' },
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Cảnh báo & đề xuất hành động</CardTitle>
        <div className="flex gap-1.5">
          {bySeverity.critical.length > 0 && (
            <span className={`rounded-full ${styleMap.critical.badge} px-2 py-0.5 text-[10px] font-black text-white`}>{bySeverity.critical.length} nghiêm trọng</span>
          )}
          {bySeverity.warning.length > 0 && (
            <span className={`rounded-full ${styleMap.warning.badge} px-2 py-0.5 text-[10px] font-black text-white`}>{bySeverity.warning.length} cảnh báo</span>
          )}
          {bySeverity.info.length > 0 && (
            <span className={`rounded-full ${styleMap.info.badge} px-2 py-0.5 text-[10px] font-black text-white`}>{bySeverity.info.length} thông tin</span>
          )}
        </div>
      </div>
      <div className={`mt-3 space-y-2 ${compact ? 'max-h-[280px] overflow-auto' : ''}`}>
        {(['critical', 'warning', 'info'] as const).flatMap((sev) =>
          bySeverity[sev].map((alert, idx) => {
            const style = styleMap[sev];
            const Icon = style.icon;
            return (
              <div key={`${sev}-${idx}`} className={`rounded-lg border ${style.border} ${style.bg} p-2.5`}>
                <div className="flex items-start gap-2">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.text}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[12px] font-black ${style.text}`}>{alert.title}</p>
                      <span className="rounded bg-white/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-lang-muted">{alert.category}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-semibold text-lang-muted">{alert.detail}</p>
                    <div className="mt-1.5 flex items-start gap-1 rounded bg-white/60 px-2 py-1">
                      <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-lang-red" aria-hidden="true" />
                      <p className="text-[11px] font-semibold text-lang-ink"><span className="font-black">Đề xuất:</span> {alert.suggestion}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
