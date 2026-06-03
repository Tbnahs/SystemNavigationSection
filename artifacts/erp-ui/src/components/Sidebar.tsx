import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, BarChart3, Leaf, ScanLine, Settings,
  ShoppingCart, Package, Users, Factory,
  FileBarChart, BookOpen, ChevronDown, ChevronLeft, ChevronRight,
  QrCode, Link2, Award, Layers, GitBranch, Search,
  MapPin, Sprout, FlaskConical, Scissors, CloudSun, ClipboardCheck,
  Building2, ShieldCheck, Scale, ShoppingBasket, LayoutGrid,
  Cpu, Wifi, Activity, Server, Globe,
  CalendarClock, History, Tag, ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";
import logoImg from "@assets/Logo ESG.png";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onCollapse?: () => void;
}

type NavItem =
  | { type?: "item"; id: string; icon: React.ElementType; labelKey: TranslationKey }
  | { type: "divider"; labelKey: TranslationKey };

const ERP_SUB_ITEMS: NavItem[] = [
  { type: "divider", labelKey: "nav.div.thu-mua" },
  { id: "thu-mua",     icon: ShoppingBasket, labelKey: "submodule.erp.thu-mua" },

  { type: "divider", labelKey: "nav.div.san-xuat" },
  { id: "production",  icon: Factory,        labelKey: "submodule.erp.production" },

  { type: "divider", labelKey: "nav.div.dong-goi" },
  { id: "packaging",   icon: Package,        labelKey: "submodule.erp.packaging" },

  { type: "divider", labelKey: "nav.div.ban-hang" },
  { id: "sales",       icon: ShoppingCart,   labelKey: "submodule.erp.sales" },

  { type: "divider", labelKey: "nav.div.bao-cao" },
  { id: "reports",     icon: FileBarChart,   labelKey: "submodule.erp.reports" },

  { type: "divider", labelKey: "nav.div.danh-muc" },
  { id: "thuong-pham", icon: Package,        labelKey: "submodule.erp.thuong-pham" },
  { id: "quy-cach",    icon: BookOpen,       labelKey: "submodule.erp.quy-cach" },
  { id: "giong-che",   icon: Sprout,         labelKey: "submodule.erp.giong-che" },
  { id: "co-so",       icon: Factory,        labelKey: "submodule.erp.co-so" },
];

const TXNG_SUB_ITEMS: NavItem[] = [
  { type: "divider", labelKey: "nav.div.quan-tri-dn" },
  { id: "nhan-vien",       icon: Users,       labelKey: "nav.txng.staff" },
  { id: "co-so",           icon: Factory,     labelKey: "nav.portal.co-so" },

  { type: "divider", labelKey: "nav.div.chung-chi" },
  { id: "chung-chi-dn",    icon: ShieldCheck, labelKey: "nav.txng.chung-chi-dn" },
  { id: "chung-chi-tp",    icon: Award,       labelKey: "nav.txng.chung-chi-tp" },

  { type: "divider", labelKey: "nav.div.quan-ly-tp" },
  { id: "thuong-pham",     icon: Package,     labelKey: "submodule.erp.thuong-pham" },

  { type: "divider", labelKey: "nav.div.su-kien" },
  { id: "su-kien",         icon: CalendarClock, labelKey: "nav.txng.su-kien" },

  { type: "divider", labelKey: "nav.div.vung-nl" },
  { id: "giong-che",       icon: Sprout,      labelKey: "submodule.erp.giong-che" },
  { id: "bieu-mau-hd",     icon: ClipboardList, labelKey: "nav.txng.bieu-mau-hd" },
  { id: "vung-nuoi-trong", icon: MapPin,      labelKey: "nav.txng.vung-nuoi-trong" },

  { type: "divider", labelKey: "nav.div.truy-xuat" },
  { id: "theo-lo",         icon: Search,      labelKey: "nav.txng.theo-lo" },

  { type: "divider", labelKey: "nav.div.quan-ly-tem" },
  { id: "tem",             icon: Tag,         labelKey: "nav.txng.tem" },
  { id: "bao-cao-tem",     icon: FileBarChart,labelKey: "nav.txng.bao-cao-tem" },
  { id: "lich-su-tem",     icon: History,     labelKey: "nav.txng.lich-su-tem" },
];

