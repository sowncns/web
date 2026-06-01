import { UserPatchForm } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Pagination } from "@/components/Pagination";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: usersData, count } = await supabaseAdmin
    .from("profiles")
    .select("id,username,full_name,role,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const users = usersData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Người dùng</h1>
      <div className="space-y-3 md:hidden">
        {users.map((u: any) => (
          <div key={u.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="space-y-2 text-sm">
              <p>Tài khoản: <strong>{u.username || "-"}</strong></p>
              <p>Họ tên: <strong>{u.full_name || "-"}</strong></p>
              <div className="flex flex-wrap items-center gap-2"><span>Vai trò:</span><OrderStatusBadge status={u.role} /></div>
              <div className="flex flex-wrap items-center gap-2"><span>Trạng thái:</span><OrderStatusBadge status={u.status} /></div>
              <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
              <UserPatchForm user={u} />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border bg-white md:block">
        <table className="w-full min-w-[900px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Tài khoản</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th></th></tr></thead><tbody>{users.map((u: any) => <tr key={u.id} className="border-t"><td className="p-3">{u.username || "-"}</td><td>{u.full_name}</td><td><OrderStatusBadge status={u.role} /></td><td><OrderStatusBadge status={u.status} /></td><td>{formatDate(u.created_at)}</td><td><UserPatchForm user={u} /></td></tr>)}</tbody></table>
      </div>
      <Pagination basePath="/admin/users" page={page} pageSize={pageSize} total={count} searchParams={searchParams} />
    </div>
  );
}
