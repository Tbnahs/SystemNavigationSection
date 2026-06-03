import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { useLocation } from "wouter";
import {
  Plus, Pencil, X, Loader2, Search, Factory, QrCode, Printer,
  Building2, Home, MapPin, Phone, Users, Upload, Download, CheckCircle, ChevronDown,
  Award, Trash2, HelpCircle, Maximize2, Eye,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  fetchFacilities, createFacility, updateFacility, deleteFacility,
  fetchEnterprises, fetchEmployees, assignFacilityEmployees,
  fetchTeaVarieties,
  type Facility, type TeaVariety, type FacilityCertItem, type FacilityBoPhanItem,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PROVINCES_VN, COMMUNE_MAP } from "@/lib/vietnam-data";

const TYPE_OPTIONS: { value: Facility["type"]; label: string; color: string }[] = [
  { value: "ho_lien_ket", label: "Hộ liên kết", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "co_so_thue_ngoai", label: "Cơ sở sản xuất (thuê ngoài)", color: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "co_so_noi_bo", label: "Cơ sở sản xuất (nội bộ)", color: "bg-violet-50 text-violet-700 ring-violet-200" },
];
function typeLabel(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.label ?? t; }
function typeColor(t: Facility["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.color ?? ""; }

const STATUS_OPTIONS = [
  { value: "active" as const, label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "inactive" as const, label: "Ngưng hoạt động", cls: "bg-slate-100 text-slate-600 ring-slate-300" },
];
function statusCls(s: "active" | "inactive") { return STATUS_OPTIONS.find(o => o.value === s)?.cls ?? ""; }
function statusLabel(s: "active" | "inactive") { return STATUS_OPTIONS.find(o => o.value === s)?.label ?? s; }

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
    <script>window.onload=()=>window.print();</script>
    </body></html>
  `);
  win.document.close();
}

type CertItem = FacilityCertItem;
const CERT_LOAI_OPTIONS = [
  { value: "ocop", label: "OCOP" },
  { value: "vietgap", label: "VietGAP" },
  { value: "organic", label: "Organic" },
  { value: "iso", label: "ISO" },
  { value: "khac", label: "Khác" },
] as const;

type BoPhanItem = FacilityBoPhanItem;

type FForm = {
  enterpriseId: number | null;
  name: string;
  code: string;
  type: Facility["type"];
  phone: string;
  tinh: string;
  xa: string;
  address: string;
  gln: string;
  status: "active" | "inactive";
  notes: string;
  giong_che_ids: number[];
  dienTich: string;
  donViDienTich: string;
  toaDo: string;
  chungChi: CertItem[];
  boPhan: BoPhanItem[];
};
const EMPTY_F: FForm = {
  enterpriseId: null, name: "", code: "", type: "ho_lien_ket",
  phone: "", tinh: "", xa: "", address: "", gln: "", status: "active", notes: "",
  giong_che_ids: [],
  dienTich: "", donViDienTich: "Ha", toaDo: "",
  chungChi: [], boPhan: [],
};

function parseCoords(s: string): { lat: number; lng: number } | null {
  const m = s.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (!m) return null;
  const lat = parseFloat(m[1]); const lng = parseFloat(m[2]);
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  return null;
}

function MapView({ tinh, xa, address, toaDo }: { tinh?: string; xa?: string; address?: string; toaDo?: string }) {
  const q = [address, xa, tinh].filter(Boolean).join(", ");
  if (!q) return (
    <div className="rounded-xl border border-border bg-muted/40 h-52 flex items-center justify-center text-muted-foreground text-sm">
      <MapPin className="w-4 h-4 mr-2" /> Nhập địa chỉ để xem bản đồ
    </div>
  );
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 280 }}>
      <iframe key={q} src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=14`}
        title="Bản đồ" className="w-full h-full" style={{ border: 0 }} loading="lazy" />
    </div>
  );
}

