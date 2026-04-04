import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter,
  ChevronUp, ChevronDown, Factory, Package,
  Leaf, FlaskConical, X, FileSpreadsheet, FileText, Printer,
  Eye, Edit2, Trash2, CheckCircle2, Clock, Layers,
} from "lucide-react";

const productColor: Record<string, string> = {
  "Hồng trà":  "bg-rose-100 text-rose-700",
  "Bạch trà":  "bg-sky-100 text-sky-700",
  "Chè xanh":  "bg-emerald-100 text-emerald-700",
};

type TrangThai = "dang-che-bien" | "hoan-thanh" | "da-nhap-kho";

const TRANG_THAI: Record<TrangThai, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "dang-che-bien": { label: "Đang chế biến", color: "bg-amber-100 text-amber-700",    icon: Clock },
  "hoan-thanh":    { label: "Hoàn thành",     color: "bg-blue-100 text-blue-700",      icon: CheckCircle2 },
  "da-nhap-kho":   { label: "Đã nhập kho",    color: "bg-emerald-100 text-emerald-700", icon: Package },
};

interface LoSanXuat {
  id: string;
  maLoSX: string;
  ngaySX: string;
  loaiChe: string;
  soMe: number;
  klNguyenLieu: number;
  klThanhPham: number;
  tyLeKhoHao: number;
  trangThai: TrangThai;
  nguoiThucHien: string;
  cacMaME: string[];
  ghiChu: string;
}

