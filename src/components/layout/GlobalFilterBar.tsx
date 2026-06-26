'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FilterOption, ReportFilterOptions } from '@/lib/reports/report-filters';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-black/45">{label}</span>{children}</label>;
}

const inputClass = 'h-9 w-full min-w-0 rounded-xl border border-black/10 bg-white px-3 text-xs font-bold text-lang-brown shadow-sm outline-none focus:border-lang-red/60 focus:ring-2 focus:ring-lang-red/10';
const emptyOptions: ReportFilterOptions = { branches: [], weeks: [], channels: [], sources: [], dataStatuses: [], alertStatuses: [], costGroups: [], importedBy: [] };

type FilterState = {
  branch: string;
  weekCode: string;
  fromDate: string;
  toDate: string;
  dataStatus: string;
  source: string;
  channel: string;
  costGroup: string;
  alertStatus: string;
  importedBy: string;
};

function readFiltersFromUrl(): FilterState {
  if (typeof window === 'undefined') {
    return { branch: '', weekCode: '', fromDate: '', toDate: '', dataStatus: '', source: '', channel: '', costGroup: '', alertStatus: '', importedBy: '' };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    branch: params.get('branch') ?? '',
    weekCode: params.get('weekCode') ?? '',
    fromDate: params.get('fromDate') ?? '',
    toDate: params.get('toDate') ?? '',
    dataStatus: params.get('dataStatus') ?? '',
    source: params.get('source') ?? '',
    channel: params.get('channel') ?? '',
    costGroup: params.get('costGroup') ?? '',
    alertStatus: params.get('alertStatus') ?? '',
    importedBy: params.get('importedBy') ?? ''
  };
}

function optionList(options: FilterOption[], current: string, fallback: string[] = []) {
  const normalized = new Set<string>();
  const list: FilterOption[] = [];
  for (const label of fallback) {
    const key = label.trim().toLowerCase();
    if (!key || normalized.has(key)) continue;
    normalized.add(key);
    list.push({ label, value: label });
  }
  for (const option of options) {
    const key = option.value.trim().toLowerCase();
    if (!key || normalized.has(key)) continue;
    normalized.add(key);
    list.push(option);
  }
  if (current && !normalized.has(current.trim().toLowerCase())) list.unshift({ label: current, value: current });
  return list;
}

function SelectField({ name, label, value, options, onChange, fallback = [] }: { name: keyof FilterState; label: string; value: string; options: FilterOption[]; onChange: (name: keyof FilterState, value: string) => void; fallback?: string[] }) {
  return (
    <Field label={label}>
      <select name={name} value={value} className={inputClass} aria-label={label} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">Tất cả</option>
        {optionList(options, value, fallback).map((option) => <option key={`${name}-${option.value}`} value={option.value}>{option.label}{option.count ? ` (${option.count})` : ''}</option>)}
      </select>
    </Field>
  );
}

function FilterTile({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'warning' | 'danger' | 'good' }) {
  const toneClass = tone === 'danger' ? 'border-red-200 bg-red-50 text-red-800' : tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : tone === 'good' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-black/10 bg-white text-lang-brown';
  return (
    <div className={`min-w-0 rounded-2xl border px-3 py-2 shadow-sm ${toneClass}`}>
      <p className="truncate text-[10px] font-black uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-0.5 truncate text-sm font-extrabold">{value || 'Tất cả'}</p>
    </div>
  );
}

