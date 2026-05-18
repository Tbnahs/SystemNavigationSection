import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Building2, Users, Bell, Shield, Database,
  Save, Check, Plus, X, Key, Leaf, Package, BarChart2,
  ShoppingCart, ClipboardCheck, Wallet, QrCode, ToggleLeft,
  ToggleRight, Info, Lock, Unlock, ChevronDown, ChevronRight,
} from "lucide-react";
import { DANH_SACH_SAN_PHAM } from "@/constants/products";

type TabKey = "doanh-nghiep" | "phan-he" | "nguoi-dung" | "danh-muc" | "thong-bao" | "bao-mat";

interface PhanHe {
  id: string;
  ten: string;
  moTa: string;
  icon: React.ComponentType<{ className?: string }>;
  mau: string;
}

interface UserAccount {
  id: string;
  ten: string;
  email: string;
  vaiTro: string;
  trangThai: "active" | "inactive";
  phanHe: string[];
}

interface DanhMucLoaiChe { id: string; ten: string; maCode: string; donGia: number; tyLeKhoHao: number; ghiChu: string; }

const ALL_PHAN_HE: PhanHe[] = [
  { id: "erp",  ten: "ERP – Quản lý sản xuất",       moTa: "Thu mua, chế biến, đóng gói, kho hàng",      icon: Package,        mau: "emerald" },
  { id: "txng", ten: "Truy xuất nguồn gốc",           moTa: "QR code, chuỗi truy vết từ vườn đến tay",    icon: QrCode,         mau: "blue" },
  { id: "crm",  ten: "CRM – Khách hàng",              moTa: "Hợp đồng, giao dịch, công nợ khách hàng",    icon: ShoppingCart,   mau: "violet" },
  { id: "qc",   ten: "Kiểm soát chất lượng",          moTa: "Phiếu QC đầu vào, trong và sau sản xuất",    icon: ClipboardCheck, mau: "orange" },
  { id: "bao-cao", ten: "Báo cáo & Thống kê",         moTa: "Dashboard tổng hợp, phân tích dữ liệu",      icon: BarChart2,      mau: "indigo" },
  { id: "ke-toan", ten: "Kế toán nội bộ",             moTa: "Phiếu thu chi, công nợ, sổ quỹ",             icon: Wallet,         mau: "rose" },
];

