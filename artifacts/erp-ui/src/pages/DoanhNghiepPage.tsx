import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, X, Upload,
  Building2, Users, Package, Sprout, Leaf, Bell,
  Pencil, Eye, MapPin, ArrowLeft, ArrowRight, LayoutGrid,
} from "lucide-react";

type DN = {
  id: string;
  mst: string;
  ten: string;
  tenHienThi: string;
  daiDien: string;
  sdt: string;
  diaChi: string;
  modules: ("ERP" | "TXNG" | "VT")[];
  status: "active" | "pending" | "locked";
  logoColor: string;
};

const DATA: DN[] = [
  { id: "1", mst: "4601234567", ten: "Hợp tác xã Chè Quân Chu", tenHienThi: "Chè Quân Chu", daiDien: "Nguyễn Văn Hùng", sdt: "0987 123 456", diaChi: "Xã Quân Chu, Đại Từ, Thái Nguyên", modules: ["ERP", "TXNG", "VT"], status: "active", logoColor: "bg-emerald-100 text-emerald-700" },
  { id: "2", mst: "4602345678", ten: "Công ty TNHH Trà Tân Cương Xanh", tenHienThi: "Tân Cương Xanh", daiDien: "Trần Thị Mai", sdt: "0912 345 678", diaChi: "Xã Tân Cương, Tp. Thái Nguyên", modules: ["ERP", "TXNG"], status: "active", logoColor: "bg-blue-100 text-blue-700" },
  { id: "3", mst: "4603456789", ten: "HTX Chè Hữu Cơ La Bằng", tenHienThi: "La Bằng Organic", daiDien: "Lê Quốc Anh", sdt: "0903 567 890", diaChi: "Xã La Bằng, Đại Từ, Thái Nguyên", modules: ["TXNG", "VT"], status: "pending", logoColor: "bg-amber-100 text-amber-700" },
  { id: "4", mst: "4604567890", ten: "Công ty CP Trà Phúc Vinh", tenHienThi: "Phúc Vinh Tea", daiDien: "Phạm Hồng Sơn", sdt: "0978 234 567", diaChi: "P. Phan Đình Phùng, Tp. Thái Nguyên", modules: ["ERP", "TXNG", "VT"], status: "active", logoColor: "bg-purple-100 text-purple-700" },
  { id: "5", mst: "4605678901", ten: "HTX Trà Đại Từ", tenHienThi: "Trà Đại Từ", daiDien: "Hoàng Minh Tuấn", sdt: "0934 678 123", diaChi: "Thị trấn Hùng Sơn, Đại Từ, Thái Nguyên", modules: ["ERP"], status: "locked", logoColor: "bg-rose-100 text-rose-700" },
  { id: "6", mst: "4606789012", ten: "Công ty TNHH Chè Sông Cầu", tenHienThi: "Sông Cầu Tea", daiDien: "Vũ Thị Lan", sdt: "0945 789 012", diaChi: "Xã Hòa Bình, Đồng Hỷ, Thái Nguyên", modules: ["ERP", "TXNG"], status: "active", logoColor: "bg-teal-100 text-teal-700" },
];

