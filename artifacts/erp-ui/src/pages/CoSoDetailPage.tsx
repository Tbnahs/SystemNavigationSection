import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Pencil, MapPin, Phone, Building2, Home, Factory,
  Users, QrCode, Printer, Award, Loader2, Globe, Hash,
  CheckCircle2, AlertCircle, Leaf, Info, Map, Shield, LayoutGrid,
} from "lucide-react";
import { fetchFacility, fetchTeaVarieties, type Facility, type Employee } from "@/lib/api";


const TYPE_OPTIONS: { value: Facility["type"]; label: string; color: string; Icon: typeof Home }[] = [
  { value: "ho_lien_ket", label: "Hộ liên kết", color: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: Home },
  { value: "co_so_thue_ngoai", label: "Cơ sở sản xuất (thuê ngoài)", color: "bg-blue-50 text-blue-700 ring-blue-200", Icon: Building2 },
  { value: "co_so_noi_bo", label: "Cơ sở sản xuất (nội bộ)", color: "bg-violet-50 text-violet-700 ring-violet-200", Icon: Factory },
];
function typeLabel(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.label ?? t; }
function typeColor(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.color ?? ""; }
function typeIcon(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.Icon ?? Factory; }

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
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch { return iso; }
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "??";
}

function parseCoords(s: string): { lat: number; lng: number } | null {
  if (!s) return null;
  const m = s.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (!m) return null;
  const lat = parseFloat(m[1]); const lng = parseFloat(m[2]);
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  return null;
}

