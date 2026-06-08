import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Tag, Plus, Search, Eye, Printer, CheckCircle2, XCircle, Clock,
  QrCode, Download, X, ChevronDown, FileSpreadsheet, Zap, Package,
  Hash, Building2, AlertCircle, ChevronRight,
} from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

type TemStatus = "chua-kich-hoat" | "da-kich-hoat" | "da-su-dung" | "bi-huy";
const STATUS_CFG: Record<TemStatus, { label: string; color: string; icon: React.ElementType }> = {
  "chua-kich-hoat": { label: "Chưa kích hoạt", color: "bg-gray-100 text-gray-600",        icon: Clock },
  "da-kich-hoat":   { label: "Đã kích hoạt",   color: "bg-blue-100 text-blue-700",        icon: CheckCircle2 },
  "da-su-dung":     { label: "Đã dùng/quét",   color: "bg-emerald-100 text-emerald-700",  icon: CheckCircle2 },
  "bi-huy":         { label: "Bị hủy",          color: "bg-red-100 text-red-600",          icon: XCircle },
};

type LoaiTem = "thu-mua" | "san-xuat" | "dong-goi" | "tong-hop";
const LOAI_CFG: Record<LoaiTem, { label: string; color: string }> = {
  "thu-mua":  { label: "Thu mua",   color: "bg-amber-100 text-amber-700" },
  "san-xuat": { label: "Sản xuất",  color: "bg-blue-100 text-blue-700" },
  "dong-goi": { label: "Đóng gói",  color: "bg-violet-100 text-violet-700" },
  "tong-hop": { label: "Tổng hợp",  color: "bg-emerald-100 text-emerald-700" },
};

interface TemBatch {
  id: string;
  maBatch: string;
  loai: LoaiTem;
  soLuong: number;
  tuSerial: string;
  denSerial: string;
  maLo: string;
  thuongPham: string;
  coSo: string;
  ngayTao: string;
  ngayKichHoat?: string;
  trangThai: TemStatus;
  soLanQuet: number;
  ghiChu: string;
}

const MOCK_BATCHES: TemBatch[] = [
  { id:"1", maBatch:"TEM-TM-0604-001", loai:"thu-mua",  soLuong:50,  tuSerial:"TM240601001", denSerial:"TM240601050", maLo:"RAW-NB002-0104", thuongPham:"Chè búp tươi",       coSo:"HTX Nà Bay",     ngayTao:"04/06/2026", ngayKichHoat:"04/06/2026", trangThai:"da-kich-hoat", soLanQuet:12, ghiChu:"Thu mua đợt 1 tháng 6" },
  { id:"2", maBatch:"TEM-SX-0603-001", loai:"san-xuat", soLuong:10,  tuSerial:"SX240603001", denSerial:"SX240603010", maLo:"L09104",          thuongPham:"Chè xanh Bằng Phúc",coSo:"Nhà máy BP",     ngayTao:"03/06/2026", ngayKichHoat:"04/06/2026", trangThai:"da-su-dung",   soLanQuet:47, ghiChu:"Lô chè xanh tháng 4" },
  { id:"3", maBatch:"TEM-DG-0605-001", loai:"dong-goi", soLuong:100, tuSerial:"DG240605001", denSerial:"DG240605100", maLo:"S09104",          thuongPham:"Hộp chè xanh 100g", coSo:"Nhà máy BP",     ngayTao:"05/06/2026", trangThai:"chua-kich-hoat", soLanQuet:0, ghiChu:"Đóng gói đợt 2" },
  { id:"4", maBatch:"TEM-TM-0531-001", loai:"thu-mua",  soLuong:35,  tuSerial:"TM240531001", denSerial:"TM240531035", maLo:"RAW-NB013-0104",  thuongPham:"Chè búp tươi",       coSo:"Hộ Triệu V.Cường",ngayTao:"31/05/2026",ngayKichHoat:"31/05/2026",trangThai:"da-su-dung",  soLanQuet:35, ghiChu:"" },
  { id:"5", maBatch:"TEM-DG-0601-001", loai:"dong-goi", soLuong:22,  tuSerial:"DG240601001", denSerial:"DG240601022", maLo:"S013003",         thuongPham:"Hồng trà Shan 250g",coSo:"Nhà máy BP",     ngayTao:"01/06/2026", ngayKichHoat:"02/06/2026", trangThai:"da-kich-hoat", soLanQuet:8, ghiChu:"Đơn XNK Hà Nội" },
  { id:"6", maBatch:"TEM-SX-0528-001", loai:"san-xuat", soLuong:8,   tuSerial:"SX240528001", denSerial:"SX240528008", maLo:"L073103",         thuongPham:"Bạch trà Shan",     coSo:"Nhà máy BP",     ngayTao:"28/05/2026", ngayKichHoat:"28/05/2026", trangThai:"da-su-dung",   soLanQuet:19, ghiChu:"" },
  { id:"7", maBatch:"TEM-TM-0607-001", loai:"thu-mua",  soLuong:60,  tuSerial:"TM240607001", denSerial:"TM240607060", maLo:"",               thuongPham:"Chè búp tươi",       coSo:"HTX Nà Hồng",    ngayTao:"07/06/2026", trangThai:"chua-kich-hoat", soLanQuet:0, ghiChu:"Chờ thu mua đợt 2" },
];

