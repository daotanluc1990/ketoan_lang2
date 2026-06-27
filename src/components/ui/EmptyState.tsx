export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-lang-line bg-white px-4 py-5 text-center shadow-soft">
      <h3 className="text-base font-black text-lang-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-3xl text-[13px] leading-5 text-lang-muted">{description}</p>
    </div>
  );
}
