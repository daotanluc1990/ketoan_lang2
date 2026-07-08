import { PageHeader } from '@/components/layout/PageHeader';
import { ExecutiveOverviewPage } from '@/components/option-c/ExecutiveOverviewPage';
import { NoPermission } from '@/components/rbac/NoPermission';
import { canRole, getRoleFromServerCookies } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CeoCfoOverviewRoute({ searchParams }: PageProps) {
  const rbac = await getRoleFromServerCookies();
  if (!canRole(rbac.role, 'view_executive_dashboard')) {
    return <NoPermission role={rbac.role} permission="view_executive_dashboard" />;
  }

  return (
    <div className="space-y-2.5">
      <PageHeader title="Tổng quan CEO" />
      <ExecutiveOverviewPage searchParams={searchParams} />
    </div>
  );
}
