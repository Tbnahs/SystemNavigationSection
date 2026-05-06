import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, BarChart3, Leaf, ScanLine, Settings,
  ShoppingCart, Package, Users, Factory,
  FileBarChart, BookOpen, ChevronDown,
  QrCode, Link2, Award, Layers, GitBranch, Search,
  MapPin, Sprout, FlaskConical, Scissors, CloudSun, ClipboardCheck,
  Building2, ShieldCheck, Scale, ShoppingBasket, LayoutGrid,
  Cpu, Wifi, Activity, Server, Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImg from "@assets/Logo ESG.png";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavItem =
  | { type?: "item"; id: string; icon: React.ElementType; label: string }
  | { type: "divider"; label: string };

const ERP_SUB_ITEMS: NavItem[] = [
  { type: "divider", label: "Thu mua" },
  { id: "thu-mua",  icon: ShoppingBasket, label: "Đơn thu mua" },

  { type: "divider", label: "Sản xuất" },
  { id: "production", icon: Factory,      label: "Lệnh sản xuất" },

  { type: "divider", label: "Đóng gói" },
  { id: "packaging",  icon: Package,      label: "Lô đóng gói" },

  { type: "divider", label: "Bán hàng" },
  { id: "sales",    icon: ShoppingCart,   label: "Đơn hàng" },

  { type: "divider", label: "Báo cáo" },
  { id: "reports",  icon: FileBarChart,   label: "Báo cáo" },

  { type: "divider", label: "Danh mục" },
  { id: "thuong-pham", icon: Package,     label: "Thương phẩm" },
  { id: "quy-cach",    icon: BookOpen,    label: "Quy cách & Tiêu chuẩn" },
];

const TXNG_SUB_ITEMS: NavItem[] = [
  { id: "qrcode",        icon: QrCode,        label: "Mã QR" },
  { id: "batch",         icon: Layers,        label: "Lô hàng" },
  { id: "supplychain",   icon: Link2,         label: "Chuỗi cung ứng" },
  { id: "certification", icon: Award,         label: "Chứng nhận" },
  { id: "timeline",      icon: GitBranch,     label: "Lịch sử lô" },
  { id: "audit",         icon: Search,        label: "Tra cứu / Kiểm toán" },
];

const VUNG_TRONG_SUB_ITEMS: NavItem[] = [
  { id: "zones",      icon: MapPin,         label: "Vùng trồng" },
  { id: "crops",      icon: Sprout,         label: "Cây trồng" },
  { id: "pesticides", icon: FlaskConical,   label: "Thuốc BVTV" },
  { id: "harvest",    icon: Scissors,       label: "Thu hoạch" },
  { id: "weather",    icon: CloudSun,       label: "Thời tiết" },
  { id: "inspection", icon: ClipboardCheck, label: "Kiểm định" },
  { type: "divider",  label: "Thiết bị IoT" },
  { id: "iot/devices",  icon: Server,   label: "Thiết bị" },
  { id: "iot/sensors",  icon: Activity, label: "Cảm biến" },
  { id: "iot/connect",  icon: Wifi,     label: "Kết nối" },
  { id: "iot/monitor",  icon: Cpu,      label: "Giám sát" },
];

const PORTAL_SUB_ITEMS: NavItem[] = [
  { id: "",             icon: LayoutGrid, label: "Tổng quan" },
  { type: "divider", label: "Tài khoản" },
  { id: "doanh-nghiep", icon: Building2,  label: "Doanh nghiệp" },
  { id: "nguoi-dung",   icon: Users,      label: "Người dùng" },
  { type: "divider", label: "Danh mục" },
  { id: "don-vi-tinh",  icon: Scale,      label: "Đơn vị tính" },
  { id: "co-so",        icon: Factory,    label: "Cơ sở" },
];

