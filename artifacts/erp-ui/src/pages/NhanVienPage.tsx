import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, X, Upload,
  Users, Package, Sprout, Bell, Pencil, Mail, Phone, ArrowLeft, ArrowRight,
  Shield, Eye, LayoutGrid, Loader2,
} from "lucide-react";
import {
  fetchEmployees, fetchEmployeeStats, createEmployee, fetchEnterprises,
  type Employee,
} from "@/lib/api";

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-orange-500",
];

const STATUS: Record<Employee["status"], { text: string; cls: string; dot: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  invited: { text: "Đã mời", cls: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
};

const ROLE_CLR: Record<Employee["role"], string> = {
  Admin: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Quản lý": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Nhân viên": "bg-slate-50 text-slate-700 ring-slate-500/20",
  "Kế toán": "bg-violet-50 text-violet-700 ring-violet-600/20",
};

type EForm = {
  name: string;
  email: string;
  phone: string;
  enterpriseId: number | null;
  role: Employee["role"];
};
const EMPTY_E: EForm = { name: "", email: "", phone: "", enterpriseId: null, role: "Nhân viên" };

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "??";
}

const DN_COLORS = [
  "bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700",
];
function colorFor(idx: number) { return DN_COLORS[idx % DN_COLORS.length]; }

export default function NhanVienPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<EForm>(EMPTY_E);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });
  const statsQ = useQuery({ queryKey: ["employees-stats"], queryFn: fetchEmployeeStats });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });

  const createMu = useMutation({
    mutationFn: (body: EForm) =>
      createEmployee({
        ...body,
        status: "invited",
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        lastSeen: "Chưa đăng nhập",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employees-stats"] });
      setForm(EMPTY_E);
      setDrawerOpen(false);
      setSubmitErr(null);
    },
    onError: (e: Error) => setSubmitErr(e.message),
  });

  const items = listQ.data?.items ?? [];
  const filtered = search.trim()
    ? items.filter((u) =>
        [u.name, u.email, u.phone].some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  function setF<K extends keyof EForm>(k: K, v: EForm[K]) { setForm((p) => ({ ...p, [k]: v })); }
  function handleSubmit() {
    setSubmitErr(null);
    if (!form.name.trim()) { setSubmitErr("Vui lòng nhập họ và tên."); return; }
    createMu.mutate(form);
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Người dùng</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Quản lý Nhân viên</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Tổng nhân viên" value={String(statsQ.data?.total ?? "—")} delta="Dữ liệu thực tế" tone="emerald" icon={Users} />
          <Stat label="Đang hoạt động" value={String(statsQ.data?.active ?? "—")} delta={statsQ.data ? `${Math.round(((statsQ.data.active || 0) / Math.max(statsQ.data.total, 1)) * 100)}% tổng` : ""} tone="blue" icon={Shield} />
          <Stat label="Đã mời, chờ kích hoạt" value={String(statsQ.data?.invited ?? "—")} delta="Cần nhắc lại" tone="amber" icon={Mail} />
          <Stat label="Tạm khóa" value={String(statsQ.data?.locked ?? "—")} delta="" tone="rose" icon={X} />
        </div>

        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                {listQ.isLoading && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {listQ.isError && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-rose-600">Lỗi: {(listQ.error as Error).message}</td></tr>
                )}
                {!listQ.isLoading && !listQ.isError && filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">{search ? "Không tìm thấy nhân viên phù hợp." : "Chưa có nhân viên nào."}</td></tr>
                )}
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3"><input type="checkbox" className="accent-primary" /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center ${u.avatarColor}`}>{getInitials(u.name)}</div>
                        <div>
                          <div className="font-medium text-foreground">{u.name}</div>
                          <div className="text-[11.5px] text-muted-foreground">ID: USR-{1000 + u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[13px] text-foreground"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{u.email || "—"}</div>
                      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground mt-0.5"><Phone className="w-3 h-3" />{u.phone || "—"}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ${colorFor(i)}`}>{u.enterpriseName ?? "—"}</span>
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
            <div>Hiển thị {filtered.length} / {items.length} nhân viên</div>
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
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-[18px] font-semibold flex items-center justify-center">{form.name ? getInitials(form.name) : "NV"}</div>
                  <button className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted">
                    <Upload className="w-4 h-4" /> Tải ảnh lên
                  </button>
                </div>
              </div>

              <Field label="Họ và tên" required placeholder="Nguyễn Văn A" value={form.name} onChange={(v) => setF("name", v)} />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại" placeholder="09xx xxx xxx" value={form.phone} onChange={(v) => setF("phone", v)} />
                <Field label="Email" placeholder="ten@congty.vn" value={form.email} onChange={(v) => setF("email", v)} />
              </div>

              <div>
                <Label>Doanh nghiệp</Label>
                <select
                  value={form.enterpriseId ?? ""}
                  onChange={(e) => setF("enterpriseId", e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                >
                  <option value="">-- Không gắn doanh nghiệp --</option>
                  {(dnQ.data?.items ?? []).map((d) => (
                    <option key={d.id} value={d.id}>{d.tenHienThi}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Vai trò</Label>
                <select
                  value={form.role}
                  onChange={(e) => setF("role", e.target.value as Employee["role"])}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                >
                  {(["Admin", "Quản lý", "Nhân viên", "Kế toán"] as const).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 accent-primary" />
                <div className="text-[13px] text-foreground">
                  <div className="font-medium">Gửi email mời kích hoạt tài khoản</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">Nhân viên sẽ nhận được email kèm liên kết đặt mật khẩu lần đầu.</div>
                </div>
              </div>

              {submitErr && (
                <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">
                  {submitErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={() => setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button
                disabled={createMu.isPending}
                onClick={handleSubmit}
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
              >
                {createMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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

function Field({ label, value, placeholder, required, onChange }: { label: string; value?: string; placeholder?: string; required?: boolean; onChange?: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium text-foreground/80">{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      <input value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
    </div>
  );
}

