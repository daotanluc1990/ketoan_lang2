'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import { STATUS_WORDS, StatusBadge } from './StatusBadge';

type ColumnDef = {
  key: string;
  label: string;
  hideable?: boolean;   // true: user có thể ẩn (mặc định true trừ 2 cột đầu sticky)
  defaultHidden?: boolean;
  frozen?: boolean;     // cố định trái (chỉ hỗ trợ 2 cột đầu)
};

type ReportTableProps = {
  /** API cũ: chỉ truyền headers (string[]) → tự sinh columns */
  headers?: string[];
  /** API mới: columns đầy đủ với hideable/defaultHidden */
  columns?: ColumnDef[];
  rows: string[][];
  emptyDescription?: string;
  emptyTitle?: string;
  loading?: boolean;
  maxHeight?: string;
  /** C1.2: dùng trực tiếp không có border/shadow ngoài (tránh double-card) */
  embedded?: boolean;
  /** C5: bật pagination */
  paginated?: boolean;
  pageSize?: number;
  /** C3: id dùng để persist hidden columns theo (route, table) */
  tableId?: string;
};

function columnWidth(header: string, index: number, wide: boolean) {
  if (!wide) return index === 0 ? 132 : 150;
  const lower = header.toLowerCase();
  if (index === 0) return 144;
  if (index === 1) return 240;
  if (lower.includes('trạng thái') || lower === 'mức' || lower.includes('%')) return 132;
  if (lower.includes('ngày') || lower.includes('hạn') || lower.includes('kỳ')) return 132;
  if (lower.includes('giá trị') || lower.includes('số tiền') || lower.includes('doanh thu')) return 156;
  if (lower.includes('hành động') || lower.includes('ghi chú') || lower.includes('bằng chứng')) return 220;
  return 160;
}

function cellDisplay(value: string) {
  const cell = value || '—';
  // C5.2: dùng STATUS_WORDS export từ StatusBadge, không duplicate Set
  return STATUS_WORDS.has(cell) ? <StatusBadge status={cell} /> : cell;
}

function skeletonRows(headers: string[]) {
  return Array.from({ length: 6 }, (_, rowIndex) => (
    <tr key={`loading-${rowIndex}`} className="odd:bg-lang-paper even:bg-lang-zebra/60">
      {headers.map((header, cellIndex) => (
        <td key={`${header}-${cellIndex}`} className="border-b border-lang-line px-3 py-2">
          <div className="h-4 animate-pulse rounded bg-lang-toolbar" />
        </td>
      ))}
    </tr>
  ));
}

