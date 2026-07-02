'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Bot, BookOpen, ChevronDown, ExternalLink } from 'lucide-react';

export function RelatedActionsPanel({ docs }: { docs: string[] }) {
  const [open, setOpen] = useState(false);
  const visibleDocs = docs.slice(0, 4);

  return (
    <section className="rounded-lg border border-lang-line bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-lang-mist/60"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lang-redSoft text-lang-red">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-black text-lang-ink">Tài liệu liên quan · {visibleDocs.length}</span>
            <span className="block truncate text-[11px] font-semibold text-lang-muted">Checklist, quy trình và hỏi AI nội bộ</span>
          </span>
        </span>
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-lang-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="border-t border-lang-line px-3 py-2">
          <div className="space-y-1">
            {visibleDocs.map((doc) => (
              <Link key={doc} href="/tai-lieu/quy-trinh-checklist" className="flex min-h-8 items-center justify-between gap-2 rounded-md px-2 text-[12px] font-bold text-lang-ink hover:bg-lang-mist">
                <span className="truncate">{doc}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-lang-muted" />
              </Link>
            ))}
          </div>
          <div className="mt-2 grid gap-2">
            <Link href="/tai-lieu/quy-trinh-checklist" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-lang-red px-3 text-[12px] font-black text-white hover:bg-lang-redDark">
              <BookOpen className="h-3.5 w-3.5" /> Mở tài liệu
            </Link>
            <Link href="/tai-lieu/tinh-huong-phat-sinh" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-lang-line bg-white px-3 text-[12px] font-black text-lang-ink hover:bg-lang-mist">
              <Bot className="h-3.5 w-3.5 text-lang-red" /> Hỏi AI nội bộ
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
