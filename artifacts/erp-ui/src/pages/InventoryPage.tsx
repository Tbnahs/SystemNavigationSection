import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, X,
  ChevronDown, ChevronUp, FileText, FileSpreadsheet, Printer,
  Package, TrendingDown, TrendingUp, AlertTriangle, Edit2, Eye,
} from "lucide-react";

interface StockItem {
  id: string;
  maSP: string;
  tenSP: string;
  loai: string;
  nhom: string;
  donVi: string;
  tonDau: number;
  nhapKho: number;
  xuatKho: number;
  tonCuoi: number;
  donGia: number;
  trangThai: "binh-thuong" | "sap-het" | "het-hang";
}

const STATUS_CFG = {
  "binh-thuong": { label: "Bình thường", color: "bg-emerald-100 text-emerald-700" },
  "sap-het":     { label: "Sắp hết",    color: "bg-amber-100  text-amber-700"  },
  "het-hang":    { label: "Hết hàng",   color: "bg-red-100    text-red-600"    },
};

const STOCK: StockItem[] = [
  { id:"1", maSP:"NL-001", tenSP:"Chè búp tươi loại 1 (tôm)", nhom:"Nguyên liệu", loai:"Đầu vào", donVi:"kg", tonDau:820, nhapKho:2640, xuatKho:3100, tonCuoi:360, donGia:520000, trangThai:"binh-thuong" },
  { id:"2", maSP:"NL-002", tenSP:"Chè búp tươi loại 2", nhom:"Nguyên liệu", loai:"Đầu vào", donVi:"kg", tonDau:540, nhapKho:1850, xuatKho:2200, tonCuoi:190, donGia:280000, trangThai:"sap-het" },
  { id:"3", maSP:"TP-001", tenSP:"Chè xanh Bằng Phúc", nhom:"Thành phẩm", loai:"Chè xanh", donVi:"kg", tonDau:120, nhapKho:340, xuatKho:380, tonCuoi:80, donGia:420000, trangThai:"binh-thuong" },
  { id:"4", maSP:"TP-002", tenSP:"Hồng trà Shan Tuyết", nhom:"Thành phẩm", loai:"Hồng trà", donVi:"kg", tonDau:90, nhapKho:210, xuatKho:260, tonCuoi:40, donGia:850000, trangThai:"sap-het" },
  { id:"5", maSP:"TP-003", tenSP:"Bạch trà Shan Tuyết", nhom:"Thành phẩm", loai:"Bạch trà", donVi:"kg", tonDau:30, nhapKho:65, xuatKho:82, tonCuoi:13, donGia:1200000, trangThai:"sap-het" },
  { id:"6", maSP:"TP-004", tenSP:"Phổ nhĩ Bằng Phúc", nhom:"Thành phẩm", loai:"Phổ nhĩ", donVi:"kg", tonDau:25, nhapKho:40, xuatKho:55, tonCuoi:10, donGia:980000, trangThai:"sap-het" },
  { id:"7", maSP:"TP-005", tenSP:"Chè Shan đặc biệt (cổ thụ)", nhom:"Thành phẩm", loai:"Đặc biệt", donVi:"kg", tonDau:15, nhapKho:28, xuatKho:38, tonCuoi:5, donGia:2500000, trangThai:"sap-het" },
  { id:"8", maSP:"PK-001", tenSP:"Hộp giấy 100g", nhom:"Bao bì", loai:"Đóng gói", donVi:"cái", tonDau:2000, nhapKho:5000, xuatKho:4800, tonCuoi:2200, donGia:15000, trangThai:"binh-thuong" },
  { id:"9", maSP:"PK-002", tenSP:"Hộp thiếc 250g", nhom:"Bao bì", loai:"Đóng gói", donVi:"cái", tonDau:500, nhapKho:1000, xuatKho:1420, tonCuoi:80, donGia:45000, trangThai:"sap-het" },
  { id:"10", maSP:"PK-003", tenSP:"Túi kraft 50g", nhom:"Bao bì", loai:"Đóng gói", donVi:"cái", tonDau:3000, nhapKho:8000, xuatKho:9200, tonCuoi:1800, donGia:5000, trangThai:"binh-thuong" },
  { id:"11", maSP:"PK-004", tenSP:"Nhãn dán OCOP", nhom:"Bao bì", loai:"Đóng gói", donVi:"tờ", tonDau:5000, nhapKho:10000, xuatKho:13200, tonCuoi:1800, donGia:1200, trangThai:"binh-thuong" },
  { id:"12", maSP:"VT-001", tenSP:"Túi lọc trà", nhom:"Vật tư", loai:"Vật tư", donVi:"cái", tonDau:1000, nhapKho:3000, xuatKho:3800, tonCuoi:200, donGia:800, trangThai:"sap-het" },
  { id:"13", maSP:"VT-002", tenSP:"Nhiên liệu đốt lò (củi)", nhom:"Vật tư", loai:"Vật tư", donVi:"kg", tonDau:300, nhapKho:800, xuatKho:1050, tonCuoi:50, donGia:3500, trangThai:"sap-het" },
  { id:"14", maSP:"TP-006", tenSP:"Chè xanh hữu cơ (organic)", nhom:"Thành phẩm", loai:"Chè xanh", donVi:"kg", tonDau:0, nhapKho:0, xuatKho:0, tonCuoi:0, donGia:680000, trangThai:"het-hang" },
];

