import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Filter, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, ChevronUp, Users, UserCheck, UserX, Clock,
  Phone, Mail, MapPin, X, Eye, Edit2, Trash2,
} from "lucide-react";

type TrangThaiNV = "dang-lam" | "nghi-phep" | "nghi-viec";

interface NhanVien {
  id: string;
  maNV: string;
  hoTen: string;
  phongBan: string;
  chucVu: string;
  sdt: string;
  email: string;
  diaChi: string;
  ngayVao: string;
  luong: number;
  trangThai: TrangThaiNV;
  avatarColor: string;
}

const TRANG_THAI_CFG = {
  "dang-lam":  { label: "Đang làm",   color: "bg-emerald-100 text-emerald-700", icon: UserCheck },
  "nghi-phep": { label: "Nghỉ phép",  color: "bg-amber-100  text-amber-700",   icon: Clock },
  "nghi-viec": { label: "Nghỉ việc",  color: "bg-red-100    text-red-600",      icon: UserX },
};

const PHONG_BAN = ["Ban Giám đốc", "Kế toán", "Thu mua", "Sản xuất", "Kinh doanh", "Kỹ thuật"];

const NHAN_VIEN: NhanVien[] = [
  { id:"1",  maNV:"NV-001", hoTen:"Lý Văn Phương",     phongBan:"Ban Giám đốc", chucVu:"Giám đốc HTX",          sdt:"0912 345 678", email:"phuong.ly@htxhongha.vn",      diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2010-03-15", luong:12000000, trangThai:"dang-lam", avatarColor:"bg-violet-500" },
  { id:"2",  maNV:"NV-002", hoTen:"Hoàng Thị Lan",     phongBan:"Ban Giám đốc", chucVu:"Phó Giám đốc",          sdt:"0913 456 789", email:"lan.hoang@htxhongha.vn",       diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2012-06-01", luong:10000000, trangThai:"dang-lam", avatarColor:"bg-pink-500" },
  { id:"3",  maNV:"NV-003", hoTen:"Nguyễn Văn An",     phongBan:"Kế toán",      chucVu:"Kế toán trưởng",         sdt:"0214 567 890", email:"an.nguyen@htxhongha.vn",       diaChi:"Chợ Đồn, Bắc Kạn",            ngayVao:"2013-09-10", luong:9000000,  trangThai:"dang-lam", avatarColor:"bg-blue-500" },
  { id:"4",  maNV:"NV-004", hoTen:"Trần Thị Bích",     phongBan:"Kế toán",      chucVu:"Kế toán viên",           sdt:"0913 678 901", email:"bich.tran@htxhongha.vn",       diaChi:"Chợ Đồn, Bắc Kạn",            ngayVao:"2018-02-01", luong:6500000,  trangThai:"dang-lam", avatarColor:"bg-fuchsia-500" },
  { id:"5",  maNV:"NV-005", hoTen:"Lê Văn Cường",      phongBan:"Thu mua",      chucVu:"Tổ trưởng thu mua",      sdt:"0912 789 012", email:"cuong.le@htxhongha.vn",        diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2014-04-20", luong:7500000,  trangThai:"dang-lam", avatarColor:"bg-amber-500" },
  { id:"6",  maNV:"NV-006", hoTen:"Đặng Văn Dũng",     phongBan:"Thu mua",      chucVu:"Nhân viên thu mua",      sdt:"0912 890 123", email:"dung.dang@htxhongha.vn",       diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2016-07-15", luong:6000000,  trangThai:"dang-lam", avatarColor:"bg-orange-500" },
  { id:"7",  maNV:"NV-007", hoTen:"Hà Thị Phương",     phongBan:"Thu mua",      chucVu:"Nhân viên thu mua",      sdt:"0913 901 234", email:"phuong.ha@htxhongha.vn",       diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2019-01-10", luong:5800000,  trangThai:"nghi-phep", avatarColor:"bg-rose-500" },
  { id:"8",  maNV:"NV-008", hoTen:"Triệu Văn Hùng",    phongBan:"Sản xuất",     chucVu:"Tổ trưởng sản xuất",    sdt:"0912 012 345", email:"hung.trieu@htxhongha.vn",      diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2015-03-01", luong:7000000,  trangThai:"dang-lam", avatarColor:"bg-teal-500" },
  { id:"9",  maNV:"NV-009", hoTen:"Nông Thị Yến",      phongBan:"Sản xuất",     chucVu:"Công nhân chế biến",     sdt:"0913 123 456", email:"yen.nong@htxhongha.vn",        diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2017-06-20", luong:5200000,  trangThai:"dang-lam", avatarColor:"bg-cyan-500" },
  { id:"10", maNV:"NV-010", hoTen:"Lý Văn Minh",       phongBan:"Sản xuất",     chucVu:"Công nhân chế biến",     sdt:"0912 234 567", email:"minh.ly@htxhongha.vn",         diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2020-03-15", luong:5200000,  trangThai:"dang-lam", avatarColor:"bg-lime-600" },
  { id:"11", maNV:"NV-011", hoTen:"Vương Thị Nga",     phongBan:"Sản xuất",     chucVu:"Công nhân đóng gói",     sdt:"0913 345 678", email:"nga.vuong@htxhongha.vn",       diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2021-08-01", luong:4800000,  trangThai:"dang-lam", avatarColor:"bg-emerald-500" },
  { id:"12", maNV:"NV-012", hoTen:"Hoàng Văn Nam",     phongBan:"Kinh doanh",   chucVu:"Trưởng phòng KD",        sdt:"0912 456 789", email:"nam.hoang@htxhongha.vn",       diaChi:"Hà Nội",                        ngayVao:"2016-10-01", luong:9500000,  trangThai:"dang-lam", avatarColor:"bg-indigo-500" },
  { id:"13", maNV:"NV-013", hoTen:"Phạm Thị Thảo",     phongBan:"Kinh doanh",   chucVu:"Nhân viên kinh doanh",   sdt:"0913 567 890", email:"thao.pham@htxhongha.vn",       diaChi:"Hà Nội",                        ngayVao:"2020-01-15", luong:7000000,  trangThai:"dang-lam", avatarColor:"bg-sky-500" },
  { id:"14", maNV:"NV-014", hoTen:"Lê Thị Thu",        phongBan:"Kỹ thuật",     chucVu:"Kỹ thuật viên",          sdt:"0214 678 901", email:"thu.le@htxhongha.vn",          diaChi:"Chợ Đồn, Bắc Kạn",            ngayVao:"2022-04-01", luong:7500000,  trangThai:"dang-lam", avatarColor:"bg-purple-500" },
  { id:"15", maNV:"NV-015", hoTen:"Nguyễn Văn Bắc",    phongBan:"Kỹ thuật",     chucVu:"Kỹ thuật máy móc",       sdt:"0912 789 012", email:"bac.nguyen@htxhongha.vn",      diaChi:"Bằng Phúc, Chợ Đồn, Bắc Kạn", ngayVao:"2019-11-01", luong:6800000,  trangThai:"nghi-viec", avatarColor:"bg-slate-500" },
];

function fmtMoney(v: number) { return v.toLocaleString("vi-VN") + " đ"; }

export default function HRPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [phongBanFilter, setPhongBanFilter] = useState("");
  const [sortKey, setSortKey] = useState("maNV");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [selected, setSelected] = useState<NhanVien | null>(null);
  const [nhanVienList, setNhanVienList] = useState<NhanVien[]>(NHAN_VIEN);

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa nhân viên này?")) return;
    setNhanVienList(prev => prev.filter(nv => nv.id !== id));
    setSelected(null);
  };

  const filtered = useMemo(() => {
    let d = nhanVienList;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(nv => nv.maNV.toLowerCase().includes(q) || nv.hoTen.toLowerCase().includes(q) || nv.chucVu.toLowerCase().includes(q));
    }
    if (phongBanFilter) d = d.filter(nv => nv.phongBan === phongBanFilter);
    return [...d].sort((a, b) => {
      const av = (a as Record<string,unknown>)[sortKey];
      const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [nhanVienList, search, phongBanFilter, sortKey, sortDir]);

  const activeCount = nhanVienList.filter(nv => nv.trangThai === "dang-lam").length;
  const leaveCount  = nhanVienList.filter(nv => nv.trangThai === "nghi-phep").length;
  const totalLuong  = nhanVienList.filter(nv => nv.trangThai !== "nghi-viec").reduce((s, nv) => s + nv.luong, 0);

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
            <h1 className="text-xl font-bold text-foreground">Quản lý Nhân sự</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Hồ sơ nhân viên</p>
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
              <Plus className="w-4 h-4" /> Thêm nhân viên
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users,     label: "Tổng nhân viên",  value: `${nhanVienList.length} người`, sub: "biên chế",         color: "text-blue-600 bg-blue-50" },
          { icon: UserCheck, label: "Đang làm việc",   value: `${activeCount} người`,       sub: "đang hoạt động",   color: "text-emerald-600 bg-emerald-50" },
          { icon: Clock,     label: "Nghỉ phép",       value: `${leaveCount} người`,        sub: "kỳ này",           color: "text-amber-600 bg-amber-50" },
          { icon: Users,     label: "Quỹ lương T4",    value: fmtMoney(totalLuong),         sub: "ước tính",         color: "text-violet-600 bg-violet-50" },
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, mã NV, chức vụ..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={phongBanFilter} onChange={e => setPhongBanFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả phòng ban</option>
            {PHONG_BAN.map(pb => <option key={pb} value={pb}>{pb}</option>)}
          </select>
          <button onClick={() => { setSearch(""); setPhongBanFilter(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "hoTen",    label: "Nhân viên" },
                  { key: "maNV",     label: "Mã NV" },
                  { key: "phongBan", label: "Phòng ban" },
                  { key: "chucVu",   label: "Chức vụ" },
                  { key: "ngayVao",  label: "Ngày vào" },
                  { key: "luong",    label: "Lương" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-center font-semibold text-xs text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(nv => {
                const sc = TRANG_THAI_CFG[nv.trangThai];
                const Icon = sc.icon;
                const initials = nv.hoTen.split(" ").slice(-2).map(w => w[0]).join("");
                return (
                  <tr key={nv.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelected(nv)}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${nv.avatarColor} flex items-center justify-center shrink-0`}>
                          <span className="text-xs font-bold text-white">{initials}</span>
                        </div>
                        <p className="font-medium text-foreground">{nv.hoTen}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{nv.maNV}</span></td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{nv.phongBan}</td>
                    <td className="py-3 px-4 text-sm">{nv.chucVu}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{nv.ngayVao}</td>
                    <td className="py-3 px-4 text-sm font-semibold whitespace-nowrap">{fmtMoney(nv.luong)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setSelected(nv)} title="Xem" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setSelected(nv)} title="Sửa" className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(nv.id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không tìm thấy nhân viên nào</div>}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {nhanVienList.length} nhân viên</p>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selected.avatarColor} flex items-center justify-center shrink-0`}>
                  <span className="text-sm font-bold text-white">{selected.hoTen.split(" ").slice(-2).map(w => w[0]).join("")}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selected.hoTen}</p>
                  <p className="text-xs text-muted-foreground">{selected.maNV} · {selected.chucVu}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${TRANG_THAI_CFG[selected.trangThai].color}`}>
                {TRANG_THAI_CFG[selected.trangThai].label}
              </span>
              <div className="space-y-2">
                {[
                  { icon: Users,   label: "Phòng ban",   value: selected.phongBan },
                  { icon: Phone,   label: "Số điện thoại", value: selected.sdt },
                  { icon: Mail,    label: "Email",         value: selected.email },
                  { icon: MapPin,  label: "Địa chỉ",       value: selected.diaChi },
                  { icon: Clock,   label: "Ngày vào làm",  value: selected.ngayVao },
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-700 font-semibold">Mức lương</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{fmtMoney(selected.luong)}</p>
                <p className="text-xs text-emerald-600">/tháng</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
