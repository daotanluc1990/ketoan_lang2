import type { CSSProperties } from 'react';
import { StatusBadge } from './StatusBadge';

const statusWords = new Set(['Tốt', 'Đạt', 'Có thể chốt', 'Có thể gửi', 'Đã xong', 'Ổn', 'Cảnh báo', 'Cần kiểm', 'Cần đối chiếu', 'Đang làm', 'Chưa đủ dữ liệu', 'Chưa', 'Có lỗi', 'Nguy hiểm', 'Chưa thể chốt', 'Không import', 'Không', 'Cần CEO duyệt', 'Xanh', 'Vàng', 'Cam', 'Đỏ', 'ĐỦ ĐIỀU KIỆN CHỐT', 'CHƯA ĐỦ ĐIỀU KIỆN CHỐT', 'ĐÃ CHỐT ĐỦ DỮ LIỆU', 'ĐÃ CHỐT CÓ NGOẠI LỆ', 'Chốt có ngoại lệ', 'Đủ dữ liệu', 'Quá hạn', 'Chờ xác nhận', 'Hoàn thành', 'Chưa xử lý']);

type ReportTableProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  headers: string[];
  loading?: boolean;
  maxHeight?: string;
  rows: string[][];
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
  return statusWords.has(cell) ? <StatusBadge status={cell} /> : cell;
}

function skeletonRows(headers: string[]) {
  return Array.from({ length: 6 }, (_, rowIndex) => (
    <tr key={`loading-${rowIndex}`} className="odd:bg-white even:bg-lang-cream2/45">
      {headers.map((header, cellIndex) => (
        <td key={`${header}-${cellIndex}`} className="border-b border-lang-line px-3 py-2">
          <div className="h-4 animate-pulse rounded bg-lang-mist" />
        </td>
      ))}
    </tr>
  ));
}

export function ReportTable({ emptyDescription = 'Import hoặc đổi bộ lọc để hiển thị dữ liệu.', emptyTitle = 'Chưa có dữ liệu', headers, loading = false, maxHeight = 'max-h-[320px]', rows }: ReportTableProps) {
  const wide = headers.length > 6;
  const widths = headers.map((header, index) => columnWidth(header, index, wide));
  const frozenWidth = wide ? widths[0] + widths[1] : 0;
  const tableWidth = wide ? widths.reduce((total, width) => total + width, 0) : 0;
  const visibleRows = rows.length;
  const hasRows = visibleRows > 0;

  const stickyStyle = (index: number): CSSProperties | undefined => {
    if (!wide || index > 1) return undefined;
    return { left: index === 0 ? 0 : widths[0], minWidth: widths[index], width: widths[index] };
  };

  const stickyClass = (index: number, head = false) => {
    if (!wide || index > 1) return '';
    return [
      'sticky',
      index === 0 ? 'z-30' : 'z-20',
      head ? 'bg-lang-mist' : 'bg-white group-hover:bg-lang-cream2',
      'shadow-[1px_0_0_#D8E0EA]'
    ].join(' ');
  };

  return (
    <div className="overflow-hidden rounded-lg border border-lang-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lang-line bg-lang-mist px-3 py-2 text-[12px] font-semibold text-lang-muted">
        <span>{loading ? 'Đang tải dữ liệu' : `${visibleRows.toLocaleString('vi-VN')} dòng`}</span>
        <span>{wide ? `Kéo ngang để xem thêm, giữ cố định ${frozenWidth}px đầu bảng` : 'Bảng dữ liệu'}</span>
      </div>
      <div className={`table-scroll overflow-auto ${maxHeight}`}>
        <table className="border-separate border-spacing-0 text-[12.5px]" style={{ minWidth: wide ? `${tableWidth}px` : '100%' }}>
          <colgroup>
            {widths.map((width, index) => <col key={`${headers[index]}-${index}`} style={wide ? { width } : undefined} />)}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-lang-mist text-left uppercase tracking-wide text-slate-600">
            <tr>
              {headers.map((header, index) => (
                <th className={`border-b border-lang-line px-3 py-2 font-extrabold ${stickyClass(index, true)}`} key={`${header}-${index}`} style={stickyStyle(index)}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? skeletonRows(headers) : null}
            {!loading && !hasRows ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center">
                  <div className="mx-auto max-w-md rounded-lg border border-dashed border-lang-line bg-lang-cream2 px-4 py-5">
                    <p className="text-[14px] font-extrabold text-lang-ink">{emptyTitle}</p>
                    <p className="mt-1 text-[12px] font-semibold text-lang-muted">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : null}
            {!loading && hasRows ? rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group odd:bg-white even:bg-lang-cream2/45 hover:bg-lang-cream2">
                {headers.map((_, cellIndex) => {
                  const cell = row[cellIndex] ?? '—';
                  const numeric = cellIndex > 1 ? 'number whitespace-nowrap' : '';
                  return (
                    <td className={`border-b border-lang-line px-3 py-2 font-medium text-lang-ink ${numeric} ${stickyClass(cellIndex)}`} key={`${rowIndex}-${cellIndex}`} style={stickyStyle(cellIndex)}>
                      <div className={cellIndex > 1 ? 'max-w-[260px]' : 'max-w-[320px]'}>{cellDisplay(cell)}</div>
                    </td>
                  );
                })}
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