function fmt(v: number) { return v.toLocaleString("vi-VN"); }
function fmtMoney(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN");
}

const EMPTY_NHAP = { maSP: STOCK[0].maSP, soLuong: "", ngayNhap: new Date().toISOString().slice(0, 10), nhaCungCap: "", ghiChu: "" };

function calcTrangThai(tonCuoi: number, tonDau: number): StockItem["trangThai"] {
  if (tonCuoi <= 0) return "het-hang";
  const ngưỡng = Math.max(tonDau * 0.15, 50);
  if (tonCuoi <= ngưỡng) return "sap-het";
  return "binh-thuong";
}

export default function InventoryPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [nhomFilter, setNhomFilter] = useState("");
  const [sortKey, setSortKey] = useState("maSP");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [stockList, setStockList] = useState<StockItem[]>(STOCK);
  const [showNhap, setShowNhap] = useState(false);
  const [nhapForm, setNhapForm] = useState(EMPTY_NHAP);

  const handleNhapKho = () => {
    const qty = parseInt(nhapForm.soLuong, 10);
    if (!qty || qty <= 0) return;
    setStockList(prev => prev.map(item => {
      if (item.maSP !== nhapForm.maSP) return item;
      const newNhap = item.nhapKho + qty;
      const newTon = item.tonCuoi + qty;
      return { ...item, nhapKho: newNhap, tonCuoi: newTon, trangThai: calcTrangThai(newTon, item.tonDau) };
    }));
    setNhapForm(EMPTY_NHAP);
    setShowNhap(false);
  };

  const filtered = useMemo(() => {
    let d = stockList;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(s => s.maSP.toLowerCase().includes(q) || s.tenSP.toLowerCase().includes(q) || s.loai.toLowerCase().includes(q));
    }
    if (nhomFilter) d = d.filter(s => s.nhom === nhomFilter);
    return [...d].sort((a, b) => {
      const av = (a as Record<string,unknown>)[sortKey];
      const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [stockList, search, nhomFilter, sortKey, sortDir]);

  const totalValue = stockList.reduce((s, i) => s + i.tonCuoi * i.donGia, 0);
  const lowStockCount = stockList.filter(i => i.trangThai === "sap-het").length;
  const outCount = stockList.filter(i => i.trangThai === "het-hang").length;

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
            <h1 className="text-xl font-bold text-foreground">Quản lý Kho hàng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Tồn kho nguyên liệu &amp; thành phẩm</p>
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
            <button onClick={() => setShowNhap(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Nhập kho
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Package,       label: "Tổng mặt hàng",  value: `${stockList.length} SKU`,     sub: "đang quản lý",      color: "text-blue-600 bg-blue-50" },
          { icon: TrendingUp,    label: "Giá trị tồn kho", value: fmtMoney(totalValue) + " đ",   sub: "ước tính cuối kỳ",  color: "text-emerald-600 bg-emerald-50" },
          { icon: AlertTriangle, label: "Sắp hết hàng",   value: `${lowStockCount} mặt hàng`,   sub: "cần nhập thêm",     color: "text-amber-600 bg-amber-50" },
          { icon: TrendingDown,  label: "Hết hàng",       value: `${outCount} mặt hàng`,         sub: "tồn kho = 0",       color: "text-red-600 bg-red-50" },
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

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã SP, tên sản phẩm..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={nhomFilter} onChange={e => setNhomFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả nhóm</option>
            {["Nguyên liệu","Thành phẩm","Bao bì","Vật tư"].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={() => { setSearch(""); setNhomFilter(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "maSP", label: "Mã SP" },
                  { key: "tenSP", label: "Sản phẩm" },
                  { key: "nhom", label: "Nhóm" },
                  { key: "tonDau", label: "Tồn đầu" },
                  { key: "nhapKho", label: "Nhập" },
                  { key: "xuatKho", label: "Xuất" },
                  { key: "tonCuoi", label: "Tồn cuối" },
                  { key: "donGia", label: "Giá trị" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const sc = STATUS_CFG[item.trangThai];
                const giaTriTon = item.tonCuoi * item.donGia;
                return (
                  <tr key={item.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(item)}>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{item.maSP}</span></td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{item.tenSP}</p>
                      <p className="text-xs text-muted-foreground">{item.loai} · {item.donVi}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.nhom}</td>
                    <td className="py-3 px-4 text-right text-sm">{fmt(item.tonDau)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-emerald-600">+{fmt(item.nhapKho)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-red-500">-{fmt(item.xuatKho)}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold">{fmt(item.tonCuoi)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-foreground">{fmtMoney(giaTriTon)} đ</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có sản phẩm nào phù hợp</div>}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {stockList.length} mặt hàng</p>
          <p className="text-xs font-semibold text-foreground">Tổng giá trị tồn: {fmtMoney(filtered.reduce((s, i) => s + i.tonCuoi * i.donGia, 0))} đ</p>
        </div>
      </div>

      {showNhap && (() => {
        const selItem = stockList.find(s => s.maSP === nhapForm.maSP)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowNhap(false); setNhapForm(EMPTY_NHAP); }} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">Phiếu nhập kho</h2>
                <button onClick={() => { setShowNhap(false); setNhapForm(EMPTY_NHAP); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Sản phẩm <span className="text-red-500">*</span></label>
                  <select value={nhapForm.maSP} onChange={e => setNhapForm(f => ({ ...f, maSP: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {stockList.map(s => <option key={s.maSP} value={s.maSP}>{s.maSP} – {s.tenSP}</option>)}
                  </select>
                  {selItem && (
                    <div className="mt-2 flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                      <span>Tồn hiện tại: <b className="text-foreground">{fmt(selItem.tonCuoi)} {selItem.donVi}</b></span>
                      <span className={`ml-auto inline-flex px-2 py-0.5 rounded-full font-medium ${STATUS_CFG[selItem.trangThai].color}`}>{STATUS_CFG[selItem.trangThai].label}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Số lượng nhập <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="number" min="1" value={nhapForm.soLuong} onChange={e => setNhapForm(f => ({ ...f, soLuong: e.target.value }))} placeholder="0" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      {selItem && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{selItem.donVi}</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ngày nhập</label>
                    <input type="date" value={nhapForm.ngayNhap} onChange={e => setNhapForm(f => ({ ...f, ngayNhap: e.target.value }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nhà cung cấp / Nguồn gốc</label>
                  <input value={nhapForm.nhaCungCap} onChange={e => setNhapForm(f => ({ ...f, nhaCungCap: e.target.value }))} placeholder="Tên nhà cung cấp hoặc nguồn gốc..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi chú</label>
                  <textarea value={nhapForm.ghiChu} onChange={e => setNhapForm(f => ({ ...f, ghiChu: e.target.value }))} rows={2} placeholder="Ghi chú thêm..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                </div>
                {nhapForm.soLuong && parseInt(nhapForm.soLuong) > 0 && selItem && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
                    <p className="text-xs text-emerald-700 font-medium mb-1">Sau khi nhập</p>
                    <p className="font-bold text-emerald-700">{fmt(selItem.tonCuoi + parseInt(nhapForm.soLuong))} {selItem.donVi} tồn kho</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <button onClick={() => { setShowNhap(false); setNhapForm(EMPTY_NHAP); }} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
                <button onClick={handleNhapKho} disabled={!nhapForm.soLuong || parseInt(nhapForm.soLuong) <= 0} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Xác nhận nhập kho
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selected.maSP}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.nhom} · {selected.loai}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <h3 className="font-semibold text-foreground">{selected.tenSP}</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_CFG[selected.trangThai].color}`}>
                {STATUS_CFG[selected.trangThai].label}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tồn đầu kỳ", value: fmt(selected.tonDau) + " " + selected.donVi },
                  { label: "Đơn vị tính", value: selected.donVi },
                  { label: "Nhập kho", value: "+" + fmt(selected.nhapKho) + " " + selected.donVi },
                  { label: "Xuất kho", value: "-" + fmt(selected.xuatKho) + " " + selected.donVi },
                  { label: "Tồn cuối kỳ", value: fmt(selected.tonCuoi) + " " + selected.donVi },
                  { label: "Đơn giá", value: fmt(selected.donGia) + " đ/" + selected.donVi },
                ].map((r, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{r.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-700 font-semibold">Giá trị tồn kho hiện tại</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{fmtMoney(selected.tonCuoi * selected.donGia)} đ</p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">
                <Eye className="w-3.5 h-3.5" /> Lịch sử
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Điều chỉnh
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