function ProvinceSelect({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1.5">Tỉnh / Thành phố <span className="text-rose-500">*</span></label>
      <div className="relative">
        <select value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 pl-3 pr-8 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary appearance-none cursor-pointer">
          <option value="">Chọn Tỉnh/Thành phố</option>
          {PROVINCES_VN.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function CommuneSelect({ province, value, onChange }: { province?: string; value?: string; onChange?: (v: string) => void }) {
  const options = province ? (COMMUNE_MAP[province] ?? []) : [];
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1.5">Xã / Phường <span className="text-rose-500">*</span></label>
      {options.length > 0 ? (
        <div className="relative">
          <select value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary appearance-none cursor-pointer">
            <option value="">Chọn Xã/Phường</option>
            {options.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange?.(e.target.value)}
          placeholder="Nhập xã / phường / thị trấn"
          className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
      )}
    </div>
  );
}

export default function CoSoPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isSuperAdmin = !user?.enterpriseId;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Facility | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
  const [qrTarget, setQrTarget] = useState<Facility | null>(null);
  const [form, setForm] = useState<FForm>(EMPTY_F);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"info" | "location" | "certs" | "departments">("info");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const certImgRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const empQ = useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });
  const tvQ = useQuery({ queryKey: ["teaVarieties"], queryFn: fetchTeaVarieties });

  function inv() { qc.invalidateQueries({ queryKey: ["facilities"] }); }

  const createMu = useMutation({
    mutationFn: (b: FForm) => createFacility(b),
    onSuccess: async (data) => {
      if (selectedEmployeeIds.length > 0) await assignFacilityEmployees(data.item.id, selectedEmployeeIds);
      inv(); close_();
    },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, b }: { id: number; b: FForm }) => updateFacility(id, b),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deleteFacility(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });
  const assignMu = useMutation({
    mutationFn: ({ id, ids }: { id: number; ids: number[] }) => assignFacilityEmployees(id, ids),
    onSuccess: () => inv(),
  });

  function close_() {
    setDrawerOpen(false); setEditItem(null); setForm(EMPTY_F); setErr(null);
    setActiveTab("info"); setSelectedEmployeeIds([]); certImgRefs.current = {};
  }

  function exportExcel() {
    const rows = filtered.map(f => ({
      "Tên cơ sở": f.name, "Mã": f.code || `CS-${f.id}`, "Loại": typeLabel(f.type),
      "Doanh nghiệp": f.enterpriseName ?? "", "GLN": f.gln, "Số điện thoại": f.phone,
      "Tỉnh / Thành phố": f.tinh, "Xã / Phường": f.xa, "Địa chỉ": f.address,
      "Trạng thái": statusLabel(f.status), "Ghi chú": f.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 28 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 35 }, { wch: 18 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Co So");
    XLSX.writeFile(wb, `danh-sach-co-so-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function downloadTemplate() {
    const sample = [
      { "Tên cơ sở": "Hộ Nguyễn Văn A", "Mã": "CS-001", "Loại": "ho_lien_ket", "Số điện thoại": "0912345678", "Tỉnh / Thành phố": "Thái Nguyên", "Xã / Phường": "Xã Quân Chu (H. Đại Từ)", "Địa chỉ": "Thôn Nà Hồng", "GLN": "", "Ghi chú": "" },
      { "Tên cơ sở": "Xưởng chế biến B", "Mã": "CS-002", "Loại": "co_so_thue_ngoai", "Số điện thoại": "0987654321", "Tỉnh / Thành phố": "Thái Nguyên", "Xã / Phường": "Xã Phú Lạc (H. Đại Từ)", "Địa chỉ": "Xã Quân Chu, Đại Từ", "GLN": "", "Ghi chú": "Thuê ngoài" },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    ws["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template-import-co-so.xlsx");
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = ""; setImportLoading(true); setImportResult(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
      let ok = 0; let fail = 0;
      for (const row of rows) {
        const name = (row["Tên cơ sở"] || row["ten_co_so"] || "").trim();
        if (!name) { fail++; continue; }
        const typeRaw = (row["Loại"] || row["loai"] || "ho_lien_ket").trim();
        const typeMap: Record<string, Facility["type"]> = {
          ho_lien_ket: "ho_lien_ket", "Hộ liên kết": "ho_lien_ket",
          co_so_thue_ngoai: "co_so_thue_ngoai", "Cơ sở sản xuất (thuê ngoài)": "co_so_thue_ngoai",
          co_so_noi_bo: "co_so_noi_bo", "Cơ sở sản xuất (nội bộ)": "co_so_noi_bo",
        };
        const type: Facility["type"] = typeMap[typeRaw] ?? "ho_lien_ket";
        try {
          await createFacility({
            enterpriseId: isSuperAdmin ? null : (user?.enterpriseId ?? null), name,
            code: (row["Mã"] || row["ma"] || "").trim(), type,
            phone: (row["Số điện thoại"] || row["sdt"] || "").trim(),
            tinh: (row["Tỉnh / Thành phố"] || row["tinh"] || "").trim(),
            xa: (row["Xã / Phường"] || row["xa"] || "").trim(),
            address: (row["Địa chỉ"] || row["dia_chi"] || "").trim(),
            gln: (row["GLN"] || row["gln"] || "").trim(),
            status: "active",
            notes: (row["Ghi chú"] || row["ghi_chu"] || "").trim(),
          });
          ok++;
        } catch { fail++; }
      }
      inv(); setImportResult({ ok, fail });
    } catch { setImportResult({ ok: 0, fail: -1 }); }
    finally { setImportLoading(false); }
  }

  function openEdit(f: Facility) {
    setEditItem(f);
    setForm({
      enterpriseId: f.enterpriseId, name: f.name, code: f.code, type: f.type,
      phone: f.phone, tinh: f.tinh ?? "", xa: f.xa ?? "", address: f.address,
      gln: f.gln ?? "", status: f.status, notes: f.notes,
      giong_che_ids: f.giong_che_ids ?? [],
      dienTich: "", donViDienTich: "Ha", toaDo: "",
      chungChi: [], boPhan: [],
    });
    setErr(null); setDrawerOpen(true);
  }

  function setF<K extends keyof FForm>(k: K, v: FForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function addCert() {
    setF("chungChi", [...form.chungChi, { id: Date.now().toString(), ten: "", loai: "ocop", soChungChi: "", ngayCap: "", ngayHetHan: "", capBoi: "", imageUrl: "" }]);
  }
  function updateCert(id: string, key: keyof CertItem, val: string) {
    setF("chungChi", form.chungChi.map(c => c.id === id ? { ...c, [key]: val } : c));
  }
  function removeCert(id: string) { setF("chungChi", form.chungChi.filter(c => c.id !== id)); }
  function handleCertImg(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateCert(id, "imageUrl", ev.target?.result as string);
    reader.readAsDataURL(file); e.target.value = "";
  }

  function addBoPhan() {
    setF("boPhan", [...form.boPhan, { id: Date.now().toString(), ma: "", ten: "", ghiChu: "" }]);
  }
  function updateBoPhan(id: string, key: keyof BoPhanItem, val: string) {
    setF("boPhan", form.boPhan.map(b => b.id === id ? { ...b, [key]: val } : b));
  }
  function removeBoPhan(id: string) { setF("boPhan", form.boPhan.filter(b => b.id !== id)); }

  function handleSubmit() {
    setErr(null);
    if (!form.name.trim()) { setErr("Vui lòng nhập tên cơ sở."); return; }
    if (editItem) updateMu.mutate({ id: editItem.id, b: form });
    else createMu.mutate(form);
  }

  const items = listQ.data?.items ?? [];
  const filtered = items
    .filter(f => typeFilter === "all" || f.type === typeFilter)
    .filter(f => !search.trim() || [f.name, f.code, f.address, f.tinh, f.xa].some(s => (s ?? "").toLowerCase().includes(search.toLowerCase())));
  const isPending = createMu.isPending || updateMu.isPending;

  const enterprises = dnQ.data?.items ?? [];
  const employees = empQ.data?.items ?? [];
  const teaVarieties = tvQ.data?.items ?? [];

  const currentEnterpriseId = editItem?.enterpriseId ?? (isSuperAdmin ? form.enterpriseId : (user?.enterpriseId ?? null));
  const relevantEmployees = employees.filter(e => e.enterpriseId === currentEnterpriseId || !currentEnterpriseId);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Cơ sở</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Quản lý Cơ sở</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {TYPE_OPTIONS.map(opt => {
            const cnt = items.filter(f => f.type === opt.value).length;
            const Icon = opt.value === "ho_lien_ket" ? Home : opt.value === "co_so_thue_ngoai" ? Building2 : Factory;
            return (
              <div key={opt.value} className="bg-white border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-muted-foreground">{opt.label}</span>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{cnt}</div>
              </div>
            );
          })}
        </div>

        {/* Import result toast */}
        {importResult && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] ${importResult.fail === -1 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            {importResult.fail === -1 ? "Lỗi đọc file. Vui lòng kiểm tra định dạng Excel." : `Import xong: ${importResult.ok} thành công${importResult.fail > 0 ? `, ${importResult.fail} lỗi` : ""}.`}
            <button onClick={() => setImportResult(null)} className="ml-auto p-0.5 hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, mã, địa chỉ, tỉnh…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
            <option value="all">Tất cả loại</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={exportExcel} className="h-10 px-3 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted">
            <Download className="w-4 h-4 text-muted-foreground" /> Xuất Excel
          </button>
          <button onClick={downloadTemplate} className="h-10 px-3 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted">
            <Download className="w-4 h-4 text-muted-foreground" /> File mẫu
          </button>
          <button onClick={() => importRef.current?.click()} disabled={importLoading}
            className="h-10 px-3 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted disabled:opacity-60">
            {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
            Import Excel
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
          <button onClick={() => { setForm({ ...EMPTY_F, enterpriseId: isSuperAdmin ? null : (user?.enterpriseId ?? null) }); setDrawerOpen(true); }}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110">
            <Plus className="w-4 h-4" /> Thêm cơ sở
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Tên cơ sở</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Doanh nghiệp</th>
                  <th className="px-4 py-3">Địa chỉ</th>
                  <th className="px-4 py-3">GLN</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <Factory className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search || typeFilter !== "all" ? "Không tìm thấy cơ sở phù hợp." : "Chưa có cơ sở nào. Thêm cơ sở đầu tiên!"}
                  </td></tr>
                )}
                {filtered.map(f => (
                  <tr key={f.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-[11.5px] text-muted-foreground">Mã: {f.code || `CS-${f.id}`}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${typeColor(f.type)}`}>{typeLabel(f.type)}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">{f.enterpriseName ?? "—"}</td>
                    <td className="px-4 py-3">
                      {f.phone && <div className="flex items-center gap-1 text-[13px]"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{f.phone}</div>}
                      {(f.xa || f.tinh) && <div className="flex items-center gap-1 text-[12px] text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{[f.xa, f.tinh].filter(Boolean).join(", ")}</div>}
                      {f.address && <div className="text-[12px] text-muted-foreground mt-0.5">{f.address}</div>}
                      {f.type === "ho_lien_ket" && f.giong_che_ids?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {f.giong_che_ids.map(id => {
                            const tv = teaVarieties.find((t: TeaVariety) => t.id === id);
                            if (!tv) return null;
                            return <span key={id} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10.5px] font-medium ring-1 ring-emerald-200">{tv.name}</span>;
                          })}
                        </div>
                      )}
                      {!f.phone && !f.xa && !f.tinh && !f.address && (!f.giong_che_ids?.length || f.type !== "ho_lien_ket") && <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-mono">{f.gln || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${statusCls(f.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${f.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {statusLabel(f.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setLocation(`/portal/co-so/${f.id}`)} className="p-1.5 rounded hover:bg-emerald-50" title="Xem chi tiết"><Eye className="w-4 h-4 text-emerald-600" /></button>
                        {f.type === "ho_lien_ket" && <button onClick={() => setQrTarget(f)} className="p-1.5 rounded hover:bg-muted" title="Xem QR"><QrCode className="w-4 h-4 text-muted-foreground" /></button>}
                        <button onClick={() => openEdit(f)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            {filtered.length} / {items.length} cơ sở
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold">Mã QR - {qrTarget.name}</h3>
              <button onClick={() => setQrTarget(null)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-center mb-3">
              <img src={qrUrl(`CO-SO:${qrTarget.id}|${qrTarget.name}|${qrTarget.code || ""}`)} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-[13px] text-muted-foreground mb-1">{qrTarget.name}</p>
            <p className="text-[12px] text-muted-foreground mb-4">Mã: {qrTarget.code || `CS-${qrTarget.id}`}</p>
            <button onClick={() => printQR(qrTarget)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 mx-auto hover:brightness-110">
              <Printer className="w-4 h-4" /> In QR
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <X className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-[16px] font-semibold text-center mb-1">Xóa cơ sở?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">
              Xóa <span className="font-semibold text-foreground">{deleteTarget.name}</span> khỏi hệ thống.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={deleteMu.isPending} onClick={() => deleteMu.mutate(deleteTarget.id)}
                className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-tab Drawer (right panel) */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 flex justify-end">
          <div className="bg-white shadow-2xl w-full max-w-2xl flex flex-col h-full overflow-y-auto">

            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="text-[17px] font-semibold uppercase tracking-wide">
                {editItem ? `Sửa: ${editItem.name}` : "Thêm mới cơ sở"}
              </div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
              {([
                { key: "info", label: "Thông tin cơ sở" },
                { key: "location", label: "Diện tích & vị trí địa lý" },
                { key: "certs", label: "Thông tin chứng chỉ" },
                { key: "departments", label: "Bộ phận" },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-[13px] font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                  {tab.label}
                  {tab.key === "certs" && form.chungChi.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{form.chungChi.length}</span>
                  )}
                  {tab.key === "departments" && form.boPhan.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{form.boPhan.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-6 py-5">

              {/* TAB 1: Thông tin cơ sở */}
              {activeTab === "info" && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Tên cơ sở <span className="text-rose-500">*</span></label>
                    <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Hộ ông Nguyễn Văn A"
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Mã cơ sở</label>
                      <input value={form.code} onChange={e => setF("code", e.target.value)} placeholder="CS-001"
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Loại cơ sở</label>
                      <select value={form.type} onChange={e => { setF("type", e.target.value as Facility["type"]); if (e.target.value !== "ho_lien_ket") setF("giong_che_ids", []); }}
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                        {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Số điện thoại</label>
                      <input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="09xx xxx xxx"
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                      <select value={form.status} onChange={e => setF("status", e.target.value as "active" | "inactive")}
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Doanh nghiệp</label>
                      <select value={form.enterpriseId ?? ""} onChange={e => setF("enterpriseId", e.target.value ? Number(e.target.value) : null)}
                        className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                        <option value="">-- Chưa gắn doanh nghiệp --</option>
                        {enterprises.map(d => <option key={d.id} value={d.id}>{d.tenHienThi}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      GLN <span className="text-[11px] text-muted-foreground font-normal">(Global Location Number)</span>
                    </label>
                    <input value={form.gln} onChange={e => setF("gln", e.target.value)} placeholder="0000000000000 (13 chữ số)" maxLength={13}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm font-mono outline-none focus:border-primary" />
                    <div className="text-[11.5px] text-muted-foreground mt-1">Mã định danh địa điểm toàn cầu GS1.</div>
                  </div>
                  {form.type === "ho_lien_ket" && (
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Giống chè <span className="ml-1 text-[11px] text-muted-foreground font-normal">Chọn một hoặc nhiều giống</span></label>
                      {teaVarieties.length === 0 ? (
                        <div className="px-3 py-2.5 rounded-lg border border-border bg-muted/40 text-[12.5px] text-muted-foreground">Chưa có giống chè nào.</div>
                      ) : (
                        <div className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                          {teaVarieties.map((tv: TeaVariety) => {
                            const checked = form.giong_che_ids.includes(tv.id);
                            return (
                              <label key={tv.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/40 ${checked ? "bg-emerald-50/60" : ""}`}>
                                <input type="checkbox" className="accent-primary shrink-0" checked={checked}
                                  onChange={e => setF("giong_che_ids", e.target.checked ? [...form.giong_che_ids, tv.id] : form.giong_che_ids.filter(id => id !== tv.id))} />
                                <span className="text-[13px] font-medium">{tv.name}{tv.code && <span className="ml-1.5 text-[11px] text-muted-foreground">({tv.code})</span>}</span>
                                {checked && <span className="ml-auto w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-none stroke-white stroke-2"><polyline points="1.5,6 4.5,9 10.5,3" /></svg></span>}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                    <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} placeholder="Ghi chú thêm…"
                      className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" />
                  </div>
                </div>
              )}

              {/* TAB 2: Diện tích & vị trí địa lý */}
              {activeTab === "location" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <ProvinceSelect value={form.tinh} onChange={(v) => { setF("tinh", v); setF("xa", ""); }} />
                    <CommuneSelect province={form.tinh} value={form.xa} onChange={(v) => setF("xa", v)} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Địa chỉ chi tiết <span className="text-rose-500">*</span></label>
                    <input value={form.address} onChange={e => setF("address", e.target.value)} placeholder="Số nhà, đường, thôn xóm…"
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>

                  {/* Diện tích + Đơn vị */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Diện tích</label>
                    <div className="flex gap-3">
                      <input value={form.dienTich} onChange={e => setF("dienTich", e.target.value)} placeholder="VD: 20" type="number" min="0" step="any"
                        className="flex-1 h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                      <div className="relative w-44">
                        <select value={form.donViDienTich} onChange={e => setF("donViDienTich", e.target.value)}
                          className="w-full h-10 pl-3 pr-8 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white appearance-none">
                          {["Ha", "m²", "sào", "mẫu", "km²"].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    {form.dienTich && <div className="text-[11.5px] text-muted-foreground mt-1">= {form.dienTich} {form.donViDienTich}</div>}
                  </div>

                  {/* Tọa độ */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
                      Tọa độ
                      <span title="Nhập theo định dạng: vĩ độ, kinh độ (VD: 21.7285, 105.6683)"><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></span>
                    </label>
                    <textarea value={form.toaDo} onChange={e => setF("toaDo", e.target.value)} rows={3}
                      placeholder={"Nhập tọa độ GPS:\nVĩ độ, Kinh độ (VD: 21.7285, 105.6683)"}
                      className="w-full px-3 py-2.5 rounded-lg border border-border text-sm font-mono outline-none focus:border-primary resize-none" />
                    {form.toaDo && !parseCoords(form.toaDo) && (
                      <div className="text-[11.5px] text-amber-600 mt-1">Định dạng chưa nhận ra. Thử: 21.7285, 105.6683</div>
                    )}
                    {parseCoords(form.toaDo) && (
                      <button type="button" onClick={() => setF("toaDo", "")} className="text-[12px] text-primary mt-1 hover:underline">
                        Đặt lại bản đồ
                      </button>
                    )}
                  </div>

                  {/* Map */}
                  <div>
                    <label className="block text-[13px] font-medium mb-2">Bản đồ</label>
                    <MapView tinh={form.tinh} xa={form.xa} address={form.address} toaDo={form.toaDo} />
                  </div>
                </div>
              )}

              {/* TAB 3: Thông tin chứng chỉ */}
              {activeTab === "certs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-[14px] font-semibold">Chứng nhận / Chứng chỉ</span>
                      <span className="text-[12px] text-muted-foreground">({form.chungChi.length} chứng chỉ)</span>
                    </div>
                    <button onClick={addCert} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90">
                      <Plus className="w-3.5 h-3.5" /> Thêm chứng chỉ
                    </button>
                  </div>
                  {form.chungChi.length === 0 ? (
                    <div className="py-16 text-center text-[13px] text-muted-foreground border border-dashed border-border rounded-xl">
                      <Award className="w-8 h-8 mx-auto mb-2 opacity-25" />
                      Chưa có chứng chỉ. Nhấn "+ Thêm chứng chỉ" để bắt đầu.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.chungChi.map((c, idx) => (
                        <div key={c.id} className="border border-border rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Chứng chỉ #{idx + 1}</span>
                            <button onClick={() => removeCert(c.id)} className="p-1 rounded hover:bg-rose-50 text-muted-foreground hover:text-rose-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[12px] font-medium mb-1">Tên chứng chỉ <span className="text-rose-500">*</span></label>
                              <input value={c.ten} onChange={e => updateCert(c.id, "ten", e.target.value)} placeholder="OCOP 4 sao 2024"
                                className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label className="block text-[12px] font-medium mb-1">Loại</label>
                              <select value={c.loai} onChange={e => updateCert(c.id, "loai", e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                                {CERT_LOAI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[12px] font-medium mb-1">Số chứng chỉ</label>
                              <input value={c.soChungChi} onChange={e => updateCert(c.id, "soChungChi", e.target.value)} placeholder="CC-001"
                                className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label className="block text-[12px] font-medium mb-1">Ngày cấp</label>
                              <input type="date" value={c.ngayCap} onChange={e => updateCert(c.id, "ngayCap", e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label className="block text-[12px] font-medium mb-1">Ngày hết hạn</label>
                              <input type="date" value={c.ngayHetHan} onChange={e => updateCert(c.id, "ngayHetHan", e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1">Cấp bởi</label>
                            <input value={c.capBoi} onChange={e => updateCert(c.id, "capBoi", e.target.value)} placeholder="Bộ Nông nghiệp & PTNT, UBND tỉnh…"
                              className="w-full h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1.5">Ảnh chứng chỉ</label>
                            {c.imageUrl ? (
                              <div className="relative w-28 h-36 group">
                                <img src={c.imageUrl} alt={c.ten} className="w-full h-full object-cover rounded-lg border border-border" />
                                <button onClick={() => updateCert(c.id, "imageUrl", "")}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-rose-500" />
                                </button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => certImgRefs.current[c.id]?.click()}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                <Upload className="w-3.5 h-3.5" /> Tải lên ảnh chứng chỉ
                              </button>
                            )}
                            <input type="file" accept="image/*" className="hidden"
                              ref={el => { certImgRefs.current[c.id] = el; }}
                              onChange={e => handleCertImg(c.id, e)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Bộ phận */}
              {activeTab === "departments" && (
                <div className="space-y-4">
                  <div>
                    <button onClick={addBoPhan} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium border border-primary text-primary rounded-lg hover:bg-primary/5">
                      <Plus className="w-3.5 h-3.5" /> Thêm bộ phận
                    </button>
                  </div>
                  {form.boPhan.length === 0 ? (
                    <div className="py-16 text-center text-[13px] text-muted-foreground border border-dashed border-border rounded-xl">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-25" />
                      Chưa có bộ phận nào. Nhấn "+ Thêm bộ phận" để bắt đầu.
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
                            <th className="px-4 py-3 w-12 text-center">STT</th>
                            <th className="px-4 py-3 w-40">Mã bộ phận</th>
                            <th className="px-4 py-3">Tên bộ phận</th>
                            <th className="px-4 py-3">Ghi chú</th>
                            <th className="px-4 py-3 w-20 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.boPhan.map((b, idx) => (
                            <tr key={b.id} className="border-t border-border hover:bg-muted/20">
                              <td className="px-4 py-2.5 text-[13px] text-muted-foreground text-center">{idx + 1}</td>
                              <td className="px-4 py-2.5">
                                <input value={b.ma} onChange={e => updateBoPhan(b.id, "ma", e.target.value)} placeholder="BP-001"
                                  className="w-full h-8 px-2 rounded border border-border text-sm outline-none focus:border-primary bg-white" />
                              </td>
                              <td className="px-4 py-2.5">
                                <input value={b.ten} onChange={e => updateBoPhan(b.id, "ten", e.target.value)} placeholder="Tên bộ phận…"
                                  className="w-full h-8 px-2 rounded border border-border text-sm outline-none focus:border-primary bg-white" />
                              </td>
                              <td className="px-4 py-2.5">
                                <input value={b.ghiChu} onChange={e => updateBoPhan(b.id, "ghiChu", e.target.value)} placeholder="Ghi chú…"
                                  className="w-full h-8 px-2 rounded border border-border text-sm outline-none focus:border-primary bg-white" />
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button onClick={() => removeBoPhan(b.id)} className="p-1.5 rounded hover:bg-rose-50 text-muted-foreground hover:text-rose-600">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Nhân viên phụ trách trong tab Bộ phận */}
                  <div className="mt-6 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-[14px] font-semibold">Nhân viên phụ trách</span>
                    </div>
                    {relevantEmployees.length === 0 ? (
                      <div className="py-6 text-center text-[13px] text-muted-foreground border border-dashed border-border rounded-xl">
                        <Users className="w-7 h-7 mx-auto mb-2 opacity-25" />
                        Chưa có nhân viên nào.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                        {relevantEmployees.map(emp => (
                          <label key={emp.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40 cursor-pointer">
                            <input type="checkbox" className="accent-primary" checked={selectedEmployeeIds.includes(emp.id)}
                              onChange={e => { if (e.target.checked) setSelectedEmployeeIds(p => [...p, emp.id]); else setSelectedEmployeeIds(p => p.filter(id => id !== emp.id)); }} />
                            <div className={`w-7 h-7 rounded-full text-white text-[10px] font-semibold flex items-center justify-center shrink-0 ${emp.avatarColor}`}>
                              {emp.name.slice(-2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12.5px] font-medium truncate">{emp.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{emp.role}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {editItem && selectedEmployeeIds.length > 0 && (
                      <button onClick={() => assignMu.mutate({ id: editItem.id, ids: selectedEmployeeIds })} disabled={assignMu.isPending}
                        className="mt-3 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:brightness-110 disabled:opacity-60">
                        {assignMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Users className="w-4 h-4" /> Lưu phân công
                      </button>
                    )}
                  </div>
                </div>
              )}

              {err && <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{err}</div>}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/30 shrink-0 rounded-b-2xl">
              <button onClick={close_} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted flex items-center gap-2">
                <X className="w-4 h-4" /> Hủy
              </button>
              <button disabled={isPending} onClick={handleSubmit}
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Thêm cơ sở"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
