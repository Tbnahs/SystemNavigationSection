import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, X, Loader2, Search, Factory, QrCode, Printer,
  Building2, Home, MapPin, Phone, Users, Upload, Download, CheckCircle, Lock, ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  fetchFacilities, createFacility, updateFacility, deleteFacility,
  fetchEnterprises, fetchEmployees, assignFacilityEmployees,
  type Facility,
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
};
const EMPTY_F: FForm = {
  enterpriseId: null, name: "", code: "", type: "ho_lien_ket",
  phone: "", tinh: "", xa: "", address: "", gln: "", status: "active", notes: "",
};

function ProvinceSelect({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1.5">Tỉnh / Thành phố</label>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 pl-3 pr-8 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary appearance-none cursor-pointer"
        >
          <option value="">-- Chọn tỉnh / thành phố --</option>
          {PROVINCES_VN.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
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
      <label className="block text-[13px] font-medium mb-1.5">Xã / Phường</label>
      {options.length > 0 ? (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value="">-- Chọn xã / phường --</option>
            {options.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Nhập xã / phường / thị trấn"
          className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
        />
      )}
    </div>
  );
}

export default function CoSoPage() {
  const { user } = useAuth();
  const isSuperAdmin = !user?.enterpriseId;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Facility | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
  const [qrTarget, setQrTarget] = useState<Facility | null>(null);
  const [form, setForm] = useState<FForm>(EMPTY_F);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"info" | "employees">("info");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const empQ = useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });

  function inv() { qc.invalidateQueries({ queryKey: ["facilities"] }); }

  const createMu = useMutation({
    mutationFn: (b: FForm) => createFacility(b),
    onSuccess: async (data) => {
      if (selectedEmployeeIds.length > 0) {
        await assignFacilityEmployees(data.item.id, selectedEmployeeIds);
      }
      inv();
      close_();
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

  function close_() { setDrawerOpen(false); setEditItem(null); setForm(EMPTY_F); setErr(null); setActiveTab("info"); setSelectedEmployeeIds([]); }

  function exportExcel() {
    const rows = filtered.map(f => ({
      "Tên cơ sở": f.name,
      "Mã": f.code || `CS-${f.id}`,
      "Loại": typeLabel(f.type),
      "Doanh nghiệp": f.enterpriseName ?? "",
      "GLN": f.gln,
      "Số điện thoại": f.phone,
      "Tỉnh / Thành phố": f.tinh,
      "Xã / Phường": f.xa,
      "Địa chỉ": f.address,
      "Trạng thái": statusLabel(f.status),
      "Ghi chú": f.notes,
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
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportLoading(true);
    setImportResult(null);
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
            code: (row["Mã"] || row["ma"] || "").trim(),
            type,
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
      inv();
      setImportResult({ ok, fail });
    } catch {
      setImportResult({ ok: 0, fail: -1 });
    } finally {
      setImportLoading(false);
    }
  }

  function openEdit(f: Facility) {
    setEditItem(f);
    setForm({
      enterpriseId: f.enterpriseId, name: f.name, code: f.code, type: f.type,
      phone: f.phone, tinh: f.tinh ?? "", xa: f.xa ?? "", address: f.address,
      gln: f.gln ?? "", status: f.status, notes: f.notes,
    });
    setErr(null);
    setDrawerOpen(true);
  }
  function setF<K extends keyof FForm>(k: K, v: FForm[K]) { setForm(p => ({ ...p, [k]: v })); }

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
            {importResult.fail === -1
              ? "Lỗi đọc file. Vui lòng kiểm tra định dạng Excel."
              : `Import xong: ${importResult.ok} thành công${importResult.fail > 0 ? `, ${importResult.fail} lỗi` : ""}.`}
            <button onClick={() => setImportResult(null)} className="ml-auto p-0.5 hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, mã, địa chỉ, tỉnh…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white"
          >
            <option value="all">Tất cả loại</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={exportExcel}
            title="Xuất Excel"
            className="h-10 px-3 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4 text-muted-foreground" /> Xuất Excel
          </button>
          <button
            onClick={downloadTemplate}
            title="Tải file mẫu import"
            className="h-10 px-3 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4 text-muted-foreground" /> File mẫu
          </button>
          <button
            onClick={() => importRef.current?.click()}
            disabled={importLoading}
            title="Import từ Excel"
            className="h-10 px-3 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted disabled:opacity-60"
          >
            {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
            Import Excel
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
          <button
            onClick={() => {
              setForm({ ...EMPTY_F, enterpriseId: isSuperAdmin ? null : (user?.enterpriseId ?? null) });
              setDrawerOpen(true);
            }}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${typeColor(f.type)}`}>
                        {typeLabel(f.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">{f.enterpriseName ?? "—"}</td>
                    <td className="px-4 py-3">
                      {f.phone && <div className="flex items-center gap-1 text-[13px]"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{f.phone}</div>}
                      {(f.xa || f.tinh) && (
                        <div className="flex items-center gap-1 text-[12px] text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {[f.xa, f.tinh].filter(Boolean).join(", ")}
                        </div>
                      )}
                      {f.address && <div className="text-[12px] text-muted-foreground mt-0.5">{f.address}</div>}
                      {!f.phone && !f.xa && !f.tinh && !f.address && <span className="text-muted-foreground">—</span>}
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
                        {f.type === "ho_lien_ket" && (
                          <button onClick={() => setQrTarget(f)} className="p-1.5 rounded hover:bg-muted" title="Xem QR"><QrCode className="w-4 h-4 text-muted-foreground" /></button>
                        )}
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
              <img
                src={qrUrl(`CO-SO:${qrTarget.id}|${qrTarget.name}|${qrTarget.code || ""}`)}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-[13px] text-muted-foreground mb-1">{qrTarget.name}</p>
            <p className="text-[12px] text-muted-foreground mb-4">Mã: {qrTarget.code || `CS-${qrTarget.id}`}</p>
            <button
              onClick={() => printQR(qrTarget)}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 mx-auto hover:brightness-110"
            >
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
              <button
                disabled={deleteMu.isPending}
                onClick={() => deleteMu.mutate(deleteTarget.id)}
                className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={close_} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[540px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">{editItem ? "Sửa thông tin cơ sở" : "Thêm cơ sở mới"}</div>
                <div className="text-[12.5px] text-muted-foreground">{editItem ? "Cập nhật thông tin cơ sở và nhân viên phụ trách." : "Điền thông tin cơ sở và chọn nhân viên phụ trách."}</div>
              </div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-6 gap-4">
              {[
                { key: "info" as const, label: "Thông tin cơ sở" },
                { key: "employees" as const, label: "Nhân viên phụ trách" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 text-[13.5px] font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.label}
                  {tab.key === "employees" && selectedEmployeeIds.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{selectedEmployeeIds.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              {activeTab === "info" && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Tên cơ sở <span className="text-rose-500">*</span></label>
                    <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Hộ ông Nguyễn Văn A" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Mã cơ sở</label>
                      <input value={form.code} onChange={e => setF("code", e.target.value)} placeholder="CS-001" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Loại cơ sở</label>
                      <select value={form.type} onChange={e => setF("type", e.target.value as Facility["type"])} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                        {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Doanh nghiệp</label>
                    {isSuperAdmin ? (
                      <select value={form.enterpriseId ?? ""} onChange={e => setF("enterpriseId", e.target.value ? Number(e.target.value) : null)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                        <option value="">-- Chưa gắn doanh nghiệp --</option>
                        {enterprises.map(d => <option key={d.id} value={d.id}>{d.tenHienThi}</option>)}
                      </select>
                    ) : (
                      <div className="w-full h-10 px-3 rounded-lg border border-border bg-muted/50 text-sm flex items-center justify-between text-foreground">
                        <span>{user?.enterpriseName ?? "—"}</span>
                        <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Số điện thoại</label>
                      <input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="09xx xxx xxx" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                      <select value={form.status} onChange={e => setF("status", e.target.value as "active" | "inactive")} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ProvinceSelect value={form.tinh} onChange={(v) => { setF("tinh", v); setF("xa", ""); }} />
                    <CommuneSelect province={form.tinh} value={form.xa} onChange={(v) => setF("xa", v)} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Địa chỉ chi tiết</label>
                    <input value={form.address} onChange={e => setF("address", e.target.value)} placeholder="Số nhà, đường, thôn xóm…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      GLN <span className="text-[11px] text-muted-foreground font-normal">(Global Location Number)</span>
                    </label>
                    <input
                      value={form.gln}
                      onChange={e => setF("gln", e.target.value)}
                      placeholder="0000000000000 (13 chữ số)"
                      maxLength={13}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm font-mono outline-none focus:border-primary"
                    />
                    <div className="text-[11.5px] text-muted-foreground mt-1">Mã định danh địa điểm toàn cầu GS1 (dùng trong truy xuất chuỗi cung ứng).</div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                    <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} placeholder="Ghi chú thêm…" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" />
                  </div>
                </>
              )}

              {activeTab === "employees" && (
                <div className="space-y-3">
                  {!editItem && (
                    <div className="px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[12.5px]">
                      Chọn nhân viên phụ trách ngay khi tạo cơ sở. Phân công sẽ được lưu cùng lúc với thông tin cơ sở.
                    </div>
                  )}
                  <p className="text-[13px] text-muted-foreground">Chọn nhân viên phụ trách cơ sở này:</p>
                  {relevantEmployees.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Chưa có nhân viên nào. Thêm nhân viên ở mục Người dùng trước.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {relevantEmployees.map(emp => (
                        <label key={emp.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={selectedEmployeeIds.includes(emp.id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedEmployeeIds(p => [...p, emp.id]);
                              else setSelectedEmployeeIds(p => p.filter(id => id !== emp.id));
                            }}
                          />
                          <div className={`w-8 h-8 rounded-full text-white text-[11px] font-semibold flex items-center justify-center shrink-0 ${emp.avatarColor}`}>
                            {emp.name.slice(-2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium">{emp.name}</div>
                            <div className="text-[11.5px] text-muted-foreground">{emp.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  {editItem && (
                    <button
                      onClick={() => assignMu.mutate({ id: editItem.id, ids: selectedEmployeeIds })}
                      disabled={assignMu.isPending}
                      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:brightness-110 disabled:opacity-60"
                    >
                      {assignMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Users className="w-4 h-4" /> Lưu phân công
                    </button>
                  )}
                </div>
              )}

              {err && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{err}</div>}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={close_} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button
                disabled={isPending}
                onClick={handleSubmit}
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Thêm cơ sở"}
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
