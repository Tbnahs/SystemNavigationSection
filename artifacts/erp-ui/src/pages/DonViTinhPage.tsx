import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import RichTextEditor from "@/components/RichTextEditor";
import { Plus, Pencil, X, Loader2, Scale, Search, Globe, Building2 } from "lucide-react";
import { fetchUnits, createUnit, updateUnit, deleteUnit, type Unit } from "@/lib/api";

const LOAI_DON_VI_OPTIONS = ["Số lượng", "Khối lượng", "Diện tích", "Nhiệt độ", "Thể tích", "Chiều dài"];

type UForm = { name: string; abbreviation: string; loaiDonVi: string; description: string };
const EMPTY: UForm = { name: "", abbreviation: "", loaiDonVi: "", description: "" };

function toForm(u: Unit): UForm {
  return { name: u.name, abbreviation: u.abbreviation, loaiDonVi: u.loaiDonVi ?? "", description: u.description };
}

export default function DonViTinhPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = !currentUser?.enterpriseId;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Unit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const [form, setForm] = useState<UForm>(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loaiSearch, setLoaiSearch] = useState("");
  const [loaiOpen, setLoaiOpen] = useState(false);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["units"], queryFn: fetchUnits });

  function inv() { qc.invalidateQueries({ queryKey: ["units"] }); }

  const createMu = useMutation({
    mutationFn: (b: UForm) => createUnit({
      ...b,
      enterpriseId: isSuperAdmin ? null : (currentUser?.enterpriseId ?? null),
    }),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, b }: { id: number; b: UForm }) => updateUnit(id, b),
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deleteUnit(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });

  function close_() { setDrawerOpen(false); setEditItem(null); setForm(EMPTY); setErr(null); }
  function openEdit(u: Unit) { setEditItem(u); setForm(toForm(u)); setErr(null); setDrawerOpen(true); }
  function setF<K extends keyof UForm>(k: K, v: UForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit() {
    setErr(null);
    if (!form.name.trim()) { setErr("Vui lòng nhập tên đơn vị."); return; }
    if (!form.abbreviation.trim()) { setErr("Vui lòng nhập ký hiệu."); return; }
    if (editItem) updateMu.mutate({ id: editItem.id, b: form });
    else createMu.mutate(form);
  }

  const items = listQ.data?.items ?? [];
  const filtered = search.trim()
    ? items.filter(u => [u.name, u.abbreviation, u.loaiDonVi ?? ""].some(s => s.toLowerCase().includes(search.toLowerCase())))
    : items;
  const isPending = createMu.isPending || updateMu.isPending;

  const filteredLoai = loaiSearch.trim()
    ? LOAI_DON_VI_OPTIONS.filter(o => o.toLowerCase().includes(loaiSearch.toLowerCase()))
    : LOAI_DON_VI_OPTIONS;

  function canEdit(u: Unit) {
    if (isSuperAdmin) return true;
    return u.enterpriseId === currentUser?.enterpriseId;
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Đơn vị tính</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Đơn vị tính</h1>
        </div>

        {!isSuperAdmin && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-[12.5px] text-blue-700">
            <Globe className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Đơn vị dùng chung có thể sử dụng nhưng không chỉnh sửa. Bạn có thể tạo đơn vị riêng cho doanh nghiệp.</span>
          </div>
        )}

        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, ký hiệu…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Thêm đơn vị tính
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-12">STT</th>
                  <th className="px-4 py-3">Tên đơn vị</th>
                  <th className="px-4 py-3">Ký hiệu</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Phạm vi</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <Scale className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? "Không tìm thấy đơn vị phù hợp." : "Chưa có đơn vị tính nào. Thêm đơn vị đầu tiên!"}
                  </td></tr>
                )}
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-semibold ring-1 ring-emerald-200">
                        {u.abbreviation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {u.loaiDonVi ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-200">{u.loaiDonVi}</span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[13px]">{u.description || "—"}</td>
                    <td className="px-4 py-3">
                      {u.enterpriseId == null ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                          <Globe className="w-3 h-3" /> Dùng chung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                          <Building2 className="w-3 h-3" /> Doanh nghiệp
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit(u) ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60 italic px-1.5">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            {filtered.length} / {items.length} đơn vị tính
            {!isSuperAdmin && (
              <span className="ml-3 text-[11.5px]">
                ({items.filter(u => u.enterpriseId == null).length} dùng chung · {items.filter(u => u.enterpriseId === currentUser?.enterpriseId).length} của DN)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <X className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-[16px] font-semibold text-center mb-1">Xóa đơn vị tính?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">
              Xóa <span className="font-semibold text-foreground">{deleteTarget.name}</span> ({deleteTarget.abbreviation}) khỏi hệ thống.
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
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[17px] font-semibold">{editItem ? "Sửa đơn vị tính" : "Thêm đơn vị tính"}</div>
                <div className="text-[12px] text-muted-foreground">
                  {editItem
                    ? "Cập nhật thông tin đơn vị"
                    : isSuperAdmin
                      ? "Tạo đơn vị dùng chung toàn hệ thống"
                      : "Tạo đơn vị riêng cho doanh nghiệp bạn"}
                </div>
              </div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              {!isSuperAdmin && !editItem && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-violet-50 border border-violet-200 text-[12px] text-violet-700">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  Đơn vị này sẽ thuộc về doanh nghiệp của bạn
                </div>
              )}
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Tên đơn vị <span className="text-rose-500">*</span></label>
                <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Kilogram" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ký hiệu <span className="text-rose-500">*</span></label>
                <input value={form.abbreviation} onChange={e => setF("abbreviation", e.target.value)} placeholder="kg" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div className="relative">
                <label className="block text-[13px] font-medium mb-1.5">Loại đơn vị tính</label>
                <div
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white flex items-center cursor-pointer"
                  onClick={() => setLoaiOpen(p => !p)}
                >
                  <span className={form.loaiDonVi ? "text-foreground" : "text-muted-foreground/60"}>
                    {form.loaiDonVi || "-- Chọn loại --"}
                  </span>
                </div>
                {loaiOpen && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-border shadow-lg overflow-hidden">
                    <div className="p-2">
                      <input
                        autoFocus
                        value={loaiSearch}
                        onChange={e => setLoaiSearch(e.target.value)}
                        placeholder="Tìm hoặc nhập loại mới…"
                        className="w-full h-8 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredLoai.map(opt => (
                        <div
                          key={opt}
                          onClick={() => { setF("loaiDonVi", opt); setLoaiOpen(false); setLoaiSearch(""); }}
                          className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-muted ${form.loaiDonVi === opt ? "bg-primary/10 text-primary font-medium" : ""}`}
                        >
                          {opt}
                        </div>
                      ))}
                      {loaiSearch.trim() && !LOAI_DON_VI_OPTIONS.some(o => o.toLowerCase() === loaiSearch.toLowerCase()) && (
                        <div
                          onClick={() => { setF("loaiDonVi", loaiSearch.trim()); setLoaiOpen(false); setLoaiSearch(""); }}
                          className="px-3 py-2 text-[13px] cursor-pointer hover:bg-muted text-primary border-t border-border"
                        >
                          + Tạo loại mới: <span className="font-semibold">{loaiSearch.trim()}</span>
                        </div>
                      )}
                    </div>
                    {form.loaiDonVi && (
                      <div
                        onClick={() => { setF("loaiDonVi", ""); setLoaiOpen(false); }}
                        className="px-3 py-2 text-[13px] cursor-pointer hover:bg-rose-50 text-muted-foreground border-t border-border"
                      >
                        Xóa lựa chọn
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Mô tả</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setF("description", val)}
                  placeholder="Mô tả thêm về đơn vị tính…"
                  minHeight={100}
                />
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
