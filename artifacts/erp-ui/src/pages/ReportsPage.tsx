import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, FileText, FileSpreadsheet, Printer, Download,
  TrendingUp, TrendingDown, ShoppingCart, Package,
  Users, Scale, Leaf, BarChart2, PieChart, Activity, QrCode, Layers,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

type TabKey = "tong-hop" | "thu-mua" | "ban-hang" | "san-xuat" | "truy-xuat";

const MONTHLY_REVENUE = [
  { thang: "T10/25", thuMua: 72, banHang: 95 },
  { thang: "T11/25", thuMua: 85, banHang: 108 },
  { thang: "T12/25", thuMua: 110, banHang: 125 },
  { thang: "T1/26",  thuMua: 62, banHang: 78 },
  { thang: "T2/26",  thuMua: 48, banHang: 55 },
  { thang: "T3/26",  thuMua: 96, banHang: 115 },
];
const maxRev = Math.max(...MONTHLY_REVENUE.flatMap(m => [m.thuMua, m.banHang]));

const SANPHAM_DOANHTHU = [
  { label: "Chè xanh",   value: 72,  color: "bg-emerald-500", textColor: "text-emerald-700" },
  { label: "Hồng trà",   value: 48,  color: "bg-rose-400",    textColor: "text-rose-700" },
  { label: "Bạch trà",   value: 21,  color: "bg-sky-400",     textColor: "text-sky-700" },
  { label: "Phổ nhĩ",    value: 15,  color: "bg-amber-500",   textColor: "text-amber-700" },
  { label: "Đặc biệt",   value: 9,   color: "bg-violet-500",  textColor: "text-violet-700" },
];
const totalBar = SANPHAM_DOANHTHU.reduce((s, i) => s + i.value, 0);

const VUNG_DATA = [
  { vung: "Nà Hồng",   soHo: 10, klNam: 2840, phanTram: 45, color: "bg-emerald-500" },
  { vung: "Nà Bay",    soHo: 13, klNam: 2985, phanTram: 47, color: "bg-blue-500" },
  { vung: "Bản Chang", soHo: 3,  klNam: 507,  phanTram: 8,  color: "bg-amber-500" },
];

const TRACE_DATA = [
  { batch: "S073103", sp: "Bạch trà 50g (x33)", loSX: "L073103", batches: "RAW-NB010-3103, RAW-NB001-3103, RAW-NB002-3103, RAW-NB007-3103", vung: "Nà Bay", khach: "KH-003 (XNK Hà Nội)" },
  { batch: "S013003", sp: "Hồng trà 250g (x22)", loSX: "L013003", batches: "RAW-NH004-3003, RAW-NB002-3003", vung: "Nà Hồng / Nà Bay", khach: "KH-001 (Trà Thái Nguyên)" },
  { batch: "S09104",  sp: "Chè xanh 100g (x58)", loSX: "L09104",  batches: "RAW-NH001-0104, RAW-NH004-0104", vung: "Nà Hồng", khach: "KH-004 (Lotte Mart)" },
];

const THU_MUA_TOP = [
  { maHo: "NB010", tenHo: "Mạnh Văn Hồ",     vung: "Nà Bay",    kl: 680.0, diem: 96 },
  { maHo: "NB001", tenHo: "Nông Thị Dung",    vung: "Nà Bay",    kl: 520.0, diem: 94 },
  { maHo: "NH009", tenHo: "Hạ Văn Thắng",     vung: "Nà Hồng",   kl: 412.0, diem: 93 },
  { maHo: "NH004", tenHo: "Triệu Văn Thạo",   vung: "Nà Hồng",   kl: 325.5, diem: 92 },
  { maHo: "NB002", tenHo: "Nông Văn Nghiễm",  vung: "Nà Bay",    kl: 380.5, diem: 91 },
];

function fmtMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN");
}

