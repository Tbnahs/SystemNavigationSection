import "./_group.css";
import { useState } from "react";
import {
  Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, X, Upload,
  Building2, Users, Package, Sprout, Leaf, Bell, Settings, LayoutGrid,
  Pencil, Trash2, Eye, MapPin, ArrowLeft, ArrowRight,
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
  ERP: { label: "ERP", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", icon: LayoutGrid },
  TXNG: { label: "TXNG", color: "bg-blue-50 text-blue-700 ring-blue-600/20", icon: Package },
  VT: { label: "Vùng trồng", color: "bg-amber-50 text-amber-700 ring-amber-600/20", icon: Sprout },
} as const;

export function DoanhNghiep() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "location" | "modules">("general");

  return (
    <div className="erp-root min-h-screen flex" style={{ background: "hsl(220 20% 96%)" }}>
      <Sidebar active="dn" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Quản lý Doanh nghiệp" crumb={["Quản trị hệ thống", "Doanh nghiệp"]} />

        <div className="flex-1 px-8 py-6 overflow-auto">
          {/* Stat row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Stat label="Tổng doanh nghiệp" value="48" delta="+4 trong tháng" tone="emerald" icon={Building2} />
            <Stat label="Đang hoạt động" value="42" delta="87.5% tổng" tone="blue" icon={Users} />
            <Stat label="Chờ duyệt" value="4" delta="Cần xử lý" tone="amber" icon={Bell} />
            <Stat label="Tạm khóa" value="2" delta="-1 tuần này" tone="rose" icon={X} />
          </div>

          {/* Toolbar */}
          <div className="bg-white border rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap" style={{ borderColor: "hsl(220 13% 91%)" }}>
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Tìm theo MST, tên doanh nghiệp, người đại diện…"
                className="w-full h-10 pl-9 pr-3 rounded-lg border bg-white text-sm outline-none focus:border-emerald-500"
                style={{ borderColor: "hsl(220 13% 88%)" }}
              />
            </div>
            <SelectChip label="Tỉnh / Thành phố" />
            <SelectChip label="Phân hệ" />
            <SelectChip label="Trạng thái" />
            <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
              <Filter className="w-4 h-4" />
              Bộ lọc
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="h-10 px-4 rounded-lg text-white text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
              style={{ background: "hsl(142 71% 38%)" }}
            >
              <Plus className="w-4 h-4" /> Thêm doanh nghiệp
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "hsl(220 13% 91%)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider" style={{ color: "hsl(220 9% 46%)", background: "hsl(220 20% 98%)" }}>
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-emerald-600" /></th>
                  <th className="px-3 py-3">Doanh nghiệp</th>
                  <th className="px-3 py-3">Mã số thuế</th>
                  <th className="px-3 py-3">Người đại diện</th>
                  <th className="px-3 py-3">Phân hệ</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {DATA.map((dn, idx) => (
                  <tr key={dn.id} className={`border-t hover:bg-emerald-50/30 ${idx === 0 ? "bg-emerald-50/40" : ""}`} style={{ borderColor: "hsl(220 13% 93%)" }}>
                    <td className="px-4 py-3"><input type="checkbox" className="accent-emerald-600" defaultChecked={idx === 0} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-[13px] ${dn.logoColor}`}>
                          {dn.tenHienThi.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{dn.ten}</div>
                          <div className="text-[12px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dn.diaChi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[13px] text-slate-700">{dn.mst}</td>
                    <td className="px-3 py-3">
                      <div className="text-slate-700">{dn.daiDien}</div>
                      <div className="text-[12px] text-slate-500">{dn.sdt}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {dn.modules.map((m) => (
                          <span key={m} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${MODULE_INFO[m].color}`}>
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
                      <div className="flex items-center gap-1 text-slate-500">
                        <button className="p-1.5 rounded hover:bg-slate-100"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t text-[13px] text-slate-500" style={{ borderColor: "hsl(220 13% 93%)" }}>
              <div>Hiển thị 1–6 trong tổng số 48 doanh nghiệp</div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)" }}><ArrowLeft className="w-4 h-4" /></button>
                {[1, 2, 3, "…", 8].map((p, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "text-white font-semibold" : "hover:bg-slate-50 border"}`} style={p === 1 ? { background: "hsl(142 71% 38%)" } : { borderColor: "hsl(220 13% 88%)" }}>{p}</button>
                ))}
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)" }}><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add DN Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-[540px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
              <div>
                <div className="text-[18px] font-semibold text-slate-800">Thêm doanh nghiệp mới</div>
                <div className="text-[12.5px] text-slate-500">Điền đầy đủ thông tin để khởi tạo hồ sơ doanh nghiệp.</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 border-b" style={{ borderColor: "hsl(220 13% 91%)" }}>
              <div className="flex gap-1">
                {[
                  { k: "general", label: "Hồ sơ chung", n: 1 },
                  { k: "location", label: "Vị trí địa lý", n: 2 },
                  { k: "modules", label: "Phân hệ", n: 3 },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setActiveTab(t.k as typeof activeTab)}
                    className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-px flex items-center gap-2 transition ${activeTab === t.k ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${activeTab === t.k ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{t.n}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {activeTab === "general" && (
                <div className="space-y-4">
                  {/* Logo upload */}
                  <div>
                    <Label>Ảnh logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
                        <Leaf className="w-8 h-8" />
                      </div>
                      <div>
                        <button className="h-9 px-3 rounded-lg border text-[13px] font-medium flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>
                          <Upload className="w-4 h-4" /> Tải ảnh lên
                        </button>
                        <div className="text-[11.5px] text-slate-400 mt-1.5">PNG / JPG, tối đa 2MB. Kích thước khuyến nghị 512×512.</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Mã số thuế" required value="4601234567" />
                    <Field label="Tên đăng nhập" value="che-quan-chu" placeholder="vd: cong-ty-abc" />
                  </div>
                  <Field label="Tên doanh nghiệp" required value="Hợp tác xã Chè Quân Chu" />
                  <Field label="Tên hiển thị" required value="Chè Quân Chu" hint="Tên ngắn dùng trong giao diện và truy xuất nguồn gốc." />

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Người đại diện" value="Nguyễn Văn Hùng" />
                    <Field label="SĐT doanh nghiệp" value="0987 123 456" placeholder="09xx xxx xxx" />
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Tỉnh / Thành phố" value="Thái Nguyên" />
                    <Select label="Xã / Phường" value="Xã Quân Chu" />
                  </div>
                  <Field label="Địa chỉ chi tiết" value="Xóm Cây Hồng, Xã Quân Chu, Huyện Đại Từ" placeholder="Số nhà, đường, xóm…" />
                  <div className="rounded-xl border bg-slate-50/60 h-44 flex items-center justify-center text-slate-400 text-sm" style={{ borderColor: "hsl(220 13% 91%)" }}>
                    <MapPin className="w-4 h-4 mr-2" /> Bản đồ vị trí (tùy chọn)
                  </div>
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-3">
                  <div className="text-[13px] text-slate-500 mb-1">Chọn các phân hệ doanh nghiệp được phép truy cập.</div>
                  <ModuleToggle name="ERP" desc="Quản trị nguồn lực doanh nghiệp: bán hàng, kho, kế toán, nhân sự…" defaultChecked icon={LayoutGrid} color="emerald" />
                  <ModuleToggle name="TXNG" desc="Truy xuất nguồn gốc sản phẩm theo từng lô, mã QR." defaultChecked icon={Package} color="blue" />
                  <ModuleToggle name="Vùng trồng" desc="Quản lý vùng nguyên liệu, hộ liên kết, bản đồ canh tác." icon={Sprout} color="amber" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between bg-slate-50/60" style={{ borderColor: "hsl(220 13% 91%)" }}>
              <div className="text-[12.5px] text-slate-500">
                Bước <span className="font-semibold text-slate-700">{activeTab === "general" ? 1 : activeTab === "location" ? 2 : 3}</span> / 3
              </div>
              <div className="flex items-center gap-2">
                <button className="h-10 px-4 rounded-lg border text-[13.5px] font-medium hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>Hủy</button>
                <button className="h-10 px-4 rounded-lg border text-[13.5px] font-medium hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>Lưu nháp</button>
                <button className="h-10 px-5 rounded-lg text-white text-[13.5px] font-semibold shadow-sm hover:brightness-110" style={{ background: "hsl(142 71% 38%)" }}>
                  {activeTab === "modules" ? "Tạo doanh nghiệp" : "Tiếp tục"}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

/* ───── helpers ───── */

function Sidebar({ active }: { active: string }) {
  const items = [
    { k: "dash", icon: LayoutGrid, label: "Tổng quan" },
    { k: "dn", icon: Building2, label: "Doanh nghiệp" },
    { k: "user", icon: Users, label: "Người dùng" },
    { k: "txng", icon: Package, label: "Truy xuất NG" },
    { k: "vt", icon: Sprout, label: "Vùng trồng" },
    { k: "set", icon: Settings, label: "Cài đặt" },
  ];
  return (
    <aside className="w-[230px] shrink-0 bg-white border-r flex flex-col" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div className="h-[64px] px-5 flex items-center gap-2.5 border-b" style={{ borderColor: "hsl(220 13% 91%)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(142 71% 38%)" }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-slate-800 leading-none">ESG Valley</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Quản trị hệ thống</div>
        </div>
      </div>
      <nav className="p-3 flex-1 space-y-0.5">
        {items.map((it) => (
          <button
            key={it.k}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition ${active === it.k ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <it.icon className="w-4 h-4" />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: "hsl(220 13% 91%)" }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[12px] font-semibold flex items-center justify-center">AD</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-slate-800 truncate">Admin ESG</div>
            <div className="text-[11px] text-slate-500 truncate">admin@esgvalley.vn</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, crumb }: { title: string; crumb: string[] }) {
  return (
    <div className="h-[64px] px-8 border-b bg-white flex items-center justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div>
        <div className="text-[11.5px] text-slate-400 flex items-center gap-1.5">
          {crumb.map((c, i) => (<span key={i}>{i > 0 && <span className="mx-1">/</span>}{c}</span>))}
        </div>
        <h1 className="text-[18px] font-semibold text-slate-800 leading-tight mt-0.5">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Tìm kiếm nhanh…" className="h-10 w-[260px] pl-9 pr-3 rounded-lg border bg-slate-50 text-sm outline-none focus:bg-white focus:border-emerald-500" style={{ borderColor: "hsl(220 13% 91%)" }} />
        </div>
        <button className="w-10 h-10 rounded-lg border flex items-center justify-center text-slate-500 hover:bg-slate-50 relative" style={{ borderColor: "hsl(220 13% 88%)" }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>
      </div>
    </div>
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
    <div className="bg-white border rounded-xl p-4 flex items-start justify-between" style={{ borderColor: "hsl(220 13% 91%)" }}>
      <div>
        <div className="text-[12.5px] text-slate-500">{label}</div>
        <div className="text-[26px] font-bold text-slate-800 leading-tight mt-0.5">{value}</div>
        <div className="text-[11.5px] text-slate-400 mt-0.5">{delta}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 9% 46%)" }}>
      {label}<ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium mb-1.5" style={{ color: "hsl(220 13% 25%)" }}>{children}</div>;
}

function Field({ label, value, placeholder, required, hint }: { label: string; value?: string; placeholder?: string; required?: boolean; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium" style={{ color: "hsl(220 13% 25%)" }}>{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      <input defaultValue={value} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg border bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" style={{ borderColor: "hsl(220 13% 88%)" }} />
      {hint && <div className="text-[11.5px] text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <button className="w-full h-10 px-3 rounded-lg border bg-white text-sm flex items-center justify-between hover:bg-slate-50" style={{ borderColor: "hsl(220 13% 88%)", color: "hsl(220 13% 25%)" }}>
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}

function ModuleToggle({ name, desc, defaultChecked, icon: Icon, color }: { name: string; desc: string; defaultChecked?: boolean; icon: React.ComponentType<{ className?: string }>; color: "emerald" | "blue" | "amber"; }) {
  const [on, setOn] = useState(!!defaultChecked);
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: on ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: on ? "border-blue-300 bg-blue-50/40" : "border-slate-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: on ? "border-amber-300 bg-amber-50/40" : "border-slate-200" },
  }[color];
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 transition ${tones.border}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones.bg} ${tones.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-slate-800">{name}</div>
        <div className="text-[12.5px] text-slate-500 leading-snug">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
