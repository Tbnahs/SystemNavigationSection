import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter,
  ChevronDown, ChevronUp, Eye, FileText,
  CheckCircle2, Clock, Truck, XCircle, AlertCircle,
  TrendingUp, ShoppingBag, Package, BadgeDollarSign,
  X, Trash2, Edit2, FileSpreadsheet, Printer, Download,
  Receipt, ChevronRight, Warehouse, User, Phone, MapPin, QrCode,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { DANH_SACH_SAN_PHAM, MAU_SAN_PHAM as PRODUCT_COLORS_SHARED } from "@/constants/products";
import { useERP, SalesOrder, OrderLine } from "@/contexts/ERPContext";

/* ────────────── Types ────────────── */
type OrderStatus = "bao-gia" | "xac-nhan" | "xuat-kho" | "dang-giao" | "hoan-thanh" | "huy";
type ThanhToanStatus = "chua" | "mot-phan" | "da-thanh-toan";
type LoaiKhach = "dai-ly" | "sieu-thi" | "xuat-khau" | "le";

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "bao-gia":    { label: "Báo giá",      color: "bg-gray-100 text-gray-600",       icon: FileText },
  "xac-nhan":   { label: "Xác nhận",     color: "bg-blue-100 text-blue-700",       icon: CheckCircle2 },
  "xuat-kho":   { label: "Xuất kho",     color: "bg-violet-100 text-violet-700",   icon: Warehouse },
  "dang-giao":  { label: "Đang giao",    color: "bg-amber-100 text-amber-700",     icon: Truck },
  "hoan-thanh": { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "huy":        { label: "Đã hủy",       color: "bg-red-100 text-red-600",         icon: XCircle },
};

const THANH_TOAN_CFG: Record<ThanhToanStatus, { label: string; color: string }> = {
  "chua":         { label: "Chưa TT",      color: "bg-red-100 text-red-600" },
  "mot-phan":     { label: "Một phần",      color: "bg-amber-100 text-amber-700" },
  "da-thanh-toan":{ label: "Đã thanh toán", color: "bg-emerald-100 text-emerald-700" },
};

const LOAI_KHACH_CFG: Record<LoaiKhach, { label: string; color: string }> = {
  "dai-ly":    { label: "Đại lý",       color: "bg-violet-100 text-violet-700" },
  "sieu-thi":  { label: "Siêu thị",     color: "bg-blue-100 text-blue-700" },
  "xuat-khau": { label: "Xuất khẩu",    color: "bg-amber-100 text-amber-700" },
  "le":        { label: "Bán lẻ",       color: "bg-gray-100 text-gray-600" },
};

const STATUS_FLOW: OrderStatus[] = ["bao-gia", "xac-nhan", "xuat-kho", "dang-giao", "hoan-thanh"];

