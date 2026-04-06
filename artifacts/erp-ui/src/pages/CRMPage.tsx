import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, ChevronUp, Users, Star, TrendingUp, MapPin,
  Phone, Mail, X, Building2, User, Eye, Trash2,
  ShoppingCart, Clock, CheckCircle2,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

type LoaiKH = "doanh-nghiep" | "ca-nhan" | "hop-tac-xa";
type HangKH = "vang" | "bac" | "dong" | "moi";

interface KhachHang {
  id: string; maKH: string; tenKH: string; loai: LoaiKH; hang: HangKH;
  diaChi: string; sdt: string; email: string; tongMua: number; soLanMua: number;
  ngayMuaCuoi: string; ghiChu: string; loaiKH: string;
}

const HANG_CFG = {
  "vang": { label: "Vàng",  color: "bg-yellow-100 text-yellow-700",  stars: 3 },
  "bac":  { label: "Bạc",   color: "bg-gray-100   text-gray-600",    stars: 2 },
  "dong": { label: "Đồng",  color: "bg-orange-100 text-orange-700",  stars: 1 },
  "moi":  { label: "Mới",   color: "bg-blue-100   text-blue-600",    stars: 0 },
};
const LOAI_CFG = {
  "doanh-nghiep": { label: "Doanh nghiệp", icon: Building2 },
  "ca-nhan":      { label: "Cá nhân",      icon: User },
  "hop-tac-xa":   { label: "Hợp tác xã",  icon: Users },
};

const KH_DATA: KhachHang[] = [
  { id:"1",  maKH:"KH-001", tenKH:"Cty TNHH Trà Thái Nguyên",       loai:"doanh-nghiep", hang:"vang", diaChi:"TP. Thái Nguyên",        sdt:"0208 3856 123", email:"contact@trathainuyen.vn",  tongMua:186000000, soLanMua:9, ngayMuaCuoi:"2026-03-26", ghiChu:"Đối tác lâu năm, ưu tiên giao hàng", loaiKH:"Đại lý" },
  { id:"2",  maKH:"KH-002", tenKH:"HTX Chè Tân Cương",               loai:"hop-tac-xa",   hang:"vang", diaChi:"Tân Cương, Thái Nguyên", sdt:"0208 3777 456", email:"tantuong@htxche.vn",       tongMua:145000000, soLanMua:7, ngayMuaCuoi:"2026-03-28", ghiChu:"Nhận hàng định kỳ hàng tháng",       loaiKH:"Đại lý" },
  { id:"3",  maKH:"KH-003", tenKH:"Cty CP XNK Hà Nội",               loai:"doanh-nghiep", hang:"vang", diaChi:"Hà Nội",                 sdt:"024 3825 6789", email:"xnk@hanoi-trade.vn",       tongMua:220000000, soLanMua:5, ngayMuaCuoi:"2026-04-01", ghiChu:"Xuất khẩu, cần giấy OCOP + xuất xứ", loaiKH:"Xuất khẩu" },
  { id:"4",  maKH:"KH-004", tenKH:"Siêu thị Lotte Mart Hà Nội",     loai:"doanh-nghiep", hang:"bac",  diaChi:"Đống Đa, Hà Nội",       sdt:"024 3562 7890", email:"procurement@lotte.vn",     tongMua:78000000,  soLanMua:4, ngayMuaCuoi:"2026-04-02", ghiChu:"Đóng gói hộp quà tặng, dán nhãn",   loaiKH:"Siêu thị" },
  { id:"5",  maKH:"KH-005", tenKH:"Nhà phân phối Hoàng Phát",       loai:"doanh-nghiep", hang:"bac",  diaChi:"Bắc Giang",              sdt:"0204 3987 654", email:"hoangphat@gmail.com",      tongMua:95000000,  soLanMua:3, ngayMuaCuoi:"2026-04-03", ghiChu:"Phân phối vùng Đông Bắc",            loaiKH:"Đại lý" },
  { id:"6",  maKH:"KH-006", tenKH:"Khách sạn Mường Thanh Hà Giang", loai:"doanh-nghiep", hang:"bac",  diaChi:"Hà Giang",               sdt:"0219 3851 234", email:"fb@muongthanh-hagiang.vn", tongMua:42000000,  soLanMua:6, ngayMuaCuoi:"2026-03-15", ghiChu:"Chè pha sẵn cho khách lưu trú",      loaiKH:"Lẻ" },
  { id:"7",  maKH:"KH-007", tenKH:"Cty TNHH Thực phẩm Sao Việt",   loai:"doanh-nghiep", hang:"bac",  diaChi:"TP.HCM",                 sdt:"028 3823 4567", email:"saoviet@food.vn",          tongMua:67000000,  soLanMua:4, ngayMuaCuoi:"2026-03-20", ghiChu:"Nguyên liệu cho dòng RTD",           loaiKH:"Đại lý" },
  { id:"8",  maKH:"KH-008", tenKH:"Quán trà Sen – Đỗ Thị Mai",     loai:"ca-nhan",      hang:"dong", diaChi:"Quận 1, TP.HCM",         sdt:"090 3456 789",  email:"tranMai@gmail.com",        tongMua:12000000,  soLanMua:3, ngayMuaCuoi:"2026-04-03", ghiChu:"Khách hàng mới, tiềm năng",          loaiKH:"Lẻ" },
  { id:"9",  maKH:"KH-009", tenKH:"Trần Văn Đức (cá nhân)",         loai:"ca-nhan",      hang:"dong", diaChi:"Hải Phòng",              sdt:"031 3512 9876", email:"tranvanduc@gmail.com",     tongMua:8500000,   soLanMua:2, ngayMuaCuoi:"2026-03-10", ghiChu:"Mua quà tặng",                       loaiKH:"Lẻ" },
  { id:"10", maKH:"KH-010", tenKH:"Cửa hàng đặc sản Bắc Kạn",      loai:"ca-nhan",      hang:"dong", diaChi:"TP. Bắc Kạn",            sdt:"0209 3831 456", email:"dacsan.bk@gmail.com",      tongMua:25000000,  soLanMua:5, ngayMuaCuoi:"2026-03-18", ghiChu:"Bán lẻ tại cửa hàng đặc sản",       loaiKH:"Lẻ" },
  { id:"11", maKH:"KH-011", tenKH:"Thư Trà – Nguyễn Thị Hồng",     loai:"ca-nhan",      hang:"moi",  diaChi:"Hà Nội",                 sdt:"098 7654 321",  email:"thutrahong@gmail.com",     tongMua:3800000,   soLanMua:1, ngayMuaCuoi:"2026-04-03", ghiChu:"Đơn đầu tiên",                       loaiKH:"Lẻ" },
  { id:"12", maKH:"KH-012", tenKH:"Cty CP Thực phẩm Organic Việt", loai:"doanh-nghiep", hang:"moi",  diaChi:"Đà Nẵng",                sdt:"0236 3851 234", email:"organic@ovfood.vn",        tongMua:0,         soLanMua:0, ngayMuaCuoi:"-",          ghiChu:"Đang đàm phán",                      loaiKH:"Xuất khẩu" },
];

function fmtMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + " tr đ";
  return v.toLocaleString("vi-VN") + " đ";
}

const ORDERS_SAMPLE = [
  { don: "ĐH-2604-001", ngay:"26/03/2026", sp:"Chè xanh 50kg + Hồng trà 20kg", tien:23000000, tt:"Hoàn thành" },
  { don: "ĐH-2804-002", ngay:"28/03/2026", sp:"Hồng trà Shan 30kg",             tien:21000000, tt:"Hoàn thành" },
  { don: "ĐH-0104-003", ngay:"01/04/2026", sp:"Bạch trà đặc biệt 15kg",         tien:18000000, tt:"Đang giao" },
];

let _nid = 600;
const genId = () => String(++_nid);

export default function CRMPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"khach-hang" | "giao-dich">("khach-hang");
  const [search, setSearch] = useState("");
  const [hangFilter, setHangFilter] = useState<HangKH | "">("");
  const [loaiFilter, setLoaiFilter] = useState<LoaiKH | "">("");
  const [sortKey, setSortKey] = useState("tongMua");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [khList, setKhList] = useState<KhachHang[]>(KH_DATA);
  const [selected, setSelected] = useState<KhachHang | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [fTen, setFTen] = useState(""); const [fLoai, setFLoai] = useState<LoaiKH>("doanh-nghiep");
  const [fDia, setFDia] = useState(""); const [fSdt, setFSdt] = useState("");
  const [fEmail, setFEmail] = useState(""); const [fNote, setFNote] = useState("");

  const handleSort = (k: string) => { if (sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("desc"); } };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleCreate = () => {
    if (!fTen) return;
    const newKH: KhachHang = { id: genId(), maKH: `KH-${String(khList.length+1).padStart(3,"0")}`, tenKH: fTen, loai: fLoai, hang: "moi", diaChi: fDia, sdt: fSdt, email: fEmail, tongMua: 0, soLanMua: 0, ngayMuaCuoi: "-", ghiChu: fNote, loaiKH: "Lẻ" };
    setKhList(prev => [...prev, newKH]);
    setShowCreate(false); setFTen(""); setFDia(""); setFSdt(""); setFEmail(""); setFNote("");
  };
  const handleExportExcel = () => exportToExcel(
    [
      { header: "Mã KH", key: "maKH", width: 12 },
      { header: "Tên khách hàng", key: "tenKH", width: 30 },
      { header: "Loại", key: "loai", width: 16 },
      { header: "Hạng", key: "hang", width: 10 },
      { header: "Địa chỉ", key: "diaChi", width: 28 },
      { header: "SĐT", key: "sdt", width: 16 },
      { header: "Email", key: "email", width: 28 },
      { header: "Tổng mua (đ)", key: "tongMua", width: 18 },
      { header: "Số lần mua", key: "soLanMua", width: 14 },
      { header: "Ngày mua cuối", key: "ngayMuaCuoi", width: 16 },
    ],
    khList as unknown as Record<string, unknown>[],
    "KhachHang_HTXHongHa"
  );

  const handleExportPDF = () => exportToPDF(
    "Danh sách Khách hàng",
    `HTX Hồng Hà · ${khList.length} khách hàng`,
    [
      { header: "Mã KH", key: "maKH", width: 16 },
      { header: "Tên khách hàng", key: "tenKH", width: 40 },
      { header: "Loại", key: "loai", width: 20 },
      { header: "Hạng", key: "hang", width: 14 },
      { header: "SĐT", key: "sdt", width: 22 },
      { header: "Tổng mua (đ)", key: "tongMua", width: 22 },
      { header: "Số lần mua", key: "soLanMua", width: 16 },
    ],
    khList as unknown as Record<string, unknown>[],
    "KhachHang_HTXHongHa"
  );

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa khách hàng này?")) return;
    setKhList(prev => prev.filter(k => k.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = useMemo(() => {
    let data = khList;
    if (search) { const q = search.toLowerCase(); data = data.filter(k => k.tenKH.toLowerCase().includes(q) || k.maKH.toLowerCase().includes(q) || k.sdt.includes(q)); }
    if (hangFilter) data = data.filter(k => k.hang === hangFilter);
    if (loaiFilter) data = data.filter(k => k.loai === loaiFilter);
    return [...data].sort((a,b) => {
      const av = (a as Record<string,unknown>)[sortKey]; const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir==="asc"?av-bv:bv-av;
      return sortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
    });
  }, [khList, search, hangFilter, loaiFilter, sortKey, sortDir]);

  const totalRevenue = khList.reduce((s,k) => s+k.tongMua, 0);
  const vangCount    = khList.filter(k=>k.hang==="vang").length;
  const newCount     = khList.filter(k=>k.hang==="moi").length;

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Quản lý Khách hàng (CRM)</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Tạo KH → Giao dịch → Theo dõi → Phân hạng</p></div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Thêm KH</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users,     label: "Tổng khách hàng", value: `${khList.length} KH`,              sub: "đang hợp tác",     color:"text-blue-600 bg-blue-50" },
          { icon: TrendingUp,label: "Doanh thu",        value: (totalRevenue/1e6).toFixed(0)+" tr",sub: "tổng tích lũy",    color:"text-emerald-600 bg-emerald-50" },
          { icon: Star,      label: "Khách hàng Vàng",  value: `${vangCount} KH`,                 sub: "doanh thu cao nhất",color:"text-amber-600 bg-amber-50" },
          { icon: Clock,     label: "Khách mới",         value: `${newCount} KH`,                  sub: "cần chăm sóc",     color:"text-violet-600 bg-violet-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[{key:"khach-hang",label:"Khách hàng",count:khList.length},{key:"giao-dich",label:"Giao dịch gần đây",count:ORDERS_SAMPLE.length}].map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab===tab.key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}<span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab===tab.key?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === "khach-hang" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên, mã KH, SĐT..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <select value={hangFilter} onChange={e=>setHangFilter(e.target.value as HangKH|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả hạng</option>{Object.entries(HANG_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
            <select value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value as LoaiKH|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background"><option value="">Tất cả loại</option>{Object.entries(LOAI_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
            <button onClick={()=>{setSearch("");setHangFilter("");setLoaiFilter("");}} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50"><Filter className="w-3.5 h-3.5" /> Lọc</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {[{k:"maKH",l:"Mã KH"},{k:"tenKH",l:"Tên khách hàng"},{k:"loaiKH",l:"Loại"},{k:"diaChi",l:"Địa chỉ"},{k:"sdt",l:"SĐT"},{k:"soLanMua",l:"Số đơn"},{k:"tongMua",l:"Doanh thu"}].map(col=>(
                  <th key={col.k} onClick={()=>handleSort(col.k)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.l} <SortIcon col={col.k} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr></thead>
              <tbody>
                {filtered.map(k => {
                  const hc = HANG_CFG[k.hang]; const lc = LOAI_CFG[k.loai]; const Icon = lc.icon;
                  return (
                    <tr key={k.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(k)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{k.maKH}</span></td>
                      <td className="py-3 px-4"><p className="font-medium text-sm">{k.tenKH}</p>{k.email&&<p className="text-xs text-muted-foreground">{k.email}</p>}</td>
                      <td className="py-3 px-4"><span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"><Icon className="w-3 h-3" />{k.loaiKH}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{k.diaChi}</td>
                      <td className="py-3 px-4 text-xs">{k.sdt||"—"}</td>
                      <td className="py-3 px-4 text-sm font-medium">{k.soLanMua}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">{k.tongMua>0?fmtMoney(k.tongMua):"—"}</td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={()=>setSelected(k)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>handleDelete(k.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filtered.length} khách hàng</p>
            <p className="text-xs font-semibold">Tổng DT: {fmtMoney(filtered.reduce((s,k)=>s+k.tongMua,0))}</p>
          </div>
        </div>
      )}

      {activeTab === "giao-dich" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Giao dịch gần đây</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">{["Đơn hàng","Ngày","Sản phẩm","Giá trị","Trạng thái"].map((h,i)=><th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
              <tbody>
                {ORDERS_SAMPLE.map((o,i)=>(
                  <tr key={i} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{o.don}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{o.ngay}</td>
                    <td className="py-3 px-4 text-sm">{o.sp}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{fmtMoney(o.tien)}</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${o.tt==="Hoàn thành"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{o.tt==="Hoàn thành"?<CheckCircle2 className="w-3 h-3"/>:<Clock className="w-3 h-3"/>}{o.tt}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maKH}</span><p className="text-xs text-muted-foreground mt-0.5">{LOAI_CFG[selected.loai].label}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div>
                <p className="text-lg font-bold">{selected.tenKH}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${HANG_CFG[selected.hang].color}`}>{HANG_CFG[selected.hang].label}</span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Liên hệ</p>
                {selected.sdt && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{selected.sdt}</div>}
                {selected.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{selected.email}</div>}
                {selected.diaChi && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{selected.diaChi}</div>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Tổng mua</p><p className="text-xl font-bold text-emerald-700">{(selected.tongMua/1e6).toFixed(0)}</p><p className="text-xs text-muted-foreground">triệu đồng</p></div>
                <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Số đơn</p><p className="text-xl font-bold text-blue-700">{selected.soLanMua}</p><p className="text-xs text-muted-foreground">đơn hàng</p></div>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 rounded-xl"><span className="text-xs text-muted-foreground">Lần mua gần nhất</span><span className="text-sm font-medium">{selected.ngayMuaCuoi}</span></div>
              {selected.ghiChu && <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Ghi chú</p><p className="text-sm italic mt-0.5">{selected.ghiChu}</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50"><ShoppingCart className="w-3.5 h-3.5" /> Tạo đơn hàng</button>
              <button onClick={()=>handleDelete(selected.id)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Thêm khách hàng</span></div><button onClick={()=>setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button></div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Tên khách hàng <span className="text-red-500">*</span></label><input value={fTen} onChange={e=>setFTen(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Loại khách</label><select value={fLoai} onChange={e=>setFLoai(e.target.value as LoaiKH)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{Object.entries(LOAI_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">SĐT</label><input value={fSdt} onChange={e=>setFSdt(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Email</label><input value={fEmail} onChange={e=>setFEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Địa chỉ</label><input value={fDia} onChange={e=>setFDia(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Ghi chú</label><textarea value={fNote} onChange={e=>setFNote(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none" /></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fTen} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Thêm KH</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
