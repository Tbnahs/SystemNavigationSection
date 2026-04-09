import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter, X, Trash2, Eye,
  ChevronUp, ChevronDown, Factory, Package, Leaf,
  Clock, CheckCircle2, Layers, QrCode, TrendingUp,
  FileSpreadsheet, FileText, Printer, ArrowRight,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { TEN_SAN_PHAM, MAU_SAN_PHAM } from "@/constants/products";
import { useERP, LoSX } from "@/contexts/ERPContext";

type TrangThai = "ke-hoach" | "xuat-nvl" | "dang-che-bien" | "hoan-thanh" | "da-nhap-kho";
const TT_CFG: Record<TrangThai, { label: string; color: string; step: number }> = {
  "ke-hoach":     { label: "Kế hoạch",    color: "bg-gray-100 text-gray-600",       step: 1 },
  "xuat-nvl":     { label: "Xuất NVL",    color: "bg-blue-100 text-blue-700",       step: 2 },
  "dang-che-bien":{ label: "Đang SX",     color: "bg-amber-100 text-amber-700",     step: 3 },
  "hoan-thanh":   { label: "Hoàn thành",  color: "bg-violet-100 text-violet-700",   step: 4 },
  "da-nhap-kho":  { label: "Đã nhập kho", color: "bg-emerald-100 text-emerald-700", step: 5 },
};
const NEXT_STATUS: Record<TrangThai, TrangThai | null> = {
  "ke-hoach": "xuat-nvl", "xuat-nvl": "dang-che-bien",
  "dang-che-bien": "hoan-thanh", "hoan-thanh": "da-nhap-kho", "da-nhap-kho": null,
};

const PRODUCT_COLOR = MAU_SAN_PHAM;


const STEPS = ["Kế hoạch","Xuất NVL","Đang SX","Hoàn thành","Nhập kho"];

let _nid = 800;
const genId = () => String(++_nid);

