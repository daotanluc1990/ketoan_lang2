import { PageHeader } from '@/components/layout/PageHeader';
import { OptionCOverviewPage } from '@/components/option-c/OptionCOverviewPage';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TongQuanPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-2.5">
      <PageHeader title="Tổng quan kế toán" />
      <OptionCOverviewPage searchParams={searchParams} />
    </div>
  );
}
