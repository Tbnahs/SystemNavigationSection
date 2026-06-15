import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ScanLine, ShoppingBasket, Factory, Package, Search, ArrowLeft } from "lucide-react";

const EVENT_TYPES = [
  {
    id: "thu-mua",
    label: "Thu mua",
    desc: "Khai báo sự kiện thu mua nguyên liệu từ hộ liên kết, ghi nhận lô thương phẩm và tạo QR truy xuất.",
    icon: ShoppingBasket,
    gradient: "from-green-500 to-teal-600",
    href: "/module/txng/khai-bao/thu-mua",
    ready: true,
  },
  {
    id: "che-bien",
    label: "Chế biến",
    desc: "Khai báo sự kiện chế biến, sơ chế nguyên liệu: chọn lô đầu vào, ghi nhận đầu ra thương phẩm.",
    icon: Factory,
    gradient: "from-amber-500 to-orange-600",
    href: "/module/txng/khai-bao/che-bien",
    ready: true,
  },
  {
    id: "dong-goi",
    label: "Đóng gói - Niêm phong",
    desc: "Khai báo sự kiện đóng gói, niêm phong và hoàn thiện thành phẩm trước khi phân phối.",
    icon: Package,
    gradient: "from-blue-500 to-cyan-600",
    href: "/module/txng/khai-bao/dong-goi",
    ready: false,
  },
];

export default function TxngKhaiBaoPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"nuoi-trong" | "trong-yeu">("trong-yeu");
  const [search, setSearch] = useState("");

  const filtered = EVENT_TYPES.filter((e) =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/module/txng")}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Truy xuất nguồn gốc
          </button>
        </div>

        <div>
          <div className="text-[12px] text-muted-foreground">Truy xuất nguồn gốc / Khai báo truy xuất</div>
          <h1 className="text-xl font-bold tracking-wide uppercase mt-0.5 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-600" />
            Khai báo truy xuất
          </h1>
        </div>

        <div className="border-b border-border flex gap-0">
          {[
            { key: "nuoi-trong", label: "Hoạt động nuôi trồng" },
            { key: "trong-yeu", label: "Sự kiện trọng yếu" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "nuoi-trong" | "trong-yeu")}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "nuoi-trong" && (
          <div className="py-16 text-center text-muted-foreground">
            <Factory className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có hoạt động nuôi trồng nào được cấu hình</p>
            <p className="text-xs mt-1 opacity-70">Liên hệ quản trị viên để thêm biểu mẫu hoạt động</p>
          </div>
        )}

        {tab === "trong-yeu" && (
          <div className="space-y-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập tên sự kiện..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ev) => {
                const Icon = ev.icon;
                return (
                  <div
                    key={ev.id}
                    className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`h-40 bg-gradient-to-br ${ev.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-16 h-16 text-white/70" strokeWidth={1} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[15px] text-foreground">{ev.label}</h3>
                        {!ev.ready && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Sắp ra mắt
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{ev.desc}</p>
                      <button
                        onClick={() => ev.ready && navigate(ev.href)}
                        disabled={!ev.ready}
                        className={`w-full h-8 rounded-lg border text-[13px] font-semibold transition-colors ${
                          ev.ready
                            ? "border-primary text-primary hover:bg-primary hover:text-white"
                            : "border-border text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                      >
                        {ev.ready ? "Khai Báo" : "Chưa khả dụng"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
