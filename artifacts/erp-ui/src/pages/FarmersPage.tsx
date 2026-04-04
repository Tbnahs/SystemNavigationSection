import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Download, Filter,
  ChevronUp, ChevronDown, Users, MapPin,
  Phone, Leaf, X, FileSpreadsheet, FileText, Printer,
} from "lucide-react";

const dsHoLKData = [
  { stt: 1,  hoDan: "Hoàng Thị Luyến",  maHo: "NH001", diaChi: "Nà Hồng",   sdt: "354125321", dienTich: 0.5 },
  { stt: 2,  hoDan: "Hoàng Thị Đào",    maHo: "NH002", diaChi: "Nà Hồng",   sdt: "374704822", dienTich: 0.4 },
  { stt: 3,  hoDan: "Phạm Thị Huyền",   maHo: "NH003", diaChi: "Nà Hồng",   sdt: "379251872", dienTich: 1.0 },
  { stt: 4,  hoDan: "Triệu Văn Thạo",   maHo: "NH004", diaChi: "Nà Hồng",   sdt: "354871949", dienTich: 0.8 },
  { stt: 5,  hoDan: "Hoàng Văn Thái",   maHo: "NH005", diaChi: "Nà Hồng",   sdt: "972061820", dienTich: 0.5 },
  { stt: 6,  hoDan: "Triệu Văn Hòa",    maHo: "NH006", diaChi: "Nà Hồng",   sdt: "378360830", dienTich: 0.8 },
  { stt: 7,  hoDan: "Hoàng Văn Tuấn",   maHo: "NH007", diaChi: "Nà Hồng",   sdt: "387851867", dienTich: 1.0 },
  { stt: 8,  hoDan: "Đồng Thị Khuyết",  maHo: "NH008", diaChi: "Nà Hồng",   sdt: "962041090", dienTich: 0.7 },
  { stt: 9,  hoDan: "Hạ Văn Thắng",     maHo: "NH009", diaChi: "Nà Hồng",   sdt: "337318858", dienTich: 1.5 },
  { stt: 10, hoDan: "Dương Thị Tươi",   maHo: "NH010", diaChi: "Nà Hồng",   sdt: "",          dienTich: 0.5 },
  { stt: 11, hoDan: "Nông Thị Dung",    maHo: "NB001", diaChi: "Nà Bay",    sdt: "961466732", dienTich: 1.5 },
  { stt: 12, hoDan: "Nông Văn Nghiễm",  maHo: "NB002", diaChi: "Nà Bay",    sdt: "814665955", dienTich: 1.0 },
  { stt: 13, hoDan: "Mùng Văn Thời",    maHo: "NB003", diaChi: "Nà Bay",    sdt: "369254973", dienTich: 0.6 },
  { stt: 14, hoDan: "Triệu Văn Mỹ",     maHo: "NB004", diaChi: "Nà Bay",    sdt: "383760794", dienTich: 1.0 },
  { stt: 15, hoDan: "Nông Văn Đẳng",    maHo: "NB005", diaChi: "Nà Bay",    sdt: "374258744", dienTich: 1.0 },
  { stt: 16, hoDan: "Hoàng Văn Thống",  maHo: "NB006", diaChi: "Nà Bay",    sdt: "967186387", dienTich: 1.0 },
  { stt: 17, hoDan: "Nguyễn Văn Hân",   maHo: "NB007", diaChi: "Nà Bay",    sdt: "984922577", dienTich: 1.0 },
  { stt: 18, hoDan: "Nguyễn Thị Đa",    maHo: "NB008", diaChi: "Nà Bay",    sdt: "372122030", dienTich: 0.7 },
  { stt: 19, hoDan: "Triệu Văn Hánh",   maHo: "NB009", diaChi: "Nà Bay",    sdt: "345665232", dienTich: 0.8 },
  { stt: 20, hoDan: "Mạnh Văn Hồ",      maHo: "NB010", diaChi: "Nà Bay",    sdt: "349055299", dienTich: 2.0 },
  { stt: 21, hoDan: "Hoàng Thị Điềm",   maHo: "NB011", diaChi: "Nà Bay",    sdt: "375182932", dienTich: 0.4 },
  { stt: 22, hoDan: "Lâm Thị Tới",      maHo: "NB012", diaChi: "Nà Bay",    sdt: "353839713", dienTich: 0.0 },
  { stt: 23, hoDan: "Triệu Văn Cường",  maHo: "NB013", diaChi: "Nà Bay",    sdt: "",          dienTich: 0.0 },
  { stt: 24, hoDan: "Hoàng Phúc Khôi",  maHo: "BC001", diaChi: "Bản Chang", sdt: "333770931", dienTich: 0.6 },
  { stt: 25, hoDan: "Triệu Văn Dựng",   maHo: "BC002", diaChi: "Bản Chang", sdt: "343233785", dienTich: 2.0 },
  { stt: 26, hoDan: "Hoàng Văn Mỹ",     maHo: "BC003", diaChi: "Bản Chang", sdt: "",          dienTich: 0.0 },
];