export function GlobalFilterBar() {
  const [filters, setFilters] = useState<FilterState>(() => readFiltersFromUrl());
  const [options, setOptions] = useState<ReportFilterOptions>(emptyOptions);
  const [status, setStatus] = useState('Đang đọc lựa chọn thật...');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/reports/filter-options', { signal: controller.signal, cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('filter-options failed')))
      .then((json: { filterOptions?: ReportFilterOptions; rawSourceCounts?: Record<string, number> }) => {
        setOptions(json.filterOptions ?? emptyOptions);
        const total = Object.values(json.rawSourceCounts ?? {}).reduce((sum, value) => sum + Number(value || 0), 0);
        setStatus(total ? `Lựa chọn từ ${total} dòng dữ liệu thật` : 'Chưa có dữ liệu import thật cho bộ lọc');
      })
      .catch(() => setStatus('Không đọc được lựa chọn thật; vẫn có thể lọc bằng URL'));
    return () => controller.abort();
  }, []);

  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);
  const updateFilter = (name: keyof FilterState, value: string) => setFilters((current) => ({ ...current, [name]: value }));
  const resetFilters = () => {
    if (typeof window !== 'undefined') window.location.href = window.location.pathname;
  };

  return (
    <section className="sticky top-16 z-10 border-b border-black/5 bg-lang-cream/92 backdrop-blur">
      <form method="get" className="w-full px-3 py-2 sm:px-4 lg:px-5">
        <div className="rounded-2xl bg-white/85 p-2 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-5">
              <FilterTile label="Chi nhánh" value={filters.branch || 'Toàn hệ thống'} />
              <FilterTile label="Kỳ báo cáo" value={filters.weekCode || 'Tuần hiện tại'} />
              <FilterTile label="Dữ liệu" value={filters.dataStatus || 'Tất cả trạng thái'} tone={filters.dataStatus?.includes('Lỗi') ? 'danger' : filters.dataStatus ? 'warning' : 'neutral'} />
              <FilterTile label="Nguồn" value={filters.source || 'Tất cả nguồn'} />
              <FilterTile label="Cảnh báo" value={filters.alertStatus || 'Đang theo dõi'} tone={filters.alertStatus?.includes('Nguy') ? 'danger' : filters.alertStatus ? 'warning' : 'good'} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 xl:justify-end">
              <span className="text-[11px] font-bold text-black/45">{status} · {activeFilterCount ? `${activeFilterCount} bộ lọc` : 'Chưa lọc'}</span>
              <button className="h-9 rounded-xl bg-white px-3 text-xs font-extrabold text-lang-brown shadow-sm ring-1 ring-black/10 hover:bg-lang-cream" type="button" onClick={() => setExpanded((current) => !current)}>{expanded ? 'Ẩn bộ lọc' : 'Bộ lọc nâng cao'}</button>
              <button className="h-9 rounded-xl bg-lang-red px-3 text-xs font-extrabold text-white shadow-sm hover:bg-lang-red/90" type="submit">Lọc</button>
              <button className="h-9 rounded-xl bg-white px-3 text-xs font-extrabold text-lang-brown ring-1 ring-black/10 hover:bg-lang-cream" type="button" onClick={resetFilters}>Xóa</button>
            </div>
          </div>
          {expanded ? (
            <div className="mt-3 grid gap-2 border-t border-black/5 pt-3 md:grid-cols-5 xl:grid-cols-10">
              <SelectField name="branch" label="Chi nhánh" value={filters.branch} options={options.branches} fallback={['Làng NVT', 'Bếp trung tâm', 'Toàn hệ thống']} onChange={updateFilter} />
              <SelectField name="weekCode" label="Kỳ báo cáo" value={filters.weekCode} options={options.weeks} fallback={['2026-W23']} onChange={updateFilter} />
              <Field label="Từ ngày"><input name="fromDate" className={inputClass} type="date" value={filters.fromDate} aria-label="Từ ngày" onChange={(event) => updateFilter('fromDate', event.target.value)} /></Field>
              <Field label="Đến ngày"><input name="toDate" className={inputClass} type="date" value={filters.toDate} aria-label="Đến ngày" onChange={(event) => updateFilter('toDate', event.target.value)} /></Field>
              <SelectField name="dataStatus" label="Trạng thái dữ liệu" value={filters.dataStatus} options={options.dataStatuses} fallback={['Đạt', 'Cần đối chiếu', 'Lỗi', 'Đã hoàn tác']} onChange={updateFilter} />
              <SelectField name="source" label="Nguồn dữ liệu" value={filters.source} options={options.sources} fallback={['Doanh thu app', 'Doanh thu cửa hàng', 'Sổ quỹ', 'Tồn kho', 'Thất thoát NVL']} onChange={updateFilter} />
              <SelectField name="channel" label="Kênh bán" value={filters.channel} options={options.channels} fallback={['Offline', 'Grab', 'ShopeeFood', 'Be']} onChange={updateFilter} />
              <SelectField name="costGroup" label="Nhóm chi phí" value={filters.costGroup} options={options.costGroups} fallback={['NVL', 'Lao động', 'NCC']} onChange={updateFilter} />
              <SelectField name="alertStatus" label="Cảnh báo" value={filters.alertStatus} options={options.alertStatuses} fallback={['Tốt', 'Cảnh báo', 'Nguy hiểm']} onChange={updateFilter} />
              <SelectField name="importedBy" label="Người nhập" value={filters.importedBy} options={options.importedBy} fallback={['Kế toán', 'Admin']} onChange={updateFilter} />
            </div>
          ) : null}
        </div>
      </form>
    </section>
  );
}
