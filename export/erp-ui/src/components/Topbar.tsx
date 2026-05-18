import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Search, ChevronDown, Globe, User, Settings, LogOut, Menu, X, Building2, LayoutGrid, BarChart3, ScanLine, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageLabels } from "@/i18n/translations";

const MODULE_LIST = [
  { id: "portal",     icon: Globe,     label: "Portal",              labelShort: "Portal",   href: "/portal",           color: "text-violet-600", bg: "bg-violet-50" },
  { id: "erp",        icon: BarChart3, label: "ERP",                 labelShort: "ERP",      href: "/module/erp",        color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "txng",       icon: ScanLine,  label: "Truy xuất nguồn gốc", labelShort: "TXNG",     href: "/module/txng",       color: "text-blue-600",   bg: "bg-blue-50" },
  { id: "vung_trong", icon: Leaf,      label: "Vùng trồng & IoT",    labelShort: "Vùng trồng", href: "/module/vung-trong", color: "text-amber-600",  bg: "bg-amber-50" },
];

interface TopbarProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

const notifications = [
  { id: 1, title: "Lô hàng #2024-089 đã được xác nhận", time: "5 phút trước", unread: true },
  { id: 2, title: "QR Code mới được tạo cho sản phẩm VCC-001", time: "30 phút trước", unread: true },
  { id: 3, title: "Vùng trồng B3 đã hoàn thành kiểm định", time: "2 giờ trước", unread: false },
];

export default function Topbar({ onMenuToggle, menuOpen }: TopbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [location, setLocation] = useLocation();

  const unreadCount = notifications.filter((n) => n.unread).length;

  const userModules: string[] = user?.modules ?? ["portal"];
  const visibleModules = MODULE_LIST.filter((m) => {
    if (m.id === "vung_trong") return userModules.includes("vung_trong") || userModules.includes("iot");
    return userModules.includes(m.id);
  });

  const activeModule = MODULE_LIST.find((m) =>
    location === m.href || location.startsWith(m.href + "/")
  );

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        data-testid="button-menu-toggle"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Logo - visible on mobile */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <span className="font-semibold text-sm text-foreground">ESG VALLEY</span>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-testid="input-search"
            type="search"
            placeholder={t("topbar.search")}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 lg:flex-none" />

      {/* Module Switcher */}
      <div className="relative">
        <button
          data-testid="button-module-switcher"
          onClick={() => { setShowModules(!showModules); setShowNotif(false); setShowProfile(false); setShowLang(false); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm"
        >
          {activeModule ? (
            <>
              <div className={`w-5 h-5 rounded-md ${activeModule.bg} flex items-center justify-center shrink-0`}>
                <activeModule.icon className={`w-3 h-3 ${activeModule.color}`} strokeWidth={2} />
              </div>
              <span className="font-medium text-foreground hidden sm:inline max-w-[120px] truncate">{activeModule.labelShort}</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground hidden sm:inline">Chọn phân hệ</span>
            </>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${showModules ? "rotate-180" : ""}`} />
        </button>

        {showModules && (
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chuyển phân hệ</p>
            </div>
            <div className="py-1.5">
              {visibleModules.map((m) => {
                const Icon = m.icon;
                const isActive = location === m.href || location.startsWith(m.href + "/");
                return (
                  <button
                    key={m.id}
                    onClick={() => { setLocation(m.href); setShowModules(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-accent text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${m.color}`} strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-left">{m.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border px-2 py-1.5">
              <button
                onClick={() => { setLocation("/chon-phan-he"); setShowModules(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Xem tất cả phân hệ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Language */}
        <div className="relative">
          <button
            data-testid="button-lang"
            onClick={() => { setShowLang(!showLang); setShowNotif(false); setShowProfile(false); }}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">{languageLabels[language].flag}</span>
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
              {(Object.keys(languageLabels) as Language[]).map((lang) => (
                <button
                  key={lang}
                  data-testid={`button-topbar-lang-${lang}`}
                  onClick={() => { setLanguage(lang); setShowLang(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${language === lang ? "text-primary font-medium bg-accent/50" : "text-foreground"}`}
                >
                  <span>{languageLabels[lang].flag}</span>
                  <span>{languageLabels[lang].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            data-testid="button-notifications"
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); setShowLang(false); }}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{t("topbar.notifications")}</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{unreadCount} mới</span>
                )}
              </div>
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors ${n.unread ? "bg-primary/5" : ""}`}>
                    <div className="flex items-start gap-3">
                      {n.unread && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      {!n.unread && <div className="w-2 h-2 mt-1.5 shrink-0" />}
                      <div>
                        <p className={`text-sm ${n.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-1">
          <button
            data-testid="button-profile"
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowLang(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-semibold">{user?.avatar}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {user?.enterpriseName && (
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11.5px] font-medium text-emerald-700 truncate">{user.enterpriseName}</span>
                  </div>
                )}
              </div>
              <div className="py-1">
                {[
                  { icon: User, label: t("topbar.profile"), testId: "button-profile-link", href: "/ho-so" },
                  { icon: Settings, label: t("topbar.settings"), testId: "button-settings-link", href: null },
                ].map(({ icon: Icon, label, testId, href }) => (
                  <button
                    key={label}
                    data-testid={testId}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    onClick={() => { setShowProfile(false); if (href) setLocation(href); }}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {label}
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    data-testid="button-logout"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("topbar.logout")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