/* ────────────── Seed data (moved to ERPContext) ────────────── */
const SEED_UNUSED: SalesOrder[] = [
  {
    id: "1", maDon: "SO-2603-001", loaiKhach: "dai-ly",
    khachHang: "Cty TNHH Trà Thái Nguyên", diaChi: "TP. Thái Nguyên", sdt: "0208 3856 123",
    ngayDat: "26/03/2026", ngayGiao: "02/04/2026", trangThai: "hoan-thanh",
    thanhToan: "da-thanh-toan", daThanhToan: 23000000, maVanDon: "VD-2026-0312",
    nguoiTao: "Nguyễn Văn A", ghiChu: "Giao hàng nguyên kiện, có xe tải",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà",  soLuong: 20, donVi: "kg", donGia: 850000,  thanhTien: 17000000, maLoSX: "L013003" },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Bạch trà",  soLuong: 5,  donVi: "kg", donGia: 1200000, thanhTien: 6000000,  maLoSX: "L073103" },
    ],
    tongTien: 23000000,
  },
  {
    id: "2", maDon: "SO-2803-002", loaiKhach: "sieu-thi",
    khachHang: "Siêu thị Lotte Mart Hà Nội", diaChi: "Đống Đa, Hà Nội", sdt: "024 3562 7890",
    ngayDat: "28/03/2026", ngayGiao: "08/04/2026", trangThai: "dang-giao",
    thanhToan: "mot-phan", daThanhToan: 10000000, maVanDon: "VD-2026-0401",
    nguoiTao: "Trần Thị B", ghiChu: "Yêu cầu đóng gói hộp quà tặng",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Bạch trà",  soLuong: 8,  donVi: "kg", donGia: 1200000, thanhTien: 9600000,  maLoSX: "L073103" },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà",  soLuong: 12, donVi: "kg", donGia: 850000,  thanhTien: 10200000, maLoSX: "L043103" },
    ],
    tongTien: 19800000,
  },
  {
    id: "3", maDon: "SO-0104-003", loaiKhach: "xuat-khau",
    khachHang: "Cty CP Xuất nhập khẩu Hà Nội", diaChi: "Hà Nội", sdt: "024 3825 6789",
    ngayDat: "01/04/2026", ngayGiao: "10/04/2026", trangThai: "xuat-kho",
    thanhToan: "chua", daThanhToan: 0, maVanDon: "",
    nguoiTao: "Nguyễn Văn A", ghiChu: "Đơn xuất khẩu, cần giấy OCOP + CO/CQ",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà",  soLuong: 30, donVi: "kg", donGia: 850000,  thanhTien: 25500000, maLoSX: "L023103" },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Bạch trà",  soLuong: 10, donVi: "kg", donGia: 1200000, thanhTien: 12000000, maLoSX: "L073103" },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh",  soLuong: 20, donVi: "kg", donGia: 420000,  thanhTien: 8400000,  maLoSX: "L09104"  },
    ],
    tongTien: 45900000,
  },
  {
    id: "4", maDon: "SO-0204-004", loaiKhach: "sieu-thi",
    khachHang: "WinMart Hà Nội (3 cửa hàng)", diaChi: "Cầu Giấy, Hà Nội", sdt: "024 3901 2345",
    ngayDat: "02/04/2026", ngayGiao: "09/04/2026", trangThai: "xac-nhan",
    thanhToan: "chua", daThanhToan: 0, maVanDon: "",
    nguoiTao: "Trần Thị B", ghiChu: "",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 50, donVi: "kg", donGia: 420000,  thanhTien: 21000000, maLoSX: "L010104" },
    ],
    tongTien: 21000000,
  },
  {
    id: "5", maDon: "SO-0304-005", loaiKhach: "le",
    khachHang: "Quán trà Sen – Đỗ Thị Mai", diaChi: "Quận 1, TP.HCM", sdt: "090 3456 789",
    ngayDat: "03/04/2026", ngayGiao: "12/04/2026", trangThai: "bao-gia",
    thanhToan: "chua", daThanhToan: 0, maVanDon: "",
    nguoiTao: "Lê Văn C", ghiChu: "Khách hàng mới, thử nghiệm",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 5, donVi: "kg", donGia: 420000,  thanhTien: 2100000,  maLoSX: "L011104" },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà", soLuong: 2, donVi: "kg", donGia: 850000,  thanhTien: 1700000,  maLoSX: "L033103" },
    ],
    tongTien: 3800000,
  },
  {
    id: "6", maDon: "SO-0304-006", loaiKhach: "dai-ly",
    khachHang: "NPP Hoàng Phát – Bắc Giang", diaChi: "Bắc Giang", sdt: "0204 3987 654",
    ngayDat: "03/04/2026", ngayGiao: "09/04/2026", trangThai: "bao-gia",
    thanhToan: "chua", daThanhToan: 0, maVanDon: "",
    nguoiTao: "Nguyễn Văn A", ghiChu: "Bulk cho đại lý, giá sỉ",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 100, donVi: "kg", donGia: 380000, thanhTien: 38000000, maLoSX: "L012104" },
    ],
    tongTien: 38000000,
  },
];

const CUSTOMERS = [
  { id: "C001", name: "Cty TNHH Trà Thái Nguyên",       loai: "dai-ly" as LoaiKhach,    diaChi: "TP. Thái Nguyên",       sdt: "0208 3856 123" },
  { id: "C002", name: "Siêu thị Lotte Mart Hà Nội",      loai: "sieu-thi" as LoaiKhach,  diaChi: "Đống Đa, Hà Nội",       sdt: "024 3562 7890" },
  { id: "C003", name: "Cty CP XNK Hà Nội",               loai: "xuat-khau" as LoaiKhach, diaChi: "Hà Nội",                 sdt: "024 3825 6789" },
  { id: "C004", name: "WinMart Hà Nội",                  loai: "sieu-thi" as LoaiKhach,  diaChi: "Cầu Giấy, Hà Nội",      sdt: "024 3901 2345" },
  { id: "C005", name: "NPP Hoàng Phát – Bắc Giang",      loai: "dai-ly" as LoaiKhach,    diaChi: "Bắc Giang",              sdt: "0204 3987 654" },
  { id: "C006", name: "HTX Chè Tân Cương",               loai: "dai-ly" as LoaiKhach,    diaChi: "Tân Cương, Thái Nguyên", sdt: "0208 3777 456" },
  { id: "C007", name: "Quán trà Sen – Đỗ Thị Mai",       loai: "le" as LoaiKhach,        diaChi: "Quận 1, TP.HCM",         sdt: "090 3456 789"  },
];

