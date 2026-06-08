import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Scissors, Plus, Search, Eye, Pencil, Trash2, X, Loader2,
  MapPin, Users, Leaf, TrendingUp, FileSpreadsheet, Calendar,
  CheckCircle2, Clock, ChevronUp, ChevronDown,
} from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

type HarvestStatus = "ke-hoach" | "dang-thu" | "hoan-thanh" | "huy";
const STATUS_CFG: Record<HarvestStatus, { label: string; color: string }> = {
  "ke-hoach":  { label: "Kế hoạch",    color: "bg-gray-100 text-gray-600" },
  "dang-thu":  { label: "Đang thu",    color: "bg-amber-100 text-amber-700" },
  "hoan-thanh":{ label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700" },
  "huy":       { label: "Đã hủy",      color: "bg-red-100 text-red-600" },
};

interface HarvestRecord {
  id: number;
  maPhieu: string;
  vung: string;
  giong: string;
  ngayThu: string;
  soHo: number;
  kLuong: number;
  loaiChe: string;
  phuongPhap: string;
  doChi: number;
  nguoiPhuTrach: string;
  maLo: string;
  trangThai: HarvestStatus;
  ghiChu: string;
}

const MOCK_HARVESTS: HarvestRecord[] = [
  { id:1, maPhieu:"TH-060826-001", vung:"Nà Bay",    giong:"Shan Tuyết", ngayThu:"08/06/2026", soHo:4,  kLuong:48.0, loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1-2 lá", doChi:76, nguoiPhuTrach:"Trần Thị Bình", maLo:"RAW-NB-0806", trangThai:"dang-thu",   ghiChu:"Đang thu, thời tiết tốt" },
  { id:2, maPhieu:"TH-060426-001", vung:"Nà Hồng",  giong:"Shan Tuyết", ngayThu:"04/06/2026", soHo:6,  kLuong:72.5, loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1-2 lá", doChi:78, nguoiPhuTrach:"Nguyễn Văn An",  maLo:"RAW-NH-0604", trangThai:"hoan-thanh", ghiChu:"Đạt chất lượng cao, tôm đều" },
  { id:3, maPhieu:"TH-060126-001", vung:"Nà Bay",    giong:"Shan Tuyết", ngayThu:"01/06/2026", soHo:8,  kLuong:96.3, loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1-2 lá", doChi:75, nguoiPhuTrach:"Trần Thị Bình", maLo:"RAW-NB-0601", trangThai:"hoan-thanh", ghiChu:"Đợt lớn nhất tháng 6" },
  { id:4, maPhieu:"TH-052826-001", vung:"Bản Chang", giong:"Kim Tuyên",  ngayThu:"28/05/2026", soHo:3,  kLuong:22.4, loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1 lá",   doChi:72, nguoiPhuTrach:"Phạm Văn Cường", maLo:"RAW-BC-0528", trangThai:"hoan-thanh", ghiChu:"Kim Tuyên chất lượng tốt" },
  { id:5, maPhieu:"TH-052026-001", vung:"Nà Hồng",  giong:"Shan Tuyết", ngayThu:"20/05/2026", soHo:10, kLuong:118.0,loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1-2 lá", doChi:80, nguoiPhuTrach:"Nguyễn Văn An",  maLo:"RAW-NH-0520", trangThai:"hoan-thanh", ghiChu:"Đợt đầu vụ hè, sản lượng cao" },
  { id:6, maPhieu:"TH-061526-001", vung:"Nà Bay",    giong:"Shan Tuyết", ngayThu:"15/06/2026", soHo:5,  kLuong:0,    loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1-2 lá", doChi:0,  nguoiPhuTrach:"Trần Thị Bình", maLo:"",            trangThai:"ke-hoach",   ghiChu:"Kế hoạch thu đợt 2 tháng 6" },
];

type FormData = { vung: string; giong: string; ngayThu: string; soHo: string; kLuong: string; loaiChe: string; phuongPhap: string; doChi: string; nguoiPhuTrach: string; trangThai: HarvestStatus; ghiChu: string };
const EMPTY_FORM: FormData = { vung:"", giong:"Shan Tuyết", ngayThu:new Date().toISOString().slice(0,10), soHo:"", kLuong:"", loaiChe:"Chè búp tươi", phuongPhap:"Hái tay – tôm 1-2 lá", doChi:"", nguoiPhuTrach:"", trangThai:"ke-hoach", ghiChu:"" };

const VUNG_LIST = ["Nà Hồng", "Nà Bay", "Bản Chang"];
const GIONG_LIST = ["Shan Tuyết", "Kim Tuyên", "Shan Tuyết cổ thụ", "Oolong"];

let _nid = 20;
const genId = () => ++_nid;
const genMaPhieu = (date: string) => { const [y,m,d] = date.split("-"); return `TH-${d}${m}${y.slice(2)}-${String(_nid).padStart(3,"0")}`; };

export default function VungTrongHarvestPage() {
  const [records, setRecords] = useState<HarvestRecord[]>(MOCK_HARVESTS);
  const [search, setSearch] = useState("");
  const [vungFilter, setVungFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<HarvestStatus | "">("");
  const [sortKey, setSortKey] = useState("ngayThu");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [selected, setSelected] = useState<HarvestRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<HarvestRecord | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HarvestRecord | null>(null);

  function setF<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(p => ({ ...p, [k]: v })); }
  const SortIcon = ({ col }: { col: string }) => sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> : sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  function handleSort(k: string) { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } }

  const filtered = useMemo(() => {
    let d = records;
    if (search) { const q = search.toLowerCase(); d = d.filter(r => r.maPhieu.toLowerCase().includes(q) || r.vung.toLowerCase().includes(q) || r.nguoiPhuTrach.toLowerCase().includes(q)); }
    if (vungFilter) d = d.filter(r => r.vung === vungFilter);
    if (statusFilter) d = d.filter(r => r.trangThai === statusFilter);
    return [...d].sort((a, b) => {
      const av = (a as unknown as Record<string,unknown>)[sortKey];
      const bv = (b as unknown as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [records, search, vungFilter, statusFilter, sortKey, sortDir]);

  const stats = {
    total: records.filter(r => r.trangThai !== "huy").reduce((s,r) => s+r.kLuong, 0),
    thangNay: records.filter(r => r.ngayThu.includes("/06/") && r.trangThai !== "huy").reduce((s,r) => s+r.kLuong, 0),
    soLan: records.filter(r => r.trangThai !== "huy").length,
    keHoach: records.filter(r => r.trangThai === "ke-hoach").reduce((s,r) => s+r.soHo, 0),
  };

  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setDrawerOpen(true); }
  function openEdit(r: HarvestRecord) {
    setEditItem(r);
    const [d,m,y] = r.ngayThu.split("/");
    setForm({ vung:r.vung, giong:r.giong, ngayThu:`${y}-${m}-${d}`, soHo:String(r.soHo), kLuong:String(r.kLuong), loaiChe:r.loaiChe, phuongPhap:r.phuongPhap, doChi:String(r.doChi), nguoiPhuTrach:r.nguoiPhuTrach, trangThai:r.trangThai, ghiChu:r.ghiChu });
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!form.vung) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const [y,m,d] = form.ngayThu.split("-");
      const ngayThu = `${d}/${m}/${y}`;
      if (editItem) {
        const upd: HarvestRecord = { ...editItem, ...form, ngayThu, soHo:parseInt(form.soHo)||0, kLuong:parseFloat(form.kLuong)||0, doChi:parseInt(form.doChi)||0 };
        setRecords(prev => prev.map(r => r.id === editItem.id ? upd : r));
        if (selected?.id === editItem.id) setSelected(upd);
      } else {
        const id = genId();
        const nr: HarvestRecord = { id, maPhieu:genMaPhieu(form.ngayThu), ...form, ngayThu, soHo:parseInt(form.soHo)||0, kLuong:parseFloat(form.kLuong)||0, doChi:parseInt(form.doChi)||0, maLo:"" };
        setRecords(prev => [nr, ...prev]);
      }
      setDrawerOpen(false);
    }, 600);
  }

  function handleDelete(id: number) {
    setRecords(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteTarget(null);
  }

  const VUNG_COLOR: Record<string, string> = {
    "Nà Hồng": "bg-emerald-100 text-emerald-700",
    "Nà Bay":   "bg-blue-100 text-blue-700",
    "Bản Chang":"bg-amber-100 text-amber-700",
  };

  const handleExport = () => exportToExcel([
    { header: "Mã phiếu", key: "maPhieu", width: 18 },
    { header: "Vùng trồng", key: "vung", width: 14 },
    { header: "Giống chè", key: "giong", width: 16 },
    { header: "Ngày thu", key: "ngayThu", width: 14 },
    { header: "Số hộ", key: "soHo", width: 10 },
    { header: "Khối lượng (kg)", key: "kLuong", width: 16 },
    { header: "Loại chè", key: "loaiChe", width: 16 },
    { header: "Độ chi (%)", key: "doChi", width: 12 },
    { header: "Người phụ trách", key: "nguoiPhuTrach", width: 20 },
    { header: "Mã lô", key: "maLo", width: 18 },
    { header: "Trạng thái", key: "trangThai", width: 16 },
  ], records as unknown as Record<string,unknown>[], "ThuHoach_QuanChu");

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Vùng trồng / Thu hoạch</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Scissors className="w-6 h-6 text-rose-600" />
              Thu hoạch
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
              <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Ghi nhận thu hoạch</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: "Tổng sản lượng", value:`${stats.total.toFixed(1)} kg`, sub:"tất cả đợt", color:"text-emerald-600 bg-emerald-50" },
            { icon: Calendar,   label: "Tháng 6/2026",   value:`${stats.thangNay.toFixed(1)} kg`,sub:"tháng hiện tại", color:"text-blue-600 bg-blue-50" },
            { icon: Scissors,   label: "Số đợt thu",     value:`${stats.soLan} đợt`,           sub:"đã hoàn thành",  color:"text-rose-600 bg-rose-50" },
            { icon: Clock,      label: "Kế hoạch tới",   value:`${stats.keHoach} hộ`,           sub:"chờ thu hoạch",  color:"text-amber-600 bg-amber-50" },
          ].map((s,i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5}/></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã phiếu, vùng, người phụ trách..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/>
            </div>
            <select value={vungFilter} onChange={e=>setVungFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option value="">Tất cả vùng</option>
              {VUNG_LIST.map(v=><option key={v} value={v}>{v}</option>)}
            </select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as HarvestStatus|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option value="">Tất cả TT</option>
              {(Object.keys(STATUS_CFG) as HarvestStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  {[{k:"maPhieu",l:"Mã phiếu"},{k:"vung",l:"Vùng trồng"},{k:"ngayThu",l:"Ngày thu"},{k:"soHo",l:"Số hộ"},{k:"kLuong",l:"Khối lượng"},{k:"giong",l:"Giống chè"},{k:"doChi",l:"Độ chi"},{k:"nguoiPhuTrach",l:"Phụ trách"},{k:"trangThai",l:"Trạng thái"}].map(col=>(
                    <th key={col.k} onClick={()=>handleSort(col.k)} className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">{col.l}<SortIcon col={col.k}/></span>
                    </th>
                  ))}
                  <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>{
                  const sc = STATUS_CFG[r.trangThai];
                  const vc = VUNG_COLOR[r.vung] ?? "bg-gray-100 text-gray-600";
                  return (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(r)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{r.maPhieu}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${vc}`}>{r.vung}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{r.ngayThu}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{r.soHo} hộ</td>
                      <td className="py-3 px-4"><span className={`font-bold text-sm ${r.kLuong > 0 ? "text-emerald-700" : "text-muted-foreground"}`}>{r.kLuong > 0 ? `${r.kLuong} kg` : "—"}</span></td>
                      <td className="py-3 px-4 text-sm">{r.giong}</td>
                      <td className="py-3 px-4 text-sm">{r.doChi > 0 ? `${r.doChi}%` : "—"}</td>
                      <td className="py-3 px-4 text-sm">{r.nguoiPhuTrach}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span></td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={()=>openEdit(r)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>setDeleteTarget(r)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={10} className="py-12 text-center text-muted-foreground"><Scissors className="w-8 h-8 mx-auto mb-2 opacity-30"/>Không có bản ghi thu hoạch</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex justify-between">
            <span>{filtered.length} đợt thu hoạch</span>
            <span className="font-semibold">Tổng: {filtered.filter(r=>r.trangThai!=="huy").reduce((s,r)=>s+r.kLuong,0).toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && !drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maPhieu}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.ngayThu} · {selected.vung}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CFG[selected.trangThai].color}`}>{STATUS_CFG[selected.trangThai].label}</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Khối lượng</p><p className={`text-2xl font-bold ${selected.kLuong>0?"text-emerald-700":"text-muted-foreground"}`}>{selected.kLuong>0?selected.kLuong:"—"}{selected.kLuong>0?" kg":""}</p></div>
                <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Số hộ</p><p className="text-2xl font-bold text-blue-700">{selected.soHo}</p></div>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2.5">
                {[["Vùng trồng",selected.vung],["Giống chè",selected.giong],["Loại chè",selected.loaiChe],["Phương pháp",selected.phuongPhap],["Độ chi",selected.doChi>0?`${selected.doChi}%`:"—"],["Người phụ trách",selected.nguoiPhuTrach],["Mã lô",selected.maLo||"Chưa tạo"]].map(([l,v],i)=>(
                  <div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className="font-medium text-right ml-4">{v}</span></div>
                ))}
              </div>
              {selected.ghiChu && <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Ghi chú</p><p className="text-sm italic">{selected.ghiChu}</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2">
              <button onClick={()=>openEdit(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Pencil className="w-3.5 h-3.5"/>Sửa</button>
              <button onClick={()=>setDeleteTarget(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setDrawerOpen(false)}/>
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[17px] font-semibold">{editItem?"Sửa phiếu thu hoạch":"Ghi nhận thu hoạch"}</div>
              <button onClick={()=>setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground"/></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Vùng trồng <span className="text-rose-500">*</span></label>
                  <select value={form.vung} onChange={e=>setF("vung",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                    <option value="">-- Chọn vùng --</option>
                    {VUNG_LIST.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Ngày thu hoạch</label>
                  <input type="date" value={form.ngayThu} onChange={e=>setF("ngayThu",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Giống chè</label>
                  <select value={form.giong} onChange={e=>setF("giong",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                    {GIONG_LIST.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Loại chè</label>
                  <input value={form.loaiChe} onChange={e=>setF("loaiChe",e.target.value)} placeholder="Chè búp tươi" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Số hộ</label>
                  <input type="number" value={form.soHo} onChange={e=>setF("soHo",e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Khối lượng (kg)</label>
                  <input type="number" step="0.1" value={form.kLuong} onChange={e=>setF("kLuong",e.target.value)} placeholder="0.0" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Độ chi (%)</label>
                  <input type="number" value={form.doChi} onChange={e=>setF("doChi",e.target.value)} placeholder="75" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Phương pháp thu hoạch</label>
                <input value={form.phuongPhap} onChange={e=>setF("phuongPhap",e.target.value)} placeholder="VD: Hái tay – tôm 1-2 lá" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Người phụ trách</label>
                <input value={form.nguoiPhuTrach} onChange={e=>setF("nguoiPhuTrach",e.target.value)} placeholder="Họ tên người phụ trách" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                <select value={form.trangThai} onChange={e=>setF("trangThai",e.target.value as HarvestStatus)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                  {(Object.keys(STATUS_CFG) as HarvestStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                <textarea value={form.ghiChu} onChange={e=>setF("ghiChu",e.target.value)} rows={2} placeholder="Thông tin thêm..." className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none"/>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={()=>setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={saving||!form.vung} onClick={handleSave} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {saving&&<Loader2 className="w-4 h-4 animate-spin"/>}
                {editItem?"Lưu thay đổi":"Ghi nhận"}
              </button>
            </div>
          </aside>
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-600"/></div>
            <h3 className="text-base font-semibold text-center mb-1">Xóa phiếu thu hoạch?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa phiếu <span className="font-semibold text-foreground">{deleteTarget.maPhieu}</span></p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button onClick={()=>handleDelete(deleteTarget.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
