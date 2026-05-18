import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, Users, Building2, Scale, Factory, LayoutGrid, Globe, ChevronDown,
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
  location: string; subBase?: string; color?: string;
}) {
  const subBase = subBaseProp ?? href;
  const activeColor = color ?? "text-primary bg-primary/10";
  const iconActive = color ? color.split(" ")[0] : "text-primary";
  return (
    <div>
      <div className={`flex items-center rounded-xl text-sm font-medium transition-all ${isActive ? activeColor : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
        <Link href={href} onClick={onNavigate} className="flex items-center gap-3 flex-1 px-3 py-2.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? iconActive : "text-muted-foreground"}`} strokeWidth={1.5} />
          <span className="truncate">{label}</span>
        </Link>
        <button onClick={onToggle} className="px-2 py-2.5 rounded-r-xl hover:bg-black/5 transition-colors shrink-0">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${isActive ? iconActive : "text-muted-foreground"}`} strokeWidth={2} />
        </button>
      </div>
      {expanded && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
          {subItems.map((item, idx) => {
            if (item.type === "divider") {
              return <p key={`div-${idx}`} className="px-2 pt-3 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">{item.label}</p>;
            }
            const subHref = item.id ? `${subBase}/${item.id}` : subBase;
            const active = item.id ? location === subHref : location === subBase;
            const SubIcon = item.icon;
            return (
              <Link key={item.id ?? idx} href={subHref} onClick={onNavigate}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
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
  const { user } = useAuth();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(true);

  const isSuperAdmin = !user?.enterpriseId;
  const portalSubItems = isSuperAdmin
    ? PORTAL_SUB_ITEMS.filter(item => item.type === "divider" || (item as { id?: string }).id !== "co-so")
    : PORTAL_SUB_ITEMS.filter(item => item.type === "divider" || (item as { id?: string }).id !== "doanh-nghiep");

  useEffect(() => {
    if (location.startsWith("/portal")) setExpanded(true);
  }, [location]);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-border z-20 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="ESG VALLEY" className="w-9 h-9 object-contain" />
            <div>
              <p className="font-bold text-foreground text-sm">ESG VALLEY</p>
              <p className="text-xs text-muted-foreground">Portal v1.0</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link href="/home" onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive("/home") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Home className={`w-4 h-4 shrink-0 ${isActive("/home") ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
            {t("nav.home")}
          </Link>
          <ExpandableNavItem
            href="/portal" subBase="/portal" icon={Globe}
            label={isSuperAdmin ? "Portal" : "Quản trị hệ thống"}
            expanded={expanded}
            onToggle={() => setExpanded(v => !v)}
            onNavigate={onClose}
            isActive={isActive("/portal")}
            subItems={portalSubItems}
            location={location}
            color="text-violet-700 bg-violet-50"
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