let _nid = 200;
const genId = () => String(++_nid);

export default function TxngTemPage() {
  const [batches, setBatches] = useState<TemBatch[]>(MOCK_BATCHES);
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<LoaiTem | "">("");
  const [statusFilter, setStatusFilter] = useState<TemStatus | "">("");
  const [selected, setSelected] = useState<TemBatch | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showActivate, setShowActivate] = useState<TemBatch | null>(null);
  const [activateAll, setActivateAll] = useState(true);

  const [fLoai, setFLoai] = useState<LoaiTem>("thu-mua");
  const [fSoLuong, setFSoLuong] = useState("");
  const [fMaLo, setFMaLo] = useState("");
  const [fThuongPham, setFThuongPham] = useState("");
  const [fCoSo, setFCoSo] = useState("");
  const [fGhiChu, setFGhiChu] = useState("");

  const filtered = useMemo(() => {
    let d = batches;
    if (search) { const q = search.toLowerCase(); d = d.filter(b => b.maBatch.toLowerCase().includes(q) || b.maLo.toLowerCase().includes(q) || b.thuongPham.toLowerCase().includes(q)); }
    if (loaiFilter) d = d.filter(b => b.loai === loaiFilter);
    if (statusFilter) d = d.filter(b => b.trangThai === statusFilter);
    return d;
  }, [batches, search, loaiFilter, statusFilter]);

  const stats = {
    total: batches.reduce((s, b) => s + b.soLuong, 0),
    activated: batches.filter(b => b.trangThai === "da-kich-hoat" || b.trangThai === "da-su-dung").reduce((s, b) => s + b.soLuong, 0),
    used: batches.filter(b => b.trangThai === "da-su-dung").reduce((s, b) => s + b.soLanQuet, 0),
    pending: batches.filter(b => b.trangThai === "chua-kich-hoat").reduce((s, b) => s + b.soLuong, 0),
  };

  const handleCreate = () => {
    if (!fSoLuong || !fThuongPham) return;
    const n = parseInt(fSoLuong) || 1;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,"0");
    const mm = String(now.getMonth()+1).padStart(2,"0");
    const yy = String(now.getFullYear()).slice(2);
    const prefix = fLoai === "thu-mua" ? "TM" : fLoai === "san-xuat" ? "SX" : "DG";
    const maBatch = `TEM-${fLoai.slice(0,2).toUpperCase()}-${dd}${mm}-${String(batches.length+1).padStart(3,"0")}`;
    const tu = `${prefix}${yy}${mm}${dd}${String(batches.length*100+1).padStart(3,"0")}`;
    const den = `${prefix}${yy}${mm}${dd}${String(batches.length*100+n).padStart(3,"0")}`;
    const nb: TemBatch = { id: genId(), maBatch, loai: fLoai, soLuong: n, tuSerial: tu, denSerial: den, maLo: fMaLo, thuongPham: fThuongPham, coSo: fCoSo, ngayTao: `${dd}/${mm}/20${yy}`, trangThai: "chua-kich-hoat", soLanQuet: 0, ghiChu: fGhiChu };
    setBatches(prev => [nb, ...prev]);
    setShowCreate(false);
    setFSoLuong(""); setFMaLo(""); setFThuongPham(""); setFCoSo(""); setFGhiChu("");
  };

  const handleActivate = (batch: TemBatch) => {
    setBatches(prev => prev.map(b => b.id !== batch.id ? b : { ...b, trangThai: "da-kich-hoat", ngayKichHoat: new Date().toLocaleDateString("vi-VN") }));
    setShowActivate(null);
    if (selected?.id === batch.id) setSelected(prev => prev ? { ...prev, trangThai: "da-kich-hoat", ngayKichHoat: new Date().toLocaleDateString("vi-VN") } : null);
  };

  const handleExport = () => exportToExcel([
    { header: "Mã batch", key: "maBatch", width: 22 },
    { header: "Loại", key: "loai", width: 12 },
    { header: "Số lượng tem", key: "soLuong", width: 14 },
    { header: "Từ serial", key: "tuSerial", width: 18 },
    { header: "Đến serial", key: "denSerial", width: 18 },
    { header: "Mã lô", key: "maLo", width: 18 },
    { header: "Thương phẩm", key: "thuongPham", width: 24 },
    { header: "Ngày tạo", key: "ngayTao", width: 14 },
    { header: "Trạng thái", key: "trangThai", width: 18 },
    { header: "Số lần quét", key: "soLanQuet", width: 12 },
  ], batches as unknown as Record<string, unknown>[], "TemTXNG");

  return (
    <AppLayout>
      <div className="space-y-5">

        <div>
          <div className="text-[12px] text-muted-foreground">TXNG / Quản lý tem</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Tag className="w-6 h-6 text-rose-600" />
              Quản lý Tem TXNG
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Tạo batch tem
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Tag,         label: "Tổng tem đã tạo",   value: `${stats.total} tem`,      sub: `${batches.length} batch`, color: "text-rose-600 bg-rose-50" },
            { icon: Zap,         label: "Đã kích hoạt",      value: `${stats.activated} tem`,   sub: "đang hoặc đã dùng",       color: "text-blue-600 bg-blue-50" },
            { icon: QrCode,      label: "Lượt quét",         value: `${stats.used} lượt`,       sub: "khách hàng quét",         color: "text-emerald-600 bg-emerald-50" },
            { icon: Clock,       label: "Chờ kích hoạt",     value: `${stats.pending} tem`,     sub: "cần xử lý",               color: "text-amber-600 bg-amber-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã batch, mã lô, thương phẩm..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <select value={loaiFilter} onChange={e => setLoaiFilter(e.target.value as LoaiTem | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option value="">Tất cả loại</option>
              {(Object.keys(LOAI_CFG) as LoaiTem[]).map(k => <option key={k} value={k}>{LOAI_CFG[k].label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TemStatus | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option value="">Tất cả TT</option>
              {(Object.keys(STATUS_CFG) as TemStatus[]).map(k => <option key={k} value={k}>{STATUS_CFG[k].label}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  {["Mã batch", "Loại", "Số lượng", "Mã lô", "Thương phẩm", "Cơ sở", "Ngày tạo", "Kích hoạt", "Trạng thái", "Thao tác"].map((h, i) => (
                    <th key={i} className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const sc = STATUS_CFG[b.trangThai];
                  const lc = LOAI_CFG[b.loai];
                  return (
                    <tr key={b.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(b)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{b.maBatch}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${lc.color}`}>{lc.label}</span></td>
                      <td className="py-3 px-4 text-sm font-semibold">{b.soLuong} tem</td>
                      <td className="py-3 px-4"><span className="font-mono text-xs text-blue-700">{b.maLo || "—"}</span></td>
                      <td className="py-3 px-4 text-sm">{b.thuongPham}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{b.coSo || "—"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{b.ngayTao}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{b.ngayKichHoat || "—"}</td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}><sc.icon className="w-3 h-3" />{sc.label}</span></td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setSelected(b)} title="Xem" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          {b.trangThai === "chua-kich-hoat" && (
                            <button onClick={() => setShowActivate(b)} title="Kích hoạt" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600"><Zap className="w-3.5 h-3.5" /></button>
                          )}
                          <button title="In QR" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Printer className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filtered.length} batch · {filtered.reduce((s,b) => s+b.soLuong,0)} tem</p>
            <p className="text-xs font-semibold">Đã kích hoạt: {filtered.filter(b => b.trangThai !== "chua-kich-hoat").reduce((s,b)=>s+b.soLuong,0)} / {filtered.reduce((s,b)=>s+b.soLuong,0)}</p>
          </div>
        </div>

      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selected.maBatch}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{LOAI_CFG[selected.loai].label} · {selected.ngayTao}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_CFG[selected.trangThai].color}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />{STATUS_CFG[selected.trangThai].label}
              </div>

              <div className="bg-muted/20 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Số lượng tem</span><span className="font-bold">{selected.soLuong} tem</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Từ serial</span><span className="font-mono text-xs font-semibold">{selected.tuSerial}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Đến serial</span><span className="font-mono text-xs font-semibold">{selected.denSerial}</span></div>
                {selected.maLo && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mã lô gắn</span><span className="font-mono text-xs text-blue-700">{selected.maLo}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Thương phẩm</span><span className="font-medium text-xs text-right">{selected.thuongPham}</span></div>
                {selected.coSo && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cơ sở</span><span className="font-medium text-xs">{selected.coSo}</span></div>}
                {selected.ngayKichHoat && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ngày kích hoạt</span><span className="font-medium text-xs">{selected.ngayKichHoat}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lượt quét</span><span className="font-bold text-emerald-700">{selected.soLanQuet} lần</span></div>
              </div>

              {selected.ghiChu && (
                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm italic">{selected.ghiChu}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col items-center gap-2">
                <QrCode className="w-12 h-12 text-blue-600" />
                <p className="text-xs text-blue-700 font-semibold">QR code batch</p>
                <p className="text-[11px] text-blue-600 text-center">Quét để xem thông tin toàn bộ batch tem này</p>
              </div>

              {selected.trangThai === "chua-kich-hoat" && (
                <button onClick={() => setShowActivate(selected)} className="w-full py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Kích hoạt tất cả ({selected.soLuong} tem)
                </button>
              )}

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted/50">
                  <Printer className="w-4 h-4" /> In QR tem
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted/50">
                  <Download className="w-4 h-4" /> Tải QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate modal */}
      {showActivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowActivate(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4"><Zap className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-base font-semibold text-center mb-1">Kích hoạt tem TXNG</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Batch <span className="font-semibold text-foreground">{showActivate.maBatch}</span> · {showActivate.soLuong} tem
            </p>
            <div className="space-y-2 mb-5">
              <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted/30">
                <input type="radio" checked={activateAll} onChange={() => setActivateAll(true)} className="accent-primary" />
                <div>
                  <p className="text-sm font-medium">Kích hoạt toàn dải</p>
                  <p className="text-xs text-muted-foreground">Từ {showActivate.tuSerial} đến {showActivate.denSerial}</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-muted/30">
                <input type="radio" checked={!activateAll} onChange={() => setActivateAll(false)} className="accent-primary" />
                <div>
                  <p className="text-sm font-medium">Kích hoạt từng serial</p>
                  <p className="text-xs text-muted-foreground">Chọn số serial cụ thể trong dải</p>
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowActivate(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button onClick={() => handleActivate(showActivate)} className="flex-1 h-10 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-rose-600" /><span className="font-semibold text-sm">Tạo batch tem mới</span></div>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Loại tem <span className="text-rose-500">*</span></label>
                <select value={fLoai} onChange={e => setFLoai(e.target.value as LoaiTem)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                  {(Object.keys(LOAI_CFG) as LoaiTem[]).map(k => <option key={k} value={k}>{LOAI_CFG[k].label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Số lượng tem <span className="text-rose-500">*</span></label>
                  <input value={fSoLuong} onChange={e => setFSoLuong(e.target.value)} type="number" min="1" placeholder="50" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Mã lô gắn</label>
                  <input value={fMaLo} onChange={e => setFMaLo(e.target.value)} placeholder="L09104 / RAW-..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Thương phẩm <span className="text-rose-500">*</span></label>
                <input value={fThuongPham} onChange={e => setFThuongPham(e.target.value)} placeholder="VD: Chè búp tươi, Hộp chè xanh 100g..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Cơ sở / Đơn vị</label>
                <input value={fCoSo} onChange={e => setFCoSo(e.target.value)} placeholder="VD: HTX Nà Bay, Nhà máy BP..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                <input value={fGhiChu} onChange={e => setFGhiChu(e.target.value)} placeholder="Ghi chú thêm..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button onClick={handleCreate} disabled={!fSoLuong || !fThuongPham} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 disabled:opacity-50">
                Tạo batch tem
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
