import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import RichTextEditor from "@/components/RichTextEditor";
import { Plus, Pencil, X, Loader2, Search, Package, Eye, Building2, Tag, Scale, DollarSign, Info, Calendar, Hash, ImageIcon, Barcode, Upload, Ruler, Globe, Award, Weight, Sparkles, ShieldCheck } from "lucide-react";
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchUnits, fetchEnterprises, fetchTeaVarieties,
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
  gtin: string;
  type: Product["type"];
  unitId: number | null;
  price: string;
  imageUrl: string;
  description: string;
  status: "active" | "inactive";
  khoiLuong: string;
  donViKhoiLuong: string;
  chieuDai: string;
  chieuRong: string;
  chieuCao: string;
  donViKichThuoc: string;
  donViBan: string;
  soLuongDonViCon: string;
  donViConId: number | null;
  thuongHieu: string;
  xuatXu: string;
  giongCheId: number | null;
};
const EMPTY_P: PForm = {
  enterpriseId: null, name: "", code: "", gtin: "", type: "ban_thanh_pham", unitId: null,
  price: "", imageUrl: "", description: "", status: "active",
  khoiLuong: "", donViKhoiLuong: "kg", chieuDai: "", chieuRong: "", chieuCao: "", donViKichThuoc: "cm",
  donViBan: "", soLuongDonViCon: "", donViConId: null,
  thuongHieu: "", xuatXu: "", giongCheId: null,
};

const LOAI_CHUNG_CHI_OPTIONS = [
  "VietGAP", "GlobalGAP", "Organic", "HACCP", "ISO 22000",
  "FDA", "Halal", "OCOP", "Khác",
];

type ChungChiItem = {
  imageUrl: string;
  loaiChungChi: string;
  tenChungChi: string;
  coQuanCap: string;
  soChungChi: string;
  ngayCap: string;
  ngayHetHan: string;
};
const EMPTY_CC: ChungChiItem = {
  imageUrl: "", loaiChungChi: "", tenChungChi: "",
  coQuanCap: "", soChungChi: "", ngayCap: "", ngayHetHan: "",
};

function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { const arr = JSON.parse(raw); if (Array.isArray(arr)) return arr; } catch {}
  return [raw];
}

function parseCCs(raw: string | null | undefined): ChungChiItem[] {
  if (!raw) return [];
  try { const arr = JSON.parse(raw); if (Array.isArray(arr)) return arr; } catch {}
  return [];
}

function fmtDateCC(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch { return iso; }
}

