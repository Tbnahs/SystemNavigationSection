import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Building2, Users, Bell, Shield, Globe, Database,
  Save, ChevronRight, Check,
} from "lucide-react";

type TabKey = "doanh-nghiep" | "nguoi-dung" | "thong-bao" | "bao-mat" | "he-thong";

interface SettingSection {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

const SECTIONS: SettingSection[] = [
  { key: "doanh-nghiep", label: "Thông tin HTX",   icon: Building2, desc: "Thông tin pháp lý và liên hệ" },
  { key: "nguoi-dung",   label: "Người dùng",       icon: Users,     desc: "Tài khoản và phân quyền" },
  { key: "thong-bao",    label: "Thông báo",        icon: Bell,      desc: "Cấu hình cảnh báo hệ thống" },
  { key: "bao-mat",      label: "Bảo mật",          icon: Shield,    desc: "Mật khẩu và xác thực" },
  { key: "he-thong",     label: "Hệ thống",         icon: Globe,     desc: "Ngôn ngữ, múi giờ, định dạng" },
];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("doanh-nghiep");
  const [saved, setSaved] = useState(false);

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
  });

  const [notif, setNotif] = useState({
    emailAlert: true,
    smsAlert: false,
    stockAlert: true,
    stockThreshold: "50",
    dailyReport: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Cài đặt hệ thống</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Cấu hình và quản trị</p>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}>
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Đã lưu" : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="bg-white border border-border rounded-xl p-2 h-fit">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-all ${
                activeTab === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <s.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs opacity-70">{s.desc}</p>
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeTab === s.key ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white border border-border rounded-xl p-6">
          {activeTab === "doanh-nghiep" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-foreground mb-0.5">Thông tin Hợp tác xã</h3>
                <p className="text-xs text-muted-foreground">Thông tin pháp lý, liên hệ và mô tả hoạt động của HTX</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Tên HTX (đầy đủ)",    key: "tenHTX" },
                  { label: "Tên viết tắt",          key: "tenVietTat" },
                  { label: "Mã số thuế",            key: "maSoThue" },
                  { label: "Giám đốc",              key: "giamDoc" },
                  { label: "Số điện thoại",         key: "sdt" },
                  { label: "Email",                 key: "email" },
                  { label: "Website",               key: "website" },
                  { label: "Năm thành lập",         key: "namThanhLap" },
                  { label: "Sản phẩm chính",        key: "sanPhamChinh" },
                  { label: "Chứng nhận OCOP",       key: "ocop" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{f.label}</label>
                    <input
                      value={(info as Record<string,string>)[f.key]}
                      onChange={e => setInfo(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Địa chỉ trụ sở</label>
                  <input
                    value={info.diaChiTruSo}
                    onChange={e => setInfo(prev => ({ ...prev, diaChiTruSo: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "thong-bao" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-foreground mb-0.5">Cấu hình thông báo</h3>
                <p className="text-xs text-muted-foreground">Tuỳ chỉnh cảnh báo và báo cáo tự động</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Thông báo qua Email",       key: "emailAlert",   desc: "Nhận cảnh báo tức thời qua email" },
                  { label: "Thông báo qua SMS",         key: "smsAlert",    desc: "Nhận SMS khi có sự kiện quan trọng" },
                  { label: "Cảnh báo tồn kho thấp",    key: "stockAlert",  desc: "Cảnh báo khi tồn kho dưới ngưỡng" },
                  { label: "Báo cáo ngày tự động",     key: "dailyReport", desc: "Gửi tổng hợp hoạt động cuối ngày" },
                  { label: "Báo cáo tuần tự động",     key: "weeklyReport",desc: "Gửi báo cáo tổng hợp mỗi tuần" },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotif(prev => ({ ...prev, [f.key]: !(prev as Record<string,unknown>)[f.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                        (notif as Record<string,unknown>)[f.key] ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                        (notif as Record<string,unknown>)[f.key] ? "left-[22px]" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
                {notif.stockAlert && (
                  <div className="p-4 border border-border rounded-xl">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ngưỡng cảnh báo tồn kho (kg)</label>
                    <input
                      type="number"
                      value={notif.stockThreshold}
                      onChange={e => setNotif(prev => ({ ...prev, stockThreshold: e.target.value }))}
                      className="w-40 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === "nguoi-dung" || activeTab === "bao-mat" || activeTab === "he-thong") && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Database className="w-12 h-12 text-muted-foreground/30 mb-4" strokeWidth={1} />
              <p className="text-sm font-semibold text-foreground">
                {activeTab === "nguoi-dung"  ? "Quản lý Người dùng & Phân quyền" :
                 activeTab === "bao-mat"     ? "Cài đặt Bảo mật" :
                 "Cài đặt Hệ thống"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {activeTab === "nguoi-dung"  ? "Tạo tài khoản, phân quyền theo vai trò (Giám đốc, Kế toán, Thu mua, Bán hàng)" :
                 activeTab === "bao-mat"     ? "Đổi mật khẩu, xác thực 2 yếu tố, nhật ký đăng nhập" :
                 "Ngôn ngữ hiển thị, múi giờ, định dạng tiền tệ và ngày tháng"}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
