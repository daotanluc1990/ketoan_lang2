import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AccountingTasksPage } from '@/components/option-c/AccountingTasksPage';
import { OptionCImportUploadPage } from '@/components/option-c/OptionCImportUploadPage';
import { OptionCModulePage } from '@/components/option-c/OptionCModulePage';
import { OptionCOverviewPage } from '@/components/option-c/OptionCOverviewPage';
import { ReportManagementPage } from '@/components/option-c/ReportManagementPage';
import { NoPermission } from '@/components/rbac/NoPermission';
import { RuleFormulaSheetMapPage } from '@/components/system/RuleFormulaSheetMapPage';
import { UserManagementPage } from '@/components/system/UserManagementPage';
import { findOptionCPage } from '@/lib/option-c/catalog';
import { canRole, getRoleFromServerCookies, PAGE_PERMISSIONS } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ optionCSlug?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OptionCPage({ params, searchParams }: PageProps) {
  const { optionCSlug = [] } = await params;
  const page = findOptionCPage(optionCSlug);
  if (!page) notFound();
  const permission = PAGE_PERMISSIONS[page.path];
  const rbac = await getRoleFromServerCookies();
  if (permission && !canRole(rbac.role, permission)) return <NoPermission role={rbac.role} permission={permission} />;
  const status = page.kind === 'overview' ? undefined : 'Cần đối chiếu';
  const isUserManagement = page.path === '/he-thong/nguoi-dung-phan-quyen';
  const isRuleFormulaSheetMap = page.path === '/he-thong/rule-formula-sheet-map';

  return (
    <div className="space-y-2.5">
      <PageHeader title={page.title} status={status} />
      {page.kind === 'overview' ? <OptionCOverviewPage searchParams={searchParams} /> : null}
      {page.kind === 'task' ? <AccountingTasksPage page={page} searchParams={searchParams} /> : null}
      {page.kind === 'report' ? <ReportManagementPage page={page} searchParams={searchParams} /> : null}
      {page.path === '/nhap-lieu/upload' ? <OptionCImportUploadPage /> : null}
      {isUserManagement ? <UserManagementPage /> : null}
      {isRuleFormulaSheetMap ? <RuleFormulaSheetMapPage /> : null}
      {page.kind !== 'overview' && page.kind !== 'task' && page.kind !== 'report' && page.path !== '/nhap-lieu/upload' && !isUserManagement && !isRuleFormulaSheetMap ? <OptionCModulePage page={page} /> : null}
    </div>
  );
}
