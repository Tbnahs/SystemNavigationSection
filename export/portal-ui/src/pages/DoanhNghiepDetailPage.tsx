import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Pencil, MoreHorizontal, Search, MapPin, Phone, Mail,
  Building2, Users, Package, Sprout, FileText, Download,
  CheckCircle2, AlertCircle, Clock, Globe, Hash, Calendar, LayoutGrid, Loader2,
} from "lucide-react";
import { fetchEnterprise, type Employee } from "@/lib/api";

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

const STATUS_LABEL: Record<string, { text: string; cls: string; dot: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  pending: { text: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
};

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "??";
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

export default function DoanhNghiepDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"overview" | "members" | "activity" | "documents">("overview");

  const q = useQuery({
    queryKey: ["enterprise", id],
    queryFn: () => fetchEnterprise(id),
    enabled: Number.isFinite(id),
  });

  if (q.isLoading) {
    return (
      <AppLayout>
        <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin inline mr-2" />Đang tải hồ sơ doanh nghiệp…
        </div>
      </AppLayout>
    );
  }

  if (q.isError || !q.data) {
    return (
      <AppLayout>
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <div className="text-rose-600 font-medium mb-2">Không tìm thấy doanh nghiệp</div>
          <div className="text-[13px] text-muted-foreground mb-4">{(q.error as Error)?.message ?? "Doanh nghiệp này có thể đã bị xóa."}</div>
          <button onClick={() => setLocation("/portal/doanh-nghiep")} className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-[13.5px] font-medium">Quay lại danh sách</button>
        </div>
      </AppLayout>
    );
  }

  const dn = q.data.item;
  const members = q.data.members;
  const status = STATUS_LABEL[dn.status] ?? STATUS_LABEL.active;
  const lead = members.find((m) => m.role === "Admin") ?? members[0] ?? null;
  const adminCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white border border-border rounded-xl p-5">
          <button
            onClick={() => setLocation("/portal/doanh-nghiep")}
            className="text-[12.5px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách doanh nghiệp
          </button>

          <div className="flex items-start gap-5 flex-wrap">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm shrink-0 ${dn.logoColor}`}>
              {getInitials(dn.tenHienThi)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-[22px] font-bold leading-tight">{dn.ten}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${status.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`} /> {status.text}
                </span>
              </div>
              <div className="text-[13.5px] text-muted-foreground mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> MST: <b className="text-foreground font-mono">{dn.mst}</b></span>
                {dn.diaChi && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {dn.diaChi}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Tham gia {formatDate(dn.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted">
                <Globe className="w-4 h-4" /> Truy cập trang TXNG
              </button>
              <button className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted">
                <Pencil className="w-4 h-4" /> Sửa hồ sơ
              </button>
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-5 -mb-5 border-b border-border overflow-x-auto">
            {[
              { k: "overview",  label: "Tổng quan" },
              { k: "members",   label: `Nhân viên (${members.length})` },
              { k: "activity",  label: "Lịch sử thay đổi" },
              { k: "documents", label: "Tài liệu" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as typeof tab)}
                className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-px transition whitespace-nowrap ${tab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat label="Nhân viên" value={String(members.length)} tone="emerald" icon={Users} />
                <MiniStat label="Đã kích hoạt" value={String(adminCount)} tone="blue" icon={CheckCircle2} />
                <MiniStat label="Đang chờ mời" value={String(invitedCount)} tone="amber" icon={Mail} />
                <MiniStat label="Phân hệ" value={String(dn.modules.length)} tone="rose" icon={LayoutGrid} />
              </div>

              <Card title="Hồ sơ chung" actionLabel="Sửa">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Info label="Tên doanh nghiệp" value={dn.ten} />
                  <Info label="Tên hiển thị" value={dn.tenHienThi} />
                  <Info label="Mã số thuế" value={dn.mst} mono />
                  <Info label="Email" value={dn.email || "—"} icon={Mail} />
                  <Info label="Người đại diện" value={dn.daiDien || "—"} />
                  <Info label="SĐT doanh nghiệp" value={dn.sdt || "—"} icon={Phone} />
                </div>
              </Card>

              <Card title="Vị trí địa lý" actionLabel="Sửa">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                  <Info label="Tỉnh / Thành phố" value={dn.tinh || "—"} />
                  <Info label="Xã / Phường" value={dn.xa || "—"} />
                  <div className="md:col-span-2">
                    <Info label="Địa chỉ chi tiết" value={dn.diaChi || "—"} icon={MapPin} />
                  </div>
                </div>
                <div className="rounded-xl border border-border h-44 flex items-center justify-center text-muted-foreground text-sm relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                  <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow text-emerald-700 text-[12.5px] font-medium">
                    <MapPin className="w-3.5 h-3.5" /> Bản đồ vị trí (chưa cấu hình)
                  </div>
                </div>
              </Card>

              <Card title="Phân hệ đang sử dụng" actionLabel="Quản lý">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dn.modules.includes("ERP") && <ModuleCard name="ERP" desc="Quản trị nguồn lực" icon={LayoutGrid} color="emerald" usage={`Đang dùng · ${members.length} user`} />}
                  {dn.modules.includes("TXNG") && <ModuleCard name="TXNG" desc="Truy xuất nguồn gốc" icon={Package} color="blue" usage="Đang dùng" />}
                  {dn.modules.includes("VT") && <ModuleCard name="Vùng trồng" desc="Quản lý vùng nguyên liệu" icon={Sprout} color="amber" usage="Đang dùng" />}
                  {dn.modules.length === 0 && <div className="text-[13px] text-muted-foreground col-span-3 py-4 text-center">Chưa kích hoạt phân hệ nào.</div>}
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card title="Liên hệ chính">
                {lead ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full text-white text-[14px] font-semibold flex items-center justify-center ${lead.avatarColor}`}>{getInitials(lead.name)}</div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-[12px] text-muted-foreground">{lead.role}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex items-center gap-2 text-foreground/80"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{lead.phone || "—"}</div>
                      <div className="flex items-center gap-2 text-foreground/80"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{lead.email || "—"}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] text-muted-foreground py-2">Chưa có nhân viên nào.</div>
                )}
              </Card>

              <Card title="Tài liệu pháp lý" actionLabel="Tải lên">
                <div className="text-[13px] text-muted-foreground py-4 text-center">
                  Chưa có tài liệu nào.
                </div>
              </Card>

              <Card title="Trạng thái hệ thống">
                <div className="space-y-3 text-[13px]">
                  <Status icon={CheckCircle2} tone="emerald" label={`Hồ sơ ${status.text.toLowerCase()}`} sub={formatDate(dn.createdAt)} />
                  <Status icon={CheckCircle2} tone="emerald" label="Đã có Mã số thuế" sub={dn.mst} />
                  {invitedCount > 0 && (
                    <Status icon={AlertCircle} tone="rose" label={`${invitedCount} nhân viên chưa kích hoạt`} sub="Cần nhắc lại email mời" />
                  )}
                  {dn.modules.length === 0 && (
                    <Status icon={Clock} tone="amber" label="Chưa kích hoạt phân hệ" sub="Vào tab Phân hệ để bật" />
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "members" && (
          <Card title="Nhân viên thuộc doanh nghiệp" actionLabel="+ Thêm nhân viên">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Tìm theo tên, email, SĐT…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2.5">Nhân viên</th>
                    <th className="px-3 py-2.5">Vai trò</th>
                    <th className="px-3 py-2.5">Liên hệ</th>
                    <th className="px-3 py-2.5">Trạng thái</th>
                    <th className="px-3 py-2.5">Hoạt động cuối</th>
                    <th className="px-3 py-2.5 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Chưa có nhân viên nào trong doanh nghiệp này.</td></tr>
                  )}
                  {members.map((m: Employee) => (
                    <tr key={m.id} className="border-t border-border hover:bg-emerald-50/30">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center ${m.avatarColor}`}>{getInitials(m.name)}</div>
                          <div className="font-medium text-foreground">{m.name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${ROLE_CLR[m.role]}`}>{m.role}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-[13px] text-foreground">{m.email || "—"}</div>
                        <div className="text-[12px] text-muted-foreground">{m.phone || "—"}</div>
                      </td>
                      <td className="px-3 py-3">
                        {m.status === "active" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Hoạt động</span>
                        ) : m.status === "invited" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />Đã mời</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset bg-slate-100 text-slate-600 ring-slate-500/20"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />Tạm khóa</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[12.5px] text-muted-foreground">{m.lastSeen}</td>
                      <td className="px-3 py-3">
                        <button className="p-1.5 rounded hover:bg-muted text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "activity" && (
          <Card title="Lịch sử thay đổi">
            <div className="space-y-0">
              <div className="flex gap-3 py-3 border-b border-border">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TONES.blue}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px]">
                    <span className="font-medium text-foreground">Hệ thống</span>
                    <span className="text-muted-foreground"> · Tạo doanh nghiệp</span>
                  </div>
                  <div className="text-[12.5px] text-muted-foreground mt-0.5">Doanh nghiệp được khởi tạo trên hệ thống</div>
                </div>
                <div className="text-[11.5px] text-muted-foreground shrink-0">{formatDate(dn.createdAt)}</div>
              </div>
              <div className="px-2 py-6 text-center text-[12.5px] text-muted-foreground">Lịch sử thay đổi chi tiết sẽ được bổ sung sau.</div>
            </div>
          </Card>
        )}

        {tab === "documents" && (
          <Card title="Tài liệu" actionLabel="+ Tải lên">
            <div className="text-[13px] text-muted-foreground py-8 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Chưa có tài liệu nào được tải lên cho doanh nghiệp này.
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
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
    <div className="bg-white border border-border rounded-xl p-3.5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[20px] font-bold text-foreground leading-tight">{value}</div>
        <div className="text-[11.5px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Card({ title, actionLabel, children }: { title: string; actionLabel?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <div className="text-[14px] font-semibold text-foreground">{title}</div>
        {actionLabel && (
          <button className="text-[12.5px] font-medium text-primary hover:brightness-90">{actionLabel}</button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Info({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <div className="text-[11.5px] text-muted-foreground mb-1">{label}</div>
      <div className={`text-[13.5px] text-foreground flex items-center gap-1.5 ${mono ? "font-mono" : ""}`}>
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
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
    <div className={`border ${tones.border} rounded-xl p-4`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${tones.bg} ${tones.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-semibold text-[14px] text-foreground">{name}</div>
      <div className="text-[12px] text-muted-foreground mb-2 leading-snug">{desc}</div>
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
        <div className="text-foreground">{label}</div>
        <div className="text-[12px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
