import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter, X, Trash2, Eye,
  ChevronUp, ChevronDown, Box, Package, Leaf,
  Clock, CheckCircle2, Truck, FileSpreadsheet, FileText,
  QrCode, ArrowRight, Layers,
} from "lucide-react";

const PRODUCT_COLOR: Record<string, string> = {
  "Hồng trà": "bg-rose-100 text-rose-700",
  "Bạch trà": "bg-sky-100 text-sky-700",
  "Chè xanh": "bg-emerald-100 text-emerald-700",
  "Phổ nhĩ":  "bg-amber-100 text-amber-700",
};
const BAO_BI_OPTIONS = [
  { value: "hop-giay-100g",   label: "Hộp giấy 100g",         kgPerUnit: 0.1  },
  { value: "hop-thiec-250g",  label: "Hộp thiếc 250g",         kgPerUnit: 0.25 },
  { value: "tui-kraft-50g",   label: "Túi kraft 50g",           kgPerUnit: 0.05 },
  { value: "tui-bulk-1kg",    label: "Túi hút chân không 1kg", kgPerUnit: 1.0  },
  { value: "hop-qua-tang",    label: "Hộp quà tặng 200g",      kgPerUnit: 0.2  },
];
type TrangThai = "cho-dong-goi" | "dang-dong-goi" | "hoan-thanh" | "da-xuat-kho";
const TT_CFG: Record<TrangThai, { label: string; color: string; icon: React.ComponentType<{className?:string}>; step: number }> = {
  "cho-dong-goi":   { label: "Chờ đóng gói",  color: "bg-gray-100 text-gray-600",        icon: Clock,         step: 1 },
  "dang-dong-goi":  { label: "Đang đóng gói", color: "bg-amber-100 text-amber-700",      icon: Clock,         step: 2 },
  "hoan-thanh":     { label: "Hoàn thành",     color: "bg-blue-100 text-blue-700",        icon: CheckCircle2,  step: 3 },
  "da-xuat-kho":    { label: "Đã xuất kho",    color: "bg-emerald-100 text-emerald-700",  icon: Truck,         step: 4 },
};
const NEXT_TT: Record<TrangThai, TrangThai|null> = {
  "cho-dong-goi": "dang-dong-goi", "dang-dong-goi": "hoan-thanh",
  "hoan-thanh": "da-xuat-kho", "da-xuat-kho": null,
};
const STEPS_DG = ["Chờ đóng gói","Đang đóng gói","Hoàn thành","Đã xuất kho"];

interface LoDG {
  id: string; maDG: string; maLoSX: string; thoiGian: string; thanhPham: string;
  loaiBaoBi: string; klDG: number; soSP: number; trangThai: TrangThai;
  qrCode: string; nguoiTao: string; ghiChu: string;
}