const MAU_CFG: Record<string, { bg: string; text: string; border: string; dot: string; activeBg: string }> = {
  emerald: { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500",  activeBg: "bg-emerald-500" },
  blue:    { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",     activeBg: "bg-blue-500" },
  violet:  { bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500",   activeBg: "bg-violet-500" },
  orange:  { bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500",   activeBg: "bg-orange-500" },
  indigo:  { bg: "bg-indigo-50",   text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500",   activeBg: "bg-indigo-500" },
  rose:    { bg: "bg-rose-50",     text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500",     activeBg: "bg-rose-500" },
};

const INIT_DN_PHAN_HE = ["erp", "txng", "bao-cao"];

const INIT_USERS: UserAccount[] = [
  { id:"1", ten:"Lý Văn Phương",   email:"phuong@htxhongha.vn",  vaiTro:"Giám đốc",        trangThai:"active",   phanHe: [...INIT_DN_PHAN_HE] },
  { id:"2", ten:"Nguyễn Văn An",   email:"an@htxhongha.vn",      vaiTro:"Kế toán",          trangThai:"active",   phanHe: ["erp","bao-cao"] },
  { id:"3", ten:"Trần Thị Bình",   email:"binh@htxhongha.vn",    vaiTro:"Quản lý kho",      trangThai:"active",   phanHe: ["erp"] },
  { id:"4", ten:"Lê Văn Cường",    email:"cuong@htxhongha.vn",   vaiTro:"Cán bộ thu mua",   trangThai:"active",   phanHe: ["erp","txng"] },
  { id:"5", ten:"Phạm Thị Dung",   email:"dung@htxhongha.vn",    vaiTro:"Cán bộ chế biến",  trangThai:"inactive", phanHe: ["erp"] },
];

const INIT_LOAI_CHE: DanhMucLoaiChe[] = DANH_SACH_SAN_PHAM;

const VAI_TRO_LIST = ["Giám đốc", "Kế toán", "Quản lý kho", "Cán bộ thu mua", "Cán bộ chế biến"];

let _nid = 1000;
const genId = () => String(++_nid);

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("doanh-nghiep");
  const [saved, setSaved] = useState(false);

  const [dnPhanHe, setDnPhanHe] = useState<string[]>(INIT_DN_PHAN_HE);
  const [users, setUsers] = useState<UserAccount[]>(INIT_USERS);
  const [loaiCheList, setLoaiCheList] = useState<DanhMucLoaiChe[]>(INIT_LOAI_CHE);

  const [showAddUser, setShowAddUser] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [fTen, setFTen] = useState(""); const [fEmail, setFEmail] = useState(""); const [fVaiTro, setFVaiTro] = useState("Kế toán");

  const [info, setInfo] = useState({
    tenHTX: "HTX Nông nghiệp Hồng Hà", tenVietTat: "HTX Hồng Hà",
    maSoThue: "0107123456", diaChiTruSo: "Xã Bằng Phúc, Huyện Chợ Đồn, Tỉnh Bắc Kạn",
    sdt: "0209 3831 456", email: "contact@htxhongha.vn", website: "www.htxhongha.vn",
    giamDoc: "Lý Văn Phương", sanPhamChinh: "Chè Shan Tuyết Bằng Phúc",
    ocop: "OCOP 4 sao", namThanhLap: "2010", soThanhVien: "26",
  });

  const [notif, setNotif] = useState({
    emailAlert: true, smsAlert: false, stockAlert: true,
    stockThreshold: "50", dailyReport: true, weeklyReport: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false, sessionTimeout: "60", logActivity: true, ipWhitelist: false,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleAddUser = () => {
    if (!fTen || !fEmail) return;
    setUsers(prev => [...prev, {
      id: genId(), ten: fTen, email: fEmail, vaiTro: fVaiTro,
      trangThai: "active", phanHe: [...dnPhanHe],
    }]);
    setShowAddUser(false); setFTen(""); setFEmail(""); setFVaiTro("Kế toán");
  };

  const toggleUserStatus = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, trangThai: u.trangThai === "active" ? "inactive" : "active" } : u));

  const toggleUserPhanHe = (userId: string, phId: string) =>
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const has = u.phanHe.includes(phId);
      return { ...u, phanHe: has ? u.phanHe.filter(p => p !== phId) : [...u.phanHe, phId] };
    }));

  const toggleDnPhanHe = (phId: string) => {
    const nowActive = dnPhanHe.includes(phId);
    setDnPhanHe(prev => nowActive ? prev.filter(p => p !== phId) : [...prev, phId]);
    if (nowActive) {
      setUsers(prev => prev.map(u => ({ ...u, phanHe: u.phanHe.filter(p => p !== phId) })));
    }
  };

  const syncUserToDn = (userId: string) =>
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, phanHe: [...dnPhanHe] } : u));

  const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { key: "doanh-nghiep", label: "Thông tin HTX",  icon: Building2, desc: "Thông tin pháp lý" },
    { key: "phan-he",      label: "Phân hệ",         icon: Package,   desc: "Đăng ký phân hệ" },
    { key: "nguoi-dung",   label: "Người dùng",      icon: Users,     desc: "Tài khoản & phân quyền" },
    { key: "danh-muc",     label: "Danh mục",         icon: Database,  desc: "Loại chè, giá, tỷ lệ" },
    { key: "thong-bao",    label: "Thông báo",        icon: Bell,      desc: "Cảnh báo & báo cáo" },
    { key: "bao-mat",      label: "Bảo mật",          icon: Shield,    desc: "Mật khẩu & xác thực" },
  ];

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Cài đặt hệ thống</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Quản trị ERP Chè Shan Tuyết Bằng Phúc</p></div>
          <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${saved ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
            {saved ? <><Check className="w-4 h-4" /> Đã lưu!</> : <><Save className="w-4 h-4" /> Lưu cài đặt</>}
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0 ${activeTab === tab.key ? "bg-primary/5 text-primary" : "hover:bg-muted/30 text-foreground"}`}>
                <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.key ? "text-primary" : "text-muted-foreground"}`} />
                <div><p className="text-sm font-medium">{tab.label}</p><p className="text-xs text-muted-foreground">{tab.desc}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── Thông tin HTX ── */}
          {activeTab === "doanh-nghiep" && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <p className="font-semibold text-sm border-b border-border pb-3">Thông tin pháp lý & liên hệ</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { l: "Tên HTX đầy đủ", k: "tenHTX" }, { l: "Tên viết tắt", k: "tenVietTat" },
                  { l: "Mã số thuế", k: "maSoThue" }, { l: "Giám đốc / Chủ tịch", k: "giamDoc" },
                  { l: "SĐT liên hệ", k: "sdt" }, { l: "Email", k: "email" },
                  { l: "Website", k: "website" }, { l: "Năm thành lập", k: "namThanhLap" },
                  { l: "Chứng nhận OCOP", k: "ocop" }, { l: "Số thành viên", k: "soThanhVien" },
                ].map(field => (
                  <div key={field.k}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.l}</label>
                    <input value={(info as Record<string, string>)[field.k]} onChange={e => setInfo(prev => ({ ...prev, [field.k]: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Địa chỉ trụ sở</label>
                  <input value={info.diaChiTruSo} onChange={e => setInfo(prev => ({ ...prev, diaChiTruSo: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div><p className="text-sm font-semibold text-emerald-900">ESG Valley – HTX Hồng Hà</p><p className="text-xs text-emerald-700 mt-1">Chè Shan Tuyết Bằng Phúc · OCOP 4 sao · Truy xuất nguồn gốc đầy đủ từ nông hộ đến tay người tiêu dùng</p></div>
              </div>
            </div>
          )}

          {/* ── Phân hệ ── */}
          {activeTab === "phan-he" && (
            <div className="space-y-4">
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/20">
                  <p className="text-sm font-semibold">Phân hệ đăng ký – HTX Hồng Hà</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Bật/tắt phân hệ mà Doanh nghiệp được phép sử dụng. Người dùng chỉ được phân quyền trong phạm vi phân hệ DN đã bật.</p>
                </div>
                <div className="divide-y divide-border">
                  {ALL_PHAN_HE.map(ph => {
                    const active = dnPhanHe.includes(ph.id);
                    const m = MAU_CFG[ph.mau];
                    const userCount = users.filter(u => u.phanHe.includes(ph.id)).length;
                    return (
                      <div key={ph.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${active ? "" : "opacity-60"}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? m.bg : "bg-muted/40"} ${active ? m.border : "border border-border"} border`}>
                          <ph.icon className={`w-5 h-5 ${active ? m.text : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{ph.ten}</p>
                            {active && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${m.bg} ${m.text} ${m.border} border`}>Đang dùng</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{ph.moTa}</p>
                          {active && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">{userCount}</span> người dùng được cấp quyền</p>}
                        </div>
                        <Toggle on={active} onToggle={() => toggleDnPhanHe(ph.id)} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Phạm vi phân hệ Doanh nghiệp</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Các phân hệ được bật ở đây là <strong>giới hạn tối đa</strong> mà tổ chức có thể dùng.
                    Tắt một phân hệ sẽ <strong>tự động thu hồi quyền</strong> của tất cả người dùng có phân hệ đó.
                    Phân quyền chi tiết cho từng người dùng được cấu hình tại tab <strong>Người dùng</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Người dùng ── */}
          {activeTab === "nguoi-dung" && (
            <div className="space-y-4">
              {/* Header + danh sách */}
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
                  <div>
                    <p className="text-sm font-semibold">Tài khoản & Phạm vi phân hệ</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cấu hình phân hệ riêng cho từng người dùng trong phạm vi DN đã đăng ký</p>
                  </div>
                  <button onClick={() => setShowAddUser(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 shrink-0"><Plus className="w-3.5 h-3.5" /> Thêm</button>
                </div>

                {/* DN phân hệ legend */}
                <div className="px-5 py-3 border-b border-border bg-muted/10 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Phân hệ DN:</span>
                  {ALL_PHAN_HE.map(ph => {
                    const dnHas = dnPhanHe.includes(ph.id);
                    const m = MAU_CFG[ph.mau];
                    return (
                      <span key={ph.id} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${dnHas ? `${m.bg} ${m.text} ${m.border}` : "bg-muted/30 text-muted-foreground border-border opacity-50"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dnHas ? m.dot : "bg-muted-foreground"}`} />
                        {ph.ten.split("–")[0].trim()}
                      </span>
                    );
                  })}
                </div>

                <div className="divide-y divide-border">
                  {users.map(u => {
                    const isExpanded = expandedUser === u.id;
                    const userDnPh = dnPhanHe;
                    const grantedCount = u.phanHe.filter(p => userDnPh.includes(p)).length;
                    const isSynced = userDnPh.every(p => u.phanHe.includes(p)) && u.phanHe.filter(p => userDnPh.includes(p)).length === userDnPh.length;

                    return (
                      <div key={u.id}>
                        {/* User row */}
                        <div className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors ${!isExpanded ? "cursor-pointer" : ""}`}
                          onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                          <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${u.trangThai === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {u.ten.split(" ").pop()?.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{u.ten}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground whitespace-nowrap">{u.vaiTro}</span>
                              {u.trangThai === "inactive" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 whitespace-nowrap">Vô hiệu</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {userDnPh.length === 0
                                ? <span className="text-xs text-muted-foreground italic">DN chưa đăng ký phân hệ nào</span>
                                : userDnPh.map(phId => {
                                  const ph = ALL_PHAN_HE.find(p => p.id === phId);
                                  if (!ph) return null;
                                  const m = MAU_CFG[ph.mau];
                                  const has = u.phanHe.includes(phId);
                                  return (
                                    <span key={phId} className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${has ? `${m.bg} ${m.text}` : "bg-muted/30 text-muted-foreground line-through"}`}>
                                      {has ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                      {ph.ten.split("–")[0].trim()}
                                    </span>
                                  );
                                })
                              }
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <span className="text-xs text-muted-foreground">{grantedCount}/{userDnPh.length} phân hệ</span>
                            <Toggle on={u.trangThai === "active"} onToggle={() => toggleUserStatus(u.id)} />
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-muted/60`}
                              onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded: phân hệ riêng */}
                        {isExpanded && (
                          <div className="px-5 pb-4 bg-muted/10 border-t border-dashed border-border">
                            <div className="flex items-center justify-between pt-3 pb-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phân hệ được phép truy cập</p>
                              {!isSynced && (
                                <button onClick={() => syncUserToDn(u.id)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium">
                                  Đồng bộ theo DN
                                </button>
                              )}
                              {isSynced && <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Đang đồng bộ theo DN</span>}
                            </div>

                            {userDnPh.length === 0 ? (
                              <div className="text-xs text-muted-foreground italic py-2">Doanh nghiệp chưa đăng ký phân hệ nào. Vui lòng cấu hình tại tab <strong>Phân hệ</strong>.</div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {userDnPh.map(phId => {
                                  const ph = ALL_PHAN_HE.find(p => p.id === phId);
                                  if (!ph) return null;
                                  const m = MAU_CFG[ph.mau];
                                  const has = u.phanHe.includes(phId);
                                  return (
                                    <div key={phId} onClick={() => toggleUserPhanHe(u.id, phId)}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${has ? `${m.bg} ${m.border}` : "bg-white border-border opacity-60"}`}>
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${has ? "bg-white/60" : "bg-muted/30"}`}>
                                        <ph.icon className={`w-4 h-4 ${has ? m.text : "text-muted-foreground"}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold ${has ? m.text : "text-muted-foreground"}`}>{ph.ten}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{ph.moTa}</p>
                                      </div>
                                      {has
                                        ? <ToggleRight className={`w-5 h-5 shrink-0 ${m.text}`} />
                                        : <ToggleLeft className="w-5 h-5 shrink-0 text-muted-foreground" />
                                      }
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Phân hệ ngoài DN */}
                            {ALL_PHAN_HE.filter(ph => !userDnPh.includes(ph.id)).length > 0 && (
                              <div className="mt-3 pt-3 border-t border-dashed border-border">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2">Phân hệ DN chưa đăng ký (không thể cấp)</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {ALL_PHAN_HE.filter(ph => !userDnPh.includes(ph.id)).map(ph => (
                                    <span key={ph.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-muted/30 text-muted-foreground border border-border cursor-not-allowed">
                                      <Lock className="w-2.5 h-2.5" /> {ph.ten.split("–")[0].trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add User Modal */}
              {showAddUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddUser(false)} />
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Thêm người dùng</p>
                      <button onClick={() => setShowAddUser(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
                    </div>
                    <div><label className="block text-xs font-semibold mb-1.5">Họ và tên <span className="text-red-500">*</span></label><input value={fTen} onChange={e => setFTen(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                    <div><label className="block text-xs font-semibold mb-1.5">Email <span className="text-red-500">*</span></label><input value={fEmail} onChange={e => setFEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                    <div><label className="block text-xs font-semibold mb-1.5">Vai trò</label><select value={fVaiTro} onChange={e => setFVaiTro(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">{VAI_TRO_LIST.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs text-blue-700"><span className="font-semibold">Phân hệ mặc định:</span> Người dùng mới sẽ tự động kế thừa <strong>{dnPhanHe.length} phân hệ</strong> hiện tại của DN. Bạn có thể điều chỉnh sau khi tạo.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setShowAddUser(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
                      <button onClick={handleAddUser} disabled={!fTen || !fEmail} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" />Thêm</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Danh mục ── */}
          {activeTab === "danh-muc" && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Danh mục loại chè – Giá & Tỷ lệ thu hồi</p></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/30">{["Loại chè", "Mã", "Đơn giá (đ/kg)", "Tỷ lệ thu hồi (%)", "Ghi chú"].map((h, i) => <th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody>
                    {loaiCheList.map(lc => (
                      <tr key={lc.id} className="border-b border-border/60 hover:bg-muted/20">
                        <td className="py-3 px-4"><span className="font-semibold text-sm">{lc.ten}</span></td>
                        <td className="py-3 px-4"><span className="font-mono text-xs text-primary">{lc.maCode}</span></td>
                        <td className="py-3 px-4"><input type="number" value={lc.donGia} onChange={e => setLoaiCheList(prev => prev.map(l => l.id === lc.id ? { ...l, donGia: +e.target.value } : l))} className="w-28 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-right" /></td>
                        <td className="py-3 px-4"><input type="number" step="0.1" value={lc.tyLeKhoHao} onChange={e => setLoaiCheList(prev => prev.map(l => l.id === lc.id ? { ...l, tyLeKhoHao: +e.target.value } : l))} className="w-20 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-center" /></td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{lc.ghiChu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground">Thay đổi giá và tỷ lệ sẽ ảnh hưởng đến tính toán trong QC, Sản xuất và Báo cáo. Bấm "Lưu cài đặt" để áp dụng.</p>
              </div>
            </div>
          )}

          {/* ── Thông báo ── */}
          {activeTab === "thong-bao" && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-5">
              <p className="font-semibold text-sm border-b border-border pb-3">Cấu hình cảnh báo & báo cáo tự động</p>
              {[
                { k: "emailAlert", l: "Cảnh báo qua Email", d: "Nhận email khi có sự kiện quan trọng" },
                { k: "smsAlert", l: "Cảnh báo qua SMS", d: "Nhận SMS cho các cảnh báo khẩn cấp" },
                { k: "stockAlert", l: "Cảnh báo tồn kho", d: "Thông báo khi hàng sắp hết hoặc hết hàng" },
                { k: "dailyReport", l: "Báo cáo hàng ngày", d: "Email tổng hợp cuối ngày" },
                { k: "weeklyReport", l: "Báo cáo hàng tuần", d: "Báo cáo tổng hợp thứ 2 đầu tuần" },
              ].map(s => (
                <div key={s.k} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{s.l}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <Toggle on={!!(notif as Record<string, unknown>)[s.k]} onToggle={() => setNotif(prev => ({ ...prev, [s.k]: !(prev as Record<string, unknown>)[s.k] }))} />
                </div>
              ))}
              <div className="border-t border-border pt-4">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ngưỡng cảnh báo tồn kho (kg)</label>
                <input type="number" value={notif.stockThreshold} onChange={e => setNotif(prev => ({ ...prev, stockThreshold: e.target.value }))} className="w-32 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          )}

          {/* ── Bảo mật ── */}
          {activeTab === "bao-mat" && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-5">
              <p className="font-semibold text-sm border-b border-border pb-3">Cấu hình bảo mật hệ thống</p>
              {[
                { k: "twoFactor", l: "Xác thực 2 bước (2FA)", d: "Yêu cầu OTP khi đăng nhập" },
                { k: "logActivity", l: "Ghi log hoạt động", d: "Lưu nhật ký thao tác của người dùng" },
                { k: "ipWhitelist", l: "Giới hạn IP truy cập", d: "Chỉ cho phép IP đã đăng ký" },
              ].map(s => (
                <div key={s.k} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{s.l}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <Toggle on={!!(security as Record<string, unknown>)[s.k]} onToggle={() => setSecurity(prev => ({ ...prev, [s.k]: !(prev as Record<string, unknown>)[s.k] }))} />
                </div>
              ))}
              <div className="border-t border-border pt-4">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Thời gian hết phiên (phút)</label>
                <select value={security.sessionTimeout} onChange={e => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))} className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
                  {["30", "60", "120", "240"].map(v => <option key={v} value={v}>{v} phút</option>)}
                </select>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Đổi mật khẩu</p>
                <div className="space-y-2">
                  {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map((lbl, i) => (
                    <input key={i} type="password" placeholder={lbl} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                  ))}
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"><Key className="w-3.5 h-3.5" /> Đổi mật khẩu</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