const TRACE_DB: Record<string, { sp: string; loSX: string; rawBatches: string[]; farmers: string[]; vung: string; khach: string }> = {
  "QR-S013003": { sp:"Chè xanh 500g", loSX:"L013003", rawBatches:["RAW-NH004-3003","RAW-NB002-3003"], farmers:["NH004","NB002"], vung:"Nà Hồng + Nà Bay", khach:"Cty Trà Hà Nội" },
  "QR-S023103": { sp:"Hồng trà 100g", loSX:"L023103", rawBatches:["RAW-NH001-3103","RAW-NH002-3103","RAW-NH008-3103"], farmers:["NH001","NH002","NH008"], vung:"Nà Hồng", khach:"Siêu thị BigC" },
  "QR-S033103": { sp:"Bạch trà 50g",  loSX:"L033103", rawBatches:["RAW-NH009-3103","RAW-NH004-3103"], farmers:["NH009","NH004"], vung:"Nà Hồng", khach:"KH Nhật Bản" },
  "QR-S043103": { sp:"Chè xanh 1kg",  loSX:"L043103", rawBatches:["RAW-NH006-3103","RAW-NH007-3103"], farmers:["NH006","NH007"], vung:"Nà Hồng", khach:"Spa Lotus" },
  "QR-S073103": { sp:"Chè xanh 100g", loSX:"L073103", rawBatches:["RAW-NB010-3103","RAW-NB001-3103","RAW-NB002-3103","RAW-NB007-3103"], farmers:["NB010","NB001","NB002","NB007"], vung:"Nà Bay", khach:"Hội OCOP" },
  "QR-S09104":  { sp:"Hồng trà 200g", loSX:"L09104",  rawBatches:["RAW-NH001-0104","RAW-NH004-0104"], farmers:["NH001","NH004"], vung:"Nà Hồng", khach:"Cty XK Bắc Hà" },
  "QR-S010104": { sp:"Chè xanh 500g", loSX:"L010104", rawBatches:["RAW-NB011-0104","RAW-NB012-0104","RAW-NB010-0104"], farmers:["NB011","NB012","NB010"], vung:"Nà Bay", khach:"Siêu thị AEON" },
};

