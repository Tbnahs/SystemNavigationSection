import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, X, Loader2, Search, ShoppingBasket, Trash2,
  CheckCircle, FileText, XCircle,
} from "lucide-react";
import {
  fetchPurchaseOrders, fetchPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
  fetchProducts, fetchGrades, fetchQualityLevels, fetchFacilities, fetchEnterprises,
  type PurchaseOrder, type PurchaseOrderItem,
} from "@/lib/api";

const STATUS_OPT = [
  { value: "draft" as const, label: "Nháp", cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: FileText },
  { value: "confirmed" as const, label: "Đã xác nhận", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: CheckCircle },
  { value: "cancelled" as const, label: "Đã hủy", cls: "bg-rose-50 text-rose-600 ring-rose-200", icon: XCircle },
];
function statusOpt(s: PurchaseOrder["status"]) { return STATUS_OPT.find(o => o.value === s)!; }

function fmtDate(d: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("vi-VN"); } catch { return d; }
}

function genMaPhieu() {
  const d = new Date();
  return `PTHU-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
}

type LineItem = Omit<PurchaseOrderItem, "id" | "orderId"> & { _key: string };

function emptyLine(): LineItem {
  return {
    _key: String(Date.now() + Math.random()),
    productId: null, gradeId: null,
    productName: "", gradeName: "", qualityPercent: "", xepLoai: "",
    khoiLuong: "", donGia: "", thanhTien: "", moTa: "",
  };
}

type OForm = {
  enterpriseId: number | null;
  facilityId: number | null;
  facilityName: string;
  ngayThu: string;
  status: PurchaseOrder["status"];
  notes: string;
  maPhieu: string;
  lamTron: string;
};

function EMPTY_FORM(): OForm {
  return {
    maPhieu: genMaPhieu(),
    enterpriseId: null, facilityId: null, facilityName: "",
    ngayThu: new Date().toISOString().slice(0, 10),
    status: "draft", notes: "", lamTron: "0",
  };
}

function parseNum(s: string) { return parseFloat(s.replace(/[^0-9.\-]/g, "")) || 0; }

function calcTotal(lines: LineItem[], lamTron = "0") {
  const sum = lines.reduce((acc, l) => acc + parseNum(l.thanhTien), 0);
  const round = parseNum(lamTron);
  const total = sum + round;
  return total !== 0 ? total.toLocaleString("vi-VN") + " đ" : "0 đ";
}

export default function DonThuMuaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<PurchaseOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [viewDetail, setViewDetail] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<OForm>(EMPTY_FORM);
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["purchase-orders"], queryFn: fetchPurchaseOrders });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const gradesQ = useQuery({ queryKey: ["grades"], queryFn: fetchGrades });
  const qlQ = useQuery({ queryKey: ["quality-levels"], queryFn: fetchQualityLevels });
  const facilitiesQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });

  function inv() { qc.invalidateQueries({ queryKey: ["purchase-orders"] }); }

  const createMu = useMutation({
    mutationFn: (payload: OForm & { lineItems: Omit<LineItem, "_key">[] }) => {
      const { lineItems, ...orderData } = payload;
      return createPurchaseOrder({ ...orderData, total: calcTotal(lines, form.lamTron), lineItems });
    },
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OForm & { lineItems: Omit<LineItem, "_key">[] } }) => {
      const { lineItems, ...orderData } = payload;
      return updatePurchaseOrder(id, { ...orderData, total: calcTotal(lines, form.lamTron), lineItems });
    },
    onSuccess: () => { inv(); close_(); },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deletePurchaseOrder(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });

  function close_() { setDrawerOpen(false); setEditItem(null); setForm(EMPTY_FORM()); setLines([emptyLine()]); setErr(null); }
  function openEdit(o: PurchaseOrder) {
    setEditItem(o);
    setForm({ maPhieu: o.maPhieu, enterpriseId: o.enterpriseId, facilityId: o.facilityId, facilityName: o.facilityName, ngayThu: o.ngayThu, status: o.status, notes: o.notes, lamTron: o.lamTron ?? "0" });
    setLines([emptyLine()]);
    setErr(null);
    setDrawerOpen(true);
    fetchPurchaseOrder(o.id)
      .then(({ lineItems }) => {
        if (lineItems && lineItems.length > 0) {
          setLines(lineItems.map(li => ({ ...li, _key: String(Date.now() + Math.random()) })));
        }
      })
      .catch(() => {});
  }
  function setF<K extends keyof OForm>(k: K, v: OForm[K]) { setForm(p => ({ ...p, [k]: v })); }

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
            // Chỉ áp giá quy cách nếu chưa có % chất lượng
            if (!updated.qualityPercent) updated.donGia = g.price;
          }
        } else {
          updated.gradeName = "";
        }
      }

      if (field === "qualityPercent") {
        const ql = qlQ.data?.items.find(q => q.danhGia === String(value));
        if (ql) {
          updated.xepLoai = ql.xepLoai;
          // Ưu tiên giá theo % chất lượng
          updated.donGia = ql.donGia;
        } else if (!value) {
          // Quay về giá quy cách nếu bỏ chọn % CL
          if (updated.gradeId) {
            const g = gradesQ.data?.items.find(g => g.id === Number(updated.gradeId));
            if (g) updated.donGia = g.price;
          }
          updated.xepLoai = "";
        }
      }

      if (field === "khoiLuong" || field === "donGia") {
        const kg = parseNum(field === "khoiLuong" ? String(value) : updated.khoiLuong);
        const dg = parseNum(field === "donGia" ? String(value) : updated.donGia);
        if (kg > 0 && dg > 0) {
          updated.thanhTien = (kg * dg).toLocaleString("vi-VN") + " đ";
        }
      }

      // Recalc thanhTien if donGia changed by grade/quality selection
      if (field === "gradeId" || field === "qualityPercent") {
        const kg = parseNum(updated.khoiLuong);
        const dg = parseNum(updated.donGia);
        if (kg > 0 && dg > 0) {
          updated.thanhTien = (kg * dg).toLocaleString("vi-VN") + " đ";
        }
      }

      return updated;
    }));
  }

  function handleSubmit() {
    setErr(null);
    if (!form.ngayThu) { setErr("Vui lòng chọn ngày thu."); return; }
    if (lines.some(l => !l.productName.trim())) { setErr("Vui lòng nhập đầy đủ thông tin sản phẩm."); return; }
    const lineItems = lines.map(({ _key, ...rest }) => rest);
    if (editItem) updateMu.mutate({ id: editItem.id, payload: { ...form, lineItems } });
    else createMu.mutate({ ...form, lineItems });
  }

  const items = listQ.data?.items ?? [];
  const filtered = search.trim() ? items.filter(o => [o.maPhieu, o.facilityName, o.enterpriseName ?? ""].some(s => s.toLowerCase().includes(search.toLowerCase()))) : items;
  const isPending = createMu.isPending || updateMu.isPending;
  const products = productsQ.data?.items ?? [];
  const grades = gradesQ.data?.items ?? [];
  const qualityLevels = qlQ.data?.items ?? [];
  const allFacilities = facilitiesQ.data?.items ?? [];
  const facilities = form.enterpriseId
    ? allFacilities.filter(f => f.enterpriseId === form.enterpriseId)
    : allFacilities;
  const enterprises = dnQ.data?.items ?? [];

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">ERP / Thu mua</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Đơn Thu mua Chè</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STATUS_OPT.map(opt => {
            const Icon = opt.icon;
            const cnt = items.filter(o => o.status === opt.value).length;
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã phiếu, cơ sở…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
          </div>
          <button onClick={() => setDrawerOpen(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110">
            <Plus className="w-4 h-4" /> Tạo phiếu thu mua
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Mã phiếu</th>
                  <th className="px-4 py-3">Cơ sở thu mua</th>
                  <th className="px-4 py-3">Ngày thu</th>
                  <th className="px-4 py-3">Doanh nghiệp</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <ShoppingBasket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? "Không tìm thấy phiếu phù hợp." : "Chưa có phiếu thu mua nào."}
                  </td></tr>
                )}
                {filtered.map(o => {
                  const sOpt = statusOpt(o.status);
                  return (
                    <tr key={o.id} className="border-t border-border hover:bg-emerald-50/30">
                      <td className="px-4 py-3">
                        <button onClick={() => setViewDetail(o)} className="font-mono font-semibold text-primary hover:underline">{o.maPhieu}</button>
                      </td>
                      <td className="px-4 py-3 text-[13px]">{o.facilityName || "—"}</td>
                      <td className="px-4 py-3 text-[13px]">{fmtDate(o.ngayThu)}</td>
                      <td className="px-4 py-3 text-[13px]">{o.enterpriseName ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{o.total || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${sOpt.cls}`}>
                          {sOpt.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(o)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa phiếu <span className="font-semibold text-foreground">{deleteTarget.maPhieu}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={deleteMu.isPending} onClick={() => deleteMu.mutate(deleteTarget.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail modal */}
      {viewDetail && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold">Chi tiết phiếu {viewDetail.maPhieu}</h3>
              <button onClick={() => setViewDetail(null)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px] mb-4">
              <div><span className="text-muted-foreground">Ngày thu:</span> <span className="font-medium">{fmtDate(viewDetail.ngayThu)}</span></div>
              <div><span className="text-muted-foreground">Cơ sở:</span> <span className="font-medium">{viewDetail.facilityName || "—"}</span></div>
              <div><span className="text-muted-foreground">DN:</span> <span className="font-medium">{viewDetail.enterpriseName || "—"}</span></div>
              <div><span className="text-muted-foreground">Tổng tiền:</span> <span className="font-semibold text-emerald-700">{viewDetail.total}</span></div>
            </div>
            {viewDetail.notes && <p className="text-[12.5px] text-muted-foreground mb-4">Ghi chú: {viewDetail.notes}</p>}
            <div className="flex justify-end">
              <button onClick={() => setViewDetail(null)} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={close_} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[680px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[18px] font-semibold">{editItem ? "Sửa phiếu thu mua" : "Tạo phiếu thu mua"}</div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              {/* Header info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Mã phiếu</label>
                  <input value={form.maPhieu} onChange={e => setF("maPhieu", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary font-mono" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Ngày thu <span className="text-rose-500">*</span></label>
                  <input type="date" value={form.ngayThu} onChange={e => setF("ngayThu", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Doanh nghiệp</label>
                  <select
                    value={form.enterpriseId ?? ""}
                    onChange={e => {
                      setForm(p => ({ ...p, enterpriseId: e.target.value ? Number(e.target.value) : null, facilityId: null, facilityName: "" }));
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white"
                  >
                    <option value="">-- Chọn DN --</option>
                    {enterprises.map(d => <option key={d.id} value={d.id}>{d.tenHienThi}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Cơ sở thu mua</label>
                  <select
                    value={form.facilityId ?? ""}
                    onChange={e => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      const fac = facilities.find(f => f.id === id);
                      setF("facilityId", id);
                      setF("facilityName", fac?.name ?? "");
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white"
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                  <select value={form.status} onChange={e => setF("status", e.target.value as PurchaseOrder["status"])} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                    {STATUS_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                  <input value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Ghi chú…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[14px] font-semibold">Danh sách sản phẩm thu mua</div>
                  <button onClick={() => setLines(p => [...p, emptyLine()])} className="h-8 px-3 rounded-lg border border-border text-[12.5px] font-medium hover:bg-muted flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Thêm dòng
                  </button>
                </div>
                <div className="rounded-xl border border-border overflow-x-auto">
                  <table className="w-full text-[12.5px] min-w-[640px]">
                    <thead>
                      <tr className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2.5 text-left min-w-[130px]">Thương phẩm</th>
                        <th className="px-3 py-2.5 text-left min-w-[110px]">Quy cách</th>
                        <th className="px-3 py-2.5 text-left min-w-[90px]">% CL</th>
                        <th className="px-3 py-2.5 text-left min-w-[72px]">KL (kg)</th>
                        <th className="px-3 py-2.5 text-left min-w-[88px]">Đơn giá</th>
                        <th className="px-3 py-2.5 text-left min-w-[90px]">Thành tiền</th>
                        <th className="px-3 py-2.5 text-left min-w-[120px]">Mô tả / Chất lượng</th>
                        <th className="px-3 py-2.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map(line => (
                        <tr key={line._key} className="border-t border-border">
                          <td className="px-2 py-1.5">
                            <select
                              value={line.productId ?? ""}
                              onChange={e => updateLine(line._key, "productId", e.target.value ? Number(e.target.value) : null)}
                              className="w-full h-8 px-2 rounded border border-border text-[12px] outline-none bg-white"
                            >
                              <option value="">Chọn SP</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <select
                              value={line.gradeId ?? ""}
                              onChange={e => updateLine(line._key, "gradeId", e.target.value ? Number(e.target.value) : null)}
                              className="w-full h-8 px-2 rounded border border-border text-[12px] outline-none bg-white"
                            >
                              <option value="">Quy cách</option>
                              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <select
                              value={line.qualityPercent}
                              onChange={e => updateLine(line._key, "qualityPercent", e.target.value)}
                              className="w-full h-8 px-2 rounded border border-border text-[12px] outline-none bg-white"
                            >
                              <option value="">% CL</option>
                              {qualityLevels.map(q => <option key={q.id} value={q.danhGia}>{q.danhGia} ({q.xepLoai})</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              value={line.khoiLuong}
                              onChange={e => updateLine(line._key, "khoiLuong", e.target.value)}
                              placeholder="0"
                              className="w-20 h-8 px-2 rounded border border-border text-[12px] outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex flex-col gap-0.5">
                              <input
                                value={line.donGia}
                                onChange={e => updateLine(line._key, "donGia", e.target.value)}
                                placeholder="0"
                                className="w-24 h-8 px-2 rounded border border-border text-[12px] outline-none focus:border-primary"
                              />
                              {line.qualityPercent && (
                                <span className="text-[10px] text-blue-600 font-medium px-1">% CL</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 font-medium text-emerald-700 whitespace-nowrap">{line.thanhTien || "—"}</td>
                          <td className="px-2 py-1.5">
                            <input
                              value={line.moTa}
                              onChange={e => updateLine(line._key, "moTa", e.target.value)}
                              placeholder="Mô tả, chất lượng…"
                              className="w-32 h-8 px-2 rounded border border-border text-[12px] outline-none focus:border-primary"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            {lines.length > 1 && (
                              <button onClick={() => setLines(p => p.filter(l => l._key !== line._key))} className="p-1 rounded hover:bg-rose-50">
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border/60 bg-muted/10">
                        <td colSpan={5} className="px-3 py-2 text-right text-[12px] text-muted-foreground">Làm tròn (±):</td>
                        <td colSpan={3} className="px-3 py-2">
                          <input
                            value={form.lamTron}
                            onChange={e => setF("lamTron", e.target.value)}
                            placeholder="0"
                            className="w-28 h-7 px-2 rounded border border-border text-[12px] outline-none focus:border-primary text-right"
                          />
                        </td>
                      </tr>
                      <tr className="border-t-2 border-border bg-emerald-50/60">
                        <td colSpan={5} className="px-3 py-2.5 text-right text-[13px] font-bold">Tổng cộng:</td>
                        <td colSpan={3} className="px-3 py-2.5 text-[14px] font-bold text-emerald-700">{calcTotal(lines, form.lamTron)}</td>
                      </tr>
                    </tfoot>
                  </table>
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
