import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter,
  ChevronUp, ChevronDown, Box, Package,
  Leaf, X, FileSpreadsheet, FileText, Printer,
  Eye, Edit2, Trash2, CheckCircle2, Clock, Truck,
} from "lucide-react";

const productColor: Record<string, string> = {
  "Hồng trà":  "bg-rose-100 text-rose-700",
  "Bạch trà":  "bg-sky-100 text-sky-700",
  "Chè xanh":  "bg-emerald-100 text-emerald-700",
};

const BAO_BI_OPTIONS = [
  { value: "hop-giay-100g",   label: "Hộp giấy 100g",   kgPerUnit: 0.1  },
  { value: "hop-thiec-250g",  label: "Hộp thiếc 250g",  kgPerUnit: 0.25 },
  { value: "tui-kraft-50g",   label: "Túi kraft 50g",    kgPerUnit: 0.05 },
  { value: "tui-bulk-1kg",    label: "Túi hút chân không 1kg", kgPerUnit: 1.0 },
  { value: "hop-qua-tang",    label: "Hộp quà tặng",     kgPerUnit: 0.2  },
];

type TrangThai = "cho-dong-goi" | "dang-dong-goi" | "hoan-thanh" | "da-xuat-kho";
const TRANG_THAI: Record<TrangThai, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "cho-dong-goi":   { label: "Chờ đóng gói",  color: "bg-gray-100 text-gray-600",      icon: Clock },
  "dang-dong-goi":  { label: "Đang đóng gói", color: "bg-amber-100 text-amber-700",    icon: Clock },
  "hoan-thanh":     { label: "Hoàn thành",     color: "bg-blue-100 text-blue-700",      icon: CheckCircle2 },
  "da-xuat-kho":    { label: "Đã xuất kho",    color: "bg-emerald-100 text-emerald-700", icon: Truck },
};

interface LoDongGoi {
  id: string;
  maDongGoi: string;
  maLoSX: string;
  thoiGian: string;
  thanhPham: string;
  loaiBaoBi: string;
  klDongGoi: number;
  soSanPham: number;
  trangThai: TrangThai;
  nguoiThucHien: string;
  ghiChu: string;
}

