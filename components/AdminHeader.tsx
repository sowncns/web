export function AdminHeader({ name }: { name?: string | null }) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">Xin chào, {name || "Admin"}</p>
      <h1 className="text-2xl font-bold tracking-normal">Bảng quản trị</h1>
    </div>
  );
}
