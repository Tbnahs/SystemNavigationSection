import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Leaf, Plus, Pencil, Trash2, X, FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";

interface QuyCachRow {
  id: number;
  quyCach: string;
  donGia: string;
  loaiChe: string;
  ghiChu: string;
  color: string;
  badge: string;
}

interface QualityRow {
  id: number;
  danhGia: string;
  donGia: string;
  xepLoai: string;
}

interface TieuChuan {
  id: number;
  title: string;
  desc: string;
  color: string;
}

const COLOR_OPTIONS = [
  { label: "Chè xanh",   color: "bg-emerald-50 text-emerald-800 border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { label: "Hồng trà",   color: "bg-rose-50 text-rose-800 border-rose-200",           badge: "bg-rose-100 text-rose-800 border-rose-300" },
  { label: "Bạch trà",   color: "bg-sky-50 text-sky-800 border-sky-200",              badge: "bg-sky-100 text-sky-800 border-sky-300" },
  { label: "Chè thường", color: "bg-amber-50 text-amber-800 border-amber-200",        badge: "bg-amber-100 text-amber-800 border-amber-300" },
  { label: "Đặc sản",    color: "bg-violet-50 text-violet-800 border-violet-200",     badge: "bg-violet-100 text-violet-800 border-violet-300" },
];

const INIT_QUY_CACH: QuyCachRow[] = [
  { id: 1, quyCach: "1 tôm",       donGia: "27,000 – 30,000 đ/kg", loaiChe: "Chè xanh",   ghiChu: "Tính theo % chất lượng", color: "bg-emerald-50 text-emerald-800 border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { id: 2, quyCach: "1 tôm 1 lá",  donGia: "50,000 đ/kg",          loaiChe: "Hồng trà",   ghiChu: "Giá cố định",            color: "bg-rose-50 text-rose-800 border-rose-200",           badge: "bg-rose-100 text-rose-800 border-rose-300" },
  { id: 3, quyCach: "1 tôm 2 lá",  donGia: "27,000 – 30,000 đ/kg", loaiChe: "Bạch trà",   ghiChu: "Tính theo % chất lượng", color: "bg-sky-50 text-sky-800 border-sky-200",              badge: "bg-sky-100 text-sky-800 border-sky-300" },
  { id: 4, quyCach: "2 lá",        donGia: "27,000 đ/kg",           loaiChe: "Chè thường", ghiChu: "Giá cố định",            color: "bg-amber-50 text-amber-800 border-amber-200",        badge: "bg-amber-100 text-amber-800 border-amber-300" },
  { id: 5, quyCach: "Cây di sản",  donGia: "40,000 – 60,000 đ/kg", loaiChe: "Đặc sản",    ghiChu: "Giá cố định",            color: "bg-violet-50 text-violet-800 border-violet-200",     badge: "bg-violet-100 text-violet-800 border-violet-300" },
];

const INIT_QUALITY: QualityRow[] = [
  { id: 1, danhGia: "70 – 79%",    donGia: "27,000 đ/kg",           xepLoai: "Đạt cơ bản" },
  { id: 2, danhGia: "80 – 89%",    donGia: "28,000 đ/kg",           xepLoai: "Khá" },
  { id: 3, danhGia: "90 – 99%",    donGia: "29,000 đ/kg",           xepLoai: "Tốt" },
  { id: 4, danhGia: "100%",        donGia: "30,000 đ/kg",           xepLoai: "Xuất sắc" },
  { id: 5, danhGia: "Cây di sản",  donGia: "40,000 – 60,000 đ/kg", xepLoai: "Di sản / Đặc sản" },
];

const INIT_TIEU_CHUAN: TieuChuan[] = [
  { id: 1, title: "Độ non, già của búp chè",       desc: "Búp phải non, đúng quy cách được chỉ định. Không hái già, không lẫn búp đen. Búp 1 tôm: chỉ lấy đỉnh búp cuộn. 1 tôm 2 lá: 2 lá non đầu tiên.", color: "bg-emerald-500" },
  { id: 2, title: "Độ đồng đều khi thu hái",        desc: "Búp chè đồng đều về kích cỡ và độ trưởng thành. Không lẫn quy cách khác. Tỷ lệ lẫn không được vượt quá 3% theo khối lượng.",               color: "bg-blue-500" },
  { id: 3, title: "Độ chuẩn chỉ khi thu hái",       desc: "Thu hái đúng kỹ thuật: ngắt sát cuống, không dập nát, không để bị oxy hoá trước khi giao. Vận chuyển trong giỏ thoáng, không nén chặt.",      color: "bg-amber-500" },
];

let _idQC = 100;
let _idQL = 200;
let _idTC = 300;
const nextId = (counter: { v: number }) => ++counter.v;
const cQC = { v: _idQC };
const cQL = { v: _idQL };
const cTC = { v: _idTC };

type ModalMode = "add" | "edit";

function emptyQC(): Omit<QuyCachRow, "id"> {
  return { quyCach: "", donGia: "", loaiChe: "Chè xanh", ghiChu: "", color: COLOR_OPTIONS[0].color, badge: COLOR_OPTIONS[0].badge };
}
function emptyQL(): Omit<QualityRow, "id"> {
  return { danhGia: "", donGia: "", xepLoai: "" };
}
function emptyTC(): Omit<TieuChuan, "id"> {
  return { title: "", desc: "", color: "bg-emerald-500" };
}

export default function QuyCachPage() {
  const [, setLocation] = useLocation();

  const [quyCache, setQuyCach] = useState<QuyCachRow[]>(INIT_QUY_CACH);
  const [quality, setQuality] = useState<QualityRow[]>(INIT_QUALITY);
  const [tieuChuan, setTieuChuan] = useState<TieuChuan[]>(INIT_TIEU_CHUAN);

  const [qcModal, setQcModal] = useState<{ mode: ModalMode; row: Omit<QuyCachRow, "id"> & { id?: number } } | null>(null);
  const [qlModal, setQlModal] = useState<{ mode: ModalMode; row: Omit<QualityRow, "id"> & { id?: number } } | null>(null);
  const [tcModal, setTcModal] = useState<{ mode: ModalMode; row: Omit<TieuChuan, "id"> & { id?: number } } | null>(null);

  const saveQC = () => {
    if (!qcModal) return;
    const { mode, row } = qcModal;
    const colorOpt = COLOR_OPTIONS.find((o) => o.label === row.loaiChe) ?? COLOR_OPTIONS[0];
    const full = { ...row, color: colorOpt.color, badge: colorOpt.badge };
    if (mode === "add") {
      setQuyCach((prev) => [...prev, { ...full, id: nextId(cQC) }]);
    } else {
      setQuyCach((prev) => prev.map((r) => (r.id === row.id ? { ...full, id: r.id } : r)));
    }
    setQcModal(null);
  };

  const deleteQC = (id: number) => {
    if (!window.confirm("Xóa dòng này?")) return;
    setQuyCach((prev) => prev.filter((r) => r.id !== id));
  };

  const saveQL = () => {
    if (!qlModal) return;
    const { mode, row } = qlModal;
    if (mode === "add") {
      setQuality((prev) => [...prev, { ...row, id: nextId(cQL) }]);
    } else {
      setQuality((prev) => prev.map((r) => (r.id === row.id ? { ...row, id: r.id } : r)));
    }
    setQlModal(null);
  };

  const deleteQL = (id: number) => {
    if (!window.confirm("Xóa dòng này?")) return;
    setQuality((prev) => prev.filter((r) => r.id !== id));
  };

  const saveTC = () => {
    if (!tcModal) return;
    const { mode, row } = tcModal;
    if (mode === "add") {
      setTieuChuan((prev) => [...prev, { ...row, id: nextId(cTC) }]);
    } else {
      setTieuChuan((prev) => prev.map((r) => (r.id === row.id ? { ...row, id: r.id } : r)));
    }
    setTcModal(null);
  };

  const deleteTC = (id: number) => {
    if (!window.confirm("Xóa tiêu chuẩn này?")) return;
    setTieuChuan((prev) => prev.filter((r) => r.id !== id));
  };

  const exportQCExcel = () => {
    exportToExcel(
      [
        { header: "STT", key: "stt", width: 6 },
        { header: "Quy cách", key: "quyCach", width: 18 },
        { header: "Đơn giá", key: "donGia", width: 22 },
        { header: "Loại chè", key: "loaiChe", width: 16 },
        { header: "Ghi chú", key: "ghiChu", width: 24 },
      ],
      quyCache.map((r, i) => ({ stt: i + 1, quyCach: r.quyCach, donGia: r.donGia, loaiChe: r.loaiChe, ghiChu: r.ghiChu })),
      "BangQuyCach_DonGia"
    );
  };

  const exportQCPDF = () => {
    exportToPDF(
      "Bảng Quy Cách Thu Hái & Đơn Giá",
      "HTX Hồng Hà · Chè Shan Tuyết Bằng Phúc · Vụ thu hái 2026",
      [
        { header: "STT", key: "stt", width: 8 },
        { header: "Quy cách", key: "quyCach", width: 30 },
        { header: "Đơn giá", key: "donGia", width: 40 },
        { header: "Loại chè", key: "loaiChe", width: 25 },
        { header: "Ghi chú", key: "ghiChu", width: 40 },
      ],
      quyCache.map((r, i) => ({ stt: i + 1, quyCach: r.quyCach, donGia: r.donGia, loaiChe: r.loaiChe, ghiChu: r.ghiChu })),
      "BangQuyCach_DonGia"
    );
  };

  const exportQLExcel = () => {
    exportToExcel(
      [
        { header: "STT", key: "stt", width: 6 },
        { header: "Đánh giá %", key: "danhGia", width: 16 },
        { header: "Đơn giá", key: "donGia", width: 24 },
        { header: "Xếp loại", key: "xepLoai", width: 22 },
      ],
      quality.map((r, i) => ({ stt: i + 1, danhGia: r.danhGia, donGia: r.donGia, xepLoai: r.xepLoai })),
      "BangDonGia_PhanTram"
    );
  };

  const exportQLPDF = () => {
    exportToPDF(
      "Bảng Đơn Giá Theo % Chất Lượng",
      "HTX Hồng Hà · Áp dụng cho: 1 tôm (Chè xanh) và 1 tôm 2 lá (Bạch trà)",
      [
        { header: "STT", key: "stt", width: 8 },
        { header: "Đánh giá %", key: "danhGia", width: 25 },
        { header: "Đơn giá", key: "donGia", width: 40 },
        { header: "Xếp loại", key: "xepLoai", width: 35 },
      ],
      quality.map((r, i) => ({ stt: i + 1, danhGia: r.danhGia, donGia: r.donGia, xepLoai: r.xepLoai })),
      "BangDonGia_PhanTram"
    );
  };

  const TC_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-rose-500"];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Quy cách & Tiêu chuẩn</h1>
            <p className="text-sm text-muted-foreground">Bảng quy cách thu hái và đơn giá thu mua chè Shan Tuyết Bằng Phúc — HTX Hồng Hà</p>
          </div>
        </div>

        {/* ── Bảng 1: Quy cách & đơn giá ── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Bảng quy cách thu hái & đơn giá</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Ban hành theo quy định thu mua — áp dụng cho vụ thu hái 2026</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={exportQCExcel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={exportQCPDF} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={() => setQcModal({ mode: "add", row: emptyQC() })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-10">STT</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Quy cách</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đơn giá</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Loại chè</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ghi chú</th>
                  <th className="w-20 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quyCache.map((row, i) => (
                  <tr key={row.id} className={`hover:bg-muted/10 transition-colors border-l-2 ${row.color}`}>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-base">{row.quyCach}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{row.donGia}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-lg font-semibold border ${row.badge}`}>{row.loaiChe}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.ghiChu}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setQcModal({ mode: "edit", row: { ...row } })} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteQC(row.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/20 border-t-2 border-border">
                  <td colSpan={2} className="px-4 py-2.5 text-xs font-bold text-muted-foreground">Tổng cộng</td>
                  <td colSpan={4} className="px-4 py-2.5 text-xs text-muted-foreground">{quyCache.length} quy cách</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Bảng 2: Đơn giá theo % ── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Bảng đơn giá theo % chất lượng</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Áp dụng cho: <strong>1 tôm</strong> (Chè xanh) và <strong>1 tôm 2 lá</strong> (Bạch trà)</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={exportQLExcel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={exportQLPDF} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={() => setQlModal({ mode: "add", row: emptyQL() })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-10">STT</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đánh giá %</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đơn giá</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Xếp loại</th>
                  <th className="w-20 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quality.map((row, i) => (
                  <tr key={row.id} className={`hover:bg-muted/10 transition-colors ${i === quality.length - 1 ? "bg-violet-50/50" : ""}`}>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className={`px-4 py-3 font-semibold ${i === quality.length - 1 ? "text-violet-800" : ""}`}>{row.danhGia}</td>
                    <td className={`px-4 py-3 text-right font-bold ${i === quality.length - 1 ? "text-violet-700" : "text-emerald-700"}`}>{row.donGia}</td>
                    <td className={`px-4 py-3 text-xs ${i === quality.length - 1 ? "text-violet-600 font-medium" : "text-muted-foreground"}`}>{row.xepLoai}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setQlModal({ mode: "edit", row: { ...row } })} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteQL(row.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Tiêu chuẩn ── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Tiêu chuẩn đánh giá tỉ lệ đạt chất lượng khi thu hái</h2>
            <button onClick={() => setTcModal({ mode: "add", row: emptyTC() })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
          <div className="divide-y divide-border/60">
            {tieuChuan.map((item, i) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/10 transition-colors group">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className="text-white text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">* {item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setTcModal({ mode: "edit", row: { ...item } })} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteTC(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal: Quy cách ── */}
      {qcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQcModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-sm">{qcModal.mode === "add" ? "Thêm quy cách" : "Sửa quy cách"}</span>
              <button onClick={() => setQcModal(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Quy cách <span className="text-red-500">*</span></label>
                <input value={qcModal.row.quyCach} onChange={e => setQcModal(m => m && ({ ...m, row: { ...m.row, quyCach: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: 1 tôm 1 lá" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Đơn giá <span className="text-red-500">*</span></label>
                <input value={qcModal.row.donGia} onChange={e => setQcModal(m => m && ({ ...m, row: { ...m.row, donGia: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: 27,000 – 30,000 đ/kg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Loại chè</label>
                <select value={qcModal.row.loaiChe} onChange={e => setQcModal(m => m && ({ ...m, row: { ...m.row, loaiChe: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
                  {COLOR_OPTIONS.map(o => <option key={o.label} value={o.label}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Ghi chú</label>
                <input value={qcModal.row.ghiChu} onChange={e => setQcModal(m => m && ({ ...m, row: { ...m.row, ghiChu: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: Giá cố định" />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setQcModal(null)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={saveQC} disabled={!qcModal.row.quyCach || !qcModal.row.donGia}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40">
                {qcModal.mode === "add" ? "Thêm" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Chất lượng ── */}
      {qlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQlModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-sm">{qlModal.mode === "add" ? "Thêm đơn giá %" : "Sửa đơn giá %"}</span>
              <button onClick={() => setQlModal(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Đánh giá % <span className="text-red-500">*</span></label>
                <input value={qlModal.row.danhGia} onChange={e => setQlModal(m => m && ({ ...m, row: { ...m.row, danhGia: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: 80 – 89%" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Đơn giá <span className="text-red-500">*</span></label>
                <input value={qlModal.row.donGia} onChange={e => setQlModal(m => m && ({ ...m, row: { ...m.row, donGia: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: 28,000 đ/kg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Xếp loại</label>
                <input value={qlModal.row.xepLoai} onChange={e => setQlModal(m => m && ({ ...m, row: { ...m.row, xepLoai: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: Khá" />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setQlModal(null)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={saveQL} disabled={!qlModal.row.danhGia || !qlModal.row.donGia}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40">
                {qlModal.mode === "add" ? "Thêm" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Tiêu chuẩn ── */}
      {tcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTcModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-sm">{tcModal.mode === "add" ? "Thêm tiêu chuẩn" : "Sửa tiêu chuẩn"}</span>
              <button onClick={() => setTcModal(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                <input value={tcModal.row.title} onChange={e => setTcModal(m => m && ({ ...m, row: { ...m.row, title: e.target.value } }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Mô tả</label>
                <textarea value={tcModal.row.desc} onChange={e => setTcModal(m => m && ({ ...m, row: { ...m.row, desc: e.target.value } }))}
                  rows={3} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Màu</label>
                <div className="flex items-center gap-2">
                  {TC_COLORS.map(c => (
                    <button key={c} onClick={() => setTcModal(m => m && ({ ...m, row: { ...m.row, color: c } }))}
                      className={`w-7 h-7 rounded-lg ${c} ${tcModal.row.color === c ? "ring-2 ring-offset-1 ring-primary" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setTcModal(null)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50">Hủy</button>
              <button onClick={saveTC} disabled={!tcModal.row.title}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40">
                {tcModal.mode === "add" ? "Thêm" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