const initData: LoDongGoi[] = [
  { id:"1",  maDongGoi:"S013003",  maLoSX:"L013003",  thoiGian:"30/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g",  klDongGoi:5.5,  soSanPham:22,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"2",  maDongGoi:"S023103",  maLoSX:"L023103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g",  klDongGoi:6.0,  soSanPham:24,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"3",  maDongGoi:"S033103",  maLoSX:"L033103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g",  klDongGoi:6.2,  soSanPham:25,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"4",  maDongGoi:"S043103",  maLoSX:"L043103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",   klDongGoi:4.7,  soSanPham:47,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"5",  maDongGoi:"S053103",  maLoSX:"L053103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",   klDongGoi:4.7,  soSanPham:47,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"6",  maDongGoi:"S063103",  maLoSX:"L063103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",   klDongGoi:4.0,  soSanPham:40,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"7",  maDongGoi:"S073103",  maLoSX:"L073103",  thoiGian:"31/03/2026", thanhPham:"Bạch trà",  loaiBaoBi:"tui-kraft-50g",   klDongGoi:1.65, soSanPham:33,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"Tôm trắng đặc sản" },
  { id:"8",  maDongGoi:"S083103",  maLoSX:"L083103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"tui-kraft-50g",   klDongGoi:1.95, soSanPham:39,  trangThai:"da-xuat-kho",   nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"9",  maDongGoi:"S09104",   maLoSX:"L09104",   thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDongGoi:5.8,  soSanPham:58,  trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"10", maDongGoi:"S010104",  maLoSX:"L010104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDongGoi:7.4,  soSanPham:74,  trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"11", maDongGoi:"S011104",  maLoSX:"L011104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",    klDongGoi:13.0, soSanPham:13,  trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", ghiChu:"Xuất bulk cho NPP" },
  { id:"12", maDongGoi:"S012104",  maLoSX:"L012104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",    klDongGoi:10.5, soSanPham:11,  trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"13", maDongGoi:"S013104",  maLoSX:"L013104",  thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-qua-tang",    klDongGoi:5.5,  soSanPham:28,  trangThai:"dang-dong-goi", nguoiThucHien:"HTX Hồng Hà", ghiChu:"Đơn Lotte Mart" },
  { id:"14", maDongGoi:"S014104",  maLoSX:"L014104",  thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDongGoi:6.0,  soSanPham:60,  trangThai:"cho-dong-goi",  nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
  { id:"15", maDongGoi:"S015104",  maLoSX:"L015104",  thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDongGoi:2.7,  soSanPham:27,  trangThai:"cho-dong-goi",  nguoiThucHien:"HTX Hồng Hà", ghiChu:"" },
];

let _nextId = 300;
const genId = () => String(++_nextId);

interface DGForm {
  maDongGoi: string; maLoSX: string; thoiGian: string; thanhPham: string;
  loaiBaoBi: string; klDongGoi: string; trangThai: TrangThai;
  nguoiThucHien: string; ghiChu: string;
}
const emptyForm = (): DGForm => ({
  maDongGoi: "", maLoSX: "", thoiGian: new Date().toISOString().slice(0, 10),
  thanhPham: "Chè xanh", loaiBaoBi: "hop-giay-100g", klDongGoi: "",
  trangThai: "cho-dong-goi", nguoiThucHien: "HTX Hồng Hà", ghiChu: "",
});

export default function PackagingPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrangThai | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("thoiGian");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [dgList, setDgList] = useState<LoDongGoi[]>(initData);
  const [selected, setSelected] = useState<LoDongGoi | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: LoDongGoi | null }>({ open: false, editing: null });
  const [form, setForm] = useState<DGForm>(emptyForm());

  const parseDateVN = (s: string) => { const [d, m, y] = s.split("/"); return `${y}-${m}-${d}`; };
  const parseDateForm = (s: string) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };

  const openAdd = () => { setForm(emptyForm()); setModal({ open: true, editing: null }); };
  const openEdit = (lo: LoDongGoi) => {
    const [d, m, y] = lo.thoiGian.split("/");
    setForm({ maDongGoi: lo.maDongGoi, maLoSX: lo.maLoSX, thoiGian: `${y}-${m}-${d}`, thanhPham: lo.thanhPham, loaiBaoBi: lo.loaiBaoBi, klDongGoi: String(lo.klDongGoi), trangThai: lo.trangThai, nguoiThucHien: lo.nguoiThucHien, ghiChu: lo.ghiChu });
    setModal({ open: true, editing: lo });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const calcSoSP = (kl: number, bb: string) => {
    const opt = BAO_BI_OPTIONS.find(o => o.value === bb);
    return opt && opt.kgPerUnit > 0 ? Math.floor(kl / opt.kgPerUnit) : 0;
  };

  const saveDG = () => {
    const kl = parseFloat(form.klDongGoi) || 0;
    if (!form.maDongGoi.trim()) return;
    const sp = calcSoSP(kl, form.loaiBaoBi);
    if (modal.editing) {
      setDgList(prev => prev.map(lo => lo.id !== modal.editing!.id ? lo : { ...lo, maDongGoi: form.maDongGoi, maLoSX: form.maLoSX, thoiGian: parseDateForm(form.thoiGian), thanhPham: form.thanhPham, loaiBaoBi: form.loaiBaoBi, klDongGoi: kl, soSanPham: sp, trangThai: form.trangThai, nguoiThucHien: form.nguoiThucHien, ghiChu: form.ghiChu }));
      if (selected?.id === modal.editing.id) setSelected(prev => prev ? { ...prev, maDongGoi: form.maDongGoi, maLoSX: form.maLoSX, thoiGian: parseDateForm(form.thoiGian), thanhPham: form.thanhPham, loaiBaoBi: form.loaiBaoBi, klDongGoi: kl, soSanPham: sp, trangThai: form.trangThai, nguoiThucHien: form.nguoiThucHien, ghiChu: form.ghiChu } : null);
    } else {
      setDgList(prev => [{ id: genId(), maDongGoi: form.maDongGoi, maLoSX: form.maLoSX, thoiGian: parseDateForm(form.thoiGian), thanhPham: form.thanhPham, loaiBaoBi: form.loaiBaoBi, klDongGoi: kl, soSanPham: sp, trangThai: form.trangThai, nguoiThucHien: form.nguoiThucHien, ghiChu: form.ghiChu }, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa lô đóng gói này?")) return;
    setDgList(prev => prev.filter(lo => lo.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = useMemo(() => {
    let data = dgList;
    if (search) { const q = search.toLowerCase(); data = data.filter(r => r.maDongGoi.toLowerCase().includes(q) || r.maLoSX.toLowerCase().includes(q) || r.thanhPham.toLowerCase().includes(q)); }
    if (productFilter) data = data.filter(r => r.thanhPham === productFilter);
    if (statusFilter) data = data.filter(r => r.trangThai === statusFilter);
    if (dateFrom) data = data.filter(r => parseDateVN(r.thoiGian) >= dateFrom);
    if (dateTo) data = data.filter(r => parseDateVN(r.thoiGian) <= dateTo);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [dgList, search, productFilter, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const totalKL = dgList.reduce((s, r) => s + r.klDongGoi, 0);
  const totalSP = dgList.reduce((s, r) => s + r.soSanPham, 0);
  const dongGoiCount = dgList.filter(r => r.trangThai === "dang-dong-goi").length;
  const xuatKhoCount = dgList.filter(r => r.trangThai === "da-xuat-kho").length;

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Đóng gói</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Lô đóng gói & Xuất kho thành phẩm</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"><Printer className="w-3.5 h-3.5" /> In</button>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"><Plus className="w-4 h-4" /> Thêm lô</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Box,          label: "Tổng lô ĐG",   value: `${dgList.length} lô`,              sub: "đã tạo",              color: "text-violet-600 bg-violet-50" },
          { icon: Package,      label: "KL đóng gói",   value: `${totalKL.toFixed(1)} kg`,          sub: "thành phẩm",          color: "text-blue-600 bg-blue-50" },
          { icon: Leaf,         label: "Sản phẩm",      value: `${totalSP.toLocaleString()} sp`,    sub: "các loại bao bì",     color: "text-emerald-600 bg-emerald-50" },
          { icon: Truck,        label: "Đã xuất kho",   value: `${xuatKhoCount} lô`,               sub: `${dongGoiCount} lô đang ĐG`, color: "text-amber-600 bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-base font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đóng gói, lô SX..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả loại</option>
            {["Chè xanh", "Hồng trà", "Bạch trà"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TrangThai | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(TRANG_THAI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background" />
          <span className="text-muted-foreground text-sm">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background" />
          <button onClick={() => { setSearch(""); setProductFilter(""); setStatusFilter(""); setDateFrom(""); setDateTo(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"><Filter className="w-3.5 h-3.5" /> Lọc</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "maDongGoi", label: "Mã ĐG" },
                  { key: "maLoSX",    label: "Lô SX" },
                  { key: "thoiGian",  label: "Ngày" },
                  { key: "thanhPham", label: "Loại chè" },
                  { key: "loaiBaoBi", label: "Bao bì" },
                  { key: "klDongGoi", label: "KL (kg)" },
                  { key: "soSanPham", label: "Số SP" },
                  { key: "trangThai", label: "Trạng thái" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const tc = TRANG_THAI[row.trangThai];
                const TcIcon = tc.icon;
                const bbLabel = BAO_BI_OPTIONS.find(o => o.value === row.loaiBaoBi)?.label ?? row.loaiBaoBi;
                return (
                  <tr key={row.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(row)}>
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-primary">{row.maDongGoi}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{row.maLoSX}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{row.thoiGian}</td>
                    <td className="py-2.5 px-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.thanhPham] ?? "bg-gray-100 text-gray-600"}`}>{row.thanhPham}</span></td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{bbLabel}</td>
                    <td className="py-2.5 px-3 font-semibold">{row.klDongGoi.toFixed(2)} kg</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">{row.soSanPham.toLocaleString()} sp</td>
                    <td className="py-2.5 px-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}><TcIcon className="w-3 h-3" /> {tc.label}</span></td>
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setSelected(row)} title="Xem" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(row)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(row.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có lô đóng gói nào</div>}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {dgList.length} lô</p>
          <p className="text-xs font-semibold text-foreground">KL: {filtered.reduce((s, r) => s + r.klDongGoi, 0).toFixed(1)} kg · {filtered.reduce((s, r) => s + r.soSanPham, 0).toLocaleString()} sản phẩm</p>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selected.maDongGoi}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Lô SX: {selected.maLoSX} · {selected.thoiGian}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${productColor[selected.thanhPham] ?? "bg-gray-100 text-gray-600"}`}>{selected.thanhPham}</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${TRANG_THAI[selected.trangThai].color}`}>
                  {(() => { const I = TRANG_THAI[selected.trangThai].icon; return <I className="w-3 h-3" />; })()}
                  {TRANG_THAI[selected.trangThai].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "KL đóng gói", value: `${selected.klDongGoi.toFixed(2)} kg`,           color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "Số sản phẩm", value: `${selected.soSanPham.toLocaleString()} sp`,      color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map((m, i) => (
                  <div key={i} className={`border rounded-xl p-3 ${m.color}`}>
                    <p className="text-xs font-semibold opacity-70">{m.label}</p>
                    <p className="text-xl font-bold mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: "Loại bao bì",       value: BAO_BI_OPTIONS.find(o => o.value === selected.loaiBaoBi)?.label ?? selected.loaiBaoBi },
                  { label: "Người thực hiện",    value: selected.nguoiThucHien },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-sm font-medium text-right">{r.value}</p>
                  </div>
                ))}
              </div>
              {selected.ghiChu && <div className="bg-muted/30 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Ghi chú</p><p className="text-sm italic">{selected.ghiChu}</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border">
              <button onClick={() => { openEdit(selected); setSelected(null); }} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"><Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
              <h2 className="text-base font-semibold">{modal.editing ? "Sửa lô đóng gói" : "Thêm lô đóng gói"}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mã đóng gói <span className="text-red-500">*</span></label>
                  <input value={form.maDongGoi} onChange={e => setForm(f => ({ ...f, maDongGoi: e.target.value }))} placeholder="vd: S019104" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lô SX</label>
                  <input value={form.maLoSX} onChange={e => setForm(f => ({ ...f, maLoSX: e.target.value }))} placeholder="vd: L019104" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày đóng gói</label>
                  <input type="date" value={form.thoiGian} onChange={e => setForm(f => ({ ...f, thoiGian: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại thành phẩm</label>
                  <select value={form.thanhPham} onChange={e => setForm(f => ({ ...f, thanhPham: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Chè xanh", "Hồng trà", "Bạch trà"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại bao bì</label>
                <select value={form.loaiBaoBi} onChange={e => setForm(f => ({ ...f, loaiBaoBi: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {BAO_BI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Khối lượng đóng gói (kg)</label>
                <input type="number" value={form.klDongGoi} onChange={e => setForm(f => ({ ...f, klDongGoi: e.target.value }))} placeholder="kg thành phẩm" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              {form.klDongGoi && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-blue-700">Số sản phẩm ước tính</span>
                  <span className="font-bold text-blue-700">{calcSoSP(parseFloat(form.klDongGoi) || 0, form.loaiBaoBi).toLocaleString()} sản phẩm</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Trạng thái</label>
                <select value={form.trangThai} onChange={e => setForm(f => ({ ...f, trangThai: e.target.value as TrangThai }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {Object.entries(TRANG_THAI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi chú</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} placeholder="Ghi chú thêm..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
              <button onClick={saveDG} disabled={!form.maDongGoi.trim()} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
