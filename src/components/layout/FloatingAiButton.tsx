'use client';

import { FormEvent, useState } from 'react';
import { Bot, Loader2, RotateCcw, Send, X } from 'lucide-react';
import { clsx } from 'clsx';

type AiSummary = {
  conclusion?: string;
  summary_for_ceo?: string;
  overall_status?: string;
  rows?: Array<{
    mucDo?: string;
    vanDe?: string;
    viecCanLam?: string;
  }>;
};

export function FloatingAiButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [error, setError] = useState('');

  const askAi = async (event?: FormEvent) => {
    event?.preventDefault();
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/report-analysis', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error?.message ?? 'AI chưa phân tích được.');
      setSummary(json.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI chưa phân tích được.');
    } finally {
      setLoading(false);
    }
  };

  const rows = summary?.rows?.slice(0, 3) ?? [];

  return (
    <>
      {open ? (
        <section className="fixed bottom-[86px] right-3 z-[70] w-[min(440px,calc(100vw-24px))] overflow-hidden rounded-lg border border-lang-line bg-white shadow-card sm:right-5">
          <div className="flex items-center justify-between gap-3 border-b border-lang-line bg-lang-redSoft px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lang-redSoft text-lang-red">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-black text-lang-ink">Trợ lý AI CEO</p>
                <p className="truncate text-[11px] font-semibold text-lang-muted">{summary?.overall_status ?? 'Phân tích dashboard hiện tại'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-lang-line bg-white text-lang-muted hover:bg-lang-mist" aria-label="Đóng AI">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[min(58vh,520px)] space-y-3 overflow-y-auto bg-lang-mist/50 px-4 py-3">
            <div className="rounded-lg border border-lang-line bg-white p-3 text-[13px] font-semibold leading-6 text-lang-ink">
              {loading ? 'Đang phân tích dữ liệu...' : error || summary?.summary_for_ceo || summary?.conclusion || 'Bấm gửi để AI phân tích dashboard.'}
            </div>
            {rows.length ? (
              <div className="space-y-2">
                {rows.map((row, index) => (
                  <div key={`${row.vanDe ?? 'ai-row'}-${index}`} className="rounded-lg border border-lang-line bg-white px-3 py-2">
                    <p className="text-[11px] font-black uppercase text-lang-red">{row.mucDo ?? 'Gợi ý'}</p>
                    <p className="mt-1 text-[12px] font-bold text-lang-ink">{row.vanDe}</p>
                    <p className="mt-1 text-[11px] font-semibold text-lang-muted">{row.viecCanLam}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <form onSubmit={askAi} className="flex gap-2 border-t border-lang-line bg-white p-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-12 flex-1 resize-none rounded-lg border border-lang-line px-3 py-2 text-[13px] font-semibold text-lang-ink outline-none focus:border-lang-red/60 focus:ring-2 focus:ring-lang-red/10"
              placeholder="Hỏi tự do về dashboard..."
              rows={2}
            />
            <button type="submit" disabled={loading} className="inline-flex min-w-20 items-center justify-center gap-1.5 rounded-lg bg-lang-red px-3 text-[13px] font-black text-white shadow-sm hover:bg-lang-redDark disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gửi
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen && !summary && !loading) void askAi();
        }}
        className={clsx(
          'fixed bottom-4 right-3 z-[71] inline-flex h-14 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-black text-white shadow-card transition hover:-translate-y-0.5 sm:right-5',
          open ? 'bg-lang-red hover:bg-lang-redDark' : 'bg-lang-red hover:bg-lang-redDark'
        )}
        aria-label={open ? 'Đóng AI' : 'Mở AI'}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        AI
        {loading ? <RotateCcw className="h-4 w-4 animate-spin" /> : null}
      </button>
    </>
  );
}
