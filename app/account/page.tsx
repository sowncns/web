import { AccountForm } from "@/components/AccountForm";
import { requireActiveUser } from "@/lib/auth";

export default async function AccountPage() {
  const { profile } = await requireActiveUser();
  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Tài khoản của tôi</h1>
      <AccountForm profile={profile} />
    </div>
  );
}
