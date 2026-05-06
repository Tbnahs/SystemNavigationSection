import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, X, Loader2, Search, ShoppingBasket, Trash2,
  MapPin, Info,
} from "lucide-react";
import {
  fetchPurchaseOrders, fetchPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
  fetchProducts, fetchGrades, fetchQualityLevels, fetchFacilities,
  type PurchaseOrder, type PurchaseOrderItem,
} from "@/lib/api";

type PriceEntry = { label: string; value: string };
function parsePrices(s: string): PriceEntry[] {
  try { const r = JSON.parse(s); return Array.isArray(r) ? r : []; } catch { return []; }
}

function fmtDate(d: string) {
  if (!d) return "—";
  try { return new Date(d + "T00:00:00").toLocaleDateString("vi-VN"); } catch { return d; }
}

function genMaPhieu() {
  const d = new Date();
  return `PTHU-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
}

function genMaLoMe(facilityCode: string, ngayThu: string) {
  if (!facilityCode || !ngayThu) return "";
  return `${facilityCode}-${ngayThu.replace(/-/g, "")}`;
}

type LineItem = Omit<PurchaseOrderItem, "id" | "orderId"> & { _key: string };

function emptyLine(): LineItem {
  return {
    _key: String(Date.now() + Math.random()),
    productId: null, gradeId: null,
    productName: "", gradeName: "", qualityPercent: "", ghiChu: "",
    khoiLuong: "", donGia: "", thanhTien: "", moTa: "",
  };
}

type OForm = {
  maPhieu: string;
  enterpriseId: number | null;
  facilityId: number | null;
  facilityName: string;
  diaChuThu: string;
  maLoMe: string;
  ngayThu: string;
  status: PurchaseOrder["status"];
  notes: string;
};

function EMPTY_FORM(): OForm {
  return {
    maPhieu: genMaPhieu(),
    enterpriseId: null, facilityId: null, facilityName: "", diaChuThu: "", maLoMe: "",
    ngayThu: new Date().toISOString().slice(0, 10),
    status: "draft", notes: "",
  };
}

function parseNum(s: string) { return parseFloat(s.replace(/[^0-9.\-]/g, "")) || 0; }

function calcGrandTotal(lines: LineItem[], lamTronCong: string, lamTronTru: string) {
  const sum = lines.reduce((acc, l) => acc + parseNum(l.thanhTien), 0);
  const adj = parseNum(lamTronCong) - parseNum(lamTronTru);
  const total = sum + adj;
  return total !== 0 ? total.toLocaleString("vi-VN") + " đ" : "0 đ";
}

function calcLamTron(cong: string, tru: string) {
  const v = parseNum(cong) - parseNum(tru);
  return v === 0 ? "0" : String(v);
}

export default function DonThuMuaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<PurchaseOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<OForm>(EMPTY_FORM);
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [lamTronCong, setLamTronCong] = useState("");
  const [lamTronTru, setLamTronTru] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["purchase-orders"], queryFn: fetchPurchaseOrders });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const gradesQ = useQuery({ queryKey: ["grades"], queryFn: fetchGrades });
  const qlQ = useQuery({ queryKey: ["quality-levels"], queryFn: fetchQualityLevels });
  const facilitiesQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });

  function inv() { qc.invalidateQueries({ queryKey: ["purchase-orders"] }); }

  const createMu = useMutation({
    mutationFn: (payload: { order: OForm; lineItems: Omit<LineItem, "_key">[]; lamTron: string }) => {
      const { order, lineItems, lamTron } = payload;
      return createPurchaseOrder({ ...order, lamTron, total: calcGrandTotal(lines, lamTronCong, lamTronTru), lineItems });
    },
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { order: OForm; lineItems: Omit<LineItem, "_key">[]; lamTron: string } }) => {
      const { order, lineItems, lamTron } = payload;
      return updatePurchaseOrder(id, { ...order, lamTron, total: calcGrandTotal(lines, lamTronCong, lamTronTru), lineItems });
    },
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deletePurchaseOrder(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });

  function close_() {
    setDrawerOpen(false); setEditItem(null); setForm(EMPTY_FORM()); setLines([emptyLine()]);
    setLamTronCong(""); setLamTronTru(""); setErr(null);
  }

  function openEdit(o: PurchaseOrder) {
    setEditItem(o);
    setForm({
      maPhieu: o.maPhieu, enterpriseId: o.enterpriseId, facilityId: o.facilityId,
      facilityName: o.facilityName, diaChuThu: o.diaChuThu ?? "", maLoMe: o.maLoMe ?? "",
      ngayThu: o.ngayThu, status: o.status, notes: o.notes,
    });
    const lamTron = parseNum(o.lamTron ?? "0");
    if (lamTron > 0) { setLamTronCong(String(lamTron)); setLamTronTru(""); }
    else if (lamTron < 0) { setLamTronTru(String(Math.abs(lamTron))); setLamTronCong(""); }
    else { setLamTronCong(""); setLamTronTru(""); }
    setLines([emptyLine()]);
    setErr(null);
    setDrawerOpen(true);
    fetchPurchaseOrder(o.id)
      .then(({ lineItems }) => {
        if (lineItems && lineItems.length > 0)
          setLines(lineItems.map(li => ({ ...li, _key: String(Date.now() + Math.random()) })));
      })
      .catch(() => {});
  }

  function setF<K extends keyof OForm>(k: K, v: OForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function selectFacility(id: number | null) {
    const fac = (facilitiesQ.data?.items ?? []).find(f => f.id === id);
    setForm(p => ({
      ...p,
      facilityId: id,
      facilityName: fac?.name ?? "",
      diaChuThu: fac?.address ?? "",
      maLoMe: genMaLoMe(fac?.code ?? "", p.ngayThu),
    }));
  }

  function setNgayThu(v: string) {
    setForm(p => ({
      ...p,
      ngayThu: v,
      maLoMe: genMaLoMe(
        (facilitiesQ.data?.items ?? []).find(f => f.id === p.facilityId)?.code ?? "",
        v
      ),
    }));
  }

  function updateLine(key: string, field: keyof LineItem, value: unknown) {
    setLines(prev => prev.map(l => {
      if (l._key !== key) return l;
      const updated = { ...l, [field]: value };

      if (field === "productId" && value) {
        const p = productsQ.data?.items.find(p => p.id === Number(value));
        if (p) updated.productName = p.name;
      }

      if (field === "gradeId") {
        if (value) {
          const g = gradesQ.data?.items.find(g => g.id === Number(value));
          if (g) {
            updated.gradeName = g.name;
            updated.qualityPercent = "";
            updated.ghiChu = "";
            const prices = parsePrices(g.prices);
            if (prices.length === 0 && !updated.qualityPercent) updated.donGia = g.price;
            else updated.donGia = "";
          }
        } else {
          updated.gradeName = "";
          updated.donGia = "";
        }
      }

      if (field === "qualityPercent") {
        const ql = qlQ.data?.items.find(q => q.gradeId === updated.gradeId && q.danhGia === String(value));
        if (ql) {
          updated.ghiChu = ql.ghiChu;
          const prices = parsePrices(ql.prices);
          if (prices.length === 0) updated.donGia = ql.donGia;
          else updated.donGia = "";
        } else if (!value) {
          updated.ghiChu = "";
          if (updated.gradeId) {
            const g = gradesQ.data?.items.find(g => g.id === Number(updated.gradeId));
            if (g) {
              const prices = parsePrices(g.prices);
              if (prices.length === 0) updated.donGia = g.price;
              else updated.donGia = "";
            }
          }
        }
      }

      if (field === "khoiLuong" || field === "donGia") {
        const kg = parseNum(field === "khoiLuong" ? String(value) : updated.khoiLuong);
        const dg = parseNum(field === "donGia" ? String(value) : updated.donGia);
        if (kg > 0 && dg > 0) updated.thanhTien = (kg * dg).toLocaleString("vi-VN") + " đ";
      }

      if (field === "gradeId" || field === "qualityPercent") {
        const kg = parseNum(updated.khoiLuong);
        const dg = parseNum(updated.donGia);
        if (kg > 0 && dg > 0) updated.thanhTien = (kg * dg).toLocaleString("vi-VN") + " đ";
      }

      return updated;
    }));
  }

  function handleSubmit() {
    setErr(null);
    if (!form.ngayThu) { setErr("Vui lòng chọn ngày thu."); return; }
    if (!form.facilityId) { setErr("Vui lòng chọn cơ sở thu mua."); return; }
    const validLines = lines.filter(l => l.gradeId || l.productName.trim());
    if (validLines.length === 0) { setErr("Vui lòng thêm ít nhất một sản phẩm thu mua."); return; }
    if (validLines.some(l => !l.productName.trim())) { setErr("Vui lòng chọn thương phẩm cho tất cả các dòng."); return; }
    const lineItems = validLines.map(({ _key, ...rest }) => rest);
    const lamTron = calcLamTron(lamTronCong, lamTronTru);
    if (editItem) updateMu.mutate({ id: editItem.id, payload: { order: form, lineItems, lamTron } });
    else createMu.mutate({ order: form, lineItems, lamTron });
  }

  const items = listQ.data?.items ?? [];
  const filtered = items.filter(o => {
    if (search.trim() && ![o.facilityName, o.maLoMe ?? "", o.maPhieu].some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (dateFrom && o.ngayThu < dateFrom) return false;
    if (dateTo && o.ngayThu > dateTo) return false;
    return true;
  });
  const isPending = createMu.isPending || updateMu.isPending;
  const products = productsQ.data?.items ?? [];
  const grades = gradesQ.data?.items ?? [];
  const qualityLevels = qlQ.data?.items ?? [];
  const allFacilities = facilitiesQ.data?.items ?? [];

  function getPricesForLine(line: LineItem): PriceEntry[] {
    if (line.qualityPercent) {
      const ql = qualityLevels.find(q => q.gradeId === line.gradeId && q.danhGia === line.qualityPercent);
      if (ql) {
        const p = parsePrices(ql.prices);
        if (p.length > 0) return p;
      }
    }
    if (line.gradeId) {
      const g = grades.find(g => g.id === line.gradeId);
      if (g) return parsePrices(g.prices);
    }
    return [];
  }

  function getPriceHint(line: LineItem): string {
    if (line.qualityPercent) {
      const ql = qualityLevels.find(q => q.gradeId === line.gradeId && q.danhGia === line.qualityPercent);
      if (ql && parsePrices(ql.prices).length > 0) return "Đơn giá áp dụng theo % chất lượng";
    }
    if (line.gradeId && parsePrices(grades.find(g => g.id === line.gradeId)?.prices ?? "").length > 0)
      return "Đơn giá áp dụng theo quy cách";
    return "";
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">ERP / Thu mua</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Đơn Thu mua Chè</h1>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm cơ sở, mã lô…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground whitespace-nowrap">Từ</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-10 px-2 rounded-lg border border-border text-[13px] outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground whitespace-nowrap">đến</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-10 px-2 rounded-lg border border-border text-[13px] outline-none focus:border-primary" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="h-8 px-2 rounded-lg border border-border text-[12px] hover:bg-muted text-muted-foreground">Xóa lọc</button>
          )}
          <div className="flex-1" />
          <button onClick={() => setDrawerOpen(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110">
            <Plus className="w-4 h-4" /> Tạo phiếu thu mua
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Ngày thu mua</th>
                  <th className="px-4 py-3">Cơ sở thu mua</th>
                  <th className="px-4 py-3">Mã lô mẻ</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    <ShoppingBasket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search || dateFrom || dateTo ? "Không tìm thấy phiếu phù hợp." : "Chưa có phiếu thu mua nào."}
                  </td></tr>
                )}
                {filtered.map(o => (
                  <tr key={o.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3 font-medium">{fmtDate(o.ngayThu)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[13px]">{o.facilityName || "—"}</div>
                      {o.diaChuThu && <div className="text-[11.5px] text-muted-foreground">{o.diaChuThu}</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-mono">{o.maLoMe || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{o.total || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-[13px] text-muted-foreground">{filtered.length} / {items.length} phiếu</div>
        </div>
      </div>

      {/* Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><X className="w-5 h-5 text-rose-600" /></div>
            <h3 className="text-[16px] font-semibold text-center mb-1">Xóa phiếu thu mua?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Ngày <span className="font-semibold text-foreground">{fmtDate(deleteTarget.ngayThu)}</span> — {deleteTarget.facilityName}</p>
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
          <aside className="fixed top-0 right-0 h-full w-full lg:w-[680px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[18px] font-semibold">{editItem ? "Sửa phiếu thu mua" : "Tạo phiếu thu mua"}</div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              {/* Header fields */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Ngày thu mua <span className="text-rose-500">*</span></label>
                    <input type="date" value={form.ngayThu} onChange={e => setNgayThu(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Cơ sở thu mua <span className="text-rose-500">*</span></label>
                    <select
                      value={form.facilityId ?? ""}
                      onChange={e => selectFacility(e.target.value ? Number(e.target.value) : null)}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white"
                    >
                      <option value="">-- Chọn cơ sở / hộ --</option>
                      {allFacilities.map(f => <option key={f.id} value={f.id}>{f.name}{f.code ? ` (${f.code})` : ""}</option>)}
                    </select>
                  </div>
                </div>

                {form.facilityId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Địa chỉ thu mua
                      </label>
                      <input
                        value={form.diaChuThu}
                        onChange={e => setF("diaChuThu", e.target.value)}
                        placeholder="Tự điền từ cơ sở…"
                        className="w-full h-10 px-3 rounded-lg border border-border text-[13px] outline-none focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Mã lô mẻ</label>
                      <input
                        value={form.maLoMe}
                        onChange={e => setF("maLoMe", e.target.value)}
                        placeholder="CS001-20260506"
                        className="w-full h-10 px-3 rounded-lg border border-border text-[13px] outline-none focus:border-primary bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                  <input value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Ghi chú…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white" />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-3">
                <div className="text-[14px] font-semibold">Danh sách sản phẩm thu mua</div>

                {lines.map((line, idx) => {
                  const priceOptions = getPricesForLine(line);
                  const priceHint = getPriceHint(line);
                  const linkedQls = qualityLevels.filter(q => q.gradeId === line.gradeId || q.gradeId === null);

                  return (
                    <div key={line._key} className="rounded-xl border border-border bg-white overflow-hidden">
                      <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-muted-foreground">Sản phẩm #{idx + 1}</span>
                        {lines.length > 1 && (
                          <button onClick={() => setLines(p => p.filter(l => l._key !== line._key))} className="p-1 rounded hover:bg-rose-50">
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        {/* Row 1: Thương phẩm + Quy cách */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Thương phẩm</label>
                            <select
                              value={line.productId ?? ""}
                              onChange={e => updateLine(line._key, "productId", e.target.value ? Number(e.target.value) : null)}
                              className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none bg-white"
                            >
                              <option value="">-- Chọn thương phẩm --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Quy cách <span className="text-rose-500">*</span></label>
                            <select
                              value={line.gradeId ?? ""}
                              onChange={e => updateLine(line._key, "gradeId", e.target.value ? Number(e.target.value) : null)}
                              className={`w-full h-9 px-2.5 rounded-lg border text-[13px] outline-none bg-white ${!line.gradeId ? "border-amber-300" : "border-border"}`}
                            >
                              <option value="">-- Chọn quy cách --</option>
                              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Row 2: % Chất lượng */}
                        <div>
                          <label className="block text-[12px] font-medium mb-1 text-muted-foreground">% Chất lượng <span className="text-[11px] text-muted-foreground/70">(không bắt buộc)</span></label>
                          <select
                            value={line.qualityPercent}
                            onChange={e => updateLine(line._key, "qualityPercent", e.target.value)}
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none bg-white"
                          >
                            <option value="">-- Không áp dụng --</option>
                            {linkedQls.map(q => (
                              <option key={q.id} value={q.danhGia}>
                                {q.danhGia}{q.ghiChu ? ` — ${q.ghiChu}` : ""}
                              </option>
                            ))}
                          </select>
                          {line.ghiChu && (
                            <div className="mt-1 text-[11.5px] text-blue-600 font-medium flex items-center gap-1">
                              <Info className="w-3 h-3" /> {line.ghiChu}
                            </div>
                          )}
                        </div>

                        {/* Row 3: Đơn giá */}
                        <div>
                          <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Đơn giá (đ/kg)</label>
                          {priceOptions.length > 0 ? (
                            <select
                              value={line.donGia}
                              onChange={e => updateLine(line._key, "donGia", e.target.value)}
                              className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none bg-white"
                            >
                              <option value="">-- Chọn mức giá --</option>
                              {priceOptions.map((e, i) => (
                                <option key={i} value={e.value}>{e.label ? `${e.label}: ` : ""}{e.value}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              value={line.donGia}
                              onChange={e => updateLine(line._key, "donGia", e.target.value)}
                              placeholder="Nhập đơn giá…"
                              className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                            />
                          )}
                          {priceHint && (
                            <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
                              <Info className="w-3 h-3" /> {priceHint}
                            </div>
                          )}
                        </div>

                        {/* Row 4: Khối lượng + Thành tiền */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Khối lượng (kg)</label>
                            <input
                              value={line.khoiLuong}
                              onChange={e => updateLine(line._key, "khoiLuong", e.target.value)}
                              placeholder="0"
                              className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Thành tiền</label>
                            <div className="w-full h-9 px-2.5 rounded-lg border border-border bg-emerald-50/60 text-[13px] font-semibold text-emerald-700 flex items-center">
                              {line.thanhTien || "—"}
                            </div>
                          </div>
                        </div>

                        {/* Row 5: Mô tả */}
                        <div>
                          <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Mô tả / Ghi chú chất lượng</label>
                          <input
                            value={line.moTa}
                            onChange={e => updateLine(line._key, "moTa", e.target.value)}
                            placeholder="Mô tả thêm về lô hàng…"
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => setLines(p => [...p, emptyLine()])}
                  className="w-full h-10 rounded-xl border border-dashed border-border text-[13px] font-medium text-muted-foreground hover:bg-muted flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm sản phẩm
                </button>
              </div>

              {/* Tổng kết */}
              <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
                <div className="text-[13.5px] font-semibold mb-2">Tổng kết phiếu</div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Tổng tiền hàng:</span>
                  <span className="font-semibold text-emerald-700">
                    {(() => {
                      const sum = lines.reduce((acc, l) => acc + parseNum(l.thanhTien), 0);
                      return sum > 0 ? sum.toLocaleString("vi-VN") + " đ" : "0 đ";
                    })()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-muted-foreground">Tiền lẻ điều chỉnh:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] text-muted-foreground mb-1">Trừ (−)</label>
                      <input
                        value={lamTronTru}
                        onChange={e => { setLamTronTru(e.target.value); if (e.target.value) setLamTronCong(""); }}
                        placeholder="0"
                        className="w-full h-9 px-2.5 rounded-lg border border-rose-200 bg-rose-50/40 text-[13px] outline-none focus:border-rose-400 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-muted-foreground mb-1">Cộng (+)</label>
                      <input
                        value={lamTronCong}
                        onChange={e => { setLamTronCong(e.target.value); if (e.target.value) setLamTronTru(""); }}
                        placeholder="0"
                        className="w-full h-9 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 text-[13px] outline-none focus:border-emerald-400 text-right"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[14px] font-bold border-t border-border pt-3">
                  <span>Tổng cộng:</span>
                  <span className="text-emerald-700">{calcGrandTotal(lines, lamTronCong, lamTronTru)}</span>
                </div>
              </div>

              {err && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{err}</div>}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={close_} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={isPending} onClick={handleSubmit} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Tạo phiếu"}
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
