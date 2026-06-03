import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, MapPin, Phone, Building2, Home, Factory,
  Users, QrCode, Printer, Award, Loader2, Globe, Hash,
  Leaf, Info, Map, CheckCircle2, AlertCircle, Calendar, BadgeCheck,
  ChevronRight, X, Mail, Clock, ShieldCheck, Upload, ImageIcon,
} from "lucide-react";
import { fetchFacility, fetchTeaVarieties, fetchEmployeeFacilities, fetchFacilities, updateFacility, type Facility, type Employee } from "@/lib/api";

const TYPE_OPTIONS: { value: Facility["type"]; label: string; color: string; Icon: typeof Home }[] = [
  { value: "ho_lien_ket", label: "Hộ liên kết", color: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: Home },
  { value: "co_so_thue_ngoai", label: "Cơ sở sản xuất (thuê ngoài)", color: "bg-blue-50 text-blue-700 ring-blue-200", Icon: Building2 },
  { value: "co_so_noi_bo", label: "Cơ sở sản xuất (nội bộ)", color: "bg-violet-50 text-violet-700 ring-violet-200", Icon: Factory },
];
function typeLabel(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.label ?? t; }
function typeColor(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.color ?? ""; }
function typeIcon(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.Icon ?? Factory; }

const CERT_LOAI_LABEL: Record<string, string> = {
  ocop: "OCOP", vietgap: "VietGAP", organic: "Organic", iso: "ISO", khac: "Khác",
};
const CERT_LOAI_COLOR: Record<string, string> = {
  ocop: "bg-amber-50 text-amber-700 ring-amber-200",
  vietgap: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  organic: "bg-green-50 text-green-700 ring-green-200",
  iso: "bg-blue-50 text-blue-700 ring-blue-200",
  khac: "bg-slate-50 text-slate-600 ring-slate-200",
};

function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

function printQR(facility: Facility) {
  const win = window.open("", "_blank", "width=400,height=500");
  if (!win) return;
  const data = `CO-SO:${facility.id}|${facility.name}|${facility.code || ""}`;
  win.document.write(`
    <html><head><title>QR - ${facility.name}</title>
    <style>body{font-family:sans-serif;text-align:center;padding:30px;} h2{margin-bottom:4px;} p{color:#666;margin:4px 0;}</style>
    </head><body>
    <h2>${facility.name}</h2>
    <p>${typeLabel(facility.type)}</p>
    <p>Mã: ${facility.code || `CS-${facility.id}`}</p>
    <img src="${qrUrl(data)}" style="margin:16px auto;display:block;" />
    <p style="font-size:12px;color:#999;">${facility.address || ""}</p>
    <script>window.onload=()=>window.print();<\/script>
    </body></html>
  `);
  win.document.close();
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch { return iso; }
}

function isExpired(dateStr: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "??";
}

