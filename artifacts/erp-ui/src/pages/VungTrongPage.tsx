import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Leaf, MapPin, Sprout, Scissors, FlaskConical, CloudSun,
  ClipboardCheck, Cpu, Activity, Wifi, Server,
  Users, TrendingUp, BarChart3, Award, Droplets, Wind,
  ArrowRight, AlertTriangle, CheckCircle2, Clock, Zap,
} from "lucide-react";

const ESG_SCORES = {
  e: { score: 72, label: "Môi trường", color: "text-emerald-600", bg: "bg-emerald-500", items: [
    { label: "CO₂ giảm so với baseline", value: "18%", icon: Wind, good: true },
    { label: "Nước tưới tiết kiệm", value: "12 m³/tháng/ha", icon: Droplets, good: true },
    { label: "Vùng không sử dụng thuốc hóa học", value: "3/4 vùng", icon: Leaf, good: true },
  ]},
  s: { score: 85, label: "Xã hội", color: "text-blue-600", bg: "bg-blue-500", items: [
    { label: "Nông hộ liên kết", value: "26 hộ", icon: Users, good: true },
    { label: "Lao động tham gia", value: "48 người", icon: Users, good: true },
    { label: "Tỷ lệ hộ đạt tiêu chuẩn", value: "88%", icon: CheckCircle2, good: true },
  ]},
  g: { score: 68, label: "Quản trị", color: "text-violet-600", bg: "bg-violet-500", items: [
    { label: "Chứng nhận hữu cơ", value: "VietGAP, OCOP 4⭐", icon: Award, good: true },
    { label: "Sắp hết hạn chứng nhận", value: "2 chứng chỉ", icon: AlertTriangle, good: false },
    { label: "Tỷ lệ tuân thủ canh tác", value: "91%", icon: ClipboardCheck, good: true },
  ]},
};

const ZONES = [
  { id: 1, name: "Nà Hồng",   soHo: 10, dienTich: 7.2,  sanLuongNam: 2840, trangThai: "active",   giong: "Shan Tuyết cổ thụ",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: 2, name: "Nà Bay",    soHo: 13, dienTich: 11.4, sanLuongNam: 2985, trangThai: "active",   giong: "Shan Tuyết Bằng Phúc", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 3, name: "Bản Chang", soHo: 3,  dienTich: 2.8,  sanLuongNam: 507,  trangThai: "active",   giong: "Kim Tuyên",             color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: 4, name: "Khu mới",   soHo: 0,  dienTich: 1.5,  sanLuongNam: 0,    trangThai: "inactive", giong: "Đang khảo sát",         color: "bg-gray-100 text-gray-600 border-gray-200" },
];

const RECENT_ACTIVITIES = [
  { icon: Scissors,    ok: true,  text: "Thu hoạch 48 kg chè Shan Tuyết – Nà Bay (3 hộ)",          time: "2 giờ trước" },
  { icon: FlaskConical,ok: false, text: "Phun thuốc BVTV tại Nà Hồng – chờ kiểm tra PHI",          time: "Hôm qua" },
  { icon: Leaf,        ok: true,  text: "Bón phân hữu cơ định kỳ – Bản Chang (12 hộ hoàn thành)",  time: "2 ngày trước" },
  { icon: Activity,    ok: true,  text: "Cảm biến độ ẩm #03 cập nhật – Nà Bay: 68%, bình thường",  time: "3 giờ trước" },
  { icon: ClipboardCheck, ok: true, text: "Kiểm tra định kỳ VietGAP hoàn thành – đạt 91/100 điểm", time: "4 ngày trước" },
];

const SUB_CARDS = [
  { id: "zones",       icon: MapPin,         label: "Vùng trồng",           desc: "CRUD vùng trồng, diện tích, GPS",      color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "crops",       icon: Sprout,         label: "Giống chè",            desc: "Danh mục giống, liên kết thương phẩm", color: "bg-green-50 text-green-700 border-green-200" },
  { id: "pesticides",  icon: FlaskConical,   label: "Hoạt động canh tác",   desc: "Bón phân, phun thuốc, chăm sóc",      color: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "harvest",     icon: Scissors,       label: "Thu hoạch",            desc: "Ghi nhận sản lượng thu hoạch",         color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "weather",     icon: CloudSun,       label: "Thời tiết & ESG",      desc: "Dữ liệu khí hậu, chỉ số môi trường",  color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "inspection",  icon: ClipboardCheck, label: "Kiểm tra & Giám sát",  desc: "Kiểm tra VietGAP, tuân thủ canh tác", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { id: "iot/devices", icon: Server,         label: "Thiết bị IoT",         desc: "Quản lý cảm biến, thiết bị đo",       color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "iot/monitor", icon: Activity,       label: "Giám sát IoT",         desc: "Dashboard cảm biến real-time",         color: "bg-teal-50 text-teal-700 border-teal-200" },
];

function EsgGauge({ score, label, color, bg }: { score: number; label: string; color: string; bg: string }) {
  const dash = 2 * Math.PI * 36;
  const offset = dash - (score / 100) * dash;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor"
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={dash} strokeDashoffset={offset}
            className={color} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className="text-[13px] font-semibold text-foreground">{label}</span>
    </div>
  );
}

