import { UserPatchForm } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const { data: usersData } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false });
  const users = usersData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Người dùng</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[900px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Email</th><th>Họ tên</th><th>Phone</th><th>Role</th><th>Status</th><th>Ngày tạo</th><th></th></tr></thead><tbody>{users.map((u: any) => <tr key={u.id} className="border-t"><td className="p-3">{u.email}</td><td>{u.full_name}</td><td>{u.phone}</td><td>{u.role}</td><td><OrderStatusBadge status={u.status === "ACTIVE" ? "AVAILABLE" : "DISABLED"} /></td><td>{formatDate(u.created_at)}</td><td><UserPatchForm user={u} /></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
