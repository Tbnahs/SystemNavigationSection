import "./_group.css";
import { useState } from "react";
import {
  ArrowLeft, Pencil, MoreHorizontal, Search, Plus, MapPin, Phone, Mail,
  Building2, Users, Package, Sprout, Leaf, Bell, Settings, LayoutGrid,
  Calendar, Hash, User as UserIcon, FileText, Download, ExternalLink,
  CheckCircle2, AlertCircle, Clock, Globe,
} from "lucide-react";

const MEMBERS = [
  { name: "Nguyễn Văn Hùng",   role: "Admin",     phone: "0987 123 456", email: "hung.nv@chequanchu.vn",  initials: "NH", color: "bg-emerald-500", status: "active",  lastSeen: "Đang online" },
  { name: "Hoàng Minh Tuấn",   role: "Quản lý",   phone: "0934 678 123", email: "tuan.hm@chequanchu.vn",  initials: "HT", color: "bg-teal-500",    status: "active",  lastSeen: "5 phút trước" },
  { name: "Đặng Thanh Hà",     role: "Kế toán",   phone: "0966 222 333", email: "ha.dt@chequanchu.vn",    initials: "ĐH", color: "bg-violet-500",  status: "active",  lastSeen: "1 giờ trước" },
  { name: "Lý Thị Hồng",       role: "Nhân viên", phone: "0977 444 555", email: "hong.lt@chequanchu.vn",  initials: "LH", color: "bg-rose-500",    status: "active",  lastSeen: "Hôm qua" },
  { name: "Bùi Quốc Bảo",      role: "Nhân viên", phone: "0988 666 777", email: "bao.bq@chequanchu.vn",   initials: "BB", color: "bg-blue-500",    status: "invited", lastSeen: "Chưa đăng nhập" },
  { name: "Trần Văn Khoa",     role: "Nhân viên", phone: "0901 888 999", email: "khoa.tv@chequanchu.vn",  initials: "TK", color: "bg-amber-500",   status: "active",  lastSeen: "Hôm nay" },
];

const ACTIVITY = [
  { time: "Hôm nay · 14:32", user: "Nguyễn Văn Hùng", action: "Cập nhật thông tin", detail: "Thay đổi địa chỉ doanh nghiệp", icon: Pencil, tone: "blue" },
  { time: "Hôm nay · 09:15", user: "Hoàng Minh Tuấn", action: "Thêm nhân viên mới", detail: "Trần Văn Khoa được thêm vào hệ thống", icon: Plus, tone: "emerald" },
  { time: "Hôm qua · 16:48", user: "Admin ESG",        action: "Kích hoạt phân hệ",   detail: "Bật phân hệ Vùng trồng cho doanh nghiệp", icon: CheckCircle2, tone: "emerald" },
  { time: "28/04 · 10:22",   user: "Nguyễn Văn Hùng", action: "Tải lên hồ sơ",       detail: "Upload Giấy phép kinh doanh.pdf", icon: FileText, tone: "amber" },
  { time: "26/04 · 08:05",   user: "Hệ thống",        action: "Tạo doanh nghiệp",    detail: "Doanh nghiệp được khởi tạo và phê duyệt", icon: Building2, tone: "blue" },
];

const TONES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

