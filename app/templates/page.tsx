import { redirect } from "next/navigation";

export default function TemplatesPage() {
  redirect("/products?type=template");
}
