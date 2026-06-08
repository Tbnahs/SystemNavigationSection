import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Loader2,
  Clock, Factory,
  RotateCcw, Lock, Unlock, Calendar,
} from "lucide-react";
import {
  fetchEmployee, updateEmployee, resetEmployeePassword,
  fetchEnterprises, type Employee,
} from "@/lib/api";

const STATUS_MAP: Record<Employee["status"], { label: string; cls: string; dot: string }> = {
  active:  { label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  invited: { label: "Đã mời",         cls: "bg-amber-50 text-amber-700 ring-amber-200",       dot: "bg-amber-400" },
  locked:  { label: "Tạm khóa",       cls: "bg-slate-100 text-slate-600 ring-slate-300",      dot: "bg-slate-400" },
};

const ROLE_CLR: Record<string, string> = {
  Admin:      "bg-rose-50 text-rose-700 ring-rose-200",
  "Quản lý":  "bg-blue-50 text-blue-700 ring-blue-200",
  "Nhân viên":"bg-slate-50 text-slate-700 ring-slate-200",
  "Kế toán":  "bg-violet-50 text-violet-700 ring-violet-200",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  } catch { return iso; }
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map(s => s[0]?.toUpperCase() ?? "").join("") || "??";
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-[12.5px] text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-[13.5px] font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function NhanVienDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const entQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const enterprises = entQ.data?.items ?? [];

  const lockMu = useMutation({
    mutationFn: (status: Employee["status"]) => updateEmployee(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employee", id] }),
  });

  const resetMu = useMutation({
    mutationFn: () => resetEmployeePassword(id),
    onSuccess: (data) => { setNewPassword(data.defaultPassword); setShowResetModal(true); },
  });

  if (q.isLoading) return (
    <AppLayout>
      <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Đang tải thông tin nhân viên…
      </div>
    </AppLayout>
  );

  if (q.isError || !q.data) return (
    <AppLayout>
      <div className="bg-white border border-border rounded-xl p-12 text-center">
        <div className="text-rose-600 font-medium mb-2">Không tìm thấy nhân viên</div>
        <div className="text-[13px] text-muted-foreground mb-4">{(q.error as Error)?.message}</div>
        <button onClick={() => setLocation("/portal/nguoi-dung")}
          className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-[13.5px] font-medium">
          Quay lại danh sách
        </button>
      </div>
    </AppLayout>
  );

  const emp = q.data.item;
  const assignedFacilities = q.data.assignedFacilities;
  const st = STATUS_MAP[emp.status];
  const ent = enterprises.find(e => e.id === emp.enterpriseId);

  return (
    <AppLayout>
      <div className="space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <button onClick={() => setLocation("/portal/nguoi-dung")}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <span className="text-muted-foreground text-[13px]">/</span>
          <span className="text-[13px] text-muted-foreground">Nhân viên</span>
          <span className="text-muted-foreground text-[13px]">/</span>
          <span className="text-[13px] font-medium truncate max-w-xs">{emp.name}</span>
        </div>

        {/* Hero */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400" />
          <div className="px-6 py-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {emp.avatarUrl ? (
                <img src={emp.avatarUrl} alt={emp.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-border shrink-0" />
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[22px] font-bold shrink-0 ${emp.avatarColor || "bg-blue-500"}`}>
                  {getInitials(emp.name)}
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[20px] font-bold">{emp.name}</h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ring-1 ring-inset ${ROLE_CLR[emp.role] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
                    {emp.role || "—"}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ring-1 ring-inset ${st.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-[13px] text-muted-foreground">
                  {emp.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{emp.email}</span>}
                  {emp.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{emp.phone}</span>}
                  {emp.enterpriseName && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{emp.enterpriseName}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => resetMu.mutate()} disabled={resetMu.isPending}
                className="h-9 px-3.5 rounded-lg border border-border text-[12.5px] font-medium flex items-center gap-1.5 hover:bg-muted disabled:opacity-50">
                {resetMu.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Đặt lại mật khẩu
              </button>
              <button
                onClick={() => lockMu.mutate(emp.status === "locked" ? "active" : "locked")}
                disabled={lockMu.isPending}
                className={`h-9 px-3.5 rounded-lg text-[12.5px] font-medium flex items-center gap-1.5 disabled:opacity-50 ${emp.status === "locked" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-amber-300 text-amber-700 hover:bg-amber-50"}`}>
                {lockMu.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : emp.status === "locked" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {emp.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground mb-1">Mã nhân viên</div>
            <div className="text-[14px] font-bold font-mono">USR-{1000 + emp.id}</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground mb-1">Cơ sở phụ trách</div>
            <div className="text-[14px] font-bold">{assignedFacilities.length} cơ sở</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground mb-1">Doanh nghiệp</div>
            <div className="text-[13.5px] font-bold truncate">{emp.enterpriseName || "—"}</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="text-[11px] text-muted-foreground mb-1">Hoạt động lần cuối</div>
            <div className="text-[13.5px] font-bold">{formatDate(emp.lastSeen)}</div>
          </div>
        </div>

        {/* All info — single card */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-8">

          {/* Thông tin cá nhân + Thời gian */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thông tin cá nhân</h3>
              <div>
                <InfoRow label="Họ và tên" value={emp.name} />
                <InfoRow label="Email" value={
                  <a href={`mailto:${emp.email}`} className="text-blue-600 hover:underline">{emp.email || "—"}</a>
                } />
                <InfoRow label="Số điện thoại" value={emp.phone || "—"} />
                <InfoRow label="Doanh nghiệp" value={emp.enterpriseName || "—"} />
                <InfoRow label="Vai trò" value={
                  emp.role ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ring-1 ring-inset ${ROLE_CLR[emp.role] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
                      {emp.role}
                    </span>
                  ) : "—"
                } />
                <InfoRow label="Trạng thái" value={
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ring-1 ring-inset ${st.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                  </span>
                } />
              </div>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thời gian</h3>
              <div>
                <InfoRow label="Ngày tạo tài khoản" value={
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />{formatDate(emp.createdAt)}</span>
                } />
                <InfoRow label="Cập nhật lần cuối" value={formatDate(emp.updatedAt)} />
                <InfoRow label="Hoạt động lần cuối" value={
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" />{formatDate(emp.lastSeen)}</span>
                } />
              </div>

              {ent && (
                <div className="mt-6">
                  <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Doanh nghiệp</h3>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:border-blue-200 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/portal/doanh-nghiep/${ent.id}`)}>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">{ent.tenHienThi}</div>
                      <div className="text-[11.5px] text-muted-foreground">{ent.maSoThue || "—"} · {ent.tinhThanh || "—"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Cơ sở phụ trách */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Cơ sở phụ trách</h3>
              <span className="text-[12px] text-muted-foreground">{assignedFacilities.length} cơ sở</span>
            </div>
            {assignedFacilities.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                <Factory className="w-7 h-7 mx-auto mb-2 opacity-25" />
                <div className="text-[13px]">Chưa được giao phụ trách cơ sở nào.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assignedFacilities.map(fc => (
                  <div key={fc.id}
                    onClick={() => setLocation(`/portal/co-so/${fc.id}`)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">{fc.name}</div>
                      <div className="text-[11.5px] text-muted-foreground font-mono">{fc.code}</div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">{[fc.xa, fc.tinh].filter(Boolean).join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset password modal */}
      {showResetModal && newPassword && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-[16px] font-semibold mb-1">Mật khẩu đã được đặt lại</h3>
            <p className="text-[13px] text-muted-foreground mb-3">Mật khẩu mới của <b>{emp.name}</b>:</p>
            <div className="bg-muted rounded-xl px-4 py-3 font-mono text-[15px] font-bold mb-4 tracking-widest">{newPassword}</div>
            <p className="text-[12px] text-muted-foreground mb-4">Hãy sao chép và gửi cho nhân viên. Mật khẩu sẽ cần đổi lại sau lần đăng nhập đầu tiên.</p>
            <button onClick={() => { setShowResetModal(false); setNewPassword(null); }}
              className="w-full h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Đã sao chép, đóng lại
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