const STATUS_BADGE: Record<DN["status"], { text: string; cls: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  pending: { text: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

const MODULE_INFO = {
  ERP: { label: "ERP", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  TXNG: { label: "TXNG", color: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  VT: { label: "Vùng trồng", color: "bg-amber-50 text-amber-700 ring-amber-600/20" },
} as const;

export default function DoanhNghiepPage() {
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "location" | "modules">("general");

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Doanh nghiệp</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Quản lý Doanh nghiệp</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Tổng doanh nghiệp" value="48" delta="+4 trong tháng" tone="emerald" icon={Building2} />
          <Stat label="Đang hoạt động" value="42" delta="87.5% tổng" tone="blue" icon={Users} />
          <Stat label="Chờ duyệt" value="4" delta="Cần xử lý" tone="amber" icon={Bell} />
          <Stat label="Tạm khóa" value="2" delta="-1 tuần này" tone="rose" icon={X} />
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Tìm theo MST, tên doanh nghiệp, người đại diện…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <SelectChip label="Tỉnh / Thành phố" />
          <SelectChip label="Phân hệ" />
          <SelectChip label="Trạng thái" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Filter className="w-4 h-4" /> Bộ lọc
          </button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Thêm doanh nghiệp
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-primary" /></th>
                  <th className="px-3 py-3">Doanh nghiệp</th>
                  <th className="px-3 py-3">Mã số thuế</th>
                  <th className="px-3 py-3">Người đại diện</th>
                  <th className="px-3 py-3">Phân hệ</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {DATA.map((dn) => (
                  <tr key={dn.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3"><input type="checkbox" className="accent-primary" /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-[13px] ${dn.logoColor}`}>
                          {dn.tenHienThi.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{dn.ten}</div>
                          <div className="text-[12px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dn.diaChi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[13px] text-foreground">{dn.mst}</td>
                    <td className="px-3 py-3">
                      <div className="text-foreground">{dn.daiDien}</div>
                      <div className="text-[12px] text-muted-foreground">{dn.sdt}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {dn.modules.map((m) => (
                          <span key={m} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${MODULE_INFO[m].color}`}>
                            {MODULE_INFO[m].label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${STATUS_BADGE[dn.status].cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
                        {STATUS_BADGE[dn.status].text}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button onClick={() => setLocation(`/quan-tri/doanh-nghiep/${dn.id}`)} className="p-1.5 rounded hover:bg-muted" title="Xem"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            <div>Hiển thị 1–6 trong tổng số 48 doanh nghiệp</div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowLeft className="w-4 h-4" /></button>
              {[1, 2, 3, "…", 8].map((p, i) => (
                <button key={i} className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "bg-primary text-primary-foreground font-semibold" : "border border-border hover:bg-muted"}`}>{p}</button>
              ))}
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Add DN Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[540px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">Thêm doanh nghiệp mới</div>
                <div className="text-[12.5px] text-muted-foreground">Điền đầy đủ thông tin để khởi tạo hồ sơ doanh nghiệp.</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 pt-4 border-b border-border">
              <div className="flex gap-1">
                {[
                  { k: "general", label: "Hồ sơ chung", n: 1 },
                  { k: "location", label: "Vị trí địa lý", n: 2 },
                  { k: "modules", label: "Phân hệ", n: 3 },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setActiveTab(t.k as typeof activeTab)}
                    className={`px-3 py-2.5 text-[13px] font-medium border-b-2 -mb-px flex items-center gap-2 transition ${activeTab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${activeTab === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t.n}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <Label>Ảnh logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
                        <Leaf className="w-8 h-8" />
                      </div>
                      <div>
                        <button className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted">
                          <Upload className="w-4 h-4" /> Tải ảnh lên
                        </button>
                        <div className="text-[11.5px] text-muted-foreground mt-1.5">PNG / JPG, tối đa 2MB. Khuyến nghị 512×512.</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Mã số thuế" required placeholder="46xxxxxxxx" />
                    <Field label="Tên đăng nhập" placeholder="vd: cong-ty-abc" />
                  </div>
                  <Field label="Tên doanh nghiệp" required placeholder="Tên đầy đủ theo giấy phép kinh doanh" />
                  <Field label="Tên hiển thị" required placeholder="Tên ngắn dùng trong giao diện" hint="Tên ngắn hiển thị trong giao diện và truy xuất nguồn gốc." />

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Người đại diện" placeholder="Họ và tên" />
                    <Field label="SĐT doanh nghiệp" placeholder="09xx xxx xxx" />
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Tỉnh / Thành phố" value="Thái Nguyên" />
                    <Select label="Xã / Phường" value="-- Chọn --" />
                  </div>
                  <Field label="Địa chỉ chi tiết" placeholder="Số nhà, đường, xóm…" />
                  <div className="rounded-xl border border-border bg-muted/40 h-44 flex items-center justify-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-2" /> Bản đồ vị trí (tùy chọn)
                  </div>
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-3">
                  <div className="text-[13px] text-muted-foreground mb-1">Chọn các phân hệ doanh nghiệp được phép truy cập.</div>
                  <ModuleToggle name="ERP" desc="Quản trị nguồn lực doanh nghiệp: bán hàng, kho, kế toán, nhân sự…" defaultChecked icon={LayoutGrid} color="emerald" />
                  <ModuleToggle name="TXNG" desc="Truy xuất nguồn gốc sản phẩm theo từng lô, mã QR." defaultChecked icon={Package} color="blue" />
                  <ModuleToggle name="Vùng trồng" desc="Quản lý vùng nguyên liệu, hộ liên kết, bản đồ canh tác." icon={Sprout} color="amber" />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
              <div className="text-[12.5px] text-muted-foreground">
                Bước <span className="font-semibold text-foreground">{activeTab === "general" ? 1 : activeTab === "location" ? 2 : 3}</span> / 3
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
                <button className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Lưu nháp</button>
                <button
                  onClick={() => {
                    if (activeTab === "general") setActiveTab("location");
                    else if (activeTab === "location") setActiveTab("modules");
                    else setDrawerOpen(false);
                  }}
                  className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110"
                >
                  {activeTab === "modules" ? "Tạo doanh nghiệp" : "Tiếp tục"}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}

function Stat({ label, value, delta, tone, icon: Icon }: { label: string; value: string; delta: string; tone: "emerald" | "blue" | "amber" | "rose"; icon: React.ComponentType<{ className?: string }>; }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="bg-white border border-border rounded-xl p-4 flex items-start justify-between">
      <div>
        <div className="text-[12.5px] text-muted-foreground">{label}</div>
        <div className="text-[24px] font-bold text-foreground leading-tight mt-0.5">{value}</div>
        <div className="text-[11.5px] text-muted-foreground mt-0.5">{delta}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
      {label}<ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium mb-1.5 text-foreground/80">{children}</div>;
}

function Field({ label, value, placeholder, required, hint }: { label: string; value?: string; placeholder?: string; required?: boolean; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium text-foreground/80">{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      <input defaultValue={value} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
      {hint && <div className="text-[11.5px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <button className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm flex items-center justify-between hover:bg-muted">
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function ModuleToggle({ name, desc, defaultChecked, icon: Icon, color }: { name: string; desc: string; defaultChecked?: boolean; icon: React.ComponentType<{ className?: string }>; color: "emerald" | "blue" | "amber"; }) {
  const [on, setOn] = useState(!!defaultChecked);
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: on ? "border-emerald-300 bg-emerald-50/40" : "border-border" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: on ? "border-blue-300 bg-blue-50/40" : "border-border" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: on ? "border-amber-300 bg-amber-50/40" : "border-border" },
  }[color];
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 transition ${tones.border}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones.bg} ${tones.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-foreground">{name}</div>
        <div className="text-[12.5px] text-muted-foreground leading-snug">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