export function ReportTable({
  columns,
  headers,
  rows,
  emptyDescription = 'Import hoặc đổi bộ lọc để hiển thị dữ liệu.',
  emptyTitle = 'Chưa có dữ liệu',
  loading = false,
  maxHeight = 'max-h-[320px]',
  embedded = false,
  paginated = false,
  pageSize = 20,
  tableId
}: ReportTableProps) {
  // Chuẩn hóa columns: accept cả API cũ (headers) và mới (columns)
  const resolvedColumns: ColumnDef[] = useMemo(() => {
    if (columns) return columns;
    if (!headers) return [];
    return headers.map((label, index) => ({
      key: `col-${index}`,
      label,
      hideable: false,
      frozen: index < 2
    }));
  }, [columns, headers]);

  const headerLabels = resolvedColumns.map((c) => c.label);
  const wide = resolvedColumns.length > 6;
  const widths = headerLabels.map((h, i) => columnWidth(h, i, wide));
  const frozenWidth = wide ? widths[0] + widths[1] : 0;
  const tableWidth = wide ? widths.reduce((t, w) => t + w, 0) : 0;

  // C4: hidden columns state (persist theo tableId trong localStorage)
  const storageKey = tableId ? `ctl-cols-${tableId}` : null;
  const [hidden, setHidden] = useState<Set<number>>(() => {
    if (!storageKey || typeof window === 'undefined') {
      return new Set(resolvedColumns.map((c, i) => (c.defaultHidden ? i : -1)).filter((i) => i >= 0));
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return new Set(JSON.parse(raw) as number[]);
    } catch {}
    return new Set(resolvedColumns.map((c, i) => (c.defaultHidden ? i : -1)).filter((i) => i >= 0));
  });

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try { window.localStorage.setItem(storageKey, JSON.stringify([...hidden])); } catch {}
  }, [hidden, storageKey]);

  const toggleColumn = (index: number) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const visibleIndices = resolvedColumns.map((_, i) => i).filter((i) => !hidden.has(i));

  // C5: pagination
  const [page, setPage] = useState(0);
  const totalPages = paginated ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const pagedRows = paginated ? rows.slice(page * pageSize, page * pageSize + pageSize) : rows;
  const visibleRows = pagedRows.length;
  const hasRows = visibleRows > 0;

  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (!pickerOpen) return;
    const close = () => setPickerOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [pickerOpen]);

  const stickyStyle = (colIndex: number, visiblePos: number): CSSProperties | undefined => {
    if (!wide || visiblePos > 1) return undefined;
    return { left: visiblePos === 0 ? 0 : widths[visibleIndices[0]], minWidth: widths[colIndex], width: widths[colIndex] };
  };

  const stickyClass = (visiblePos: number, head = false) => {
    if (!wide || visiblePos > 1) return '';
    return [
      'sticky',
      visiblePos === 0 ? 'z-30' : 'z-20',
      head ? 'bg-lang-mist' : 'bg-lang-paper group-hover:bg-lang-hover',
      'shadow-[1px_0_0_var(--color-lang-line,#E2E8F0)]'
    ].join(' ');
  };

  const containerClass = embedded
    ? 'overflow-hidden rounded-xl border border-lang-line bg-lang-paper'
    : 'overflow-hidden rounded-xl border border-lang-line bg-lang-paper shadow-soft';

  return (
    <div className={containerClass}>
      <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-lang-line bg-lang-toolbar px-3 py-2 text-[12px] font-semibold text-lang-muted">
        <span>{loading ? 'Đang tải dữ liệu' : `${rows.length.toLocaleString('vi-VN')} dòng`}</span>
        <div className="flex items-center gap-3">
          <span>{wide ? `Kéo ngang để xem thêm, giữ cố định ${frozenWidth}px đầu bảng` : 'Bảng dữ liệu'}</span>
          {/* C4: column picker */}
          {resolvedColumns.some((c) => c.hideable) ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setPickerOpen((v) => !v)} className="inline-flex h-7 items-center gap-1 rounded-md border border-lang-line bg-lang-paper px-2 text-[11px] font-bold text-lang-ink hover:bg-lang-mist" aria-label="Ẩn / hiện cột" aria-expanded={pickerOpen}>
                <Columns3 className="h-3.5 w-3.5" aria-hidden="true" /> Cột
              </button>
              {pickerOpen ? (
                <div className="absolute right-0 top-9 z-40 w-56 rounded-lg border border-lang-line bg-lang-paper p-2 shadow-card">
                  <p className="mb-1.5 px-1 text-[10px] font-extrabold uppercase text-lang-muted">Hiển thị cột</p>
                  {resolvedColumns.map((col, i) => (
                    <label key={col.key} className="flex items-center gap-2 rounded px-1 py-1 text-[12px] font-semibold hover:bg-lang-mist">
                      <input
                        type="checkbox"
                        className="accent-lang-red"
                        checked={!hidden.has(i)}
                        disabled={!col.hideable}
                        onChange={() => toggleColumn(i)}
                      />
                      <span className="flex-1 truncate">{col.label}</span>
                      {!col.hideable ? <span className="text-[10px] text-lang-muted">cố định</span> : null}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className={`table-scroll overflow-auto ${maxHeight}`}>
        <table className="density-cell-inner border-separate border-spacing-0 text-data" style={{ minWidth: wide ? `${tableWidth}px` : '100%' }}>
          {wide ? (
            <colgroup>
              {visibleIndices.map((colIndex, visiblePos) => (
                <col key={resolvedColumns[colIndex].key} style={{ width: widths[colIndex] }} />
              ))}
            </colgroup>
          ) : null}
          <thead className="density-row sticky top-0 z-10 bg-lang-mist text-left text-lang-muted">
            <tr>
              {visibleIndices.map((colIndex, visiblePos) => (
                <th
                  key={resolvedColumns[colIndex].key}
                  className={`border-b border-lang-line px-3 py-2 text-[12px] font-bold ${stickyClass(visiblePos, true)}`}
                  style={stickyStyle(colIndex, visiblePos)}
                >
                  {resolvedColumns[colIndex].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? skeletonRows(headerLabels) : null}
            {!loading && !hasRows ? (
              <tr>
                <td colSpan={visibleIndices.length} className="px-4 py-8 text-center">
                  <div className="mx-auto max-w-md rounded-xl border border-dashed border-lang-line bg-lang-toolbar px-4 py-5">
                    <p className="text-[14px] font-extrabold text-lang-ink">{emptyTitle}</p>
                    <p className="mt-1 text-[12px] font-semibold text-lang-muted">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : null}
            {!loading && hasRows ? pagedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="density-row group odd:bg-lang-paper even:bg-lang-zebra hover:bg-lang-hover">
                {visibleIndices.map((colIndex, visiblePos) => {
                  const cell = row[colIndex] ?? '—';
                  const numeric = visiblePos > 1 ? 'number whitespace-nowrap' : '';
                  return (
                    <td
                      key={`${rowIndex}-${resolvedColumns[colIndex].key}`}
                      className={`border-b border-lang-line px-3 py-2 text-[12.5px] font-normal text-lang-ink/85 ${numeric} ${stickyClass(visiblePos)}`}
                      style={stickyStyle(colIndex, visiblePos)}
                    >
                      <div className={visiblePos > 1 ? 'max-w-[260px] break-words' : 'max-w-[320px] break-words'}>{cellDisplay(cell)}</div>
                    </td>
                  );
                })}
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>

      {/* C5: pagination */}
      {paginated && rows.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-lang-line bg-lang-toolbar px-3 py-2 text-[12px] font-semibold text-lang-muted">
          <span>{`Hiển thị ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, rows.length)} / ${rows.length} dòng`}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-lang-line bg-lang-paper text-lang-ink hover:bg-lang-mist disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="px-1 text-lang-ink">{`${page + 1} / ${totalPages}`}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-lang-line bg-lang-paper text-lang-ink hover:bg-lang-mist disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
