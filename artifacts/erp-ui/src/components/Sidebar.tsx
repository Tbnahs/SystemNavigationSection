import { useLocation, Link } from "wouter";
import { Home, BarChart3, Leaf, ScanLine, Settings, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const [location] = useLocation();

  const navItems = [
    { href: "/home", icon: Home, label: t("nav.home") },
    { href: "/module/erp", icon: BarChart3, label: t("nav.erp") },
    { href: "/module/txng", icon: ScanLine, label: t("nav.txng") },
    { href: "/module/farming", icon: Leaf, label: t("nav.farming") },
    { href: "/reports", icon: TrendingUp, label: t("nav.reports") },
    { href: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

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
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">ESG VALLEY</p>
              <p className="text-xs text-muted-foreground">v2.0.1</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
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
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive(href) ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
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
