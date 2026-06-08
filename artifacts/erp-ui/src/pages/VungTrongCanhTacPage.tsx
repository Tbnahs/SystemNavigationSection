import { useState, useMemo } from "react";
import { useParams } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  FlaskConical, Plus, Search, Eye, Pencil, Trash2, X, Loader2,
  ClipboardCheck, CloudSun, Thermometer, Droplets, Wind,
  CheckCircle2, AlertTriangle, Clock, FileSpreadsheet,
  Leaf, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

type ActivityType = "bon-phan" | "phun-thuoc" | "tuoi-nuoc" | "cat-tinh" | "kiem-tra" | "khac";
const ACT_CFG: Record<ActivityType, { label: string; color: string; icon: React.ElementType }> = {
  "bon-phan":  { label: "Bón phân",      color: "bg-lime-100 text-lime-700",     icon: Leaf },
  "phun-thuoc":{ label: "Phun thuốc",    color: "bg-orange-100 text-orange-700", icon: FlaskConical },
  "tuoi-nuoc": { label: "Tưới nước",     color: "bg-blue-100 text-blue-700",     icon: Droplets },
  "cat-tinh":  { label: "Cắt tỉa",       color: "bg-rose-100 text-rose-700",     icon: Leaf },
  "kiem-tra":  { label: "Kiểm tra",      color: "bg-violet-100 text-violet-700", icon: ClipboardCheck },
  "khac":      { label: "Khác",           color: "bg-gray-100 text-gray-600",     icon: Leaf },
};

type ActStatus = "ke-hoach" | "dang-thuc-hien" | "hoan-thanh" | "huy";
const STATUS_CFG: Record<ActStatus, { label: string; color: string }> = {
  "ke-hoach":        { label: "Kế hoạch",        color: "bg-gray-100 text-gray-600" },
  "dang-thuc-hien":  { label: "Đang thực hiện",  color: "bg-amber-100 text-amber-700" },
  "hoan-thanh":      { label: "Hoàn thành",      color: "bg-emerald-100 text-emerald-700" },
  "huy":             { label: "Đã hủy",           color: "bg-red-100 text-red-600" },
};

interface Activity {
  id: number;
  maPhieu: string;
  loai: ActivityType;
  vung: string;
  ngayThucHien: string;
  soHo: number;
  nguoiThucHien: string;
  vatTuSuDung: string;
  lieuLuong: string;
  trangThai: ActStatus;
  ketQua: string;
  phiThoiGian: number;
  ghiChu: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  { id:1, maPhieu:"HĐ-BF-060826", loai:"bon-phan",   vung:"Nà Bay",    ngayThucHien:"08/06/2026", soHo:8,  nguoiThucHien:"HTX Hồng Hà + hộ tự làm", vatTuSuDung:"Phân hữu cơ vi sinh Organica", lieuLuong:"15 kg/cây (≈ 300 kg/ha)", trangThai:"ke-hoach",       ketQua:"",                       phiThoiGian:7, ghiChu:"Bón định kỳ trước vụ thu hoạch tháng 6" },
  { id:2, maPhieu:"HĐ-KT-060526", loai:"kiem-tra",   vung:"Nà Hồng",  ngayThucHien:"05/06/2026", soHo:10, nguoiThucHien:"Cán bộ kỹ thuật VietGAP",  vatTuSuDung:"—",                             lieuLuong:"—",                        trangThai:"hoan-thanh",      ketQua:"Đạt 91/100 điểm VietGAP, không phát hiện vi phạm", phiThoiGian:0, ghiChu:"Kiểm tra định kỳ 6 tháng" },
  { id:3, maPhieu:"HĐ-PT-060226", loai:"phun-thuoc", vung:"Nà Hồng",  ngayThucHien:"02/06/2026", soHo:4,  nguoiThucHien:"Nguyễn Văn An",            vatTuSuDung:"Ridomil Gold (thuốc nấm bệnh)", lieuLuong:"2 ml/lít, phun 2 lần",     trangThai:"hoan-thanh",      ketQua:"Hoàn thành, PHI 14 ngày (đến 16/06)", phiThoiGian:14, ghiChu:"Phun phòng bệnh phấn trắng sau mưa lớn" },
  { id:4, maPhieu:"HĐ-TN-053126", loai:"tuoi-nuoc",  vung:"Bản Chang", ngayThucHien:"31/05/2026", soHo:3,  nguoiThucHien:"Phạm Văn Cường",           vatTuSuDung:"Hệ thống tưới nhỏ giọt",        lieuLuong:"20 lít/cây",               trangThai:"hoan-thanh",      ketQua:"Đã tưới đủ, độ ẩm đất đạt 65%", phiThoiGian:0, ghiChu:"Mùa khô cần tưới 2 lần/tuần" },
  { id:5, maPhieu:"HĐ-BF-052026", loai:"bon-phan",   vung:"Nà Bay",    ngayThucHien:"20/05/2026", soHo:13, nguoiThucHien:"HTX Hồng Hà + hộ tự làm", vatTuSuDung:"Phân NPK hữu cơ 12-8-12",       lieuLuong:"200 kg/ha",                trangThai:"hoan-thanh",      ketQua:"Hoàn thành, cây sinh trưởng tốt",    phiThoiGian:0, ghiChu:"" },
  { id:6, maPhieu:"HĐ-CT-061526", loai:"cat-tinh",   vung:"Nà Hồng",  ngayThucHien:"15/06/2026", soHo:6,  nguoiThucHien:"Các hộ tự làm",             vatTuSuDung:"Dụng cụ hái cắt",               lieuLuong:"—",                        trangThai:"ke-hoach",        ketQua:"",                       phiThoiGian:0, ghiChu:"Cắt tỉa định hình trước vụ thu hoạch lần 2" },
];

