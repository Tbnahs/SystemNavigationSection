import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter, Download,
  ChevronDown, ChevronUp, Eye, MoreHorizontal,
  CheckCircle2, Clock, Truck, XCircle, FileText,
  TrendingUp, ShoppingBag, Users, Package,
  X, ChevronRight, Trash2, Edit2,
} from "lucide-react";

type OrderStatus = "nhap" | "xac-nhan" | "dang-giao" | "hoan-thanh" | "huy";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "nhap":        { label: "Nháp",         color: "bg-gray-100 text-gray-600",    icon: FileText },
  "xac-nhan":    { label: "Xác nhận",     color: "bg-blue-100 text-blue-700",    icon: CheckCircle2 },
  "dang-giao":   { label: "Đang giao",    color: "bg-amber-100 text-amber-700",  icon: Truck },
  "hoan-thanh":  { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "huy":         { label: "Đã hủy",       color: "bg-red-100 text-red-600",      icon: XCircle },
};

interface OrderLine {
  sanPham: string;
  loai: string;
  soLuong: number;
  donVi: string;
  donGia: number;
  thanhTien: number;
}

interface SalesOrder {
  id: string;
  maDon: string;
  khachHang: string;
  diaChi: string;
  sdt: string;
  ngayDat: string;
  ngayGiao: string;
  trangThai: OrderStatus;
  sanPhams: OrderLine[];
  tongTien: number;
  ghiChu: string;
  nguoiTao: string;
}

const ordersData: SalesOrder[] = [
  {
    id: "1", maDon: "DBH-2604-001", khachHang: "Cty TNHH Trà Thái Nguyên", diaChi: "TP. Thái Nguyên", sdt: "0208 3856 123",
    ngayDat: "26/03/2026", ngayGiao: "02/04/2026", trangThai: "hoan-thanh", nguoiTao: "Nguyễn Văn A",
    ghiChu: "Giao hàng nguyên kiện, có xe tải",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà", soLuong: 20, donVi: "kg", donGia: 850000, thanhTien: 17000000 },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Bạch trà", soLuong: 5, donVi: "kg", donGia: 1200000, thanhTien: 6000000 },
    ],
    tongTien: 23000000,
  },
  {
    id: "2", maDon: "DBH-2604-002", khachHang: "HTX Chè Tân Cương", diaChi: "Tân Cương, Thái Nguyên", sdt: "0208 3777 456",
    ngayDat: "28/03/2026", ngayGiao: "05/04/2026", trangThai: "dang-giao", nguoiTao: "Trần Thị B",
    ghiChu: "",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 50, donVi: "kg", donGia: 420000, thanhTien: 21000000 },
    ],
    tongTien: 21000000,
  },
  {
    id: "3", maDon: "DBH-0104-003", khachHang: "Cty CP Xuất nhập khẩu Hà Nội", diaChi: "Hà Nội", sdt: "024 3825 6789",
    ngayDat: "01/04/2026", ngayGiao: "10/04/2026", trangThai: "xac-nhan", nguoiTao: "Nguyễn Văn A",
    ghiChu: "Đơn xuất khẩu, cần giấy chứng nhận OCOP",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà", soLuong: 30, donVi: "kg", donGia: 850000, thanhTien: 25500000 },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Bạch trà", soLuong: 10, donVi: "kg", donGia: 1200000, thanhTien: 12000000 },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 20, donVi: "kg", donGia: 420000, thanhTien: 8400000 },
    ],
    tongTien: 45900000,
  },
  {
    id: "4", maDon: "DBH-0204-004", khachHang: "Siêu thị Lotte Mart Hà Nội", diaChi: "Đống Đa, Hà Nội", sdt: "024 3562 7890",
    ngayDat: "02/04/2026", ngayGiao: "08/04/2026", trangThai: "xac-nhan", nguoiTao: "Trần Thị B",
    ghiChu: "Yêu cầu đóng gói hộp quà tặng",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Bạch trà", soLuong: 8, donVi: "kg", donGia: 1200000, thanhTien: 9600000 },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà", soLuong: 12, donVi: "kg", donGia: 850000, thanhTien: 10200000 },
    ],
    tongTien: 19800000,
  },
  {
    id: "5", maDon: "DBH-0304-005", khachHang: "Quán trà Sen – Đỗ Thị Mai", diaChi: "Quận 1, TP.HCM", sdt: "090 3456 789",
    ngayDat: "03/04/2026", ngayGiao: "12/04/2026", trangThai: "nhap", nguoiTao: "Lê Văn C",
    ghiChu: "Khách hàng mới, thử nghiệm",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 5, donVi: "kg", donGia: 420000, thanhTien: 2100000 },
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Hồng trà", soLuong: 2, donVi: "kg", donGia: 850000, thanhTien: 1700000 },
    ],
    tongTien: 3800000,
  },
  {
    id: "6", maDon: "DBH-0304-006", khachHang: "Nhà phân phối Hoàng Phát", diaChi: "Bắc Giang", sdt: "0204 3987 654",
    ngayDat: "03/04/2026", ngayGiao: "09/04/2026", trangThai: "nhap", nguoiTao: "Nguyễn Văn A",
    ghiChu: "",
    sanPhams: [
      { sanPham: "Chè Shan Tuyết Bằng Phúc", loai: "Chè xanh", soLuong: 100, donVi: "kg", donGia: 380000, thanhTien: 38000000 },
    ],
    tongTien: 38000000,
  },
];

