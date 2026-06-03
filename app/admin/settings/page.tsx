import { NotificationSettingsForm } from "@/components/AdminManagers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationSettings } from "@/lib/admin-notifications";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getNotificationSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt thông báo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Email đơn hàng mới</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
