import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Plus, Pencil, X, Loader2, Search, Sprout } from "lucide-react";
import {
  fetchTeaVarieties, createTeaVariety, updateTeaVariety, deleteTeaVariety,
  fetchProducts, type TeaVariety,
} from "@/lib/api";

type VForm = { name: string; code: string; notes: string; productId: number | null };
const EMPTY: VForm = { name: "", code: "", notes: "", productId: null };

function toForm(v: TeaVariety): VForm {
  return { name: v.name, code: v.code, notes: v.notes, productId: v.productId };
}

export default function GiongChePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<TeaVariety | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeaVariety | null>(null);
  const [form, setForm] = useState<VForm>(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["tea-varieties"], queryFn: fetchTeaVarieties });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  function inv() { qc.invalidateQueries({ queryKey: ["tea-varieties"] }); }

  const createMu = useMutation({
    mutationFn: (b: VForm) => createTeaVariety(b),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, b }: { id: number; b: VForm }) => updateTeaVariety(id, b),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deleteTeaVariety(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });

  function close_() { setDrawerOpen(false); setEditItem(null); setForm(EMPTY); setErr(null); }
  function openEdit(v: TeaVariety) { setEditItem(v); setForm(toForm(v)); setErr(null); setDrawerOpen(true); }
  function setF<K extends keyof VForm>(k: K, v: VForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit() {
    setErr(null);
    if (!form.name.trim()) { setErr("Vui lòng nhập tên giống chè."); return; }
    if (editItem) updateMu.mutate({ id: editItem.id, b: form });
    else createMu.mutate(form);
  }

  const items = listQ.data?.items ?? [];
  const products = productsQ.data?.items ?? [];
  const filtered = search.trim()
    ? items.filter(v => [v.name, v.code].some(s => s.toLowerCase().includes(search.toLowerCase())))
    : items;
  const isPending = createMu.isPending || updateMu.isPending;

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">ERP / Danh mục</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Giống chè</h1>
        </div>

        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã giống…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Thêm giống chè
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-12">STT</th>
                  <th className="px-4 py-3">Tên giống chè</th>
                  <th className="px-4 py-3">Mã giống</th>
                  <th className="px-4 py-3">Thương phẩm liên kết</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <Sprout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? "Không tìm thấy giống chè phù hợp." : "Chưa có giống chè nào. Thêm giống đầu tiên!"}
                  </td></tr>
                )}
                {filtered.map((v, i) => (
                  <tr key={v.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3">
                      {v.code ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-semibold ring-1 ring-emerald-200">
                          {v.code}
                        </span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {v.productName ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                          {v.productName}
                        </span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[13px]">{v.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            {filtered.length} / {items.length} giống chè
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <X className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-[16px] font-semibold text-center mb-1">Xóa giống chè?</h3>
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

      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={close_} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[17px] font-semibold">{editItem ? "Sửa giống chè" : "Thêm giống chè"}</div>
              </div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Tên giống chè <span className="text-rose-500">*</span></label>
                <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="VD: Shan Tuyết, Kim Tuyên, Oolong…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Mã giống</label>
                <input value={form.code} onChange={e => setF("code", e.target.value)} placeholder="VD: ST001, KT002…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Thương phẩm liên kết</label>
                <p className="text-[11.5px] text-muted-foreground mb-2">Liên kết giống chè với thương phẩm để tự động lọc quy cách trong phiếu thu mua.</p>
                <select
                  value={form.productId ?? ""}
                  onChange={e => setF("productId", e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white focus:border-primary"
                >
                  <option value="">-- Chưa liên kết --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={3} placeholder="Mô tả thêm về giống chè…" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" />
              </div>
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
                {editItem ? "Lưu thay đổi" : "Thêm"}
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
