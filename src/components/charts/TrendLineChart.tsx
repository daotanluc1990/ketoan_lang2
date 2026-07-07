'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Series = {
  key: string;
  label: string;
  color: string;
};

export type TrendPoint = Record<string, string | number>;

/**
 * Biểu đồ đường xu hướng doanh thu/dòng tiền theo ngày.
 * - Dùng cho /tong-quan và /ceo-cfo
 * - Hỗ trợ nhiều series (doanh thu, tiền vào, tiền ra)
 * - Tooltip tiếng Việt với số tiền format
 */
export function TrendLineChart({
  data,
  series,
  height = 240,
  moneyFormat = true,
}: {
  data: TrendPoint[];
  series: Series[];
  height?: number;
  moneyFormat?: boolean;
}) {
  if (!data.length) {
    return (
      <div className="grid h-[200px] place-items-center rounded-lg border border-dashed border-lang-line bg-lang-paper/50 text-[12px] font-semibold text-lang-muted">
        Chưa đủ dữ liệu để vẽ biểu đồ xu hướng
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (!moneyFormat) return value.toLocaleString('vi-VN');
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} tỷ`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${Math.round(value)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} interval="preserveStartEnd" />
        <YAxis tickFormatter={formatValue} tick={{ fontSize: 11, fill: '#6b7280' }} width={50} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => [formatValue(Number(value)), String(name)]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
