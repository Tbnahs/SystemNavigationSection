import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, BarChart3, Leaf, ScanLine, Settings, TrendingUp,
  ShoppingCart, Truck, Package, DollarSign, Users, Factory,
  UserCircle, FileBarChart, CheckSquare, BookOpen, ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImg from "@assets/Logo ESG.png";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const ERP_SUB_ITEMS = [
  { id: "sales",      icon: ShoppingCart, label: "Bán hàng" },
  { id: "purchase",   icon: Truck,        label: "Mua hàng" },
  { id: "inventory",  icon: Package,      label: "Kho hàng" },
  { id: "accounting", icon: DollarSign,   label: "Kế toán" },
  { id: "hr",         icon: Users,        label: "Nhân sự" },
  { id: "production", icon: Factory,      label: "Sản xuất" },
  { id: "quality",    icon: CheckSquare,  label: "QC - Chất lượng" },
  { id: "packaging",  icon: Package,      label: "Đóng gói" },
  { id: "farmers",    icon: Users,        label: "Hộ dân liên kết" },
  { id: "crm",        icon: UserCircle,   label: "Khách hàng" },
  { id: "quy-cach",   icon: BookOpen,     label: "Quy cách & Tiêu chuẩn" },
  { id: "reports",    icon: FileBarChart, label: "Báo cáo" },
  { id: "settings",   icon: Settings,     label: "Cài đặt" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const [location] = useLocation();

  const isOnErp = location === "/module/erp" || location.startsWith("/module/erp/");
  const [erpExpanded, setErpExpanded] = useState(isOnErp);

  useEffect(() => {
    if (isOnErp) setErpExpanded(true);
  }, [isOnErp]);

  const topItems = [
    { href: "/home",          icon: Home,      label: t("nav.home") },
    { href: "/module/txng",   icon: ScanLine,  label: t("nav.txng") },
    { href: "/module/farming",icon: Leaf,      label: t("nav.farming") },
    { href: "/reports",       icon: TrendingUp,label: t("nav.reports") },
    { href: "/settings",      icon: Settings,  label: t("nav.settings") },
  ];

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-border z-20 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo area */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="ESG VALLEY logo" className="w-9 h-9 object-contain" />
            <div>
              <p className="font-bold text-foreground text-sm">ESG VALLEY</p>
              <p className="text-xs text-muted-foreground">v2.0.1</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {/* Home */}
          <Link
            href="/home"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive("/home")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Home className={`w-4 h-4 shrink-0 ${isActive("/home") ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
            {t("nav.home")}
          </Link>

          {/* ERP — click label → navigate, click arrow → toggle sub-menu */}
          <div>
            <div className={`flex items-center rounded-xl text-sm font-medium transition-all ${isOnErp ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Link
                href="/module/erp"
                onClick={onClose}
                className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0"
              >
                <BarChart3 className={`w-4 h-4 shrink-0 ${isOnErp ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
                <span className="truncate">{t("nav.erp")}</span>
              </Link>
              <button
                onClick={() => setErpExpanded((v) => !v)}
                className="px-2 py-2.5 rounded-r-xl hover:bg-black/5 transition-colors shrink-0"
                title={erpExpanded ? "Thu gọn" : "Mở rộng"}
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${erpExpanded ? "rotate-180" : ""} ${isOnErp ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Sub-menu */}
            {erpExpanded && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
                {ERP_SUB_ITEMS.map(({ id, icon: Icon, label }) => {
                  const href = `/module/erp/${id}`;
                  const active = location === href;
                  return (
                    <Link
                      key={id}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Other top-level items */}
          {topItems.slice(1).map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              data-testid={`nav-${href.replace("/", "").replace("/", "-")}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive(href) ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </aside>
    </>
  );
}
