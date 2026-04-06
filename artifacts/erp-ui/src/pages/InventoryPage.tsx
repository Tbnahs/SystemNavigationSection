import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, X, Trash2, Eye,
  Package, TrendingDown, TrendingUp, AlertTriangle,
  ChevronDown, ChevronUp, FileSpreadsheet, FileText, Printer,
  Warehouse, ArrowUpDown, Layers, QrCode, MapPin,
} from "lucide-react";

type TonStatus = "binh-thuong" | "sap-het" | "het-hang";
const STATUS_CFG: Record<TonStatus, { label: string; color: string }> = {
  "binh-thuong": { label: "Bình thường", color: "bg-emerald-100 text-emerald-700" },
  "sap-het":     { label: "Sắp hết",    color: "bg-amber-100 text-amber-700" },
  "het-hang":    { label: "Hết hàng",   color: "bg-red-100 text-red-600" },
};

type MoveType = "nhap" | "xuat";
const MOVE_CFG: Record<MoveType, { label: string; color: string; sign: string }> = {
  "nhap": { label: "Nhập kho", color: "text-emerald-700", sign: "+" },
  "xuat": { label: "Xuất kho", color: "text-red-600",     sign: "-" },
};

interface StockItem { id: string; maSP: string; tenSP: string; nhom: string; loai: string; donVi: string; tonDau: number; nhapKho: number; xuatKho: number; tonCuoi: number; donGia: number; trangThai: TonStatus; kho: string; }
interface BatchItem  { id: string; batchId: string; loaiHang: string; maHo: string; tenHo: string; vung: string; ngayNhap: string; soLuong: number; tonCon: number; hanSD: string; }
interface MoveItem   { id: string; maPhieu: string; loai: MoveType; tenHang: string; batchId: string; soLuong: number; donVi: string; ngay: string; lyDo: string; nguoiTao: string; }

const STOCK: StockItem[] = [
  { id:"1",  maSP:"NL-001", tenSP:"Chè búp tươi (tôm)",       nhom:"Nguyên liệu", loai:"Đầu vào", donVi:"kg", tonDau:820,  nhapKho:2640, xuatKho:3100, tonCuoi:360,  donGia:520000,   trangThai:"binh-thuong", kho:"Kho NL" },
  { id:"2",  maSP:"NL-002", tenSP:"Chè búp tươi loại 2",       nhom:"Nguyên liệu", loai:"Đầu vào", donVi:"kg", tonDau:540,  nhapKho:1850, xuatKho:2200, tonCuoi:190,  donGia:28000,    trangThai:"sap-het",     kho:"Kho NL" },
  { id:"3",  maSP:"TP-001", tenSP:"Chè xanh Bằng Phúc",        nhom:"Thành phẩm",  loai:"Chè xanh",donVi:"kg", tonDau:120,  nhapKho:340,  xuatKho:380,  tonCuoi:80,   donGia:420000,   trangThai:"binh-thuong", kho:"Kho TP" },
  { id:"4",  maSP:"TP-002", tenSP:"Hồng trà Shan Tuyết",       nhom:"Thành phẩm",  loai:"Hồng trà",donVi:"kg", tonDau:90,   nhapKho:210,  xuatKho:260,  tonCuoi:40,   donGia:850000,   trangThai:"sap-het",     kho:"Kho TP" },
  { id:"5",  maSP:"TP-003", tenSP:"Bạch trà Shan Tuyết",       nhom:"Thành phẩm",  loai:"Bạch trà",donVi:"kg", tonDau:30,   nhapKho:65,   xuatKho:82,   tonCuoi:13,   donGia:1200000,  trangThai:"sap-het",     kho:"Kho TP" },
  { id:"6",  maSP:"TP-004", tenSP:"Phổ nhĩ Bằng Phúc",        nhom:"Thành phẩm",  loai:"Phổ nhĩ", donVi:"kg", tonDau:25,   nhapKho:40,   xuatKho:55,   tonCuoi:10,   donGia:980000,   trangThai:"sap-het",     kho:"Kho TP" },
  { id:"7",  maSP:"TP-005", tenSP:"Chè Shan đặc biệt cổ thụ",  nhom:"Thành phẩm",  loai:"Đặc biệt",donVi:"kg", tonDau:15,   nhapKho:28,   xuatKho:38,   tonCuoi:5,    donGia:2500000,  trangThai:"sap-het",     kho:"Kho TP" },
  { id:"8",  maSP:"PK-001", tenSP:"Hộp giấy 100g",             nhom:"Bao bì",      loai:"Đóng gói",donVi:"cái",tonDau:2000, nhapKho:5000, xuatKho:4800, tonCuoi:2200, donGia:15000,    trangThai:"binh-thuong", kho:"Kho PK" },
  { id:"9",  maSP:"PK-002", tenSP:"Hộp thiếc 250g",            nhom:"Bao bì",      loai:"Đóng gói",donVi:"cái",tonDau:500,  nhapKho:1000, xuatKho:1420, tonCuoi:80,   donGia:45000,    trangThai:"sap-het",     kho:"Kho PK" },
  { id:"10", maSP:"PK-003", tenSP:"Túi kraft 50g",              nhom:"Bao bì",      loai:"Đóng gói",donVi:"cái",tonDau:3000, nhapKho:8000, xuatKho:9200, tonCuoi:1800, donGia:5000,     trangThai:"binh-thuong", kho:"Kho PK" },
  { id:"11", maSP:"VT-001", tenSP:"Nhiên liệu đốt lò (củi)",   nhom:"Vật tư",      loai:"Vật tư",  donVi:"kg", tonDau:300,  nhapKho:800,  xuatKho:1050, tonCuoi:50,   donGia:3500,     trangThai:"sap-het",     kho:"Kho VT" },
  { id:"12", maSP:"TP-006", tenSP:"Chè xanh hữu cơ (organic)", nhom:"Thành phẩm",  loai:"Chè xanh",donVi:"kg", tonDau:0,    nhapKho:0,    xuatKho:0,    tonCuoi:0,    donGia:680000,   trangThai:"het-hang",    kho:"Kho TP" },
];

