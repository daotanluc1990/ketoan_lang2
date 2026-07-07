'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export type MoverItem = {
  label: string;
  value: number;
  caption?: string;
  trend?: 'up' | 'down' | 'flat';
};

/**
 * Top movers — bar chart hiển thị top N thay đổi lớn nhất.
 * - Mặt hàng bán chạy nhất
 * - NVL thất thoát nhiều nhất
 * - Chi phí tăng mạnh
 *
 * Màu: xanh (tăng tốt), đỏ (tăng xấu), cam (giảm), xám (phẳng)
 */
export function TopMoversBarChart({
  data,
  height = 220,
  positiveIsGood = true,
}: {
  data: MoverItem[];
  height?: number;
  positiveIsGood?: boolean;
}) {
  if (!data.length) {
    return (
      <div className="grid h-[180px] place-items-center rounded-lg border border-dashed border-lang-line bg-lang-paper/50 text-[12px] font-semibold text-lang-muted">
        Chưa có dữ liệu top thay đổi
      </div>
    );
  }

  const formatValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} tỷ`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${Math.round(value)}`;
  };

  const getColor = (value: number) => {
    if (value === 0) return '#9ca3af';
    const isPositive = value > 0;
    if (positiveIsGood) {
      return isPositive ? '#059669' : '#dc2626';
    }
    return isPositive ? '#dc2626' : '#059669';
  };

  const chartData = data.slice(0, 8).map((item) => ({
    name: item.label.length > 18 ? item.label.slice(0, 16) + '…' : item.label,
    fullName: item.label,
    value: item.value,
    caption: item.caption,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
        <XAxis type="number" tickFormatter={formatValue} tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151' }} width={110} />
        <Tooltip
          formatter={(value: unknown) => [formatValue(Number(value)), 'Giá trị']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
