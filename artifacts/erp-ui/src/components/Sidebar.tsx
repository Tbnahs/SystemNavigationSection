import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, BarChart3, Leaf, ScanLine, Settings,
  ShoppingCart, Truck, Package, DollarSign, Users, Factory,
  UserCircle, FileBarChart, CheckSquare, BookOpen, ChevronDown,
  QrCode, Link2, Award, Layers, GitBranch, Search,
  MapPin, Sprout, FlaskConical, Scissors, CloudSun, ClipboardCheck,
  Building2, ShieldCheck, Scale, ShoppingBasket, ClipboardList,
} from "lucide-react";
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
  { id: "co-so",    icon: Users,          label: "Hộ liên kết" },
  { id: "thu-mua",  icon: ShoppingBasket, label: "Đơn thu mua" },

  { type: "divider", label: "Sản xuất" },
  { id: "production", icon: Factory,       label: "Lệnh sản xuất" },

  { type: "divider", label: "Đóng gói" },
  { id: "packaging",  icon: Package,       label: "Lô đóng gói" },

  { type: "divider", label: "Cấu hình" },
  { id: "thuong-pham",  icon: Package,   label: "Thương phẩm" },
  { id: "don-vi-tinh",  icon: Scale,     label: "Đơn vị tính" },
  { id: "quy-cach",     icon: BookOpen,  label: "Quy cách & Tiêu chuẩn" },
];

const TXNG_SUB_ITEMS: NavItem[] = [
  { id: "qrcode",        icon: QrCode,        label: "Mã QR" },
  { id: "supplychain",   icon: Link2,         label: "Chuỗi cung ứng" },
  { id: "certification", icon: Award,         label: "Chứng nhận" },
  { id: "batch",         icon: Layers,        label: "Lô hàng" },
  { id: "timeline",      icon: GitBranch,     label: "Lịch sử" },
  { id: "audit",         icon: Search,        label: "Kiểm toán" },
];

const FARMING_SUB_ITEMS: NavItem[] = [
  { id: "zones",      icon: MapPin,         label: "Vùng trồng" },
  { id: "crops",      icon: Sprout,         label: "Cây trồng" },
  { id: "pesticides", icon: FlaskConical,   label: "Thuốc BVTV" },
  { id: "harvest",    icon: Scissors,       label: "Thu hoạch" },
  { id: "weather",    icon: CloudSun,       label: "Thời tiết" },
  { id: "inspection", icon: ClipboardCheck, label: "Kiểm định" },
];

const ADMIN_SUB_ITEMS: NavItem[] = [
  { id: "doanh-nghiep", icon: Building2, label: "Doanh nghiệp" },
  { id: "nguoi-dung",   icon: Users,     label: "Người dùng" },
];

function ExpandableNavItem({
  href, icon: Icon, label, expanded, onToggle, onNavigate,
  isActive, subItems, location, subBase: subBaseProp,
}: {
  href: string; icon: React.ElementType; label: string;
  expanded: boolean; onToggle: () => void; onNavigate: () => void;
  isActive: boolean; subItems: NavItem[];
  location: string;
  subBase?: string;
}) {
  const subBase = subBaseProp ?? href;
  return (
    <div>
      <div className={`flex items-center rounded-xl text-sm font-medium transition-all ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
        <Link
          href={href}
          onClick={onNavigate}
          className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0"
        >
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
          <span className="truncate">{label}</span>
        </Link>
        <button
          onClick={onToggle}
          className="px-2 py-2.5 rounded-r-xl hover:bg-black/5 transition-colors shrink-0"
          title={expanded ? "Thu gọn" : "Mở rộng"}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
            const subHref = `${subBase}/${item.id}`;
            const active = location === subHref;
            const SubIcon = item.icon;
            return (
              <Link
                key={item.id}
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

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const [location] = useLocation();

  const isOnErp     = location === "/module/erp"     || location.startsWith("/module/erp/");
  const isOnTxng    = location === "/module/txng"    || location.startsWith("/module/txng/");
  const isOnFarming = location === "/module/farming" || location.startsWith("/module/farming/");
  const isOnAdmin   = location.startsWith("/quan-tri/");

  const [erpExpanded,     setErpExpanded]     = useState(isOnErp);
  const [txngExpanded,    setTxngExpanded]    = useState(isOnTxng);
  const [farmingExpanded, setFarmingExpanded] = useState(isOnFarming);
  const [adminExpanded,   setAdminExpanded]   = useState(isOnAdmin);

  useEffect(() => { if (isOnErp)     setErpExpanded(true);     }, [isOnErp]);
  useEffect(() => { if (isOnTxng)    setTxngExpanded(true);    }, [isOnTxng]);
  useEffect(() => { if (isOnFarming) setFarmingExpanded(true); }, [isOnFarming]);
  useEffect(() => { if (isOnAdmin)   setAdminExpanded(true);   }, [isOnAdmin]);

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

          <ExpandableNavItem
            href="/module/erp"
            icon={BarChart3}
            label={t("nav.erp")}
            expanded={erpExpanded}
            onToggle={() => setErpExpanded(v => !v)}
            onNavigate={onClose}
            isActive={isOnErp}
            subItems={ERP_SUB_ITEMS}
            location={location}
          />

          <ExpandableNavItem
            href="/module/txng"
            icon={ScanLine}
            label={t("nav.txng")}
            expanded={txngExpanded}
            onToggle={() => setTxngExpanded(v => !v)}
            onNavigate={onClose}
            isActive={isOnTxng}
            subItems={TXNG_SUB_ITEMS}
            location={location}
          />

          <ExpandableNavItem
            href="/module/farming"
            icon={Leaf}
            label={t("nav.farming")}
            expanded={farmingExpanded}
            onToggle={() => setFarmingExpanded(v => !v)}
            onNavigate={onClose}
            isActive={isOnFarming}
            subItems={FARMING_SUB_ITEMS}
            location={location}
          />

          <ExpandableNavItem
            href="/quan-tri/doanh-nghiep"
            subBase="/quan-tri"
            icon={ShieldCheck}
            label="Quản trị hệ thống"
            expanded={adminExpanded}
            onToggle={() => setAdminExpanded(v => !v)}
            onNavigate={onClose}
            isActive={isOnAdmin}
            subItems={ADMIN_SUB_ITEMS}
            location={location}
          />
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