const zoneColor: Record<string, string> = {
  "Nà Hồng":   "bg-emerald-100 text-emerald-700",
  "Nà Bay":    "bg-blue-100 text-blue-700",
  "Bản Chang": "bg-orange-100 text-orange-700",
};

export default function FarmersPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [sortKey, setSortKey] = useState("stt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const uniqueZones = useMemo(() => [...new Set(dsHoLKData.map((r) => r.diaChi))], []);

  const filtered = useMemo(() => {
    let data = dsHoLKData;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.hoDan.toLowerCase().includes(q) ||
        r.maHo.toLowerCase().includes(q) ||
        r.sdt.includes(q)
      );
    }
    if (zoneFilter) data = data.filter((r) => r.diaChi === zoneFilter);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [search, zoneFilter, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const totalDienTich = dsHoLKData.reduce((s, r) => s + r.dienTich, 0);
  const naHongCount = dsHoLKData.filter((r) => r.diaChi === "Nà Hồng").length;
  const naBayCount = dsHoLKData.filter((r) => r.diaChi === "Nà Bay").length;
  const banChangCount = dsHoLKData.filter((r) => r.diaChi === "Bản Chang").length;

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Danh sách Hộ liên kết</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Nông hộ thu mua chè Shan Tuyết Bằng Phúc</p>
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
              <Plus className="w-4 h-4" /> Thêm mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users,  label: "Tổng nông hộ",  value: `${dsHoLKData.length} hộ`, sub: "liên kết HTX",         color: "text-violet-600 bg-violet-50" },
          { icon: Leaf,   label: "Tổng diện tích", value: `${totalDienTich.toFixed(1)} ha`, sub: "đất chè Shan Tuyết", color: "text-emerald-600 bg-emerald-50" },
          { icon: MapPin, label: "Nà Hồng",        value: `${naHongCount} hộ`,        sub: `+ ${naBayCount} Nà Bay`,  color: "text-blue-600 bg-blue-50" },
          { icon: MapPin, label: "Bản Chang",      value: `${banChangCount} hộ`,       sub: "hộ liên kết",          color: "text-orange-600 bg-orange-50" },
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

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, mã hộ, SĐT..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả</option>
            {uniqueZones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <button onClick={() => { setSearch(""); setZoneFilter(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "stt", label: "STT" },
                  { key: "hoDan", label: "Họ và tên" },
                  { key: "maHo", label: "Mã hộ" },
                  { key: "diaChi", label: "Địa chỉ" },
                  { key: "sdt", label: "Số điện thoại" },
                  { key: "dienTich", label: "Diện tích (ha)" },
                ].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">{row.stt}</td>
                  <td className="py-2.5 px-3 font-medium">{row.hoDan}</td>
                  <td className="py-2.5 px-3 font-mono text-xs font-semibold text-primary">{row.maHo}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${zoneColor[row.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{row.diaChi}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    {row.sdt ? (
                      <span className="flex items-center gap-1 text-muted-foreground font-mono text-xs">
                        <Phone className="w-3 h-3" />{row.sdt}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {row.dienTich > 0
                      ? <span className="font-semibold">{row.dienTich.toFixed(1)} ha</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={5} className="py-2.5 px-3 font-bold text-sm">Tổng cộng ({filtered.length} hộ)</td>
                <td className="py-2.5 px-3 text-right font-bold">
                  {filtered.reduce((s, r) => s + r.dienTich, 0).toFixed(1)} ha
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
