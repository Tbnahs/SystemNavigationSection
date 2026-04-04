import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Star, Package, Info, Plus, Edit2, Trash2, X } from "lucide-react";

const productColor: Record<string, string> = {
  "Hồng trà":  "bg-rose-100 text-rose-700",
  "Bạch trà":  "bg-sky-100 text-sky-700",
  "Chè xanh":  "bg-emerald-100 text-emerald-700",
};

const mauSacOptions = [
  { value: "bg-gray-100 text-gray-600",       label: "Xám (thấp)" },
  { value: "bg-blue-100 text-blue-700",       label: "Xanh dương" },
  { value: "bg-violet-100 text-violet-700",   label: "Tím" },
  { value: "bg-emerald-100 text-emerald-700", label: "Xanh lá (cao)" },
  { value: "bg-amber-100 text-amber-700",     label: "Vàng (đặc biệt)" },
];

type QuyCach  = { id: number; stt: number; quyCach: string; donGia: string; moTa: string; loaiChe: string };
type TichLuong = { id: number; stt: number; danhGia: string; donGia: string; mauSac: string };
type TieuChuan = { id: number; tieu: string; moTa: string };

const initQC: QuyCach[] = [
  { id:1, stt:1, quyCach:"1 tôm",      donGia:"520.000 đ/kg",          moTa:"Búp non một tôm, không có lá",  loaiChe:"Bạch trà" },
  { id:2, stt:2, quyCach:"1 tôm 1 lá", donGia:"27.000 – 30.000 đ/kg", moTa:"Búp và một lá non kèm theo",   loaiChe:"Hồng trà" },
  { id:3, stt:3, quyCach:"1 tôm 2 lá", donGia:"27.000 – 30.000 đ/kg", moTa:"Búp và hai lá non kèm theo",   loaiChe:"Chè xanh" },
  { id:4, stt:4, quyCach:"2 lá",        donGia:"27.000 đ/kg",           moTa:"Hai lá non, không kèm búp",    loaiChe:"" },
];
const initTL: TichLuong[] = [
  { id:1, stt:1, danhGia:"70–79%",     donGia:"27.000 đ/kg",             mauSac:"bg-gray-100 text-gray-600" },
  { id:2, stt:2, danhGia:"80–89%",     donGia:"28.000 đ/kg",             mauSac:"bg-blue-100 text-blue-700" },
  { id:3, stt:3, danhGia:"90–99%",     donGia:"29.000 đ/kg",             mauSac:"bg-violet-100 text-violet-700" },
  { id:4, stt:4, danhGia:"100%",       donGia:"30.000 đ/kg",             mauSac:"bg-emerald-100 text-emerald-700" },
  { id:5, stt:5, danhGia:"Cây di sản", donGia:"40.000 – 60.000 đ/kg",  mauSac:"bg-amber-100 text-amber-700" },
];
const initTC: TieuChuan[] = [
  { id:1, tieu:"Độ non, già của búp chè",                moTa:"Búp phải non, chưa mở lá hoàn toàn, màu xanh non đặc trưng" },
  { id:2, tieu:"Độ đồng đều của búp chè khi thu hái",   moTa:"Kích cỡ búp đồng đều, không lẫn lá già hay cành non" },
  { id:3, tieu:"Độ chuẩn chỉ khi thu hái",              moTa:"Thu hái đúng quy cách (1 tôm / 1 tôm 1 lá / 1 tôm 2 lá)" },
];

let nextId = 100;
function genId() { return ++nextId; }