const initLo: LoSanXuat[] = [
  { id:"1",  maLoSX:"L013003",  ngaySX:"30/03/2026", loaiChe:"Hồng trà",  soMe:2,  klNguyenLieu:25.5,  klThanhPham:5.6,  tyLeKhoHao:22.0, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH0043003","NB0023003"],                          ghiChu:"" },
  { id:"2",  maLoSX:"L023103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soMe:3,  klNguyenLieu:27.5,  klThanhPham:6.1,  tyLeKhoHao:22.2, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH0013103","NH0023103","NH0083103"],               ghiChu:"" },
  { id:"3",  maLoSX:"L033103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soMe:2,  klNguyenLieu:28.5,  klThanhPham:6.3,  tyLeKhoHao:22.1, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH0093103","NH0043103"],                          ghiChu:"" },
  { id:"4",  maLoSX:"L043103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soMe:2,  klNguyenLieu:22.0,  klThanhPham:4.8,  tyLeKhoHao:21.8, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH0063103","NH0073103"],                          ghiChu:"" },
  { id:"5",  maLoSX:"L053103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soMe:1,  klNguyenLieu:22.0,  klThanhPham:4.8,  tyLeKhoHao:21.8, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH0073103"],                                      ghiChu:"" },
  { id:"6",  maLoSX:"L063103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soMe:2,  klNguyenLieu:18.5,  klThanhPham:4.1,  tyLeKhoHao:22.2, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB0093103","NB0103103"],                          ghiChu:"" },
  { id:"7",  maLoSX:"L073103",  ngaySX:"31/03/2026", loaiChe:"Bạch trà",  soMe:4,  klNguyenLieu:9.5,   klThanhPham:1.7,  tyLeKhoHao:17.9, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB0103103","NB0013103","NB0023103","NB0073103"], ghiChu:"Tôm trắng đặc sản" },
  { id:"8",  maLoSX:"L083103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soMe:1,  klNguyenLieu:9.3,   klThanhPham:2.0,  tyLeKhoHao:21.5, trangThai:"da-nhap-kho",   nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH0103103"],                                      ghiChu:"" },
  { id:"9",  maLoSX:"L09104",   ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:2,  klNguyenLieu:24.7,  klThanhPham:5.9,  tyLeKhoHao:23.9, trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH001104","NH004104"],                            ghiChu:"" },
  { id:"10", maLoSX:"L010104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:3,  klNguyenLieu:31.5,  klThanhPham:7.5,  tyLeKhoHao:23.8, trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB011104","NB012104","NB010104"],                  ghiChu:"" },
  { id:"11", maLoSX:"L011104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:2,  klNguyenLieu:55.2,  klThanhPham:13.2, tyLeKhoHao:23.9, trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB013104","NB002104"],                            ghiChu:"" },
  { id:"12", maLoSX:"L012104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:2,  klNguyenLieu:45.0,  klThanhPham:10.8, tyLeKhoHao:24.0, trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB004104","NB001104"],                            ghiChu:"" },
  { id:"13", maLoSX:"L013104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:1,  klNguyenLieu:23.8,  klThanhPham:5.7,  tyLeKhoHao:24.0, trangThai:"hoan-thanh",    nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB006104"],                                       ghiChu:"" },
  { id:"14", maLoSX:"L014104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:3,  klNguyenLieu:26.4,  klThanhPham:6.3,  tyLeKhoHao:23.9, trangThai:"dang-che-bien", nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH007104","NH003104","NH010104"],                  ghiChu:"" },
  { id:"15", maLoSX:"L015104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:1,  klNguyenLieu:11.7,  klThanhPham:2.8,  tyLeKhoHao:23.9, trangThai:"dang-che-bien", nguoiThucHien:"HTX Hồng Hà", cacMaME:["BC003104"],                                       ghiChu:"" },
  { id:"16", maLoSX:"L016104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:2,  klNguyenLieu:25.5,  klThanhPham:6.1,  tyLeKhoHao:23.9, trangThai:"dang-che-bien", nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH006104","NH008104"],                            ghiChu:"" },
  { id:"17", maLoSX:"L017104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:1,  klNguyenLieu:34.5,  klThanhPham:8.3,  tyLeKhoHao:24.1, trangThai:"dang-che-bien", nguoiThucHien:"HTX Hồng Hà", cacMaME:["NB009104"],                                       ghiChu:"" },
  { id:"18", maLoSX:"L018104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soMe:2,  klNguyenLieu:31.5,  klThanhPham:7.6,  tyLeKhoHao:24.1, trangThai:"dang-che-bien", nguoiThucHien:"HTX Hồng Hà", cacMaME:["NH009104","NH002104"],                            ghiChu:"" },
];

let _nextId = 200;
const genId = () => String(++_nextId);

function fmt(v: number, dec = 1) { return v.toFixed(dec); }

interface LoForm {
  maLoSX: string; ngaySX: string; loaiChe: string;
  soMe: string; klNguyenLieu: string; klThanhPham: string;
  trangThai: TrangThai; nguoiThucHien: string; ghiChu: string;
}

const emptyForm = (): LoForm => ({
  maLoSX: "", ngaySX: new Date().toISOString().slice(0, 10),
  loaiChe: "Chè xanh", soMe: "", klNguyenLieu: "", klThanhPham: "",
  trangThai: "dang-che-bien", nguoiThucHien: "HTX Hồng Hà", ghiChu: "",
});

export default function ProductionPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrangThai | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<string>("ngaySX");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [loList, setLoList] = useState<LoSanXuat[]>(initLo);
  const [selected, setSelected] = useState<LoSanXuat | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: LoSanXuat | null }>({ open: false, editing: null });
  const [form, setForm] = useState<LoForm>(emptyForm());

  const openAdd = () => { setForm(emptyForm()); setModal({ open: true, editing: null }); };
  const openEdit = (lo: LoSanXuat) => {
    const [d, m, y] = lo.ngaySX.split("/");
    setForm({
      maLoSX: lo.maLoSX, ngaySX: `${y}-${m}-${d}`,
      loaiChe: lo.loaiChe, soMe: String(lo.soMe),
      klNguyenLieu: String(lo.klNguyenLieu), klThanhPham: String(lo.klThanhPham),
      trangThai: lo.trangThai, nguoiThucHien: lo.nguoiThucHien, ghiChu: lo.ghiChu,
    });
    setModal({ open: true, editing: lo });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const parseDateForm = (s: string) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };

  const saveLo = () => {
    const klNL = parseFloat(form.klNguyenLieu) || 0;
    const klTP = parseFloat(form.klThanhPham) || 0;
    const tyLe = klNL > 0 ? Math.round((klTP / klNL) * 1000) / 10 : 0;
    if (!form.maLoSX.trim()) return;
    if (modal.editing) {
      setLoList(prev => prev.map(lo => lo.id !== modal.editing!.id ? lo : {
        ...lo, maLoSX: form.maLoSX, ngaySX: parseDateForm(form.ngaySX),
        loaiChe: form.loaiChe, soMe: parseInt(form.soMe) || 0,
        klNguyenLieu: klNL, klThanhPham: klTP, tyLeKhoHao: tyLe,
        trangThai: form.trangThai, nguoiThucHien: form.nguoiThucHien, ghiChu: form.ghiChu,
      }));
      if (selected?.id === modal.editing.id) setSelected(prev => prev ? { ...prev, maLoSX: form.maLoSX, ngaySX: parseDateForm(form.ngaySX), loaiChe: form.loaiChe, soMe: parseInt(form.soMe) || 0, klNguyenLieu: klNL, klThanhPham: klTP, tyLeKhoHao: tyLe, trangThai: form.trangThai, nguoiThucHien: form.nguoiThucHien, ghiChu: form.ghiChu } : null);
    } else {
      const newLo: LoSanXuat = { id: genId(), maLoSX: form.maLoSX, ngaySX: parseDateForm(form.ngaySX), loaiChe: form.loaiChe, soMe: parseInt(form.soMe) || 0, klNguyenLieu: klNL, klThanhPham: klTP, tyLeKhoHao: tyLe, trangThai: form.trangThai, nguoiThucHien: form.nguoiThucHien, cacMaME: [], ghiChu: form.ghiChu };
      setLoList(prev => [newLo, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa lô sản xuất này?")) return;
    setLoList(prev => prev.filter(lo => lo.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const parseDateVN = (s: string) => { const [d, m, y] = s.split("/"); return `${y}-${m}-${d}`; };

  const filtered = useMemo(() => {
    let data = loList;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => r.maLoSX.toLowerCase().includes(q) || r.loaiChe.toLowerCase().includes(q) || r.nguoiThucHien.toLowerCase().includes(q));
    }
    if (productFilter) data = data.filter(r => r.loaiChe === productFilter);
    if (statusFilter) data = data.filter(r => r.trangThai === statusFilter);
    if (dateFrom) data = data.filter(r => parseDateVN(r.ngaySX) >= dateFrom);
    if (dateTo) data = data.filter(r => parseDateVN(r.ngaySX) <= dateTo);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [loList, search, productFilter, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const totalLo    = loList.length;
  const totalNL    = loList.reduce((s, r) => s + r.klNguyenLieu, 0);
  const totalTP    = loList.reduce((s, r) => s + r.klThanhPham, 0);
  const dangCBCount = loList.filter(r => r.trangThai === "dang-che-bien").length;
  const avgTyLe    = totalNL > 0 ? (totalTP / totalNL * 100) : 0;

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Sản xuất</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Lô chế biến & Tỷ lệ thu hồi</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <Printer className="w-3.5 h-3.5" /> In
            </button>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" /> Thêm lô SX
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Factory,       label: "Tổng lô SX",     value: `${totalLo} lô`,            sub: "đã tạo",            color: "text-violet-600 bg-violet-50" },
          { icon: Leaf,          label: "Tổng NL đầu vào", value: `${fmt(totalNL, 1)} kg`,    sub: "chè búp tươi",      color: "text-emerald-600 bg-emerald-50" },
          { icon: Package,       label: "Tổng thành phẩm", value: `${fmt(totalTP, 1)} kg`,    sub: "chè khô sau chế biến", color: "text-blue-600 bg-blue-50" },
          { icon: FlaskConical,  label: "Tỷ lệ thu hồi",   value: `${fmt(avgTyLe, 1)} %`,     sub: `${dangCBCount} lô đang chế biến`, color: "text-amber-600 bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-base font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã lô, loại chè..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả loại</option>
            {["Chè xanh", "Hồng trà", "Bạch trà"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TrangThai | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(TRANG_THAI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <span className="text-muted-foreground text-sm">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={() => { setSearch(""); setProductFilter(""); setStatusFilter(""); setDateFrom(""); setDateTo(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "maLoSX",        label: "Mã lô SX" },
                  { key: "ngaySX",        label: "Ngày SX" },
                  { key: "loaiChe",       label: "Loại chè" },
                  { key: "soMe",          label: "Số mẻ" },
                  { key: "klNguyenLieu",  label: "NL vào (kg)" },
                  { key: "klThanhPham",   label: "Thành phẩm (kg)" },
                  { key: "tyLeKhoHao",    label: "Tỷ lệ thu hồi" },
                  { key: "trangThai",     label: "Trạng thái" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lo => {
                const tc = TRANG_THAI[lo.trangThai];
                const TcIcon = tc.icon;
                return (
                  <tr key={lo.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(lo)}>
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-primary">{lo.maLoSX}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{lo.ngaySX}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[lo.loaiChe] ?? "bg-gray-100 text-gray-600"}`}>{lo.loaiChe}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold"><Layers className="w-3 h-3 text-muted-foreground" />{lo.soMe}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{fmt(lo.klNguyenLieu)} kg</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">{fmt(lo.klThanhPham)} kg</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[48px]">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(lo.tyLeKhoHao / 30 * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{fmt(lo.tyLeKhoHao)}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}>
                        <TcIcon className="w-3 h-3" /> {tc.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setSelected(lo)} title="Xem" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(lo)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(lo.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có lô sản xuất nào</div>}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {loList.length} lô</p>
          <p className="text-xs font-semibold text-foreground">
            NL: {fmt(filtered.reduce((s, r) => s + r.klNguyenLieu, 0), 1)} kg → TP: {fmt(filtered.reduce((s, r) => s + r.klThanhPham, 0), 1)} kg
          </p>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selected.maLoSX}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.ngaySX} · {selected.nguoiThucHien}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${productColor[selected.loaiChe] ?? "bg-gray-100 text-gray-600"}`}>{selected.loaiChe}</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${TRANG_THAI[selected.trangThai].color}`}>
                  {(() => { const I = TRANG_THAI[selected.trangThai].icon; return <I className="w-3 h-3" />; })()}
                  {TRANG_THAI[selected.trangThai].label}
                </span>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "NL đầu vào", value: `${fmt(selected.klNguyenLieu)} kg`, sub: "chè búp tươi", color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: "Thành phẩm",  value: `${fmt(selected.klThanhPham)} kg`, sub: "chè khô",       color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map((m, i) => (
                  <div key={i} className={`border rounded-xl p-3 ${m.color}`}>
                    <p className="text-xs font-semibold opacity-70">{m.label}</p>
                    <p className="text-xl font-bold mt-0.5">{m.value}</p>
                    <p className="text-xs opacity-60">{m.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Tỷ lệ thu hồi</p>
                  <span className="text-lg font-bold text-primary">{fmt(selected.tyLeKhoHao)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(selected.tyLeKhoHao / 30 * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Chuẩn tham chiếu: 22–24% đối với chè xanh/hồng trà</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Số mẻ nguyên liệu", value: `${selected.soMe} mẻ` },
                  { label: "Người thực hiện",   value: selected.nguoiThucHien },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-sm font-medium">{r.value}</p>
                  </div>
                ))}
              </div>

              {selected.cacMaME.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Mã mẻ nguyên liệu</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.cacMaME.map(m => (
                      <span key={m} className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded-md">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.ghiChu && (
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm italic">{selected.ghiChu}</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2">
              <button onClick={() => { openEdit(selected); setSelected(null); }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold">{modal.editing ? "Sửa lô sản xuất" : "Thêm lô sản xuất"}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mã lô SX <span className="text-red-500">*</span></label>
                  <input value={form.maLoSX} onChange={e => setForm(f => ({ ...f, maLoSX: e.target.value }))} placeholder="vd: L019104" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày sản xuất</label>
                  <input type="date" value={form.ngaySX} onChange={e => setForm(f => ({ ...f, ngaySX: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại thành phẩm</label>
                  <select value={form.loaiChe} onChange={e => setForm(f => ({ ...f, loaiChe: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {["Chè xanh", "Hồng trà", "Bạch trà"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Số mẻ nguyên liệu</label>
                  <input type="number" value={form.soMe} onChange={e => setForm(f => ({ ...f, soMe: e.target.value }))} placeholder="0" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">KL nguyên liệu (kg)</label>
                  <input type="number" value={form.klNguyenLieu} onChange={e => setForm(f => ({ ...f, klNguyenLieu: e.target.value }))} placeholder="kg chè tươi" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">KL thành phẩm (kg)</label>
                  <input type="number" value={form.klThanhPham} onChange={e => setForm(f => ({ ...f, klThanhPham: e.target.value }))} placeholder="kg chè khô" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              {form.klNguyenLieu && form.klThanhPham && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-blue-700">Tỷ lệ thu hồi ước tính</span>
                  <span className="font-bold text-blue-700">{fmt(parseFloat(form.klThanhPham) / parseFloat(form.klNguyenLieu) * 100)}%</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Trạng thái</label>
                <select value={form.trangThai} onChange={e => setForm(f => ({ ...f, trangThai: e.target.value as TrangThai }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {Object.entries(TRANG_THAI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Người thực hiện</label>
                <input value={form.nguoiThucHien} onChange={e => setForm(f => ({ ...f, nguoiThucHien: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi chú</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} placeholder="Ghi chú thêm..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
              <button onClick={saveLo} disabled={!form.maLoSX.trim()} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
