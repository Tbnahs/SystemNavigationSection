import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import {
  BarChart3,
  ScanLine,
  Leaf,
  TrendingUp,
  ShoppingCart,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const modules = [
  {
    id: "erp",
    icon: BarChart3,
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-100",
    nameKey: "module.erp" as const,
    descKey: "module.erp.desc" as const,
    href: "/module/erp",
    badge: "9 chức năng",
  },
  {
    id: "txng",
    icon: ScanLine,
    gradient: "from-emerald-500 to-green-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    nameKey: "module.txng" as const,
    descKey: "module.txng.desc" as const,
    href: "/module/txng",
    badge: "6 chức năng",
  },
  {
    id: "farming",
    icon: Leaf,
    gradient: "from-lime-500 to-green-500",
    bgLight: "bg-lime-50",
    textColor: "text-lime-600",
    borderColor: "border-lime-100",
    nameKey: "module.farming" as const,
    descKey: "module.farming.desc" as const,
    href: "/module/farming",
    badge: "6 chức năng",
  },
];

const stats = [
  { icon: TrendingUp, label: "home.totalRevenue", value: "4.2 tỷ", change: "+12%", color: "text-green-600", bg: "bg-green-50" },
  { icon: ShoppingCart, label: "home.activeOrders", value: "1,247", change: "+5%", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: ScanLine, label: "home.tracedProducts", value: "8,392", change: "+23%", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Package, label: "home.farmingAreas", value: "342 ha", change: "+8%", color: "text-orange-600", bg: "bg-orange-50" },
];

const activities = [
  { icon: CheckCircle2, color: "text-green-500", text: "Lô hàng VCC-2024-089 đã được xác nhận truy xuất", time: "5 phút trước" },
  { icon: ScanLine, color: "text-blue-500", text: "QR Code mới tạo cho sản phẩm Xoài cát Hòa Lộc", time: "30 phút trước" },
  { icon: CheckCircle2, color: "text-green-500", text: "Vùng trồng B3 hoàn thành kiểm định chất lượng", time: "2 giờ trước" },
  { icon: AlertCircle, color: "text-amber-500", text: "Cảnh báo: Vùng A1 cần bổ sung phân bón", time: "3 giờ trước" },
  { icon: CheckCircle2, color: "text-green-500", text: "Đơn hàng #DH-20240401 đã giao thành công", time: "5 giờ trước" },
];

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const firstName = user?.name?.split(" ").pop() || "bạn";

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t("home.greeting")}, {firstName}
          </h1>
          <span className="text-2xl">👋</span>
        </div>
        <p className="text-muted-foreground text-sm">{t("home.subtitle")}</p>
      </div>

      {/* Quick stats */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {t("home.quickStats")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                data-testid={`card-stat-${stat.label}`}
                className="bg-card border border-card-border rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${stat.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(stat.label as any)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Modules */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {t("home.modules")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                data-testid={`card-module-${mod.id}`}
                onClick={() => setLocation(mod.href)}
                className={`group bg-card border ${mod.borderColor} rounded-2xl p-6 text-left hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">{t(mod.nameKey)}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t(mod.descKey)}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${mod.textColor} ${mod.bgLight} px-2.5 py-1 rounded-full`}>
                    {mod.badge}
                  </span>
                  <ArrowUpRight className={`w-4 h-4 ${mod.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {t("home.recentActivity")}
        </h2>
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div
                key={i}
                data-testid={`activity-item-${i}`}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-accent/50 transition-colors ${i < activities.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="mt-0.5 shrink-0">
                  <Icon className={`w-4.5 h-4.5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.text}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
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
