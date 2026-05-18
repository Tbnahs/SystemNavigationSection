import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Wallet, PiggyBank,
  CheckCircle2, Clock, XCircle, Eye, Trash2, X, BadgeDollarSign, Users,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { useERP, Phieu } from "@/contexts/ERPContext";

type PhieuType = "thu" | "chi";
type PhuongThuc = "Tiền mặt" | "Chuyển khoản" | "Ví điện tử";
type TrangThai = "da-duyet" | "cho-duyet" | "tu-choi";

const TT_CFG = {
  "da-duyet": { label: "Đã duyệt",  color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "cho-duyet":{ label: "Chờ duyệt", color: "bg-amber-100 text-amber-700",    icon: Clock },
  "tu-choi":  { label: "Từ chối",   color: "bg-red-100 text-red-600",         icon: XCircle },
};


const CONG_NO_KH = [
  { maKH:"KH-003", tenKH:"Cty CP XNK Hà Nội",         tongTien:45900000,  daThu:0,        conNo:45900000,  hanTT:"10/04/2026" },
  { maKH:"KH-004", tenKH:"Siêu thị Lotte Mart",        tongTien:19800000,  daThu:0,        conNo:19800000,  hanTT:"12/04/2026" },
  { maKH:"KH-006", tenKH:"Quán trà Sen",                tongTien:3800000,   daThu:0,        conNo:3800000,   hanTT:"07/04/2026" },
  { maKH:"KH-001", tenKH:"Cty TNHH Trà Thái Nguyên",  tongTien:23000000,  daThu:23000000, conNo:0,         hanTT:"—" },
  { maKH:"KH-002", tenKH:"HTX Chè Tân Cương",          tongTien:21000000,  daThu:21000000, conNo:0,         hanTT:"—" },
];
const CONG_NO_NH = [
  { maHo:"NB013", tenHo:"Triệu Văn Cường",  tongTien:1450000,  daTra:0,       conNo:1450000,  hanTT:"10/04/2026" },
  { maHo:"NB006", tenHo:"Hoàng Văn Thống",  tongTien:1426800,  daTra:0,       conNo:1426800,  hanTT:"12/04/2026" },
  { maHo:"NH004", tenHo:"Triệu Văn Thạo",   tongTien:364500,   daTra:364500,  conNo:0,        hanTT:"—" },
  { maHo:"NB010", tenHo:"Mạnh Văn Hồ",      tongTien:1300000,  daTra:650000,  conNo:650000,   hanTT:"05/04/2026" },
];

function fmtMoney(v: number) { return v.toLocaleString("vi-VN") + " đ"; }
function fmtM(v: number) { if (v >= 1_000_000) return (v/1e6).toFixed(1) + " tr"; return v.toLocaleString("vi-VN"); }

let _nid = 700;
const genId = () => String(++_nid);

export default function AccountingPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"phieu" | "phai-thu" | "phai-tra">("phieu");
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<PhieuType | "">("");
  const [ttFilter, setTtFilter] = useState<TrangThai | "">("");
  const [sortKey, setSortKey] = useState("ngay");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const { accountingEntries: phieuList, setAccountingEntries: setPhieuList } = useERP();
  const [selected, setSelected] = useState<Phieu | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [fLoai, setFLoai] = useState<PhieuType>("thu"); const [fDoiTuong, setFDoiTuong] = useState("");
  const [fDanhMuc, setFDanhMuc] = useState("Doanh thu bán hàng"); const [fSoTien, setFSoTien] = useState("");
  const [fNgay, setFNgay] = useState(new Date().toISOString().slice(0,10));
  const [fPhuongThuc, setFPhuongThuc] = useState<PhuongThuc>("Chuyển khoản"); const [fNote, setFNote] = useState("");

  const handleSort = (k: string) => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("desc"); } };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleCreate = () => {
    if (!fDoiTuong || !fSoTien) return;
    const newP: Phieu = { id: genId(), maPhieu: `${fLoai==="thu"?"PT":"PC"}-${Date.now().toString().slice(-4)}`, loai: fLoai, doiTuong: fDoiTuong, danhMuc: fDanhMuc, soTien: parseFloat(fSoTien)||0, ngay: fNgay, phuongThuc: fPhuongThuc, trangThai: "cho-duyet", ghiChu: fNote, nguoiTao: "Admin" };
    setPhieuList(prev => [newP, ...prev]);
    setShowCreate(false); setFDoiTuong(""); setFSoTien(""); setFNote("");
  };
  const handleApprove = (id: string) => setPhieuList(prev => prev.map(p => p.id===id ? {...p, trangThai:"da-duyet"} : p));
  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa phiếu này?")) return;
    setPhieuList(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleExportExcel = () => exportToExcel(
    [
      { header: "Mã phiếu", key: "maPhieu", width: 14 },
      { header: "Loại", key: "loai", width: 8 },
      { header: "Đối tượng", key: "doiTuong", width: 32 },
      { header: "Danh mục", key: "danhMuc", width: 24 },
      { header: "Số tiền (đ)", key: "soTien", width: 16 },
      { header: "Ngày", key: "ngay", width: 14 },
      { header: "Phương thức", key: "phuongThuc", width: 16 },
      { header: "Trạng thái", key: "trangThai", width: 14 },
      { header: "Ghi chú", key: "ghiChu", width: 24 },
      { header: "Người tạo", key: "nguoiTao", width: 16 },
    ],
    phieuList as unknown as Record<string, unknown>[],
    "KeToan_HTXHongHa"
  );

  const handleExportPDF = () => exportToPDF(
    "Danh sách Phiếu Kế toán",
    `HTX Hồng Hà · ${phieuList.length} phiếu thu/chi`,
    [
      { header: "Mã phiếu", key: "maPhieu", width: 18 },
      { header: "Loại", key: "loai", width: 10 },
      { header: "Đối tượng", key: "doiTuong", width: 44 },
      { header: "Số tiền (đ)", key: "soTien", width: 20 },
      { header: "Ngày", key: "ngay", width: 18 },
      { header: "Trạng thái", key: "trangThai", width: 18 },
    ],
    phieuList as unknown as Record<string, unknown>[],
    "KeToan_HTXHongHa"
  );

  const filtered = useMemo(() => {
    let data = phieuList;
    if (search) { const q = search.toLowerCase(); data = data.filter(p => p.maPhieu.toLowerCase().includes(q) || p.doiTuong.toLowerCase().includes(q)); }
    if (loaiFilter) data = data.filter(p => p.loai === loaiFilter);
    if (ttFilter) data = data.filter(p => p.trangThai === ttFilter);
    return [...data].sort((a,b) => {
      const av = (a as Record<string,unknown>)[sortKey]; const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir==="asc"?av-bv:bv-av;
      return sortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
    });
  }, [phieuList, search, loaiFilter, ttFilter, sortKey, sortDir]);

  const totalThu = phieuList.filter(p=>p.loai==="thu"&&p.trangThai==="da-duyet").reduce((s,p)=>s+p.soTien,0);
  const totalChi = phieuList.filter(p=>p.loai==="chi"&&p.trangThai==="da-duyet").reduce((s,p)=>s+p.soTien,0);
  const choXL    = phieuList.filter(p=>p.trangThai==="cho-duyet").length;
  const conNoKH  = CONG_NO_KH.reduce((s,k)=>s+k.conNo,0);

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Kế toán</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Ghi nhận → Công nợ → Thanh toán → Báo cáo</p></div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Tạo phiếu</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp,      label: "Tổng thu",      value: fmtM(totalThu)+" đ", sub:"đã duyệt",           color:"text-emerald-600 bg-emerald-50" },
          { icon: TrendingDown,    label: "Tổng chi",      value: fmtM(totalChi)+" đ", sub:"đã duyệt",           color:"text-red-600 bg-red-50" },
          { icon: Wallet,          label: "Chênh lệch",    value: fmtM(totalThu-totalChi)+" đ", sub:"thu - chi", color:"text-blue-600 bg-blue-50" },
          { icon: Clock,           label: "Chờ duyệt",     value: `${choXL} phiếu`,    sub:"cần xử lý",          color:"text-amber-600 bg-amber-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[
          {key:"phieu",    label:"Phiếu thu/chi",  count:phieuList.length},
          {key:"phai-thu", label:"Phải thu (KH)",  count:CONG_NO_KH.filter(k=>k.conNo>0).length},
          {key:"phai-tra", label:"Phải trả (NH)",  count:CONG_NO_NH.filter(k=>k.conNo>0).length},
        ].map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab===tab.key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}<span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab===tab.key?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === "phieu" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã phiếu, đối tượng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <div className="flex gap-1">
              {(["","thu","chi"] as (PhieuType|"")[]).map(t=>(
                <button key={t} onClick={()=>setLoaiFilter(t)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${loaiFilter===t?"bg-primary text-white border-primary":"border-border text-muted-foreground hover:bg-muted/40"}`}>{t===""?"Tất cả":t==="thu"?"Phiếu thu":"Phiếu chi"}</button>
              ))}
            </div>
            <select value={ttFilter} onChange={e=>setTtFilter(e.target.value as TrangThai|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả TT</option>{Object.entries(TT_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {[{k:"maPhieu",l:"Mã phiếu"},{k:"loai",l:"Loại"},{k:"doiTuong",l:"Đối tượng"},{k:"danhMuc",l:"Danh mục"},{k:"soTien",l:"Số tiền"},{k:"ngay",l:"Ngày"},{k:"phuongThuc",l:"PT"},{k:"trangThai",l:"TT"}].map(col=>(
                  <th key={col.k} onClick={()=>handleSort(col.k)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.l} <SortIcon col={col.k} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase">Thao tác</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => {
                  const tc = TT_CFG[p.trangThai]; const Ic = tc.icon;
                  return (
                    <tr key={p.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(p)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{p.maPhieu}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.loai==="thu"?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{p.loai==="thu"?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}{p.loai==="thu"?"Thu":"Chi"}</span></td>
                      <td className="py-3 px-4 text-sm font-medium max-w-[160px] truncate">{p.doiTuong}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{p.danhMuc}</td>
                      <td className="py-3 px-4"><span className={`font-bold text-sm ${p.loai==="thu"?"text-emerald-700":"text-red-600"}`}>{p.loai==="thu"?"+":"-"}{fmtMoney(p.soTien)}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{p.ngay}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{p.phuongThuc}</td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}><Ic className="w-3 h-3"/>{tc.label}</span></td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          {p.trangThai==="cho-duyet"&&<button onClick={()=>handleApprove(p.id)} className="p-1.5 rounded-md hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600" title="Duyệt"><CheckCircle2 className="w-3.5 h-3.5"/></button>}
                          <button onClick={()=>setSelected(p)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Eye className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>handleDelete(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">{filtered.length} phiếu</p>
            <div className="flex gap-4">
              <p className="text-xs font-semibold text-emerald-700">Thu: +{fmtM(filtered.filter(p=>p.loai==="thu").reduce((s,p)=>s+p.soTien,0))} đ</p>
              <p className="text-xs font-semibold text-red-600">Chi: -{fmtM(filtered.filter(p=>p.loai==="chi").reduce((s,p)=>s+p.soTien,0))} đ</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "phai-thu" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
            <p className="text-sm font-semibold">Công nợ phải thu – Khách hàng</p>
            <p className="text-xs font-semibold text-red-600">Tổng còn nợ: {fmtMoney(CONG_NO_KH.reduce((s,k)=>s+k.conNo,0))}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">{["Mã KH","Tên KH","Tổng tiền","Đã thu","Còn nợ","Hạn TT","Trạng thái"].map((h,i)=><th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {CONG_NO_KH.map((k,i) => (
                  <tr key={i} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="py-3 px-4"><span className="font-mono text-xs text-primary">{k.maKH}</span></td>
                    <td className="py-3 px-4 font-medium text-sm">{k.tenKH}</td>
                    <td className="py-3 px-4 text-sm">{fmtMoney(k.tongTien)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold text-sm">{fmtMoney(k.daThu)}</td>
                    <td className="py-3 px-4"><span className={`font-bold text-sm ${k.conNo>0?"text-red-600":"text-emerald-700"}`}>{fmtMoney(k.conNo)}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{k.hanTT}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${k.conNo===0?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{k.conNo===0?"Đã thu đủ":"Còn nợ"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "phai-tra" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20">
            <p className="text-sm font-semibold">Công nợ phải trả – Nông hộ</p>
            <p className="text-xs font-semibold text-amber-700">Tổng còn nợ: {fmtMoney(CONG_NO_NH.reduce((s,k)=>s+k.conNo,0))}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">{["Mã hộ","Tên hộ","Tổng tiền","Đã trả","Còn nợ","Hạn TT","TT"].map((h,i)=><th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {CONG_NO_NH.map((k,i) => (
                  <tr key={i} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="py-3 px-4"><span className="font-mono text-xs text-primary">{k.maHo}</span></td>
                    <td className="py-3 px-4 font-medium text-sm">{k.tenHo}</td>
                    <td className="py-3 px-4 text-sm">{fmtMoney(k.tongTien)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold text-sm">{fmtMoney(k.daTra)}</td>
                    <td className="py-3 px-4"><span className={`font-bold text-sm ${k.conNo>0?"text-amber-700":"text-emerald-700"}`}>{fmtMoney(k.conNo)}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{k.hanTT}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${k.conNo===0?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{k.conNo===0?"Đã trả đủ":"Còn nợ"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maPhieu}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.ngay} · {selected.nguoiTao}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${selected.loai==="thu"?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{selected.loai==="thu"?"Phiếu thu":"Phiếu chi"}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TT_CFG[selected.trangThai].color}`}>{TT_CFG[selected.trangThai].label}</span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                {[{l:"Đối tượng",v:selected.doiTuong},{l:"Danh mục",v:selected.danhMuc},{l:"PT thanh toán",v:selected.phuongThuc}].map((r,i)=>(
                  <div key={i} className="flex items-start justify-between gap-2"><p className="text-xs text-muted-foreground shrink-0">{r.l}</p><p className="text-sm font-medium text-right">{r.v}</p></div>
                ))}
              </div>
              <div className={`px-4 py-4 rounded-xl text-center ${selected.loai==="thu"?"bg-emerald-50 border border-emerald-200":"bg-red-50 border border-red-200"}`}>
                <p className="text-xs text-muted-foreground mb-1">{selected.loai==="thu"?"Số tiền thu":"Số tiền chi"}</p>
                <p className={`text-3xl font-black ${selected.loai==="thu"?"text-emerald-700":"text-red-600"}`}>{fmtMoney(selected.soTien)}</p>
              </div>
              {selected.ghiChu&&<div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Ghi chú</p><p className="text-sm italic mt-0.5">{selected.ghiChu}</p></div>}
              {selected.trangThai==="cho-duyet"&&<button onClick={()=>{handleApprove(selected.id);setSelected(p=>p?{...p,trangThai:"da-duyet"}:p);}} className="w-full py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/> Phê duyệt phiếu</button>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
              <button onClick={()=>handleDelete(selected.id)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/> Xóa phiếu</button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"><div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary"/><span className="font-semibold text-sm">Tạo phiếu kế toán</span></div><button onClick={()=>setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button></div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Loại phiếu</label><div className="flex gap-2">{(["thu","chi"] as PhieuType[]).map(t=><button key={t} onClick={()=>setFLoai(t)} className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${fLoai===t?"border-primary text-primary bg-primary/10":"border-border text-muted-foreground hover:bg-muted/40"}`}>{t==="thu"?"Phiếu thu":"Phiếu chi"}</button>)}</div></div>
              <div><label className="block text-xs font-semibold mb-1.5">Đối tượng <span className="text-red-500">*</span></label><input value={fDoiTuong} onChange={e=>setFDoiTuong(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/></div>
              <div><label className="block text-xs font-semibold mb-1.5">Danh mục</label><select value={fDanhMuc} onChange={e=>setFDanhMuc(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{["Doanh thu bán hàng","Thu mua nguyên liệu","Lương","Bao bì đóng gói","Điện nước","Vận hành","Bảo trì thiết bị","Hỗ trợ nhà nước","Pháp lý"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">Số tiền (đ) <span className="text-red-500">*</span></label><input type="number" value={fSoTien} onChange={e=>setFSoTien(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
                <div><label className="block text-xs font-semibold mb-1.5">Ngày</label><input type="date" value={fNgay} onChange={e=>setFNgay(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">PT thanh toán</label><div className="flex gap-2">{(["Tiền mặt","Chuyển khoản","Ví điện tử"] as PhuongThuc[]).map(pt=><button key={pt} onClick={()=>setFPhuongThuc(pt)} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${fPhuongThuc===pt?"border-primary text-primary bg-primary/10":"border-border text-muted-foreground hover:bg-muted/40"}`}>{pt}</button>)}</div></div>
              <div><label className="block text-xs font-semibold mb-1.5">Ghi chú</label><textarea value={fNote} onChange={e=>setFNote(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none"/></div>
              {fSoTien&&<div className={`px-4 py-3 rounded-xl text-center ${fLoai==="thu"?"bg-emerald-50":"bg-red-50"}`}><p className="text-xs text-muted-foreground">Số tiền</p><p className={`text-xl font-bold ${fLoai==="thu"?"text-emerald-700":"text-red-600"}`}>{(parseFloat(fSoTien)||0).toLocaleString("vi-VN")} đ</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fDoiTuong||!fSoTien} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Tạo phiếu</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