const BATCHES: BatchItem[] = [
  { id:"1", batchId:"RAW-NH004-3003", loaiHang:"Chè búp tươi", maHo:"NH004", tenHo:"Triệu Văn Thạo",   vung:"Nà Hồng",   ngayNhap:"30/03/2026", soLuong:13.5, tonCon:0,    hanSD:"30/04/2026" },
  { id:"2", batchId:"RAW-NH008-3103", loaiHang:"Chè búp tươi", maHo:"NH008", tenHo:"Đồng Thị Khuyết", vung:"Nà Hồng",   ngayNhap:"31/03/2026", soLuong:8.5,  tonCon:0,    hanSD:"30/04/2026" },
  { id:"3", batchId:"RAW-NB010-3103", loaiHang:"Chè búp tươi", maHo:"NB010", tenHo:"Mạnh Văn Hồ",     vung:"Nà Bay",    ngayNhap:"31/03/2026", soLuong:2.5,  tonCon:0,    hanSD:"30/04/2026" },
  { id:"4", batchId:"RAW-NB002-0104", loaiHang:"Chè búp tươi", maHo:"NB002", tenHo:"Nông Văn Nghiễm", vung:"Nà Bay",    ngayNhap:"01/04/2026", soLuong:44.0, tonCon:44.0, hanSD:"01/05/2026" },
  { id:"5", batchId:"RAW-NB013-0104", loaiHang:"Chè búp tươi", maHo:"NB013", tenHo:"Triệu Văn Cường", vung:"Nà Bay",    ngayNhap:"01/04/2026", soLuong:50.0, tonCon:50.0, hanSD:"01/05/2026" },
  { id:"6", batchId:"RAW-NB006-0304", loaiHang:"Chè búp tươi", maHo:"NB006", tenHo:"Hoàng Văn Thống", vung:"Nà Bay",    ngayNhap:"03/04/2026", soLuong:49.2, tonCon:49.2, hanSD:"03/05/2026" },
  { id:"7", batchId:"L013003",         loaiHang:"Hồng trà",    maHo:"multi", tenHo:"Nhiều hộ",         vung:"Nà Hồng",   ngayNhap:"30/03/2026", soLuong:5.6,  tonCon:0,    hanSD:"30/09/2026" },
  { id:"8", batchId:"L073103",         loaiHang:"Bạch trà",    maHo:"multi", tenHo:"Nhiều hộ",         vung:"Nà Bay",    ngayNhap:"31/03/2026", soLuong:1.7,  tonCon:0,    hanSD:"31/03/2027" },
  { id:"9", batchId:"L09104",          loaiHang:"Chè xanh",    maHo:"multi", tenHo:"Nhiều hộ",         vung:"Nà Hồng",   ngayNhap:"01/04/2026", soLuong:5.9,  tonCon:3.2,  hanSD:"01/04/2027" },
];