type FormData = { loai: ActivityType; vung: string; ngayThucHien: string; soHo: string; nguoiThucHien: string; vatTuSuDung: string; lieuLuong: string; trangThai: ActStatus; ketQua: string; phiThoiGian: string; ghiChu: string };
const EMPTY: FormData = { loai:"bon-phan", vung:"", ngayThucHien:new Date().toISOString().slice(0,10), soHo:"", nguoiThucHien:"", vatTuSuDung:"", lieuLuong:"", trangThai:"ke-hoach", ketQua:"", phiThoiGian:"0", ghiChu:"" };
const VUNG_LIST = ["Nà Hồng", "Nà Bay", "Bản Chang"];
const VUNG_COLOR: Record<string,string> = { "Nà Hồng":"bg-emerald-100 text-emerald-700","Nà Bay":"bg-blue-100 text-blue-700","Bản Chang":"bg-amber-100 text-amber-700" };

let _nid = 50;
const genId = () => ++_nid;
const genMa = (loai: string) => { const map: Record<string,string> = { "bon-phan":"BF","phun-thuoc":"PT","tuoi-nuoc":"TN","cat-tinh":"CT","kiem-tra":"KT","khac":"HĐ" }; return `HĐ-${map[loai]??'HĐ'}-${String(_nid).padStart(4,"0")}`; };

