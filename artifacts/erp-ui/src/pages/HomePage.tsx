import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useERP } from "@/contexts/ERPContext";
import AppLayout from "@/components/AppLayout";
import {
  BarChart3,
  ScanLine,
  Leaf,
  TrendingUp,
  ShoppingCart,
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const modules = [
  {
    id: "erp",
    icon: BarChart3,
    nameKey: "module.erp" as const,
    descKey: "module.erp.desc" as const,
    href: "/module/erp",
    count: "13",
  },
  {
    id: "txng",
    icon: ScanLine,
    nameKey: "module.txng" as const,
    descKey: "module.txng.desc" as const,
    href: "/module/txng",
    count: "6",
  },
  {
    id: "farming",
    icon: Leaf,
    nameKey: "module.farming" as const,
    descKey: "module.farming.desc" as const,
    href: "/module/farming",
    count: "10",
  },
];


const activities = [
  { icon: CheckCircle2, ok: true, text: "Lô hàng VCC-2024-089 đã được xác nhận truy xuất", time: "5 phút trước" },
  { icon: ScanLine, ok: true, text: "QR Code mới tạo cho sản phẩm Xoài cát Hòa Lộc", time: "30 phút trước" },
  { icon: CheckCircle2, ok: true, text: "Vùng trồng B3 hoàn thành kiểm định chất lượng", time: "2 giờ trước" },
  { icon: AlertCircle, ok: false, text: "Cảnh báo: Vùng A1 cần bổ sung phân bón", time: "3 giờ trước" },
  { icon: CheckCircle2, ok: true, text: "Đơn hàng #DH-20240401 đã giao thành công", time: "5 giờ trước" },
];

function fmtCur(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN") + " đ";
}

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { summary } = useERP();

  const firstName = user?.name?.split(" ").pop() || "bạn";

  const stats = [
    { icon: TrendingUp,  label: "home.totalRevenue",    value: fmtCur(summary.totalSalesRevenue),       change: `${summary.completedSales} đơn HT` },
    { icon: ShoppingCart,label: "home.activeOrders",    value: String(summary.totalSalesOrders),        change: `${summary.activePOs} PO đang xử lý` },
    { icon: Package,     label: "home.tracedProducts",  value: `${summary.totalPurchaseKg.toFixed(0)} kg`, change: `${summary.totalProductionBatches} lô SX` },
    { icon: ScanLine,    label: "home.farmingAreas",    value: `${summary.pendingPackaging} lô ĐG`,     change: `${summary.totalSalesOrders} đơn bán` },
  ];

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t("home.greeting")}, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm">{t("home.subtitle")}</p>
      </div>

      {/* Quick stats */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("home.quickStats")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                data-testid={`card-stat-${stat.label}`}
                className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-primary">{stat.change}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(stat.label as any)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Modules */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("home.modules")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                data-testid={`card-module-${mod.id}`}
                onClick={() => setLocation(mod.href)}
                className="group bg-white border border-border rounded-xl p-5 text-left hover:border-primary/40 hover:shadow-sm active:scale-[0.99] transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {mod.count} chức năng
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{t(mod.nameKey)}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t(mod.descKey)}</p>
                <div className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Xem chi tiết <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("home.recentActivity")}
        </h2>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div
                key={i}
                data-testid={`activity-item-${i}`}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${i < activities.length - 1 ? "border-b border-border" : ""}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${activity.ok ? "text-primary" : "text-amber-500"}`} strokeWidth={1.5} />
                <p className="flex-1 text-sm text-foreground">{activity.text}</p>
                <div className="shrink-0 flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
