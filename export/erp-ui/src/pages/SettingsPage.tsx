import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Building2, Users, Bell, Shield, Globe, Database,
  Save, Check, Plus, Trash2, X, Edit2, Key, ChevronRight,
  Leaf, Package, TrendingUp,
} from "lucide-react";
import { DANH_SACH_SAN_PHAM } from "@/constants/products";

type TabKey = "doanh-nghiep" | "nguoi-dung" | "danh-muc" | "thong-bao" | "bao-mat";

interface UserAccount { id: string; ten: string; email: string; vaiTro: string; trangThai: "active" | "inactive"; }
interface DanhMucLoaiChe { id: string; ten: string; maCode: string; donGia: number; tyLeKhoHao: number; ghiChu: string; }

const INIT_USERS: UserAccount[] = [
  { id:"1", ten:"Lý Văn Phương",   email:"phuong@htxhongha.vn",  vaiTro:"Giám đốc",        trangThai:"active" },
  { id:"2", ten:"Nguyễn Văn An",   email:"an@htxhongha.vn",      vaiTro:"Kế toán",          trangThai:"active" },
  { id:"3", ten:"Trần Thị Bình",   email:"binh@htxhongha.vn",    vaiTro:"Quản lý kho",      trangThai:"active" },
  { id:"4", ten:"Lê Văn Cường",    email:"cuong@htxhongha.vn",   vaiTro:"Cán bộ thu mua",   trangThai:"active" },
  { id:"5", ten:"Phạm Thị Dung",   email:"dung@htxhongha.vn",    vaiTro:"Cán bộ chế biến",  trangThai:"inactive" },
];

const INIT_LOAI_CHE: DanhMucLoaiChe[] = DANH_SACH_SAN_PHAM;

const VAI_TRO_PERMISSIONS: Record<string, string[]> = {
  "Giám đốc":       ["Toàn quyền hệ thống", "Phê duyệt phiếu kế toán", "Xem báo cáo tổng hợp"],
  "Kế toán":         ["Tạo/sửa phiếu thu chi", "Xem công nợ", "Xuất báo cáo tài chính"],
  "Quản lý kho":     ["Quản lý tồn kho", "Tạo phiếu nhập/xuất", "Theo dõi batch"],
  "Cán bộ thu mua":  ["Tạo đơn mua", "Nhập thông tin nông hộ", "QC đầu vào"],
  "Cán bộ chế biến": ["Quản lý sản xuất", "Cập nhật lô chế biến", "QC sản xuất"],
};