function MapView({ toaDo }: { toaDo?: string }) {
  const coords = toaDo ? parseCoords(toaDo) : null;
  const lat = coords?.lat ?? 21.7285;
  const lng = coords?.lng ?? 105.6683;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04}%2C${lat - 0.025}%2C${lng + 0.04}%2C${lat + 0.025}&layer=mapnik${coords ? `&marker=${lat}%2C${lng}` : ""}`;
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 320 }}>
      <iframe src={src} title="Bản đồ" className="w-full h-full" style={{ border: 0 }} loading="lazy" />
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
  const [tab, setTab] = useState<"overview" | "location" | "employees" | "qr">("overview");
  const [showQrModal, setShowQrModal] = useState(false);

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

  const tabs = [
    { key: "overview" as const, label: "Thông tin chung", Icon: Info },
    { key: "location" as const, label: "Địa lý & Bản đồ", Icon: Map },
    { key: "employees" as const, label: "Nhân viên", Icon: Users, count: assignedEmployees.length },
    { key: "qr" as const, label: "Mã QR", Icon: QrCode },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">

        {/* Breadcrumb + Back */}
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/portal/co-so")}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <span className="text-muted-foreground text-[13px]">/</span>
          <span className="text-[13px] text-muted-foreground">Cơ sở</span>
          <span className="text-muted-foreground text-[13px]">/</span>
          <span className="text-[13px] font-medium truncate max-w-xs">{f.name}</span>
        </div>

        {/* Hero card */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400" />

          <div className="px-6 py-5">
            {/* Icon + actions row */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TypeIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2">
                {f.type === "ho_lien_ket" && (
                  <button onClick={() => setShowQrModal(true)}
                    className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-[13px] font-medium flex items-center gap-2 hover:bg-emerald-700">
                    <QrCode className="w-3.5 h-3.5" /> Xem QR
                  </button>
                )}
              </div>
            </div>

            {/* Name + meta */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-xl font-bold">{f.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium ring-1 ring-inset ${typeColor(f.type)}`}>
                  {typeLabel(f.type)}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ring-1 ring-inset ${isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-300"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                </span>
              </div>

              {/* Quick info pills */}
              <div className="flex flex-wrap gap-3 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Mã: <span className="font-mono font-medium text-foreground">{f.code || `CS-${f.id}`}</span>
                </span>
                {f.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {f.phone}
                  </span>
                )}
                {(f.xa || f.tinh) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {[f.xa, f.tinh].filter(Boolean).join(", ")}
                  </span>
                )}
                {f.enterpriseName && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> {f.enterpriseName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11.5px] text-muted-foreground">Mã GLN</div>
              <div className="text-[14px] font-semibold font-mono">{f.gln || "—"}</div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11.5px] text-muted-foreground">Nhân viên</div>
              <div className="text-[14px] font-semibold">{assignedEmployees.length} người</div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-[11.5px] text-muted-foreground">Giống chè</div>
              <div className="text-[14px] font-semibold">{f.giong_che_ids?.length || 0} giống</div>
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {tabs.map(({ key, label, Icon, count }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 flex-1 py-3.5 text-[13px] font-medium border-b-2 transition-colors ${tab === key ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {count !== undefined && count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">{count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* Tab: Thông tin chung */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thông tin cơ bản</h3>
                    <div className="space-y-3">
                      <Row label="Tên cơ sở" value={f.name} />
                      <Row label="Mã cơ sở" value={<span className="font-mono">{f.code || `CS-${f.id}`}</span>} />
                      <Row label="Loại cơ sở" value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-medium ring-1 ring-inset ${typeColor(f.type)}`}>
                          {typeLabel(f.type)}
                        </span>
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
                      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Định danh GS1</h3>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-[11.5px] text-blue-600 font-medium">Global Location Number (GLN)</div>
                          <div className="text-[15px] font-mono font-semibold text-blue-900 tracking-wider">{f.gln}</div>
                        </div>
                      </div>
                    </section>
                  )}

                  {f.notes && (
                    <section>
                      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ghi chú</h3>
                      <p className="text-[13.5px] text-foreground bg-muted/40 rounded-xl px-4 py-3 border border-border">{f.notes}</p>
                    </section>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {f.type === "ho_lien_ket" && (
                    <section>
                      <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Giống chè canh tác</h3>
                      {f.giong_che_ids?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {f.giong_che_ids.map(gid => {
                            const tv = teaVarieties.find(t => t.id === gid);
                            if (!tv) return null;
                            return (
                              <span key={gid} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[12.5px] font-medium ring-1 ring-emerald-200">
                                <Leaf className="w-3 h-3" />
                                {tv.name}{tv.code && <span className="text-emerald-600 text-[11px]">({tv.code})</span>}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[13px] text-muted-foreground italic">Chưa có giống chè được ghi nhận.</div>
                      )}
                    </section>
                  )}

                  <section>
                    <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Thời gian</h3>
                    <div className="space-y-3">
                      <Row label="Ngày tạo" value={formatDate(f.createdAt)} />
                      <Row label="Cập nhật lần cuối" value={formatDate(f.updatedAt)} />
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* Tab: Địa lý & Bản đồ */}
            {tab === "location" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="space-y-3">
                    <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Địa chỉ</h3>
                    <Row label="Tỉnh / Thành phố" value={f.tinh || "—"} />
                    <Row label="Xã / Phường" value={f.xa || "—"} />
                    <Row label="Địa chỉ chi tiết" value={f.address || "—"} />
                  </section>
                </div>

                <section>
                  <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bản đồ vị trí</h3>
                  <MapView toaDo="" />
                  <p className="text-[11.5px] text-muted-foreground mt-2">
                    Bản đồ hiện thị khu vực Tân Cương, Thái Nguyên. Nhập tọa độ GPS trong form chỉnh sửa để định vị chính xác.
                  </p>
                </section>
              </div>
            )}

            {/* Tab: Nhân viên */}
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
                      <div key={emp.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-semibold truncate">{emp.name}</div>
                          <div className="text-[11.5px] text-muted-foreground truncate">{emp.email}</div>
                          {emp.role && (
                            <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium ring-1 ring-inset ${ROLE_CLR[emp.role] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
                              {emp.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Mã QR */}
            {tab === "qr" && (
              <div className="flex flex-col items-center py-6 space-y-5">
                <div className="text-center">
                  <h3 className="text-[15px] font-semibold mb-1">Mã QR cơ sở</h3>
                  <p className="text-[13px] text-muted-foreground">Dùng để truy xuất nguồn gốc và nhận diện cơ sở trong hệ thống</p>
                </div>

                <div className="bg-white border-2 border-border rounded-2xl p-6 shadow-sm text-center">
                  <img
                    src={qrUrl(`CO-SO:${f.id}|${f.name}|${f.code || ""}`)}
                    alt="QR Code"
                    className="w-52 h-52 mx-auto"
                  />
                  <div className="mt-4 space-y-0.5">
                    <div className="text-[15px] font-semibold">{f.name}</div>
                    <div className="text-[12px] text-muted-foreground">Mã: {f.code || `CS-${f.id}`}</div>
                    <div className="text-[12px] text-muted-foreground">{typeLabel(f.type)}</div>
                    {f.gln && <div className="text-[11.5px] text-muted-foreground font-mono mt-1">GLN: {f.gln}</div>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => printQR(f)}
                    className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-[13.5px] font-semibold flex items-center gap-2 hover:bg-emerald-700">
                    <Printer className="w-4 h-4" /> In QR
                  </button>
                  <a
                    href={qrUrl(`CO-SO:${f.id}|${f.name}|${f.code || ""}`)}
                    download={`qr-${f.code || f.id}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-5 rounded-lg border border-border text-[13.5px] font-semibold flex items-center gap-2 hover:bg-muted">
                    Tải xuống
                  </a>
                </div>

                <div className="text-[11.5px] text-muted-foreground text-center max-w-xs">
                  Dữ liệu mã QR: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{`CO-SO:${f.id}|${f.name}|${f.code || ""}`}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Quick Modal */}
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
