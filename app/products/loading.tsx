import { LoadingState } from "@/components/LoadingState";

export default function ProductsLoading() {
  return (
    <div className="container-page py-10">
      <LoadingState label="Đang tải sản phẩm..." />
    </div>
  );
}