let _nid = 1000;
const genId = () => String(++_nid);

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("doanh-nghiep");
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>(INIT_USERS);
  const [loaiCheList, setLoaiCheList] = useState<DanhMucLoaiChe[]>(INIT_LOAI_CHE);
  const [showAddUser, setShowAddUser] = useState(false);
  const [fTen, setFTen] = useState(""); const [fEmail, setFEmail] = useState(""); const [fVaiTro, setFVaiTro] = useState("Kế toán");

  const [info, setInfo] = useState({
    tenHTX: "HTX Nông nghiệp Hồng Hà",
    tenVietTat: "HTX Hồng Hà",
    maSoThue: "0107123456",
    diaChiTruSo: "Xã Bằng Phúc, Huyện Chợ Đồn, Tỉnh Bắc Kạn",
    sdt: "0209 3831 456",
    email: "contact@htxhongha.vn",
    website: "www.htxhongha.vn",
    giamDoc: "Lý Văn Phương",
    sanPhamChinh: "Chè Shan Tuyết Bằng Phúc",
    ocop: "OCOP 4 sao",
    namThanhLap: "2010",
    soThanhVien: "26",
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
    setUsers(prev => [...prev, { id: genId(), ten: fTen, email: fEmail, vaiTro: fVaiTro, trangThai: "active" }]);
    setShowAddUser(false); setFTen(""); setFEmail("");
  };
  const toggleUser = (id: string) => setUsers(prev => prev.map(u => u.id===id ? {...u, trangThai: u.trangThai==="active"?"inactive":"active"} : u));

  const TABS: { key: TabKey; label: string; icon: React.ComponentType<{className?:string}>; desc: string }[] = [
    { key:"doanh-nghiep", label:"Thông tin HTX",   icon:Building2, desc:"Thông tin pháp lý" },
    { key:"nguoi-dung",   label:"Người dùng",       icon:Users,     desc:"Tài khoản & phân quyền" },
    { key:"danh-muc",     label:"Danh mục",          icon:Database,  desc:"Loại chè, giá, tỷ lệ" },
    { key:"thong-bao",    label:"Thông báo",         icon:Bell,      desc:"Cảnh báo & báo cáo" },
    { key:"bao-mat",      label:"Bảo mật",           icon:Shield,    desc:"Mật khẩu & xác thực" },
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0 ${activeTab===tab.key?"bg-primary/5 text-primary":"hover:bg-muted/30 text-foreground"}`}>
                <tab.icon className={`w-4 h-4 shrink-0 ${activeTab===tab.key?"text-primary":"text-muted-foreground"}`} />
                <div><p className="text-sm font-medium">{tab.label}</p><p className="text-xs text-muted-foreground">{tab.desc}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Thông tin HTX */}
          {activeTab === "doanh-nghiep" && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <p className="font-semibold text-sm border-b border-border pb-3">Thông tin pháp lý & liên hệ</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {l:"Tên HTX đầy đủ",k:"tenHTX"},{l:"Tên viết tắt",k:"tenVietTat"},
                  {l:"Mã số thuế",k:"maSoThue"},{l:"Giám đốc / Chủ tịch",k:"giamDoc"},
                  {l:"SĐT liên hệ",k:"sdt"},{l:"Email",k:"email"},
                  {l:"Website",k:"website"},{l:"Năm thành lập",k:"namThanhLap"},
                  {l:"Chứng nhận OCOP",k:"ocop"},{l:"Số thành viên",k:"soThanhVien"},
                ].map(field => (
                  <div key={field.k}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.l}</label>
                    <input value={(info as Record<string,string>)[field.k]} onChange={e => setInfo(prev => ({...prev, [field.k]: e.target.value}))}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Địa chỉ trụ sở</label>
                  <input value={info.diaChiTruSo} onChange={e => setInfo(prev => ({...prev, diaChiTruSo: e.target.value}))}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div><p className="text-sm font-semibold text-emerald-900">ESG Valley – HTX Hồng Hà</p><p className="text-xs text-emerald-700 mt-1">Chè Shan Tuyết Bằng Phúc · OCOP 4 sao · Truy xuất nguồn gốc đầy đủ từ nông hộ đến tay người tiêu dùng</p></div>
              </div>
            </div>
          )}

          {/* Người dùng */}
          {activeTab === "nguoi-dung" && (
            <div className="space-y-4">
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                  <p className="text-sm font-semibold">Tài khoản người dùng</p>
                  <button onClick={()=>setShowAddUser(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90"><Plus className="w-3.5 h-3.5"/> Thêm</button>
                </div>
                <div className="divide-y divide-border">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.trangThai==="active"?"bg-primary/10 text-primary":"bg-muted text-muted-foreground"}`}>{u.ten.slice(0,1)}</div>
                        <div><p className="text-sm font-medium">{u.ten}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{u.vaiTro}</span>
                        <button onClick={()=>toggleUser(u.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.trangThai==="active"?"bg-primary":"bg-muted"}`}>
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${u.trangThai==="active"?"translate-x-4":"translate-x-1"}`}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Role permissions */}
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Phân quyền theo vai trò</p></div>
                <div className="divide-y divide-border">
                  {Object.entries(VAI_TRO_PERMISSIONS).map(([vt, perms]) => (
                    <div key={vt} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium mt-0.5 whitespace-nowrap">{vt}</span>
                      <div className="flex flex-wrap gap-1">{perms.map((p,i)=><span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{p}</span>)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {showAddUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40" onClick={()=>setShowAddUser(false)}/>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                    <div className="flex items-center justify-between"><p className="font-semibold">Thêm người dùng</p><button onClick={()=>setShowAddUser(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button></div>
                    <div><label className="block text-xs font-semibold mb-1.5">Họ và tên <span className="text-red-500">*</span></label><input value={fTen} onChange={e=>setFTen(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
                    <div><label className="block text-xs font-semibold mb-1.5">Email <span className="text-red-500">*</span></label><input value={fEmail} onChange={e=>setFEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg"/></div>
                    <div><label className="block text-xs font-semibold mb-1.5">Vai trò</label><select value={fVaiTro} onChange={e=>setFVaiTro(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg">{Object.keys(VAI_TRO_PERMISSIONS).map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={()=>setShowAddUser(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
                      <button onClick={handleAddUser} disabled={!fTen||!fEmail} className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40"><Plus className="w-4 h-4 inline mr-1"/>Thêm</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Danh mục */}
          {activeTab === "danh-muc" && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Danh mục loại chè – Giá & Tỷ lệ thu hồi</p></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/30">{["Loại chè","Mã","Đơn giá (đ/kg)","Tỷ lệ thu hồi (%)","Ghi chú"].map((h,i)=><th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody>
                    {loaiCheList.map(lc => (
                      <tr key={lc.id} className="border-b border-border/60 hover:bg-muted/20">
                        <td className="py-3 px-4"><span className="font-semibold text-sm">{lc.ten}</span></td>
                        <td className="py-3 px-4"><span className="font-mono text-xs text-primary">{lc.maCode}</span></td>
                        <td className="py-3 px-4">
                          <input type="number" value={lc.donGia} onChange={e=>setLoaiCheList(prev=>prev.map(l=>l.id===lc.id?{...l,donGia:+e.target.value}:l))}
                            className="w-28 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-right"/>
                        </td>
                        <td className="py-3 px-4">
                          <input type="number" step="0.1" value={lc.tyLeKhoHao} onChange={e=>setLoaiCheList(prev=>prev.map(l=>l.id===lc.id?{...l,tyLeKhoHao:+e.target.value}:l))}
                            className="w-20 px-2 py-1 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-center"/>
                        </td>
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

          {/* Thông báo */}
          {activeTab === "thong-bao" && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-5">
              <p className="font-semibold text-sm border-b border-border pb-3">Cấu hình cảnh báo & báo cáo tự động</p>
              {[
                {k:"emailAlert",   l:"Cảnh báo qua Email",    d:"Nhận email khi có sự kiện quan trọng"},
                {k:"smsAlert",     l:"Cảnh báo qua SMS",      d:"Nhận SMS cho các cảnh báo khẩn cấp"},
                {k:"stockAlert",   l:"Cảnh báo tồn kho",      d:"Thông báo khi hàng sắp hết hoặc hết hàng"},
                {k:"dailyReport",  l:"Báo cáo hàng ngày",     d:"Email tổng hợp cuối ngày"},
                {k:"weeklyReport", l:"Báo cáo hàng tuần",     d:"Báo cáo tổng hợp thứ 2 đầu tuần"},
              ].map(s=>(
                <div key={s.k} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{s.l}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <button onClick={()=>setNotif(prev=>({...prev,[s.k]:!(prev as Record<string,unknown>)[s.k]}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(notif as Record<string,unknown>)[s.k]?"bg-primary":"bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${(notif as Record<string,unknown>)[s.k]?"translate-x-6":"translate-x-1"}`}/>
                  </button>
                </div>
              ))}
              <div className="border-t border-border pt-4">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ngưỡng cảnh báo tồn kho (kg)</label>
                <input type="number" value={notif.stockThreshold} onChange={e=>setNotif(prev=>({...prev,stockThreshold:e.target.value}))} className="w-32 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/>
              </div>
            </div>
          )}

          {/* Bảo mật */}
          {activeTab === "bao-mat" && (
            <div className="bg-white border border-border rounded-xl p-5 space-y-5">
              <p className="font-semibold text-sm border-b border-border pb-3">Cấu hình bảo mật hệ thống</p>
              {[
                {k:"twoFactor",   l:"Xác thực 2 bước (2FA)",  d:"Yêu cầu OTP khi đăng nhập"},
                {k:"logActivity", l:"Ghi log hoạt động",       d:"Lưu nhật ký thao tác của người dùng"},
                {k:"ipWhitelist", l:"Giới hạn IP truy cập",   d:"Chỉ cho phép IP đã đăng ký"},
              ].map(s=>(
                <div key={s.k} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{s.l}</p><p className="text-xs text-muted-foreground">{s.d}</p></div>
                  <button onClick={()=>setSecurity(prev=>({...prev,[s.k]:!(prev as Record<string,unknown>)[s.k]}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(security as Record<string,unknown>)[s.k]?"bg-primary":"bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${(security as Record<string,unknown>)[s.k]?"translate-x-6":"translate-x-1"}`}/>
                  </button>
                </div>
              ))}
              <div className="border-t border-border pt-4">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Thời gian hết phiên (phút)</label>
                <select value={security.sessionTimeout} onChange={e=>setSecurity(prev=>({...prev,sessionTimeout:e.target.value}))} className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
                  {["30","60","120","240"].map(v=><option key={v} value={v}>{v} phút</option>)}
                </select>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Đổi mật khẩu</p>
                <div className="space-y-2">
                  {["Mật khẩu hiện tại","Mật khẩu mới","Xác nhận mật khẩu mới"].map((lbl,i)=>(
                    <input key={i} type="password" placeholder={lbl} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/>
                  ))}
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"><Key className="w-3.5 h-3.5"/> Đổi mật khẩu</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
