import { LoadingState } from "@/components/LoadingState";

export default function PaymentLoading() {
  return (
    <div className="container-page py-5">
      <LoadingState label="Đang tải giao dịch..." />
    </div>
  );
}
