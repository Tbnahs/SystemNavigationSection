import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, X, Loader2, Search, Factory, QrCode, Printer,
  Building2, Home, MapPin, Phone, Users,
} from "lucide-react";
import {
  fetchFacilities, createFacility, updateFacility, deleteFacility,
  fetchEnterprises, fetchEmployees, assignFacilityEmployees,
  type Facility,
} from "@/lib/api";

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
  address: string;
  status: "active" | "inactive";
  notes: string;
};
const EMPTY_F: FForm = {
  enterpriseId: null, name: "", code: "", type: "ho_lien_ket",
  phone: "", address: "", status: "active", notes: "",
};

export default function CoSoPage() {
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

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const empQ = useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });

  function inv() { qc.invalidateQueries({ queryKey: ["facilities"] }); }

  const createMu = useMutation({
    mutationFn: (b: FForm) => createFacility(b),
    onSuccess: () => { inv(); close_(); },
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

  function openEdit(f: Facility) {
    setEditItem(f);
    setForm({ enterpriseId: f.enterpriseId, name: f.name, code: f.code, type: f.type, phone: f.phone, address: f.address, status: f.status, notes: f.notes });
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
    .filter(f => !search.trim() || [f.name, f.code, f.address].some(s => s.toLowerCase().includes(search.toLowerCase())));
  const isPending = createMu.isPending || updateMu.isPending;

  const enterprises = dnQ.data?.items ?? [];
  const employees = empQ.data?.items ?? [];

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

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, mã, địa chỉ…"
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
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Thêm cơ sở
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Tên cơ sở</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Doanh nghiệp</th>
                  <th className="px-4 py-3">Liên hệ / Địa chỉ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
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
                      {f.address && <div className="flex items-center gap-1 text-[12px] text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{f.address}</div>}
                      {!f.phone && !f.address && <span className="text-muted-foreground">—</span>}
                    </td>
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
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">{editItem ? "Sửa thông tin cơ sở" : "Thêm cơ sở mới"}</div>
              </div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-6 gap-4">
              {[
                { key: "info" as const, label: "Thông tin" },
                ...(editItem ? [{ key: "employees" as const, label: "Nhân viên phụ trách" }] : []),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 text-[13.5px] font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.label}
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
                    <select value={form.enterpriseId ?? ""} onChange={e => setF("enterpriseId", e.target.value ? Number(e.target.value) : null)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white">
                      <option value="">-- Chưa gắn doanh nghiệp --</option>
                      {enterprises.map(d => <option key={d.id} value={d.id}>{d.tenHienThi}</option>)}
                    </select>
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
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Địa chỉ</label>
                    <input value={form.address} onChange={e => setF("address", e.target.value)} placeholder="Thôn Đại An, xã Phú Lạc…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                    <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={3} placeholder="Ghi chú thêm…" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" />
                  </div>
                </>
              )}

              {activeTab === "employees" && editItem && (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground">Chọn nhân viên phụ trách cơ sở này:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {employees.filter(e => e.enterpriseId === editItem.enterpriseId || !editItem.enterpriseId).map(emp => (
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
                  <button
                    onClick={() => assignMu.mutate({ id: editItem.id, ids: selectedEmployeeIds })}
                    disabled={assignMu.isPending}
                    className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:brightness-110 disabled:opacity-60"
                  >
                    {assignMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Users className="w-4 h-4" /> Lưu phân công
                  </button>
                </div>
              )}

              {err && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{err}</div>}
            </div>

            {activeTab === "info" && (
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
            )}
          </aside>
        </>
      )}
    </AppLayout>
  );
}
