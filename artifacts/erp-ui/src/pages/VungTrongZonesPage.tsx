import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  MapPin, Plus, Search, Eye, Pencil, Trash2, X, Loader2,
  Users, Leaf, Ruler, QrCode, Printer, ArrowLeft, CheckCircle2, Clock,
  FileSpreadsheet, Download, Navigation, Phone,
} from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

type ZoneStatus = "active" | "inactive" | "survey";
const STATUS_CFG: Record<ZoneStatus, { label: string; color: string }> = {
  active:   { label: "Đang hoạt động", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Tạm dừng",       color: "bg-gray-100 text-gray-600" },
  survey:   { label: "Đang khảo sát",  color: "bg-amber-100 text-amber-700" },
};

interface Zone {
  id: number;
  maVung: string;
  tenVung: string;
  tinh: string;
  xa: string;
  diaChiChiTiet: string;
  gps: string;
  dienTich: number;
  giongChe: string;
  soHo: number;
  soNguoiLD: number;
  sanLuongNam: number;
  namHoatDong: number;
  trangThai: ZoneStatus;
  chungNhan: string;
  nguoiPhuTrach: string;
  sdt: string;
  ghiChu: string;
}

const MOCK_ZONES: Zone[] = [
  { id:1, maVung:"VT-001", tenVung:"Nà Hồng", tinh:"Bắc Kạn", xa:"Bằng Phúc", diaChiChiTiet:"Thôn Nà Hồng, xã Bằng Phúc", gps:"22.4521°N, 105.7823°E", dienTich:7.2, giongChe:"Shan Tuyết cổ thụ", soHo:10, soNguoiLD:18, sanLuongNam:2840, namHoatDong:2018, trangThai:"active", chungNhan:"VietGAP, OCOP 4⭐", nguoiPhuTrach:"Nguyễn Văn An", sdt:"0208 3456 789", ghiChu:"Vùng chè cổ thụ 100 năm, sản lượng cao nhất" },
  { id:2, maVung:"VT-002", tenVung:"Nà Bay",  tinh:"Bắc Kạn", xa:"Bằng Phúc", diaChiChiTiet:"Thôn Nà Bay, xã Bằng Phúc",  gps:"22.4398°N, 105.7912°E", dienTich:11.4, giongChe:"Shan Tuyết Bằng Phúc", soHo:13, soNguoiLD:24, sanLuongNam:2985, namHoatDong:2018, trangThai:"active", chungNhan:"VietGAP, Hữu cơ USDA", nguoiPhuTrach:"Trần Thị Bình", sdt:"0208 3567 890", ghiChu:"Vùng lớn nhất, hộ đông nhất" },
  { id:3, maVung:"VT-003", tenVung:"Bản Chang", tinh:"Bắc Kạn", xa:"Bằng Phúc", diaChiChiTiet:"Thôn Bản Chang, xã Bằng Phúc", gps:"22.4612°N, 105.7756°E", dienTich:2.8, giongChe:"Kim Tuyên", soHo:3, soNguoiLD:6, sanLuongNam:507, namHoatDong:2021, trangThai:"active", chungNhan:"VietGAP", nguoiPhuTrach:"Phạm Văn Cường", sdt:"0961 234 567", ghiChu:"Kim Tuyên mới trồng thêm năm 2021" },
  { id:4, maVung:"VT-004", tenVung:"Khu mới Pác Nặm", tinh:"Bắc Kạn", xa:"Pác Nặm", diaChiChiTiet:"Xã Pác Nặm, huyện Pác Nặm", gps:"22.5234°N, 105.8012°E", dienTich:1.5, giongChe:"Đang khảo sát", soHo:0, soNguoiLD:0, sanLuongNam:0, namHoatDong:2026, trangThai:"survey", chungNhan:"—", nguoiPhuTrach:"Lê Văn Dũng", sdt:"0387 123 456", ghiChu:"Đang khảo sát đất, chưa trồng" },
];

type FormData = { maVung: string; tenVung: string; tinh: string; xa: string; diaChiChiTiet: string; gps: string; dienTich: string; giongChe: string; soHo: string; soNguoiLD: string; sanLuongNam: string; namHoatDong: string; trangThai: ZoneStatus; chungNhan: string; nguoiPhuTrach: string; sdt: string; ghiChu: string };
const EMPTY_FORM: FormData = { maVung:"", tenVung:"", tinh:"Bắc Kạn", xa:"Bằng Phúc", diaChiChiTiet:"", gps:"", dienTich:"", giongChe:"", soHo:"0", soNguoiLD:"0", sanLuongNam:"0", namHoatDong:String(new Date().getFullYear()), trangThai:"active", chungNhan:"", nguoiPhuTrach:"", sdt:"", ghiChu:"" };

let _nid = 10;
const genId = () => ++_nid;

export default function VungTrongZonesPage() {
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ZoneStatus | "">("");
  const [selected, setSelected] = useState<Zone | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Zone | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let d = zones;
    if (search) { const q = search.toLowerCase(); d = d.filter(z => z.tenVung.toLowerCase().includes(q) || z.maVung.toLowerCase().includes(q) || z.xa.toLowerCase().includes(q)); }
    if (statusFilter) d = d.filter(z => z.trangThai === statusFilter);
    return d;
  }, [zones, search, statusFilter]);

  const totalDienTich = zones.filter(z => z.trangThai === "active").reduce((s,z) => s+z.dienTich, 0);
  const totalHo = zones.filter(z => z.trangThai === "active").reduce((s,z) => s+z.soHo, 0);
  const totalSL = zones.filter(z => z.trangThai === "active").reduce((s,z) => s+z.sanLuongNam, 0);

  function setF<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(p => ({ ...p, [k]: v })); }

  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setDrawerOpen(true); }
  function openEdit(z: Zone) {
    setEditItem(z);
    setForm({ maVung:z.maVung, tenVung:z.tenVung, tinh:z.tinh, xa:z.xa, diaChiChiTiet:z.diaChiChiTiet, gps:z.gps, dienTich:String(z.dienTich), giongChe:z.giongChe, soHo:String(z.soHo), soNguoiLD:String(z.soNguoiLD), sanLuongNam:String(z.sanLuongNam), namHoatDong:String(z.namHoatDong), trangThai:z.trangThai, chungNhan:z.chungNhan, nguoiPhuTrach:z.nguoiPhuTrach, sdt:z.sdt, ghiChu:z.ghiChu });
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!form.tenVung.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (editItem) {
        const updated: Zone = { ...editItem, ...form, dienTich: parseFloat(form.dienTich)||0, soHo: parseInt(form.soHo)||0, soNguoiLD: parseInt(form.soNguoiLD)||0, sanLuongNam: parseInt(form.sanLuongNam)||0, namHoatDong: parseInt(form.namHoatDong)||2024 };
        setZones(prev => prev.map(z => z.id === editItem.id ? updated : z));
        if (selected?.id === editItem.id) setSelected(updated);
      } else {
        const id = genId();
        const newZ: Zone = { id, ...form, dienTich: parseFloat(form.dienTich)||0, soHo: parseInt(form.soHo)||0, soNguoiLD: parseInt(form.soNguoiLD)||0, sanLuongNam: parseInt(form.sanLuongNam)||0, namHoatDong: parseInt(form.namHoatDong)||2024 };
        setZones(prev => [...prev, newZ]);
      }
      setDrawerOpen(false); setEditItem(null);
    }, 600);
  }

  function handleDelete(id: number) {
    setZones(prev => prev.filter(z => z.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteTarget(null);
  }

  const handleExport = () => exportToExcel([
    { header: "Mã vùng", key: "maVung", width: 12 },
    { header: "Tên vùng", key: "tenVung", width: 18 },
    { header: "Tỉnh", key: "tinh", width: 14 },
    { header: "Xã", key: "xa", width: 14 },
    { header: "Diện tích (ha)", key: "dienTich", width: 16 },
    { header: "Giống chè", key: "giongChe", width: 20 },
    { header: "Số hộ", key: "soHo", width: 10 },
    { header: "Lao động", key: "soNguoiLD", width: 12 },
    { header: "Sản lượng/năm (kg)", key: "sanLuongNam", width: 20 },
    { header: "Chứng nhận", key: "chungNhan", width: 22 },
    { header: "Trạng thái", key: "trangThai", width: 16 },
  ], zones as unknown as Record<string, unknown>[], "VungTrong_QuanChu");

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Vùng trồng / Quản lý vùng</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-600" />
              Vùng trồng
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Thêm vùng
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: MapPin,  label: "Vùng hoạt động", value: `${zones.filter(z=>z.trangThai==="active").length}/${zones.length}`, color: "text-amber-600 bg-amber-50" },
            { icon: Ruler,   label: "Tổng diện tích",  value: `${totalDienTich.toFixed(1)} ha`,                                    color: "text-emerald-600 bg-emerald-50" },
            { icon: Users,   label: "Nông hộ liên kết", value: `${totalHo} hộ`,                                                    color: "text-blue-600 bg-blue-50" },
            { icon: Leaf,    label: "Sản lượng năm",   value: `${totalSL.toLocaleString("vi-VN")} kg`,                              color: "text-violet-600 bg-violet-50" },
          ].map((s,i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p></div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã vùng, tên vùng, xã..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ZoneStatus | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option value="">Tất cả TT</option>
              {(Object.keys(STATUS_CFG) as ZoneStatus[]).map(k => <option key={k} value={k}>{STATUS_CFG[k].label}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  {["Mã vùng", "Tên vùng", "Địa điểm", "Diện tích", "Giống chè", "Nông hộ", "Sản lượng/năm", "Chứng nhận", "Trạng thái", ""].map((h,i) => (
                    <th key={i} className="py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(z => {
                  const sc = STATUS_CFG[z.trangThai];
                  return (
                    <tr key={z.id} className="border-b border-border/60 hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(z)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-amber-700">{z.maVung}</span></td>
                      <td className="py-3 px-4 font-medium">{z.tenVung}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{z.xa}, {z.tinh}</td>
                      <td className="py-3 px-4 font-semibold">{z.dienTich} ha</td>
                      <td className="py-3 px-4 text-sm">{z.giongChe}</td>
                      <td className="py-3 px-4"><span className="font-semibold text-blue-700">{z.soHo}</span> hộ · {z.soNguoiLD} LĐ</td>
                      <td className="py-3 px-4"><span className={`font-bold ${z.sanLuongNam > 0 ? "text-emerald-700" : "text-muted-foreground"}`}>{z.sanLuongNam > 0 ? `${z.sanLuongNam.toLocaleString("vi-VN")} kg` : "—"}</span></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[160px] truncate">{z.chungNhan || "—"}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span></td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setSelected(z)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openEdit(z)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(z)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-muted-foreground text-sm"><MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />Không tìm thấy vùng trồng</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
            {filtered.length}/{zones.length} vùng trồng · Tổng {totalDienTich.toFixed(1)} ha hoạt động
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && !drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-amber-700">{selected.maVung}</span>
                <p className="text-base font-semibold mt-0.5">{selected.tenVung}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CFG[selected.trangThai].color}`}>{STATUS_CFG[selected.trangThai].label}</div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Diện tích</p><p className="text-xl font-bold text-amber-700">{selected.dienTich} ha</p></div>
                <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Nông hộ</p><p className="text-xl font-bold text-blue-700">{selected.soHo} hộ</p></div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Sản lượng/năm</p><p className="text-lg font-bold text-emerald-700">{selected.sanLuongNam > 0 ? `${selected.sanLuongNam.toLocaleString("vi-VN")} kg` : "—"}</p></div>
                <div className="bg-violet-50 rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">Lao động</p><p className="text-xl font-bold text-violet-700">{selected.soNguoiLD}</p></div>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 space-y-2.5">
                <div className="flex gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground text-xs">Địa chỉ</p><p className="font-medium">{selected.diaChiChiTiet}</p></div></div>
                {selected.gps && <div className="flex gap-2 text-sm"><Navigation className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground text-xs">GPS</p><p className="font-mono text-xs">{selected.gps}</p></div></div>}
                <div className="flex gap-2 text-sm"><Leaf className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground text-xs">Giống chè</p><p className="font-medium">{selected.giongChe}</p></div></div>
                {selected.chungNhan && <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground text-xs">Chứng nhận</p><p className="font-medium">{selected.chungNhan}</p></div></div>}
                {selected.nguoiPhuTrach && <div className="flex gap-2 text-sm"><Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground text-xs">Người phụ trách</p><p className="font-medium">{selected.nguoiPhuTrach} · {selected.sdt}</p></div></div>}
                <div className="flex gap-2 text-sm"><Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-muted-foreground text-xs">Năm hoạt động</p><p className="font-medium">Từ {selected.namHoatDong}</p></div></div>
              </div>

              {selected.ghiChu && (
                <div className="bg-muted/20 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-1">Ghi chú</p><p className="text-sm italic">{selected.ghiChu}</p></div>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-border shrink-0 flex gap-2">
              <button onClick={() => { openEdit(selected); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Pencil className="w-3.5 h-3.5" /> Sửa</button>
              <button onClick={() => setDeleteTarget(selected)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div><div className="text-[17px] font-semibold">{editItem ? "Sửa vùng trồng" : "Thêm vùng trồng mới"}</div></div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Mã vùng</label>
                  <input value={form.maVung} onChange={e => setF("maVung", e.target.value)} placeholder="VT-001" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Tên vùng <span className="text-rose-500">*</span></label>
                  <input value={form.tenVung} onChange={e => setF("tenVung", e.target.value)} placeholder="VD: Nà Hồng" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Tỉnh/Thành</label>
                  <input value={form.tinh} onChange={e => setF("tinh", e.target.value)} placeholder="Bắc Kạn" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Xã/Phường</label>
                  <input value={form.xa} onChange={e => setF("xa", e.target.value)} placeholder="Bằng Phúc" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Địa chỉ chi tiết</label>
                <input value={form.diaChiChiTiet} onChange={e => setF("diaChiChiTiet", e.target.value)} placeholder="Thôn, xóm..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Tọa độ GPS</label>
                <input value={form.gps} onChange={e => setF("gps", e.target.value)} placeholder="VD: 22.4521°N, 105.7823°E" className="w-full h-10 px-3 rounded-lg border border-border text-sm font-mono focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Diện tích (ha)</label>
                  <input value={form.dienTich} onChange={e => setF("dienTich", e.target.value)} type="number" step="0.1" placeholder="0.0" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Năm bắt đầu</label>
                  <input value={form.namHoatDong} onChange={e => setF("namHoatDong", e.target.value)} type="number" placeholder="2024" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Giống chè</label>
                <input value={form.giongChe} onChange={e => setF("giongChe", e.target.value)} placeholder="VD: Shan Tuyết, Kim Tuyên..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Số hộ</label>
                  <input value={form.soHo} onChange={e => setF("soHo", e.target.value)} type="number" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Lao động</label>
                  <input value={form.soNguoiLD} onChange={e => setF("soNguoiLD", e.target.value)} type="number" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">SL/năm (kg)</label>
                  <input value={form.sanLuongNam} onChange={e => setF("sanLuongNam", e.target.value)} type="number" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Chứng nhận</label>
                <input value={form.chungNhan} onChange={e => setF("chungNhan", e.target.value)} placeholder="VD: VietGAP, OCOP 4⭐, Hữu cơ..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Người phụ trách</label>
                  <input value={form.nguoiPhuTrach} onChange={e => setF("nguoiPhuTrach", e.target.value)} placeholder="Họ tên" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5">SĐT</label>
                  <input value={form.sdt} onChange={e => setF("sdt", e.target.value)} placeholder="0xxx..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Trạng thái</label>
                <select value={form.trangThai} onChange={e => setF("trangThai", e.target.value as ZoneStatus)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                  {(Object.keys(STATUS_CFG) as ZoneStatus[]).map(k => <option key={k} value={k}>{STATUS_CFG[k].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                <textarea value={form.ghiChu} onChange={e => setF("ghiChu", e.target.value)} rows={2} placeholder="Thông tin thêm..." className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={() => setDrawerOpen(false)} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={saving || !form.tenVung.trim()} onClick={handleSave} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Thêm vùng"}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-600" /></div>
            <h3 className="text-base font-semibold text-center mb-1">Xóa vùng trồng?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Xóa <span className="font-semibold text-foreground">{deleteTarget.tenVung}</span> khỏi hệ thống.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button onClick={() => handleDelete(deleteTarget.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
