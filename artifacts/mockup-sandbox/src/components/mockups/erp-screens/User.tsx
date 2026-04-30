import "./_group.css";
import { useState } from "react";
import {
  Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, X, Upload,
  Building2, Users, Package, Sprout, Leaf, Bell, Settings, LayoutGrid,
  Pencil, Mail, Phone, ArrowLeft, ArrowRight, Shield, Eye,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dn: string;
  dnColor: string;
  role: "Admin" | "Quản lý" | "Nhân viên" | "Kế toán";
  modules: string[];
  status: "active" | "invited" | "locked";
  initials: string;
  avatarColor: string;
  lastSeen: string;
};

const USERS: User[] = [
  { id: "1", name: "Nguyễn Văn Hùng", email: "hung.nv@chequanchu.vn", phone: "0987 123 456", dn: "Chè Quân Chu", dnColor: "bg-emerald-100 text-emerald-700", role: "Admin", modules: ["ERP", "TXNG", "VT"], status: "active", initials: "NH", avatarColor: "bg-emerald-500", lastSeen: "Đang hoạt động" },
  { id: "2", name: "Trần Thị Mai", email: "mai.tt@tancuongxanh.vn", phone: "0912 345 678", dn: "Tân Cương Xanh", dnColor: "bg-blue-100 text-blue-700", role: "Quản lý", modules: ["ERP", "TXNG"], status: "active", initials: "TM", avatarColor: "bg-blue-500", lastSeen: "5 phút trước" },
  { id: "3", name: "Lê Quốc Anh", email: "anh.lq@labangorganic.vn", phone: "0903 567 890", dn: "La Bằng Organic", dnColor: "bg-amber-100 text-amber-700", role: "Nhân viên", modules: ["TXNG", "VT"], status: "invited", initials: "LA", avatarColor: "bg-amber-500", lastSeen: "Chưa đăng nhập" },
  { id: "4", name: "Phạm Hồng Sơn", email: "son.ph@phucvinh.vn", phone: "0978 234 567", dn: "Phúc Vinh Tea", dnColor: "bg-purple-100 text-purple-700", role: "Kế toán", modules: ["ERP"], status: "active", initials: "PS", avatarColor: "bg-purple-500", lastSeen: "1 giờ trước" },
  { id: "5", name: "Hoàng Minh Tuấn", email: "tuan.hm@chequanchu.vn", phone: "0934 678 123", dn: "Chè Quân Chu", dnColor: "bg-emerald-100 text-emerald-700", role: "Nhân viên", modules: ["ERP", "VT"], status: "active", initials: "HT", avatarColor: "bg-teal-500", lastSeen: "Hôm qua" },
  { id: "6", name: "Vũ Thị Lan", email: "lan.vt@songcautea.vn", phone: "0945 789 012", dn: "Sông Cầu Tea", dnColor: "bg-teal-100 text-teal-700", role: "Quản lý", modules: ["ERP", "TXNG"], status: "locked", initials: "VL", avatarColor: "bg-rose-500", lastSeen: "12/04/2026" },
];

