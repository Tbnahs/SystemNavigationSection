import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Leaf, Plus, Pencil, Trash2, X, Loader2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  fetchGrades, createGrade, updateGrade, deleteGrade,
  fetchQualityLevels, createQualityLevel, updateQualityLevel, deleteQualityLevel,
  fetchStandards, createStandard, updateStandard, deleteStandard,
  fetchProducts,
  type Grade, type QualityLevel, type Standard,
} from "@/lib/api";

const COLOR_OPTIONS = [
  { key: "emerald", label: "Chè xanh",   row: "bg-emerald-50 text-emerald-800 border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { key: "rose",    label: "Hồng trà",   row: "bg-rose-50 text-rose-800 border-rose-200",          badge: "bg-rose-100 text-rose-800 border-rose-300" },
  { key: "sky",     label: "Bạch trà",   row: "bg-sky-50 text-sky-800 border-sky-200",             badge: "bg-sky-100 text-sky-800 border-sky-300" },
  { key: "amber",   label: "Chè thường", row: "bg-amber-50 text-amber-800 border-amber-200",       badge: "bg-amber-100 text-amber-800 border-amber-300" },
  { key: "violet",  label: "Đặc sản",    row: "bg-violet-50 text-violet-800 border-violet-200",    badge: "bg-violet-100 text-violet-800 border-violet-300" },
];
function colorRow(key: string)   { return COLOR_OPTIONS.find(c => c.key === key)?.row   ?? COLOR_OPTIONS[0].row; }
function colorBadge(key: string) { return COLOR_OPTIONS.find(c => c.key === key)?.badge ?? COLOR_OPTIONS[0].badge; }
function dotColor(key: string) {
  const m: Record<string, string> = { emerald: "bg-emerald-500", rose: "bg-rose-500", sky: "bg-sky-500", amber: "bg-amber-500", violet: "bg-violet-500" };
  return m[key] ?? "bg-emerald-500";
}

type PriceEntry = { label: string; value: string };

function parsePrices(s: string): PriceEntry[] {
  try { const r = JSON.parse(s); return Array.isArray(r) ? r : []; } catch { return []; }
}
function serializePrices(arr: PriceEntry[]): string {
  return JSON.stringify(arr.filter(e => e.value.trim()));
}

type GForm  = { name: string; price: string; prices: PriceEntry[]; loaiChe: string; ghiChu: string; colorKey: string };
type QLForm = { gradeId: number | null; danhGia: string; donGia: string; prices: PriceEntry[]; ghiChu: string };
type SForm  = { title: string; description: string; colorKey: string };

const EMPTY_G:  GForm  = { name: "", price: "", prices: [], loaiChe: "", ghiChu: "", colorKey: "emerald" };
const EMPTY_QL: QLForm = { gradeId: null, danhGia: "", donGia: "", prices: [], ghiChu: "" };
const EMPTY_S:  SForm  = { title: "", description: "", colorKey: "emerald" };

function PricesEditor({ prices, onChange }: { prices: PriceEntry[]; onChange: (p: PriceEntry[]) => void }) {
  function update(i: number, field: keyof PriceEntry, val: string) {
    const next = prices.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange(next);
  }
  function remove(i: number) { onChange(prices.filter((_, idx) => idx !== i)); }
  function add() { onChange([...prices, { label: "", value: "" }]); }
  return (
    <div className="space-y-2">
      {prices.map((e, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={e.label}
            onChange={ev => update(i, "label", ev.target.value)}
            placeholder="Nhãn (VD: Loại 1)"
            className="flex-1 h-9 px-2.5 rounded-lg border border-border text-[12.5px] outline-none focus:border-primary"
          />
          <input
            value={e.value}
            onChange={ev => update(i, "value", ev.target.value)}
            placeholder="Giá (VD: 27,000)"
            className="flex-1 h-9 px-2.5 rounded-lg border border-border text-[12.5px] outline-none focus:border-primary"
          />
          <button onClick={() => remove(i)} className="p-1.5 rounded hover:bg-rose-50 flex-shrink-0">
            <X className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="h-8 px-3 rounded-lg border border-dashed border-border text-[12px] font-medium text-muted-foreground hover:bg-muted flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm mức giá
      </button>
    </div>
  );
}

export default function QuyCachPage() {
  const [, navigate] = useLocation();

  const [gD, setGD] = useState(false); const [gE, setGE] = useState<Grade | null>(null); const [gF, setGF] = useState<GForm>(EMPTY_G); const [gErr, setGErr] = useState<string | null>(null); const [gDel, setGDel] = useState<Grade | null>(null);
  const [qlD, setQlD] = useState(false); const [qlE, setQlE] = useState<QualityLevel | null>(null); const [qlF, setQlF] = useState<QLForm>(EMPTY_QL); const [qlErr, setQlErr] = useState<string | null>(null); const [qlDel, setQlDel] = useState<QualityLevel | null>(null); const [gradeFilter, setGradeFilter] = useState<number | "">("");
  const [sD, setSD] = useState(false); const [sE, setSE] = useState<Standard | null>(null); const [sF, setSF] = useState<SForm>(EMPTY_S); const [sErr, setSErr] = useState<string | null>(null); const [sDel, setSDel] = useState<Standard | null>(null);

  const qc = useQueryClient();
  const gQ  = useQuery({ queryKey: ["grades"],         queryFn: fetchGrades });
  const qlQ = useQuery({ queryKey: ["quality-levels"], queryFn: fetchQualityLevels });
  const sQ  = useQuery({ queryKey: ["standards"],      queryFn: fetchStandards });
  const prodQ = useQuery({ queryKey: ["products"],     queryFn: fetchProducts });

  const gC  = useMutation({ mutationFn: (b: Omit<GForm,"prices"> & { prices: string }) => createGrade(b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["grades"] }); closeG(); }, onError: (e: Error) => setGErr(e.message) });
  const gU  = useMutation({ mutationFn: ({ id, b }: { id: number; b: Omit<GForm,"prices"> & { prices: string } }) => updateGrade(id, b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["grades"] }); closeG(); }, onError: (e: Error) => setGErr(e.message) });
  const gX  = useMutation({ mutationFn: (id: number) => deleteGrade(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["grades"] }); setGDel(null); } });
  const qlC = useMutation({ mutationFn: (b: Omit<QLForm,"prices"> & { prices: string }) => createQualityLevel(b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quality-levels"] }); closeQL(); }, onError: (e: Error) => setQlErr(e.message) });
  const qlU = useMutation({ mutationFn: ({ id, b }: { id: number; b: Omit<QLForm,"prices"> & { prices: string } }) => updateQualityLevel(id, b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quality-levels"] }); closeQL(); }, onError: (e: Error) => setQlErr(e.message) });
  const qlX = useMutation({ mutationFn: (id: number) => deleteQualityLevel(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quality-levels"] }); setQlDel(null); } });
  const sC  = useMutation({ mutationFn: (b: SForm) => createStandard(b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["standards"] }); closeS(); }, onError: (e: Error) => setSErr(e.message) });
  const sU  = useMutation({ mutationFn: ({ id, b }: { id: number; b: SForm }) => updateStandard(id, b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["standards"] }); closeS(); }, onError: (e: Error) => setSErr(e.message) });
  const sX  = useMutation({ mutationFn: (id: number) => deleteStandard(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["standards"] }); setSDel(null); } });

  function closeG()  { setGD(false);  setGE(null);  setGF(EMPTY_G);  setGErr(null);  }
  function closeQL() { setQlD(false); setQlE(null); setQlF(EMPTY_QL); setQlErr(null); }
  function closeS()  { setSD(false);  setSE(null);  setSF(EMPTY_S);  setSErr(null);  }

  const grades = gQ.data?.items ?? [];
  const qualityLevels = qlQ.data?.items ?? [];
  const standards = sQ.data?.items ?? [];
  const products = prodQ.data?.items ?? [];
  const productNames = [...new Set(products.map(p => p.name))];

  function submitGrade() {
    setGErr(null);
    if (!gF.name.trim()) { setGErr("Tên bắt buộc."); return; }
    const payload = {
      name: gF.name, loaiChe: gF.loaiChe, ghiChu: gF.ghiChu, colorKey: gF.colorKey,
      price: gF.prices[0]?.value ?? gF.price,
      prices: serializePrices(gF.prices),
    };
    if (gE) gU.mutate({ id: gE.id, b: payload });
    else gC.mutate(payload);
  }

  function submitQL() {
    setQlErr(null);
    if (!qlF.danhGia.trim()) { setQlErr("% Đánh giá bắt buộc."); return; }
    if (!qlF.donGia.trim() && qlF.prices.length === 0) { setQlErr("Vui lòng nhập ít nhất một đơn giá."); return; }
    const payload = {
      gradeId: qlF.gradeId, danhGia: qlF.danhGia,
      donGia: qlF.prices[0]?.value ?? qlF.donGia,
      prices: serializePrices(qlF.prices),
      ghiChu: qlF.ghiChu,
    };
    if (qlE) qlU.mutate({ id: qlE.id, b: payload });
    else qlC.mutate(payload);
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const gradeRows = grades.map(g => ({
      "Tên quy cách": g.name,
      "Loại chè": g.loaiChe,
      "Đơn giá (chính)": g.price,
      "Danh sách giá": parsePrices(g.prices).map(e => `${e.label}: ${e.value}`).join("; "),
      "Ghi chú": g.ghiChu,
    }));
    const wsG = XLSX.utils.json_to_sheet(gradeRows);
    wsG["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 40 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsG, "Quy Cách");

    const qlRows = qualityLevels.map(q => ({
      "% Đánh giá": q.danhGia,
      "Đơn giá (chính)": q.donGia,
      "Danh sách giá": parsePrices(q.prices).map(e => `${e.label}: ${e.value}`).join("; "),
      "Ghi chú": q.ghiChu,
      "Quy cách áp dụng": grades.find(g => g.id === q.gradeId)?.name ?? "Chung",
    }));
    const wsQ = XLSX.utils.json_to_sheet(qlRows);
    wsQ["!cols"] = [{ wch: 15 }, { wch: 18 }, { wch: 40 }, { wch: 20 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsQ, "% Chất Lượng");

    const sRows = standards.map(s => ({ "Tiêu đề": s.title, "Mô tả": s.description }));
    const wsS = XLSX.utils.json_to_sheet(sRows);
    wsS["!cols"] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsS, "Tiêu Chuẩn");
    XLSX.writeFile(wb, `quy-cach-tieu-chuan-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <AppLayout>
      <div className="space-y-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/module/erp")} className="p-2 rounded-lg hover:bg-muted">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <div className="text-[12px] text-muted-foreground">ERP / Quy cách & Tiêu chuẩn</div>
              <h1 className="text-xl font-bold mt-0.5 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-600" />Quy cách & Tiêu chuẩn</h1>
            </div>
          </div>
          <button onClick={exportExcel} className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted">
            <Download className="w-4 h-4 text-muted-foreground" /> Xuất Excel
          </button>
        </div>

        {/* ── Section 1: Quy cách ─────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold">Quy cách</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{grades.length} quy cách</p>
            </div>
            <button onClick={() => setGD(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"><Plus className="w-4 h-4" />Thêm quy cách</button>
          </div>
          {gQ.isLoading && <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>}
          {grades.length === 0 && !gQ.isLoading && <div className="py-8 text-center text-muted-foreground text-[13px] bg-white border border-border rounded-xl">Chưa có quy cách nào.</div>}
          <div className="grid gap-3">
            {grades.map(g => {
              const priceList = parsePrices(g.prices);
              return (
                <div key={g.id} className={`rounded-xl border p-4 flex items-center justify-between ${colorRow(g.colorKey)}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${dotColor(g.colorKey)}`} />
                    <div>
                      <div className="font-semibold text-[14px]">{g.name}</div>
                      <div className="text-[12px] flex items-center gap-2 mt-0.5 flex-wrap">
                        {g.loaiChe && <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${colorBadge(g.colorKey)}`}>{g.loaiChe}</span>}
                        {priceList.length > 0
                          ? priceList.map((e, i) => (
                            <span key={i} className="font-medium text-[11.5px] bg-white/60 px-2 py-0.5 rounded border border-current/20">
                              {e.label ? `${e.label}: ` : ""}{e.value}
                            </span>
                          ))
                          : g.price && <span className="font-medium">{g.price}</span>
                        }
                        {g.ghiChu && <span className="opacity-70">{g.ghiChu}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setGE(g); setGF({ name: g.name, price: g.price, prices: parsePrices(g.prices), loaiChe: g.loaiChe, ghiChu: g.ghiChu, colorKey: g.colorKey }); setGD(true); }} className="p-1.5 rounded hover:bg-black/5"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setGDel(g)} className="p-1.5 rounded hover:bg-rose-100/60"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 2: % Chất lượng ─────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold">% Chất lượng</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{qualityLevels.length} mức</p>
            </div>
            <button onClick={() => setQlD(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"><Plus className="w-4 h-4" />Thêm % chất lượng</button>
          </div>
          {qlQ.isLoading && <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>}
          {qualityLevels.length === 0 && !qlQ.isLoading && <div className="py-8 text-center text-muted-foreground text-[13px] bg-white border border-border rounded-xl">Chưa có mức chất lượng nào.</div>}
          {qualityLevels.length > 0 && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[12px] uppercase text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">% Đánh giá</th>
                  <th className="px-4 py-3">Đơn giá</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3">Quy cách</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr></thead>
                <tbody>
                  {qualityLevels.map(q => {
                    const priceList = parsePrices(q.prices);
                    return (
                      <tr key={q.id} className="border-t border-border hover:bg-emerald-50/20">
                        <td className="px-4 py-3 font-semibold">{q.danhGia}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700">
                          {priceList.length > 0
                            ? priceList.map((e, i) => <div key={i} className="text-[12px]">{e.label ? `${e.label}: ` : ""}{e.value}</div>)
                            : q.donGia || "—"
                          }
                        </td>
                        <td className="px-4 py-3 text-[13px] text-muted-foreground">{q.ghiChu || "—"}</td>
                        <td className="px-4 py-3 text-[13px] text-muted-foreground">{grades.find(g => g.id === q.gradeId)?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setQlE(q); setQlF({ gradeId: q.gradeId, danhGia: q.danhGia, donGia: q.donGia, prices: parsePrices(q.prices), ghiChu: q.ghiChu }); setQlD(true); }} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                            <button onClick={() => setQlDel(q)} className="p-1.5 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Section 3: Tiêu chuẩn ───────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold">Tiêu chuẩn</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{standards.length} tiêu chuẩn</p>
            </div>
            <button onClick={() => setSD(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"><Plus className="w-4 h-4" />Thêm tiêu chuẩn</button>
          </div>
          {sQ.isLoading && <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>}
          {standards.length === 0 && !sQ.isLoading && <div className="py-8 text-center text-muted-foreground text-[13px] bg-white border border-border rounded-xl">Chưa có tiêu chuẩn nào.</div>}
          <div className="grid gap-3">
            {standards.map(s => (
              <div key={s.id} className="bg-white border border-border rounded-xl p-4 flex items-start gap-4">
                <div className={`w-1.5 rounded-full self-stretch ${dotColor(s.colorKey)}`} />
                <div className="flex-1 min-w-0"><div className="font-semibold text-[14px]">{s.title}</div><div className="text-[13px] text-muted-foreground mt-1">{s.description}</div></div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setSE(s); setSF({ title: s.title, description: s.description, colorKey: s.colorKey }); setSD(true); }} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => setSDel(s)} className="p-1.5 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirms */}
      {gDel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-[16px] font-semibold text-center mb-2">Xóa quy cách?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa <span className="font-semibold text-foreground">{gDel.name}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setGDel(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={gX.isPending} onClick={() => gX.mutate(gDel.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">{gX.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Xóa</button>
            </div>
          </div>
        </div>
      )}
      {qlDel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-[16px] font-semibold text-center mb-2">Xóa mức chất lượng?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa <span className="font-semibold text-foreground">{qlDel.danhGia}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setQlDel(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={qlX.isPending} onClick={() => qlX.mutate(qlDel.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">{qlX.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Xóa</button>
            </div>
          </div>
        </div>
      )}
      {sDel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-[16px] font-semibold text-center mb-2">Xóa tiêu chuẩn?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa <span className="font-semibold text-foreground">{sDel.title}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setSDel(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={sX.isPending} onClick={() => sX.mutate(sDel.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">{sX.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Drawer */}
      {gD && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeG} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[17px] font-semibold">{gE ? "Sửa quy cách" : "Thêm quy cách"}</div>
              <button onClick={closeG} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Tên quy cách <span className="text-rose-500">*</span></label>
                <input value={gF.name} onChange={e => setGF(p => ({ ...p, name: e.target.value }))} placeholder="1 tôm, 1 tôm 1 lá…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Thương phẩm</label>
                <select
                  value={gF.loaiChe}
                  onChange={e => setGF(p => ({ ...p, loaiChe: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white"
                >
                  <option value="">-- Chọn thương phẩm --</option>
                  {productNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                <input value={gF.ghiChu} onChange={e => setGF(p => ({ ...p, ghiChu: e.target.value }))} placeholder="Ghi chú thêm…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              {gErr && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{gErr}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/40">
              <button onClick={closeG} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={gC.isPending || gU.isPending} onClick={submitGrade} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {(gC.isPending || gU.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}{gE ? "Lưu" : "Thêm"}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Quality Drawer */}
      {qlD && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeQL} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[17px] font-semibold">{qlE ? "Sửa % chất lượng" : "Thêm % chất lượng"}</div>
              <button onClick={closeQL} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">% Đánh giá <span className="text-rose-500">*</span></label>
                <input value={qlF.danhGia} onChange={e => setQlF(p => ({ ...p, danhGia: e.target.value }))} placeholder="70 – 79%, 100%…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                <input value={qlF.ghiChu} onChange={e => setQlF(p => ({ ...p, ghiChu: e.target.value }))} placeholder="Ghi chú chất lượng…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Quy cách áp dụng</label>
                <select value={qlF.gradeId ?? ""} onChange={e => setQlF(p => ({ ...p, gradeId: e.target.value ? Number(e.target.value) : null }))} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">
                  <option value="">-- Áp dụng chung --</option>
                  {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Danh sách đơn giá <span className="text-rose-500">*</span></label>
                <PricesEditor prices={qlF.prices} onChange={p => setQlF(f => ({ ...f, prices: p }))} />
              </div>
              {qlErr && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{qlErr}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/40">
              <button onClick={closeQL} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={qlC.isPending || qlU.isPending} onClick={submitQL} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {(qlC.isPending || qlU.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}{qlE ? "Lưu" : "Thêm"}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Standard Drawer */}
      {sD && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeS} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[17px] font-semibold">{sE ? "Sửa tiêu chuẩn" : "Thêm tiêu chuẩn"}</div>
              <button onClick={closeS} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div><label className="block text-[13px] font-medium mb-1.5">Tiêu đề <span className="text-rose-500">*</span></label><input value={sF.title} onChange={e => setSF(p => ({ ...p, title: e.target.value }))} placeholder="VietGAP, OCOP…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Mô tả</label><textarea value={sF.description} onChange={e => setSF(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Mô tả tiêu chuẩn…" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" /></div>
              <div>
                <label className="block text-[13px] font-medium mb-2">Màu hiển thị</label>
                <div className="flex flex-wrap gap-2">{COLOR_OPTIONS.map(c => <button key={c.key} onClick={() => setSF(p => ({ ...p, colorKey: c.key }))} className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium ${colorRow(c.key)} ${sF.colorKey === c.key ? "ring-2 ring-offset-1 ring-primary" : ""}`}>{c.label}</button>)}</div>
              </div>
              {sErr && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{sErr}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/40">
              <button onClick={closeS} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={sC.isPending || sU.isPending} onClick={() => { setSErr(null); if (!sF.title.trim()) { setSErr("Tiêu đề bắt buộc."); return; } sE ? sU.mutate({ id: sE.id, b: sF }) : sC.mutate(sF); }} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">{(sC.isPending || sU.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}{sE ? "Lưu" : "Thêm"}</button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