function MapEmbed({ tinh, xa, address }: { tinh?: string; xa?: string; address?: string }) {
  const q = [address, xa, tinh].filter(Boolean).join(", ");
  if (!q) return (
    <div className="rounded-xl border border-border bg-muted/40 h-64 flex items-center justify-center text-muted-foreground text-sm">
      <MapPin className="w-4 h-4 mr-2" /> Chưa có địa chỉ để hiển thị bản đồ
    </div>
  );
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 300 }}>
      <iframe key={q} src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=14`}
        title="Bản đồ vị trí" width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
    </div>
  );
}

const ROLE_CLR: Record<string, string> = {
  Admin: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Quản lý": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Nhân viên": "bg-slate-50 text-slate-700 ring-slate-500/20",
  "Kế toán": "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export default function CoSoDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"overview" | "location" | "certs" | "employees" | "qr">("overview");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const certImgRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const qc = useQueryClient();

  const updateCertImg = useMutation({
    mutationFn: ({ certId, dataUrl }: { certId: string; dataUrl: string }) => {
      const updatedCerts = (q.data?.item.chungChi ?? []).map(c =>
        c.id === certId ? { ...c, imageUrl: dataUrl } : c
      );
      return updateFacility(id, { chungChi: updatedCerts });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facility", id] }),
  });

  function handleCertImg(certId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateCertImg.mutate({ certId, dataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  function removeCertImg(certId: string) {
    const updatedCerts = (q.data?.item.chungChi ?? []).map(c =>
      c.id === certId ? { ...c, imageUrl: "" } : c
    );
    updateFacility(id, { chungChi: updatedCerts }).then(() =>
      qc.invalidateQueries({ queryKey: ["facility", id] })
    );
  }

  const q = useQuery({
    queryKey: ["facility", id],
    queryFn: () => fetchFacility(id),
    enabled: Number.isFinite(id) && id > 0,
  });
  const tvQ = useQuery({ queryKey: ["teaVarieties"], queryFn: fetchTeaVarieties });
  const teaVarieties = tvQ.data?.items ?? [];

  if (q.isLoading) {
    return (
      <AppLayout>
        <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin inline mr-2" />Đang tải thông tin cơ sở…
        </div>
      </AppLayout>
    );
  }

  if (q.isError || !q.data) {
    return (
      <AppLayout>
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <div className="text-rose-600 font-medium mb-2">Không tìm thấy cơ sở</div>
          <div className="text-[13px] text-muted-foreground mb-4">{(q.error as Error)?.message ?? "Cơ sở này có thể đã bị xóa."}</div>
          <button onClick={() => setLocation("/portal/co-so")} className="h-10 px-4 rounded-lg border border-border hover:bg-muted text-[13.5px] font-medium">Quay lại danh sách</button>
        </div>
      </AppLayout>
    );
  }

  const f = q.data.item;
  const assignedEmployees: Employee[] = q.data.employees;
  const TypeIcon = typeIcon(f.type);
  const isActive = f.status === "active";
  const chungChi = f.chungChi ?? [];
  const boPhan = f.boPhan ?? [];

  const tabs = [
    { key: "overview" as const, label: "Thông tin chung", Icon: Info },
    { key: "location" as const, label: "Địa lý & Bản đồ", Icon: Map },
    { key: "certs" as const, label: "Chứng chỉ", Icon: Award, count: chungChi.length },
    { key: "employees" as const, label: "Nhân viên", Icon: Users, count: assignedEmployees.length },
    { key: "qr" as const, label: "Mã QR", Icon: QrCode },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <button onClick={() => setLocation("/portal/co-so")}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <span className="text-muted-foreground text-[13px]">/</span>
          <span className="text-[13px] text-muted-foreground">Cơ sở</span>
          <span className="text-muted-foreground text-[13px]">/</span>
          <span className="text-[13px] font-medium truncate max-w-xs">{f.name}</span>
        </div>

        {/* Hero card — map banner style */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[17px] font-bold leading-snug">{f.name}</h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  {typeLabel(f.type)}{f.enterpriseName ? ` · ${f.enterpriseName}` : ""}{f.address ? ` · ${f.address}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ring-1 ring-inset ${isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-300"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                {isActive ? "Hoạt động" : "Ngưng"}
              </span>
              {f.type === "ho_lien_ket" && (
                <button onClick={() => setShowQrModal(true)}
                  className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-[13px] font-medium flex items-center gap-2 hover:bg-emerald-700">
                  <QrCode className="w-3.5 h-3.5" /> Xem QR
                </button>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div className="px-6 pb-4 grid grid-cols-4 gap-3">
            <div className="border border-border rounded-xl p-3.5">
              <div className="text-[11px] text-muted-foreground mb-1">Tên cơ sở</div>
              <div className="text-[13.5px] font-bold truncate">{f.name}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">{f.code || `CS-${f.id}`}</div>
            </div>
            <div className="border border-border rounded-xl p-3.5">
              <div className="text-[11px] text-muted-foreground mb-1">Diện tích</div>
              <div className="text-[13.5px] font-bold">{f.dienTich ? `${f.dienTich} ${f.donViDienTich}` : "—"}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">Tổng diện tích</div>
            </div>
            <div className="border border-border rounded-xl p-3.5">
              <div className="text-[11px] text-muted-foreground mb-1">Loại cơ sở</div>
              <div className="text-[13.5px] font-bold">{typeLabel(f.type)}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">
                {f.gln ? <span className="font-mono">GLN: {f.gln}</span> : "Chưa có GLN"}
              </div>
            </div>
            <div className="border border-border rounded-xl p-3.5">
              <div className="text-[11px] text-muted-foreground mb-1">Trạng thái</div>
              <div className={`text-[13.5px] font-bold ${isActive ? "text-emerald-600" : "text-slate-500"}`}>
                {isActive ? "Hoạt động" : "Ngưng hoạt động"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="text-[11.5px] text-muted-foreground">{isActive ? "Đang vận hành" : "Tạm dừng"}</span>
              </div>
            </div>
          </div>

          {/* Map banner */}
          {(() => {
            const mapQ = [f.address, f.xa, f.tinh].filter(Boolean).join(", ");
            return mapQ ? (
              <div className="relative mx-6 mb-6 rounded-xl overflow-hidden" style={{ height: 220 }}>
                <iframe
                  key={mapQ}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQ)}&output=embed&z=15&t=k`}
                  title="Bản đồ vị trí"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
                {/* overlay label */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[13px] font-semibold text-slate-800 max-w-[220px] truncate">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-white drop-shadow">Live view</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-6 mb-6 rounded-xl border-2 border-dashed border-border h-36 flex items-center justify-center text-muted-foreground text-[13px]">
                <MapPin className="w-4 h-4 mr-2" /> Nhập địa chỉ để xem bản đồ
              </div>
            );
          })()}
        </div>

        {/* Tabs + Content */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map(({ key, label, Icon, count }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors ${tab === key ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                <Icon className="w-4 h-4" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">{count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Tab: Thông tin chung ── */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thông tin cơ bản</h3>
                    <div className="space-y-3">
                      <Row label="Tên cơ sở" value={f.name} />
                      <Row label="Mã cơ sở" value={<span className="font-mono">{f.code || `CS-${f.id}`}</span>} />
                      <Row label="Loại cơ sở" value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-medium ring-1 ring-inset ${typeColor(f.type)}`}>{typeLabel(f.type)}</span>
                      } />
                      <Row label="Số điện thoại" value={f.phone || "—"} />
                      <Row label="Trạng thái" value={
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-medium ring-1 ring-inset ${isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-300"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                        </span>
                      } />
                      {f.enterpriseName && <Row label="Doanh nghiệp" value={f.enterpriseName} />}
                    </div>
                  </section>

                  {f.gln && (
                    <section>
                      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Định danh GS1</h3>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-[11px] text-blue-600 font-medium">Global Location Number (GLN)</div>
                          <div className="text-[15px] font-mono font-semibold text-blue-900 tracking-wider">{f.gln}</div>
                        </div>
                      </div>
                    </section>
                  )}

                  {f.notes && (
                    <section>
                      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ghi chú</h3>
                      <p className="text-[13.5px] text-foreground bg-muted/40 rounded-xl px-4 py-3 border border-border">{f.notes}</p>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  {f.type === "ho_lien_ket" && (
                    <section>
                      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Giống chè canh tác</h3>
                      {f.giong_che_ids?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {f.giong_che_ids.map(gid => {
                            const tv = teaVarieties.find(t => t.id === gid);
                            if (!tv) return null;
                            return (
                              <span key={gid} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[12.5px] font-medium ring-1 ring-emerald-200">
                                <Leaf className="w-3 h-3" />{tv.name}{tv.code && <span className="text-emerald-600 text-[11px]">({tv.code})</span>}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[13px] text-muted-foreground italic">Chưa có giống chè được ghi nhận.</div>
                      )}
                    </section>
                  )}

                  {boPhan.length > 0 && (
                    <section>
                      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bộ phận ({boPhan.length})</h3>
                      <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
                              <th className="px-3 py-2.5">Mã</th>
                              <th className="px-3 py-2.5">Tên bộ phận</th>
                              <th className="px-3 py-2.5">Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody>
                            {boPhan.map((bp, i) => (
                              <tr key={bp.id} className={i > 0 ? "border-t border-border" : ""}>
                                <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">{bp.ma || "—"}</td>
                                <td className="px-3 py-2.5 font-medium text-[13px]">{bp.ten}</td>
                                <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{bp.ghiChu || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thời gian</h3>
                    <div className="space-y-3">
                      <Row label="Ngày tạo" value={formatDate(f.createdAt)} />
                      <Row label="Cập nhật lần cuối" value={formatDate(f.updatedAt)} />
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* ── Tab: Địa lý & Bản đồ ── */}
            {tab === "location" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Row label="Tỉnh / Thành phố" value={f.tinh || "—"} />
                  <Row label="Xã / Phường" value={f.xa || "—"} />
                  <Row label="Diện tích" value={f.dienTich ? `${f.dienTich} ${f.donViDienTich}` : "—"} />
                </div>
                <div>
                  <Row label="Địa chỉ chi tiết" value={f.address || "—"} />
                </div>
                <section>
                  <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bản đồ vị trí</h3>
                  <MapEmbed tinh={f.tinh} xa={f.xa} address={f.address} />
                </section>
              </div>
            )}

            {/* ── Tab: Chứng chỉ ── */}
            {tab === "certs" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold">Chứng nhận / Chứng chỉ</h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{chungChi.length} chứng chỉ đã đăng ký</p>
                </div>

                {chungChi.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-25" />
                    <div className="text-[13px]">Chưa có chứng chỉ nào được đăng ký.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chungChi.map((c, idx) => {
                      const expired = isExpired(c.ngayHetHan);
                      return (
                        <div key={c.id} className={`border rounded-xl p-4 ${expired ? "border-rose-200 bg-rose-50/30" : "border-border bg-white"}`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold">{c.ten || `Chứng chỉ #${idx + 1}`}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${CERT_LOAI_COLOR[c.loai] ?? CERT_LOAI_COLOR.khac}`}>
                                {CERT_LOAI_LABEL[c.loai] ?? c.loai}
                              </span>
                            </div>
                            {c.ngayHetHan && (
                              <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium shrink-0 ${expired ? "text-rose-600" : "text-emerald-600"}`}>
                                {expired ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                {expired ? "Đã hết hạn" : "Còn hiệu lực"}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[13px]">
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-0.5">Số chứng chỉ</div>
                              <div className="font-mono font-medium">{c.soChungChi || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ngày cấp</div>
                              <div className="font-medium">{formatDate(c.ngayCap)}</div>
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ngày hết hạn</div>
                              <div className={`font-medium ${expired ? "text-rose-600" : ""}`}>{formatDate(c.ngayHetHan)}</div>
                            </div>
                            <div>
                              <div className="text-[11px] text-muted-foreground mb-0.5 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Cấp bởi</div>
                              <div className="font-medium">{c.capBoi || "—"}</div>
                            </div>
                          </div>

                          {c.imageUrl && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Ảnh chứng chỉ
                              </div>
                              <img
                                src={c.imageUrl}
                                alt={c.ten}
                                className="w-28 h-36 object-cover rounded-xl border border-border shadow-sm cursor-pointer"
                                onClick={() => window.open(c.imageUrl, "_blank")}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Nhân viên ── */}
            {tab === "employees" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[15px] font-semibold">Nhân viên được giao</h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{assignedEmployees.length} nhân viên phụ trách cơ sở này</p>
                </div>
                {assignedEmployees.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-25" />
                    <div className="text-[13px]">Chưa có nhân viên nào được giao cho cơ sở này.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {assignedEmployees.map((emp) => (
                      <button key={emp.id} onClick={() => setSelectedEmp(emp)}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors text-left w-full cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-semibold truncate">{emp.name}</div>
                          <div className="text-[11.5px] text-muted-foreground truncate">{emp.email}</div>
                          {emp.role && (
                            <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium ring-1 ring-inset ${ROLE_CLR[emp.role] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
                              {emp.role}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Mã QR ── */}
            {tab === "qr" && (
              <div className="flex flex-col items-center py-6 space-y-5">
                <div className="text-center">
                  <h3 className="text-[15px] font-semibold mb-1">Mã QR cơ sở</h3>
                  <p className="text-[13px] text-muted-foreground">Dùng để truy xuất nguồn gốc và nhận diện cơ sở trong hệ thống</p>
                </div>
                <div className="bg-white border-2 border-border rounded-2xl p-6 shadow-sm text-center">
                  <img src={qrUrl(`CO-SO:${f.id}|${f.name}|${f.code || ""}`)} alt="QR Code" className="w-52 h-52 mx-auto" />
                  <div className="mt-4 space-y-0.5">
                    <div className="text-[15px] font-semibold">{f.name}</div>
                    <div className="text-[12px] text-muted-foreground">Mã: {f.code || `CS-${f.id}`}</div>
                    <div className="text-[12px] text-muted-foreground">{typeLabel(f.type)}</div>
                    {f.gln && <div className="text-[11.5px] text-muted-foreground font-mono mt-1">GLN: {f.gln}</div>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => printQR(f)} className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-[13.5px] font-semibold flex items-center gap-2 hover:bg-emerald-700">
                    <Printer className="w-4 h-4" /> In QR
                  </button>
                  <a href={qrUrl(`CO-SO:${f.id}|${f.name}|${f.code || ""}`)} download={`qr-${f.code || f.id}.png`} target="_blank" rel="noreferrer"
                    className="h-10 px-5 rounded-lg border border-border text-[13.5px] font-semibold flex items-center gap-2 hover:bg-muted">
                    Tải xuống
                  </a>
                </div>
                <div className="text-[11.5px] text-muted-foreground text-center max-w-xs">
                  Dữ liệu QR: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{`CO-SO:${f.id}|${f.name}|${f.code || ""}`}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Detail Panel */}
      {selectedEmp && (
        <EmployeeDetailPanel emp={selectedEmp} onClose={() => setSelectedEmp(null)} />
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold">Mã QR - {f.name}</h3>
              <button onClick={() => setShowQrModal(false)} className="p-1.5 rounded hover:bg-muted">✕</button>
            </div>
            <img src={qrUrl(`CO-SO:${f.id}|${f.name}|${f.code || ""}`)} alt="QR Code" className="w-48 h-48 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground mb-1">{f.name}</p>
            <p className="text-[12px] text-muted-foreground mb-4">Mã: {f.code || `CS-${f.id}`}</p>
            <button onClick={() => printQR(f)} className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-sm font-semibold flex items-center gap-2 mx-auto hover:bg-emerald-700">
              <Printer className="w-4 h-4" /> In QR
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-[13px] text-muted-foreground min-w-[140px] shrink-0">{label}</span>
      <span className="text-[13.5px] font-medium text-foreground">{value}</span>
    </div>
  );
}

const STATUS_CLR: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  invited: "bg-amber-50 text-amber-700 ring-amber-200",
  locked: "bg-rose-50 text-rose-700 ring-rose-200",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Đang hoạt động", invited: "Đã mời", locked: "Đã khóa",
};

function EmployeeDetailPanel({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const facQ = useQuery({
    queryKey: ["empFacilities", emp.id],
    queryFn: () => fetchEmployeeFacilities(emp.id),
  });
  const allFacQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const facilityIds = facQ.data?.facilityIds ?? [];
  const allFacilities = allFacQ.data?.items ?? [];
  const empFacilities = allFacilities.filter((f) => facilityIds.includes(f.id));

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white shadow-2xl w-full max-w-sm flex flex-col h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[15px] font-semibold">Chi tiết nhân viên</span>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 space-y-6">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[20px] font-bold">
              {emp.name.trim().split(/\s+/).slice(-2).map((s) => s[0]?.toUpperCase() ?? "").join("")}
            </div>
            <div>
              <div className="text-[16px] font-bold">{emp.name}</div>
              {emp.role && (
                <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ring-1 ring-inset ${ROLE_CLR[emp.role] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
                  {emp.role}
                </span>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium ring-1 ring-inset ${STATUS_CLR[emp.status] ?? STATUS_CLR.active}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : emp.status === "invited" ? "bg-amber-400" : "bg-rose-500"}`} />
              {STATUS_LABEL[emp.status] ?? emp.status}
            </span>
          </div>

          {/* Contact info */}
          <section>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thông tin liên lạc</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-[13px]">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{emp.email || "—"}</span>
              </div>
              {emp.phone && (
                <div className="flex items-center gap-3 text-[13px]">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{emp.phone}</span>
                </div>
              )}
              {emp.enterpriseName && (
                <div className="flex items-center gap-3 text-[13px]">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{emp.enterpriseName}</span>
                </div>
              )}
            </div>
          </section>

          {/* Permissions */}
          <section>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Phân quyền</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[12px] text-muted-foreground">Vai trò</div>
                <div className="text-[13.5px] font-semibold">{emp.role || "—"}</div>
              </div>
            </div>
          </section>

          {/* Assigned facilities */}
          <section>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Cơ sở phụ trách {facQ.isLoading ? "" : `(${empFacilities.length})`}
            </h4>
            {facQ.isLoading ? (
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải…
              </div>
            ) : empFacilities.length === 0 ? (
              <div className="text-[13px] text-muted-foreground italic py-2">Chưa phụ trách cơ sở nào.</div>
            ) : (
              <div className="space-y-2">
                {empFacilities.map((fc) => (
                  <div key={fc.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-white">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{fc.name}</div>
                      <div className="text-[11px] text-muted-foreground">{fc.code} · {[fc.xa, fc.tinh].filter(Boolean).join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Timestamps */}
          <section>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thời gian</h4>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Tạo lúc: <span className="text-foreground font-medium">{formatDate(emp.createdAt)}</span></span>
              </div>
              {emp.lastSeen && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Hoạt động lần cuối: <span className="text-foreground font-medium">{formatDate(emp.lastSeen)}</span></span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