const MOVES: MoveItem[] = [
  { id:"1",  maPhieu:"NK-0001", loai:"nhap", tenHang:"Chè búp tươi (tôm)",    batchId:"RAW-NH004-3003", soLuong:13.5, donVi:"kg",  ngay:"30/03/2026", lyDo:"Mua hàng PO-3003-001", nguoiTao:"Nguyễn A" },
  { id:"2",  maPhieu:"NK-0002", loai:"nhap", tenHang:"Hồng trà",               batchId:"L013003",        soLuong:5.6,  donVi:"kg",  ngay:"30/03/2026", lyDo:"Nhập từ sản xuất",     nguoiTao:"Trần B" },
  { id:"3",  maPhieu:"XK-0001", loai:"xuat", tenHang:"Hồng trà",               batchId:"L013003",        soLuong:5.5,  donVi:"kg",  ngay:"30/03/2026", lyDo:"Đóng gói S013003",     nguoiTao:"Trần B" },
  { id:"4",  maPhieu:"NK-0003", loai:"nhap", tenHang:"Chè búp tươi loại 2",    batchId:"RAW-NH008-3103", soLuong:8.5,  donVi:"kg",  ngay:"31/03/2026", lyDo:"Mua hàng PO-3103-002", nguoiTao:"Nguyễn A" },
  { id:"5",  maPhieu:"NK-0004", loai:"nhap", tenHang:"Bạch trà",               batchId:"L073103",        soLuong:1.7,  donVi:"kg",  ngay:"31/03/2026", lyDo:"Nhập từ sản xuất",     nguoiTao:"Trần B" },
  { id:"6",  maPhieu:"XK-0002", loai:"xuat", tenHang:"Bạch trà",               batchId:"L073103",        soLuong:1.65, donVi:"kg",  ngay:"31/03/2026", lyDo:"Đóng gói S073103",     nguoiTao:"Trần B" },
  { id:"7",  maPhieu:"NK-0005", loai:"nhap", tenHang:"Chè búp tươi (tôm)",    batchId:"RAW-NB002-0104", soLuong:44.0, donVi:"kg",  ngay:"01/04/2026", lyDo:"Mua hàng PO-0104-004", nguoiTao:"Nguyễn A" },
  { id:"8",  maPhieu:"NK-0006", loai:"nhap", tenHang:"Chè xanh",               batchId:"L09104",         soLuong:5.9,  donVi:"kg",  ngay:"01/04/2026", lyDo:"Nhập từ sản xuất",     nguoiTao:"Trần B" },
  { id:"9",  maPhieu:"XK-0003", loai:"xuat", tenHang:"Chè búp tươi",           batchId:"RAW-NB013-0104", soLuong:50.0, donVi:"kg",  ngay:"03/04/2026", lyDo:"Xuất cho sản xuất",    nguoiTao:"Nguyễn A" },
  { id:"10", maPhieu:"XK-0004", loai:"xuat", tenHang:"Chè xanh",               batchId:"L09104",         soLuong:2.7,  donVi:"kg",  ngay:"03/04/2026", lyDo:"Xuất theo đơn ĐH-001", nguoiTao:"Trần B" },
];

function fmtMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN");
}
const AREA_COLORS: Record<string, string> = {
  "Nà Hồng":   "bg-emerald-100 text-emerald-700",
  "Nà Bay":    "bg-blue-100 text-blue-700",
  "Bản Chang": "bg-amber-100 text-amber-700",
};

let _nid = 400;
const genId = () => String(++_nid);

