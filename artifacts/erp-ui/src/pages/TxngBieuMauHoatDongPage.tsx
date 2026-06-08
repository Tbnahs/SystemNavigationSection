import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  ClipboardList, Plus, Search, Eye, Pencil, Trash2, X, Loader2,
  CheckCircle2, Clock, FileSpreadsheet, Copy, QrCode, ArrowRight,
  Tag, FlaskConical, Leaf, Scissors, Droplets, Users,
} from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

type MauStatus = "hoat-dong" | "ngung" | "nhap";
const STATUS_CFG: Record<MauStatus, { label: string; color: string }> = {
  "hoat-dong": { label: "Hoạt động",  color: "bg-emerald-100 text-emerald-700" },
  "ngung":     { label: "Ngừng dùng", color: "bg-gray-100 text-gray-600" },
  "nhap":      { label: "Nháp",       color: "bg-blue-100 text-blue-700" },
};

type LoaiMau = "thu-mua" | "canh-tac" | "thu-hoach" | "kiem-tra" | "van-chuyen" | "khac";
const LOAI_CFG: Record<LoaiMau, { label: string; color: string; icon: React.ElementType }> = {
  "thu-mua":    { label: "Thu mua",         color: "bg-amber-100 text-amber-700",   icon: Tag },
  "canh-tac":   { label: "Canh tác",        color: "bg-lime-100 text-lime-700",     icon: FlaskConical },
  "thu-hoach":  { label: "Thu hoạch",       color: "bg-rose-100 text-rose-700",     icon: Scissors },
  "kiem-tra":   { label: "Kiểm tra",        color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
  "van-chuyen": { label: "Vận chuyển",      color: "bg-blue-100 text-blue-700",     icon: ArrowRight },
  "khac":       { label: "Khác",            color: "bg-gray-100 text-gray-600",     icon: ClipboardList },
};

interface TruongField {
  ten: string;
  kieuDuLieu: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  batBuoc: boolean;
  moTa?: string;
}

interface BieuMau {
  id: number;
  maMau: string;
  tenMau: string;
  loai: LoaiMau;
  moTa: string;
  phienBan: string;
  nguoiTao: string;
  ngayTao: string;
  soLanSuDung: number;
  trangThai: MauStatus;
  truongs: TruongField[];
  ghiChu: string;
}

const MOCK_MAUS: BieuMau[] = [
  { id:1, maMau:"BM-TM-001", tenMau:"Phiếu xác nhận thu mua chè tươi", loai:"thu-mua", moTa:"Ghi nhận thông tin thu mua từ hộ nông dân: khối lượng, chất lượng, giá cả", phienBan:"v1.2", nguoiTao:"Nguyễn Văn An", ngayTao:"15/01/2026", soLanSuDung:48, trangThai:"hoat-dong", ghiChu:"Dùng khi thu mua tại điểm",
    truongs:[
      {ten:"Ngày thu mua",kieuDuLieu:"date",batBuoc:true},
      {ten:"Mã hộ nông dân",kieuDuLieu:"text",batBuoc:true},
      {ten:"Khối lượng (kg)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Loại chè",kieuDuLieu:"select",batBuoc:true,moTa:"Chè búp tươi / tôm 1 lá / tôm 2 lá"},
      {ten:"Xếp loại chất lượng",kieuDuLieu:"select",batBuoc:true,moTa:"A / B / C"},
      {ten:"Đơn giá (đ/kg)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Địa điểm thu mua",kieuDuLieu:"text",batBuoc:false},
      {ten:"Ghi chú",kieuDuLieu:"textarea",batBuoc:false},
    ]},
  { id:2, maMau:"BM-CT-001", tenMau:"Nhật ký canh tác – bón phân", loai:"canh-tac", moTa:"Ghi nhận chi tiết hoạt động bón phân theo quy trình VietGAP", phienBan:"v2.0", nguoiTao:"Trần Thị Bình", ngayTao:"20/01/2026", soLanSuDung:32, trangThai:"hoat-dong", ghiChu:"",
    truongs:[
      {ten:"Ngày bón phân",kieuDuLieu:"date",batBuoc:true},
      {ten:"Vùng trồng",kieuDuLieu:"select",batBuoc:true,moTa:"Nà Hồng / Nà Bay / Bản Chang"},
      {ten:"Tên phân bón",kieuDuLieu:"text",batBuoc:true},
      {ten:"Liều lượng (kg/ha)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Người thực hiện",kieuDuLieu:"text",batBuoc:true},
      {ten:"Số hộ tham gia",kieuDuLieu:"number",batBuoc:false},
      {ten:"Kết quả / Nhận xét",kieuDuLieu:"textarea",batBuoc:false},
    ]},
  { id:3, maMau:"BM-CT-002", tenMau:"Nhật ký phun thuốc BVTV", loai:"canh-tac", moTa:"Ghi nhận phun thuốc: tên thuốc, nồng độ, diện tích, thời gian cách ly PHI", phienBan:"v1.5", nguoiTao:"Nguyễn Văn An", ngayTao:"25/01/2026", soLanSuDung:14, trangThai:"hoat-dong", ghiChu:"Bắt buộc ghi PHI",
    truongs:[
      {ten:"Ngày phun",kieuDuLieu:"date",batBuoc:true},
      {ten:"Vùng / hộ thực hiện",kieuDuLieu:"text",batBuoc:true},
      {ten:"Tên thuốc",kieuDuLieu:"text",batBuoc:true},
      {ten:"Nồng độ pha",kieuDuLieu:"text",batBuoc:true},
      {ten:"Diện tích phun (ha)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Thời gian cách ly PHI (ngày)",kieuDuLieu:"number",batBuoc:true,moTa:"Ngày được phép thu hoạch sau phun"},
      {ten:"Người phun",kieuDuLieu:"text",batBuoc:true},
      {ten:"Ghi chú lý do",kieuDuLieu:"textarea",batBuoc:false},
    ]},
  { id:4, maMau:"BM-TH-001", tenMau:"Phiếu ghi nhận thu hoạch", loai:"thu-hoach", moTa:"Ghi nhận chính xác sản lượng và chất lượng mỗi đợt thu hoạch", phienBan:"v1.1", nguoiTao:"Phạm Văn Cường", ngayTao:"10/02/2026", soLanSuDung:21, trangThai:"hoat-dong", ghiChu:"",
    truongs:[
      {ten:"Ngày thu hoạch",kieuDuLieu:"date",batBuoc:true},
      {ten:"Vùng trồng",kieuDuLieu:"select",batBuoc:true},
      {ten:"Giống chè",kieuDuLieu:"text",batBuoc:true},
      {ten:"Phương pháp hái",kieuDuLieu:"select",batBuoc:true,moTa:"Hái tay / Hái máy"},
      {ten:"Khối lượng tươi (kg)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Độ chi (%)",kieuDuLieu:"number",batBuoc:false},
      {ten:"Số hộ tham gia",kieuDuLieu:"number",batBuoc:false},
      {ten:"Người phụ trách",kieuDuLieu:"text",batBuoc:true},
    ]},
  { id:5, maMau:"BM-KT-001", tenMau:"Phiếu kiểm tra VietGAP định kỳ", loai:"kiem-tra", moTa:"Kiểm tra tuân thủ quy trình VietGAP: an toàn thực phẩm, môi trường, điều kiện lao động", phienBan:"v3.0", nguoiTao:"Cán bộ kỹ thuật", ngayTao:"01/03/2026", soLanSuDung:6, trangThai:"hoat-dong", ghiChu:"Kiểm tra 6 tháng/lần",
    truongs:[
      {ten:"Ngày kiểm tra",kieuDuLieu:"date",batBuoc:true},
      {ten:"Vùng kiểm tra",kieuDuLieu:"select",batBuoc:true},
      {ten:"Cán bộ kiểm tra",kieuDuLieu:"text",batBuoc:true},
      {ten:"An toàn thực phẩm (điểm /30)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Môi trường (điểm /25)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Điều kiện lao động (điểm /20)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Quản lý hồ sơ (điểm /25)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Tổng điểm /100",kieuDuLieu:"number",batBuoc:true},
      {ten:"Kết quả (Đạt/Không đạt)",kieuDuLieu:"select",batBuoc:true},
      {ten:"Vi phạm cần khắc phục",kieuDuLieu:"textarea",batBuoc:false},
    ]},
  { id:6, maMau:"BM-VC-001", tenMau:"Phiếu vận chuyển chè tươi", loai:"van-chuyen", moTa:"Chứng nhận nguồn gốc và điều kiện vận chuyển từ vườn đến cơ sở chế biến", phienBan:"v1.0", nguoiTao:"Nguyễn Văn An", ngayTao:"15/03/2026", soLanSuDung:8, trangThai:"nhap", ghiChu:"Đang hoàn thiện",
    truongs:[
      {ten:"Ngày/giờ xuất phát",kieuDuLieu:"date",batBuoc:true},
      {ten:"Từ (vùng/điểm thu mua)",kieuDuLieu:"text",batBuoc:true},
      {ten:"Đến (cơ sở chế biến)",kieuDuLieu:"text",batBuoc:true},
      {ten:"Khối lượng (kg)",kieuDuLieu:"number",batBuoc:true},
      {ten:"Phương tiện vận chuyển",kieuDuLieu:"text",batBuoc:false},
      {ten:"Người giao",kieuDuLieu:"text",batBuoc:true},
      {ten:"Người nhận",kieuDuLieu:"text",batBuoc:true},
    ]},
];

type FormData = { maMau: string; tenMau: string; loai: LoaiMau; moTa: string; phienBan: string; trangThai: MauStatus; ghiChu: string };
const EMPTY: FormData = { maMau:"", tenMau:"", loai:"canh-tac", moTa:"", phienBan:"v1.0", trangThai:"nhap", ghiChu:"" };
const KIEU_DL_LABEL: Record<string, string> = { text:"Văn bản", number:"Số", date:"Ngày tháng", select:"Danh sách chọn", textarea:"Đoạn văn", checkbox:"Checkbox" };

let _nid = 60;
const genId = () => ++_nid;

export default function TxngBieuMauHoatDongPage() {
  const [maus, setMaus] = useState<BieuMau[]>(MOCK_MAUS);
  const [search, setSearch] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<LoaiMau|"">("");
  const [statusFilter, setStatusFilter] = useState<MauStatus|"">("");
  const [selected, setSelected] = useState<BieuMau|null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<BieuMau|null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BieuMau|null>(null);

  function setF<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(p=>({...p,[k]:v})); }

  const filtered = useMemo(() => {
    let d = maus;
    if (search) { const q=search.toLowerCase(); d=d.filter(m=>m.maMau.toLowerCase().includes(q)||m.tenMau.toLowerCase().includes(q)); }
    if (loaiFilter) d=d.filter(m=>m.loai===loaiFilter);
    if (statusFilter) d=d.filter(m=>m.trangThai===statusFilter);
    return d;
  }, [maus, search, loaiFilter, statusFilter]);

  function openCreate() { setEditItem(null); setForm(EMPTY); setDrawerOpen(true); }
  function openEdit(m: BieuMau) { setEditItem(m); setForm({maMau:m.maMau,tenMau:m.tenMau,loai:m.loai,moTa:m.moTa,phienBan:m.phienBan,trangThai:m.trangThai,ghiChu:m.ghiChu}); setDrawerOpen(true); }
  function handleDuplicate(m: BieuMau) {
    const id = genId();
    const nm:BieuMau={...m, id, maMau:`${m.maMau}-COPY`, tenMau:`${m.tenMau} (bản sao)`, trangThai:"nhap", soLanSuDung:0, ngayTao:new Date().toLocaleDateString("vi-VN")};
    setMaus(prev=>[nm,...prev]);
  }

  function handleSave() {
    if (!form.tenMau.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (editItem) {
        const upd:BieuMau={...editItem,...form};
        setMaus(prev=>prev.map(m=>m.id===editItem.id?upd:m));
        if(selected?.id===editItem.id) setSelected(upd);
      } else {
        const id=genId();
        const nm:BieuMau={id,...form,nguoiTao:"Admin",ngayTao:new Date().toLocaleDateString("vi-VN"),soLanSuDung:0,truongs:[]};
        setMaus(prev=>[nm,...prev]);
      }
      setDrawerOpen(false);
    }, 600);
  }

  function handleDelete(id: number) { setMaus(prev=>prev.filter(m=>m.id!==id)); if(selected?.id===id) setSelected(null); setDeleteTarget(null); }

  const stats = { total:maus.length, active:maus.filter(m=>m.trangThai==="hoat-dong").length, totalUse:maus.reduce((s,m)=>s+m.soLanSuDung,0) };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">TXNG / Biểu mẫu hoạt động</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600"/>
              Biểu mẫu Hoạt động
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4"/>Tạo biểu mẫu</button>
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">Quản lý các mẫu phiếu canh tác, thu mua, thu hoạch dùng trong khai báo sự kiện TXNG.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon:ClipboardList, label:"Tổng biểu mẫu",   value:`${stats.total}`,    color:"text-blue-600 bg-blue-50" },
            { icon:CheckCircle2,  label:"Đang hoạt động",  value:`${stats.active}`,    color:"text-emerald-600 bg-emerald-50" },
            { icon:FileSpreadsheet,label:"Lượt sử dụng",   value:`${stats.totalUse}`,  color:"text-violet-600 bg-violet-50" },
            { icon:Clock,         label:"Biểu mẫu nháp",   value:`${maus.filter(m=>m.trangThai==="nhap").length}`,color:"text-amber-600 bg-amber-50" },
          ].map((s,i)=>(
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5}/></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p></div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã, tên biểu mẫu..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <select value={loaiFilter} onChange={e=>setLoaiFilter(e.target.value as LoaiMau|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả loại</option>{(Object.keys(LOAI_CFG) as LoaiMau[]).map(k=><option key={k} value={k}>{LOAI_CFG[k].label}</option>)}</select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as MauStatus|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none"><option value="">Tất cả TT</option>{(Object.keys(STATUS_CFG) as MauStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}</select>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m=>{
            const lc=LOAI_CFG[m.loai]; const sc=STATUS_CFG[m.trangThai]; const Icon=lc.icon;
            return (
              <div key={m.id} className="bg-white border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lc.color}`}><Icon className="w-4 h-4" strokeWidth={1.5}/></div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{m.phienBan}</span>
                  </div>
                  <button className="text-left w-full" onClick={()=>setSelected(m)}>
                    <p className="font-semibold text-sm text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">{m.tenMau}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{m.moTa}</p>
                  </button>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full ${lc.color}`}>{lc.label}</span>
                    <span>{m.truongs.length} trường</span>
                    <span>{m.soLanSuDung} lần dùng</span>
                  </div>
                </div>
                <div className="border-t border-border/60 px-4 py-2.5 flex items-center justify-between bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">{m.maMau} · {m.ngayTao}</p>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>setSelected(m)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Xem"><Eye className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>openEdit(m)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Sửa"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>handleDuplicate(m)} className="p-1.5 rounded-md hover:bg-blue-50 text-muted-foreground hover:text-blue-600" title="Nhân bản"><Copy className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>setDeleteTarget(m)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Xóa"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Không tìm thấy biểu mẫu</p>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && !drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{selected.maMau}</span>
                <p className="text-sm font-semibold mt-0.5">{selected.tenMau}</p>
              </div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${LOAI_CFG[selected.loai].color}`}>{LOAI_CFG[selected.loai].label}</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CFG[selected.trangThai].color}`}>{STATUS_CFG[selected.trangThai].label}</span>
                <span className="text-xs text-muted-foreground">{selected.phienBan}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selected.moTa}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Số trường</p><p className="text-xl font-bold">{selected.truongs.length}</p></div>
                <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Lượt dùng</p><p className="text-xl font-bold text-blue-700">{selected.soLanSuDung}</p></div>
                <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground">Bắt buộc</p><p className="text-xl font-bold text-rose-600">{selected.truongs.filter(t=>t.batBuoc).length}</p></div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cấu trúc trường ({selected.truongs.length})</p>
                <div className="space-y-2">
                  {selected.truongs.map((t,i)=>(
                    <div key={i} className="bg-muted/20 rounded-lg px-3 py-2.5 flex items-start gap-3">
                      <span className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">{String(i+1).padStart(2,"0")}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{t.ten}</p>
                          {t.batBuoc&&<span className="text-[10px] text-rose-600 font-bold">*BẮT BUỘC</span>}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{KIEU_DL_LABEL[t.kieuDuLieu]}{t.moTa&&` · ${t.moTa}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.ghiChu && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Ghi chú</p><p className="text-sm text-amber-800">{selected.ghiChu}</p></div>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button onClick={()=>openEdit(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Pencil className="w-3.5 h-3.5"/>Sửa</button>
              <button onClick={()=>handleDuplicate(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted/50"><Copy className="w-3.5 h-3.5"/>Nhân bản</button>
              <button onClick={()=>setDeleteTarget(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5"/>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setDrawerOpen(false)}/>
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between"><div className="text-[17px] font-semibold">{editItem?"Sửa biểu mẫu":"Tạo biểu mẫu mới"}</div><button onClick={()=>setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground"/></button></div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[13px] font-medium mb-1.5">Mã biểu mẫu</label><input value={form.maMau} onChange={e=>setF("maMau",e.target.value)} placeholder="BM-TM-001" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
                <div><label className="block text-[13px] font-medium mb-1.5">Phiên bản</label><input value={form.phienBan} onChange={e=>setF("phienBan",e.target.value)} placeholder="v1.0" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              </div>
              <div><label className="block text-[13px] font-medium mb-1.5">Tên biểu mẫu <span className="text-rose-500">*</span></label><input value={form.tenMau} onChange={e=>setF("tenMau",e.target.value)} placeholder="Tên đầy đủ của biểu mẫu" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Loại hoạt động</label><select value={form.loai} onChange={e=>setF("loai",e.target.value as LoaiMau)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">{(Object.keys(LOAI_CFG) as LoaiMau[]).map(k=><option key={k} value={k}>{LOAI_CFG[k].label}</option>)}</select></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Mô tả</label><textarea value={form.moTa} onChange={e=>setF("moTa",e.target.value)} rows={3} placeholder="Mô tả mục đích và cách dùng biểu mẫu..." className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none"/></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Trạng thái</label><select value={form.trangThai} onChange={e=>setF("trangThai",e.target.value as MauStatus)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">{(Object.keys(STATUS_CFG) as MauStatus[]).map(k=><option key={k} value={k}>{STATUS_CFG[k].label}</option>)}</select></div>
              <div><label className="block text-[13px] font-medium mb-1.5">Ghi chú</label><textarea value={form.ghiChu} onChange={e=>setF("ghiChu",e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none"/></div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={()=>setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={saving||!form.tenMau.trim()} onClick={handleSave} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">{saving&&<Loader2 className="w-4 h-4 animate-spin"/>}{editItem?"Lưu":"Tạo biểu mẫu"}</button>
            </div>
          </aside>
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-600"/></div>
            <h3 className="text-base font-semibold text-center mb-1">Xóa biểu mẫu?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">{deleteTarget.tenMau}</p>
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
