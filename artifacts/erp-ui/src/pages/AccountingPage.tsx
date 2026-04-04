import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Wallet, PiggyBank,
  CheckCircle2, Clock, XCircle, Eye, Edit2, Trash2, X,
} from "lucide-react";

type PhieuType = "thu" | "chi";
type PhuongThuc = "Tiền mặt" | "Chuyển khoản" | "Ví điện tử";
type TrangThai = "da-duyet" | "cho-duyet" | "tu-choi";

interface Phieu {
  id: string;
  maPhieu: string;
  loai: PhieuType;
  doiTuong: string;
  danhMuc: string;
  soTien: number;
  ngay: string;
  phuongThuc: PhuongThuc;
  trangThai: TrangThai;
  ghiChu: string;
  nguoiTao: string;
}

const TRANG_THAI_CFG = {
  "da-duyet": { label: "Đã duyệt",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "cho-duyet": { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700",    icon: Clock },
  "tu-choi":   { label: "Từ chối",   color: "bg-red-100 text-red-600",         icon: XCircle },
};

const PHIEU_DATA: Phieu[] = [
  { id:"1",  maPhieu:"PT-0401", loai:"thu", doiTuong:"Cty TNHH Trà Thái Nguyên",    danhMuc:"Doanh thu bán hàng",    soTien:23000000,  ngay:"2026-03-26", phuongThuc:"Chuyển khoản", trangThai:"da-duyet", ghiChu:"ĐH DBH-2604-001", nguoiTao:"Nguyễn Văn A" },
  { id:"2",  maPhieu:"PT-0402", loai:"thu", doiTuong:"HTX Chè Tân Cương",            danhMuc:"Doanh thu bán hàng",    soTien:21000000,  ngay:"2026-03-28", phuongThuc:"Chuyển khoản", trangThai:"da-duyet", ghiChu:"ĐH DBH-2604-002", nguoiTao:"Trần Thị B" },
  { id:"3",  maPhieu:"PC-0401", loai:"chi", doiTuong:"Hộ dân – Đặng Văn Sơn",       danhMuc:"Thu mua nguyên liệu",   soTien:15600000,  ngay:"2026-03-25", phuongThuc:"Tiền mặt",    trangThai:"da-duyet", ghiChu:"Phiếu thu mua 001", nguoiTao:"Lê Văn C" },
  { id:"4",  maPhieu:"PC-0402", loai:"chi", doiTuong:"Hộ dân – Nguyễn Thị Hoa",     danhMuc:"Thu mua nguyên liệu",   soTien:12480000,  ngay:"2026-03-25", phuongThuc:"Tiền mặt",    trangThai:"da-duyet", ghiChu:"Phiếu thu mua 002", nguoiTao:"Lê Văn C" },
  { id:"5",  maPhieu:"PC-0403", loai:"chi", doiTuong:"Nhân viên HTX (12 người)",     danhMuc:"Lương tháng 3/2026",    soTien:52000000,  ngay:"2026-03-31", phuongThuc:"Chuyển khoản", trangThai:"da-duyet", ghiChu:"Lương + phụ cấp", nguoiTao:"Nguyễn Văn A" },
  { id:"6",  maPhieu:"PC-0404", loai:"chi", doiTuong:"Cty in ấn Hà Giang",           danhMuc:"Bao bì đóng gói",       soTien:8500000,   ngay:"2026-04-01", phuongThuc:"Chuyển khoản", trangThai:"da-duyet", ghiChu:"Đặt hàng bao bì Q2", nguoiTao:"Trần Thị B" },
  { id:"7",  maPhieu:"PT-0403", loai:"thu", doiTuong:"Cty CP XNK Hà Nội",            danhMuc:"Doanh thu bán hàng",    soTien:45900000,  ngay:"2026-04-01", phuongThuc:"Chuyển khoản", trangThai:"cho-duyet", ghiChu:"ĐH DBH-0104-003", nguoiTao:"Nguyễn Văn A" },
  { id:"8",  maPhieu:"PT-0404", loai:"thu", doiTuong:"Siêu thị Lotte Mart Hà Nội",   danhMuc:"Doanh thu bán hàng",    soTien:19800000,  ngay:"2026-04-02", phuongThuc:"Chuyển khoản", trangThai:"cho-duyet", ghiChu:"ĐH DBH-0204-004", nguoiTao:"Trần Thị B" },
  { id:"9",  maPhieu:"PC-0405", loai:"chi", doiTuong:"Điện lực Hà Giang",            danhMuc:"Điện sản xuất T3",      soTien:3200000,   ngay:"2026-03-28", phuongThuc:"Chuyển khoản", trangThai:"da-duyet", ghiChu:"Tiền điện tháng 3", nguoiTao:"Nguyễn Văn A" },
  { id:"10", maPhieu:"PC-0406", loai:"chi", doiTuong:"Hộ dân – Triệu Văn Long",      danhMuc:"Thu mua nguyên liệu",   soTien:18720000,  ngay:"2026-04-02", phuongThuc:"Tiền mặt",    trangThai:"cho-duyet", ghiChu:"Phiếu thu mua 003", nguoiTao:"Lê Văn C" },
  { id:"11", maPhieu:"PT-0405", loai:"thu", doiTuong:"Hỗ trợ OCOP tỉnh Hà Giang",    danhMuc:"Hỗ trợ nhà nước",       soTien:30000000,  ngay:"2026-04-01", phuongThuc:"Chuyển khoản", trangThai:"da-duyet", ghiChu:"Hỗ trợ phát triển vùng nguyên liệu", nguoiTao:"Nguyễn Văn A" },
  { id:"12", maPhieu:"PC-0407", loai:"chi", doiTuong:"Nhiên liệu vận chuyển",         danhMuc:"Vận hành",              soTien:4500000,   ngay:"2026-04-03", phuongThuc:"Tiền mặt",    trangThai:"cho-duyet", ghiChu:"Xăng dầu tháng 4", nguoiTao:"Trần Thị B" },
  { id:"13", maPhieu:"PC-0408", loai:"chi", doiTuong:"Bảo dưỡng máy sao chè",        danhMuc:"Bảo trì thiết bị",      soTien:6800000,   ngay:"2026-03-20", phuongThuc:"Tiền mặt",    trangThai:"da-duyet", ghiChu:"Thay phụ tùng máy sao", nguoiTao:"Lê Văn C" },
  { id:"14", maPhieu:"PT-0406", loai:"thu", doiTuong:"Quán trà Sen – Đỗ Thị Mai",    danhMuc:"Doanh thu bán hàng",    soTien:3800000,   ngay:"2026-04-03", phuongThuc:"Tiền mặt",    trangThai:"cho-duyet", ghiChu:"ĐH DBH-0304-005", nguoiTao:"Nguyễn Văn A" },
  { id:"15", maPhieu:"PC-0409", loai:"chi", doiTuong:"Kiểm định VSATTP",             danhMuc:"Pháp lý – chất lượng",  soTien:5000000,   ngay:"2026-03-15", phuongThuc:"Chuyển khoản", trangThai:"tu-choi",  ghiChu:"Gia hạn giấy phép VSATTP", nguoiTao:"Nguyễn Văn A" },
];

function fmtMoney(v: number) { return v.toLocaleString("vi-VN") + " đ"; }

export default function AccountingPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<PhieuType | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("ngay");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [selected, setSelected] = useState<Phieu | null>(null);
  const [phieuList, setPhieuList] = useState<Phieu[]>(PHIEU_DATA);

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa phiếu này?")) return;
    setPhieuList(prev => prev.filter(p => p.id !== id));
    setSelected(null);
  };

  const filtered = useMemo(() => {
    let d = phieuList;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(p => p.maPhieu.toLowerCase().includes(q) || p.doiTuong.toLowerCase().includes(q) || p.danhMuc.toLowerCase().includes(q));
    }
    if (loaiFilter) d = d.filter(p => p.loai === loaiFilter);
    if (dateFrom) d = d.filter(p => p.ngay >= dateFrom);
    if (dateTo) d = d.filter(p => p.ngay <= dateTo);
    return [...d].sort((a, b) => {
      const av = (a as Record<string,unknown>)[sortKey];
      const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [phieuList, search, loaiFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalThu = phieuList.filter(p => p.loai === "thu" && p.trangThai === "da-duyet").reduce((s, p) => s + p.soTien, 0);
  const totalChi = phieuList.filter(p => p.loai === "chi" && p.trangThai === "da-duyet").reduce((s, p) => s + p.soTien, 0);
  const pending = phieuList.filter(p => p.trangThai === "cho-duyet").length;

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Kế toán – Thu / Chi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Phiếu thu chi tài chính</p>
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Tạo phiếu
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp,   label: "Tổng thu",          value: fmtMoney(totalThu),                         sub: "đã duyệt",        color: "text-emerald-600 bg-emerald-50" },
          { icon: TrendingDown, label: "Tổng chi",          value: fmtMoney(totalChi),                         sub: "đã duyệt",        color: "text-red-600 bg-red-50" },
          { icon: PiggyBank,    label: "Cân đối",           value: fmtMoney(Math.abs(totalThu - totalChi)),    sub: totalThu >= totalChi ? "thặng dư" : "thâm hụt", color: "text-blue-600 bg-blue-50" },
          { icon: Clock,        label: "Chờ duyệt",         value: `${pending} phiếu`,                         sub: "cần xử lý",       color: "text-amber-600 bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã phiếu, đối tượng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={loaiFilter} onChange={e => setLoaiFilter(e.target.value as PhieuType | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả</option>
            <option value="thu">Phiếu thu</option>
            <option value="chi">Phiếu chi</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <span className="text-muted-foreground text-sm">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={() => { setSearch(""); setLoaiFilter(""); setDateFrom(""); setDateTo(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "maPhieu", label: "Mã phiếu" },
                  { key: "loai",    label: "Loại" },
                  { key: "doiTuong",label: "Đối tượng" },
                  { key: "danhMuc", label: "Danh mục" },
                  { key: "soTien",  label: "Số tiền" },
                  { key: "ngay",    label: "Ngày" },
                  { key: "phuongThuc", label: "Phương thức" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const sc = TRANG_THAI_CFG[p.trangThai];
                const Icon = sc.icon;
                const isThu = p.loai === "thu";
                return (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(p)}>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{p.maPhieu}</span></td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isThu ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {isThu ? "Thu" : "Chi"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground max-w-[180px] truncate">{p.doiTuong}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{p.danhMuc}</td>
                    <td className={`py-3 px-4 font-bold whitespace-nowrap ${isThu ? "text-emerald-600" : "text-red-500"}`}>
                      {isThu ? "+" : "-"}{fmtMoney(p.soTien)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{p.ngay}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.phuongThuc}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setSelected(p)} title="Xem" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setSelected(p)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có phiếu nào phù hợp</div>}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {phieuList.length} phiếu</p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-emerald-600 font-semibold">Thu: +{fmtMoney(filtered.filter(p => p.loai === "thu").reduce((s, p) => s + p.soTien, 0))}</p>
            <p className="text-xs text-red-500 font-semibold">Chi: -{fmtMoney(filtered.filter(p => p.loai === "chi").reduce((s, p) => s + p.soTien, 0))}</p>
          </div>
        </div>
      </div>
      {selected && (() => {
        const sc = TRANG_THAI_CFG[selected.trangThai];
        const StatusIcon = sc.icon;
        const isThu = selected.loai === "thu";
        return (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
                <div>
                  <span className="font-mono text-sm font-bold text-primary">{selected.maPhieu}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.danhMuc}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 px-5 py-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isThu ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {isThu ? "Phiếu Thu" : "Phiếu Chi"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                    <StatusIcon className="w-3 h-3" /> {sc.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Đối tượng",    value: selected.doiTuong },
                    { label: "Phương thức",  value: selected.phuongThuc },
                    { label: "Ngày",          value: selected.ngay },
                    { label: "Người tạo",    value: selected.nguoiTao },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="text-sm font-medium text-right max-w-[60%]">{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className={`border rounded-xl p-4 ${isThu ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <p className={`text-xs font-semibold ${isThu ? "text-emerald-700" : "text-red-600"}`}>Số tiền</p>
                  <p className={`text-2xl font-bold mt-1 ${isThu ? "text-emerald-700" : "text-red-600"}`}>
                    {isThu ? "+" : "-"}{fmtMoney(selected.soTien)}
                  </p>
                </div>
                {selected.ghiChu && (
                  <div className="bg-muted/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-sm italic">{selected.ghiChu}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </AppLayout>
  );
}