export default function InventoryPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"ton-kho" | "nhap-xuat" | "batch">("ton-kho");
  const [search, setSearch] = useState("");
  const [nhomFilter, setNhomFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TonStatus | "">("");
  const [moveType, setMoveType] = useState<MoveType | "">("");
  const [sortKey, setSortKey] = useState("maSP");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [stockList, setStockList] = useState<StockItem[]>(STOCK);
  const [batchSearch, setBatchSearch] = useState("");
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [fTen, setFTen] = useState(""); const [fNhom, setFNhom] = useState("Nguyên liệu");
  const [fDonVi, setFDonVi] = useState("kg"); const [fDonGia, setFDonGia] = useState("");
  const [fTonDau, setFTonDau] = useState(""); const [fKho, setFKho] = useState("Kho NL");

  const handleSort = (k: string) => { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("asc"); } };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleCreate = () => {
    if (!fTen) return;
    const nhomMap: Record<string,string> = { "Nguyên liệu": "NL", "Thành phẩm": "TP", "Bao bì": "PK", "Vật tư": "VT" };
    const newItem: StockItem = { id: genId(), maSP: `${nhomMap[fNhom] ?? "VT"}-${String(stockList.length+1).padStart(3,"0")}`, tenSP: fTen, nhom: fNhom, loai: fNhom, donVi: fDonVi, tonDau: parseFloat(fTonDau)||0, nhapKho:0, xuatKho:0, tonCuoi: parseFloat(fTonDau)||0, donGia: parseFloat(fDonGia)||0, trangThai:"binh-thuong", kho: fKho };
    setStockList(prev => [...prev, newItem]);
    setShowCreate(false); setFTen(""); setFTonDau(""); setFDonGia("");
  };
  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa mặt hàng?")) return;
    setStockList(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filteredStock = useMemo(() => {
    let data = stockList;
    if (search) { const q = search.toLowerCase(); data = data.filter(r => r.maSP.toLowerCase().includes(q) || r.tenSP.toLowerCase().includes(q)); }
    if (nhomFilter) data = data.filter(r => r.nhom === nhomFilter);
    if (statusFilter) data = data.filter(r => r.trangThai === statusFilter);
    return [...data].sort((a,b) => {
      const av = (a as Record<string,unknown>)[sortKey]; const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av-bv : bv-av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [stockList, search, nhomFilter, statusFilter, sortKey, sortDir]);

  const filteredBatch = useMemo(() => {
    if (!batchSearch) return BATCHES;
    const q = batchSearch.toLowerCase();
    return BATCHES.filter(b => b.batchId.toLowerCase().includes(q) || b.tenHo.toLowerCase().includes(q) || b.vung.toLowerCase().includes(q));
  }, [batchSearch]);

  const filteredMoves = useMemo(() => {
    let data = MOVES;
    if (moveType) data = data.filter(m => m.loai === moveType);
    if (search) { const q = search.toLowerCase(); data = data.filter(m => m.maPhieu.toLowerCase().includes(q) || m.tenHang.toLowerCase().includes(q)); }
    return data;
  }, [MOVES, moveType, search]);

  const totalTon  = stockList.filter(s => s.nhom === "Thành phẩm").reduce((s,r) => s + r.tonCuoi, 0);
  const sapHet    = stockList.filter(s => s.trangThai === "sap-het").length;
  const hetHang   = stockList.filter(s => s.trangThai === "het-hang").length;
  const totalVal  = stockList.reduce((s,r) => s + r.tonCuoi * r.donGia, 0);

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Quản lý Kho hàng</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Nhập kho → Lưu batch → Xuất kho → Kiểm kê</p></div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Thêm hàng</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Package,       label: "Tồn thành phẩm", value: `${totalTon.toFixed(1)} kg`,       sub: "sẵn sàng xuất",    color:"text-emerald-600 bg-emerald-50" },
          { icon: Warehouse,     label: "Giá trị kho",    value: fmtMoney(totalVal)+" tr",           sub: "toàn bộ hàng tồn", color:"text-blue-600 bg-blue-50" },
          { icon: AlertTriangle, label: "Sắp hết hàng",   value: `${sapHet} mặt hàng`,              sub: "cần nhập thêm",    color:"text-amber-600 bg-amber-50" },
          { icon: TrendingDown,  label: "Hết hàng",        value: `${hetHang} mặt hàng`,             sub: "cần đặt hàng",     color:"text-red-600 bg-red-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[
          { key:"ton-kho",  label:"Tồn kho",     count: stockList.length },
          { key:"nhap-xuat",label:"Nhập / Xuất",  count: MOVES.length },
          { key:"batch",    label:"Batch tracker", count: BATCHES.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}<span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab === tab.key ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tồn kho tab */}
      {activeTab === "ton-kho" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã, tên hàng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <select value={nhomFilter} onChange={e=>setNhomFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả nhóm</option>{["Nguyên liệu","Thành phẩm","Bao bì","Vật tư"].map(n=><option key={n} value={n}>{n}</option>)}</select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as TonStatus|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả TT</option>{Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
            <button onClick={()=>{setSearch("");setNhomFilter("");setStatusFilter("");}} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50"><Filter className="w-3.5 h-3.5" /> Lọc</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {[{k:"maSP",l:"Mã SP"},{k:"tenSP",l:"Tên hàng"},{k:"nhom",l:"Nhóm"},{k:"kho",l:"Kho"},{k:"tonDau",l:"Tồn đầu"},{k:"nhapKho",l:"Nhập"},{k:"xuatKho",l:"Xuất"},{k:"tonCuoi",l:"Tồn cuối"},{k:"trangThai",l:"TT"}].map(col=>(
                  <th key={col.k} onClick={()=>handleSort(col.k)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.l} <SortIcon col={col.k} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr></thead>
              <tbody>
                {filteredStock.map(s => {
                  const st = STATUS_CFG[s.trangThai];
                  return (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(s)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{s.maSP}</span></td>
                      <td className="py-3 px-4"><p className="font-medium text-sm">{s.tenSP}</p><p className="text-xs text-muted-foreground">{s.donVi}</p></td>
                      <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s.nhom}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{s.kho}</td>
                      <td className="py-3 px-4 text-sm">{s.tonDau}</td>
                      <td className="py-3 px-4"><span className="text-emerald-700 font-semibold text-sm">+{s.nhapKho}</span></td>
                      <td className="py-3 px-4"><span className="text-red-600 font-semibold text-sm">-{s.xuatKho}</span></td>
                      <td className="py-3 px-4"><span className={`font-bold text-sm ${s.tonCuoi === 0 ? "text-red-600" : s.tonCuoi <= s.tonDau * 0.2 ? "text-amber-700" : "text-foreground"}`}>{s.tonCuoi} {s.donVi}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span></td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={()=>setSelected(s)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>handleDelete(s.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filteredStock.length} mặt hàng</p>
            <p className="text-xs font-semibold">Giá trị: {fmtMoney(filteredStock.reduce((s,r)=>s+r.tonCuoi*r.donGia,0))} tr đ</p>
          </div>
        </div>
      )}

      {/* Nhập/Xuất tab */}
      {activeTab === "nhap-xuat" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã phiếu, tên hàng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <div className="flex gap-1">
              {(["","nhap","xuat"] as (MoveType|"")[]).map(t => (
                <button key={t} onClick={()=>setMoveType(t)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${moveType===t?"bg-primary text-white border-primary":"border-border text-muted-foreground hover:bg-muted/40"}`}>{t===""?"Tất cả":MOVE_CFG[t as MoveType].label}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {["Mã phiếu","Loại","Tên hàng","Batch ID","Số lượng","Ngày","Lý do","Người tạo"].map((h,i)=>(
                  <th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredMoves.map(m => {
                  const mc = MOVE_CFG[m.loai];
                  return (
                    <tr key={m.id} className="border-b border-border/60 hover:bg-muted/20">
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{m.maPhieu}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.loai==="nhap"?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{m.loai==="nhap"?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}{mc.label}</span></td>
                      <td className="py-3 px-4 font-medium text-sm">{m.tenHang}</td>
                      <td className="py-3 px-4"><span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded-md">{m.batchId}</span></td>
                      <td className="py-3 px-4"><span className={`font-bold ${mc.color}`}>{mc.sign}{m.soLuong} {m.donVi}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{m.ngay}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{m.lyDo}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{m.nguoiTao}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filteredMoves.length} phiếu</p>
            <div className="flex gap-4">
              <p className="text-xs font-semibold text-emerald-700">Nhập: {filteredMoves.filter(m=>m.loai==="nhap").reduce((s,m)=>s+m.soLuong,0).toFixed(1)} kg</p>
              <p className="text-xs font-semibold text-red-600">Xuất: {filteredMoves.filter(m=>m.loai==="xuat").reduce((s,m)=>s+m.soLuong,0).toFixed(1)} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch tracker tab */}
      {activeTab === "batch" && (
        <div>
          <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={batchSearch} onChange={e=>setBatchSearch(e.target.value)} placeholder="Tìm batch ID, nông hộ, vùng..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-white" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBatch.map(b => (
              <div key={b.id} className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-mono text-sm font-bold text-primary">{b.batchId}</p><p className="text-xs text-muted-foreground mt-0.5">{b.ngayNhap}</p></div>
                  <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${b.tonCon > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{b.tonCon > 0 ? `Còn ${b.tonCon} kg` : "Đã dùng hết"}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5"><Package className="w-3 h-3 text-muted-foreground" /><span className="text-muted-foreground">Loại:</span> <span className="font-medium">{b.loaiHang}</span></div>
                  <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-muted-foreground" /><span className="text-muted-foreground">Nhập:</span> <span className="font-semibold">{b.soLuong} kg</span></div>
                  {b.maHo !== "multi" && <>
                    <div className="flex items-center gap-1.5"><QrCode className="w-3 h-3 text-muted-foreground" /><span className="font-mono text-primary">{b.maHo}</span> · <span className="font-medium">{b.tenHo}</span></div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-muted-foreground" /><span className={`inline-flex text-xs px-1.5 py-0.5 rounded-md font-medium ${AREA_COLORS[b.vung] ?? "bg-gray-100 text-gray-600"}`}>{b.vung}</span></div>
                  </>}
                  {b.maHo === "multi" && <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-muted-foreground" /><span className="text-muted-foreground">Từ nhiều nông hộ</span></div>}
                </div>
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Hạn sử dụng</span>
                  <span className="text-xs font-semibold">{b.hanSD}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maSP}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.kho} · {selected.nhom}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <p className="font-semibold text-base">{selected.tenSP}</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CFG[selected.trangThai].color}`}>{STATUS_CFG[selected.trangThai].label}</span>
              <div className="grid grid-cols-2 gap-2">
                {[{l:"Tồn đầu",v:`${selected.tonDau} ${selected.donVi}`,c:"text-foreground"},{l:"Đã nhập",v:`+${selected.nhapKho}`,c:"text-emerald-700"},{l:"Đã xuất",v:`-${selected.xuatKho}`,c:"text-red-600"},{l:"Tồn cuối",v:`${selected.tonCuoi} ${selected.donVi}`,c:"font-bold text-foreground"}].map((i,n)=>(
                  <div key={n} className="bg-muted/20 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{i.l}</p><p className={`text-lg font-bold ${i.c}`}>{i.v}</p></div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-muted/20 rounded-xl"><span className="text-sm text-muted-foreground">Đơn giá</span><span className="font-bold text-primary">{selected.donGia.toLocaleString("vi-VN")} đ/{selected.donVi}</span></div>
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200"><span className="text-sm text-muted-foreground">Giá trị tồn kho</span><span className="font-bold text-emerald-700">{fmtMoney(selected.tonCuoi * selected.donGia)} tr đ</span></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
              <button onClick={()=>handleDelete(selected.id)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /> Xóa mặt hàng</button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><Package className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Thêm mặt hàng mới</span></div>
              <button onClick={()=>setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Tên hàng <span className="text-red-500">*</span></label><input value={fTen} onChange={e=>setFTen(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">Nhóm hàng</label><select value={fNhom} onChange={e=>setFNhom(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{["Nguyên liệu","Thành phẩm","Bao bì","Vật tư"].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
                <div><label className="block text-xs font-semibold mb-1.5">Đơn vị</label><select value={fDonVi} onChange={e=>setFDonVi(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{["kg","cái","tờ","lít"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                <div><label className="block text-xs font-semibold mb-1.5">Tồn ban đầu</label><input type="number" value={fTonDau} onChange={e=>setFTonDau(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Đơn giá (đ)</label><input type="number" value={fDonGia} onChange={e=>setFDonGia(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Kho lưu trữ</label><select value={fKho} onChange={e=>setFKho(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{["Kho NL","Kho TP","Kho PK","Kho VT"].map(k=><option key={k} value={k}>{k}</option>)}</select></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fTen} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Thêm</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
