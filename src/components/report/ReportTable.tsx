import { StatusBadge } from './StatusBadge';

const statusWords = new Set(['Tốt', 'Đạt', 'Có thể chốt', 'Có thể gửi', 'Đã xong', 'Ổn', 'Cảnh báo', 'Cần kiểm', 'Cần đối chiếu', 'Đang làm', 'Chưa đủ dữ liệu', 'Chưa', 'Có lỗi', 'Nguy hiểm', 'Chưa thể chốt', 'Không import', 'Không', 'Cần CEO duyệt']);

export function ReportTable({ headers, rows, maxHeight = 'max-h-[360px]' }: { headers: string[]; rows: string[][]; maxHeight?: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-lang-line bg-lang-paper shadow-sm">
      <div className={`table-scroll overflow-auto ${maxHeight}`}>
        <table className="min-w-full border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 z-10 bg-lang-cream2 text-left uppercase tracking-[0.14em] text-lang-muted">
            <tr>{headers.map((h) => <th className="border-b border-lang-line px-4 py-3 font-black" key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="odd:bg-white/45 even:bg-lang-paper hover:bg-lang-yellow/14">
                {row.map((cell, cellIdx) => <td className={cellIdx > 1 ? 'number whitespace-nowrap border-b border-lang-line/70 px-4 py-3 font-semibold text-lang-brown' : 'border-b border-lang-line/70 px-4 py-3 font-semibold text-lang-brown'} key={`${idx}-${cellIdx}`}>{statusWords.has(cell) ? <StatusBadge status={cell} /> : cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
