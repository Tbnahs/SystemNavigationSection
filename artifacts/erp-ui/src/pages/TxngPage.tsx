import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  ScanLine, QrCode, Link2, Award, ShieldCheck, Package,
  CalendarClock, Sprout, ClipboardList, MapPin, Search,
  Tag, FileBarChart, History, Users, Factory,
  CheckCircle2, ArrowRight, Clock, AlertCircle,
} from "lucide-react";

/* ── Stat card ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color = "text-blue-600", bg = "bg-blue-50" }: {
  icon: React.ElementType; label: string; value: string; sub: string;
  color?: string; bg?: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
        </div>
        <span className={`text-xs font-medium ${color}`}>{sub}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

/* ── Section label ─────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

/* ── Shortcut card ─────────────────────────────────────── */
function ShortcutCard({ icon: Icon, label, desc, href, color, onClick }: {
  icon: React.ElementType; label: string; desc: string;
  href: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 rounded-xl border bg-white hover:shadow-sm transition-all text-left group"
    >
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold text-foreground">{label}</div>
        <div className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">{desc}</div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

/* ── Section group ─────────────────────────────────────── */
function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2 px-0.5">
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

/* ── Recent activities ─────────────────────────────────── */
const ACTIVITIES = [
  { icon: QrCode,       ok: true,  text: "QR Code mới tạo cho sản phẩm Hồng trà L018104",   time: "10 phút trước" },
  { icon: CheckCircle2, ok: true,  text: "Xác nhận nguồn gốc lô VCC-2024-089 thành công",   time: "1 giờ trước" },
  { icon: Link2,        ok: true,  text: "Đối tác mới thêm vào chuỗi cung ứng",              time: "3 giờ trước" },
  { icon: Award,        ok: true,  text: "Chứng nhận OCOP gia hạn cho 5 sản phẩm",           time: "Hôm qua" },
  { icon: AlertCircle,  ok: false, text: "Lô BC003104 chưa có xác nhận truy xuất",           time: "Hôm qua" },
];

/* ══════════════════════════════════════════════════════════ */
export default function TxngPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const enterpriseName = user?.enterpriseName ?? "doanh nghiệp của bạn";

  function go(path: string) { navigate(path); }

  return (
    <AppLayout>
      <div className="space-y-7">

        {/* ── Header ─────────────────────────────────────── */}
        <div>
          <div className="text-[12px] text-muted-foreground">Truy xuất nguồn gốc / Tổng quan</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5 flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-blue-600" />
            Truy xuất nguồn gốc
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            QR code, chuỗi cung ứng, chứng nhận và quản lý tem cho {enterpriseName}.
          </p>
        </div>

        {/* ── Stats ──────────────────────────────────────── */}
        <section>
          <SectionLabel>🔍 Tổng quan hệ thống</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={QrCode}       label="QR Code đã tạo"               value="156"  sub="12 mới tuần này"   color="text-blue-600"  bg="bg-blue-50"  />
            <StatCard icon={CheckCircle2} label="Sản phẩm xác nhận nguồn gốc"  value="42"   sub="3 đang chờ duyệt" color="text-blue-600"  bg="bg-blue-50"  />
            <StatCard icon={Link2}        label="Chuỗi cung ứng hoạt động"     value="7"    sub="24 điểm liên kết" color="text-cyan-600"  bg="bg-cyan-50"  />
            <StatCard icon={Award}        label="Chứng nhận còn hiệu lực"      value="18"   sub="2 sắp hết hạn"    color="text-cyan-600"  bg="bg-cyan-50"  />
          </div>
        </section>

        {/* ── Function groups ────────────────────────────── */}
        <section className="space-y-5">
          <SectionLabel>Chức năng hệ thống</SectionLabel>

          <SectionGroup title="Quản trị doanh nghiệp">
            <ShortcutCard
              icon={Users} label="Quản lý nhân viên" desc="Nhân viên và phân quyền TXNG"
              href="/module/txng/nhan-vien" color="bg-blue-50 text-blue-700 border-blue-200"
              onClick={() => go("/module/txng/nhan-vien")}
            />
            <ShortcutCard
              icon={Factory} label="Quản lý cơ sở" desc="Cơ sở sản xuất và điểm thu mua"
              href="/module/txng/co-so" color="bg-blue-50 text-blue-700 border-blue-200"
              onClick={() => go("/module/txng/co-so")}
            />
          </SectionGroup>

          <SectionGroup title="Quản lý chứng chỉ">
            <ShortcutCard
              icon={ShieldCheck} label="Chứng chỉ DN" desc="Chứng chỉ của doanh nghiệp"
              href="/module/txng/chung-chi-dn" color="bg-violet-50 text-violet-700 border-violet-200"
              onClick={() => go("/module/txng/chung-chi-dn")}
            />
            <ShortcutCard
              icon={Award} label="Chứng chỉ thương phẩm" desc="Chứng nhận chất lượng sản phẩm"
              href="/module/txng/chung-chi-tp" color="bg-violet-50 text-violet-700 border-violet-200"
              onClick={() => go("/module/txng/chung-chi-tp")}
            />
          </SectionGroup>

          <SectionGroup title="Quản lý thương phẩm">
            <ShortcutCard
              icon={Package} label="Thương phẩm" desc="Sản phẩm và thông tin truy xuất"
              href="/module/txng/thuong-pham" color="bg-emerald-50 text-emerald-700 border-emerald-200"
              onClick={() => go("/module/txng/thuong-pham")}
            />
          </SectionGroup>

          <SectionGroup title="Quản lý sự kiện trọng yếu">
            <ShortcutCard
              icon={CalendarClock} label="Biểu mẫu sự kiện" desc="Danh sách sự kiện trong chuỗi"
              href="/module/txng/su-kien" color="bg-amber-50 text-amber-700 border-amber-200"
              onClick={() => go("/module/txng/su-kien")}
            />
          </SectionGroup>

          <SectionGroup title="Quản lý vùng nguyên liệu">
            <ShortcutCard
              icon={Sprout} label="Giống chè" desc="Các giống chè và nguồn gốc giống"
              href="/module/txng/giong-che" color="bg-green-50 text-green-700 border-green-200"
              onClick={() => go("/module/txng/giong-che")}
            />
            <ShortcutCard
              icon={ClipboardList} label="Biểu mẫu hoạt động" desc="Ghi nhận hoạt động vùng nguyên liệu"
              href="/module/txng/bieu-mau-hd" color="bg-green-50 text-green-700 border-green-200"
              onClick={() => go("/module/txng/bieu-mau-hd")}
            />
            <ShortcutCard
              icon={MapPin} label="Vùng nuôi trồng" desc="Bản đồ và thông tin vùng nguyên liệu"
              href="/module/txng/vung-nuoi-trong" color="bg-green-50 text-green-700 border-green-200"
              onClick={() => go("/module/txng/vung-nuoi-trong")}
            />
          </SectionGroup>

          <SectionGroup title="Truy xuất">
            <ShortcutCard
              icon={Search} label="Theo lô thương phẩm" desc="Tra cứu nguồn gốc theo lô"
              href="/module/txng/theo-lo" color="bg-sky-50 text-sky-700 border-sky-200"
              onClick={() => go("/module/txng/theo-lo")}
            />
          </SectionGroup>

          <SectionGroup title="Quản lý tem">
            <ShortcutCard
              icon={Tag} label="Quản lý tem" desc="Phát hành và kích hoạt tem"
              href="/module/txng/tem" color="bg-rose-50 text-rose-700 border-rose-200"
              onClick={() => go("/module/txng/tem")}
            />
            <ShortcutCard
              icon={FileBarChart} label="Báo cáo lượt quét" desc="Thống kê quét tem theo thời gian"
              href="/module/txng/bao-cao-tem" color="bg-rose-50 text-rose-700 border-rose-200"
              onClick={() => go("/module/txng/bao-cao-tem")}
            />
            <ShortcutCard
              icon={History} label="Lịch sử kích hoạt" desc="Lịch sử kích hoạt tem của khách"
              href="/module/txng/lich-su-tem" color="bg-rose-50 text-rose-700 border-rose-200"
              onClick={() => go("/module/txng/lich-su-tem")}
            />
          </SectionGroup>
        </section>

        {/* ── Recent activity ────────────────────────────── */}
        <section>
          <SectionLabel>Hoạt động gần đây</SectionLabel>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {ACTIVITIES.map((act, i) => {
              const Icon = act.icon;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${i < ACTIVITIES.length - 1 ? "border-b border-border" : ""}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${act.ok ? "text-blue-500" : "text-amber-500"}`} strokeWidth={1.5} />
                  <p className="flex-1 text-sm text-foreground">{act.text}</p>
                  <div className="shrink-0 flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs whitespace-nowrap">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
