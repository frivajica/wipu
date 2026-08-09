export function RecurringSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl bg-surface-strong"
        />
      ))}
    </div>
  );
}