function formatCurrency(v: number) {
  return v.toLocaleString("vi-VN") + " đ";
}

const STATUS_FLOW: OrderStatus[] = ["nhap", "xac-nhan", "dang-giao", "hoan-thanh"];

export default function SalesPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sortKey, setSortKey] = useState("ngayDat");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [orders, setOrders] = useState<SalesOrder[]>(ordersData);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, trangThai: newStatus } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder((o) => o ? { ...o, trangThai: newStatus } : o);
  };

  const filtered = useMemo(() => {
    let data = orders;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((o) =>
        o.maDon.toLowerCase().includes(q) ||
        o.khachHang.toLowerCase().includes(q) ||
        o.diaChi.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter((o) => o.trangThai === statusFilter);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const totalRevenue = orders.filter((o) => o.trangThai !== "huy").reduce((s, o) => s + o.tongTien, 0);
  const completedCount = orders.filter((o) => o.trangThai === "hoan-thanh").length;
  const pendingCount = orders.filter((o) => ["nhap", "xac-nhan", "dang-giao"].includes(o.trangThai)).length;

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

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
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Đơn bán hàng</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tạo đơn hàng
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp, label: "Doanh thu", value: formatCurrency(totalRevenue), sub: "tổng kỳ", color: "text-emerald-600 bg-emerald-50" },
          { icon: ShoppingBag, label: "Tổng đơn", value: `${orders.length} đơn`, sub: "đã tạo", color: "text-blue-600 bg-blue-50" },
          { icon: Clock, label: "Đang xử lý", value: `${pendingCount} đơn`, sub: "cần xử lý", color: "text-amber-600 bg-amber-50" },
          { icon: CheckCircle2, label: "Hoàn thành", value: `${completedCount} đơn`, sub: "giao thành công", color: "text-violet-600 bg-violet-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-base font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn, khách hàng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")} className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Xuất
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "maDon", label: "Mã đơn" },
                  { key: "khachHang", label: "Khách hàng" },
                  { key: "ngayDat", label: "Ngày đặt" },
                  { key: "ngayGiao", label: "Ngày giao" },
                  { key: "tongTien", label: "Tổng tiền" },
                  { key: "trangThai", label: "Trạng thái" },
                ].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const sc = STATUS_CONFIG[order.trangThai];
                const Icon = sc.icon;
                return (
                  <tr key={order.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-primary">{order.maDon}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{order.khachHang}</p>
                      <p className="text-xs text-muted-foreground">{order.diaChi}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{order.ngayDat}</td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{order.ngayGiao}</td>
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">{formatCurrency(order.tongTien)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        <Icon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors" title="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Không có đơn hàng nào phù hợp</div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {orders.length} đơn hàng</p>
          <p className="text-xs font-semibold text-foreground">
            Tổng: {formatCurrency(filtered.filter((o) => o.trangThai !== "huy").reduce((s, o) => s + o.tongTien, 0))}
          </p>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selectedOrder.maDon}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Tạo bởi {selectedOrder.nguoiTao} · {selectedOrder.ngayDat}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 px-5 py-4 space-y-5">
              {/* Status stepper */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Trạng thái đơn hàng</p>
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((s, i) => {
                    const sc = STATUS_CONFIG[s];
                    const isActive = STATUS_FLOW.indexOf(selectedOrder.trangThai) >= i;
                    const isCurrent = selectedOrder.trangThai === s;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, s)}
                          className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-all ${
                            isCurrent ? "bg-primary/10 border border-primary/30" :
                            isActive ? "bg-muted/50" : "opacity-40"
                          }`}
                        >
                          <sc.icon className={`w-4 h-4 ${isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`} />
                          <span className={`text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{sc.label}</span>
                        </button>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`h-0.5 w-2 shrink-0 ${STATUS_FLOW.indexOf(selectedOrder.trangThai) > i ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, "huy")}
                    className={`ml-2 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${selectedOrder.trangThai === "huy" ? "bg-red-50 border border-red-200" : "opacity-40 hover:opacity-80"}`}
                  >
                    <XCircle className={`w-4 h-4 ${selectedOrder.trangThai === "huy" ? "text-red-500" : "text-muted-foreground"}`} />
                    <span className="text-xs text-muted-foreground">Hủy</span>
                  </button>
                </div>
              </div>

              {/* Customer info */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin khách hàng</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Tên khách hàng</p>
                    <p className="text-sm font-semibold">{selectedOrder.khachHang}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Số điện thoại</p>
                    <p className="text-sm font-semibold">{selectedOrder.sdt}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Địa chỉ</p>
                    <p className="text-sm font-semibold">{selectedOrder.diaChi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày đặt hàng</p>
                    <p className="text-sm font-semibold">{selectedOrder.ngayDat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày giao hàng</p>
                    <p className="text-sm font-semibold">{selectedOrder.ngayGiao}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.sanPhams.map((sp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{sp.loai}</p>
                          <p className="text-xs text-muted-foreground">{sp.sanPham}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(sp.thanhTien)}</p>
                        <p className="text-xs text-muted-foreground">{sp.soLuong} {sp.donVi} × {sp.donGia.toLocaleString("vi-VN")} đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">Tổng giá trị đơn hàng</span>
                  <span className="text-xl font-bold text-emerald-700">{formatCurrency(selectedOrder.tongTien)}</span>
                </div>
                {selectedOrder.ghiChu && (
                  <p className="text-xs text-emerald-600 mt-2 italic">Ghi chú: {selectedOrder.ghiChu}</p>
                )}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">
                <Download className="w-3.5 h-3.5" /> In phiếu
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Tạo đơn bán hàng mới</span>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Khách hàng <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Tên khách hàng / công ty" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Số điện thoại</label>
                  <input type="text" placeholder="0xxx xxx xxx" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Ngày giao hàng</label>
                  <input type="date" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Địa chỉ giao hàng</label>
                <input type="text" placeholder="Địa chỉ..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Sản phẩm <span className="text-red-500">*</span></label>
                {["Chè xanh", "Hồng trà", "Bạch trà"].map((sp) => (
                  <div key={sp} className="flex items-center gap-2 mb-2">
                    <span className="text-sm flex-1">{sp}</span>
                    <input type="number" placeholder="0 kg" min="0" step="0.5" className="w-24 px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-right" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Ghi chú</label>
                <textarea rows={2} placeholder="Yêu cầu đặc biệt..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50">Hủy</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Tạo đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