const PRODUCTS = DANH_SACH_SAN_PHAM.map((p, i) => ({
  loai: p.ten,
  donGia: p.donGia,
  maLoSX: ["L09104","L013003","L073103","L083103","L063103"][i] ?? "",
}));

const PRODUCT_COLORS: Record<string, string> = PRODUCT_COLORS_SHARED;

let _nextId = 100;
const genId = () => String(++_nextId);


function fmt(v: number) { return v.toLocaleString("vi-VN") + " đ"; }
function fmtShort(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN");
}

/* ────────────── Component ────────────── */
export default function SalesPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"don-hang" | "bao-gia" | "cong-no">("don-hang");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loaiFilter, setLoaiFilter]     = useState<LoaiKhach | "">("");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [sortKey, setSortKey]     = useState("ngayDat");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("desc");

  const { salesOrders: orders, setSalesOrders: setOrders, availableLotsForSales } = useERP();
  const [selected, setSelected]   = useState<SalesOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  /* create form state */
  const [fCust, setFCust]         = useState("");
  const [fCustSearch, setFCustSearch] = useState("");
  const [showCustDrop, setShowCustDrop] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrInput, setQrInput]     = useState("");
  const [qrError, setQrError]     = useState("");
  const [qrScanning, setQrScanning] = useState(false);
  const custRef = useRef<HTMLDivElement>(null);
  const [fDate, setFDate]   = useState(new Date().toISOString().slice(0, 10));
  const [fDeliv, setFDeliv] = useState("");
  const [fNote, setFNote]   = useState("");
  const [fLines, setFLines] = useState<{ loai: string; soLuong: string; donGia: string; maLoSX: string }[]>([
    { loai: "Chè xanh", soLuong: "", donGia: "420000", maLoSX: "L09104" },
  ]);

  const selectedCust = CUSTOMERS.find(c => c.id === fCust);

  /* close customer dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (custRef.current && !custRef.current.contains(e.target as Node)) setShowCustDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const custFiltered = useMemo(() => {
    const q = fCustSearch.toLowerCase();
    return CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.sdt.includes(q) ||
      c.diaChi.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [fCustSearch]);

  const selectCust = (id: string) => {
    const c = CUSTOMERS.find(x => x.id === id);
    setFCust(id);
    setFCustSearch(c?.name ?? "");
    setShowCustDrop(false);
  };

  const resetCustSearch = () => { setFCust(""); setFCustSearch(""); };

  const handleQrScan = () => {
    setQrError("");
    setQrScanning(true);
    setTimeout(() => {
      setQrScanning(false);
      const q = qrInput.trim().toUpperCase();
      const match = CUSTOMERS.find(c =>
        c.id === q ||
        c.id.replace("C","KH-00") === q ||
        q === c.id.replace("C0","KH-0").replace("C","KH-")
      ) ?? CUSTOMERS.find(c => c.name.toLowerCase().includes(qrInput.toLowerCase()));
      if (match) {
        selectCust(match.id);
        setShowQrScanner(false);
        setQrInput("");
      } else {
        setQrError("Không tìm thấy khách hàng. Thử lại mã KH (vd: C001, KH-001)");
      }
    }, 800);
  };

  const addLine   = () => setFLines(prev => [...prev, { loai: "Chè xanh", soLuong: "", donGia: "420000", maLoSX: "L09104" }]);
  const removeLine = (i: number) => setFLines(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: string, value: string) => {
    setFLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l;
      const updated = { ...l, [field]: value };
      if (field === "loai") {
        const p = PRODUCTS.find(p => p.loai === value);
        if (p) { updated.donGia = String(p.donGia); updated.maLoSX = p.maLoSX; }
      }
      return updated;
    }));
  };

  const fTotal = fLines.reduce((s, l) => s + (parseFloat(l.soLuong) || 0) * (parseFloat(l.donGia) || 0), 0);

  const handleCreate = () => {
    if (!fCust || fLines.every(l => !l.soLuong || parseFloat(l.soLuong) <= 0)) return;
    const cust = CUSTOMERS.find(c => c.id === fCust)!;
    const [y, m, d] = fDate.split("-");
    const [dy, dm, dd] = (fDeliv || fDate).split("-");
    const sanPhams: OrderLine[] = fLines
      .filter(l => parseFloat(l.soLuong) > 0)
      .map(l => ({
        sanPham: "Chè Shan Tuyết Bằng Phúc",
        loai: l.loai, soLuong: parseFloat(l.soLuong),
        donVi: "kg", donGia: parseFloat(l.donGia),
        thanhTien: parseFloat(l.soLuong) * parseFloat(l.donGia),
        maLoSX: l.maLoSX,
      }));
    const newOrder: SalesOrder = {
      id: genId(),
      maDon: `SO-${d}${m}-${String(orders.length + 1).padStart(3, "0")}`,
      loaiKhach: cust.loai,
      khachHang: cust.name, diaChi: cust.diaChi, sdt: cust.sdt,
      ngayDat:  `${d}/${m}/${y}`,
      ngayGiao: fDeliv ? `${dd}/${dm}/${dy}` : "",
      trangThai: "bao-gia",
      thanhToan: "chua", daThanhToan: 0, maVanDon: "",
      nguoiTao: "Admin", ghiChu: fNote,
      sanPhams, tongTien: fTotal,
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowCreate(false);
    setFCust(""); setFCustSearch(""); setFDate(new Date().toISOString().slice(0,10)); setFDeliv(""); setFNote("");
    setFLines([{ loai: "Chè xanh", soLuong: "", donGia: "420000", maLoSX: "L09104" }]);
  };


  const handleStatusChange = (id: string, s: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id !== id ? o : { ...o, trangThai: s }));
    if (selected?.id === id) setSelected(o => o ? { ...o, trangThai: s } : o);
  };

  const handleThanhToanChange = (id: string, s: ThanhToanStatus) => {
    setOrders(prev => prev.map(o => o.id !== id ? o : { ...o, thanhToan: s }));
    if (selected?.id === id) setSelected(o => o ? { ...o, thanhToan: s } : o);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa đơn hàng này?")) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleExportExcel = () => exportToExcel(
    [
      { header: "Mã đơn", key: "maDon", width: 14 },
      { header: "Khách hàng", key: "khachHang", width: 28 },
      { header: "Địa chỉ", key: "diaChi", width: 28 },
      { header: "Ngày đặt", key: "ngayDat", width: 14 },
      { header: "Ngày giao", key: "ngayGiao", width: 14 },
      { header: "Trạng thái", key: "trangThai", width: 14 },
      { header: "Thanh toán", key: "thanhToan", width: 16 },
      { header: "Tổng tiền (đ)", key: "tongTien", width: 18 },
      { header: "Đã thanh toán (đ)", key: "daThanhToan", width: 20 },
      { header: "Ghi chú", key: "ghiChu", width: 30 },
    ],
    orders as unknown as Record<string, unknown>[],
    "DonHang_HTXHongHa"
  );

  const handleExportPDF = () => exportToPDF(
    "Danh sách Đơn hàng",
    `HTX Hồng Hà · ${orders.length} đơn hàng`,
    [
      { header: "Mã đơn", key: "maDon", width: 18 },
      { header: "Khách hàng", key: "khachHang", width: 40 },
      { header: "Ngày đặt", key: "ngayDat", width: 18 },
      { header: "Ngày giao", key: "ngayGiao", width: 18 },
      { header: "Trạng thái", key: "trangThai", width: 18 },
      { header: "Tổng tiền (đ)", key: "tongTien", width: 22 },
      { header: "Đã thu (đ)", key: "daThanhToan", width: 22 },
    ],
    orders as unknown as Record<string, unknown>[],
    "DonHang_HTXHongHa"
  );

  const parseDateVN = (s: string) => { const [d, m, y] = s.split("/"); return `${y}-${m}-${d}`; };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const filtered = useMemo(() => {
    let data = orders;
    if (activeTab === "bao-gia")   data = data.filter(o => o.trangThai === "bao-gia");
    else if (activeTab === "don-hang") data = data.filter(o => o.trangThai !== "bao-gia");
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(o => o.maDon.toLowerCase().includes(q) || o.khachHang.toLowerCase().includes(q));
    }
    if (statusFilter) data = data.filter(o => o.trangThai === statusFilter);
    if (loaiFilter)   data = data.filter(o => o.loaiKhach === loaiFilter);
    if (dateFrom) data = data.filter(o => parseDateVN(o.ngayDat) >= dateFrom);
    if (dateTo)   data = data.filter(o => parseDateVN(o.ngayDat) <= dateTo);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [orders, activeTab, search, statusFilter, loaiFilter, dateFrom, dateTo, sortKey, sortDir]);

  /* Stats */
  const activeOrders = orders.filter(o => o.trangThai !== "huy");
  const totalRevenue  = activeOrders.reduce((s, o) => s + o.tongTien, 0);
  const totalReceived = activeOrders.reduce((s, o) => s + o.daThanhToan, 0);
  const pendingCount  = orders.filter(o => ["xac-nhan","xuat-kho","dang-giao"].includes(o.trangThai)).length;
  const quotaCount    = orders.filter(o => o.trangThai === "bao-gia").length;

  /* Công nợ view */
  const congNoData = useMemo(() => {
    const map = new Map<string, { khachHang: string; loaiKhach: LoaiKhach; tongDon: number; tongNhanHang: number; daTT: number; chuaTT: number }>();
    orders.filter(o => o.trangThai !== "huy" && o.thanhToan !== "da-thanh-toan").forEach(o => {
      const existing = map.get(o.khachHang) ?? { khachHang: o.khachHang, loaiKhach: o.loaiKhach, tongDon: 0, tongNhanHang: 0, daTT: 0, chuaTT: 0 };
      existing.tongDon++;
      if (["hoan-thanh","dang-giao","xuat-kho"].includes(o.trangThai)) {
        existing.tongNhanHang += o.tongTien;
        existing.daTT += o.daThanhToan;
        existing.chuaTT += o.tongTien - o.daThanhToan;
      }
      map.set(o.khachHang, existing);
    });
    return Array.from(map.values()).filter(r => r.chuaTT > 0).sort((a, b) => b.chuaTT - a.chuaTT);
  }, [orders]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Bán hàng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Báo giá → Đơn hàng → Giao hàng → Thanh toán</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"><Printer className="w-3.5 h-3.5" /> In</button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"><Plus className="w-4 h-4" /> Tạo đơn</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp,      label: "Tổng doanh thu",  value: fmtShort(totalRevenue) + " đ",  sub: "tất cả đơn",          color: "text-emerald-600 bg-emerald-50" },
          { icon: BadgeDollarSign, label: "Đã thu",          value: fmtShort(totalReceived) + " đ", sub: `còn ${fmtShort(totalRevenue - totalReceived)} đ`, color: "text-blue-600 bg-blue-50" },
          { icon: ShoppingBag,     label: "Đang xử lý",      value: `${pendingCount} đơn`,          sub: "cần xử lý tiếp",      color: "text-amber-600 bg-amber-50" },
          { icon: FileText,        label: "Báo giá",          value: `${quotaCount} báo giá`,        sub: "chờ xác nhận",         color: "text-violet-600 bg-violet-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {[
          { key: "don-hang", label: "Đơn hàng",  count: orders.filter(o => o.trangThai !== "bao-gia").length },
          { key: "bao-gia",  label: "Báo giá",    count: quotaCount },
          { key: "cong-no",  label: "Công nợ",    count: congNoData.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab === tab.key ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Công nợ tab ── */}
      {activeTab === "cong-no" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-semibold">Theo dõi công nợ khách hàng B2B</p>
            <p className="text-xs text-muted-foreground">Các đơn đã giao / xuất kho nhưng chưa thanh toán đủ</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {["Khách hàng", "Loại", "Đơn liên quan", "Tổng nhận hàng", "Đã TT", "Còn nợ", "Thao tác"].map((h, i) => (
                  <th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {congNoData.map((r, i) => (
                  <tr key={i} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium">{r.khachHang}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${LOAI_KHACH_CFG[r.loaiKhach].color}`}>{LOAI_KHACH_CFG[r.loaiKhach].label}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{r.tongDon} đơn</td>
                    <td className="py-3 px-4 font-semibold">{fmt(r.tongNhanHang)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{fmt(r.daTT)}</td>
                    <td className="py-3 px-4"><span className="font-bold text-red-600">{fmt(r.chuaTT)}</span></td>
                    <td className="py-3 px-4"><button className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">Nhắc nợ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {congNoData.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có công nợ tồn đọng</div>}
          </div>
          {congNoData.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/10">
              <p className="text-xs text-muted-foreground">{congNoData.length} khách hàng có công nợ</p>
              <p className="text-sm font-bold text-red-600">Tổng còn nợ: {fmt(congNoData.reduce((s, r) => s + r.chuaTT, 0))}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Đơn hàng / Báo giá table ── */}
      {(activeTab === "don-hang" || activeTab === "bao-gia") && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, khách hàng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            {activeTab === "don-hang" && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Tất cả TT</option>
                {Object.entries(STATUS_CFG).filter(([k]) => k !== "bao-gia").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            )}
            <select value={loaiFilter} onChange={e => setLoaiFilter(e.target.value as LoaiKhach | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Tất cả loại KH</option>
              {Object.entries(LOAI_KHACH_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background" />
            <span className="text-muted-foreground text-sm">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background" />
            <button onClick={() => { setSearch(""); setStatusFilter(""); setLoaiFilter(""); setDateFrom(""); setDateTo(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"><Filter className="w-3.5 h-3.5" /> Lọc</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {[
                  { key: "maDon",      label: "Mã đơn" },
                  { key: "khachHang",  label: "Khách hàng" },
                  { key: "ngayDat",    label: "Ngày đặt" },
                  { key: "ngayGiao",   label: "Ngày giao" },
                  { key: "tongTien",   label: "Tổng tiền" },
                  { key: "trangThai",  label: "Trạng thái" },
                  { key: "thanhToan",  label: "Thanh toán" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr></thead>
              <tbody>
                {filtered.map(order => {
                  const sc = STATUS_CFG[order.trangThai];
                  const Ic = sc.icon;
                  const tc = THANH_TOAN_CFG[order.thanhToan];
                  const lk = LOAI_KHACH_CFG[order.loaiKhach];
                  return (
                    <tr key={order.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(order)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-primary">{order.maDon}</span>
                          {order.nguon === "web" && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">🌐 WEB</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground text-sm">{order.khachHang}</p>
                        <span className={`inline-flex text-xs px-1.5 py-0.5 rounded-md font-medium ${lk.color}`}>{lk.label}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-xs">{order.ngayDat}</td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-xs">{order.ngayGiao || "—"}</td>
                      <td className="py-3 px-4 font-semibold whitespace-nowrap text-sm">{fmtShort(order.tongTien)} đ</td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}><Ic className="w-3 h-3" />{sc.label}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tc.color}`}>{tc.label}</span></td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => setSelected(order)} title="Xem" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(order.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có đơn hàng nào</div>}
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {orders.length} đơn</p>
            <p className="text-xs font-semibold">Tổng: {fmt(filtered.filter(o => o.trangThai !== "huy").reduce((s, o) => s + o.tongTien, 0))}</p>
          </div>
        </div>
      )}


      {/* ── Detail Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selected.maDon}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Tạo bởi {selected.nguoiTao} · {selected.ngayDat}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 px-5 py-4 space-y-5">
              {/* Status stepper */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Luồng trạng thái</p>
                <div className="flex items-center gap-0.5">
                  {STATUS_FLOW.map((s, i) => {
                    const sc = STATUS_CFG[s];
                    const flowIdx = STATUS_FLOW.indexOf(selected.trangThai);
                    const isActive  = flowIdx >= i;
                    const isCurrent = selected.trangThai === s;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <button onClick={() => handleStatusChange(selected.id, s)}
                          className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 px-1 rounded-lg transition-all ${isCurrent ? "bg-primary/10 border border-primary/30" : isActive ? "bg-muted/50" : "opacity-40 hover:opacity-70"}`}>
                          <sc.icon className={`w-3.5 h-3.5 ${isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`} />
                          <span className={`text-[10px] font-medium text-center leading-tight ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{sc.label}</span>
                        </button>
                        {i < STATUS_FLOW.length - 1 && <div className={`h-0.5 w-1.5 shrink-0 ${STATUS_FLOW.indexOf(selected.trangThai) > i ? "bg-primary" : "bg-border"}`} />}
                      </div>
                    );
                  })}
                  <button onClick={() => handleStatusChange(selected.id, "huy")}
                    className={`ml-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${selected.trangThai === "huy" ? "bg-red-50 border border-red-200" : "opacity-40 hover:opacity-80"}`}>
                    <XCircle className={`w-3.5 h-3.5 ${selected.trangThai === "huy" ? "text-red-500" : "text-muted-foreground"}`} />
                    <span className="text-[10px] text-muted-foreground">Hủy</span>
                  </button>
                </div>
              </div>

              {/* Payment */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Thanh toán</p>
                <div className="flex gap-2">
                  {(["chua","mot-phan","da-thanh-toan"] as ThanhToanStatus[]).map(s => (
                    <button key={s} onClick={() => handleThanhToanChange(selected.id, s)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${selected.thanhToan === s ? `${THANH_TOAN_CFG[s].color} border-current` : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                      {THANH_TOAN_CFG[s].label}
                    </button>
                  ))}
                </div>
                {selected.daThanhToan > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs px-2">
                    <span className="text-muted-foreground">Đã thu: <strong className="text-emerald-700">{fmt(selected.daThanhToan)}</strong></span>
                    <span className="text-muted-foreground">Còn lại: <strong className="text-red-600">{fmt(selected.tongTien - selected.daThanhToan)}</strong></span>
                  </div>
                )}
              </div>

              {/* Customer */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Khách hàng</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{selected.khachHang}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${LOAI_KHACH_CFG[selected.loaiKhach].color}`}>{LOAI_KHACH_CFG[selected.loaiKhach].label}</span>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{selected.sdt}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{selected.diaChi}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div><p className="text-xs text-muted-foreground">Ngày đặt</p><p className="text-sm font-medium">{selected.ngayDat}</p></div>
                  <div><p className="text-xs text-muted-foreground">Ngày giao</p><p className="text-sm font-medium">{selected.ngayGiao || "Chưa xác định"}</p></div>
                  {selected.maVanDon && <div className="col-span-2"><p className="text-xs text-muted-foreground">Mã vận đơn</p><p className="text-sm font-mono font-medium">{selected.maVanDon}</p></div>}
                </div>
              </div>

              {/* Products + batch */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sản phẩm & Lô sản xuất</p>
                <div className="space-y-2">
                  {selected.sanPhams.map((sp, i) => {
                    const LOSX_QR_MAP: Record<string,{maDG:string,qr:string}> = {
                      "L013003":{maDG:"S013003",qr:"QR-S013003"},
                      "L023103":{maDG:"S023103",qr:"QR-S023103"},
                      "L033103":{maDG:"S033103",qr:"QR-S033103"},
                      "L043103":{maDG:"S043103",qr:"QR-S043103"},
                      "L053103":{maDG:"S053103",qr:"QR-S053103"},
                      "L063103":{maDG:"S063103",qr:"QR-S063103"},
                      "L073103":{maDG:"S073103",qr:"QR-S073103"},
                      "L083103":{maDG:"S083103",qr:"QR-S083103"},
                      "L09104": {maDG:"S09104", qr:"QR-S09104"},
                      "L010104":{maDG:"S010104",qr:"QR-S010104"},
                      "L011104":{maDG:"S011104",qr:"QR-S011104"},
                      "L012104":{maDG:"S012104",qr:"QR-S012104"},
                      "L013104":{maDG:"S013104",qr:"QR-S013104"},
                    };
                    const pkg = LOSX_QR_MAP[sp.maLoSX];
                    return (
                      <div key={i} className="border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRODUCT_COLORS[sp.loai] ?? "bg-gray-100 text-gray-600"}`}>{sp.loai}</span>
                            <span className="text-xs text-muted-foreground">{sp.sanPham}</span>
                          </div>
                          <span className="font-bold text-sm">{fmt(sp.thanhTien)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{sp.soLuong} {sp.donVi} × {sp.donGia.toLocaleString("vi-VN")} đ/kg</span>
                          <span className="flex items-center gap-1 font-mono bg-muted/50 px-2 py-0.5 rounded-md">
                            <Package className="w-3 h-3" /> {sp.maLoSX}
                          </span>
                        </div>
                        {pkg && (
                          <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs">
                              <QrCode className="w-3 h-3 text-violet-500" />
                              <span className="text-muted-foreground">Lô ĐG:</span>
                              <span className="font-mono font-semibold text-violet-700">{pkg.maDG}</span>
                            </div>
                            <span className="font-mono text-[10px] bg-violet-50 border border-violet-200 text-violet-600 px-2 py-0.5 rounded-md">{pkg.qr}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">Tổng giá trị đơn hàng</span>
                  <span className="text-xl font-bold text-emerald-700">{fmt(selected.tongTien)}</span>
                </div>
                {selected.ghiChu && <p className="text-xs text-emerald-600 mt-1.5 italic">Ghi chú: {selected.ghiChu}</p>}
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors"><Download className="w-3.5 h-3.5" /> In phiếu</button>
              <button onClick={() => handleDelete(selected.id)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Order Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Tạo đơn / Báo giá mới</span></div>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Customer — searchable combobox + QR */}
              <div ref={custRef}>
                <label className="block text-xs font-semibold mb-1.5">Khách hàng <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {/* Combobox */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      value={fCustSearch}
                      onChange={e => { setFCustSearch(e.target.value); setFCust(""); setShowCustDrop(true); }}
                      onFocus={() => setShowCustDrop(true)}
                      placeholder="Tìm tên, SĐT, địa chỉ..."
                      className={`w-full pl-9 pr-8 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${fCust ? "border-primary bg-primary/5" : "border-border bg-background"}`}
                    />
                    {fCust && (
                      <button onClick={resetCustSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Dropdown list */}
                    {showCustDrop && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                        {custFiltered.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-muted-foreground">Không tìm thấy khách hàng</p>
                        ) : custFiltered.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={() => selectCust(c.id)}
                            className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-start gap-3 ${fCust === c.id ? "bg-primary/10" : ""}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{c.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${LOAI_KHACH_CFG[c.loai].color}`}>{LOAI_KHACH_CFG[c.loai].label}</span>
                                <Phone className="w-3 h-3" />{c.sdt}
                              </p>
                            </div>
                            {fCust === c.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* QR scan button */}
                  <button
                    type="button"
                    onClick={() => { setShowQrScanner(true); setQrInput(""); setQrError(""); }}
                    className="w-11 h-[42px] flex items-center justify-center border border-border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors shrink-0 text-muted-foreground hover:text-primary"
                    title="Quét mã QR khách hàng"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected customer info */}
                {selectedCust && (
                  <div className="mt-1.5 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3 text-xs">
                    <div className="flex-1 flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{selectedCust.diaChi}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{selectedCust.sdt}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${LOAI_KHACH_CFG[selectedCust.loai].color}`}>{LOAI_KHACH_CFG[selectedCust.loai].label}</span>
                  </div>
                )}
              </div>

              {/* QR Scanner modal */}
              {showQrScanner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQrScanner(false)} />
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><QrCode className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Quét mã QR Khách hàng</span></div>
                      <button onClick={() => setShowQrScanner(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
                    </div>

                    {/* Viewfinder */}
                    <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90" />
                      <div className="relative z-10 w-44 h-44">
                        {/* Corner brackets */}
                        {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos, cls], i) => (
                          <div key={i} className={`absolute w-8 h-8 border-primary ${pos} ${cls}`} />
                        ))}
                        {/* Scan line */}
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/80 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-white/20" />
                        </div>
                      </div>
                      <p className="absolute bottom-3 text-xs text-white/60">Đưa mã QR vào khung</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center">Hoặc nhập mã khách hàng / tên để tra cứu</p>
                      <div className="flex gap-2">
                        <input
                          value={qrInput}
                          onChange={e => { setQrInput(e.target.value); setQrError(""); }}
                          onKeyDown={e => e.key === "Enter" && handleQrScan()}
                          placeholder="C001 / KH-001 / Tên KH..."
                          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <button
                          onClick={handleQrScan}
                          disabled={!qrInput || qrScanning}
                          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors"
                        >
                          {qrScanning ? "..." : "Tìm"}
                        </button>
                      </div>
                      {qrError && <p className="text-xs text-red-500 text-center">{qrError}</p>}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {CUSTOMERS.map(c => (
                          <button key={c.id} type="button" onMouseDown={() => { selectCust(c.id); setShowQrScanner(false); }}
                            className="text-[10px] px-2 py-1.5 border border-border rounded-lg hover:bg-primary/5 hover:border-primary text-left truncate transition-colors">
                            <span className="font-mono text-primary">{c.id}</span><br /><span className="text-muted-foreground">{c.name.split(" ").slice(-1)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold mb-1.5">Ngày đặt</label><input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Ngày giao dự kiến</label><input type="date" value={fDeliv} onChange={e => setFDeliv(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>

              {/* Product lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold">Sản phẩm <span className="text-red-500">*</span></label>
                  <button onClick={addLine} className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3" /> Thêm dòng</button>
                </div>
                <div className="space-y-2">
                  {fLines.map((line, i) => (
                    <div key={i} className="border border-border rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <select value={line.loai} onChange={e => updateLine(i, "loai", e.target.value)} className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                          {PRODUCTS.map(p => <option key={p.loai} value={p.loai}>{p.loai}</option>)}
                        </select>
                        {fLines.length > 1 && <button onClick={() => removeLine(i)} className="ml-2 p-1 hover:bg-red-50 rounded-md text-muted-foreground hover:text-red-500"><X className="w-3.5 h-3.5" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Số lượng (kg)</p>
                          <input type="number" value={line.soLuong} onChange={e => updateLine(i, "soLuong", e.target.value)} placeholder="0" className="w-full text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Đơn giá (đ/kg)</p>
                          <input type="number" value={line.donGia} onChange={e => updateLine(i, "donGia", e.target.value)} className="w-full text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground"><Package className="w-3 h-3" /> Lô: <span className="font-mono">{line.maLoSX}</span></span>
                        {line.soLuong && line.donGia && <span className="font-semibold text-primary">{fmt(parseFloat(line.soLuong) * parseFloat(line.donGia))}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {fTotal > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">Tổng giá trị</span>
                  <span className="text-xl font-bold text-emerald-700">{fmt(fTotal)}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5">Ghi chú</label>
                <textarea value={fNote} onChange={e => setFNote(e.target.value)} rows={2} placeholder="Ghi chú đơn hàng..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors">Hủy</button>
              <button onClick={handleCreate} disabled={!fCust || fTotal === 0}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tạo báo giá
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
