'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { navigationItems } from './navigation';
import type { Role } from '@/lib/report-types';

// C2: Command Palette — mở bằng Cmd/Ctrl+K, fuzzy filter routes theo label + group.
// Dùng <dialog> native (không lib), focus trap tự nhiên, respect prefers-reduced-motion (global).
export function CommandPalette({ open, onClose, role }: { open: boolean; onClose: () => void; role: Role }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const allowed = navigationItems.filter((item) => item.allowedRoles.includes(role));
    const q = query.trim().toLowerCase();
    if (!q) return allowed;
    return allowed.filter((item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q));
  }, [query, role]);

  // Reset active về 0 ngay khi query đổi (trong event handler, không dùng effect)
  const onChangeQuery = (value: string) => { setQuery(value); setActive(0); };

  // Đóng + reset state trong cùng handler (không setState trong effect)
  const closePalette = () => { setQuery(''); setActive(0); onClose(); };
  const go = (href: string) => { setQuery(''); setActive(0); router.push(href); onClose(); };

  // Focus input khi palette mở (sync với external DOM — hợp lệ trong effect)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[active];
        if (item) { router.push(item.href); closePalette(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // closePalette được tạo lại mỗi render nhưng effect chỉ cần deps tĩnh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items, active, router, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/45 px-4 pt-[12vh] backdrop-blur-[2px]" onClick={closePalette}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Bảng lệnh" className="w-[min(620px,92vw)] overflow-hidden rounded-xl border border-lang-line bg-lang-paper shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-lang-line px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-lang-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Chuyển trang, tìm mã hàng, mở báo cáo..."
            className="h-7 w-full bg-transparent text-[14px] font-bold text-lang-ink outline-none placeholder:text-lang-muted"
            aria-label="Tìm trang"
          />
          <kbd className="rounded border border-lang-line bg-lang-mist px-1.5 py-0.5 text-[10px] font-black text-lang-muted">esc</kbd>
        </div>
        <ul className="max-h-[360px] overflow-y-auto p-2" role="listbox">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12px] font-semibold text-lang-muted">Không tìm thấy trang phù hợp</li>
          ) : items.map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={item.href} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item.href)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${i === active ? 'bg-lang-mist text-lang-ink' : 'text-lang-ink hover:bg-lang-toolbar'}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${i === active ? 'text-lang-red' : 'text-lang-muted'}`} aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-[10px] font-extrabold uppercase text-lang-muted">{item.group}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-2 border-t border-lang-line bg-lang-toolbar px-4 py-2 text-[11px] font-semibold text-lang-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-lang-line bg-lang-paper px-1">↑↓</kbd> chọn
            <span className="mx-1">·</span>
            <kbd className="rounded border border-lang-line bg-lang-paper px-1">↵</kbd> mở
          </span>
          <span>{items.length} trang</span>
        </div>
      </div>
    </div>
  );
}