const initData: LoDG[] = [
  { id:"1",  maDG:"S013003",  maLoSX:"L013003",  thoiGian:"30/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g",  klDG:5.5,  soSP:22,  trangThai:"da-xuat-kho",   qrCode:"QR-S013003", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"2",  maDG:"S023103",  maLoSX:"L023103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g",  klDG:6.0,  soSP:24,  trangThai:"da-xuat-kho",   qrCode:"QR-S023103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"3",  maDG:"S033103",  maLoSX:"L033103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g",  klDG:6.2,  soSP:25,  trangThai:"da-xuat-kho",   qrCode:"QR-S033103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"4",  maDG:"S043103",  maLoSX:"L043103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",   klDG:4.7,  soSP:47,  trangThai:"da-xuat-kho",   qrCode:"QR-S043103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"5",  maDG:"S053103",  maLoSX:"L053103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",   klDG:4.7,  soSP:47,  trangThai:"da-xuat-kho",   qrCode:"QR-S053103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"6",  maDG:"S063103",  maLoSX:"L063103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",   klDG:4.0,  soSP:40,  trangThai:"da-xuat-kho",   qrCode:"QR-S063103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"7",  maDG:"S073103",  maLoSX:"L073103",  thoiGian:"31/03/2026", thanhPham:"Bạch trà",  loaiBaoBi:"tui-kraft-50g",   klDG:1.65, soSP:33,  trangThai:"da-xuat-kho",   qrCode:"QR-S073103", nguoiTao:"HTX Hồng Hà", ghiChu:"Tôm trắng đặc sản" },
  { id:"8",  maDG:"S083103",  maLoSX:"L083103",  thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"tui-kraft-50g",   klDG:1.95, soSP:39,  trangThai:"da-xuat-kho",   qrCode:"QR-S083103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"9",  maDG:"S09104",   maLoSX:"L09104",   thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDG:5.8,  soSP:58,  trangThai:"hoan-thanh",    qrCode:"QR-S09104",  nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"10", maDG:"S010104",  maLoSX:"L010104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDG:7.4,  soSP:74,  trangThai:"hoan-thanh",    qrCode:"QR-S010104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"11", maDG:"S011104",  maLoSX:"L011104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",    klDG:13.0, soSP:13,  trangThai:"hoan-thanh",    qrCode:"QR-S011104", nguoiTao:"HTX Hồng Hà", ghiChu:"Xuất bulk cho NPP" },
  { id:"12", maDG:"S012104",  maLoSX:"L012104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",    klDG:10.5, soSP:11,  trangThai:"hoan-thanh",    qrCode:"QR-S012104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"13", maDG:"S013104",  maLoSX:"L013104",  thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-qua-tang",    klDG:5.5,  soSP:28,  trangThai:"dang-dong-goi", qrCode:"",           nguoiTao:"HTX Hồng Hà", ghiChu:"Đơn Lotte Mart" },
  { id:"14", maDG:"S014104",  maLoSX:"L09104",   thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",   klDG:0.8,  soSP:8,   trangThai:"cho-dong-goi",  qrCode:"",           nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"15", maDG:"S015104",  maLoSX:"L073103",  thoiGian:"03/04/2026", thanhPham:"Bạch trà",  loaiBaoBi:"hop-qua-tang",    klDG:0.3,  soSP:2,   trangThai:"cho-dong-goi",  qrCode:"",           nguoiTao:"HTX Hồng Hà", ghiChu:"Đơn đặc biệt KH-003" },
];

let _nid = 900;
const genId = () => String(++_nid);

export default function PackagingPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [ttFilter, setTtFilter] = useState<TrangThai | "">("");
  const [spFilter, setSpFilter] = useState("");
  const [sortKey, setSortKey] = useState("thoiGian");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [loList, setLoList] = useState<LoDG[]>(initData);
  const [selected, setSelected] = useState<LoDG | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState<string|null>(null);
  const [fSP, setFSP] = useState("Chè xanh"); const [fLoSX, setFLoSX] = useState("");
  const [fBaoBi, setFBaoBi] = useState("hop-giay-100g"); const [fKL, setFKL] = useState("");
  const [fNgay, setFNgay] = useState(new Date().toISOString().slice(0,10)); const [fNote, setFNote] = useState("");

  const handleSort = (k: string) => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("desc"); } };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleAdvance = (id: string) => {
    setLoList(prev => prev.map(lo => {
      if (lo.id !== id) return lo;
      const next = NEXT_TT[lo.trangThai]; if (!next) return lo;
      const qrCode = next === "hoan-thanh" ? `QR-${lo.maDG}` : lo.qrCode;
      return { ...lo, trangThai: next, qrCode };
    }));
  };
  const handleCreate = () => {
    if (!fKL || !fLoSX) return;
    const bb = BAO_BI_OPTIONS.find(b => b.value === fBaoBi)!;
    const soSP = Math.floor(parseFloat(fKL) / bb.kgPerUnit);
    const [y,m,d] = fNgay.split("-");
    const id = genId();
    const maDG = `S0${id}${d}${m.slice(-1)}`;
    const newLo: LoDG = { id, maDG, maLoSX: fLoSX, thoiGian: `${d}/${m}/${y}`, thanhPham: fSP, loaiBaoBi: fBaoBi, klDG: parseFloat(fKL)||0, soSP, trangThai: "cho-dong-goi", qrCode: "", nguoiTao: "Admin", ghiChu: fNote };
    setLoList(prev => [newLo, ...prev]);
    setShowCreate(false); setFLoSX(""); setFKL(""); setFNote("");
  };
  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa lô đóng gói?")) return;
    setLoList(prev => prev.filter(l => l.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = useMemo(() => {
    let data = loList;
    if (search) { const q = search.toLowerCase(); data = data.filter(l => l.maDG.toLowerCase().includes(q) || l.maLoSX.toLowerCase().includes(q) || l.thanhPham.toLowerCase().includes(q)); }
    if (ttFilter) data = data.filter(l => l.trangThai === ttFilter);
    if (spFilter) data = data.filter(l => l.thanhPham === spFilter);
    return [...data].sort((a,b) => {
      const av = (a as Record<string,unknown>)[sortKey]; const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir==="asc"?av-bv:bv-av;
      return sortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
    });
  }, [loList, search, ttFilter, spFilter, sortKey, sortDir]);

  const totalSP = loList.filter(l=>l.trangThai==="hoan-thanh"||l.trangThai==="da-xuat-kho").reduce((s,l)=>s+l.soSP,0);
  const totalKL = loList.reduce((s,l)=>s+l.klDG,0);
  const waitingCount = loList.filter(l=>l.trangThai==="cho-dong-goi").length;
  const withQR = loList.filter(l=>l.qrCode).length;

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Đóng gói</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Nhận TP → Đóng gói → Gán QR → Nhập kho · QR trace đến nông hộ</p></div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Lô đóng gói mới</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Box,        label: "Tổng sản phẩm", value: `${totalSP} đv`,         sub:"đã hoàn thành",    color:"text-emerald-600 bg-emerald-50" },
          { icon: Package,    label: "Tổng KL đóng",  value: `${totalKL.toFixed(1)} kg`, sub:"toàn bộ",       color:"text-blue-600 bg-blue-50" },
          { icon: Clock,      label: "Chờ đóng gói",  value: `${waitingCount} lô`,     sub:"cần xử lý",        color:"text-amber-600 bg-amber-50" },
          { icon: QrCode,     label: "Đã gán QR",      value: `${withQR} lô`,           sub:"trace full chain", color:"text-violet-600 bg-violet-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã lô, lô SX, sản phẩm..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <select value={ttFilter} onChange={e=>setTtFilter(e.target.value as TrangThai|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả TT</option>{Object.entries(TT_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          <select value={spFilter} onChange={e=>setSpFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả SP</option>{["Chè xanh","Hồng trà","Bạch trà","Phổ nhĩ"].map(s=><option key={s} value={s}>{s}</option>)}</select>
          <button onClick={()=>{setSearch("");setTtFilter("");setSpFilter("");}} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50"><Filter className="w-3.5 h-3.5"/> Lọc</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {[{k:"maDG",l:"Mã đóng gói"},{k:"maLoSX",l:"Lô SX"},{k:"thoiGian",l:"Ngày"},{k:"thanhPham",l:"Sản phẩm"},{k:"loaiBaoBi",l:"Bao bì"},{k:"klDG",l:"KL (kg)"},{k:"soSP",l:"Số ĐV"},{k:"qrCode",l:"QR"},{k:"trangThai",l:"Trạng thái"}].map(col=>(
                <th key={col.k} onClick={()=>handleSort(col.k)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                  <span className="flex items-center gap-1">{col.l}<SortIcon col={col.k}/></span>
                </th>
              ))}
              <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase">Thao tác</th>
            </tr></thead>
            <tbody>
              {filtered.map(lo => {
                const tc = TT_CFG[lo.trangThai]; const Ic = tc.icon; const next = NEXT_TT[lo.trangThai];
                const bbLabel = BAO_BI_OPTIONS.find(b=>b.value===lo.loaiBaoBi)?.label ?? lo.loaiBaoBi;
                return (
                  <tr key={lo.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(lo)}>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{lo.maDG}</span></td>
                    <td className="py-3 px-4"><span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded-md">{lo.maLoSX}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{lo.thoiGian}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRODUCT_COLOR[lo.thanhPham]??""}`}>{lo.thanhPham}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{bbLabel}</td>
                    <td className="py-3 px-4 font-medium text-sm">{lo.klDG}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{lo.soSP}</td>
                    <td className="py-3 px-4">{lo.qrCode?<button onClick={e=>{e.stopPropagation();setShowQR(lo.qrCode);}} className="flex items-center gap-1 text-xs text-primary hover:underline"><QrCode className="w-3 h-3"/>Xem QR</button>:<span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}><Ic className="w-3 h-3"/>{tc.label}</span></td>
                    <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        {next&&<button onClick={()=>handleAdvance(lo.id)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary" title={TT_CFG[next].label}><ArrowRight className="w-3.5 h-3.5"/></button>}
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
          <p className="text-xs text-muted-foreground">{filtered.length} lô đóng gói</p>
          <p className="text-xs font-semibold">{filtered.reduce((s,l)=>s+l.soSP,0)} đơn vị · {filtered.reduce((s,l)=>s+l.klDG,0).toFixed(1)} kg</p>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maDG}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.thoiGian}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              {/* Stepper */}
              <div className="flex items-center overflow-x-auto pb-1 gap-1">
                {STEPS_DG.map((step,i)=>{
                  const cur = TT_CFG[selected.trangThai].step; const done = i+1<cur; const active = i+1===cur;
                  return (<div key={i} className="flex items-center gap-1">
                    <div className={`flex flex-col items-center ${done||active?"opacity-100":"opacity-30"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done?"bg-emerald-500 text-white":active?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{done?"✓":i+1}</div>
                      <p className="text-xs mt-1 whitespace-nowrap">{step}</p>
                    </div>
                    {i<STEPS_DG.length-1&&<ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mx-0.5 mb-4"/>}
                  </div>);
                })}
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                {[{l:"Lô SX",v:selected.maLoSX},{l:"Sản phẩm",v:selected.thanhPham},{l:"Bao bì",v:BAO_BI_OPTIONS.find(b=>b.value===selected.loaiBaoBi)?.label??""},{l:"Người tạo",v:selected.nguoiTao}].map((r,i)=>(
                  <div key={i} className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{r.l}</p><p className="text-sm font-medium">{r.v}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/20 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">KL đóng gói</p><p className="text-xl font-bold">{selected.klDG} kg</p></div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Số đơn vị</p><p className="text-xl font-bold text-emerald-700">{selected.soSP}</p></div>
              </div>
              {selected.qrCode ? (
                <div className="border-2 border-primary/30 rounded-xl p-4 flex flex-col items-center gap-2 bg-primary/5 cursor-pointer" onClick={()=>setShowQR(selected.qrCode)}>
                  <QrCode className="w-12 h-12 text-primary/60"/>
                  <p className="font-mono text-sm font-bold text-primary">{selected.qrCode}</p>
                  <p className="text-xs text-muted-foreground text-center">QR trace: Sản phẩm → Lô SX → Batch NVL → Nông hộ</p>
                  <button className="text-xs text-primary hover:underline">Click để xem / in</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted rounded-xl p-4 text-center text-xs text-muted-foreground">QR sẽ được gán khi hoàn thành đóng gói</div>
              )}
              {/* Full trace chain */}
              {(() => {
                const LOSX_RAW_MAP: Record<string,string[]> = {
                  "L013003":["RAW-NH004-3003","RAW-NB002-3003"],
                  "L023103":["RAW-NH001-3103","RAW-NH002-3103","RAW-NH008-3103"],
                  "L033103":["RAW-NH009-3103","RAW-NH004-3103"],
                  "L043103":["RAW-NH006-3103","RAW-NH007-3103"],
                  "L053103":["RAW-NH007-3103"],
                  "L063103":["RAW-NB009-3103","RAW-NB010-3103"],
                  "L073103":["RAW-NB010-3103","RAW-NB001-3103","RAW-NB002-3103","RAW-NB007-3103"],
                  "L083103":["RAW-NH010-3103"],
                  "L09104": ["RAW-NH001-0104","RAW-NH004-0104"],
                  "L010104":["RAW-NB011-0104","RAW-NB012-0104","RAW-NB010-0104"],
                  "L011104":["RAW-NB013-0104","RAW-NB002-0104"],
                  "L012104":["RAW-NB004-0104","RAW-NB001-0104"],
                  "L013104":["RAW-NB006-0104"],
                };
                const rawBatches = LOSX_RAW_MAP[selected.maLoSX] ?? [];
                const farmerCodes = [...new Set(rawBatches.map(b=>{ const p=b.split("-"); return p.length>=2?p[1]:""; }).filter(Boolean))];
                const regions = [...new Set(farmerCodes.map(c=>c.startsWith("NH")?"Nà Hồng":c.startsWith("NB")?"Nà Bay":"Bản Chang"))];
                return (
                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                    <p className="text-xs font-semibold text-violet-900 uppercase tracking-wide mb-3">Chuỗi truy xuất đầy đủ</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-violet-200">
                          <span className="text-muted-foreground">Lô đóng gói: </span>
                          <span className="font-mono font-bold text-violet-700">{selected.maDG}</span>
                          {selected.qrCode && <span className="ml-2 font-mono text-xs text-violet-500">· {selected.qrCode}</span>}
                        </div>
                      </div>
                      <div className="ml-2.5 w-px h-3 bg-violet-300"/>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-primary/30">
                          <span className="text-muted-foreground">Lô sản xuất: </span>
                          <span className="font-mono font-bold text-primary">{selected.maLoSX}</span>
                          <span className="ml-1 text-muted-foreground">· {selected.thanhPham}</span>
                        </div>
                      </div>
                      <div className="ml-2.5 w-px h-3 bg-blue-300"/>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-blue-200">
                          <span className="text-muted-foreground">RAW batch NVL: </span>
                          {rawBatches.length > 0
                            ? rawBatches.map(b=><span key={b} className="font-mono text-[10px] bg-blue-100 text-blue-700 border border-blue-200 px-1 py-0.5 rounded mr-1">{b}</span>)
                            : <span className="text-muted-foreground italic">Không rõ</span>}
                        </div>
                      </div>
                      {farmerCodes.length > 0 && <>
                        <div className="ml-2.5 w-px h-3 bg-emerald-300"/>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                          <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-emerald-200">
                            <span className="text-muted-foreground">Nông hộ: </span>
                            {farmerCodes.map(c=><span key={c} className="font-mono text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1 py-0.5 rounded mr-1">{c}</span>)}
                            <span className="text-muted-foreground ml-1">· </span>
                            {regions.map(r=><span key={r} className="text-xs font-medium text-emerald-700 mr-1">{r}</span>)}
                          </div>
                        </div>
                      </>}
                      <div className="ml-2.5 w-px h-3 bg-amber-300"/>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border border-amber-200">
                          <span className="text-muted-foreground">Vùng trồng: </span>
                          <span className="font-medium text-amber-800">Shan Tuyết Bằng Phúc, Hà Giang</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {selected.ghiChu&&<div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Ghi chú</p><p className="text-sm italic mt-0.5">{selected.ghiChu}</p></div>}
              {NEXT_TT[selected.trangThai]&&(
                <button onClick={()=>{handleAdvance(selected.id);setSelected(prev=>prev?{...loList.find(l=>l.id===prev.id)!}:null);}} className="w-full py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"><ArrowRight className="w-4 h-4"/>Chuyển: {TT_CFG[NEXT_TT[selected.trangThai]!].label}</button>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
              <button onClick={()=>handleDelete(selected.id)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/> Xóa lô</button>
            </div>
          </div>
        </div>
      )}

      {/* QR modal */}
      {showQR && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setShowQR(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
            <button onClick={()=>setShowQR(null)} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            <QrCode className="w-28 h-28 mx-auto text-primary/80 mb-4"/>
            <p className="font-mono text-sm font-bold text-primary mb-1">{showQR}</p>
            <p className="text-xs text-muted-foreground">Scan để xem toàn bộ chuỗi truy xuất nguồn gốc</p>
            <div className="mt-3 bg-muted/20 rounded-lg p-3 text-left text-xs space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground">Chuỗi truy xuất:</p>
              <p>🍃 Sản phẩm: {showQR.replace("QR-","")}</p>
              <p>🏭 Lô SX → Batch NVL</p>
              <p>👨‍🌾 Nông hộ → Vùng trồng</p>
              <p>📍 Shan Tuyết Bằng Phúc, Hà Giang</p>
            </div>
            <button className="mt-4 w-full py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90">In QR code</button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"><div className="flex items-center gap-2"><Box className="w-4 h-4 text-primary"/><span className="font-semibold text-sm">Tạo lô đóng gói mới</span></div><button onClick={()=>setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button></div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Mã lô sản xuất <span className="text-red-500">*</span></label><input value={fLoSX} onChange={e=>setFLoSX(e.target.value)} placeholder="L09104, L010104..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
              <div><label className="block text-xs font-semibold mb-1.5">Sản phẩm</label><div className="flex flex-wrap gap-2">{["Chè xanh","Hồng trà","Bạch trà","Phổ nhĩ"].map(s=><button key={s} onClick={()=>setFSP(s)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${fSP===s?"border-primary text-primary bg-primary/10":"border-border text-muted-foreground hover:bg-muted/40"}`}>{s}</button>)}</div></div>
              <div><label className="block text-xs font-semibold mb-1.5">Bao bì</label><select value={fBaoBi} onChange={e=>setFBaoBi(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{BAO_BI_OPTIONS.map(b=><option key={b.value} value={b.value}>{b.label}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">KL đóng gói (kg) <span className="text-red-500">*</span></label><input type="number" value={fKL} onChange={e=>setFKL(e.target.value)} step="0.1" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
                <div><label className="block text-xs font-semibold mb-1.5">Ngày đóng</label><input type="date" value={fNgay} onChange={e=>setFNgay(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
              </div>
              {fKL&&<div className="bg-muted/20 rounded-xl p-3 text-xs text-muted-foreground"><p className="font-semibold mb-1">Dự kiến:</p><p>~ {Math.floor(parseFloat(fKL)/(BAO_BI_OPTIONS.find(b=>b.value===fBaoBi)?.kgPerUnit??0.1))} đơn vị ({BAO_BI_OPTIONS.find(b=>b.value===fBaoBi)?.label})</p></div>}
              <div><label className="block text-xs font-semibold mb-1.5">Ghi chú</label><textarea value={fNote} onChange={e=>setFNote(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none"/></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fKL||!fLoSX} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Tạo lô</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
