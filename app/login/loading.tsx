import { LoadingState } from "@/components/LoadingState";

export default function LoginLoading() {
  return (
    <div className="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <div className="w-full max-w-md">
        <LoadingState label="Đang tải form đăng nhập..." />
      </div>
    </div>
  );
}