export default function ThuongPhamPage() {
  const { user } = useAuth();
  const isSuperAdmin = !user?.enterpriseId;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<1 | 2 | 3>(1);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [viewItem, setViewItem] = useState<Product | null>(null);
  const [form, setForm] = useState<PForm>(() => ({ ...EMPTY_P, enterpriseId: user?.enterpriseId ?? null }));
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [dacDiem, setDacDiem] = useState<string[]>([]);
  const [chungChis, setChungChis] = useState<ChungChiItem[]>([]);
  const [showCCForm, setShowCCForm] = useState(false);
  const [ccForm, setCCForm] = useState<ChungChiItem>({ ...EMPTY_CC });
  const [editCCIdx, setEditCCIdx] = useState<number | null>(null);
  const ccFileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const unitsQ = useQuery({ queryKey: ["units"], queryFn: fetchUnits });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const varietiesQ = useQuery({ queryKey: ["tea-varieties"], queryFn: fetchTeaVarieties });

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

  function close_() {
    setDrawerOpen(false); setEditItem(null); setDrawerTab(1);
    setForm({ ...EMPTY_P, enterpriseId: user?.enterpriseId ?? null });
    setImageUrls([]); setDacDiem([]); setChungChis([]);
    setShowCCForm(false); setCCForm({ ...EMPTY_CC }); setEditCCIdx(null);
    setErr(null);
  }
  function openEdit(p: Product) {
    setEditItem(p); setDrawerTab(1);
    setForm({
      enterpriseId: p.enterpriseId, name: p.name, code: p.code, gtin: p.gtin ?? "",
      type: p.type, unitId: p.unitId, price: p.price, imageUrl: p.imageUrl ?? "",
      description: p.description, status: p.status,
      khoiLuong: p.khoiLuong ?? "", donViKhoiLuong: p.donViKhoiLuong ?? "kg",
      chieuDai: p.chieuDai ?? "", chieuRong: p.chieuRong ?? "", chieuCao: p.chieuCao ?? "",
      donViKichThuoc: p.donViKichThuoc ?? "cm",
      donViBan: p.donViBan ?? "", soLuongDonViCon: p.soLuongDonViCon ?? "", donViConId: p.donViConId ?? null,
      thuongHieu: p.thuongHieu ?? "", xuatXu: p.xuatXu ?? "", giongCheId: p.giongCheId ?? null,
    });
    setImageUrls(parseImages(p.imageUrl));
    try { setDacDiem(JSON.parse(p.dacDiem ?? "[]")); } catch { setDacDiem([]); }
    setChungChis(parseCCs(p.anhChungChi));
    setShowCCForm(false); setCCForm({ ...EMPTY_CC }); setEditCCIdx(null);
    setErr(null); setDrawerOpen(true);
  }
  function setF<K extends keyof PForm>(k: K, v: PForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit() {
    setErr(null);
    if (!form.name.trim()) { setErr("Vui lòng nhập tên thương phẩm."); return; }
    const payload = {
      ...form,
      imageUrl: imageUrls.length ? JSON.stringify(imageUrls) : "",
      dacDiem: dacDiem.filter(Boolean).length ? JSON.stringify(dacDiem.filter(Boolean)) : "",
      anhChungChi: chungChis.length ? JSON.stringify(chungChis) : "",
    };
    if (editItem) updateMu.mutate({ id: editItem.id, b: payload });
    else createMu.mutate(payload);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 5 - imageUrls.length;
    const toProcess = files.slice(0, remaining);
    const newUrls = await Promise.all(
      toProcess.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    );
    setImageUrls(prev => [...prev, ...newUrls]);
    e.target.value = "";
  }

  const items = listQ.data?.items ?? [];
  const filtered = items
    .filter(p => typeFilter === "all" || p.type === typeFilter)
    .filter(p => !search.trim() || [p.name, p.code, p.gtin ?? ""].some(s => s.toLowerCase().includes(search.toLowerCase())));
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, mã, GTIN…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
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
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Thương phẩm</th>
                  <th className="px-4 py-3">Mã thương phẩm / GTIN</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Đơn vị tính</th>
                  <th className="px-4 py-3">Đơn giá</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 w-24"></th>
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
                        <div className="flex items-center gap-3">
                          {(() => { const imgs = parseImages(p.imageUrl); return imgs[0] ? (
                            <img src={imgs[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-border flex-shrink-0" onError={e => (e.currentTarget.style.display = "none")} />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          ); })()}
                          <div className="font-medium">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.code && <div className="text-[12.5px] font-mono">{p.code}</div>}
                        {p.gtin && <div className="text-[11.5px] text-muted-foreground font-mono">GTIN: {p.gtin}</div>}
                        {!p.code && !p.gtin && <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${typeColor(p.type)}`}>{typeLabel(p.type)}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px]">{p.unitName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] font-medium">{p.price || "—"}</td>
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
                          <button onClick={() => setViewItem(p)} className="p-1.5 rounded hover:bg-blue-50" title="Xem chi tiết"><Eye className="w-4 h-4 text-muted-foreground hover:text-blue-600" /></button>
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

      {/* Detail Panel */}
      {viewItem && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={() => setViewItem(null)} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">Chi tiết thương phẩm</div>
                <div className="text-[12.5px] text-muted-foreground">Thông tin đầy đủ về sản phẩm</div>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              <div className="flex items-center gap-4">
                {(() => { const imgs = parseImages(viewItem.imageUrl); return imgs[0] ? (
                  <img src={imgs[0]} alt={viewItem.name} className="w-16 h-16 rounded-2xl object-cover border border-border flex-shrink-0" onError={e => (e.currentTarget.style.display = "none")} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                ); })()}
                <div>
                  <div className="text-[17px] font-bold">{viewItem.name}</div>
                  {viewItem.code && <div className="text-[13px] text-muted-foreground mt-0.5">Mã: <span className="font-mono font-semibold">{viewItem.code}</span></div>}
                  {viewItem.gtin && <div className="text-[12px] text-muted-foreground font-mono">GTIN: {viewItem.gtin}</div>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 ring-inset ${typeColor(viewItem.type)}`}>{typeLabel(viewItem.type)}</span>
                {(() => { const s = STATUS_OPT.find(o => o.value === viewItem.status); return s ? (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ring-1 ring-inset ${s.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${viewItem.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {s.label}
                  </span>
                ) : null; })()}
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  <div className="flex items-center gap-3 px-4 py-3"><Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">Loại sản phẩm</span><span className="text-[13px] font-medium">{typeLabel(viewItem.type)}</span></div>
                  <div className="flex items-center gap-3 px-4 py-3"><Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">Mã thương phẩm</span><span className="text-[13px] font-mono font-medium">{viewItem.code || "—"}</span></div>
                  <div className="flex items-center gap-3 px-4 py-3"><Barcode className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">GTIN</span><span className="text-[13px] font-mono font-medium">{viewItem.gtin || "—"}</span></div>
                  <div className="flex items-center gap-3 px-4 py-3"><Scale className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">Đơn vị tính</span><span className="text-[13px] font-medium">{viewItem.unitName ?? "—"}</span></div>
                  <div className="flex items-center gap-3 px-4 py-3"><DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">Đơn giá tham khảo</span><span className="text-[13px] font-semibold text-emerald-700">{viewItem.price || "—"}</span></div>
                  <div className="flex items-center gap-3 px-4 py-3"><Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">Doanh nghiệp</span><span className="text-[13px] font-medium">{viewItem.enterpriseName ?? "Dùng chung"}</span></div>
                  <div className="flex items-center gap-3 px-4 py-3"><Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-[13px] text-muted-foreground w-36">Ngày tạo</span><span className="text-[13px] font-medium">{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString("vi-VN") : "—"}</span></div>
                </div>
              </div>
              {(() => {
                const imgs = parseImages(viewItem.imageUrl);
                if (!imgs.length) return null;
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-2"><ImageIcon className="w-4 h-4 text-muted-foreground" /><span className="text-[13px] font-semibold">Hình ảnh ({imgs.length})</span></div>
                    <div className={`grid gap-2 ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {imgs.map((url, i) => (
                        <img key={i} src={url} alt={`${viewItem.name} ${i + 1}`} className="w-full rounded-xl border border-border object-cover max-h-40" onError={e => (e.currentTarget.style.display = "none")} />
                      ))}
                    </div>
                  </div>
                );
              })()}
              {viewItem.description && (
                <div>
                  <div className="flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-muted-foreground" /><span className="text-[13px] font-semibold">Mô tả</span></div>
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-[13px] text-foreground/80 leading-relaxed">{viewItem.description}</div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted flex items-center gap-2"><Pencil className="w-4 h-4" />Sửa</button>
              <button onClick={() => setViewItem(null)} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110">Đóng</button>
            </div>
          </aside>
        </>
      )}

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
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[560px] bg-white shadow-2xl z-50 flex flex-col">

            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="text-[17px] font-semibold tracking-tight">
                {editItem ? "Sửa thương phẩm" : "THÊM MỚI THƯƠNG PHẨM"}
              </div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-border shrink-0 bg-white">
              {([
                { id: 1, label: "1. Thông tin cơ bản" },
                { id: 2, label: "2. Khối lượng & Đóng gói" },
                { id: 3, label: "3. Thông tin quảng bá" },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setDrawerTab(t.id)}
                  className={`relative flex-1 py-3 text-[12.5px] font-medium transition-colors ${drawerTab === t.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t.label}
                  {drawerTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Tab 1: Thông tin cơ bản ── */}
              {drawerTab === 1 && (
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Tên thương phẩm <span className="text-rose-500">*</span></label>
                    <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Nhập tên thương phẩm" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Mã GTIN</label>
                      <input value={form.gtin} onChange={e => setF("gtin", e.target.value)} placeholder="Nhập mã GTIN" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary font-mono" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Mã thương phẩm</label>
                      <input value={form.code} onChange={e => setF("code", e.target.value)} placeholder="TP-001" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Loại sản phẩm</label>
                      <select value={form.type} onChange={e => setF("type", e.target.value as Product["type"])} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                        {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Giống chè</label>
                      <select value={form.giongCheId ?? ""} onChange={e => setF("giongCheId", e.target.value ? Number(e.target.value) : null)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                        <option value="">-- Chọn giống chè --</option>
                        {(varietiesQ.data?.items ?? []).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
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
                      <label className="block text-[13px] font-medium mb-1.5">Đơn giá tham khảo (VNĐ)</label>
                      <input value={form.price} onChange={e => setF("price", e.target.value)} placeholder="VD: 270000" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                    <div className="flex gap-2">
                      {STATUS_OPT.map(o => (
                        <button key={o.value} type="button" onClick={() => setF("status", o.value)}
                          className={`flex-1 h-9 rounded-lg border text-[12.5px] font-medium transition-all ${form.status === o.value ? "border-primary text-primary bg-primary/8 font-semibold" : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Hình ảnh sản phẩm <span className="text-muted-foreground font-normal">(tối đa 5 ảnh)</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl transition-colors ${imageUrls.length >= 5 ? "opacity-40 cursor-not-allowed border-border" : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"}`}>
                      <Upload className="w-4 h-4 text-muted-foreground mb-1" />
                      <span className="text-[12px] text-muted-foreground">{imageUrls.length >= 5 ? "Đã đủ 5 ảnh" : `Chọn ảnh từ máy (${imageUrls.length}/5)`}</span>
                      <input type="file" accept="image/*" multiple disabled={imageUrls.length >= 5} className="hidden" onChange={handleFileChange} />
                    </label>
                    {imageUrls.length > 0 && (
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted/30">
                            <img src={url} alt={`ảnh ${i + 1}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setImageUrls(imgs => imgs.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Mô tả</label>
                    <RichTextEditor value={form.description} onChange={(val) => setF("description", val)} placeholder="Mô tả thêm về thương phẩm…" minHeight={100} />
                  </div>
                </div>
              )}

              {/* ── Tab 2: Khối lượng & Đóng gói ── */}
              {drawerTab === 2 && (
                <div className="px-6 py-5 space-y-6">

                  {/* Section: Khối lượng và kích thước */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1 h-4 rounded bg-primary inline-block" />
                      <h3 className="text-[14px] font-semibold text-primary">Khối lượng và kích thước</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Khối lượng</label>
                          <input type="number" value={form.khoiLuong} onChange={e => setF("khoiLuong", e.target.value)} placeholder="Nhập giá trị số" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Đơn vị tính <span className="text-rose-500">*</span></label>
                          <select value={form.donViKhoiLuong} onChange={e => setF("donViKhoiLuong", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                            <option value="g">Gram (g)</option>
                            <option value="kg">Kilôgam (kg)</option>
                            <option value="tan">Tấn (tấn)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium mb-1.5">Kích thước (Dài × Rộng × Cao)</label>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1">Dài</div>
                            <input type="number" value={form.chieuDai} onChange={e => setF("chieuDai", e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1">Rộng</div>
                            <input type="number" value={form.chieuRong} onChange={e => setF("chieuRong", e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1">Cao</div>
                            <input type="number" value={form.chieuCao} onChange={e => setF("chieuCao", e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground mb-1">Đơn vị</div>
                            <select value={form.donViKichThuoc} onChange={e => setF("donViKichThuoc", e.target.value)} className="w-full h-10 px-2 rounded-lg border border-border text-sm outline-none bg-white">
                              <option value="mm">mm</option>
                              <option value="cm">cm</option>
                              <option value="m">m</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Section: Thông tin đóng gói */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1 h-4 rounded bg-primary inline-block" />
                      <h3 className="text-[14px] font-semibold text-primary">Thông tin đóng gói</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-1.5">Đơn vị bán</label>
                        <input value={form.donViBan} onChange={e => setF("donViBan", e.target.value)} placeholder="Chọn đơn vị bán (Hộp, Thùng, Lốc, ...)" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Số lượng đơn vị con</label>
                          <input type="number" value={form.soLuongDonViCon} onChange={e => setF("soLuongDonViCon", e.target.value)} placeholder="VD: 24" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Đơn vị con</label>
                          <select value={form.donViConId ?? ""} onChange={e => setF("donViConId", e.target.value ? Number(e.target.value) : null)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                            <option value="">-- Chọn đơn vị con --</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 3: Thông tin quảng bá ── */}
              {drawerTab === 3 && (
                <div className="px-6 py-5 space-y-6">

                  {/* Section: Thương hiệu & xuất xứ */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1 h-4 rounded bg-primary inline-block" />
                      <h3 className="text-[14px] font-semibold text-primary">Thương hiệu và xuất xứ</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Tên thương hiệu</label>
                          <input value={form.thuongHieu} onChange={e => setF("thuongHieu", e.target.value)} placeholder="Chọn thương hiệu" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium mb-1.5">Xuất xứ</label>
                          <input value={form.xuatXu} onChange={e => setF("xuatXu", e.target.value)} placeholder="Chọn quốc gia" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                        </div>
                      </div>
                      {/* ── Chứng chỉ, chứng nhận ── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-[13px] font-medium">
                            Chứng chỉ, chứng nhận
                            {chungChis.length > 0 && <span className="ml-1.5 text-[11px] text-muted-foreground">({chungChis.length})</span>}
                          </label>
                          {!showCCForm && (
                            <button
                              type="button"
                              onClick={() => { setCCForm({ ...EMPTY_CC }); setEditCCIdx(null); setShowCCForm(true); }}
                              className="flex items-center gap-1 text-[12px] font-medium text-primary hover:bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/30 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Thêm chứng chỉ
                            </button>
                          )}
                        </div>

                        {/* Inline add/edit form */}
                        {showCCForm && (
                          <div className="border border-primary/30 rounded-xl p-4 mb-3 bg-primary/5">
                            <div className="flex gap-4">
                              {/* Left: image upload */}
                              <div className="flex flex-col items-center gap-2 shrink-0">
                                <div
                                  className="w-[100px] h-[100px] rounded-xl border-2 border-dashed border-border bg-white flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden"
                                  onClick={() => ccFileRef.current?.click()}
                                >
                                  {ccForm.imageUrl ? (
                                    <img src={ccForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <>
                                      <ImageIcon className="w-7 h-7 text-muted-foreground/40 mb-1" strokeWidth={1.5} />
                                      <span className="text-[10px] text-muted-foreground text-center px-1 leading-tight">No image available</span>
                                    </>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => ccFileRef.current?.click()}
                                  className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-primary text-white text-[11px] font-medium hover:brightness-110"
                                >
                                  <ImageIcon className="w-3 h-3" /> Tải ảnh
                                </button>
                                {ccForm.imageUrl && (
                                  <button type="button" onClick={() => setCCForm(f => ({ ...f, imageUrl: "" }))} className="text-[10px] text-rose-500 hover:underline">Xóa ảnh</button>
                                )}
                                <input
                                  ref={ccFileRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = await new Promise<string>((res, rej) => {
                                      const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
                                    });
                                    setCCForm(f => ({ ...f, imageUrl: url }));
                                    e.target.value = "";
                                  }}
                                />
                              </div>

                              {/* Right: 2-col fields */}
                              <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2.5">
                                <div>
                                  <label className="block text-[12px] font-medium mb-1">Loại chứng chỉ <span className="text-rose-500">*</span></label>
                                  <select
                                    value={ccForm.loaiChungChi}
                                    onChange={e => setCCForm(f => ({ ...f, loaiChungChi: e.target.value }))}
                                    className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] outline-none focus:border-primary bg-white"
                                  >
                                    <option value="">Chọn loại chứng chỉ</option>
                                    {LOAI_CHUNG_CHI_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium mb-1">Tên chứng chỉ, chứng nhận <span className="text-rose-500">*</span></label>
                                  <input
                                    value={ccForm.tenChungChi}
                                    onChange={e => setCCForm(f => ({ ...f, tenChungChi: e.target.value }))}
                                    placeholder="Nhập tên chứng chỉ"
                                    className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium mb-1">Cơ quan cấp <span className="text-rose-500">*</span></label>
                                  <input
                                    value={ccForm.coQuanCap}
                                    onChange={e => setCCForm(f => ({ ...f, coQuanCap: e.target.value }))}
                                    placeholder="Tên cơ quan cấp"
                                    className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium mb-1">Số chứng chỉ, chứng nhận <span className="text-rose-500">*</span></label>
                                  <input
                                    value={ccForm.soChungChi}
                                    onChange={e => setCCForm(f => ({ ...f, soChungChi: e.target.value }))}
                                    placeholder="Số/mã chứng chỉ"
                                    className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium mb-1">Ngày cấp <span className="text-rose-500">*</span></label>
                                  <input
                                    type="date"
                                    value={ccForm.ngayCap}
                                    onChange={e => setCCForm(f => ({ ...f, ngayCap: e.target.value }))}
                                    className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium mb-1">Ngày hết hạn <span className="text-rose-500">*</span></label>
                                  <input
                                    type="date"
                                    value={ccForm.ngayHetHan}
                                    onChange={e => setCCForm(f => ({ ...f, ngayHetHan: e.target.value }))}
                                    className="w-full h-9 px-2.5 rounded-lg border border-border text-[12px] outline-none focus:border-primary"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Form action buttons */}
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-primary/20">
                              <button
                                type="button"
                                onClick={() => { setShowCCForm(false); setEditCCIdx(null); setCCForm({ ...EMPTY_CC }); }}
                                className="h-8 px-3 rounded-lg border border-border text-[12px] font-medium hover:bg-muted flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" /> Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!ccForm.loaiChungChi || !ccForm.tenChungChi.trim() || !ccForm.coQuanCap.trim() || !ccForm.soChungChi.trim() || !ccForm.ngayCap || !ccForm.ngayHetHan) return;
                                  if (editCCIdx !== null) {
                                    setChungChis(list => list.map((item, i) => i === editCCIdx ? { ...ccForm } : item));
                                  } else {
                                    setChungChis(list => [...list, { ...ccForm }]);
                                  }
                                  setShowCCForm(false); setEditCCIdx(null); setCCForm({ ...EMPTY_CC });
                                }}
                                className="h-8 px-4 rounded-lg bg-primary text-white text-[12px] font-semibold hover:brightness-110 flex items-center gap-1.5"
                              >
                                {editCCIdx !== null ? "Cập nhật" : "Thêm"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Certificate list */}
                        {chungChis.length === 0 && !showCCForm ? (
                          <div className="text-center py-6 text-[12px] text-muted-foreground border-2 border-dashed border-border rounded-xl">
                            <Award className="w-7 h-7 mx-auto mb-1.5 opacity-25" />
                            <p>Chưa có chứng chỉ nào.</p>
                            <p className="text-[11px] mt-0.5 opacity-70">Nhấn "Thêm chứng chỉ" để bắt đầu.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {chungChis.map((cc, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
                                {cc.imageUrl ? (
                                  <img src={cc.imageUrl} alt={cc.tenChungChi} className="w-12 h-12 rounded-lg border border-border object-cover shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold truncate">{cc.tenChungChi}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] font-medium">
                                      <ShieldCheck className="w-3 h-3" />{cc.loaiChungChi}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground truncate">{cc.coQuanCap}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Số: {cc.soChungChi}
                                    {cc.ngayCap && <> · Cấp: {fmtDateCC(cc.ngayCap)}</>}
                                    {cc.ngayHetHan && <> · HH: {fmtDateCC(cc.ngayHetHan)}</>}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => { setCCForm({ ...cc }); setEditCCIdx(i); setShowCCForm(true); }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChungChis(list => list.filter((_, idx) => idx !== i))}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-500 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Section: Đặc điểm */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-4 rounded bg-primary inline-block" />
                        <h3 className="text-[14px] font-semibold text-primary">Đặc điểm</h3>
                        <span className="text-[11px] text-muted-foreground">({dacDiem.length}/10)</span>
                      </div>
                      {dacDiem.length < 10 && (
                        <button type="button" onClick={() => setDacDiem(d => [...d, ""])}
                          className="flex items-center gap-1 text-[12px] font-medium text-primary hover:bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/30 transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Thêm đặc điểm
                        </button>
                      )}
                    </div>
                    {dacDiem.length === 0 ? (
                      <div className="text-center py-8 text-[13px] text-muted-foreground">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-25" />
                        <p>Chưa có đặc điểm nào.</p>
                        <p className="text-[12px] mt-0.5">Nhấn "Thêm đặc điểm" để bắt đầu. Tối đa 10 đặc điểm.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dacDiem.map((dd, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground w-5 shrink-0 text-right">{i + 1}.</span>
                            <input
                              value={dd} onChange={e => setDacDiem(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                              placeholder="Nhập đặc điểm…"
                              className="flex-1 h-9 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                            />
                            <button type="button" onClick={() => setDacDiem(d => d.filter((_, idx) => idx !== i))}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
              {err && <div className="text-[12px] text-rose-600 flex-1 mr-3">{err}</div>}
              {!err && <div className="flex-1" />}
              <div className="flex items-center gap-2">
                {drawerTab > 1 && (
                  <button type="button" onClick={() => setDrawerTab(t => (t - 1) as 1 | 2 | 3)}
                    className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-muted">
                    ← Trước
                  </button>
                )}
                {drawerTab < 3 && (
                  <button type="button" onClick={() => setDrawerTab(t => (t + 1) as 1 | 2 | 3)}
                    className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-muted">
                    Tiếp →
                  </button>
                )}
                <button onClick={close_} className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-muted">Hủy</button>
                <button disabled={isPending} onClick={handleSubmit}
                  className="h-9 px-5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? "Lưu thay đổi" : "Lưu"}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
