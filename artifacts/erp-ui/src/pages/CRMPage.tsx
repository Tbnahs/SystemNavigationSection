import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, ChevronUp, Users, Star, TrendingUp, MapPin,
  Phone, Mail, X, Building2, User,
} from "lucide-react";

type LoaiKH = "doanh-nghiep" | "ca-nhan" | "hop-tac-xa";
type HangKH = "vang" | "bac" | "dong" | "moi";

interface KhachHang {
  id: string;
  maKH: string;
  tenKH: string;
  loai: LoaiKH;
  hang: HangKH;
  diaChi: string;
  sdt: string;
  email: string;
  tongMua: number;
  soLanMua: number;
  ngayMuaCuoi: string;
  ghiChu: string;
}

const HANG_CFG = {
  "vang": { label: "Vàng",  color: "bg-yellow-100 text-yellow-700",  star: 3 },
  "bac":  { label: "Bạc",   color: "bg-gray-100   text-gray-600",    star: 2 },
  "dong": { label: "Đồng",  color: "bg-orange-100 text-orange-700",  star: 1 },
  "moi":  { label: "Mới",   color: "bg-blue-100   text-blue-600",    star: 0 },
};

const LOAI_CFG = {
  "doanh-nghiep": { label: "Doanh nghiệp", icon: Building2 },
  "ca-nhan":      { label: "Cá nhân",      icon: User },
  "hop-tac-xa":   { label: "Hợp tác xã",  icon: Users },
};

const KH_DATA: KhachHang[] = [
  { id:"1",  maKH:"KH-001", tenKH:"Cty TNHH Trà Thái Nguyên",         loai:"doanh-nghiep", hang:"vang",  diaChi:"TP. Thái Nguyên",          sdt:"0208 3856 123", email:"contact@trathainuyen.vn",   tongMua:186000000, soLanMua:9,  ngayMuaCuoi:"2026-03-26", ghiChu:"Đối tác lâu năm, ưu tiên giao hàng" },
  { id:"2",  maKH:"KH-002", tenKH:"HTX Chè Tân Cương",                 loai:"hop-tac-xa",   hang:"vang",  diaChi:"Tân Cương, Thái Nguyên",   sdt:"0208 3777 456", email:"tantuong@htxche.vn",        tongMua:145000000, soLanMua:7,  ngayMuaCuoi:"2026-03-28", ghiChu:"Nhận hàng định kỳ hàng tháng" },
  { id:"3",  maKH:"KH-003", tenKH:"Cty CP Xuất nhập khẩu Hà Nội",     loai:"doanh-nghiep", hang:"vang",  diaChi:"Hà Nội",                   sdt:"024 3825 6789", email:"xnk@hanoi-trade.vn",        tongMua:220000000, soLanMua:5,  ngayMuaCuoi:"2026-04-01", ghiChu:"Xuất khẩu, cần giấy OCOP + xuất xứ" },
  { id:"4",  maKH:"KH-004", tenKH:"Siêu thị Lotte Mart Hà Nội",       loai:"doanh-nghiep", hang:"bac",   diaChi:"Đống Đa, Hà Nội",          sdt:"024 3562 7890", email:"procurement@lotte.vn",      tongMua:78000000,  soLanMua:4,  ngayMuaCuoi:"2026-04-02", ghiChu:"Đóng gói hộp quà tặng, dán nhãn riêng" },
  { id:"5",  maKH:"KH-005", tenKH:"Nhà phân phối Hoàng Phát",         loai:"doanh-nghiep", hang:"bac",   diaChi:"Bắc Giang",                sdt:"0204 3987 654", email:"hoangphat@gmail.com",       tongMua:95000000,  soLanMua:3,  ngayMuaCuoi:"2026-04-03", ghiChu:"Phân phối vùng Đông Bắc" },
  { id:"6",  maKH:"KH-006", tenKH:"Khách sạn Mường Thanh Hà Giang",   loai:"doanh-nghiep", hang:"bac",   diaChi:"Hà Giang",                 sdt:"0219 3851 234", email:"fb@muongthanh-hagiang.vn",  tongMua:42000000,  soLanMua:6,  ngayMuaCuoi:"2026-03-15", ghiChu:"Chè pha sẵn cho khách lưu trú" },
  { id:"7",  maKH:"KH-007", tenKH:"Cty TNHH Thực phẩm Sao Việt",     loai:"doanh-nghiep", hang:"bac",   diaChi:"TP.HCM",                   sdt:"028 3823 4567", email:"saoviet@food.vn",           tongMua:67000000,  soLanMua:4,  ngayMuaCuoi:"2026-03-20", ghiChu:"Nguyên liệu cho dòng đồ uống RTD" },
  { id:"8",  maKH:"KH-008", tenKH:"Quán trà Sen – Đỗ Thị Mai",       loai:"ca-nhan",      hang:"dong",  diaChi:"Quận 1, TP.HCM",           sdt:"090 3456 789",  email:"tranMai@gmail.com",         tongMua:12000000,  soLanMua:3,  ngayMuaCuoi:"2026-04-03", ghiChu:"Khách hàng mới, tiềm năng" },
  { id:"9",  maKH:"KH-009", tenKH:"Trần Văn Đức (cá nhân)",           loai:"ca-nhan",      hang:"dong",  diaChi:"Hải Phòng",                sdt:"031 3512 9876", email:"tranvanduc@gmail.com",      tongMua:8500000,   soLanMua:2,  ngayMuaCuoi:"2026-03-10", ghiChu:"Mua quà tặng" },
  { id:"10", maKH:"KH-010", tenKH:"Cửa hàng đặc sản Bắc Kạn",        loai:"ca-nhan",      hang:"dong",  diaChi:"TP. Bắc Kạn",              sdt:"0209 3831 456", email:"dacsan.bk@gmail.com",       tongMua:25000000,  soLanMua:5,  ngayMuaCuoi:"2026-03-18", ghiChu:"Bán lẻ tại cửa hàng đặc sản" },
  { id:"11", maKH:"KH-011", tenKH:"Thư Trà – Nguyễn Thị Hồng",       loai:"ca-nhan",      hang:"moi",   diaChi:"Hà Nội",                   sdt:"098 7654 321",  email:"thutrahong@gmail.com",      tongMua:3800000,   soLanMua:1,  ngayMuaCuoi:"2026-04-03", ghiChu:"Đơn đầu tiên, thử nghiệm" },
  { id:"12", maKH:"KH-012", tenKH:"Cty CP Thực phẩm Organic Việt",   loai:"doanh-nghiep", hang:"moi",   diaChi:"Đà Nẵng",                  sdt:"0236 3851 234", email:"organic@ovfood.vn",         tongMua:0,         soLanMua:0,  ngayMuaCuoi:"-",          ghiChu:"Tiếp cận, đang đàm phán" },
];

function fmtMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + " tr đ";
  return v.toLocaleString("vi-VN") + " đ";
}

const EMPTY_FORM = { tenKH: "", loai: "doanh-nghiep" as LoaiKH, hang: "moi" as HangKH, diaChi: "", sdt: "", email: "", ghiChu: "" };

export default function CRMPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState("");
  const [hangFilter, setHangFilter] = useState("");
  const [sortKey, setSortKey] = useState("tongMua");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [selected, setSelected] = useState<KhachHang | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [khachHangs, setKhachHangs] = useState<KhachHang[]>(KH_DATA);

  const handleCreate = () => {
    if (!form.tenKH.trim()) return;
    const newId = String(khachHangs.length + 1);
    const maKH = `KH-${String(khachHangs.length + 1).padStart(3, "0")}`;
    const newKH: KhachHang = {
      id: newId, maKH, tenKH: form.tenKH.trim(), loai: form.loai,
      hang: form.hang, diaChi: form.diaChi, sdt: form.sdt,
      email: form.email, tongMua: 0, soLanMua: 0,
      ngayMuaCuoi: "-", ghiChu: form.ghiChu,
    };
    setKhachHangs(prev => [newKH, ...prev]);
    setForm(EMPTY_FORM);
    setShowCreate(false);
  };

  const filtered = useMemo(() => {
    let d = khachHangs;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(k => k.maKH.toLowerCase().includes(q) || k.tenKH.toLowerCase().includes(q) || k.diaChi.toLowerCase().includes(q));
    }
    if (loaiFilter) d = d.filter(k => k.loai === loaiFilter);
    if (hangFilter) d = d.filter(k => k.hang === hangFilter);
    return [...d].sort((a, b) => {
      const av = (a as Record<string,unknown>)[sortKey];
      const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [khachHangs, search, loaiFilter, hangFilter, sortKey, sortDir]);

  const totalRevenue = khachHangs.reduce((s, k) => s + k.tongMua, 0);
  const vangCount = khachHangs.filter(k => k.hang === "vang").length;
  const newCount  = khachHangs.filter(k => k.hang === "moi").length;

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
            <h1 className="text-xl font-bold text-foreground">Quản lý Khách hàng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Danh sách khách hàng &amp; đối tác</p>
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
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Thêm khách hàng
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users,     label: "Tổng khách hàng", value: `${khachHangs.length} KH`,       sub: "đang quản lý",     color: "text-blue-600 bg-blue-50" },
          { icon: TrendingUp, label: "Doanh thu KH",   value: fmtMoney(totalRevenue),        sub: "tích lũy",         color: "text-emerald-600 bg-emerald-50" },
          { icon: Star,       label: "Hạng Vàng",      value: `${vangCount} KH`,             sub: "khách trung thành",color: "text-yellow-600 bg-yellow-50" },
          { icon: Users,      label: "Khách hàng mới", value: `${newCount} KH`,              sub: "đang tiếp cận",    color: "text-violet-600 bg-violet-50" },
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã KH, tên, địa chỉ..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={loaiFilter} onChange={e => setLoaiFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả loại</option>
            {Object.entries(LOAI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={hangFilter} onChange={e => setHangFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả hạng</option>
            {Object.entries(HANG_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => { setSearch(""); setLoaiFilter(""); setHangFilter(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "tenKH",       label: "Khách hàng" },
                  { key: "loai",        label: "Loại" },
                  { key: "diaChi",      label: "Địa chỉ" },
                  { key: "soLanMua",    label: "Số lần mua" },
                  { key: "tongMua",     label: "Tổng mua" },
                  { key: "ngayMuaCuoi", label: "Mua gần nhất" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wide">Hạng</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const hc = HANG_CFG[k.hang];
                const lc = LOAI_CFG[k.loai];
                const LoaiIcon = lc.icon;
                return (
                  <tr key={k.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(k)}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{k.tenKH}</p>
                      <p className="text-xs text-muted-foreground font-mono">{k.maKH}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <LoaiIcon className="w-3.5 h-3.5" /> {lc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{k.diaChi}</td>
                    <td className="py-3 px-4 text-sm text-center font-semibold">{k.soLanMua}</td>
                    <td className="py-3 px-4 text-sm font-bold text-emerald-700">{k.tongMua > 0 ? fmtMoney(k.tongMua) : "—"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{k.ngayMuaCuoi}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${hc.color}`}>
                        {hc.star > 0 && <Star className="w-3 h-3 fill-current" />} {hc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không tìm thấy khách hàng nào</div>}
        </div>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {khachHangs.length} khách hàng</p>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Thêm khách hàng mới</h2>
              <button onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tên khách hàng <span className="text-red-500">*</span></label>
                <input value={form.tenKH} onChange={e => setForm(f => ({ ...f, tenKH: e.target.value }))} placeholder="Nhập tên khách hàng hoặc công ty..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Loại khách hàng</label>
                  <select value={form.loai} onChange={e => setForm(f => ({ ...f, loai: e.target.value as LoaiKH }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {Object.entries(LOAI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hạng khách hàng</label>
                  <select value={form.hang} onChange={e => setForm(f => ({ ...f, hang: e.target.value as HangKH }))} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {Object.entries(HANG_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Địa chỉ</label>
                <input value={form.diaChi} onChange={e => setForm(f => ({ ...f, diaChi: e.target.value }))} placeholder="Tỉnh / Thành phố..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Số điện thoại</label>
                  <input value={form.sdt} onChange={e => setForm(f => ({ ...f, sdt: e.target.value }))} placeholder="0xxx xxx xxx" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi chú</label>
                <textarea value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} rows={3} placeholder="Thông tin bổ sung, yêu cầu đặc biệt..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">Huỷ</button>
              <button onClick={handleCreate} disabled={!form.tenKH.trim()} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Lưu khách hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <p className="font-semibold text-foreground">{selected.tenKH}</p>
                <p className="text-xs text-muted-foreground font-mono">{selected.maKH} · {LOAI_CFG[selected.loai].label}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${HANG_CFG[selected.hang].color}`}>
                {HANG_CFG[selected.hang].star > 0 && <Star className="w-3 h-3 fill-current" />} Hạng {HANG_CFG[selected.hang].label}
              </span>
              <div className="space-y-2">
                {[
                  { icon: Phone,   label: "Số điện thoại",  value: selected.sdt },
                  { icon: Mail,    label: "Email",           value: selected.email },
                  { icon: MapPin,  label: "Địa chỉ",         value: selected.diaChi },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                    <r.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="text-sm font-medium">{r.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-emerald-700">Tổng mua</p>
                  <p className="text-lg font-bold text-emerald-700">{selected.tongMua > 0 ? fmtMoney(selected.tongMua) : "—"}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-700">Số lần mua</p>
                  <p className="text-lg font-bold text-blue-700">{selected.soLanMua} lần</p>
                </div>
              </div>
              {selected.ghiChu && (
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm italic text-foreground">{selected.ghiChu}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
