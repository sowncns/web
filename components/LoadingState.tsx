export function LoadingState({ label = "Đang tải..." }) {
  return <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">{label}</div>;
}
