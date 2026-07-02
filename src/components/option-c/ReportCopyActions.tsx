'use client';

import { useMemo, useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';

type CopyPayload = {
  alerts: string[][];
  tasks: string[][];
  templates: string[][];
  title: string;
};

function tableToText(headers: string[], rows: string[][]) {
  return [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
}

export function ReportCopyActions({ alerts, tasks, templates, title }: CopyPayload) {
  const [copied, setCopied] = useState<string | null>(null);
  const text = useMemo(() => ({
    summary: [
      title,
      '',
      'Mẫu nội dung cần có:',
      tableToText(['Phần', 'Nội dung'], templates),
      '',
      'Cảnh báo:',
      tableToText(['Mức', 'Nội dung', 'Phụ trách', 'Hành động'], alerts),
      '',
      'Nhiệm vụ:',
      tableToText(['Nguồn', 'Việc cần làm', 'Phụ trách', 'Hạn xử lý', 'Mức độ'], tasks)
    ].join('\n'),
    template: tableToText(['Phần', 'Nội dung cần có'], templates),
    actions: [
      'Cảnh báo',
      tableToText(['Mức', 'Nội dung', 'Phụ trách', 'Hành động'], alerts),
      '',
      'Nhiệm vụ',
      tableToText(['Nguồn', 'Việc cần làm', 'Phụ trách', 'Hạn xử lý', 'Mức độ'], tasks)
    ].join('\n')
  }), [alerts, tasks, templates, title]);

  async function copy(kind: keyof typeof text, label: string) {
    await navigator.clipboard.writeText(text[kind]);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
  }

  const buttons: Array<[keyof typeof text, string]> = [
    ['summary', 'Sao chép tóm tắt'],
    ['template', 'Sao chép mẫu'],
    ['actions', 'Sao chép cảnh báo/task']
  ];

  return (
    <div className="rounded-lg border border-lang-line bg-white px-3 py-2 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-black text-lang-ink">Sao chép báo cáo</p>
          <p className="text-[11px] font-semibold text-lang-muted">Dán nhanh vào Zalo, email hoặc biên bản chốt.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {buttons.map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              onClick={() => copy(kind, label)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-white px-2.5 text-[12px] font-black text-lang-ink hover:bg-lang-mist"
            >
              {copied === label ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <ClipboardCopy className="h-3.5 w-3.5 text-lang-red" />}
              {copied === label ? 'Đã sao chép' : label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
