export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center text-sm font-semibold text-muted-foreground">
      {label}
    </div>
  );
}