const STATUS: Record<User["status"], { text: string; cls: string; dot: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  invited: { text: "Đã mời", cls: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
};

const ROLE_CLR: Record<User["role"], string> = {
  Admin: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Quản lý": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Nhân viên": "bg-slate-50 text-slate-700 ring-slate-500/20",
  "Kế toán": "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function User() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <div className="erp-root min-h-screen flex" style={{ background: "hsl(220 20% 96%)" }}>
      <Sidebar active="user" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Quản lý Nhân viên" crumb={["Quản trị hệ thống", "Người dùng"]} />

        <div className="flex-1 px-8 py-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Stat label="Tổng nhân viên" value="124" delta="+8 trong tuần" tone="emerald" icon={Users} />
            <Stat label="Đang hoạt động" value="118" delta="95% tổng" tone="blue" icon={Shield} />
            <Stat label="Đã mời, chờ kích hoạt" value="4" delta="Cần nhắc lại" tone="amber" icon={Mail} />
            <Stat label="Tạm khóa" value="2" delta="-1 tuần này" tone="rose" icon={X} />
          </div>

          {/* Toolbar */}
          <div className="bg-white border rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap" style={{ borderColor: "hsl(220 13% 91%)" }}>
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Tìm theo tên, email, SĐT…"
                className="w-full h-10 pl-9 pr-3 rounded-lg border bg-white text-sm outline-none focus:border-emerald-500"
                style={{ borderColor: "hsl(220 13% 88%)" }}
              />
            </div>
            <SelectChip label="Doanh nghiệp" />
            <SelectChip label="Vai trò" />
            <SelectChip label="Trạng thái" />
            <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
              <Filter className="w-4 h-4" /> Bộ lọc
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="h-10 px-4 rounded-lg text-white text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
              style={{ background: "hsl(142 71% 38%)" }}
            >
              <Plus className="w-4 h-4" /> Thêm nhân viên
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "hsl(220 13% 91%)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider" style={{ color: "hsl(220 9% 46%)", background: "hsl(220 20% 98%)" }}>
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-emerald-600" /></th>
                  <th className="px-3 py-3">Nhân viên</th>
                  <th className="px-3 py-3">Liên hệ</th>
                  <th className="px-3 py-3">Doanh nghiệp</th>
                  <th className="px-3 py-3">Vai trò</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Hoạt động cuối</th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u, idx) => (
                  <tr key={u.id} className={`border-t hover:bg-emerald-50/30 ${idx === 0 ? "bg-emerald-50/40" : ""}`} style={{ borderColor: "hsl(220 13% 93%)" }}>
                    <td className="px-4 py-3"><input type="checkbox" className="accent-emerald-600" defaultChecked={idx === 0} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center ${u.avatarColor}`}>{u.initials}</div>
                        <div>
                          <div className="font-medium text-slate-800">{u.name}</div>
                          <div className="text-[11.5px] text-slate-400">ID: USR-{1000 + Number(u.id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[13px] text-slate-700"><Mail className="w-3.5 h-3.5 text-slate-400" />{u.email}</div>
                      <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 mt-0.5"><Phone className="w-3 h-3 text-slate-400" />{u.phone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ${u.dnColor}`}>{u.dn}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${ROLE_CLR[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${STATUS[u.status].cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS[u.status].dot}`} />
                        {STATUS[u.status].text}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-slate-500">{u.lastSeen}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-slate-500">
                        <button className="p-1.5 rounded hover:bg-slate-100"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t text-[13px] text-slate-500" style={{ borderColor: "hsl(220 13% 93%)" }}>
              <div>Hiển thị 1–6 trong tổng số 124 nhân viên</div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)" }}><ArrowLeft className="w-4 h-4" /></button>
                {[1, 2, 3, "…", 21].map((p, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "text-white font-semibold" : "hover:bg-slate-50 border"}`} style={p === 1 ? { background: "hsl(142 71% 38%)" } : { borderColor: "hsl(220 13% 88%)" }}>{p}</button>
                ))}
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)" }}><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
              <div>
                <div className="text-[18px] font-semibold text-slate-800">Thêm nhân viên mới</div>
                <div className="text-[12.5px] text-slate-500">Tạo tài khoản và gửi lời mời qua email.</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              {/* Avatar */}
              <div>
                <Label>Ảnh đại diện</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white text-[18px] font-semibold flex items-center justify-center">NV</div>
                  <button className="h-9 px-3 rounded-lg border text-[13px] font-medium flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>
                    <Upload className="w-4 h-4" /> Tải ảnh lên
                  </button>
                </div>
              </div>

              <Field label="Họ và tên" required value="Nguyễn Văn A" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại" required value="0987 123 456" placeholder="09xx xxx xxx" />
                <Field label="Email" value="" placeholder="ten@congty.vn" />
              </div>

              <Select label="Doanh nghiệp" value="Chè Quân Chu" />

              <div className="grid grid-cols-2 gap-4">
                <Select label="Vai trò" value="Nhân viên" />
                <Select label="Phòng ban" value="Sản xuất" />
              </div>

              {/* Module access */}
              <div>
                <Label>Quyền truy cập phân hệ</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "ERP", icon: LayoutGrid, color: "emerald", on: true },
                    { name: "TXNG", icon: Package, color: "blue", on: true },
                    { name: "Vùng trồng", icon: Sprout, color: "amber", on: false },
                  ].map((m) => (
                    <ModuleChip key={m.name} {...m} />
                  ))}
                </div>
              </div>

              {/* Invite */}
              <div className="rounded-xl border bg-emerald-50/40 p-3 flex items-start gap-3" style={{ borderColor: "hsl(142 30% 80%)" }}>
                <input type="checkbox" defaultChecked className="mt-1 accent-emerald-600" />
                <div className="text-[13px] text-slate-700">
                  <div className="font-medium">Gửi email mời kích hoạt tài khoản</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Nhân viên sẽ nhận được email kèm liên kết đặt mật khẩu lần đầu.</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-end gap-2 bg-slate-50/60" style={{ borderColor: "hsl(220 13% 91%)" }}>
              <button className="h-10 px-4 rounded-lg border text-[13.5px] font-medium hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>Hủy</button>
              <button className="h-10 px-5 rounded-lg text-white text-[13.5px] font-semibold shadow-sm hover:brightness-110" style={{ background: "hsl(142 71% 38%)" }}>
                Tạo tài khoản
              </button>
            </div>
          </aside>
        </>
      )}
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
          <button
            key={it.k}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition ${active === it.k ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
          >
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

function Topbar({ title, crumb }: { title: string; crumb: string[] }) {
  return (
    <div className="h-[64px] px-8 border-b bg-white flex items-center justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div>
        <div className="text-[11.5px] text-slate-400 flex items-center gap-1.5">
          {crumb.map((c, i) => (<span key={i}>{i > 0 && <span className="mx-1">/</span>}{c}</span>))}
        </div>
        <h1 className="text-[18px] font-semibold text-slate-800 leading-tight mt-0.5">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Tìm kiếm nhanh…" className="h-10 w-[260px] pl-9 pr-3 rounded-lg border bg-slate-50 text-sm outline-none focus:bg-white focus:border-emerald-500" style={{ borderColor: "hsl(220 13% 91%)" }} />
        </div>
        <button className="w-10 h-10 rounded-lg border flex items-center justify-center text-slate-500 hover:bg-slate-50 relative" style={{ borderColor: "hsl(220 13% 88%)" }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, tone, icon: Icon }: { label: string; value: string; delta: string; tone: "emerald" | "blue" | "amber" | "rose"; icon: React.ComponentType<{ className?: string }>; }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="bg-white border rounded-xl p-4 flex items-start justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div>
        <div className="text-[12.5px] text-slate-500">{label}</div>
        <div className="text-[26px] font-bold text-slate-800 leading-tight mt-0.5">{value}</div>
        <div className="text-[11.5px] text-slate-400 mt-0.5">{delta}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
      {label}<ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium mb-1.5" style={{ color: "hsl(220 13% 25%)" }}>{children}</div>;
}

function Field({ label, value, placeholder, required, hint }: { label: string; value?: string; placeholder?: string; required?: boolean; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium" style={{ color: "hsl(220 13% 25%)" }}>{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      <input defaultValue={value} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg border bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" style={{ borderColor: "hsl(220 13% 88%)" }} />
      {hint && <div className="text-[11.5px] text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <button className="w-full h-10 px-3 rounded-lg border bg-white text-sm flex items-center justify-between hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}

function ModuleChip({ name, icon: Icon, color, on }: { name: string; icon: React.ComponentType<{ className?: string }>; color: "emerald" | "blue" | "amber"; on: boolean }) {
  const tones = {
    emerald: on ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-slate-500 border-slate-200",
    blue: on ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-slate-500 border-slate-200",
    amber: on ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-white text-slate-500 border-slate-200",
  }[color];
  return (
    <button className={`h-16 rounded-lg border-2 transition flex flex-col items-center justify-center gap-1 ${tones} ${on ? "" : "border-dashed"}`}>
      <Icon className="w-4 h-4" />
      <span className="text-[12px] font-medium">{name}</span>
    </button>
  );
}