export default function VungTrongPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const enterpriseName = user?.enterpriseName ?? "doanh nghiệp";

  const totalHo = ZONES.filter(z => z.trangThai === "active").reduce((s, z) => s + z.soHo, 0);
  const totalDienTich = ZONES.filter(z => z.trangThai === "active").reduce((s, z) => s + z.dienTich, 0);
  const totalSanLuong = ZONES.filter(z => z.trangThai === "active").reduce((s, z) => s + z.sanLuongNam, 0);
  const activeZones = ZONES.filter(z => z.trangThai === "active").length;

  return (
    <AppLayout>
      <div className="space-y-7">

        {/* Header */}
        <div>
          <div className="text-[12px] text-muted-foreground">Vùng trồng / Tổng quan</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-amber-600" />
            Quản lý Vùng trồng
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            ESG, bản đồ canh tác và thu hoạch cho {enterpriseName}.
          </p>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: MapPin,    label: "Vùng trồng hoạt động", value: `${activeZones} vùng`,         sub: `${ZONES.length} tổng`, color: "text-amber-600 bg-amber-50" },
            { icon: Leaf,      label: "Tổng diện tích",        value: `${totalDienTich.toFixed(1)} ha`, sub: "diện tích canh tác", color: "text-emerald-600 bg-emerald-50" },
            { icon: Users,     label: "Hộ liên kết",           value: `${totalHo} hộ`,               sub: "đang tham gia",     color: "text-blue-600 bg-blue-50" },
            { icon: TrendingUp,label: "Sản lượng ước tính",    value: `${totalSanLuong.toLocaleString("vi-VN")} kg`,sub: "dự kiến năm nay", color: "text-violet-600 bg-violet-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-base font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ESG Section */}
        <section className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Chỉ số ESG tổng thể
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Đánh giá kỳ Q2/2026 · Cập nhật 08/06/2026</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
              Tổng điểm: 75/100
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {(["e", "s", "g"] as const).map(key => {
              const data = ESG_SCORES[key];
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <EsgGauge score={data.score} label={data.label} color={data.color} bg={data.bg} />
                    <div className="flex-1 space-y-2">
                      {data.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${item.good ? "bg-emerald-50" : "bg-amber-50"}`}>
                            <item.icon className={`w-3 h-3 ${item.good ? "text-emerald-600" : "text-amber-600"}`} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground leading-tight">{item.label}</p>
                            <p className={`text-[12px] font-semibold ${item.good ? "text-foreground" : "text-amber-700"}`}>{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Zones overview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Các vùng trồng</h2>
            <button onClick={() => navigate("/module/vung-trong/zones")} className="text-xs text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ZONES.map(z => (
              <button key={z.id} onClick={() => navigate("/module/vung-trong/zones")}
                className="text-left bg-white border border-border rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all group">
                <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2 border ${z.color}`}>
                  {z.name}
                </div>
                <p className="text-xs text-muted-foreground">{z.giong}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Diện tích</span>
                    <span className="font-semibold">{z.dienTich} ha</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Nông hộ</span>
                    <span className="font-semibold">{z.soHo} hộ</span>
                  </div>
                  {z.sanLuongNam > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sản lượng</span>
                      <span className="font-semibold text-emerald-700">{z.sanLuongNam.toLocaleString("vi-VN")} kg</span>
                    </div>
                  )}
                  {z.trangThai === "inactive" && (
                    <span className="text-[10px] text-amber-600 font-medium">Đang khảo sát</span>
                  )}
                </div>
                <ArrowRight className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 mt-2 transition-opacity" />
              </button>
            ))}
          </div>
        </section>

        {/* Submodule shortcuts */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Chức năng</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUB_CARDS.map(card => (
              <button key={card.id}
                onClick={() => navigate(`/module/vung-trong/${card.id}`)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border bg-white hover:shadow-sm transition-all text-left group">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-foreground">{card.label}</div>
                  <div className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">{card.desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Hoạt động gần đây</h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {RECENT_ACTIVITIES.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${i < RECENT_ACTIVITIES.length - 1 ? "border-b border-border" : ""}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${act.ok ? "bg-emerald-50" : "bg-amber-50"}`}>
                    <Icon className={`w-3.5 h-3.5 ${act.ok ? "text-emerald-600" : "text-amber-600"}`} strokeWidth={1.5} />
                  </div>
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
