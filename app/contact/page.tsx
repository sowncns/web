import { Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminContact } from "@/lib/contact";

export default function ContactPage() {
  const contact = getAdminContact();
  const items = [
    { label: "Facebook", value: contact.facebook, href: contact.facebook, icon: LinkIcon }
  ];

  return (
    <div className="container-page py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-normal text-slate-950">Liên hệ admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Khi đơn hàng hoặc thanh toán gặp lỗi, hãy liên hệ admin qua các kênh dưới đây.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><item.icon className="h-5 w-5 text-primary" /> {item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {item.href ? <a className="break-all font-semibold text-primary hover:underline" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{item.value}</a> : <p className="break-all font-semibold text-slate-950">{item.value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
