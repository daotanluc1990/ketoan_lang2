'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FilterOption, ReportFilterOptions } from '@/lib/reports/report-filters';
import { Filter, RotateCcw } from 'lucide-react';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="min-w-0 rounded-lg border border-lang-line bg-lang-paper px-2.5 py-1.5 shadow-[0_3px_12px_rgba(80,50,20,0.03)]"><span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wide text-lang-muted">{label}</span>{children}</label>;
}

const inputClass = 'h-7 w-full min-w-0 rounded-md border border-transparent bg-transparent px-0 text-[13px] font-extrabold text-lang-ink outline-none transition focus:border-lang-red/40 focus:bg-white focus:px-1.5 focus:ring-2 focus:ring-lang-red/10';
const emptyOptions: ReportFilterOptions = { branches: [], weeks: [], channels: [], sources: [], dataStatuses: [], alertStatuses: [], costGroups: [], importedBy: [] };

type FilterState = {
  branch: string;
  weekCode: string;
  dataStatus: string;
};

function readFiltersFromUrl(): FilterState {
  if (typeof window === 'undefined') return { branch: '', weekCode: '', dataStatus: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    branch: params.get('branch') ?? '',
    weekCode: params.get('weekCode') ?? '',
    dataStatus: params.get('dataStatus') ?? ''
  };
}

function optionList(options: FilterOption[], current: string) {
  const normalized = new Set<string>();
  const list: FilterOption[] = [];
  for (const option of options) {
    const key = option.value.trim().toLowerCase();
    if (!key || normalized.has(key)) continue;
    normalized.add(key);
    list.push(option);
  }
  if (current && !normalized.has(current.trim().toLowerCase())) list.unshift({ label: current, value: current });
  return list;
}

function SelectField({ name, label, value, options, onChange }: { name: keyof FilterState; label: string; value: string; options: FilterOption[]; onChange: (name: keyof FilterState, value: string) => void }) {
  return (
    <Field label={label}>
      <select name={name} value={value} className={inputClass} aria-label={label} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">Tất cả</option>
        {optionList(options, value).map((option) => <option key={`${name}-${option.value}`} value={option.value}>{option.label}{option.count ? ` (${option.count})` : ''}</option>)}
      </select>
    </Field>
  );
}

export function GlobalFilterBar() {
  const [filters, setFilters] = useState<FilterState>(() => readFiltersFromUrl());
  const [options, setOptions] = useState<ReportFilterOptions>(emptyOptions);
  const [status, setStatus] = useState('Đang đọc lựa chọn thật...');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/reports/filter-options', { signal: controller.signal, cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('filter-options failed')))
      .then((json: { filterOptions?: ReportFilterOptions; rawSourceCounts?: Record<string, number> }) => {
        setOptions(json.filterOptions ?? emptyOptions);
        const total = Object.values(json.rawSourceCounts ?? {}).reduce((sum, value) => sum + Number(value || 0), 0);
        setStatus(total ? `${total} dòng dữ liệu thật` : 'Chưa có dữ liệu import thật');
      })
      .catch(() => setStatus('Không đọc được lựa chọn thật'));
    return () => controller.abort();
  }, []);

  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);
  const updateFilter = (name: keyof FilterState, value: string) => setFilters((current) => ({ ...current, [name]: value }));
  const resetFilters = () => { if (typeof window !== 'undefined') window.location.href = window.location.pathname; };

  return (
    <section className="border-b border-lang-line bg-[#F6F3EE]/95 backdrop-blur">
      <form method="get" className="mx-auto w-full max-w-[1480px] px-4 py-2 lg:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3">
            <SelectField name="branch" label="Chi nhánh" value={filters.branch} options={options.branches} onChange={updateFilter} />
            <SelectField name="weekCode" label="Kỳ báo cáo" value={filters.weekCode} options={options.weeks} onChange={updateFilter} />
            <SelectField name="dataStatus" label="Trạng thái" value={filters.dataStatus} options={options.dataStatuses} onChange={updateFilter} />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="text-[11px] font-semibold text-lang-muted">{status} · {activeFilterCount ? `${activeFilterCount} lọc` : 'Chưa lọc'}</span>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-lang-red px-3 text-[12px] font-black text-white hover:bg-lang-redDark" type="submit"><Filter className="h-3.5 w-3.5" />Lọc</button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-lang-line bg-lang-paper px-3 text-[12px] font-bold text-lang-ink hover:bg-lang-mist" type="button" onClick={resetFilters}><RotateCcw className="h-3.5 w-3.5" />Xóa</button>
          </div>
        </div>
      </form>
    </section>
  );
}
