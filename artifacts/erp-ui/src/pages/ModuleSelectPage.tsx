import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";
import { useState } from "react";
import {
  Globe, BarChart3, ScanLine, Leaf, ArrowRight, LogOut, ChevronDown,
} from "lucide-react";
import logoImg from "@assets/Logo ESG.png";

export default function ModuleSelectPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const ALL_MODULES = [
    {
      id: "portal",
      icon: Globe,
      label: t("module.portal"),
      desc: t("module.portal.desc"),
      href: "/portal",
      gradient: "from-violet-500 to-purple-600",
      gradientLight: "from-violet-50 to-purple-50",
      border: "border-violet-200 hover:border-violet-400",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      badge: "bg-violet-100 text-violet-700",
      features: t("ms.portal.features").split(","),
    },
    {
      id: "erp",
      icon: BarChart3,
      label: t("module.erp"),
      desc: t("module.erp.desc"),
      href: "/module/erp",
      gradient: "from-emerald-500 to-green-600",
      gradientLight: "from-emerald-50 to-green-50",
      border: "border-emerald-200 hover:border-emerald-400",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      badge: "bg-emerald-100 text-emerald-700",
      features: t("ms.erp.features").split(","),
    },
    {
      id: "txng",
      icon: ScanLine,
      label: t("module.txng"),
      desc: t("module.txng.desc"),
      href: "/module/txng",
      gradient: "from-blue-500 to-cyan-600",
      gradientLight: "from-blue-50 to-cyan-50",
      border: "border-blue-200 hover:border-blue-400",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      badge: "bg-blue-100 text-blue-700",
      features: t("ms.txng.features").split(","),
    },
    {
      id: "vung_trong",
      icon: Leaf,
      label: t("module.farming"),
      desc: t("module.farming.desc"),
      href: "/module/vung-trong",
      gradient: "from-amber-500 to-orange-500",
      gradientLight: "from-amber-50 to-orange-50",
      border: "border-amber-200 hover:border-amber-400",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      badge: "bg-amber-100 text-amber-700",
      features: t("ms.vung-trong.features").split(","),
    },
  ];

  const userModules: string[] = user?.modules ?? ["portal"];
  const visibleModules = ALL_MODULES.filter((m) => {
    if (m.id === "vung_trong") return userModules.includes("vung_trong") || userModules.includes("iot");
    return userModules.includes(m.id);
  });

  const firstName = user?.name?.split(" ").pop() || "bạn";

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="ESG VALLEY" className="w-9 h-9 object-contain" />
          <div>
            <p className="font-bold text-foreground text-sm leading-tight">ESG VALLEY</p>
            <p className="text-[10px] text-muted-foreground leading-tight">v2.0.1</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors border border-border"
            >
              <span>{languageLabels[language].flag}</span>
              <span className="hidden sm:inline">{languageLabels[language].label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-20">
                  {(Object.keys(languageLabels) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${language === lang ? "text-primary font-medium bg-accent/50" : "text-foreground"}`}
                    >
                      <span>{languageLabels[lang].flag}</span>
                      <span>{languageLabels[lang].label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted/60">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{user?.avatar}</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-foreground leading-tight">{user?.name}</p>
              <p className="text-[10.5px] text-muted-foreground leading-tight">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("topbar.logout")}</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Greeting */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("ms.welcome")}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            {t("ms.hello")}, <span className="text-primary">{firstName}</span>!
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            {t("ms.subtitle")}
          </p>
        </div>

        {/* Module cards */}
        <div
          className={`w-full max-w-5xl grid gap-5 ${
            visibleModules.length === 1
              ? "grid-cols-1 max-w-sm"
              : visibleModules.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
              : visibleModules.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {visibleModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setLocation(mod.href)}
                className={`group relative bg-white border-2 ${mod.border} rounded-2xl p-6 text-left hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden`}
              >
                {/* Gradient top bar */}
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${mod.gradient}`} />

                {/* Subtle gradient bg on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradientLight} opacity-0 group-hover:opacity-60 transition-opacity duration-200`} />

                <div className="relative">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${mod.iconBg} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Name */}
                  <h2 className="font-bold text-foreground text-lg mb-1.5 leading-tight">{mod.label}</h2>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{mod.desc}</p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {mod.features.map((f) => (
                      <span key={f} className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${mod.badge}`}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:gap-2.5 transition-all duration-150">
                    {t("ms.enter")}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-muted-foreground text-center">
          {t("ms.footer")}{" "}
          <span className="text-primary cursor-pointer hover:underline" onClick={() => setLocation("/portal")}>
            {t("ms.contact-admin")}
          </span>{" "}
          {t("ms.footer-end")}
        </p>
      </main>
    </div>
  );
}
