import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Leaf, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import {
  fetchGrades, createGrade, updateGrade, deleteGrade,
  fetchQualityLevels, createQualityLevel, updateQualityLevel, deleteQualityLevel,
  fetchStandards, createStandard, updateStandard, deleteStandard,
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

const XEP_LOAI_OPTIONS = ["Đạt cơ bản", "Khá", "Tốt", "Xuất sắc", "Di sản / Đặc sản"];

type GForm  = { name: string; price: string; loaiChe: string; ghiChu: string; colorKey: string };
type QLForm = { gradeId: number | null; danhGia: string; donGia: string; xepLoai: string };
type SForm  = { title: string; description: string; colorKey: string };
const EMPTY_G:  GForm  = { name: "", price: "", loaiChe: "Chè xanh", ghiChu: "", colorKey: "emerald" };
const EMPTY_QL: QLForm = { gradeId: null, danhGia: "", donGia: "", xepLoai: "Đạt cơ bản" };
const EMPTY_S:  SForm  = { title: "", description: "", colorKey: "emerald" };
type Tab = "grade" | "quality" | "standard";

export default function QuyCachPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("grade");

  const [gD, setGD] = useState(false); const [gE, setGE] = useState<Grade | null>(null); const [gF, setGF] = useState<GForm>(EMPTY_G); const [gErr, setGErr] = useState<string | null>(null); const [gDel, setGDel] = useState<Grade | null>(null);
  const [qlD, setQlD] = useState(false); const [qlE, setQlE] = useState<QualityLevel | null>(null); const [qlF, setQlF] = useState<QLForm>(EMPTY_QL); const [qlErr, setQlErr] = useState<string | null>(null); const [qlDel, setQlDel] = useState<QualityLevel | null>(null);
  const [sD, setSD] = useState(false); const [sE, setSE] = useState<Standard | null>(null); const [sF, setSF] = useState<SForm>(EMPTY_S); const [sErr, setSErr] = useState<string | null>(null); const [sDel, setSDel] = useState<Standard | null>(null);

  const qc = useQueryClient();
  const gQ  = useQuery({ queryKey: ["grades"],         queryFn: fetchGrades });
  const qlQ = useQuery({ queryKey: ["quality-levels"], queryFn: fetchQualityLevels });
  const sQ  = useQuery({ queryKey: ["standards"],      queryFn: fetchStandards });

  const gC  = useMutation({ mutationFn: (b: GForm)  => createGrade(b),      onSuccess: () => { qc.invalidateQueries({ queryKey: ["grades"] });         closeG();  }, onError: (e: Error) => setGErr(e.message)  });
  const gU  = useMutation({ mutationFn: ({ id, b }: { id: number; b: GForm  }) => updateGrade(id, b),        onSuccess: () => { qc.invalidateQueries({ queryKey: ["grades"] });         closeG();  }, onError: (e: Error) => setGErr(e.message)  });
  const gX  = useMutation({ mutationFn: (id: number) => deleteGrade(id),    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grades"] });         setGDel(null); } });
  const qlC = useMutation({ mutationFn: (b: QLForm) => createQualityLevel(b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quality-levels"] }); closeQL(); }, onError: (e: Error) => setQlErr(e.message) });
  const qlU = useMutation({ mutationFn: ({ id, b }: { id: number; b: QLForm }) => updateQualityLevel(id, b), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quality-levels"] }); closeQL(); }, onError: (e: Error) => setQlErr(e.message) });
  const qlX = useMutation({ mutationFn: (id: number) => deleteQualityLevel(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quality-levels"] }); setQlDel(null); } });
  const sC  = useMutation({ mutationFn: (b: SForm)  => createStandard(b),   onSuccess: () => { qc.invalidateQueries({ queryKey: ["standards"] });      closeS();  }, onError: (e: Error) => setSErr(e.message)  });
  const sU  = useMutation({ mutationFn: ({ id, b }: { id: number; b: SForm  }) => updateStandard(id, b),     onSuccess: () => { qc.invalidateQueries({ queryKey: ["standards"] });      closeS();  }, onError: (e: Error) => setSErr(e.message)  });
  const sX  = useMutation({ mutationFn: (id: number) => deleteStandard(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["standards"] });      setSDel(null); } });

  function closeG()  { setGD(false);  setGE(null);  setGF(EMPTY_G);  setGErr(null);  }
  function closeQL() { setQlD(false); setQlE(null); setQlF(EMPTY_QL); setQlErr(null); }
  function closeS()  { setSD(false);  setSE(null);  setSF(EMPTY_S);  setSErr(null);  }

  const grades = gQ.data?.items ?? [];
  const qualityLevels = qlQ.data?.items ?? [];
  const standards = sQ.data?.items ?? [];

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "grade",    label: "Quy cách",     count: grades.length },
    { key: "quality",  label: "% Chất lượng", count: qualityLevels.length },
    { key: "standard", label: "Tiêu chuẩn",   count: standards.length },
  ];

  const xClrMap: Record<string, string> = {
    "Đạt cơ bản": "bg-slate-50 text-slate-700 ring-slate-300",
    "Khá": "bg-blue-50 text-blue-700 ring-blue-200",
    "Tốt": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Xuất sắc": "bg-violet-50 text-violet-700 ring-violet-200",
    "Di sản / Đặc sản": "bg-amber-50 text-amber-700 ring-amber-200",
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/module/erp")} className="p-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <div className="text-[12px] text-muted-foreground">ERP / Quy cách & Tiêu chuẩn</div>
            <h1 className="text-xl font-bold mt-0.5 flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-600" />Quy cách & Tiêu chuẩn</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 transition-colors flex items-center gap-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Grade tab */}
        {tab === "grade" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setGD(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"><Plus className="w-4 h-4" />Thêm quy cách</button>
            </div>
            {gQ.isLoading && <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>}
            {grades.length === 0 && !gQ.isLoading && <div className="py-10 text-center text-muted-foreground text-[13px]">Chưa có quy cách nào.</div>}
            <div className="grid gap-3">
              {grades.map(g => (
                <div key={g.id} className={`rounded-xl border p-4 flex items-center justify-between ${colorRow(g.colorKey)}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${dotColor(g.colorKey)}`} />
                    <div>
                      <div className="font-semibold text-[14px]">{g.name}</div>
                      <div className="text-[12px] flex items-center gap-3 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${colorBadge(g.colorKey)}`}>{g.loaiChe}</span>
                        <span className="font-medium">{g.price || "—"}</span>
                        {g.ghiChu && <span className="opacity-70">{g.ghiChu}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setGE(g); setGF({ name: g.name, price: g.price, loaiChe: g.loaiChe, ghiChu: g.ghiChu, colorKey: g.colorKey }); setGD(true); }} className="p-1.5 rounded hover:bg-black/5"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setGDel(g)} className="p-1.5 rounded hover:bg-rose-100/60"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality tab */}
        {tab === "quality" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setQlD(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"><Plus className="w-4 h-4" />Thêm % chất lượng</button>
            </div>
            {qlQ.isLoading && <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>}
            {qualityLevels.length === 0 && !qlQ.isLoading && <div className="py-10 text-center text-muted-foreground text-[13px]">Chưa có mức chất lượng nào.</div>}
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[12px] uppercase text-muted-foreground bg-muted/40"><th className="px-4 py-3">% Đánh giá</th><th className="px-4 py-3">Đơn giá</th><th className="px-4 py-3">Xếp loại</th><th className="px-4 py-3">Quy cách</th><th className="px-4 py-3 w-20"></th></tr></thead>
                <tbody>
                  {qualityLevels.map(q => (
                    <tr key={q.id} className="border-t border-border hover:bg-emerald-50/20">
                      <td className="px-4 py-3 font-semibold">{q.danhGia}</td>
                      <td className="px-4 py-3 font-medium text-emerald-700">{q.donGia}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${xClrMap[q.xepLoai] ?? xClrMap["Đạt cơ bản"]}`}>{q.xepLoai}</span></td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{grades.find(g => g.id === q.gradeId)?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setQlE(q); setQlF({ gradeId: q.gradeId, danhGia: q.danhGia, donGia: q.donGia, xepLoai: q.xepLoai }); setQlD(true); }} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => setQlDel(q)} className="p-1.5 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Standard tab */}
        {tab === "standard" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setSD(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"><Plus className="w-4 h-4" />Thêm tiêu chuẩn</button>
            </div>
            {sQ.isLoading && <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>}
            {standards.length === 0 && !sQ.isLoading && <div className="py-10 text-center text-muted-foreground text-[13px]">Chưa có tiêu chuẩn nào.</div>}
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
        )}
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
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between"><div className="text-[17px] font-semibold">{gE ? "Sửa quy cách" : "Thêm quy cách"}</div><button onClick={closeG} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button></div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div><label className="block text-[13px] font-medium mb-1.5">Tên quy cách <span className="text-rose-500">*</span></label><input value={gF.name} onChange={e => setGF(p => ({ ...p, name: e.target.value }))} placeholder="1 tôm, 1 tôm 1 lá…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Loại chè</label><input value={gF.loaiChe} onChange={e => setGF(p => ({ ...p, loaiChe: e.target.value }))} placeholder="Chè xanh, Hồng trà…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Đơn giá tham khảo</label><input value={gF.price} onChange={e => setGF(p => ({ ...p, price: e.target.value }))} placeholder="27,000 – 30,000 đ/kg" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Ghi chú</label><input value={gF.ghiChu} onChange={e => setGF(p => ({ ...p, ghiChu: e.target.value }))} placeholder="Tính theo % chất lượng…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div>
                <label className="block text-[13px] font-medium mb-2">Màu hiển thị</label>
                <div className="flex flex-wrap gap-2">{COLOR_OPTIONS.map(c => <button key={c.key} onClick={() => setGF(p => ({ ...p, colorKey: c.key }))} className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium ${colorRow(c.key)} ${gF.colorKey === c.key ? "ring-2 ring-offset-1 ring-primary" : ""}`}>{c.label}</button>)}</div>
              </div>
              {gErr && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{gErr}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/40">
              <button onClick={closeG} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={gC.isPending || gU.isPending} onClick={() => { setGErr(null); if (!gF.name.trim()) { setGErr("Tên bắt buộc."); return; } gE ? gU.mutate({ id: gE.id, b: gF }) : gC.mutate(gF); }} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">{(gC.isPending || gU.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}{gE ? "Lưu" : "Thêm"}</button>
            </div>
          </aside>
        </>
      )}

      {/* Quality Drawer */}
      {qlD && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeQL} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between"><div className="text-[17px] font-semibold">{qlE ? "Sửa % chất lượng" : "Thêm % chất lượng"}</div><button onClick={closeQL} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button></div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div><label className="block text-[13px] font-medium mb-1.5">% Đánh giá <span className="text-rose-500">*</span></label><input value={qlF.danhGia} onChange={e => setQlF(p => ({ ...p, danhGia: e.target.value }))} placeholder="70 – 79%, 100%…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Đơn giá <span className="text-rose-500">*</span></label><input value={qlF.donGia} onChange={e => setQlF(p => ({ ...p, donGia: e.target.value }))} placeholder="27,000 đ/kg" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Xếp loại</label><select value={qlF.xepLoai} onChange={e => setQlF(p => ({ ...p, xepLoai: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white">{XEP_LOAI_OPTIONS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Quy cách áp dụng</label><select value={qlF.gradeId ?? ""} onChange={e => setQlF(p => ({ ...p, gradeId: e.target.value ? Number(e.target.value) : null }))} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none bg-white"><option value="">-- Áp dụng chung --</option>{grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
              {qlErr && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{qlErr}</div>}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted/40">
              <button onClick={closeQL} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={qlC.isPending || qlU.isPending} onClick={() => { setQlErr(null); if (!qlF.danhGia.trim() || !qlF.donGia.trim()) { setQlErr("Vui lòng điền đủ thông tin."); return; } qlE ? qlU.mutate({ id: qlE.id, b: qlF }) : qlC.mutate(qlF); }} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">{(qlC.isPending || qlU.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}{qlE ? "Lưu" : "Thêm"}</button>
            </div>
          </aside>
        </>
      )}

      {/* Standard Drawer */}
      {sD && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeS} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between"><div className="text-[17px] font-semibold">{sE ? "Sửa tiêu chuẩn" : "Thêm tiêu chuẩn"}</div><button onClick={closeS} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button></div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div><label className="block text-[13px] font-medium mb-1.5">Tiêu đề <span className="text-rose-500">*</span></label><input value={sF.title} onChange={e => setSF(p => ({ ...p, title: e.target.value }))} placeholder="Độ non, già của búp chè…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary" /></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Mô tả chi tiết</label><textarea value={sF.description} onChange={e => setSF(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Búp phải non, đúng quy cách…" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm outline-none focus:border-primary resize-none" /></div>
              <div>
                <label className="block text-[13px] font-medium mb-2">Màu</label>
                <div className="flex gap-2">{["emerald","sky","amber","rose","violet"].map(c => <button key={c} onClick={() => setSF(p => ({ ...p, colorKey: c }))} className={`w-8 h-8 rounded-full ${dotColor(c)} transition-all ${sF.colorKey === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`} />)}</div>
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