const ROLE_CLR: Record<string, string> = {
  Admin: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Quản lý": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Nhân viên": "bg-slate-50 text-slate-700 ring-slate-500/20",
  "Kế toán": "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function DoanhNghiepDetail() {
  const [tab, setTab] = useState<"overview" | "members" | "activity" | "documents">("overview");

  return (
    <div className="erp-root min-h-screen flex" style={{ background: "hsl(220 20% 96%)" }}>
      <Sidebar active="dn" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <div className="flex-1 overflow-auto">
          {/* Hero header */}
          <div className="bg-white border-b" style={{ borderColor: "hsl(220 13% 91%)" }}>
            <div className="px-8 pt-5 pb-0">
              <button className="text-[12.5px] text-slate-500 hover:text-slate-700 flex items-center gap-1.5 mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách doanh nghiệp
              </button>

              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold shadow-sm shrink-0">
                  CQ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Hợp tác xã Chè Quân Chu</h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" /> Đang hoạt động
                    </span>
                  </div>
                  <div className="text-[13.5px] text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> MST: <b className="text-slate-700 font-mono">4601234567</b></span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Xã Quân Chu, Đại Từ, Thái Nguyên</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Tham gia 26/04/2026</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-9 px-3 rounded-lg border text-[13px] font-medium flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>
                    <Globe className="w-4 h-4" /> Truy cập trang TXNG
                  </button>
                  <button className="h-9 px-3 rounded-lg border text-[13px] font-medium flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>
                    <Pencil className="w-4 h-4" /> Sửa hồ sơ
                  </button>
                  <button className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-5">
                {[
                  { k: "overview",  label: "Tổng quan" },
                  { k: "members",   label: "Nhân viên (24)" },
                  { k: "activity",  label: "Lịch sử thay đổi" },
                  { k: "documents", label: "Tài liệu" },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k as typeof tab)}
                    className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-px transition ${tab === t.k ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {tab === "overview" && (
              <div className="grid grid-cols-3 gap-5">
                {/* LEFT — main info */}
                <div className="col-span-2 space-y-5">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <MiniStat label="Nhân viên" value="24" tone="emerald" icon={Users} />
                    <MiniStat label="Lô sản phẩm" value="148" tone="blue" icon={Package} />
                    <MiniStat label="Vùng trồng" value="6" tone="amber" icon={Sprout} />
                    <MiniStat label="Đã quét QR" value="2.4K" tone="rose" icon={Globe} />
                  </div>

                  {/* Hồ sơ chung */}
                  <Card title="Hồ sơ chung" actionLabel="Sửa">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <Info label="Tên doanh nghiệp" value="Hợp tác xã Chè Quân Chu" />
                      <Info label="Tên hiển thị" value="Chè Quân Chu" />
                      <Info label="Mã số thuế" value="4601234567" mono />
                      <Info label="Tên đăng nhập" value="che-quan-chu" mono />
                      <Info label="Người đại diện" value="Nguyễn Văn Hùng" />
                      <Info label="SĐT doanh nghiệp" value="0987 123 456" icon={Phone} />
                    </div>
                  </Card>

                  {/* Vị trí địa lý */}
                  <Card title="Vị trí địa lý" actionLabel="Sửa">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
                      <Info label="Tỉnh / Thành phố" value="Thái Nguyên" />
                      <Info label="Xã / Phường" value="Xã Quân Chu" />
                      <div className="col-span-2">
                        <Info label="Địa chỉ chi tiết" value="Xóm Cây Hồng, Xã Quân Chu, Huyện Đại Từ, Tỉnh Thái Nguyên" icon={MapPin} />
                      </div>
                    </div>
                    <div
                      className="rounded-xl border h-44 flex items-center justify-center text-slate-400 text-sm relative overflow-hidden"
                      style={{
                        borderColor: "hsl(220 13% 91%)",
                        background:
                          "linear-gradient(120deg, hsl(142 30% 92%) 0%, hsl(160 40% 90%) 100%)",
                      }}
                    >
                      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 30% 60%, hsl(142 50% 60%) 0%, transparent 35%), radial-gradient(circle at 70% 40%, hsl(160 50% 60%) 0%, transparent 30%)" }} />
                      <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow text-emerald-700 text-[12.5px] font-medium">
                        <MapPin className="w-3.5 h-3.5" /> 21.5731° N, 105.7281° E
                      </div>
                    </div>
                  </Card>

                  {/* Phân hệ */}
                  <Card title="Phân hệ đang sử dụng" actionLabel="Quản lý">
                    <div className="grid grid-cols-3 gap-3">
                      <ModuleCard name="ERP" desc="Quản trị nguồn lực" icon={LayoutGrid} color="emerald" usage="Đang dùng · 24 user" />
                      <ModuleCard name="TXNG" desc="Truy xuất nguồn gốc" icon={Package} color="blue" usage="Đang dùng · 148 lô" />
                      <ModuleCard name="Vùng trồng" desc="Quản lý vùng nguyên liệu" icon={Sprout} color="amber" usage="Đang dùng · 6 vùng" />
                    </div>
                  </Card>
                </div>

                {/* RIGHT — sidebar info */}
                <div className="space-y-5">
                  <Card title="Liên hệ chính">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white text-[14px] font-semibold flex items-center justify-center">NH</div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800">Nguyễn Văn Hùng</div>
                        <div className="text-[12px] text-slate-500">Người đại diện · Admin</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" />0987 123 456</div>
                      <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" />hung.nv@chequanchu.vn</div>
                    </div>
                  </Card>

                  <Card title="Tài liệu pháp lý" actionLabel="Tải lên">
                    <div className="space-y-2">
                      {[
                        { name: "Giấy phép kinh doanh.pdf", size: "2.4 MB", date: "28/04/2026" },
                        { name: "Chứng nhận VietGAP.pdf",   size: "1.1 MB", date: "26/04/2026" },
                        { name: "Hợp đồng nguyên liệu.pdf", size: "850 KB", date: "20/04/2026" },
                      ].map((d) => (
                        <div key={d.name} className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-slate-50/60 transition" style={{ borderColor: "hsl(220 13% 93%)" }}>
                          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-slate-800 truncate">{d.name}</div>
                            <div className="text-[11.5px] text-slate-400">{d.size} · {d.date}</div>
                          </div>
                          <button className="p-1.5 text-slate-400 hover:text-slate-700"><Download className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card title="Trạng thái hệ thống">
                    <div className="space-y-3 text-[13px]">
                      <Status icon={CheckCircle2} tone="emerald" label="Hồ sơ đã được phê duyệt" sub="26/04/2026" />
                      <Status icon={CheckCircle2} tone="emerald" label="Đã xác minh MST" sub="Tự động qua API thuế" />
                      <Status icon={Clock}        tone="amber"   label="Chứng nhận VietGAP" sub="Hết hạn sau 84 ngày" />
                      <Status icon={AlertCircle}  tone="rose"    label="2 nhân viên chưa kích hoạt" sub="Cần nhắc lại email mời" />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {tab === "members" && (
              <Card title="Nhân viên thuộc doanh nghiệp" actionLabel="+ Thêm nhân viên">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Tìm theo tên, email, SĐT…" className="w-full h-10 pl-9 pr-3 rounded-lg border bg-white text-sm outline-none focus:border-emerald-500" style={{ borderColor: "hsl(220 13% 88%)" }} />
                  </div>
                  <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>Vai trò</button>
                  <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>Trạng thái</button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[12px] uppercase tracking-wider" style={{ color: "hsl(220 9% 46%)" }}>
                      <th className="px-3 py-2.5">Nhân viên</th>
                      <th className="px-3 py-2.5">Vai trò</th>
                      <th className="px-3 py-2.5">Liên hệ</th>
                      <th className="px-3 py-2.5">Trạng thái</th>
                      <th className="px-3 py-2.5">Hoạt động cuối</th>
                      <th className="px-3 py-2.5 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS.map((m) => (
                      <tr key={m.email} className="border-t hover:bg-emerald-50/30" style={{ borderColor: "hsl(220 13% 93%)" }}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center ${m.color}`}>{m.initials}</div>
                            <div className="font-medium text-slate-800">{m.name}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${ROLE_CLR[m.role]}`}>{m.role}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-[13px] text-slate-700">{m.email}</div>
                          <div className="text-[12px] text-slate-500">{m.phone}</div>
                        </td>
                        <td className="px-3 py-3">
                          {m.status === "active" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Hoạt động</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />Đã mời</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-[12.5px] text-slate-500">{m.lastSeen}</td>
                        <td className="px-3 py-3">
                          <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {tab === "activity" && (
              <Card title="Lịch sử thay đổi">
                <div className="space-y-0">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="flex gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "hsl(220 13% 93%)" }}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TONES[a.tone]}`}>
                        <a.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px]">
                          <span className="font-medium text-slate-800">{a.user}</span>
                          <span className="text-slate-500"> · {a.action}</span>
                        </div>
                        <div className="text-[12.5px] text-slate-500 mt-0.5">{a.detail}</div>
                      </div>
                      <div className="text-[11.5px] text-slate-400 shrink-0">{a.time}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "documents" && (
              <Card title="Tài liệu" actionLabel="+ Tải lên">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Giấy phép kinh doanh.pdf", size: "2.4 MB", date: "28/04/2026", color: "rose" },
                    { name: "Chứng nhận VietGAP.pdf",   size: "1.1 MB", date: "26/04/2026", color: "emerald" },
                    { name: "Hợp đồng nguyên liệu.pdf", size: "850 KB", date: "20/04/2026", color: "blue" },
                    { name: "Báo cáo SX Q1-2026.xlsx",  size: "320 KB", date: "15/04/2026", color: "emerald" },
                    { name: "Logo doanh nghiệp.png",     size: "180 KB", date: "10/04/2026", color: "violet" },
                    { name: "Hợp đồng nhân sự.pdf",      size: "640 KB", date: "05/04/2026", color: "amber" },
                  ].map((d) => (
                    <div key={d.name} className="border rounded-xl p-4 hover:bg-slate-50/60 cursor-pointer transition" style={{ borderColor: "hsl(220 13% 91%)" }}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-${d.color}-50 text-${d.color}-700`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-[13px] font-medium text-slate-800 truncate">{d.name}</div>
                      <div className="text-[11.5px] text-slate-400 mt-0.5">{d.size} · {d.date}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── helpers ───── */

function Sidebar({ active }: { active: string }) {
  const items = [
    { k: "dash", icon: LayoutGrid, label: "Tổng quan" },
    { k: "dn", icon: Building2, label: "Doanh nghiệp" },
    { k: "user", icon: Users, label: "Người dùng" },
    { k: "txng", icon: Package, label: "Truy xuất NG" },
    { k: "vt", icon: Sprout, label: "Vùng trồng" },
    { k: "set", icon: Settings, label: "Cài đặt" },
  ];
  return (
    <aside className="w-[230px] shrink-0 bg-white border-r flex flex-col" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div className="h-[64px] px-5 flex items-center gap-2.5 border-b" style={{ borderColor: "hsl(220 13% 91%)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(142 71% 38%)" }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-slate-800 leading-none">ESG Valley</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Quản trị hệ thống</div>
        </div>
      </div>
      <nav className="p-3 flex-1 space-y-0.5">
        {items.map((it) => (
          <button key={it.k} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition ${active === it.k ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
            <it.icon className="w-4 h-4" />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: "hsl(220 13% 91%)" }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[12px] font-semibold flex items-center justify-center">AD</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-slate-800 truncate">Admin ESG</div>
            <div className="text-[11px] text-slate-500 truncate">admin@esgvalley.vn</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <div className="h-[64px] px-8 border-b bg-white flex items-center justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div>
        <div className="text-[11.5px] text-slate-400 flex items-center gap-1.5">
          <span>Quản trị hệ thống</span><span className="mx-1">/</span>
          <span>Doanh nghiệp</span><span className="mx-1">/</span>
          <span className="text-slate-600">Hợp tác xã Chè Quân Chu</span>
        </div>
        <h1 className="text-[16px] font-semibold text-slate-800 leading-tight mt-0.5">Chi tiết doanh nghiệp</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-lg border flex items-center justify-center text-slate-500 hover:bg-slate-50 relative" style={{ borderColor: "hsl(220 13% 88%)" }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "emerald" | "blue" | "amber" | "rose"; icon: React.ComponentType<{ className?: string }> }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="bg-white border rounded-xl p-3.5 flex items-center gap-3" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[20px] font-bold text-slate-800 leading-tight">{value}</div>
        <div className="text-[11.5px] text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function Card({ title, actionLabel, children }: { title: string; actionLabel?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "hsl(220 13% 93%)" }}>
        <div className="text-[14px] font-semibold text-slate-800">{title}</div>
        {actionLabel && (
          <button className="text-[12.5px] font-medium text-emerald-700 hover:text-emerald-800">{actionLabel}</button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Info({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <div className="text-[11.5px] text-slate-500 mb-1">{label}</div>
      <div className={`text-[13.5px] text-slate-800 flex items-center gap-1.5 ${mono ? "font-mono" : ""}`}>
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {value}
      </div>
    </div>
  );
}

function ModuleCard({ name, desc, icon: Icon, color, usage }: { name: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: "emerald" | "blue" | "amber"; usage: string }) {
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  }[color];
  return (
    <div className={`border rounded-xl p-4 ${tones.border} ${tones.bg}/30`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${tones.bg} ${tones.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-semibold text-[14px] text-slate-800">{name}</div>
      <div className="text-[12px] text-slate-500 mb-2 leading-snug">{desc}</div>
      <div className={`text-[11.5px] font-medium ${tones.text}`}>{usage}</div>
    </div>
  );
}

function Status({ icon: Icon, tone, label, sub }: { icon: React.ComponentType<{ className?: string }>; tone: "emerald" | "amber" | "rose"; label: string; sub: string }) {
  const tones = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tones[tone]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-slate-800">{label}</div>
        <div className="text-[12px] text-slate-500">{sub}</div>
      </div>
    </div>
  );
}