export default function VungTrongCanhTacPage() {
  const params = useParams<{ subId?: string }>();
  const sub = params.subId ?? "pesticides";
  const pageTitle = sub === "weather" ? "Thời tiết & Môi trường" : sub === "inspection" ? "Kiểm tra & Giám sát" : "Hoạt động canh tác";

  const [records, setRecords] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<ActivityType|"">("");
  const [vungFilter, setVungFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActStatus|"">("");
  const [sortKey, setSortKey] = useState("ngayThucHien");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [selected, setSelected] = useState<Activity|null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Activity|null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Activity|null>(null);

  function setF<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(p=>({...p,[k]:v})); }
  const SortIcon = ({col}:{col:string}) => sortKey!==col ? <ChevronUp className="w-3 h-3 opacity-30"/> : sortDir==="asc" ? <ChevronUp className="w-3 h-3 text-primary"/> : <ChevronDown className="w-3 h-3 text-primary"/>;
  function handleSort(k: string) { if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortKey(k); setSortDir("desc"); } }

  const filtered = useMemo(() => {
    let d = records;
    if (search) { const q=search.toLowerCase(); d=d.filter(r=>r.maPhieu.toLowerCase().includes(q)||r.vung.toLowerCase().includes(q)||r.vatTuSuDung.toLowerCase().includes(q)); }
    if (loaiFilter) d=d.filter(r=>r.loai===loaiFilter);
    if (vungFilter) d=d.filter(r=>r.vung===vungFilter);
    if (statusFilter) d=d.filter(r=>r.trangThai===statusFilter);
    return [...d].sort((a,b)=>{const av=(a as unknown as Record<string,unknown>)[sortKey];const bv=(b as unknown as Record<string,unknown>)[sortKey];if(typeof av==="number"&&typeof bv==="number")return sortDir==="asc"?av-bv:bv-av;return sortDir==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));});
  }, [records, search, loaiFilter, vungFilter, statusFilter, sortKey, sortDir]);

  const stats = { total:records.length, done:records.filter(r=>r.trangThai==="hoan-thanh").length, phi:records.filter(r=>r.phiThoiGian>0&&r.trangThai!=="huy"), loai:Object.keys(ACT_CFG).reduce((acc,k)=>({...acc,[k]:records.filter(r=>r.loai===k&&r.trangThai!=="huy").length}),{} as Record<string,number>) };

  function openCreate() { setEditItem(null); setForm(EMPTY); setDrawerOpen(true); }
  function openEdit(r: Activity) {
    setEditItem(r);
    const parseDate = (s:string) => { if(!s) return ""; const [d,m,y]=s.split("/"); return `${y}-${m}-${d}`; };
    setForm({ loai:r.loai,vung:r.vung,ngayThucHien:parseDate(r.ngayThucHien),soHo:String(r.soHo),nguoiThucHien:r.nguoiThucHien,vatTuSuDung:r.vatTuSuDung,lieuLuong:r.lieuLuong,trangThai:r.trangThai,ketQua:r.ketQua,phiThoiGian:String(r.phiThoiGian),ghiChu:r.ghiChu });
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!form.vung) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const fmt=(s:string)=>{ if(!s) return ""; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
      if (editItem) {
        const upd:Activity={...editItem,...form,ngayThucHien:fmt(form.ngayThucHien),soHo:parseInt(form.soHo)||0,phiThoiGian:parseInt(form.phiThoiGian)||0};
        setRecords(prev=>prev.map(r=>r.id===editItem.id?upd:r));
        if(selected?.id===editItem.id) setSelected(upd);
      } else {
        const id=genId();
        const nr:Activity={id,maPhieu:genMa(form.loai),...form,ngayThucHien:fmt(form.ngayThucHien),soHo:parseInt(form.soHo)||0,phiThoiGian:parseInt(form.phiThoiGian)||0};
        setRecords(prev=>[nr,...prev]);
      }
      setDrawerOpen(false);
    }, 600);
  }

  function handleDelete(id: number) { setRecords(prev=>prev.filter(r=>r.id!==id)); if(selected?.id===id) setSelected(null); setDeleteTarget(null); }

  // If weather page, show simple weather dashboard
  if (sub === "weather") {
    return (
      <AppLayout>
        <div className="space-y-5">
          <div>
            <div className="text-[12px] text-muted-foreground">Vùng trồng / Thời tiết</div>
            <h1 className="text-xl lg:text-2xl font-bold mt-0.5 flex items-center gap-2"><CloudSun className="w-6 h-6 text-sky-600"/>Thời tiết & Môi trường</h1>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[{vung:"Nà Hồng",color:"border-emerald-200 bg-emerald-50/50",t:"22.4",h:"68",rain:"0",uv:"3",wind:"8"},{vung:"Nà Bay",color:"border-blue-200 bg-blue-50/50",t:"23.1",h:"71",rain:"0",uv:"4",wind:"12"},{vung:"Bản Chang",color:"border-amber-200 bg-amber-50/50",t:"21.8",h:"65",rain:"2.4",uv:"3",wind:"10"}].map(z=>(
              <div key={z.vung} className={`bg-white border rounded-xl p-5 ${z.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">{z.vung}</p>
                  <CloudSun className="w-5 h-5 text-sky-500"/>
                </div>
                <p className="text-4xl font-bold text-foreground mb-4">{z.t}°C</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[{label:"Độ ẩm KK",value:`${z.h}%`,icon:Droplets},{label:"Lượng mưa",value:`${z.rain} mm`,icon:Droplets},{label:"UV Index",value:z.uv,icon:CloudSun},{label:"Gió",value:`${z.wind} km/h`,icon:Wind}].map((item,i)=>(
                    <div key={i} className="bg-white/60 rounded-lg p-2">
                      <p className="text-muted-foreground">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">Cập nhật: 08/06/2026 07:00</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-600"/>Dự báo 7 ngày (Bằng Phúc, Bắc Kạn)</h2>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {[{day:"CN",icon:"☀️",h:24,l:19,r:0},{day:"T2",icon:"⛅",h:25,l:20,r:0},{day:"T3",icon:"🌧️",h:22,l:18,r:12},{day:"T4",icon:"🌦️",h:23,l:19,r:5},{day:"T5",icon:"☀️",h:26,l:21,r:0},{day:"T6",icon:"☀️",h:27,l:22,r:0},{day:"T7",icon:"⛅",h:25,l:20,r:2}].map((d,i)=>(
                <div key={i} className="bg-muted/20 rounded-xl p-2.5">
                  <p className="font-semibold text-muted-foreground">{d.day}</p>
                  <p className="text-lg my-1">{d.icon}</p>
                  <p className="font-bold">{d.h}°</p>
                  <p className="text-muted-foreground">{d.l}°</p>
                  {d.r>0&&<p className="text-blue-600 mt-0.5">{d.r}mm</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Vùng trồng / {pageTitle}</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              {sub==="inspection"?<ClipboardCheck className="w-6 h-6 text-violet-600"/>:<FlaskConical className="w-6 h-6 text-orange-600"/>}
              {pageTitle}
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportToExcel([{header:"Mã phiếu",key:"maPhieu",width:18},{header:"Loại",key:"loai",width:14},{header:"Vùng",key:"vung",width:14},{header:"Ngày TH",key:"ngayThucHien",width:14},{header:"Số hộ",key:"soHo",width:10},{header:"Vật tư",key:"vatTuSuDung",width:24},{header:"Liều lượng",key:"lieuLuong",width:18},{header:"Trạng thái",key:"trangThai",width:16},{header:"Kết quả",key:"ketQua",width:28}],records as unknown as Record<string,unknown>[],"HoatDongCanhTac")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"><FileSpreadsheet className="w-3.5 h-3.5"/>Excel</button>
              <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4"/>Ghi nhận hoạt động</button>
            </div>
          </div>
        </div>

        {/* Stats mini */}
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(ACT_CFG) as ActivityType[]).map(k=>{
            const cfg=ACT_CFG[k]; const Icon=cfg.icon; const n=records.filter(r=>r.loai===k&&r.trangThai!=="huy").length;
            if(!n) return null;
            return <div key={k} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cfg.color}`}><Icon className="w-3 h-3"/>{cfg.label} <span className="font-bold">({n})</span></div>;
          })}
        </div>

        {/* PHI warning */}
        {records.filter(r=>r.phiThoiGian>0&&r.trangThai==="hoan-thanh").length>0&&(
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-amber-900">Lưu ý thời gian cách ly (PHI)</p>
              <p className="text-xs text-amber-700 mt-0.5">Vùng Nà Hồng phun Ridomil Gold ngày 02/06 – PHI 14 ngày, chỉ thu hoạch sau <span className="font-bold">16/06/2026</span>.</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã phiếu, vật tư..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/></div>
            <select value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value as ActivityType|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả loại</option>{(Object.keys(ACT_CFG) as ActivityType[]).map(k=><option key={k} value={k}>{ACT_CFG[k].label}</option>)}</select>
            <select value={vungFilter} onChange={e=>setVungFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả vùng</option>{VUNG_LIST.map(v=><option key={v} value={v}>{v}</option>)}</select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as ActStatus|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả TT</option>{(Object.keys(STATUS_CFG) as ActStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}</select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30 text-left">
                {[{k:"maPhieu",l:"Mã phiếu"},{k:"loai",l:"Loại HĐ"},{k:"vung",l:"Vùng"},{k:"ngayThucHien",l:"Ngày TH"},{k:"soHo",l:"Số hộ"},{k:"vatTuSuDung",l:"Vật tư"},{k:"phiThoiGian",l:"PHI (ngày)"},{k:"trangThai",l:"Trạng thái"}].map(col=>(
                  <th key={col.k} onClick={()=>handleSort(col.k)} className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.l}<SortIcon col={col.k}/></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right text-xs text-muted-foreground uppercase"></th>
              </tr></thead>
              <tbody>
                {filtered.map(r=>{
                  const ac=ACT_CFG[r.loai]; const sc=STATUS_CFG[r.trangThai]; const vc=VUNG_COLOR[r.vung]??"bg-gray-100 text-gray-600";
                  const Icon=ac.icon;
                  return (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={()=>setSelected(r)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{r.maPhieu}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ac.color}`}><Icon className="w-3 h-3"/>{ac.label}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${vc}`}>{r.vung}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{r.ngayThucHien}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{r.soHo} hộ</td>
                      <td className="py-3 px-4 text-sm max-w-[160px] truncate">{r.vatTuSuDung||"—"}</td>
                      <td className="py-3 px-4 text-sm">{r.phiThoiGian>0?<span className="text-amber-700 font-semibold">{r.phiThoiGian} ngày</span>:"—"}</td>
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
                {filtered.length===0&&<tr><td colSpan={9} className="py-12 text-center text-muted-foreground"><FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30"/>Không có hoạt động canh tác</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">{filtered.length} hoạt động</div>
        </div>
      </div>

      {/* Detail + Create/Edit drawers omitted for brevity - similar pattern as other pages */}
      {selected&&!drawerOpen&&(
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div><span className="font-mono text-sm font-bold text-primary">{selected.maPhieu}</span><p className="text-xs text-muted-foreground mt-0.5">{selected.ngayThucHien} · {selected.vung}</p></div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ACT_CFG[selected.loai].color}`}>{ACT_CFG[selected.loai].label}</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CFG[selected.trangThai].color}`}>{STATUS_CFG[selected.trangThai].label}</span>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2.5">
                {[["Vùng trồng",selected.vung],["Ngày TH",selected.ngayThucHien],["Số hộ",`${selected.soHo} hộ`],["Người TH",selected.nguoiThucHien],["Vật tư",selected.vatTuSuDung||"—"],["Liều lượng",selected.lieuLuong||"—"],["PHI",selected.phiThoiGian>0?`${selected.phiThoiGian} ngày cách ly`:"Không có PHI"]].map(([l,v],i)=>(
                  <div key={i} className="flex justify-between text-sm gap-4"><span className="text-muted-foreground shrink-0">{l}</span><span className="font-medium text-right">{v}</span></div>
                ))}
              </div>
              {selected.ketQua&&<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Kết quả</p><p className="text-sm">{selected.ketQua}</p></div>}
              {selected.ghiChu&&<div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Ghi chú</p><p className="text-sm italic">{selected.ghiChu}</p></div>}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2">
              <button onClick={()=>openEdit(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Pencil className="w-3.5 h-3.5"/>Sửa</button>
              <button onClick={()=>setDeleteTarget(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {drawerOpen&&(
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setDrawerOpen(false)}/>
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between"><div className="text-[17px] font-semibold">{editItem?"Sửa hoạt động":"Ghi nhận hoạt động"}</div><button onClick={()=>setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground"/></button></div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium mb-1.5">Loại hoạt động</label><select value={form.loai} onChange={e=>setF("loai",e.target.value as ActivityType)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">{(Object.keys(ACT_CFG) as ActivityType[]).map(k=><option key={k} value={k}>{ACT_CFG[k].label}</option>)}</select></div>
                <div><label className="block text-[13px] font-medium mb-1.5">Vùng trồng <span className="text-rose-500">*</span></label><select value={form.vung} onChange={e=>setF("vung",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary"><option value="">-- Chọn vùng --</option>{VUNG_LIST.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium mb-1.5">Ngày thực hiện</label><input type="date" value={form.ngayThucHien} onChange={e=>setF("ngayThucHien",e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
                <div><label className="block text-[13px] font-medium mb-1.5">Số hộ</label><input type="number" value={form.soHo} onChange={e=>setF("soHo",e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              </div>
              <div><label className="block text-[13px] font-medium mb-1.5">Người thực hiện</label><input value={form.nguoiThucHien} onChange={e=>setF("nguoiThucHien",e.target.value)} placeholder="Tên người / tổ chức" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Vật tư sử dụng</label><input value={form.vatTuSuDung} onChange={e=>setF("vatTuSuDung",e.target.value)} placeholder="Tên phân bón / thuốc / vật tư" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium mb-1.5">Liều lượng</label><input value={form.lieuLuong} onChange={e=>setF("lieuLuong",e.target.value)} placeholder="kg/ha, ml/lít..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
                <div><label className="block text-[13px] font-medium mb-1.5">PHI (ngày cách ly)</label><input type="number" value={form.phiThoiGian} onChange={e=>setF("phiThoiGian",e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              </div>
              <div><label className="block text-[13px] font-medium mb-1.5">Trạng thái</label><select value={form.trangThai} onChange={e=>setF("trangThai",e.target.value as ActStatus)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">{(Object.keys(STATUS_CFG) as ActStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}</select></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Kết quả / Ghi nhận</label><textarea value={form.ketQua} onChange={e=>setF("ketQua",e.target.value)} rows={2} placeholder="Kết quả sau khi thực hiện..." className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Ghi chú</label><textarea value={form.ghiChu} onChange={e=>setF("ghiChu",e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none"/></div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={()=>setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={saving||!form.vung} onClick={handleSave} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">{saving&&<Loader2 className="w-4 h-4 animate-spin"/>}{editItem?"Lưu":"Ghi nhận"}</button>
            </div>
          </aside>
        </>
      )}

      {deleteTarget&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-600"/></div>
            <h3 className="text-base font-semibold text-center mb-1">Xóa hoạt động?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">{deleteTarget.maPhieu}</p>
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
