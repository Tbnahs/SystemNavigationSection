import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Plus, Filter, Download,
  ChevronUp, ChevronDown, Factory, Package,
  Leaf, FlaskConical, X, FileSpreadsheet, FileText, Printer,
} from "lucide-react";

const productColor: Record<string, string> = {
  "Hồng trà":  "bg-rose-100 text-rose-700",
  "Bạch trà":  "bg-sky-100 text-sky-700",
  "Chè xanh":  "bg-emerald-100 text-emerald-700",
};

const sanXuatData = [
  { stt: 1,  maME: "NH0043003", nguoiThucHien: "HTX Hồng Hà", thoiGian: "30/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L013003" },
  { stt: 1,  maME: "NB0023003", nguoiThucHien: "HTX Hồng Hà", thoiGian: "30/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L013003" },
  { stt: 2,  maME: "NH0013103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L023103" },
  { stt: 2,  maME: "NH0023103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L023103" },
  { stt: 2,  maME: "NH0083103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L023103" },
  { stt: 3,  maME: "NH0093103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L033103" },
  { stt: 3,  maME: "NH0043103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L033103" },
  { stt: 4,  maME: "NH0063103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L043103" },
  { stt: 4,  maME: "NH0083103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L043103" },
  { stt: 5,  maME: "NH0073103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L053103" },
  { stt: 6,  maME: "NB0093103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L063103" },
  { stt: 6,  maME: "NB0103103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L063103" },
  { stt: 7,  maME: "NB0103103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 7,  maME: "NB0013103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 7,  maME: "NB0023103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 7,  maME: "NB0073103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 8,  maME: "NH0103103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà",  maLoSX: "L083103" },
  { stt: 9,  maME: "NH001104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L09104" },
  { stt: 9,  maME: "NH004104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L09104" },
  { stt: 10, maME: "NB011104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L010104" },
  { stt: 10, maME: "NB012104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L010104" },
  { stt: 10, maME: "NB010104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L010104" },
  { stt: 11, maME: "NB013104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L011104" },
  { stt: 11, maME: "NB002104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L011104" },
  { stt: 12, maME: "NB004104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L012104" },
  { stt: 12, maME: "NB001104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L012104" },
  { stt: 13, maME: "NB006104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L013104" },
  { stt: 14, maME: "NH007104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L014104" },
  { stt: 14, maME: "NH003104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L014104" },
  { stt: 14, maME: "NH010104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L014104" },
  { stt: 15, maME: "BC003104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L015104" },
  { stt: 16, maME: "NH006104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L016104" },
  { stt: 16, maME: "NH008104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L016104" },
  { stt: 17, maME: "NB009104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L017104" },
  { stt: 18, maME: "NH009104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L018104" },
  { stt: 18, maME: "NH002104",  nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L018104" },
];

export default function ProductionPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("stt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showCreate, setShowCreate] = useState(false);

  const uniqueProducts = useMemo(() => [...new Set(sanXuatData.map((r) => r.thanhPham))], []);

  const parseDateVN = (s: string) => { const [d, m, y] = s.split("/"); return `${y}-${m}-${d}`; };

  const filtered = useMemo(() => {
    let data = sanXuatData;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.maME.toLowerCase().includes(q) ||
        r.maLoSX.toLowerCase().includes(q) ||
        r.thanhPham.toLowerCase().includes(q)
      );
    }
    if (productFilter) data = data.filter((r) => r.thanhPham === productFilter);
    if (dateFrom) data = data.filter((r) => parseDateVN(r.thoiGian) >= dateFrom);
    if (dateTo) data = data.filter((r) => parseDateVN(r.thoiGian) <= dateTo);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [search, productFilter, dateFrom, dateTo, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const totalLo = new Set(sanXuatData.map((r) => r.maLoSX)).size;
  const totalMe = sanXuatData.length;
  const hongTraCount = sanXuatData.filter((r) => r.thanhPham === "Hồng trà").length;
  const bachTraCount = sanXuatData.filter((r) => r.thanhPham === "Bạch trà").length;
  const cheXanhCount = sanXuatData.filter((r) => r.thanhPham === "Chè xanh").length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => setLocation("/module/erp")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Sản xuất</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Mẻ chế biến & Lô sản xuất</p>
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
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" /> Thêm phiếu
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Factory,       label: "Tổng mẻ",   value: `${totalMe} mẻ`,     sub: "đã chế biến",   color: "text-violet-600 bg-violet-50" },
          { icon: Package,       label: "Lô sản xuất", value: `${totalLo} lô`,   sub: "đã tạo",        color: "text-blue-600 bg-blue-50" },
          { icon: FlaskConical,  label: "Hồng trà",  value: `${hongTraCount} mẻ`, sub: `+ ${bachTraCount} Bạch trà`, color: "text-rose-600 bg-rose-50" },
          { icon: Leaf,          label: "Chè xanh",  value: `${cheXanhCount} mẻ`, sub: "mẻ chế biến",  color: "text-emerald-600 bg-emerald-50" },
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

      {/* Table card */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã mẻ, lô SX, thành phẩm..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Tất cả</option>
            {uniqueProducts.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <span className="text-muted-foreground text-sm">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <button
            onClick={() => { setSearch(""); setProductFilter(""); setDateFrom(""); setDateTo(""); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "stt",           label: "STT" },
                  { key: "maME",          label: "Mã mẻ" },
                  { key: "nguoiThucHien", label: "Người thực hiện" },
                  { key: "thoiGian",      label: "Thời gian" },
                  { key: "diaDiem",       label: "Địa điểm" },
                  { key: "thanhPham",     label: "Thành phẩm" },
                  { key: "maLoSX",        label: "Mã lô SX" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left py-2.5 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">{row.stt}</td>
                  <td className="py-2.5 px-3 font-mono text-xs font-semibold text-primary">{row.maME}</td>
                  <td className="py-2.5 px-3">{row.nguoiThucHien}</td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{row.thoiGian}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{row.diaDiem}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.thanhPham] ?? "bg-gray-100 text-gray-600"}`}>
                      {row.thanhPham}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{row.maLoSX}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Không có bản ghi nào phù hợp</div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Hiển thị {filtered.length} / {sanXuatData.length} bản ghi</p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Thêm phiếu sản xuất</span>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Mã mẻ <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Ví dụ: NH001104" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Thời gian <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Thành phẩm <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Chọn loại</option>
                    <option>Chè xanh</option>
                    <option>Hồng trà</option>
                    <option>Bạch trà</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Mã lô SX <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Ví dụ: L09104" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Người thực hiện</label>
                <input type="text" defaultValue="HTX Hồng Hà" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Địa điểm</label>
                <input type="text" defaultValue="HTX Hồng Hà" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50">Hủy</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Lưu phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
