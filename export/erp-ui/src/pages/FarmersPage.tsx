import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter, X, Trash2, Eye,
  Users, MapPin, Phone, Leaf, FileSpreadsheet, FileText,
  QrCode, TrendingUp, CheckCircle2, Clock, Star,
  ChevronUp, ChevronDown, Pencil,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

const AREA_COLORS: Record<string, string> = {
  "Nà Hồng":   "bg-emerald-100 text-emerald-700",
  "Nà Bay":    "bg-blue-100 text-blue-700",
  "Bản Chang": "bg-amber-100 text-amber-700",
};

interface Farmer {
  id: string; maHo: string; tenHo: string; diaChi: string;
  sdt: string; cccd: string; dienTich: number; soVuon: number;
  namThamGia: number; tongKLDaGiao: number; diemCL: number; ghiChu: string;
}

const FARMERS: Farmer[] = [
  { id:"1",  maHo:"NH001", tenHo:"Hoàng Thị Luyến",  diaChi:"Nà Hồng",   sdt:"0354125321", cccd:"017xxxxxxx", dienTich:0.5, soVuon:2, namThamGia:2020, tongKLDaGiao:128.4, diemCL:88, ghiChu:"" },
  { id:"2",  maHo:"NH002", tenHo:"Hoàng Thị Đào",    diaChi:"Nà Hồng",   sdt:"0374704822", cccd:"017xxxxxxx", dienTich:0.4, soVuon:1, namThamGia:2020, tongKLDaGiao:95.2,  diemCL:85, ghiChu:"" },
  { id:"3",  maHo:"NH003", tenHo:"Phạm Thị Huyền",   diaChi:"Nà Hồng",   sdt:"0379251872", cccd:"017xxxxxxx", dienTich:1.0, soVuon:2, namThamGia:2019, tongKLDaGiao:210.0, diemCL:90, ghiChu:"Hộ lâu năm, ổn định" },
  { id:"4",  maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng",   sdt:"0354871949", cccd:"017xxxxxxx", dienTich:0.8, soVuon:2, namThamGia:2019, tongKLDaGiao:325.5, diemCL:92, ghiChu:"Sản lượng cao nhất vùng Nà Hồng" },
  { id:"5",  maHo:"NH005", tenHo:"Hoàng Văn Thái",   diaChi:"Nà Hồng",   sdt:"0972061820", cccd:"017xxxxxxx", dienTich:0.5, soVuon:1, namThamGia:2021, tongKLDaGiao:86.0,  diemCL:83, ghiChu:"" },
  { id:"6",  maHo:"NH006", tenHo:"Triệu Văn Hòa",    diaChi:"Nà Hồng",   sdt:"0378360830", cccd:"017xxxxxxx", dienTich:0.8, soVuon:2, namThamGia:2020, tongKLDaGiao:192.0, diemCL:87, ghiChu:"" },
  { id:"7",  maHo:"NH007", tenHo:"Hoàng Văn Tuấn",   diaChi:"Nà Hồng",   sdt:"0387851867", cccd:"017xxxxxxx", dienTich:1.0, soVuon:2, namThamGia:2019, tongKLDaGiao:245.0, diemCL:89, ghiChu:"" },
  { id:"8",  maHo:"NH008", tenHo:"Đồng Thị Khuyết",  diaChi:"Nà Hồng",   sdt:"0962041090", cccd:"017xxxxxxx", dienTich:0.7, soVuon:1, namThamGia:2020, tongKLDaGiao:165.0, diemCL:86, ghiChu:"" },
  { id:"9",  maHo:"NH009", tenHo:"Hạ Văn Thắng",     diaChi:"Nà Hồng",   sdt:"0337318858", cccd:"017xxxxxxx", dienTich:1.5, soVuon:2, namThamGia:2018, tongKLDaGiao:412.0, diemCL:93, ghiChu:"Cây chè cổ thụ trên 100 năm" },
  { id:"10", maHo:"NH010", tenHo:"Dương Thị Tươi",   diaChi:"Nà Hồng",   sdt:"",           cccd:"",           dienTich:0.5, soVuon:1, namThamGia:2022, tongKLDaGiao:52.0,  diemCL:79, ghiChu:"Mới tham gia" },
  { id:"11", maHo:"NB001", tenHo:"Nông Thị Dung",    diaChi:"Nà Bay",    sdt:"0961466732", cccd:"017xxxxxxx", dienTich:1.5, soVuon:2, namThamGia:2018, tongKLDaGiao:520.0, diemCL:94, ghiChu:"Hộ tiêu biểu vùng Nà Bay" },
  { id:"12", maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",    sdt:"0814665955", cccd:"017xxxxxxx", dienTich:1.0, soVuon:2, namThamGia:2019, tongKLDaGiao:380.5, diemCL:91, ghiChu:"" },
  { id:"13", maHo:"NB003", tenHo:"Mùng Văn Thời",    diaChi:"Nà Bay",    sdt:"0369254973", cccd:"017xxxxxxx", dienTich:0.6, soVuon:1, namThamGia:2020, tongKLDaGiao:145.0, diemCL:82, ghiChu:"" },
  { id:"14", maHo:"NB004", tenHo:"Triệu Văn Mỹ",     diaChi:"Nà Bay",    sdt:"0383760794", cccd:"017xxxxxxx", dienTich:1.0, soVuon:2, namThamGia:2019, tongKLDaGiao:285.0, diemCL:88, ghiChu:"" },
  { id:"15", maHo:"NB005", tenHo:"Nông Văn Đẳng",    diaChi:"Nà Bay",    sdt:"0374258744", cccd:"017xxxxxxx", dienTich:1.0, soVuon:1, namThamGia:2020, tongKLDaGiao:178.0, diemCL:80, ghiChu:"" },
  { id:"16", maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",    sdt:"0967186387", cccd:"017xxxxxxx", dienTich:1.0, soVuon:2, namThamGia:2019, tongKLDaGiao:342.0, diemCL:90, ghiChu:"" },
  { id:"17", maHo:"NB007", tenHo:"Nguyễn Văn Hân",   diaChi:"Nà Bay",    sdt:"0984922577", cccd:"017xxxxxxx", dienTich:1.0, soVuon:2, namThamGia:2020, tongKLDaGiao:198.5, diemCL:87, ghiChu:"" },
  { id:"18", maHo:"NB008", tenHo:"Nguyễn Thị Đa",    diaChi:"Nà Bay",    sdt:"0372122030", cccd:"017xxxxxxx", dienTich:0.7, soVuon:1, namThamGia:2021, tongKLDaGiao:112.0, diemCL:83, ghiChu:"" },
  { id:"19", maHo:"NB009", tenHo:"Triệu Văn Hánh",   diaChi:"Nà Bay",    sdt:"0345665232", cccd:"017xxxxxxx", dienTich:0.8, soVuon:2, namThamGia:2019, tongKLDaGiao:296.5, diemCL:86, ghiChu:"" },
  { id:"20", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",    sdt:"0349055299", cccd:"017xxxxxxx", dienTich:2.0, soVuon:3, namThamGia:2017, tongKLDaGiao:680.0, diemCL:96, ghiChu:"Diện tích lớn nhất, có 1 tôm tuyết" },
  { id:"21", maHo:"NB011", tenHo:"Hoàng Thị Điềm",   diaChi:"Nà Bay",    sdt:"0375182932", cccd:"017xxxxxxx", dienTich:0.4, soVuon:1, namThamGia:2022, tongKLDaGiao:65.0,  diemCL:81, ghiChu:"" },
  { id:"22", maHo:"NB012", tenHo:"Lâm Thị Tới",      diaChi:"Nà Bay",    sdt:"0353839713", cccd:"017xxxxxxx", dienTich:0.3, soVuon:1, namThamGia:2022, tongKLDaGiao:42.0,  diemCL:78, ghiChu:"" },
  { id:"23", maHo:"NB013", tenHo:"Triệu Văn Cường",  diaChi:"Nà Bay",    sdt:"",           cccd:"",           dienTich:0.5, soVuon:1, namThamGia:2023, tongKLDaGiao:85.7,  diemCL:91, ghiChu:"Mới hợp tác 2023" },
  { id:"24", maHo:"BC001", tenHo:"Hoàng Phúc Khôi",  diaChi:"Bản Chang", sdt:"0333770931", cccd:"017xxxxxxx", dienTich:0.6, soVuon:1, namThamGia:2021, tongKLDaGiao:98.0,  diemCL:85, ghiChu:"" },
  { id:"25", maHo:"BC002", tenHo:"Triệu Văn Dựng",   diaChi:"Bản Chang", sdt:"0343233785", cccd:"017xxxxxxx", dienTich:2.0, soVuon:2, namThamGia:2020, tongKLDaGiao:380.0, diemCL:88, ghiChu:"Vùng Bản Chang tiềm năng" },
  { id:"26", maHo:"BC003", tenHo:"Hoàng Văn Mỹ",     diaChi:"Bản Chang", sdt:"",           cccd:"",           dienTich:0.5, soVuon:1, namThamGia:2023, tongKLDaGiao:29.0,  diemCL:76, ghiChu:"Chưa đủ hồ sơ" },
];

function starCount(diem: number) {
  if (diem >= 90) return 3; if (diem >= 80) return 2; return 1;
}

let _nid = 500;
const genId = () => String(++_nid);

export default function FarmersPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"danh-sach" | "ban-do">("danh-sach");
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [sortKey, setSortKey] = useState("maHo");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [farmers, setFarmers] = useState<Farmer[]>(FARMERS);
  const [selected, setSelected] = useState<Farmer | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Farmer | null>(null);
  const [fTen, setFTen] = useState(""); const [fDia, setFDia] = useState("Nà Hồng");
  const [fSdt, setFSdt] = useState(""); const [fDT, setFDT] = useState("0.5");
  const [fNam, setFNam] = useState("2024"); const [fNote, setFNote] = useState("");
  const [fCCCD, setFCCCD] = useState(""); const [fVuon, setFVuon] = useState("1");
  const [fDiemCL, setFDiemCL] = useState("0"); const [fKL, setFKL] = useState("0");
  const [showQR, setShowQR] = useState<string | null>(null);

  const handleSort = (k: string) => { if (sortKey === k) setSortDir(d => d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("asc"); } };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const openCreate = () => {
    setEditTarget(null); setFTen(""); setFDia("Nà Hồng"); setFSdt(""); setFDT("0.5");
    setFNam("2024"); setFNote(""); setFCCCD(""); setFVuon("1"); setFDiemCL("0"); setFKL("0");
    setShowCreate(true);
  };
  const openEdit = (f: Farmer) => {
    setEditTarget(f); setFTen(f.tenHo); setFDia(f.diaChi); setFSdt(f.sdt); setFDT(String(f.dienTich));
    setFNam(String(f.namThamGia)); setFNote(f.ghiChu); setFCCCD(f.cccd); setFVuon(String(f.soVuon));
    setFDiemCL(String(f.diemCL)); setFKL(String(f.tongKLDaGiao));
    setShowCreate(true);
  };
  const handleCreate = () => {
    if (!fTen) return;
    if (editTarget) {
      const updated: Farmer = { ...editTarget, tenHo: fTen, diaChi: fDia, sdt: fSdt, cccd: fCCCD, dienTich: parseFloat(fDT)||0.5, soVuon: parseInt(fVuon)||1, namThamGia: parseInt(fNam)||2024, tongKLDaGiao: parseFloat(fKL)||0, diemCL: parseInt(fDiemCL)||0, ghiChu: fNote };
      setFarmers(prev => prev.map(f => f.id === editTarget.id ? updated : f));
      if (selected?.id === editTarget.id) setSelected(updated);
    } else {
      const vungCode = fDia === "Nà Hồng" ? "NH" : fDia === "Nà Bay" ? "NB" : "BC";
      const existingInZone = farmers.filter(f => f.maHo.startsWith(vungCode)).length;
      const newF: Farmer = { id: genId(), maHo: `${vungCode}${String(existingInZone+1).padStart(3,"0")}`, tenHo: fTen, diaChi: fDia, sdt: fSdt, cccd: fCCCD, dienTich: parseFloat(fDT)||0.5, soVuon: parseInt(fVuon)||1, namThamGia: parseInt(fNam)||2024, tongKLDaGiao: parseFloat(fKL)||0, diemCL: parseInt(fDiemCL)||0, ghiChu: fNote };
      setFarmers(prev => [...prev, newF]);
    }
    setShowCreate(false); setEditTarget(null);
  };
  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa hộ nông dân này?")) return;
    setFarmers(prev => prev.filter(f => f.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleExportExcel = () => {
    exportToExcel(
      [
        { header: "Mã hộ", key: "maHo", width: 10 },
        { header: "Họ và tên", key: "tenHo", width: 22 },
        { header: "Vùng trồng", key: "diaChi", width: 14 },
        { header: "SĐT", key: "sdt", width: 14 },
        { header: "CCCD", key: "cccd", width: 14 },
        { header: "Diện tích (ha)", key: "dienTich", width: 14 },
        { header: "Số vườn", key: "soVuon", width: 10 },
        { header: "Năm tham gia", key: "namThamGia", width: 14 },
        { header: "KL đã giao (kg)", key: "tongKLDaGiao", width: 16 },
        { header: "Điểm CL (%)", key: "diemCL", width: 12 },
        { header: "Ghi chú", key: "ghiChu", width: 28 },
      ],
      farmers as unknown as Record<string, unknown>[],
      "DanhSachHoDan_HTXHongHa"
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      "Danh Sách Hộ Nông Dân",
      `HTX Hồng Hà · ${farmers.length} hộ liên kết · 3 vùng trồng Shan Tuyết`,
      [
        { header: "Mã hộ", key: "maHo", width: 14 },
        { header: "Họ và tên", key: "tenHo", width: 36 },
        { header: "Vùng", key: "diaChi", width: 20 },
        { header: "SĐT", key: "sdt", width: 24 },
        { header: "DT (ha)", key: "dienTich", width: 14 },
        { header: "KL (kg)", key: "tongKLDaGiao", width: 16 },
        { header: "CL%", key: "diemCL", width: 10 },
        { header: "Ghi chú", key: "ghiChu", width: 36 },
      ],
      farmers as unknown as Record<string, unknown>[],
      "DanhSachHoDan_HTXHongHa"
    );
  };

  const filtered = useMemo(() => {
    let data = farmers;
    if (search) { const q = search.toLowerCase(); data = data.filter(f => f.tenHo.toLowerCase().includes(q) || f.maHo.toLowerCase().includes(q) || f.sdt.includes(q)); }
    if (zoneFilter) data = data.filter(f => f.diaChi === zoneFilter);
    return [...data].sort((a, b) => {
      const av = (a as Record<string,unknown>)[sortKey]; const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av-bv : bv-av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [farmers, search, zoneFilter, sortKey, sortDir]);

  const totalDT = farmers.reduce((s, f) => s + f.dienTich, 0);
  const totalKL = farmers.reduce((s, f) => s + f.tongKLDaGiao, 0);
  const avgCL   = Math.round(farmers.filter(f=>f.diemCL>0).reduce((s,f)=>s+f.diemCL, 0) / farmers.filter(f=>f.diemCL>0).length);

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Quản lý Hộ dân</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · {farmers.length} hộ liên kết · 3 vùng trồng Shan Tuyết</p></div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Thêm hộ</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users,     label: "Tổng hộ liên kết", value: `${farmers.length} hộ`,          sub: "3 vùng trồng",       color:"text-blue-600 bg-blue-50" },
          { icon: Leaf,      label: "Tổng diện tích",   value: `${totalDT.toFixed(1)} ha`,       sub: "Chè Shan Tuyết",     color:"text-emerald-600 bg-emerald-50" },
          { icon: TrendingUp,label: "KL đã giao",       value: `${(totalKL/1000).toFixed(1)} t`, sub: "tích lũy toàn kỳ",   color:"text-violet-600 bg-violet-50" },
          { icon: Star,      label: "CL trung bình",    value: `${avgCL}%`,                      sub: "điểm chất lượng",    color:"text-amber-600 bg-amber-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên, mã hộ, SĐT..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-white" /></div>
        <select value={zoneFilter} onChange={e=>setZoneFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary"><option value="">Tất cả vùng</option>{["Nà Hồng","Nà Bay","Bản Chang"].map(z=><option key={z} value={z}>{z}</option>)}</select>
        <select value={sortKey} onChange={e=>setSortKey(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="maHo">Sắp xếp: Mã hộ</option><option value="tongKLDaGiao">KL đã giao</option><option value="diemCL">Điểm CL</option><option value="dienTich">Diện tích</option>
        </select>
        <button onClick={()=>setSortDir(d=>d==="asc"?"desc":"asc")} className="p-2 border border-border rounded-xl bg-white hover:bg-muted/40">{sortDir==="asc"?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}</button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(f => {
          const stars = starCount(f.diemCL);
          return (
            <div key={f.id} className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer" onClick={()=>setSelected(f)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
                  <div><p className="font-semibold text-sm">{f.tenHo}</p><span className="font-mono text-xs text-muted-foreground">{f.maHo}</span></div>
                </div>
                <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${AREA_COLORS[f.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{f.diaChi}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3].map(s => <Star key={s} className={`w-3 h-3 ${s <= stars ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />)}
                {f.diemCL > 0 && <span className="text-xs text-muted-foreground ml-1">{f.diemCL}% CL</span>}
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {f.sdt && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{f.sdt}</div>}
                <div className="flex items-center gap-1.5"><Leaf className="w-3 h-3" />{f.dienTich} ha · {f.soVuon} vùng trồng</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />Tham gia từ {f.namThamGia}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tổng KL đã giao</span>
                <span className="text-xs font-bold text-emerald-700">{f.tongKLDaGiao.toFixed(1)} kg</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">{filtered.length} / {farmers.length} hộ</p>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maHo}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.diaChi} · {selected.dienTich} ha</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-6 h-6 text-primary" /></div>
                <div>
                  <p className="text-lg font-bold">{selected.tenHo}</p>
                  <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${AREA_COLORS[selected.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{selected.diaChi}</span>
                  <div className="flex items-center gap-0.5 mt-1">{[1,2,3].map(s=><Star key={s} className={`w-3.5 h-3.5 ${s<=starCount(selected.diemCL)?"text-amber-500 fill-amber-500":"text-muted-foreground"}`} />)}<span className="text-xs text-muted-foreground ml-1">{selected.diemCL}% chất lượng</span></div>
                </div>
              </div>

              {/* QR code placeholder */}
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 flex flex-col items-center gap-2 bg-primary/5 cursor-pointer" onClick={()=>setShowQR(selected.maHo)}>
                <QrCode className="w-10 h-10 text-primary/50" />
                <p className="text-xs font-semibold text-primary/70">QR Code nông hộ</p>
                <p className="font-mono text-xs text-muted-foreground">{selected.maHo}</p>
                <p className="text-xs text-muted-foreground text-center">Click để xem / in QR dùng cho Scan khi thu mua thực địa</p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[{l:"SĐT",v:selected.sdt||"—"},{l:"CCCD",v:selected.cccd||"—"},{l:"Diện tích",v:`${selected.dienTich} ha`},{l:"Số vùng",v:`${selected.soVuon} vùng`},{l:"Tham gia từ",v:String(selected.namThamGia)},{l:"Kinh nghiệm",v:`${2026-selected.namThamGia} năm`}].map((r,i)=>(
                    <div key={i}><p className="text-xs text-muted-foreground">{r.l}</p><p className="font-medium">{r.v}</p></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Tổng KL đã giao</p><p className="text-xl font-bold text-emerald-700">{selected.tongKLDaGiao}</p><p className="text-xs text-muted-foreground">kg</p></div>
                <div className="bg-amber-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Điểm chất lượng</p><p className="text-xl font-bold text-amber-700">{selected.diemCL || "—"}</p><p className="text-xs text-muted-foreground">% avg</p></div>
              </div>

              {selected.ghiChu && <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Ghi chú</p><p className="text-sm italic mt-0.5">{selected.ghiChu}</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50"><QrCode className="w-3.5 h-3.5" /> In QR</button>
              <button onClick={()=>{setSelected(null); openEdit(selected);}} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm hover:bg-primary/20"><Pencil className="w-3.5 h-3.5" /> Sửa</button>
              <button onClick={()=>handleDelete(selected.id)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      {/* QR modal */}
      {showQR && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setShowQR(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
            <button onClick={()=>setShowQR(null)} className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            <QrCode className="w-32 h-32 mx-auto text-primary/80 mb-4" />
            <p className="font-mono text-lg font-bold text-primary">{showQR}</p>
            <p className="text-xs text-muted-foreground mt-1">Mã QR nông hộ · HTX Hồng Hà</p>
            <p className="text-xs text-muted-foreground mt-3 bg-muted/20 rounded-lg px-3 py-2">Dùng để scan khi thu mua tại thực địa — tự động điền thông tin nông hộ vào đơn mua</p>
            <button className="mt-4 w-full py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90">In QR</button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>{setShowCreate(false); setEditTarget(null);}} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">{editTarget ? `Sửa thông tin · ${editTarget.maHo}` : "Thêm hộ nông dân"}</span></div>
              <button onClick={()=>{setShowCreate(false); setEditTarget(null);}} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              <div><label className="block text-xs font-semibold mb-1.5">Họ và tên <span className="text-red-500">*</span></label><input value={fTen} onChange={e=>setFTen(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">Vùng trồng</label><select value={fDia} onChange={e=>setFDia(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{["Nà Hồng","Nà Bay","Bản Chang"].map(z=><option key={z} value={z}>{z}</option>)}</select></div>
                <div><label className="block text-xs font-semibold mb-1.5">SĐT</label><input value={fSdt} onChange={e=>setFSdt(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">CCCD</label><input value={fCCCD} onChange={e=>setFCCCD(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Diện tích (ha)</label><input type="number" value={fDT} onChange={e=>setFDT(e.target.value)} step="0.1" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Số vườn</label><input type="number" value={fVuon} onChange={e=>setFVuon(e.target.value)} min="1" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Năm tham gia</label><input type="number" value={fNam} onChange={e=>setFNam(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                {editTarget && <>
                  <div><label className="block text-xs font-semibold mb-1.5">KL đã giao (kg)</label><input type="number" value={fKL} onChange={e=>setFKL(e.target.value)} step="0.1" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Điểm CL <span className="text-primary font-bold">({fDiemCL}%)</span></label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={()=>setFDiemCL(String(Math.max(0,parseInt(fDiemCL)||0)-1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 text-lg font-bold shrink-0 active:scale-95 transition-transform">−</button>
                      <input type="number" min={0} max={100} value={fDiemCL} onChange={e=>setFDiemCL(String(Math.min(100,Math.max(0,Number(e.target.value)||0))))} className="flex-1 text-center px-2 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                      <button type="button" onClick={()=>setFDiemCL(String(Math.min(100,parseInt(fDiemCL)||0)+1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 text-lg font-bold shrink-0 active:scale-95 transition-transform">+</button>
                    </div>
                  </div>
                </>}
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Ghi chú</label><textarea value={fNote} onChange={e=>setFNote(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none" /></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>{setShowCreate(false); setEditTarget(null);}} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fTen} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2">
                {editTarget ? <><Pencil className="w-4 h-4" /> Lưu thay đổi</> : <><Plus className="w-4 h-4" /> Thêm hộ</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
