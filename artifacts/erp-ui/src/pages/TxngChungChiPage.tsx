import { useState, useMemo } from "react";
import { useParams } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  Award, Plus, Search, Eye, Pencil, Trash2, X, Loader2,
  Building2, Package, CheckCircle2, Clock, AlertTriangle,
  FileSpreadsheet, Calendar, Shield, ExternalLink,
} from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

type CertStatus = "con-hieu-luc" | "sap-het-han" | "het-han" | "dang-xu-ly";
const STATUS_CFG: Record<CertStatus, { label: string; color: string; icon: React.ElementType }> = {
  "con-hieu-luc":  { label: "Còn hiệu lực",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "sap-het-han":   { label: "Sắp hết hạn",    color: "bg-amber-100 text-amber-700",     icon: AlertTriangle },
  "het-han":       { label: "Đã hết hạn",     color: "bg-red-100 text-red-600",         icon: AlertTriangle },
  "dang-xu-ly":    { label: "Đang xử lý",     color: "bg-blue-100 text-blue-700",       icon: Clock },
};

type LoaiChungChi = "vietgap" | "organic" | "ocop" | "haccp" | "iso" | "khac";
const LOAI_CFG: Record<LoaiChungChi, { label: string; color: string }> = {
  vietgap:  { label: "VietGAP",      color: "bg-green-100 text-green-700" },
  organic:  { label: "Hữu cơ",       color: "bg-lime-100 text-lime-700" },
  ocop:     { label: "OCOP",          color: "bg-amber-100 text-amber-700" },
  haccp:    { label: "HACCP",         color: "bg-blue-100 text-blue-700" },
  iso:      { label: "ISO",           color: "bg-violet-100 text-violet-700" },
  khac:     { label: "Khác",          color: "bg-gray-100 text-gray-600" },
};

interface ChungChi {
  id: number;
  soChungChi: string;
  tenChungChi: string;
  loai: LoaiChungChi;
  capBoi: string;
  doiTuong: string;
  phamVi: string;
  ngayCap: string;
  ngayHetHan: string;
  trangThai: CertStatus;
  fileUrl: string;
  ghiChu: string;
}

const MOCK_DN: ChungChi[] = [
  { id:1, soChungChi:"VG-BK-2024-001", tenChungChi:"VietGAP Chè",              loai:"vietgap", capBoi:"Chi cục Trồng trọt & BVTV Bắc Kạn", doiTuong:"HTX Hồng Hà", phamVi:"Toàn bộ vùng trồng Bằng Phúc", ngayCap:"15/03/2024", ngayHetHan:"15/03/2026", trangThai:"sap-het-han", fileUrl:"#", ghiChu:"Cần gia hạn ngay" },
  { id:2, soChungChi:"OCOP-BK-2023-047", tenChungChi:"OCOP 4⭐",              loai:"ocop",    capBoi:"UBND tỉnh Bắc Kạn",                  doiTuong:"HTX Hồng Hà – Chè xanh BăngPhúc", phamVi:"Dòng sản phẩm chè xanh", ngayCap:"20/08/2023", ngayHetHan:"20/08/2026", trangThai:"con-hieu-luc", fileUrl:"#", ghiChu:"Đạt tiêu chí 4 sao" },
  { id:3, soChungChi:"USDA-ORG-2024-019", tenChungChi:"Hữu cơ USDA Organic", loai:"organic", capBoi:"Control Union Certifications",       doiTuong:"HTX Hồng Hà", phamVi:"Vùng Nà Bay (11.4 ha)", ngayCap:"01/06/2024", ngayHetHan:"01/06/2027", trangThai:"con-hieu-luc", fileUrl:"#", ghiChu:"Xuất khẩu Mỹ/EU" },
  { id:4, soChungChi:"HACCP-VN-2023-088", tenChungChi:"HACCP",               loai:"haccp",   capBoi:"TUV Rheinland Vietnam",               doiTuong:"Nhà máy chế biến Bằng Phúc", phamVi:"Dây chuyền chế biến chè", ngayCap:"10/10/2023", ngayHetHan:"10/10/2026", trangThai:"con-hieu-luc", fileUrl:"#", ghiChu:"" },
  { id:5, soChungChi:"VG-BK-2026-REQ", tenChungChi:"VietGAP gia hạn 2026",   loai:"vietgap", capBoi:"Chi cục Trồng trọt & BVTV Bắc Kạn", doiTuong:"HTX Hồng Hà", phamVi:"Toàn bộ vùng trồng", ngayCap:"", ngayHetHan:"", trangThai:"dang-xu-ly", fileUrl:"", ghiChu:"Đã nộp hồ sơ 01/06/2026, chờ kiểm định" },
];

const MOCK_TP: ChungChi[] = [
  { id:10, soChungChi:"TS-QC-2024-088", tenChungChi:"Tiêu chuẩn TCVN 1053",  loai:"vietgap", capBoi:"Cục Tiêu chuẩn Đo lường Chất lượng", doiTuong:"Chè xanh Bằng Phúc", phamVi:"Thương phẩm TP-001", ngayCap:"01/04/2024", ngayHetHan:"01/04/2027", trangThai:"con-hieu-luc", fileUrl:"#", ghiChu:"" },
  { id:11, soChungChi:"OCOP-SP-2023-012", tenChungChi:"OCOP 4⭐ Hồng trà",  loai:"ocop",    capBoi:"UBND tỉnh Bắc Kạn",                  doiTuong:"Hồng trà Shan Tuyết", phamVi:"Thương phẩm TP-002", ngayCap:"20/08/2023", ngayHetHan:"20/08/2026", trangThai:"con-hieu-luc", fileUrl:"#", ghiChu:"" },
  { id:12, soChungChi:"ORG-EU-2024-034", tenChungChi:"EU Organic (EC 2018)", loai:"organic", capBoi:"ECOCERT SA",                         doiTuong:"Bạch trà Shan Tuyết", phamVi:"Thương phẩm TP-003", ngayCap:"15/07/2024", ngayHetHan:"15/07/2025", trangThai:"het-han",   fileUrl:"#", ghiChu:"Đã hết hạn, cần gia hạn" },
];

type FormData = { soChungChi: string; tenChungChi: string; loai: LoaiChungChi; capBoi: string; doiTuong: string; phamVi: string; ngayCap: string; ngayHetHan: string; trangThai: CertStatus; fileUrl: string; ghiChu: string };
const EMPTY: FormData = { soChungChi:"", tenChungChi:"", loai:"vietgap", capBoi:"", doiTuong:"", phamVi:"", ngayCap:"", ngayHetHan:"", trangThai:"con-hieu-luc", fileUrl:"", ghiChu:"" };

let _nid = 30;
const genId = () => ++_nid;

export default function TxngChungChiPage() {
  const params = useParams<{ subId?: string }>();
  const isTP = params.subId?.includes("tp");
  const title = isTP ? "Chứng chỉ Thương phẩm" : "Chứng chỉ Doanh nghiệp";
  const icon = isTP ? Package : Building2;
  const Icon = icon;

  const [items, setItems] = useState<ChungChi[]>(isTP ? MOCK_TP : MOCK_DN);
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<LoaiChungChi|"">("");
  const [statusFilter, setStatusFilter] = useState<CertStatus|"">("");
  const [selected, setSelected] = useState<ChungChi|null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChungChi|null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChungChi|null>(null);

  function setF<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(p=>({...p,[k]:v})); }

  const filtered = useMemo(() => {
    let d = items;
    if (search) { const q=search.toLowerCase(); d=d.filter(c=>c.soChungChi.toLowerCase().includes(q)||c.tenChungChi.toLowerCase().includes(q)||c.doiTuong.toLowerCase().includes(q)); }
    if (loaiFilter) d=d.filter(c=>c.loai===loaiFilter);
    if (statusFilter) d=d.filter(c=>c.trangThai===statusFilter);
    return d;
  }, [items, search, loaiFilter, statusFilter]);

  function openCreate() { setEditItem(null); setForm(EMPTY); setDrawerOpen(true); }
  function openEdit(c: ChungChi) {
    setEditItem(c);
    const parseDate = (s: string) => { if (!s) return ""; const [d,m,y]=s.split("/"); return `${y}-${m}-${d}`; };
    setForm({ soChungChi:c.soChungChi,tenChungChi:c.tenChungChi,loai:c.loai,capBoi:c.capBoi,doiTuong:c.doiTuong,phamVi:c.phamVi,ngayCap:parseDate(c.ngayCap),ngayHetHan:parseDate(c.ngayHetHan),trangThai:c.trangThai,fileUrl:c.fileUrl,ghiChu:c.ghiChu });
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!form.tenChungChi.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const fmt = (s: string) => { if (!s) return ""; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
      if (editItem) {
        const upd:ChungChi={...editItem,...form,ngayCap:fmt(form.ngayCap),ngayHetHan:fmt(form.ngayHetHan)};
        setItems(prev=>prev.map(c=>c.id===editItem.id?upd:c));
        if (selected?.id===editItem.id) setSelected(upd);
      } else {
        const id=genId();
        const nc:ChungChi={id,...form,ngayCap:fmt(form.ngayCap),ngayHetHan:fmt(form.ngayHetHan)};
        setItems(prev=>[nc,...prev]);
      }
      setDrawerOpen(false);
    }, 600);
  }

  function handleDelete(id: number) { setItems(prev=>prev.filter(c=>c.id!==id)); if(selected?.id===id) setSelected(null); setDeleteTarget(null); }

  const stats = { total:items.length, active:items.filter(c=>c.trangThai==="con-hieu-luc").length, expiring:items.filter(c=>c.trangThai==="sap-het-han").length, expired:items.filter(c=>c.trangThai==="het-han").length };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">TXNG / {title}</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2"><Icon className="w-6 h-6 text-violet-600"/>{title}</h1>
            <div className="flex items-center gap-2">
              <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4"/>Thêm chứng chỉ</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon:Award,        label:"Tổng chứng chỉ",    value:`${stats.total}`,    color:"text-violet-600 bg-violet-50" },
            { icon:CheckCircle2, label:"Còn hiệu lực",      value:`${stats.active}`,   color:"text-emerald-600 bg-emerald-50" },
            { icon:AlertTriangle,label:"Sắp hết hạn",       value:`${stats.expiring}`, color:"text-amber-600 bg-amber-50" },
            { icon:Clock,        label:"Đã hết hạn",        value:`${stats.expired}`,  color:"text-red-600 bg-red-50" },
          ].map((s,i)=>(
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5}/></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p></div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm số CC, tên, đối tượng..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/></div>
            <select value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value as LoaiChungChi|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả loại</option>{(Object.keys(LOAI_CFG) as LoaiChungChi[]).map(k=><option key={k} value={k}>{LOAI_CFG[k].label}</option>)}</select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as CertStatus|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả TT</option>{(Object.keys(STATUS_CFG) as CertStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}</select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30 text-left">{["Số chứng chỉ","Tên chứng chỉ","Loại","Cấp bởi","Đối tượng","Ngày cấp","Hết hạn","Trạng thái",""].map((h,i)=><th key={i} className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(c=>{
                  const sc=STATUS_CFG[c.trangThai]; const lc=LOAI_CFG[c.loai];
                  return (
                    <tr key={c.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(c)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{c.soChungChi}</span></td>
                      <td className="py-3 px-4 font-medium">{c.tenChungChi}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${lc.color}`}>{lc.label}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[180px] truncate">{c.capBoi}</td>
                      <td className="py-3 px-4 text-sm max-w-[160px] truncate">{c.doiTuong}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{c.ngayCap||"—"}</td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap"><span className={c.trangThai==="het-han"?"text-red-600 font-semibold":c.trangThai==="sap-het-han"?"text-amber-700 font-semibold":"text-muted-foreground"}>{c.ngayHetHan||"Đang xử lý"}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}><sc.icon className="w-3 h-3"/>{sc.label}</span></td>
                      <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          {c.fileUrl&&<a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><ExternalLink className="w-3.5 h-3.5"/></a>}
                          <button onClick={()=>openEdit(c)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5"/></button>
                          <button onClick={()=>setDeleteTarget(c)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0&&<tr><td colSpan={9} className="py-12 text-center text-muted-foreground"><Award className="w-8 h-8 mx-auto mb-2 opacity-30"/>Chưa có chứng chỉ nào</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail */}
      {selected&&!drawerOpen&&(
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-xs font-bold text-primary">{selected.soChungChi}</span><p className="text-sm font-semibold mt-0.5">{selected.tenChungChi}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${LOAI_CFG[selected.loai].color}`}>{LOAI_CFG[selected.loai].label}</span>
                {(() => { const StatusIcon = STATUS_CFG[selected.trangThai].icon; return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CFG[selected.trangThai].color}`}><StatusIcon className="w-3 h-3"/>{STATUS_CFG[selected.trangThai].label}</span>; })()}
              </div>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2.5">
                {[["Cấp bởi",selected.capBoi],["Đối tượng",selected.doiTuong],["Phạm vi",selected.phamVi],["Ngày cấp",selected.ngayCap||"—"],["Ngày hết hạn",selected.ngayHetHan||"Đang xử lý"]].map(([l,v],i)=>(
                  <div key={i} className="flex justify-between text-sm gap-4"><span className="text-muted-foreground shrink-0">{l}</span><span className="font-medium text-right">{v}</span></div>
                ))}
              </div>
              {selected.ghiChu&&<div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Ghi chú / Cảnh báo</p><p className="text-sm text-amber-800">{selected.ghiChu}</p></div>}
              {selected.fileUrl&&<a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted/50"><ExternalLink className="w-4 h-4"/>Xem file chứng chỉ</a>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2">
              <button onClick={()=>openEdit(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Pencil className="w-3.5 h-3.5"/>Sửa</button>
              <button onClick={()=>setDeleteTarget(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit */}
      {drawerOpen&&(
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setDrawerOpen(false)}/>
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[17px] font-semibold">{editItem?"Sửa chứng chỉ":"Thêm chứng chỉ"}</div>
              <button onClick={()=>setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground"/></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium mb-1.5">Số chứng chỉ</label><input value={form.soChungChi} onChange={e=>setF("soChungChi",e.target.value)} placeholder="VG-BK-2024-001" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
                <div><label className="block text-[13px] font-medium mb-1.5">Loại</label><select value={form.loai} onChange={e=>setF("loai",e.target.value as LoaiChungChi)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">{(Object.keys(LOAI_CFG) as LoaiChungChi[]).map(k=><option key={k} value={k}>{LOAI_CFG[k].label}</option>)}</select></div>
              </div>
              <div><label className="block text-[13px] font-medium mb-1.5">Tên chứng chỉ <span className="text-rose-500">*</span></label><input value={form.tenChungChi} onChange={e=>setF("tenChungChi",e.target.value)} placeholder="VD: VietGAP Chè 2024" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Cấp bởi</label><input value={form.capBoi} onChange={e=>setF("capBoi",e.target.value)} placeholder="Tổ chức cấp chứng chỉ" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Đối tượng</label><input value={form.doiTuong} onChange={e=>setF("doiTuong",e.target.value)} placeholder="Doanh nghiệp / sản phẩm" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Phạm vi</label><input value={form.phamVi} onChange={e=>setF("phamVi",e.target.value)} placeholder="Vùng trồng, dây chuyền..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium mb-1.5">Ngày cấp</label><input type="date" value={form.ngayCap} onChange={e=>setF("ngayCap",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
                <div><label className="block text-[13px] font-medium mb-1.5">Ngày hết hạn</label><input type="date" value={form.ngayHetHan} onChange={e=>setF("ngayHetHan",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              </div>
              <div><label className="block text-[13px] font-medium mb-1.5">Trạng thái</label><select value={form.trangThai} onChange={e=>setF("trangThai",e.target.value as CertStatus)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">{(Object.keys(STATUS_CFG) as CertStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}</select></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Link file CC</label><input value={form.fileUrl} onChange={e=>setF("fileUrl",e.target.value)} placeholder="https://..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Ghi chú</label><textarea value={form.ghiChu} onChange={e=>setF("ghiChu",e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none"/></div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={()=>setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={saving||!form.tenChungChi.trim()} onClick={handleSave} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {saving&&<Loader2 className="w-4 h-4 animate-spin"/>}{editItem?"Lưu":"Thêm"}
              </button>
            </div>
          </aside>
        </>
      )}

      {deleteTarget&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-600"/></div>
            <h3 className="text-base font-semibold text-center mb-1">Xóa chứng chỉ?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">{deleteTarget.tenChungChi}</p>
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