export default function QualityPage() {
  const [, setLocation] = useLocation();

  // --- Quy cách thu mua ---
  const [qcList, setQcList] = useState<QuyCach[]>(initQC);
  const [qcModal, setQcModal] = useState<{ open: boolean; item: Partial<QuyCach> | null }>({ open: false, item: null });

  const openQcAdd  = () => setQcModal({ open: true, item: { quyCach: "", donGia: "", moTa: "", loaiChe: "" } });
  const openQcEdit = (row: QuyCach) => setQcModal({ open: true, item: { ...row } });
  const closeQc    = () => setQcModal({ open: false, item: null });

  const saveQc = () => {
    const f = qcModal.item!;
    if (!f.quyCach?.trim()) return;
    setQcList(prev => {
      if (f.id) return prev.map(r => r.id === f.id ? { ...r, ...f } as QuyCach : r);
      const newItem: QuyCach = { id: genId(), stt: prev.length + 1, quyCach: f.quyCach!, donGia: f.donGia || "", moTa: f.moTa || "", loaiChe: f.loaiChe || "" };
      return [...prev, newItem];
    });
    closeQc();
  };

  const deleteQc = (id: number) => {
    if (!window.confirm("Xóa quy cách này?")) return;
    setQcList(prev => prev.filter(r => r.id !== id));
  };

  // --- Tiêu chuẩn chất lượng ---
  const [tlList, setTlList] = useState<TichLuong[]>(initTL);
  const [tlModal, setTlModal] = useState<{ open: boolean; item: Partial<TichLuong> | null }>({ open: false, item: null });

  const openTlAdd  = () => setTlModal({ open: true, item: { danhGia: "", donGia: "", mauSac: "bg-gray-100 text-gray-600" } });
  const openTlEdit = (row: TichLuong) => setTlModal({ open: true, item: { ...row } });
  const closeTl    = () => setTlModal({ open: false, item: null });

  const saveTl = () => {
    const f = tlModal.item!;
    if (!f.danhGia?.trim()) return;
    setTlList(prev => {
      if (f.id) return prev.map(r => r.id === f.id ? { ...r, ...f } as TichLuong : r);
      const newItem: TichLuong = { id: genId(), stt: prev.length + 1, danhGia: f.danhGia!, donGia: f.donGia || "", mauSac: f.mauSac || "bg-gray-100 text-gray-600" };
      return [...prev, newItem];
    });
    closeTl();
  };

  const deleteTl = (id: number) => {
    if (!window.confirm("Xóa mức đánh giá này?")) return;
    setTlList(prev => prev.filter(r => r.id !== id));
  };

  // --- Tiêu chí đánh giá ---
  const [tcList, setTcList] = useState<TieuChuan[]>(initTC);
  const [tcModal, setTcModal] = useState<{ open: boolean; item: Partial<TieuChuan> | null }>({ open: false, item: null });

  const openTcAdd  = () => setTcModal({ open: true, item: { tieu: "", moTa: "" } });
  const openTcEdit = (row: TieuChuan) => setTcModal({ open: true, item: { ...row } });
  const closeTc    = () => setTcModal({ open: false, item: null });

  const saveTc = () => {
    const f = tcModal.item!;
    if (!f.tieu?.trim()) return;
    setTcList(prev => {
      if (f.id) return prev.map(r => r.id === f.id ? { ...r, ...f } as TieuChuan : r);
      return [...prev, { id: genId(), tieu: f.tieu!, moTa: f.moTa || "" }];
    });
    closeTc();
  };

  const deleteTc = (id: number) => {
    if (!window.confirm("Xóa tiêu chí này?")) return;
    setTcList(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Quy cách & Tiêu chuẩn chất lượng</h1>
          <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Chè Shan Tuyết Bằng Phúc</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Quy cách thu mua */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-sm text-foreground">Quy cách thu mua</h2>
            </div>
            <button onClick={openQcAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["STT", "Quy cách", "Đơn giá", "Loại chè", "Mô tả"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                  <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {qcList.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.stt}</td>
                    <td className="py-3 px-4 font-semibold">{row.quyCach}</td>
                    <td className="py-3 px-4 font-mono text-sm text-primary font-semibold whitespace-nowrap">{row.donGia}</td>
                    <td className="py-3 px-4">
                      {row.loaiChe
                        ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.loaiChe] ?? "bg-gray-100 text-gray-600"}`}>{row.loaiChe}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.moTa}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => openQcEdit(row)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteQc(row.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tiêu chuẩn chất lượng theo % */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-sm text-foreground">Tiêu chuẩn đánh giá chất lượng</h2>
            </div>
            <button onClick={openTlAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["STT", "Mức đánh giá", "Đơn giá"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                  <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tlList.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.stt}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.mauSac}`}>{row.danhGia}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-primary whitespace-nowrap">{row.donGia}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => openTlEdit(row)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteTl(row.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 pb-5 pt-3">
            <p className="text-xs font-semibold text-foreground mb-3">Thang giá theo chất lượng (% đạt)</p>
            <div className="flex items-end gap-1 h-16">
              {[
                { label: "70%",    val: 27, color: "bg-gray-300" },
                { label: "80%",    val: 28, color: "bg-blue-300" },
                { label: "90%",    val: 29, color: "bg-violet-400" },
                { label: "100%",   val: 30, color: "bg-emerald-400" },
                { label: "Di sản", val: 50, color: "bg-amber-400" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-bold text-foreground">{b.val}k</span>
                  <div className={`w-full rounded-t-md ${b.color}`} style={{ height: `${(b.val / 50) * 100}%` }} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tiêu chí đánh giá */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-500" />
              <h2 className="font-semibold text-sm text-foreground">Tiêu chí đánh giá tỷ lệ chất lượng</h2>
            </div>
            <button onClick={openTcAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
          <div className="p-5 space-y-3">
            {tcList.map((item, i) => (
              <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-xl border border-border group">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.tieu}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.moTa}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => openTcEdit(item)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteTc(item.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Quy cách thu mua */}
      {qcModal.open && qcModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeQc} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">{qcModal.item.id ? "Sửa quy cách" : "Thêm quy cách"}</h2>
              <button onClick={closeQc} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quy cách <span className="text-red-500">*</span></label>
                <input value={qcModal.item.quyCach || ""} onChange={e => setQcModal(m => ({ ...m, item: { ...m.item!, quyCach: e.target.value } }))} placeholder="vd: 1 tôm 3 lá" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Đơn giá</label>
                  <input value={qcModal.item.donGia || ""} onChange={e => setQcModal(m => ({ ...m, item: { ...m.item!, donGia: e.target.value } }))} placeholder="vd: 25.000 đ/kg" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại chè</label>
                  <select value={qcModal.item.loaiChe || ""} onChange={e => setQcModal(m => ({ ...m, item: { ...m.item!, loaiChe: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">— Không chọn —</option>
                    {Object.keys(productColor).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mô tả</label>
                <input value={qcModal.item.moTa || ""} onChange={e => setQcModal(m => ({ ...m, item: { ...m.item!, moTa: e.target.value } }))} placeholder="Mô tả ngắn gọn..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={closeQc} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
              <button onClick={saveQc} disabled={!qcModal.item.quyCach?.trim()} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tiêu chuẩn đánh giá */}
      {tlModal.open && tlModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeTl} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">{tlModal.item.id ? "Sửa mức đánh giá" : "Thêm mức đánh giá"}</h2>
              <button onClick={closeTl} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mức đánh giá <span className="text-red-500">*</span></label>
                  <input value={tlModal.item.danhGia || ""} onChange={e => setTlModal(m => ({ ...m, item: { ...m.item!, danhGia: e.target.value } }))} placeholder="vd: 60–69%" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Đơn giá</label>
                  <input value={tlModal.item.donGia || ""} onChange={e => setTlModal(m => ({ ...m, item: { ...m.item!, donGia: e.target.value } }))} placeholder="vd: 26.000 đ/kg" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Màu hiển thị</label>
                <select value={tlModal.item.mauSac || ""} onChange={e => setTlModal(m => ({ ...m, item: { ...m.item!, mauSac: e.target.value } }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {mauSacOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {tlModal.item.danhGia && (
                  <div className="mt-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${tlModal.item.mauSac}`}>{tlModal.item.danhGia}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={closeTl} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
              <button onClick={saveTl} disabled={!tlModal.item.danhGia?.trim()} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tiêu chí đánh giá */}
      {tcModal.open && tcModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeTc} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">{tcModal.item.id ? "Sửa tiêu chí" : "Thêm tiêu chí"}</h2>
              <button onClick={closeTc} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tiêu chí <span className="text-red-500">*</span></label>
                <input value={tcModal.item.tieu || ""} onChange={e => setTcModal(m => ({ ...m, item: { ...m.item!, tieu: e.target.value } }))} placeholder="Tên tiêu chí đánh giá..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mô tả chi tiết</label>
                <textarea value={tcModal.item.moTa || ""} onChange={e => setTcModal(m => ({ ...m, item: { ...m.item!, moTa: e.target.value } }))} rows={3} placeholder="Hướng dẫn đánh giá tiêu chí này..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={closeTc} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
              <button onClick={saveTc} disabled={!tcModal.item.tieu?.trim()} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
