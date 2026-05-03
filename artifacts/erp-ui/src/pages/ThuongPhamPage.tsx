import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Plus, Pencil, X, Loader2, Search, Package } from "lucide-react";
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchUnits, fetchEnterprises,
  type Product,
} from "@/lib/api";

const TYPE_OPTIONS = [
  { value: "ban_thanh_pham" as const, label: "Bán thành phẩm", color: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "thanh_pham_cuoi" as const, label: "Thành phẩm cuối", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
];
function typeLabel(t: Product["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.label ?? t; }
function typeColor(t: Product["type"]) { return TYPE_OPTIONS.find(o => o.value === t)?.color ?? ""; }

const STATUS_OPT = [
  { value: "active" as const, label: "Đang dùng", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "inactive" as const, label: "Ngưng dùng", cls: "bg-slate-100 text-slate-600 ring-slate-300" },
];

type PForm = {
  enterpriseId: number | null;
  name: string;
  code: string;
  type: Product["type"];
  unitId: number | null;
  price: string;
  description: string;
  status: "active" | "inactive";
};
const EMPTY_P: PForm = { enterpriseId: null, name: "", code: "", type: "ban_thanh_pham", unitId: null, price: "", description: "", status: "active" };

export default function ThuongPhamPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<PForm>(EMPTY_P);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const unitsQ = useQuery({ queryKey: ["units"], queryFn: fetchUnits });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });

  function inv() { qc.invalidateQueries({ queryKey: ["products"] }); }

  const createMu = useMutation({
    mutationFn: (b: PForm) => createProduct(b),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, b }: { id: number; b: PForm }) => updateProduct(id, b),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });

  function close_() { setDrawerOpen(false); setEditItem(null); setForm(EMPTY_P); setErr(null); }
  function openEdit(p: Product) {
    setEditItem(p);
    setForm({ enterpriseId: p.enterpriseId, name: p.name, code: p.code, type: p.type, unitId: p.unitId, price: p.price, description: p.description, status: p.status });
    setErr(null); setDrawerOpen(true);
  }
  function setF<K extends keyof PForm>(k: K, v: PForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit() {
    setErr(null);
    if (!form.name.trim()) { setErr("Vui lòng nhập tên thương phẩm."); return; }
    if (editItem) updateMu.mutate({ id: editItem.id, b: form });
    else createMu.mutate(form);
  }

  const items = listQ.data?.items ?? [];
  const filtered = items
    .filter(p => typeFilter === "all" || p.type === typeFilter)
    .filter(p => !search.trim() || [p.name, p.code].some(s => s.toLowerCase().includes(search.toLowerCase())));
  const isPending = createMu.isPending || updateMu.isPending;
  const units = unitsQ.data?.items ?? [];
  const enterprises = dnQ.data?.items ?? [];

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">ERP / Thương phẩm</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Danh sách Thương phẩm</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {TYPE_OPTIONS.map(opt => {
            const cnt = items.filter(p => p.type === opt.value).length;
            return (
              <div key={opt.value} className="bg-white border border-border rounded-xl p-4">
                <div className="text-[12px] text-muted-foreground mb-1">{opt.label}</div>
                <div className="text-2xl font-bold">{cnt}</div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, mã…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
            <option value="all">Tất cả loại</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setDrawerOpen(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110">
            <Plus className="w-4 h-4" /> Thêm thương phẩm
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Tên thương phẩm</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Đơn vị tính</th>
                  <th className="px-4 py-3">Đơn giá</th>
                  <th className="px-4 py-3">Doanh nghiệp</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search || typeFilter !== "all" ? "Không tìm thấy thương phẩm phù hợp." : "Chưa có thương phẩm nào."}
                  </td></tr>
                )}
                {filtered.map(p => {
                  const statusOpt = STATUS_OPT.find(s => s.value === p.status);
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-emerald-50/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        {p.code && <div className="text-[11.5px] text-muted-foreground">Mã: {p.code}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${typeColor(p.type)}`}>{typeLabel(p.type)}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px]">{p.unitName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] font-medium">{p.price || "—"}</td>
                      <td className="px-4 py-3 text-[13px]">{p.enterpriseName ?? "Chung"}</td>
                      <td className="px-4 py-3">
                        {statusOpt && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${statusOpt.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${p.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {statusOpt.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-[13px] text-muted-foreground">{filtered.length} / {items.length} thương phẩm</div>
        </div>
      </div>

      {/* Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><X className="w-5 h-5 text-rose-600" /></div>
            <h3 className="text-[16px] font-semibold text-center mb-1">Xóa thương phẩm?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa <span className="font-semibold text-foreground">{deleteTarget.name}</span> khỏi hệ thống.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={deleteMu.isPending} onClick={() => deleteMu.mutate(deleteTarget.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={close_} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[18px] font-semibold">{editItem ? "Sửa thương phẩm" : "Thêm thương phẩm"}</div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Tên thương phẩm <span className="text-rose-500">*</span></label>
                <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Chè Tân Cương 1 tôm 1 lá" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Mã sản phẩm</label>
                  <input value={form.code} onChange={e => setF("code", e.target.value)} placeholder="SP-001" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Loại</label>
                  <select value={form.type} onChange={e => setF("type", e.target.value as Product["type"])} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Đơn vị tính</label>
                  <select value={form.unitId ?? ""} onChange={e => setF("unitId", e.target.value ? Number(e.target.value) : null)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Đơn giá tham khảo</label>
                  <input value={form.price} onChange={e => setF("price", e.target.value)} placeholder="27,000 đ/kg" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Doanh nghiệp</label>
                <select value={form.enterpriseId ?? ""} onChange={e => setF("enterpriseId", e.target.value ? Number(e.target.value) : null)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                  <option value="">-- Dùng chung (tất cả DN) --</option>
                  {enterprises.map(d => <option key={d.id} value={d.id}>{d.tenHienThi}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                <select value={form.status} onChange={e => setF("status", e.target.value as "active" | "inactive")} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                  {STATUS_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Mô tả</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={3} placeholder="Mô tả thêm…" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" />
              </div>
              {err && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{err}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={close_} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={isPending} onClick={handleSubmit} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Thêm"}
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
