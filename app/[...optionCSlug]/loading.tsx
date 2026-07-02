import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';

export default function LoadingOptionCPage() {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="h-4 w-36 animate-pulse rounded bg-lang-mist" />
          <div className="mt-2 h-7 w-72 max-w-full animate-pulse rounded bg-lang-mist" />
        </div>
        <div className="h-7 w-28 animate-pulse rounded bg-lang-mist" />
      </div>
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <div className="h-4 w-24 animate-pulse rounded bg-lang-mist" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-lang-mist" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-lang-mist" />
          </Card>
        ))}
      </section>
      <Card className="p-0">
        <div className="border-b border-lang-line px-3 py-2">
          <CardTitle>Đang tải dữ liệu</CardTitle>
        </div>
        <div className="p-2">
          <ReportTable headers={['Nguồn', 'Chỉ số', 'Giá trị', 'Trạng thái', 'Hành động']} loading rows={[]} maxHeight="max-h-[320px]" />
        </div>
      </Card>
    </div>
  );
}
