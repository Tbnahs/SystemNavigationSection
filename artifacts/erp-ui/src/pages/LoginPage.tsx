import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageLabels } from "@/i18n/translations";
import { Leaf, Eye, EyeOff, Globe, ChevronDown } from "lucide-react";
import logoImg from "@assets/Logo ESG.png";
import teaHillImg from "@assets/stock_images/thai_nguyen_tea_hill.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@agrierp.vn");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      setLocation("/home");
    } else {
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col items-end justify-end">
        {/* Tea hill background image */}
        <img
          src={teaHillImg}
          alt="Đồi chè cổ thụ Thái Nguyên"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Caption */}
        <div className="relative z-10 p-8 text-white">
          <p className="text-sm font-medium opacity-80">Chè cổ thụ Thái Nguyên</p>
          <p className="text-xs opacity-60 mt-0.5">Vùng trồng được quản lý & truy xuất nguồn gốc</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Language Switcher */}
        <div className="flex justify-end p-6">
          <div className="relative">
            <button
              data-testid="button-lang-switcher"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-4 h-4" />
              <span>{languageLabels[language].flag}</span>
              <span className="hidden sm:inline">{languageLabels[language].label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                {(Object.keys(languageLabels) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    data-testid={`button-lang-${lang}`}
                    onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${language === lang ? "text-primary font-medium bg-accent/50" : "text-foreground"}`}
                  >
                    <span>{languageLabels[lang].flag}</span>
                    <span>{languageLabels[lang].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-foreground">ESG VELLAY</span>
            </div>

            <div className="mb-8">
              <img src={logoImg} alt="ESG VELLAY logo" className="w-16 h-16 object-contain mb-5" />
              <h2 className="text-2xl font-bold text-foreground mb-1">{t("login.title")}</h2>
              <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                  {t("login.email")}
                </label>
                <input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground" htmlFor="password">
                    {t("login.password")}
                  </label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    {t("login.forgotPassword")}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("login.passwordPlaceholder")}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    data-testid="button-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                data-testid="button-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {t("login.submit")}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("login.noAccount")}{" "}
              <button className="text-primary font-medium hover:underline">
                {t("login.signUp")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
