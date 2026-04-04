import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, FileText, FileSpreadsheet, Printer, Download,
  TrendingUp, TrendingDown, ShoppingCart, Package,
  Users, Scale, Leaf, BarChart2, PieChart, Activity,
} from "lucide-react";

type TabKey = "tong-hop" | "thu-mua" | "ban-hang" | "san-xuat";

interface BarItem { label: string; value: number; color: string; }
interface TableRow { hang: string; nhap: number; xuat: number; ton: number; doanhThu: number; }

const MONTHLY_REVENUE = [
  { thang: "T10/25", thuMua: 72, banHang: 95 },
  { thang: "T11/25", thuMua: 85, banHang: 108 },
  { thang: "T12/25", thuMua: 110, banHang: 125 },
  { thang: "T1/26",  thuMua: 62, banHang: 78 },
  { thang: "T2/26",  thuMua: 48, banHang: 55 },
  { thang: "T3/26",  thuMua: 96, banHang: 115 },
];

const SANPHAM_DOANHTHU: BarItem[] = [
  { label: "Chè xanh",   value: 72,  color: "bg-emerald-500" },
  { label: "Hồng trà",   value: 48,  color: "bg-red-400" },
  { label: "Bạch trà",   value: 21,  color: "bg-gray-300" },
  { label: "Phổ nhĩ",    value: 15,  color: "bg-amber-600" },
  { label: "Đặc biệt",   value: 9,   color: "bg-violet-500" },
];
const totalBar = SANPHAM_DOANHTHU.reduce((s, i) => s + i.value, 0);

const TABLE_DATA: TableRow[] = [
  { hang: "Chè búp tươi",     nhap: 2640, xuat: 3100, ton: 360, doanhThu: 0 },
  { hang: "Chè xanh",         nhap: 340,  xuat: 380,  ton: 80,  doanhThu: 72000000 },
  { hang: "Hồng trà",         nhap: 210,  xuat: 260,  ton: 40,  doanhThu: 47600000 },
  { hang: "Bạch trà",         nhap: 65,   xuat: 82,   ton: 13,  doanhThu: 21000000 },
  { hang: "Phổ nhĩ",          nhap: 40,   xuat: 55,   ton: 10,  doanhThu: 14700000 },
  { hang: "Chè đặc biệt",     nhap: 28,   xuat: 38,   ton: 5,   doanhThu: 22500000 },
];

function fmtMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN");
}

const maxRev = Math.max(...MONTHLY_REVENUE.flatMap(m => [m.thuMua, m.banHang]));

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("tong-hop");

  const TABS: { key: TabKey; label: string; icon: React.ComponentType<{className?: string}> }[] = [
    { key: "tong-hop",  label: "Tổng hợp",  icon: BarChart2 },
    { key: "thu-mua",   label: "Thu mua",   icon: Scale },
    { key: "ban-hang",  label: "Bán hàng",  icon: ShoppingCart },
    { key: "san-xuat",  label: "Sản xuất",  icon: Leaf },
  ];

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Báo cáo &amp; Thống kê</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Tổng hợp hoạt động kinh doanh</p>
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
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp,   label: "Doanh thu T3/2026",  value: "115 tr đ",      sub: "+20% so tháng trước", color: "text-emerald-600 bg-emerald-50" },
          { icon: Scale,        label: "Tổng thu mua",       value: "2.640 kg",       sub: "chè búp tươi",        color: "text-blue-600 bg-blue-50" },
          { icon: Package,      label: "Sản lượng đóng gói", value: "1.824 hộp",      sub: "tháng 3",             color: "text-violet-600 bg-violet-50" },
          { icon: Users,        label: "Hộ nông dân",        value: "26 hộ",          sub: "liên kết thu mua",    color: "text-amber-600 bg-amber-50" },
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

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted/40 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "tong-hop" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-foreground">Biểu đồ Doanh thu / Chi thu mua</h3>
                <p className="text-xs text-muted-foreground mt-0.5">6 tháng gần nhất (triệu đồng)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-emerald-500 inline-block"/> Bán hàng</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-blue-400 inline-block"/> Thu mua</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_REVENUE.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-32">
                    <div className="flex-1 rounded-t-sm bg-blue-400 transition-all" style={{ height: `${(m.thuMua / maxRev) * 100}%` }} title={`Thu mua: ${m.thuMua}tr`} />
                    <div className="flex-1 rounded-t-sm bg-emerald-500 transition-all" style={{ height: `${(m.banHang / maxRev) * 100}%` }} title={`Bán hàng: ${m.banHang}tr`} />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{m.thang}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product breakdown */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-1">Cơ cấu sản phẩm</h3>
            <p className="text-xs text-muted-foreground mb-4">Theo doanh thu T3/2026</p>
            <div className="space-y-3">
              {SANPHAM_DOANHTHU.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(item.value / totalBar * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value / totalBar * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary table */}
          <div className="lg:col-span-3 bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Bảng tổng hợp theo sản phẩm – Tháng 3/2026</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Mặt hàng", "Nhập kho (kg)", "Xuất kho (kg)", "Tồn kho (kg)", "Doanh thu"].map(h => (
                      <th key={h} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_DATA.map((row, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-muted/20">
                      <td className="py-3 px-4 font-medium">{row.hang}</td>
                      <td className="py-3 px-4 text-emerald-600 font-semibold">+{row.nhap.toLocaleString()} kg</td>
                      <td className="py-3 px-4 text-red-500 font-semibold">-{row.xuat.toLocaleString()} kg</td>
                      <td className="py-3 px-4 font-bold">{row.ton.toLocaleString()} kg</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{row.doanhThu > 0 ? fmtMoney(row.doanhThu) + " đ" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 border-t-2 border-border">
                    <td className="py-3 px-4 font-bold">TỔNG CỘNG</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">+{TABLE_DATA.reduce((s,r) => s+r.nhap,0).toLocaleString()} kg</td>
                    <td className="py-3 px-4 font-bold text-red-500">-{TABLE_DATA.reduce((s,r) => s+r.xuat,0).toLocaleString()} kg</td>
                    <td className="py-3 px-4 font-bold">{TABLE_DATA.reduce((s,r) => s+r.ton,0).toLocaleString()} kg</td>
                    <td className="py-3 px-4 font-bold text-primary">{fmtMoney(TABLE_DATA.reduce((s,r) => s+r.doanhThu,0))} đ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "thu-mua" && (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm font-semibold text-foreground">Báo cáo Thu mua chi tiết</p>
          <p className="text-xs text-muted-foreground mt-1">Xem phân tích theo hộ nông dân, thời vụ, chất lượng nguyên liệu</p>
          <button onClick={() => setLocation("/module/erp/purchase")} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Đến trang Thu mua
          </button>
        </div>
      )}

      {activeTab === "ban-hang" && (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <PieChart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm font-semibold text-foreground">Báo cáo Bán hàng chi tiết</p>
          <p className="text-xs text-muted-foreground mt-1">Phân tích theo khách hàng, kênh phân phối, sản phẩm</p>
          <button onClick={() => setLocation("/module/erp/sales")} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Đến trang Bán hàng
          </button>
        </div>
      )}

      {activeTab === "san-xuat" && (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <BarChart2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm font-semibold text-foreground">Báo cáo Sản xuất chi tiết</p>
          <p className="text-xs text-muted-foreground mt-1">Năng suất chế biến, tỷ lệ thành phẩm, hiệu suất thiết bị</p>
          <button onClick={() => setLocation("/module/erp/production")} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Đến trang Sản xuất
          </button>
        </div>
      )}
    </AppLayout>
  );
}
