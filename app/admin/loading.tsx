import { LoadingState } from "@/components/LoadingState";

export default function AdminLoading() {
  return (
    <div className="container-page py-5">
      <LoadingState label="Đang tải dữ liệu quản trị..." />
    </div>
  );
}
