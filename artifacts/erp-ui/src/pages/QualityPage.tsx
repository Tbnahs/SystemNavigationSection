import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter, X, Trash2, Eye,
  CheckCircle2, XCircle, AlertTriangle, Clock, FileText,
  FlaskConical, Package, ChevronDown, ChevronUp, FileSpreadsheet, Printer,
  ShieldCheck, TrendingUp, Layers,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

type QCStage = "dau-vao" | "san-xuat" | "dau-ra";
type QCResult = "pass" | "fail" | "reduce" | "pending";

const STAGE_CFG: Record<QCStage, { label: string; color: string }> = {
  "dau-vao":   { label: "QC Đầu vào",    color: "bg-blue-100 text-blue-700" },
  "san-xuat":  { label: "QC Sản xuất",   color: "bg-amber-100 text-amber-700" },
  "dau-ra":    { label: "QC Đầu ra",     color: "bg-violet-100 text-violet-700" },
};

const RESULT_CFG: Record<QCResult, { label: string; color: string; icon: React.ComponentType<{className?:string}> }> = {
  pending: { label: "Chờ KT",     color: "bg-gray-100 text-gray-600",       icon: Clock },
  pass:    { label: "Đạt",        color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  fail:    { label: "Không đạt",  color: "bg-red-100 text-red-600",         icon: XCircle },
  reduce:  { label: "Giảm giá",   color: "bg-amber-100 text-amber-700",     icon: AlertTriangle },
};

interface QCRecord {
  id: string; maQC: string; stage: QCStage; batchId: string;
  doiTuong: string; loaiChe: string; ngay: string;
  doAm: number; doNon: number; doSach: number; tongDiem: number;
  ketQua: QCResult; donGiaThucTe: number; nguoiKT: string; ghiChu: string;
}

const QC_DATA: QCRecord[] = [
  { id:"1",  maQC:"QC-DV-001", stage:"dau-vao",  batchId:"RAW-NH004-3003", doiTuong:"Triệu Văn Thạo",   loaiChe:"1 tôm 2 lá", ngay:"30/03/2026", doAm:78, doNon:82, doSach:90, tongDiem:78, ketQua:"pass",    donGiaThucTe:27000,  nguoiKT:"Nguyễn A", ghiChu:"" },
  { id:"2",  maQC:"QC-DV-002", stage:"dau-vao",  batchId:"RAW-NH008-3103", doiTuong:"Đồng Thị Khuyết", loaiChe:"1 tôm 2 lá", ngay:"31/03/2026", doAm:83, doNon:87, doSach:92, tongDiem:83, ketQua:"pass",    donGiaThucTe:28500,  nguoiKT:"Nguyễn A", ghiChu:"" },
  { id:"3",  maQC:"QC-DV-003", stage:"dau-vao",  batchId:"RAW-NB010-3103", doiTuong:"Mạnh Văn Hồ",     loaiChe:"1 tôm",      ngay:"31/03/2026", doAm:98, doNon:99, doSach:98, tongDiem:98, ketQua:"pass",    donGiaThucTe:29000,  nguoiKT:"Trần B",   ghiChu:"1 tôm chất lượng cao (90–99%)" },
  { id:"4",  maQC:"QC-DV-004", stage:"dau-vao",  batchId:"RAW-NB002-0104", doiTuong:"Nông Văn Nghiễm", loaiChe:"1 tôm 2 lá", ngay:"01/04/2026", doAm:90, doNon:91, doSach:88, tongDiem:90, ketQua:"pass",    donGiaThucTe:29000,  nguoiKT:"Nguyễn A", ghiChu:"" },
  { id:"5",  maQC:"QC-DV-005", stage:"dau-vao",  batchId:"RAW-NB013-0104", doiTuong:"Triệu Văn Cường", loaiChe:"1 tôm 2 lá", ngay:"01/04/2026", doAm:91, doNon:89, doSach:87, tongDiem:89, ketQua:"pass",    donGiaThucTe:29000,  nguoiKT:"Trần B",   ghiChu:"" },
  { id:"6",  maQC:"QC-DV-006", stage:"dau-vao",  batchId:"RAW-NB006-0304", doiTuong:"Hoàng Văn Thống", loaiChe:"1 tôm 2 lá", ngay:"03/04/2026", doAm:89, doNon:86, doSach:85, tongDiem:87, ketQua:"reduce",  donGiaThucTe:28000,  nguoiKT:"Nguyễn A", ghiChu:"Lẫn lá già" },
  { id:"7",  maQC:"QC-SX-001", stage:"san-xuat", batchId:"L013003",        doiTuong:"Lô Hồng trà 30/3", loaiChe:"Hồng trà",  ngay:"30/03/2026", doAm:92, doNon:88, doSach:95, tongDiem:91, ketQua:"pass",    donGiaThucTe:850000, nguoiKT:"Nguyễn A", ghiChu:"Sau vò+sấy đạt chuẩn" },
  { id:"8",  maQC:"QC-SX-002", stage:"san-xuat", batchId:"L073103",        doiTuong:"Lô Bạch trà 31/3", loaiChe:"Bạch trà",  ngay:"31/03/2026", doAm:95, doNon:96, doSach:97, tongDiem:96, ketQua:"pass",    donGiaThucTe:1200000,nguoiKT:"Trần B",   ghiChu:"Tôm trắng đặc sản" },
  { id:"9",  maQC:"QC-SX-003", stage:"san-xuat", batchId:"L09104",         doiTuong:"Lô Chè xanh 01/4", loaiChe:"Chè xanh",  ngay:"01/04/2026", doAm:88, doNon:85, doSach:90, tongDiem:88, ketQua:"pass",    donGiaThucTe:420000, nguoiKT:"Nguyễn A", ghiChu:"" },
  { id:"10", maQC:"QC-SX-004", stage:"san-xuat", batchId:"L014104",        doiTuong:"Lô Chè xanh 01/4b",loaiChe:"Chè xanh",  ngay:"02/04/2026", doAm:75, doNon:70, doSach:78, tongDiem:74, ketQua:"fail",    donGiaThucTe:0,      nguoiKT:"Trần B",   ghiChu:"Sấy không đều, ẩm cao" },
  { id:"11", maQC:"QC-DR-001", stage:"dau-ra",   batchId:"S013003",        doiTuong:"Hồng trà đóng hộp",loaiChe:"Hồng trà",  ngay:"30/03/2026", doAm:94, doNon:90, doSach:96, tongDiem:93, ketQua:"pass",    donGiaThucTe:850000, nguoiKT:"Nguyễn A", ghiChu:"OCOP 4 sao đạt" },
  { id:"12", maQC:"QC-DR-002", stage:"dau-ra",   batchId:"S073103",        doiTuong:"Bạch trà đặc sản", loaiChe:"Bạch trà",  ngay:"31/03/2026", doAm:97, doNon:98, doSach:98, tongDiem:97, ketQua:"pass",    donGiaThucTe:1200000,nguoiKT:"Trần B",   ghiChu:"Chuẩn xuất khẩu" },
  { id:"13", maQC:"QC-DR-003", stage:"dau-ra",   batchId:"S09104",         doiTuong:"Chè xanh đóng hộp",loaiChe:"Chè xanh",  ngay:"01/04/2026", doAm:0,  doNon:0,  doSach:0,  tongDiem:0,  ketQua:"pending", donGiaThucTe:0,      nguoiKT:"",         ghiChu:"Chờ kiểm tra" },
];

const TIEU_CHUAN = [
  /* ── Tiêu chuẩn từ bảng Quy cách chính thức ── */
  { tieu: "Độ non, già của búp chè",          moTa: "Búp phải non, đúng quy cách được chỉ định (1 tôm / 1 tôm 1 lá / 1 tôm 2 lá / 2 lá). Không hái già, không lẫn búp già đen.",         lv: "high" },
  { tieu: "Độ đồng đều khi thu hái",          moTa: "Búp chè đồng đều về kích cỡ và độ trưởng thành. Không lẫn quy cách, tỷ lệ lẫn không quá 3%.",  lv: "high" },
  { tieu: "Độ chuẩn chỉ khi thu hái",         moTa: "Thu hái đúng kỹ thuật: ngắt sát cuống, không dập nát, không bị oxy hóa trước khi giao. Vận chuyển trong giỏ thoáng.",              lv: "high" },
  /* ── Tiêu chuẩn bổ sung ── */
  { tieu: "Độ ẩm lý tưởng",                   moTa: "70–80% cho QC đầu vào (chè tươi), ≤5% cho thành phẩm đã sấy", lv: "high" },
  { tieu: "Không lẫn tạp chất",               moTa: "Không có đất, đá, cành già, côn trùng. Đánh giá trực quan 100% mẫu", lv: "high" },
  { tieu: "Màu sắc sau chế biến",             moTa: "Hồng trà: nâu đỏ. Bạch trà: trắng xanh. Chè xanh: xanh sẫm",    lv: "med" },
  { tieu: "Hương thơm đặc trưng",             moTa: "Đặc trưng của vùng Shan Tuyết Bằng Phúc, không mốc, không lạ",   lv: "med" },
  { tieu: "Tỷ lệ thu hồi",                    moTa: "Chè xanh/Hồng trà: 22–24%. Bạch trà: 17–18%",                    lv: "low" },
];

let _nid = 300;
const genId = () => String(++_nid);

function fmt(v: number) { return v.toLocaleString("vi-VN"); }

export default function QualityPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<QCStage | "tieu-chuan">("dau-vao");
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<QCResult | "">("");
  const [qcList, setQcList] = useState<QCRecord[]>(QC_DATA);
  const [selected, setSelected] = useState<QCRecord | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [fBatch, setFBatch] = useState(""); const [fDoiTuong, setFDoiTuong] = useState("");
  const [fLoai, setFLoai] = useState("Chè xanh"); const [fNgay, setFNgay] = useState(new Date().toISOString().slice(0,10));
  const [fDoAm, setFDoAm] = useState(85); const [fDoNon, setFDoNon] = useState(85); const [fDoSach, setFDoSach] = useState(90);
  const [fNote, setFNote] = useState(""); const [fStage, setFStage] = useState<QCStage>("dau-vao");

  const calcKQ = (a: number, n: number, s: number): QCResult => {
    const avg = (a + n + s) / 3;
    if (avg >= 85) return "pass"; if (avg >= 70) return "reduce"; return "fail";
  };

  const handleCreate = () => {
    if (!fBatch || !fDoiTuong) return;
    const [y,m,d] = fNgay.split("-");
    const kq = calcKQ(fDoAm, fDoNon, fDoSach);
    const avg = Math.round((fDoAm + fDoNon + fDoSach) / 3);
    const newRec: QCRecord = {
      id: genId(), maQC: `QC-${fStage.toUpperCase().slice(0,2)}-${String(qcList.length+1).padStart(3,"0")}`,
      stage: fStage, batchId: fBatch, doiTuong: fDoiTuong, loaiChe: fLoai,
      ngay: `${d}/${m}/${y}`, doAm: fDoAm, doNon: fDoNon, doSach: fDoSach,
      tongDiem: avg, ketQua: kq, donGiaThucTe: 0, nguoiKT: "Admin", ghiChu: fNote,
    };
    setQcList(prev => [newRec, ...prev]);
    setShowCreate(false); setFBatch(""); setFDoiTuong(""); setFNote("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa phiếu QC này?")) return;
    setQcList(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleExportExcel = () => exportToExcel(
    [
      { header: "Mã QC", key: "maQC", width: 14 },
      { header: "Giai đoạn", key: "stage", width: 14 },
      { header: "Batch ID", key: "batchId", width: 18 },
      { header: "Đối tượng", key: "doiTuong", width: 28 },
      { header: "Loại chè", key: "loaiChe", width: 14 },
      { header: "Ngày KT", key: "ngay", width: 14 },
      { header: "Độ ẩm (%)", key: "doAm", width: 12 },
      { header: "Độ non (%)", key: "doNon", width: 12 },
      { header: "Độ sạch (%)", key: "doSach", width: 12 },
      { header: "Tổng điểm", key: "tongDiem", width: 12 },
      { header: "Kết quả", key: "ketQua", width: 12 },
      { header: "Ghi chú", key: "ghiChu", width: 24 },
    ],
    qcList as unknown as Record<string, unknown>[],
    "KiemTraChatLuong_HTXHongHa"
  );

  const handleExportPDF = () => exportToPDF(
    "Danh sách Phiếu Kiểm tra Chất lượng",
    `HTX Hồng Hà · ${qcList.length} phiếu QC`,
    [
      { header: "Mã QC", key: "maQC", width: 18 },
      { header: "Giai đoạn", key: "stage", width: 18 },
      { header: "Batch ID", key: "batchId", width: 24 },
      { header: "Loại chè", key: "loaiChe", width: 18 },
      { header: "Ngày KT", key: "ngay", width: 16 },
      { header: "Tổng điểm", key: "tongDiem", width: 16 },
      { header: "Kết quả", key: "ketQua", width: 16 },
    ],
    qcList as unknown as Record<string, unknown>[],
    "KiemTraChatLuong_HTXHongHa"
  );

  const tabData = useMemo(() => {
    let data = activeTab === "tieu-chuan" ? [] : qcList.filter(r => r.stage === activeTab);
    if (search) { const q = search.toLowerCase(); data = data.filter(r => r.maQC.toLowerCase().includes(q) || r.batchId.toLowerCase().includes(q) || r.doiTuong.toLowerCase().includes(q)); }
    if (resultFilter) data = data.filter(r => r.ketQua === resultFilter);
    return data;
  }, [qcList, activeTab, search, resultFilter]);

  const passRate = Math.round(qcList.filter(r => r.ketQua === "pass").length / qcList.filter(r => r.ketQua !== "pending").length * 100);
  const pendingCount = qcList.filter(r => r.ketQua === "pending").length;
  const failCount = qcList.filter(r => r.ketQua === "fail").length;

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Quản lý Chất lượng (QC)</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · QC Đầu vào → QC Sản xuất → QC Đầu ra</p></div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Tạo phiếu QC</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: ShieldCheck,   label: "Tỷ lệ đạt",    value: `${isNaN(passRate) ? 0 : passRate}%`,   sub: "tổng phiếu đã KT",     color: "text-emerald-600 bg-emerald-50" },
          { icon: FlaskConical,  label: "Tổng phiếu",   value: `${qcList.length} phiếu`,               sub: "đã kiểm tra",           color: "text-blue-600 bg-blue-50" },
          { icon: Clock,         label: "Chờ KT",        value: `${pendingCount} phiếu`,               sub: "cần kiểm tra",           color: "text-amber-600 bg-amber-50" },
          { icon: XCircle,       label: "Không đạt",    value: `${failCount} phiếu`,                   sub: "cần xử lý",             color: "text-red-600 bg-red-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[
          { key:"dau-vao", label:"QC Đầu vào", count: qcList.filter(r=>r.stage==="dau-vao").length },
          { key:"san-xuat",label:"QC Sản xuất",count: qcList.filter(r=>r.stage==="san-xuat").length },
          { key:"dau-ra",  label:"QC Đầu ra",  count: qcList.filter(r=>r.stage==="dau-ra").length },
          { key:"tieu-chuan",label:"Tiêu chuẩn",count:TIEU_CHUAN.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}<span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab === tab.key ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === "tieu-chuan" ? (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Tiêu chuẩn chất lượng Chè Shan Tuyết Bằng Phúc</p></div>
          <div className="divide-y divide-border">
            {TIEU_CHUAN.map((tc, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/10">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${tc.lv === "high" ? "bg-red-500" : tc.lv === "med" ? "bg-amber-500" : "bg-emerald-500"}`} />
                <div><p className="text-sm font-semibold">{tc.tieu}</p><p className="text-xs text-muted-foreground mt-0.5">{tc.moTa}</p></div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${tc.lv === "high" ? "bg-red-100 text-red-600" : tc.lv === "med" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{tc.lv === "high" ? "Bắt buộc" : tc.lv === "med" ? "Quan trọng" : "Tham khảo"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã QC, batch..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <select value={resultFilter} onChange={e => setResultFilter(e.target.value as QCResult | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Tất cả</option>{Object.entries(RESULT_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={()=>{setSearch("");setResultFilter("");}} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50"><Filter className="w-3.5 h-3.5" /> Lọc</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {["Mã QC","Batch","Đối tượng","Ngày","Độ ẩm","Độ non","Độ sạch","Tổng điểm","Kết quả","Thao tác"].map((h,i) => (
                  <th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {tabData.map(r => {
                  const rc = RESULT_CFG[r.ketQua]; const Ic = rc.icon;
                  return (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(r)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{r.maQC}</span></td>
                      <td className="py-3 px-4"><span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded-md">{r.batchId}</span></td>
                      <td className="py-3 px-4"><p className="font-medium text-sm">{r.doiTuong}</p><p className="text-xs text-muted-foreground">{r.loaiChe}</p></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{r.ngay}</td>
                      <td className="py-3 px-4 text-center text-sm">{r.doAm > 0 ? r.doAm : "—"}</td>
                      <td className="py-3 px-4 text-center text-sm">{r.doNon > 0 ? r.doNon : "—"}</td>
                      <td className="py-3 px-4 text-center text-sm">{r.doSach > 0 ? r.doSach : "—"}</td>
                      <td className="py-3 px-4 text-center"><span className={`font-bold ${r.tongDiem >= 85 ? "text-emerald-700" : r.tongDiem >= 70 ? "text-amber-700" : r.tongDiem > 0 ? "text-red-600" : "text-muted-foreground"}`}>{r.tongDiem > 0 ? r.tongDiem : "—"}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rc.color}`}><Ic className="w-3 h-3" />{rc.label}</span></td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={()=>setSelected(r)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tabData.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có phiếu QC nào</div>}
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{tabData.length} phiếu</p>
            <p className="text-xs font-semibold text-emerald-700">Đạt: {tabData.filter(r=>r.ketQua==="pass").length} · Không đạt: {tabData.filter(r=>r.ketQua==="fail").length}</p>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maQC}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.ngay} · {STAGE_CFG[selected.stage].label}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_CFG[selected.stage].color}`}>{STAGE_CFG[selected.stage].label}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_CFG[selected.ketQua].color}`}>{RESULT_CFG[selected.ketQua].label}</span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Batch</p><p className="font-mono font-semibold text-primary">{selected.batchId}</p></div>
                  <div><p className="text-xs text-muted-foreground">Đối tượng</p><p className="font-medium">{selected.doiTuong}</p></div>
                  <div><p className="text-xs text-muted-foreground">Loại chè</p><p className="font-medium">{selected.loaiChe}</p></div>
                  <div><p className="text-xs text-muted-foreground">Người KT</p><p className="font-medium">{selected.nguoiKT || "—"}</p></div>
                </div>
              </div>
              {/* Batch type + link section */}
              {(() => {
                const isRaw = selected.batchId.startsWith("RAW-");
                const isFG  = selected.batchId.startsWith("FG-") || selected.batchId.startsWith("L") || selected.batchId.startsWith("S");
                const parts = selected.batchId.split("-");
                const maHo  = isRaw && parts.length >= 2 ? parts[1] : null;
                return (
                  <div className={`rounded-xl p-4 border ${isRaw ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${isRaw ? "bg-blue-200 text-blue-800" : "bg-emerald-200 text-emerald-800"}`}>
                        {isRaw ? "RAW Batch" : isFG ? "FG Batch" : "Batch"}
                      </span>
                      <p className="text-xs font-semibold">{isRaw ? "Nguyên liệu tươi đầu vào" : "Thành phẩm sau chế biến"}</p>
                    </div>
                    {isRaw && maHo && (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Nông hộ:</span>
                          <span className="font-mono font-semibold text-primary">{maHo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Vùng:</span>
                          <span className="font-medium">
                            {maHo.startsWith("NH") ? "Nà Hồng" : maHo.startsWith("NB") ? "Nà Bay" : "Bản Chang"}
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-600 mt-1.5">QC này kiểm tra NVL trước khi nhập kho → ảnh hưởng trực tiếp tới giá thu mua</p>
                      </div>
                    )}
                    {!isRaw && (
                      <p className="text-xs text-emerald-700">QC này kiểm tra thành phẩm sau chế biến → quyết định cho phép đóng gói / xuất kho</p>
                    )}
                  </div>
                );
              })()}
              {selected.tongDiem > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {[{label:"Độ ẩm",val:selected.doAm},{label:"Độ non",val:selected.doNon},{label:"Độ sạch",val:selected.doSach}].map((m,i)=>(
                    <div key={i} className="bg-muted/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className={`text-2xl font-bold ${m.val >= 85 ? "text-emerald-700" : m.val >= 70 ? "text-amber-700" : "text-red-600"}`}>{m.val}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Tổng điểm QC</p>
                <p className={`text-3xl font-black ${selected.tongDiem >= 85 ? "text-emerald-700" : selected.tongDiem >= 70 ? "text-amber-700" : selected.tongDiem > 0 ? "text-red-600" : "text-muted-foreground"}`}>{selected.tongDiem > 0 ? selected.tongDiem : "—"}</p>
                {selected.donGiaThucTe > 0 && <p className="text-xs text-emerald-600 mt-1">Đơn giá: {fmt(selected.donGiaThucTe)} đ/kg</p>}
              </div>
              {selected.ghiChu && <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Ghi chú</p><p className="text-sm italic mt-0.5">{selected.ghiChu}</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
              <button onClick={()=>handleDelete(selected.id)} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /> Xóa phiếu</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Tạo phiếu QC mới</span></div>
              <button onClick={()=>setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Giai đoạn QC</label>
                <div className="flex gap-2">{(["dau-vao","san-xuat","dau-ra"] as QCStage[]).map(s=>(
                  <button key={s} onClick={()=>setFStage(s)} className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${fStage===s?"bg-primary/10 border-primary text-primary":"border-border text-muted-foreground hover:bg-muted/40"}`}>{STAGE_CFG[s].label}</button>
                ))}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">Batch ID <span className="text-red-500">*</span></label><input value={fBatch} onChange={e=>setFBatch(e.target.value)} placeholder="RAW-xxx / L01xxx" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Ngày KT</label><input type="date" value={fNgay} onChange={e=>setFNgay(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Đối tượng <span className="text-red-500">*</span></label><input value={fDoiTuong} onChange={e=>setFDoiTuong(e.target.value)} placeholder="Tên nông hộ / lô SX..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Loại chè</label>
                <select value={fLoai} onChange={e=>setFLoai(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
                  {["Chè xanh","Hồng trà","Bạch trà","1 tôm 2 lá","1 tôm","Phổ nhĩ"].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {[{label:"Độ ẩm",val:fDoAm,set:setFDoAm},{label:"Độ non búp",val:fDoNon,set:setFDoNon},{label:"Độ sạch",val:fDoSach,set:setFDoSach}].map((m,i)=>(
                <div key={i}><label className="block text-xs font-semibold mb-1.5">{m.label}: <span className="text-primary">{m.val}%</span></label><input type="range" min={60} max={100} value={m.val} onChange={e=>m.set(+e.target.value)} className="w-full accent-primary" /></div>
              ))}
              <div className={`px-4 py-3 rounded-xl border text-center ${calcKQ(fDoAm,fDoNon,fDoSach)==="pass"?"bg-emerald-50 border-emerald-200":calcKQ(fDoAm,fDoNon,fDoSach)==="reduce"?"bg-amber-50 border-amber-200":"bg-red-50 border-red-200"}`}>
                <p className="text-xs text-muted-foreground">Dự kiến kết quả</p>
                <p className={`text-lg font-bold ${calcKQ(fDoAm,fDoNon,fDoSach)==="pass"?"text-emerald-700":calcKQ(fDoAm,fDoNon,fDoSach)==="reduce"?"text-amber-700":"text-red-600"}`}>{RESULT_CFG[calcKQ(fDoAm,fDoNon,fDoSach)].label} · {Math.round((fDoAm+fDoNon+fDoSach)/3)} điểm</p>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Ghi chú</label><textarea value={fNote} onChange={e=>setFNote(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={handleCreate} disabled={!fBatch||!fDoiTuong} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Lưu phiếu QC</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