function ExpandableNavItem({
  href, icon: Icon, label, expanded, onToggle, onNavigate,
  isActive, subItems, location, subBase: subBaseProp, color,
}: {
  href: string; icon: React.ElementType; label: string;
  expanded: boolean; onToggle: () => void; onNavigate: () => void;
  isActive: boolean; subItems: NavItem[];
  location: string;
  subBase?: string;
  color?: string;
}) {
  const subBase = subBaseProp ?? href;
  const activeColor = color ?? "text-primary bg-primary/10";
  const iconActive = color ? color.split(" ")[0] : "text-primary";
  return (
    <div>
      <div className={`flex items-center rounded-xl text-sm font-medium transition-all ${isActive ? activeColor : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
        <Link
          href={href}
          onClick={onNavigate}
          className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0"
        >
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? iconActive : "text-muted-foreground"}`} strokeWidth={1.5} />
          <span className="truncate">{label}</span>
        </Link>
        <button
          onClick={onToggle}
          className="px-2 py-2.5 rounded-r-xl hover:bg-black/5 transition-colors shrink-0"
          title={expanded ? "Thu gọn" : "Mở rộng"}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${isActive ? iconActive : "text-muted-foreground"}`}
            strokeWidth={2}
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
          {subItems.map((item, idx) => {
            if (item.type === "divider") {
              return (
                <p key={`div-${idx}`} className="px-2 pt-3 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                  {item.label}
                </p>
              );
            }
            const subHref = item.id ? `${subBase}/${item.id}` : subBase;
            const active = item.id ? location === subHref : (location === subBase);
            const SubIcon = item.icon;
            return (
              <Link
                key={item.id ?? idx}
                href={subHref}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MODULE_CONFIG = [
  {
    key: "portal",
    href: "/portal",
    subBase: "/portal",
    icon: Globe,
    label: "Portal",
    subItems: PORTAL_SUB_ITEMS,
    color: "text-violet-700 bg-violet-50",
    iconColor: "text-violet-700",
    pathPrefix: "/portal",
  },
  {
    key: "erp",
    href: "/module/erp",
    subBase: "/module/erp",
    icon: BarChart3,
    label: "ERP",
    subItems: ERP_SUB_ITEMS,
    color: "text-primary bg-primary/10",
    iconColor: "text-primary",
    pathPrefix: "/module/erp",
  },
  {
    key: "txng",
    href: "/module/txng",
    subBase: "/module/txng",
    icon: ScanLine,
    label: "Truy xuất nguồn gốc",
    subItems: TXNG_SUB_ITEMS,
    color: "text-blue-700 bg-blue-50",
    iconColor: "text-blue-700",
    pathPrefix: "/module/txng",
  },
  {
    key: "vung_trong",
    href: "/module/vung-trong",
    subBase: "/module/vung-trong",
    icon: Leaf,
    label: "Vùng trồng",
    subItems: VUNG_TRONG_SUB_ITEMS,
    color: "text-amber-700 bg-amber-50",
    iconColor: "text-amber-700",
    pathPrefix: "/module/vung-trong",
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  const isSuperAdmin = !user?.enterpriseId;
  const userModules: string[] = user?.modules ?? ["portal", "erp", "txng", "vung_trong", "iot"];

  const portalSubItems = isSuperAdmin
    ? PORTAL_SUB_ITEMS
    : PORTAL_SUB_ITEMS.filter(item => item.type === "divider" || (item as { id?: string }).id !== "doanh-nghiep");

  const visibleModules = MODULE_CONFIG.map(m => {
    if (m.key === "portal") return {
      ...m,
      label: isSuperAdmin ? "Portal" : "Quản trị hệ thống",
      subItems: portalSubItems,
    };
    return m;
  }).filter(m => {
    if (m.key === "vung_trong") return userModules.includes("vung_trong") || userModules.includes("iot");
    return userModules.includes(m.key);
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    for (const m of MODULE_CONFIG) {
      if (location === m.pathPrefix || location.startsWith(m.pathPrefix + "/")) {
        setExpanded(prev => ({ ...prev, [m.key]: true }));
      }
    }
  }, [location]);

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-border z-20 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="ESG VALLEY logo" className="w-9 h-9 object-contain" />
            <div>
              <p className="font-bold text-foreground text-sm">ESG VALLEY</p>
              <p className="text-xs text-muted-foreground">v2.0.1</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link
            href="/home"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive("/home") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Home className={`w-4 h-4 shrink-0 ${isActive("/home") ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
            {t("nav.home")}
          </Link>

          {visibleModules.map(m => (
            <ExpandableNavItem
              key={m.key}
              href={m.href}
              subBase={m.subBase}
              icon={m.icon}
              label={m.label}
              expanded={!!expanded[m.key]}
              onToggle={() => setExpanded(prev => ({ ...prev, [m.key]: !prev[m.key] }))}
              onNavigate={onClose}
              isActive={isActive(m.pathPrefix)}
              subItems={m.subItems}
              location={location}
              color={m.color}
            />
          ))}
        </nav>

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