function TraceSearch() {
  const [query, setQuery] = useState("");
  const result = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toUpperCase();
    const key = Object.keys(TRACE_DB).find(k => k.toUpperCase().includes(q) || TRACE_DB[k].loSX.toUpperCase().includes(q) || TRACE_DB[k].rawBatches.some(b=>b.toUpperCase().includes(q)));
    return key ? { key, ...TRACE_DB[key] } : null;
  }, [query]);
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2"><QrCode className="w-4 h-4 text-primary"/> Tra cứu truy xuất theo QR / Batch / Mã lô</p>
      <div className="relative mb-4">
        <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nhập QR code (QR-S013003), mã lô SX (L023103), hoặc batch RAW (RAW-NH004-3003)..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"/>
      </div>
      {query.trim() && !result && (
        <div className="text-center py-6 text-muted-foreground text-sm">Không tìm thấy thông tin truy xuất cho "<span className="font-mono">{query}</span>"</div>
      )}
      {result && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Kết quả cho: <span className="font-mono font-semibold text-primary">{result.key}</span></p>
          <div className="flex flex-wrap items-start gap-2 text-xs">
            {[
              { label:"Sản phẩm", val:result.sp, color:"bg-violet-50 border-violet-200 text-violet-800" },
              { label:"Lô SX", val:result.loSX, color:"bg-primary/10 border-primary/30 text-primary" },
              { label:"RAW Batch NVL", val:result.rawBatches.join(", "), color:"bg-blue-50 border-blue-200 text-blue-800" },
              { label:"Nông hộ", val:result.farmers.join(", "), color:"bg-emerald-50 border-emerald-200 text-emerald-800" },
              { label:"Vùng trồng", val:result.vung, color:"bg-amber-50 border-amber-200 text-amber-800" },
              { label:"Khách hàng", val:result.khach, color:"bg-gray-50 border-gray-200 text-gray-800" },
            ].map((step,si)=>(
              <div key={si} className="flex items-center gap-1.5">
                {si>0&&<span className="text-muted-foreground text-xs">→</span>}
                <div className={`border px-3 py-2 rounded-xl ${step.color}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-0.5">{step.label}</p>
                  <p className="font-bold text-xs">{step.val}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium">✓ Chuỗi truy xuất hoàn chỉnh · Nguồn gốc: Shan Tuyết Bằng Phúc, Hà Giang</p>
        </div>
      )}
      {!query.trim() && (
        <p className="text-xs text-muted-foreground text-center py-2">Thử tìm: <span className="font-mono text-primary cursor-pointer hover:underline" onClick={()=>setQuery("QR-S023103")}>QR-S023103</span> · <span className="font-mono text-primary cursor-pointer hover:underline" onClick={()=>setQuery("RAW-NH001")}>RAW-NH001</span> · <span className="font-mono text-primary cursor-pointer hover:underline" onClick={()=>setQuery("L09104")}>L09104</span></p>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("tong-hop");

  const handleExportExcel = () => exportToExcel(
    [
      { header: "Tháng", key: "thang", width: 12 },
      { header: "Thu mua (triệu đ)", key: "thuMua", width: 20 },
      { header: "Bán hàng (triệu đ)", key: "banHang", width: 20 },
    ],
    MONTHLY_REVENUE as unknown as Record<string, unknown>[],
    "BaoCao_HTXHongHa"
  );

  const handleExportPDF = () => exportToPDF(
    "Báo cáo Doanh thu HTX Hồng Hà",
    "Hệ thống Truy xuất nguồn gốc Chè Quân Chu · Tổng hợp 6 tháng gần nhất",
    [
      { header: "Tháng", key: "thang", width: 20 },
      { header: "Thu mua (triệu đ)", key: "thuMua", width: 30 },
      { header: "Bán hàng (triệu đ)", key: "banHang", width: 30 },
    ],
    MONTHLY_REVENUE as unknown as Record<string, unknown>[],
    "BaoCao_HTXHongHa"
  );

  const TABS: { key: TabKey; label: string; icon: React.ComponentType<{className?: string}> }[] = [
    { key: "tong-hop",  label: "Tổng hợp",       icon: BarChart2 },
    { key: "thu-mua",   label: "Thu mua",          icon: Scale },
    { key: "ban-hang",  label: "Bán hàng",         icon: ShoppingCart },
    { key: "san-xuat",  label: "Sản xuất",         icon: Leaf },
    { key: "truy-xuat", label: "Truy xuất nguồn", icon: QrCode },
  ];

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Quay lại ERP</button>
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Báo cáo & Phân tích</h1><p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Sản phẩm → Batch → Nông hộ · Báo cáo OCOP</p></div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted/50"><Printer className="w-3.5 h-3.5" /> In</button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: TrendingUp,  label: "Doanh thu T3",  value: "115 tr đ",  sub: "+20% so T2",   color:"text-emerald-600 bg-emerald-50" },
          { icon: Scale,       label: "KL thu mua",    value: "643 kg",    sub: "tháng 3/2026", color:"text-blue-600 bg-blue-50" },
          { icon: Leaf,        label: "Thành phẩm",    value: "152 kg",    sub: "tháng 3/2026", color:"text-violet-600 bg-violet-50" },
          { icon: Users,       label: "Hộ tham gia",   value: "26 hộ",     sub: "3 vùng trồng", color:"text-amber-600 bg-amber-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Tổng hợp */}
      {activeTab === "tong-hop" && (
        <div className="space-y-4">
          {/* Chart doanh thu */}
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm">Doanh thu 6 tháng gần nhất</p>
              <div className="flex items-center gap-3 text-xs"><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"/>Thu mua</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"/>Bán hàng</span></div>
            </div>
            <div className="space-y-3">
              {MONTHLY_REVENUE.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground w-12 shrink-0">{m.thang}</p>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 h-3 bg-muted/30 rounded-full overflow-hidden"><div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full" style={{width:`${(m.thuMua/maxRev)*100}%`}}/></div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{fmtMoney(m.thuMua*1e6)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 h-3 bg-muted/30 rounded-full overflow-hidden"><div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" style={{width:`${(m.banHang/maxRev)*100}%`}}/></div>
                      <span className="text-xs font-semibold w-16 text-right">{fmtMoney(m.banHang*1e6)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2 cột */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Doanh thu theo SP */}
            <div className="bg-white border border-border rounded-xl p-5">
              <p className="font-semibold text-sm mb-4">Doanh thu theo sản phẩm (T3/2026)</p>
              <div className="space-y-3">
                {SANPHAM_DOANHTHU.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium">{item.label}</p><p className={`text-sm font-bold ${item.textColor}`}>{fmtMoney(item.value*1e6)} đ</p></div>
                    <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden"><div className={`absolute inset-y-0 left-0 ${item.color} rounded-full`} style={{width:`${(item.value/totalBar)*100}%`}}/></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vùng trồng */}
            <div className="bg-white border border-border rounded-xl p-5">
              <p className="font-semibold text-sm mb-4">Sản lượng theo vùng trồng</p>
              <div className="space-y-3">
                {VUNG_DATA.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${v.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium">{v.vung}</p><p className="text-sm font-bold">{v.klNam} kg/năm</p></div>
                      <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden"><div className={`absolute inset-y-0 left-0 ${v.color} rounded-full`} style={{width:`${v.phanTram}%`}}/></div>
                    </div>
                    <p className="text-xs text-muted-foreground w-8">{v.phanTram}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thu mua */}
      {activeTab === "thu-mua" && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Top 5 nông hộ sản lượng cao nhất</p></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">{["Hạng","Mã hộ","Tên hộ","Vùng","KL tích lũy (kg)","Điểm CL"].map((h,i)=><th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>{THU_MUA_TOP.map((h,i)=>(
                  <tr key={i} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="py-3 px-4"><span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i===0?"bg-yellow-100 text-yellow-700":i===1?"bg-gray-100 text-gray-600":i===2?"bg-orange-100 text-orange-700":"bg-muted text-muted-foreground"}`}>{i+1}</span></td>
                    <td className="py-3 px-4"><span className="font-mono text-xs text-primary">{h.maHo}</span></td>
                    <td className="py-3 px-4 font-medium">{h.tenHo}</td>
                    <td className="py-3 px-4"><span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${h.vung==="Nà Hồng"?"bg-emerald-100 text-emerald-700":h.vung==="Nà Bay"?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-700"}`}>{h.vung}</span></td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{h.kl} kg</td>
                    <td className="py-3 px-4"><span className={`font-bold ${h.diem>=90?"text-emerald-700":h.diem>=80?"text-blue-700":"text-amber-700"}`}>{h.diem}%</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="font-semibold text-sm mb-3">Phân bổ theo vùng trồng</p>
            <div className="flex gap-4">
              {VUNG_DATA.map((v,i)=>(
                <div key={i} className="flex-1 bg-muted/20 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold">{v.vung}</p>
                  <p className="text-2xl font-black text-primary mt-1">{v.soHo}</p>
                  <p className="text-xs text-muted-foreground">hộ</p>
                  <p className="text-sm font-bold mt-2">{v.klNam} kg</p>
                  <p className="text-xs text-muted-foreground">mỗi năm</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bán hàng */}
      {activeTab === "ban-hang" && (
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="font-semibold text-sm mb-4">Doanh thu bán hàng theo sản phẩm</p>
            <div className="space-y-4">
              {[
                { hang:"Chè xanh", nhap:340, xuat:380, ton:80, dt:72000000 },
                { hang:"Hồng trà", nhap:210, xuat:260, ton:40, dt:47600000 },
                { hang:"Bạch trà", nhap:65,  xuat:82,  ton:13, dt:21000000 },
                { hang:"Phổ nhĩ",  nhap:40,  xuat:55,  ton:10, dt:14700000 },
                { hang:"Đặc biệt", nhap:28,  xuat:38,  ton:5,  dt:22500000 },
              ].map((r,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                  <p className="font-medium text-sm">{r.hang}</p>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center"><p className="text-xs text-muted-foreground">Nhập</p><p className="font-semibold">{r.nhap} kg</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Xuất</p><p className="font-semibold text-red-600">{r.xuat} kg</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Tồn</p><p className="font-semibold">{r.ton} kg</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Doanh thu</p><p className="font-bold text-emerald-700">{fmtMoney(r.dt)} đ</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sản xuất */}
      {activeTab === "san-xuat" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="font-semibold text-sm mb-4">Công suất sản xuất T3–T4/2026</p>
            {[{l:"Hồng trà",nvl:153.8,tp:34.7,ty:22.6},{l:"Bạch trà",nvl:9.5,tp:1.7,ty:17.9},{l:"Chè xanh",nvl:356.3,tp:85.2,ty:23.9}].map((p,i)=>(
              <div key={i} className="mb-4">
                <div className="flex items-center justify-between mb-1"><p className="text-sm font-semibold">{p.l}</p><p className="text-xs text-muted-foreground">TH: {p.ty}%</p></div>
                <div className="flex gap-2 text-xs text-muted-foreground"><span>NVL: <strong className="text-foreground">{p.nvl} kg</strong></span><span>→</span><span>TP: <strong className="text-emerald-700">{p.tp} kg</strong></span></div>
                <div className="mt-1.5 relative h-2 bg-muted/30 rounded-full overflow-hidden"><div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full" style={{width:`${p.ty*4}%`}}/></div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="font-semibold text-sm mb-4">Chỉ số sản xuất</p>
            <div className="space-y-3">
              {[{l:"Tổng lệnh SX",v:"19 lô"},{l:"Đang chế biến",v:"4 lô"},{l:"Hoàn thành tháng 4",v:"5 lô"},{l:"Đã nhập kho",v:"8 lô"},{l:"Tổng NVL đã dùng",v:"519 kg"},{l:"Tổng TP đã SX",v:"118 kg"},{l:"Tỷ lệ thu hồi TB",v:"22.7%"},{l:"Số hộ tham gia SX",v:"26 hộ"}].map((r,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                  <p className="text-sm text-muted-foreground">{r.l}</p><p className="text-sm font-bold">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Truy xuất */}
      {activeTab === "truy-xuat" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <QrCode className="w-5 h-5 text-amber-700 shrink-0 mt-0.5"/>
            <div><p className="text-sm font-semibold text-amber-900">Hệ thống Truy xuất Nguồn gốc</p><p className="text-xs text-amber-700 mt-1">Mỗi sản phẩm đều có thể truy ngược về: Lô đóng gói → Lô sản xuất → Batch NVL → Nông hộ → Vùng trồng cụ thể</p></div>
          </div>
          {/* QR / Batch search */}
          <TraceSearch />
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20"><p className="text-sm font-semibold">Chain truy xuất theo sản phẩm đã xuất kho</p></div>
            <div className="divide-y divide-border">
              {TRACE_DATA.map((t,i)=>(
                <div key={i} className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{t.batch}</span>
                    <span className="text-sm font-medium">{t.sp}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {[{icon:Package,label:"Lô SX",val:t.loSX,color:"bg-violet-50 border-violet-200 text-violet-700"},
                      {icon:Layers,label:"Batch NVL",val:t.batches,color:"bg-blue-50 border-blue-200 text-blue-700"},
                      {icon:Users,label:"Vùng",val:t.vung,color:"bg-emerald-50 border-emerald-200 text-emerald-700"},
                      {icon:ShoppingCart,label:"KH",val:t.khach,color:"bg-amber-50 border-amber-200 text-amber-700"},
                    ].map((step,si)=>(
                      <div key={si} className="flex items-center gap-1.5">
                        {si>0&&<span className="text-muted-foreground">→</span>}
                        <div className={`flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg border ${step.color}`}>
                          <step.icon className="w-3 h-3 mt-0.5 shrink-0"/>
                          <div><p className="font-semibold">{step.label}</p><p className="opacity-80 max-w-[160px]">{step.val}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="font-semibold text-sm mb-3">Thống kê truy xuất</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[{l:"Batch NVL",v:"24+"},{l:"Batch TP",v:"15+"},{l:"Lô đóng gói có QR",v:"12"},{l:"% sản phẩm truy xuất được",v:"100%"}].map((s,i)=>(
                <div key={i} className="bg-muted/20 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{s.l}</p><p className="text-xl font-bold text-primary mt-1">{s.v}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
