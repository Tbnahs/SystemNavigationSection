import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, X, Upload,
  Users, Package, Sprout, Bell, Pencil, Mail, Phone, ArrowLeft, ArrowRight,
  Shield, Eye, LayoutGrid,
} from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dn: string;
  dnColor: string;
  role: "Admin" | "Quản lý" | "Nhân viên" | "Kế toán";
  status: "active" | "invited" | "locked";
  initials: string;
  avatarColor: string;
  lastSeen: string;
};

const USERS: UserRow[] = [
  { id: "1", name: "Nguyễn Văn Hùng", email: "hung.nv@chequanchu.vn", phone: "0987 123 456", dn: "Chè Quân Chu", dnColor: "bg-emerald-100 text-emerald-700", role: "Admin", status: "active", initials: "NH", avatarColor: "bg-emerald-500", lastSeen: "Đang online" },
  { id: "2", name: "Trần Thị Mai", email: "mai.tt@tancuongxanh.vn", phone: "0912 345 678", dn: "Tân Cương Xanh", dnColor: "bg-blue-100 text-blue-700", role: "Quản lý", status: "active", initials: "TM", avatarColor: "bg-blue-500", lastSeen: "5 phút trước" },
  { id: "3", name: "Lê Quốc Anh", email: "anh.lq@labangorganic.vn", phone: "0903 567 890", dn: "La Bằng Organic", dnColor: "bg-amber-100 text-amber-700", role: "Nhân viên", status: "invited", initials: "LA", avatarColor: "bg-amber-500", lastSeen: "Chưa đăng nhập" },
  { id: "4", name: "Phạm Hồng Sơn", email: "son.ph@phucvinh.vn", phone: "0978 234 567", dn: "Phúc Vinh Tea", dnColor: "bg-purple-100 text-purple-700", role: "Kế toán", status: "active", initials: "PS", avatarColor: "bg-purple-500", lastSeen: "1 giờ trước" },
  { id: "5", name: "Hoàng Minh Tuấn", email: "tuan.hm@chequanchu.vn", phone: "0934 678 123", dn: "Chè Quân Chu", dnColor: "bg-emerald-100 text-emerald-700", role: "Nhân viên", status: "active", initials: "HT", avatarColor: "bg-teal-500", lastSeen: "Hôm qua" },
  { id: "6", name: "Vũ Thị Lan", email: "lan.vt@songcautea.vn", phone: "0945 789 012", dn: "Sông Cầu Tea", dnColor: "bg-teal-100 text-teal-700", role: "Quản lý", status: "locked", initials: "VL", avatarColor: "bg-rose-500", lastSeen: "12/04/2026" },
];

const STATUS: Record<UserRow["status"], { text: string; cls: string; dot: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  invited: { text: "Đã mời", cls: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
};

const ROLE_CLR: Record<UserRow["role"], string> = {
  Admin: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Quản lý": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Nhân viên": "bg-slate-50 text-slate-700 ring-slate-500/20",
  "Kế toán": "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export default function NhanVienPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Người dùng</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Quản lý Nhân viên</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Tổng nhân viên" value="124" delta="+8 trong tuần" tone="emerald" icon={Users} />
          <Stat label="Đang hoạt động" value="118" delta="95% tổng" tone="blue" icon={Shield} />
          <Stat label="Đã mời, chờ kích hoạt" value="4" delta="Cần nhắc lại" tone="amber" icon={Mail} />
          <Stat label="Tạm khóa" value="2" delta="-1 tuần này" tone="rose" icon={X} />
        </div>

        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Tìm theo tên, email, SĐT…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <SelectChip label="Doanh nghiệp" />
          <SelectChip label="Vai trò" />
          <SelectChip label="Trạng thái" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Filter className="w-4 h-4" /> Bộ lọc
          </button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Thêm nhân viên
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-primary" /></th>
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
                {USERS.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3"><input type="checkbox" className="accent-primary" /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center ${u.avatarColor}`}>{u.initials}</div>
                        <div>
                          <div className="font-medium text-foreground">{u.name}</div>
                          <div className="text-[11.5px] text-muted-foreground">ID: USR-{1000 + Number(u.id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[13px] text-foreground"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{u.email}</div>
                      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground mt-0.5"><Phone className="w-3 h-3" />{u.phone}</div>
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
                    <td className="px-3 py-3 text-[12.5px] text-muted-foreground">{u.lastSeen}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button className="p-1.5 rounded hover:bg-muted"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            <div>Hiển thị 1–6 trong tổng số 124 nhân viên</div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowLeft className="w-4 h-4" /></button>
              {[1, 2, 3, "…", 21].map((p, i) => (
                <button key={i} className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "bg-primary text-primary-foreground font-semibold" : "border border-border hover:bg-muted"}`}>{p}</button>
              ))}
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">Thêm nhân viên mới</div>
                <div className="text-[12.5px] text-muted-foreground">Tạo tài khoản và gửi lời mời qua email.</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div>
                <Label>Ảnh đại diện</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-[18px] font-semibold flex items-center justify-center">NV</div>
                  <button className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted">
                    <Upload className="w-4 h-4" /> Tải ảnh lên
                  </button>
                </div>
              </div>

              <Field label="Họ và tên" required placeholder="Nguyễn Văn A" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại" required placeholder="09xx xxx xxx" />
                <Field label="Email" placeholder="ten@congty.vn" />
              </div>

              <Select label="Doanh nghiệp" value="-- Chọn doanh nghiệp --" />

              <div className="grid grid-cols-2 gap-4">
                <Select label="Vai trò" value="Nhân viên" />
                <Select label="Phòng ban" value="-- Chọn --" />
              </div>

              <div>
                <Label>Quyền truy cập phân hệ</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "ERP", icon: LayoutGrid, color: "emerald" as const, on: true },
                    { name: "TXNG", icon: Package, color: "blue" as const, on: true },
                    { name: "Vùng trồng", icon: Sprout, color: "amber" as const, on: false },
                  ].map((m) => (
                    <ModuleChip key={m.name} {...m} />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 accent-primary" />
                <div className="text-[13px] text-foreground">
                  <div className="font-medium">Gửi email mời kích hoạt tài khoản</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Nhân viên sẽ nhận được email kèm liên kết đặt mật khẩu lần đầu.</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={() => setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110">
                Tạo tài khoản
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
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
    <div className="bg-white border border-border rounded-xl p-4 flex items-start justify-between">
      <div>
        <div className="text-[12.5px] text-muted-foreground">{label}</div>
        <div className="text-[24px] font-bold text-foreground leading-tight mt-0.5">{value}</div>
        <div className="text-[11.5px] text-muted-foreground mt-0.5">{delta}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
      {label}<ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium mb-1.5 text-foreground/80">{children}</div>;
}

function Field({ label, value, placeholder, required }: { label: string; value?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium text-foreground/80">{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      <input defaultValue={value} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <button className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm flex items-center justify-between hover:bg-muted">
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function ModuleChip({ name, icon: Icon, color, on }: { name: string; icon: React.ComponentType<{ className?: string }>; color: "emerald" | "blue" | "amber"; on: boolean }) {
  const tones = {
    emerald: on ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-muted-foreground border-border border-dashed",
    blue: on ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-muted-foreground border-border border-dashed",
    amber: on ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-white text-muted-foreground border-border border-dashed",
  }[color];
  return (
    <button className={`h-16 rounded-lg border-2 transition flex flex-col items-center justify-center gap-1 ${tones}`}>
      <Icon className="w-4 h-4" />
      <span className="text-[12px] font-medium">{name}</span>
    </button>
  );
}
