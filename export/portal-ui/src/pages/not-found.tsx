import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Trang bạn tìm không tồn tại</p>
      <button
        onClick={() => setLocation("/home")}
        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Về trang chủ
      </button>
    </div>
  );
}