export default function ProductionPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"lenh-sx" | "ke-hoach" | "batch-tp">("lenh-sx");
  const [search, setSearch] = useState("");
  const [ttFilter, setTtFilter] = useState<TrangThai | "">("");
  const [loaiFilter, setLoaiFilter] = useState("");
  const [sortKey, setSortKey] = useState("ngaySX");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const { productionBatches: loList, setProductionBatches: setLoList } = useERP();
  const [selected, setSelected] = useState<LoSX | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [fLoai, setFLoai] = useState("Chè xanh"); const [fNgay, setFNgay] = useState(new Date().toISOString().slice(0,10));
  const [fKLNVL, setFKLNVL] = useState(""); const [fNote, setFNote] = useState("");
  const [fNguoiTH, setFNguoiTH] = useState("HTX Hồng Hà");
  const [fDiaDiem, setFDiaDiem] = useState("Nhà máy Bằng Phúc");

  const handleSort = (k: string) => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("desc"); } };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleAdvance = (id: string) => {
    setLoList(prev => prev.map(lo => {
      if (lo.id !== id) return lo;
      const next = NEXT_STATUS[lo.trangThai];
      if (!next) return lo;
      const isNhapKho = next === "da-nhap-kho";
      const klTP = isNhapKho ? parseFloat((lo.klNVL * (lo.loaiChe === "Bạch trà" ? 0.178 : 0.239)).toFixed(1)) : lo.klTP;
      const tyLe = isNhapKho ? parseFloat(((klTP/lo.klNVL)*100).toFixed(1)) : lo.tyLeKhoHao;
      const btp = isNhapKho ? lo.maLo : lo.batchTP;
      return { ...lo, trangThai: next, klTP, tyLeKhoHao: tyLe, batchTP: btp };
    }));
  };
  const handleCreate = () => {
    if (!fKLNVL) return;
    const [y,m,d] = fNgay.split("-");
    const id = genId();
    const maLo = `L0${id}${d}${m.slice(-1)}`;
    const newLo: LoSX = { id, maLo, ngaySX: `${d}/${m}/${y}`, loaiChe: fLoai, soHo: 0, klNVL: parseFloat(fKLNVL)||0, klTP: 0, tyLeKhoHao: 0, trangThai: "ke-hoach", cacMaBatch: [], batchTP: "", nguoiThucHien: fNguoiTH, diaDiemThucHien: fDiaDiem, ghiChu: fNote };
    setLoList(prev => [newLo, ...prev]);
    setShowCreate(false); setFKLNVL(""); setFNote(""); setFNguoiTH("HTX Hồng Hà"); setFDiaDiem("Nhà máy Bằng Phúc");
  };
  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa lệnh sản xuất?")) return;
    setLoList(prev => prev.filter(l => l.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleExportExcel = () => exportToExcel(
    [
      { header: "Mã lô", key: "maLo", width: 16 },
      { header: "Ngày SX", key: "ngaySX", width: 14 },
      { header: "Loại chè", key: "loaiChe", width: 16 },
      { header: "Số hộ", key: "soHo", width: 10 },
      { header: "KL NVL (kg)", key: "klNVL", width: 14 },
      { header: "KL TP (kg)", key: "klTP", width: 14 },
      { header: "Tỷ lệ KH (%)", key: "tyLeKhoHao", width: 14 },
      { header: "Trạng thái", key: "trangThai", width: 16 },
      { header: "Ghi chú", key: "ghiChu", width: 28 },
    ],
    loList as unknown as Record<string, unknown>[],
    "SanXuat_HTXHongHa"
  );

  const handleExportPDF = () => exportToPDF(
    "Danh sách Lệnh Sản xuất",
    `HTX Hồng Hà · ${loList.length} lệnh sản xuất`,
    [
      { header: "Mã lô", key: "maLo", width: 20 },
      { header: "Ngày SX", key: "ngaySX", width: 18 },
      { header: "Loại chè", key: "loaiChe", width: 22 },
      { header: "KL NVL (kg)", key: "klNVL", width: 18 },
      { header: "KL TP (kg)", key: "klTP", width: 18 },
      { header: "Tỷ lệ KH (%)", key: "tyLeKhoHao", width: 18 },
      { header: "Trạng thái", key: "trangThai", width: 22 },
    ],
    loList as unknown as Record<string, unknown>[],
    "SanXuat_HTXHongHa"
  );

  const filtered = useMemo(() => {
    let data = activeTab === "ke-hoach" ? loList.filter(l => l.trangThai === "ke-hoach") : loList;
    if (activeTab === "batch-tp") data = loList.filter(l => l.batchTP);
    if (search) { const q = search.toLowerCase(); data = data.filter(l => l.maLo.toLowerCase().includes(q) || l.loaiChe.toLowerCase().includes(q)); }
    if (ttFilter && activeTab === "lenh-sx") data = data.filter(l => l.trangThai === ttFilter);
    if (loaiFilter) data = data.filter(l => l.loaiChe === loaiFilter);
    return [...data].sort((a,b) => {
      const av = (a as Record<string,unknown>)[sortKey]; const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir==="asc"?av-bv:bv-av;
      return sortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
    });
  }, [loList, activeTab, search, ttFilter, loaiFilter, sortKey, sortDir]);

  const danSX  = loList.filter(l => l.trangThai === "dang-che-bien").length;
  const totalTP = loList.filter(l => l.klTP > 0).reduce((s,l) => s+l.klTP, 0);
  const totalNVL = loList.reduce((s,l) => s+l.klNVL, 0);
  const avgTyLe = (loList.filter(l=>l.tyLeKhoHao>0).reduce((s,l)=>s+l.tyLeKhoHao,0) / loList.filter(l=>l.tyLeKhoHao>0).length).toFixed(1);

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Sản xuất (Chế biến chè)</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Kế hoạch → Lệnh SX → Xuất NVL → Chế biến → Nhập TP</p></div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Lệnh SX mới</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Factory,    label: "Đang chế biến",   value: `${danSX} lô`,         sub:"cần theo dõi",        color:"text-amber-600 bg-amber-50" },
          { icon: Package,    label: "Tổng thành phẩm", value: `${totalTP.toFixed(1)} kg`, sub:"đã nhập kho",     color:"text-emerald-600 bg-emerald-50" },
          { icon: Leaf,       label: "Tổng NVL dùng",   value: `${totalNVL.toFixed(0)} kg`, sub:"nguyên liệu",   color:"text-blue-600 bg-blue-50" },
          { icon: TrendingUp, label: "Tỷ lệ thu hồi",   value: `${avgTyLe}%`,         sub:"trung bình",          color:"text-violet-600 bg-violet-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[
          {key:"lenh-sx",  label:"Lệnh sản xuất",  count:loList.length},
          {key:"ke-hoach", label:"Kế hoạch",         count:loList.filter(l=>l.trangThai==="ke-hoach").length},
          {key:"batch-tp", label:"Batch thành phẩm", count:loList.filter(l=>l.batchTP).length},
        ].map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab===tab.key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}<span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab===tab.key?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Batch TP tab */}
      {activeTab === "batch-tp" ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Layers className="w-5 h-5 text-blue-700 shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-blue-900">Bảng liên kết Batch NVL → Batch Thành phẩm</p>
              <p className="text-xs text-blue-700 mt-0.5">Mỗi dòng thể hiện mapping đầy đủ: RAW batch nguồn gốc → Lô chế biến → FG batch thành phẩm. Đây là xương sống truy xuất nguồn gốc.</p>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {["Batch FG (TP)","Lô SX","Loại chè","Batch NVL (RAW) nguồn gốc","NVL (kg)","TP (kg)","Thu hồi","# Hộ"].map((h,i)=>(
                    <th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map(lo=>(
                    <tr key={lo.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(lo)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">{lo.batchTP}</span></td>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{lo.maLo}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRODUCT_COLOR[lo.loaiChe]??""}`}>{lo.loaiChe}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {lo.cacMaBatch.slice(0,2).map(b=><span key={b} className="font-mono text-xs bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded-md">{b}</span>)}
                          {lo.cacMaBatch.length>2&&<span className="text-xs text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded-md">+{lo.cacMaBatch.length-2} batch</span>}
                          {lo.cacMaBatch.length===0&&<span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{lo.klNVL} kg</td>
                      <td className="py-3 px-4"><span className="font-bold text-emerald-700">{lo.klTP} kg</span></td>
                      <td className="py-3 px-4"><span className="font-semibold text-violet-700">{lo.tyLeKhoHao}%</span></td>
                      <td className="py-3 px-4 text-sm text-center">{lo.soHo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{filtered.length} lô · {filtered.reduce((s,l)=>s+l.cacMaBatch.length,0)} RAW batch nguồn gốc</p>
              <p className="text-xs font-semibold">NVL: {filtered.reduce((s,l)=>s+l.klNVL,0).toFixed(1)} kg → TP: {filtered.reduce((s,l)=>s+l.klTP,0).toFixed(1)} kg</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã lô, loại chè..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            {activeTab==="lenh-sx"&&<select value={ttFilter} onChange={e=>setTtFilter(e.target.value as TrangThai|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả TT</option>{Object.entries(TT_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>}
            <select value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả loại</option>{TEN_SAN_PHAM.map(l=><option key={l} value={l}>{l}</option>)}</select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {[{k:"maLo",l:"Mã lô"},{k:"ngaySX",l:"Ngày SX"},{k:"loaiChe",l:"Loại chè"},{k:"soHo",l:"Số hộ"},{k:"klNVL",l:"NVL (kg)"},{k:"klTP",l:"TP (kg)"},{k:"tyLeKhoHao",l:"Thu hồi"},{k:"trangThai",l:"Trạng thái"}].map(col=>(
                  <th key={col.k} onClick={()=>handleSort(col.k)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.l}<SortIcon col={col.k}/></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase">Thao tác</th>
              </tr></thead>
              <tbody>
                {filtered.map(lo => {
                  const tc = TT_CFG[lo.trangThai]; const nextTT = NEXT_STATUS[lo.trangThai];
                  return (
                    <tr key={lo.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(lo)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{lo.maLo}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{lo.ngaySX}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRODUCT_COLOR[lo.loaiChe]??""}`}>{lo.loaiChe}</span></td>
                      <td className="py-3 px-4 text-sm">{lo.soHo}</td>
                      <td className="py-3 px-4 font-medium text-sm">{lo.klNVL}</td>
                      <td className="py-3 px-4"><span className="font-bold text-emerald-700">{lo.klTP>0?lo.klTP:"—"}</span></td>
                      <td className="py-3 px-4 text-sm">{lo.tyLeKhoHao>0?`${lo.tyLeKhoHao}%`:"—"}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}>{tc.label}</span></td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          {nextTT&&<button onClick={()=>handleAdvance(lo.id)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary" title={`Chuyển sang ${TT_CFG[nextTT].label}`}><ArrowRight className="w-3.5 h-3.5"/></button>}
                          <button onClick={()=>setSelected(lo)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Eye className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>handleDelete(lo.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filtered.length} lô</p>
            <p className="text-xs font-semibold">NVL: {filtered.reduce((s,l)=>s+l.klNVL,0).toFixed(1)} kg · TP: {filtered.filter(l=>l.klTP>0).reduce((s,l)=>s+l.klTP,0).toFixed(1)} kg</p>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maLo}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.ngaySX} · {selected.loaiChe}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              {/* Stepper */}
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {STEPS.map((step,i)=>{
                  const currentStep = TT_CFG[selected.trangThai].step;
                  const done = i+1 < currentStep; const active = i+1 === currentStep;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`flex flex-col items-center ${done||active?"opacity-100":"opacity-30"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done?"bg-emerald-500 text-white":active?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{done?"✓":i+1}</div>
                        <p className="text-xs mt-1 whitespace-nowrap">{step}</p>
                      </div>
                      {i<STEPS.length-1&&<ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mx-0.5 mb-4"/>}
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/20 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">NVL đầu vào</p><p className="text-xl font-bold">{selected.klNVL} kg</p></div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Thành phẩm</p><p className={`text-xl font-bold ${selected.klTP>0?"text-emerald-700":"text-muted-foreground"}`}>{selected.klTP>0?selected.klTP:"—"} {selected.klTP>0?"kg":""}</p></div>
                {selected.tyLeKhoHao>0&&<div className="col-span-2 bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Tỷ lệ thu hồi</p><p className="text-xl font-bold text-blue-700">{selected.tyLeKhoHao}%</p></div>}
              </div>
              {selected.cacMaBatch.length>0&&(
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Batch NVL nguồn gốc</p>
                  <div className="flex flex-wrap gap-1.5">{selected.cacMaBatch.map(b=><span key={b} className="font-mono text-xs bg-white border border-border px-2 py-0.5 rounded-md">{b}</span>)}</div>
                </div>
              )}
              {selected.batchTP&&<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><p className="text-xs text-muted-foreground">Batch thành phẩm</p><p className="font-mono font-bold text-emerald-700 mt-0.5">{selected.batchTP}</p></div>}
              {(selected.nguoiThucHien||selected.diaDiemThucHien)&&(
                <div className="bg-muted/20 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thực hiện</p>
                  {selected.nguoiThucHien&&<div className="flex justify-between text-sm"><span className="text-muted-foreground">Người thực hiện</span><span className="font-medium">{selected.nguoiThucHien}</span></div>}
                  {selected.diaDiemThucHien&&<div className="flex justify-between text-sm"><span className="text-muted-foreground">Địa điểm SX</span><span className="font-medium">{selected.diaDiemThucHien}</span></div>}
                </div>
              )}
              {selected.ghiChu&&<div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Ghi chú</p><p className="text-sm italic mt-0.5">{selected.ghiChu}</p></div>}
              {NEXT_STATUS[selected.trangThai]&&(
                <button onClick={()=>{handleAdvance(selected.id);setSelected(prev=>prev?{...loList.find(l=>l.id===prev.id)!}:null);}} className="w-full py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"><ArrowRight className="w-4 h-4"/> Chuyển: {TT_CFG[NEXT_STATUS[selected.trangThai]!].label}</button>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
              <button onClick={()=>handleDelete(selected.id)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/> Xóa lệnh SX</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"><div className="flex items-center gap-2"><Factory className="w-4 h-4 text-primary"/><span className="font-semibold text-sm">Tạo lệnh sản xuất mới</span></div><button onClick={()=>setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button></div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Loại chè</label><select value={fLoai} onChange={e=>setFLoai(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white">{TEN_SAN_PHAM.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
              <div><label className="block text-xs font-semibold mb-1.5">Ngày SX</label><input type="date" value={fNgay} onChange={e=>setFNgay(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
              <div><label className="block text-xs font-semibold mb-1.5">KL nguyên liệu (kg) <span className="text-red-500">*</span></label><input type="number" value={fKLNVL} onChange={e=>setFKLNVL(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
              {fKLNVL&&<div className="bg-muted/20 rounded-xl p-3 text-xs text-muted-foreground"><p className="font-semibold mb-1">Dự kiến thành phẩm:</p><p>{fLoai==="Bạch trà"?`~ ${(parseFloat(fKLNVL)*0.178).toFixed(1)} kg (17.8%)`:`~ ${(parseFloat(fKLNVL)*0.239).toFixed(1)} kg (23.9%)`}</p></div>}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">Người thực hiện</label><input value={fNguoiTH} onChange={e=>setFNguoiTH(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/></div>
                <div><label className="block text-xs font-semibold mb-1.5">Địa điểm SX</label><input value={fDiaDiem} onChange={e=>setFDiaDiem(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Ghi chú</label><textarea value={fNote} onChange={e=>setFNote(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none"/></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fKLNVL} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Tạo lệnh SX</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