const VUNG_TRONG_SUB_ITEMS: NavItem[] = [
  { id: "zones",       icon: MapPin,         labelKey: "nav.vt.zones" },
  { id: "crops",       icon: Sprout,         labelKey: "nav.vt.crops" },
  { id: "pesticides",  icon: FlaskConical,   labelKey: "nav.vt.pesticides" },
  { id: "harvest",     icon: Scissors,       labelKey: "nav.vt.harvest" },
  { id: "weather",     icon: CloudSun,       labelKey: "nav.vt.weather" },
  { id: "inspection",  icon: ClipboardCheck, labelKey: "nav.vt.inspection" },
  { type: "divider",   labelKey: "nav.div.thiet-bi-iot" },
  { id: "iot/devices", icon: Server,         labelKey: "nav.iot.devices" },
  { id: "iot/sensors", icon: Activity,       labelKey: "submodule.iot.sensors" },
  { id: "iot/connect", icon: Wifi,           labelKey: "nav.iot.connect" },
  { id: "iot/monitor", icon: Cpu,            labelKey: "nav.iot.monitor" },
];

const PORTAL_SUB_ITEMS: NavItem[] = [
  { id: "",             icon: LayoutGrid, labelKey: "nav.portal.overview" },
  { type: "divider",    labelKey: "nav.div.quan-tri-dn" },
  { id: "doanh-nghiep", icon: Building2,  labelKey: "nav.portal.enterprise" },
  { id: "nguoi-dung",   icon: Users,      labelKey: "nav.portal.users" },
  { type: "divider",    labelKey: "nav.div.danh-muc" },
  { id: "don-vi-tinh",  icon: Scale,      labelKey: "nav.portal.units" },
  { id: "co-so",        icon: Factory,    labelKey: "nav.portal.co-so" },
];

const MODULE_CONFIG = [
  {
    key: "portal",
    href: "/portal",
    subBase: "/portal",
    icon: Globe,
    labelKey: "nav.erp" as TranslationKey,
    subItems: PORTAL_SUB_ITEMS,
    color: "text-violet-700 bg-violet-50",
    pathPrefix: "/portal",
  },
  {
    key: "erp",
    href: "/module/erp",
    subBase: "/module/erp",
    icon: BarChart3,
    labelKey: "nav.erp" as TranslationKey,
    subItems: ERP_SUB_ITEMS,
    color: "text-primary bg-primary/10",
    pathPrefix: "/module/erp",
  },
  {
    key: "txng",
    href: "/module/txng",
    subBase: "/module/txng",
    icon: ScanLine,
    labelKey: "nav.module.txng" as TranslationKey,
    subItems: TXNG_SUB_ITEMS,
    color: "text-blue-700 bg-blue-50",
    pathPrefix: "/module/txng",
  },
  {
    key: "vung_trong",
    href: "/module/vung-trong",
    subBase: "/module/vung-trong",
    icon: Leaf,
    labelKey: "nav.module.vung-trong" as TranslationKey,
    subItems: VUNG_TRONG_SUB_ITEMS,
    color: "text-amber-700 bg-amber-50",
    pathPrefix: "/module/vung-trong",
  },
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
  const { t } = useLanguage();
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
          title={expanded ? t("submodule.back") : "Mở rộng"}
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
                  {t(item.labelKey)}
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
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose, collapsed = false, onCollapse }: SidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();

  const isSuperAdmin = !user?.enterpriseId;
  const userModules: string[] = user?.modules ?? ["portal"];

  const portalSubItems = isSuperAdmin
    ? PORTAL_SUB_ITEMS.filter(item => item.type === "divider" || (item as { id?: string }).id !== "co-so")
    : PORTAL_SUB_ITEMS.filter(item => item.type === "divider" || (item as { id?: string }).id !== "doanh-nghiep");

  const visibleModules = MODULE_CONFIG.map(m => {
    if (m.key === "portal") return {
      ...m,
      label: isSuperAdmin ? "Portal" : t("nav.module.portal.admin"),
      subItems: portalSubItems,
    };
    return { ...m, label: m.key === "erp" ? "ERP" : t(m.labelKey) };
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

  const desktopVisible = !collapsed;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-border z-20 flex flex-col transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}
        ${desktopVisible ? "lg:translate-x-0" : "lg:-translate-x-full"}
      `}>
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

        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">{t("nav.system.status")}</span>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Thu gọn menu"
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {collapsed && onCollapse && (
        <button
          onClick={onCollapse}
          title="Mở rộng menu"
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-5 h-10 bg-white border border-l-0 border-border rounded-r-lg shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </>
  );
}
