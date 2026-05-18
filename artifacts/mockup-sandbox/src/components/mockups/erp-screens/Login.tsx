import "./_group.css";
import { useState } from "react";
import { Eye, EyeOff, Globe, ChevronDown, Leaf, ShieldCheck } from "lucide-react";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@chequanchu.vn");
  const [password, setPassword] = useState("••••••••");

  return (
    <div className="erp-root min-h-screen flex">
      {/* LEFT — Brand panel with tea hill */}
      <div
        className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(15,72,40,0.55) 0%, rgba(20,140,80,0.35) 60%, rgba(0,0,0,0.55) 100%), url('https://images.unsplash.com/photo-1566404791232-af9fe7d96b4f?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 p-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
            <Leaf className="w-6 h-6" style={{ color: "hsl(142 71% 35%)" }} />
          </div>
          <div className="text-white">
            <div className="text-base font-semibold leading-tight">Chè Quân Chu</div>
            <div className="text-xs text-white/75">ESG Valley · Thái Nguyên</div>
          </div>
        </div>

        <div className="relative z-10 p-10 text-white max-w-md">
          <h1 className="text-3xl font-bold leading-snug mb-3">
            Hệ thống Truy xuất<br />nguồn gốc Chè Quân Chu
          </h1>
          <p className="text-sm text-white/85 leading-relaxed mb-6">
            Nền tảng quản lý ERP, truy xuất nguồn gốc và vùng trồng tích hợp
            toàn diện cho hợp tác xã & doanh nghiệp chè.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <ShieldCheck className="w-4 h-4" />
            <span>Bảo mật theo tiêu chuẩn ISO 27001</span>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-8 text-[11px] text-white/60">
          © 2026 ESG Valley. All rights reserved.
        </div>
      </div>

      {/* RIGHT — Form */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: "hsl(220 20% 98%)" }}
      >
        {/* Top: language switcher */}
        <div className="flex justify-end px-8 py-6">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm hover:bg-slate-50 transition"
            style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}
          >
            <Globe className="w-4 h-4" />
            <span>🇻🇳</span>
            <span className="hidden sm:inline">Tiếng Việt</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(142 71% 45%)" }}
              >
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="text-base font-semibold">Chè Quân Chu</div>
            </div>

            <h2 className="text-[28px] font-bold mb-1.5" style={{ color: "hsl(220 13% 13%)" }}>
              Đăng nhập
            </h2>
            <p className="text-sm mb-8" style={{ color: "hsl(220 9% 46%)" }}>
              Chào mừng quay lại! Vui lòng đăng nhập để tiếp tục.
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "hsl(220 13% 25%)" }}>
                  Email / Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border bg-white text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  style={{ borderColor: "hsl(220 13% 88%)" }}
                  placeholder="ten@congty.vn"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium" style={{ color: "hsl(220 13% 25%)" }}>
                    Mật khẩu
                  </label>
                  <a href="#" className="text-[12.5px] font-medium" style={{ color: "hsl(142 71% 38%)" }}>
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-lg border bg-white text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    style={{ borderColor: "hsl(220 13% 88%)" }}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 select-none cursor-pointer text-[13px]" style={{ color: "hsl(220 9% 46%)" }}>
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-emerald-600" defaultChecked />
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>

              <button
                type="submit"
                className="w-full h-11 rounded-lg text-white font-semibold text-sm shadow-sm transition hover:brightness-110"
                style={{ background: "hsl(142 71% 38%)" }}
              >
                Đăng nhập
              </button>

              <div className="flex items-center gap-3 my-1.5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400">hoặc</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                type="button"
                className="w-full h-11 rounded-lg border bg-white font-medium text-sm flex items-center justify-center gap-2.5 transition hover:bg-slate-50"
                style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Đăng nhập với Google
              </button>
            </form>

            <p className="text-center text-[12.5px] mt-8" style={{ color: "hsl(220 9% 46%)" }}>
              Cần hỗ trợ? Liên hệ{" "}
              <a href="#" className="font-medium" style={{ color: "hsl(142 71% 38%)" }}>
                support@esgvalley.vn
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
