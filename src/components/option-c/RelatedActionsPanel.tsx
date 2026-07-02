'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Bot, BookOpen, ChevronDown, ExternalLink } from 'lucide-react';

export function RelatedActionsPanel({ docs }: { docs: string[] }) {
  const [open, setOpen] = useState(false);
  const visibleDocs = docs.slice(0, 3);

  return (
    <div className="relative z-20 flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={clsx(
          'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-extrabold transition',
          open
            ? 'border-lang-red/25 bg-lang-redSoft text-lang-redDark shadow-sm'
            : 'border-lang-line bg-white text-lang-ink hover:border-lang-red/25 hover:bg-lang-redSoft/65 hover:text-lang-redDark'
        )}
        aria-expanded={open}
      >
        <BookOpen className="h-4 w-4 text-lang-red" />
        Tài liệu liên quan
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-lang-muted transition-transform', open && 'rotate-180')} />
      </button>
      <Link
        href="/tai-lieu/tinh-huong-phat-sinh"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-lang-line bg-white px-3 text-[12px] font-extrabold text-lang-ink transition hover:border-lang-red/25 hover:bg-lang-redSoft/65 hover:text-lang-redDark"
      >
        <Bot className="h-4 w-4 text-lang-red" />
        Hỏi AI
      </Link>

      {open ? (
        <div className="absolute right-0 top-[42px] w-[min(320px,calc(100vw-32px))] rounded-lg border border-lang-line bg-white p-2 shadow-card">
          <div className="space-y-1">
            {visibleDocs.map((doc) => (
              <Link key={doc} href="/tai-lieu/quy-trinh-checklist" className="flex min-h-9 items-center justify-between gap-2 rounded-md px-2.5 text-[12px] font-bold text-lang-ink hover:bg-lang-mist">
                <span className="truncate">{doc}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-lang-muted" />
              </Link>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 border-t border-lang-line pt-2">
            <Link href="/tai-lieu/quy-trinh-checklist" className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-lang-red px-3 text-[12px] font-extrabold text-white hover:bg-lang-redDark">
              <BookOpen className="h-3.5 w-3.5" /> Mở tài liệu
            </Link>
            <Link href="/tai-lieu/tinh-huong-phat-sinh" className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-lang-line bg-white px-3 text-[12px] font-extrabold text-lang-ink hover:bg-lang-mist">
              <Bot className="h-3.5 w-3.5 text-lang-red" /> Hỏi AI
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
