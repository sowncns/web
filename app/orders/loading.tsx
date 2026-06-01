import { LoadingState } from "@/components/LoadingState";

export default function OrdersLoading() {
  return (
    <div className="container-page py-10">
      <LoadingState label="Đang tải đơn hàng..." />
    </div>
  );
}
