import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, X, Loader2, Search, ShoppingBasket, Trash2,
  MapPin, QrCode, ChevronDown, Printer,
} from "lucide-react";
import QRCode from "qrcode";
import {
  fetchPurchaseOrders, fetchPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
  fetchTeaVarieties, fetchGrades, fetchQualityLevels, fetchFacilities,
  type PurchaseOrder, type PurchaseOrderItem, type TeaVariety, type Grade,
} from "@/lib/api";

function fmtDate(d: string) {
  if (!d) return "—";
  try { return new Date(d + "T00:00:00").toLocaleDateString("vi-VN"); } catch { return d; }
}

function genMaPhieu() {
  const d = new Date();
  return `PTHU-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
}

function genMaLoMe(facilityCode: string, ngayThu: string) {
  if (!facilityCode || !ngayThu) return "";
  return `${facilityCode}-${ngayThu.replace(/-/g, "")}`;
}

type LineItem = Omit<PurchaseOrderItem, "id" | "orderId"> & { _key: string; teaVarietyId: number | null };

function emptyLine(): LineItem {
  return {
    _key: String(Date.now() + Math.random()),
    productId: null, gradeId: null, teaVarietyId: null,
    productName: "", gradeName: "", qualityPercent: "", ghiChu: "",
    khoiLuong: "", donGia: "", thanhTien: "", moTa: "",
  };
}

type OForm = {
  maPhieu: string;
  enterpriseId: number | null;
  facilityId: number | null;
  facilityName: string;
  diaChuThu: string;
  maLoMe: string;
  ngayThu: string;
  status: PurchaseOrder["status"];
  notes: string;
};

function EMPTY_FORM(): OForm {
  return {
    maPhieu: genMaPhieu(),
    enterpriseId: null, facilityId: null, facilityName: "", diaChuThu: "", maLoMe: "",
    ngayThu: new Date().toISOString().slice(0, 10),
    status: "draft", notes: "",
  };
}

function parseNum(s: string) {
  if (!s) return 0;
  let v = s.replace(/[^0-9.,\-]/g, "");
  if (!v) return 0;
  const dotCount = (v.match(/\./g) || []).length;
  const commaCount = (v.match(/,/g) || []).length;
  if (dotCount > 1) {
    // Multiple dots = thousands separators (vi-VN); comma = decimal
    v = v.replace(/\./g, "").replace(",", ".");
  } else if (dotCount === 1 && commaCount === 0) {
    // Single dot: thousands if followed by exactly 3 digits, else decimal
    if ((v.split(".")[1] || "").length === 3) v = v.replace(".", "");
  } else if (commaCount === 1 && dotCount === 0) {
    // Comma: decimal if ≤2 digits after, else thousands
    v = (v.split(",")[1] || "").length <= 2 ? v.replace(",", ".") : v.replace(",", "");
  }
  return parseFloat(v) || 0;
}

function calcGrandTotal(lines: LineItem[], lamTronCong: string, lamTronTru: string) {
  const sum = lines.reduce((acc, l) => acc + parseNum(l.thanhTien), 0);
  const adj = parseNum(lamTronCong) - parseNum(lamTronTru);
  const total = sum + adj;
  return total !== 0 ? total.toLocaleString("vi-VN") + " đ" : "0 đ";
}

function calcLamTron(cong: string, tru: string) {
  const v = parseNum(cong) - parseNum(tru);
  return v === 0 ? "0" : String(v);
}

type QrInfo = { facilityName: string; diaChuThu: string; khoiLuong: string; total: string };

export default function DonThuMuaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<PurchaseOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<OForm>(EMPTY_FORM);
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [lamTronCong, setLamTronCong] = useState("");
  const [lamTronTru, setLamTronTru] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [facilitySearch, setFacilitySearch] = useState("");
  const [facilityOpen, setFacilityOpen] = useState(false);
  const facilityRef = useRef<HTMLDivElement>(null);

  const [qrInfo, setQrInfo] = useState<QrInfo | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const [printTarget, setPrintTarget] = useState<PurchaseOrder | null>(null);
  const [printLines, setPrintLines] = useState<PurchaseOrderItem[]>([]);
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    if (!qrInfo) { setQrDataUrl(""); return; }
    const content = `Tên hộ: ${qrInfo.facilityName}\nĐịa chỉ: ${qrInfo.diaChuThu}\nKhối lượng: ${qrInfo.khoiLuong} kg\nTổng tiền: ${qrInfo.total}`;
    QRCode.toDataURL(content, { width: 260, margin: 2, color: { dark: "#1a1a1a" } })
      .then(setQrDataUrl).catch(() => {});
  }, [qrInfo]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (facilityRef.current && !facilityRef.current.contains(e.target as Node)) {
        setFacilityOpen(false);
      }
    }
    if (facilityOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [facilityOpen]);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["purchase-orders"], queryFn: fetchPurchaseOrders });
  const teaVarietiesQ = useQuery({ queryKey: ["tea-varieties"], queryFn: fetchTeaVarieties });
  const gradesQ = useQuery({ queryKey: ["grades"], queryFn: fetchGrades });
  const qlQ = useQuery({ queryKey: ["quality-levels"], queryFn: fetchQualityLevels });
  const facilitiesQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });

  function inv() { qc.invalidateQueries({ queryKey: ["purchase-orders"] }); }

  const createMu = useMutation({
    mutationFn: (payload: { order: OForm; lineItems: Omit<LineItem, "_key" | "teaVarietyId">[]; lamTron: string }) => {
      const { order, lineItems, lamTron } = payload;
      return createPurchaseOrder({ ...order, lamTron, total: calcGrandTotal(lines, lamTronCong, lamTronTru), lineItems });
    },
    onSuccess: (_data, payload) => {
      inv();
      const kl = payload.lineItems.reduce((acc, l) => acc + parseFloat(l.khoiLuong || "0"), 0);
      const total = calcGrandTotal(lines, lamTronCong, lamTronTru);
      setQrInfo({ facilityName: payload.order.facilityName, diaChuThu: payload.order.diaChuThu, khoiLuong: kl.toFixed(1), total });
      close_();
    },
    onError: (e: Error) => setErr(e.message),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { order: OForm; lineItems: Omit<LineItem, "_key" | "teaVarietyId">[]; lamTron: string } }) => {
      const { order, lineItems, lamTron } = payload;
      return updatePurchaseOrder(id, { ...order, lamTron, total: calcGrandTotal(lines, lamTronCong, lamTronTru), lineItems });
    },
    onSuccess: (_data, { payload }) => {
      inv();
      const kl = payload.lineItems.reduce((acc, l) => acc + parseFloat(l.khoiLuong || "0"), 0);
      const total = calcGrandTotal(lines, lamTronCong, lamTronTru);
      setQrInfo({ facilityName: payload.order.facilityName, diaChuThu: payload.order.diaChuThu, khoiLuong: kl.toFixed(1), total });
      close_();
    },
    onError: (e: Error) => setErr(e.message),
  });
  const deleteMu = useMutation({
    mutationFn: (id: number) => deletePurchaseOrder(id),
    onSuccess: () => { inv(); setDeleteTarget(null); },
  });

  function close_() {
    setDrawerOpen(false); setEditItem(null); setForm(EMPTY_FORM()); setLines([emptyLine()]);
    setLamTronCong(""); setLamTronTru(""); setErr(null);
    setFacilitySearch(""); setFacilityOpen(false);
  }

  function openEdit(o: PurchaseOrder) {
    setEditItem(o);
    setForm({
      maPhieu: o.maPhieu, enterpriseId: o.enterpriseId, facilityId: o.facilityId,
      facilityName: o.facilityName, diaChuThu: o.diaChuThu ?? "", maLoMe: o.maLoMe ?? "",
      ngayThu: o.ngayThu, status: o.status, notes: o.notes,
    });
    const lamTron = parseNum(o.lamTron ?? "0");
    if (lamTron > 0) { setLamTronCong(String(lamTron)); setLamTronTru(""); }
    else if (lamTron < 0) { setLamTronTru(String(Math.abs(lamTron))); setLamTronCong(""); }
    else { setLamTronCong(""); setLamTronTru(""); }
    setLines([emptyLine()]);
    setErr(null);
    setDrawerOpen(true);
    fetchPurchaseOrder(o.id)
      .then(({ lineItems }) => {
        if (lineItems && lineItems.length > 0)
          setLines(lineItems.map(li => ({ ...li, _key: String(Date.now() + Math.random()), teaVarietyId: null })));
      })
      .catch(() => {});
  }

  function setF<K extends keyof OForm>(k: K, v: OForm[K]) { setForm(p => ({ ...p, [k]: v })); }

  function selectFacility(id: number | null) {
    const fac = (facilitiesQ.data?.items ?? []).find(f => f.id === id);
    setForm(p => ({
      ...p,
      facilityId: id,
      facilityName: fac?.name ?? "",
      diaChuThu: fac?.address ?? "",
      maLoMe: genMaLoMe(fac?.code ?? "", p.ngayThu),
    }));
    setFacilitySearch("");
    setFacilityOpen(false);
  }

  function setNgayThu(v: string) {
    setForm(p => ({
      ...p,
      ngayThu: v,
      maLoMe: genMaLoMe(
        (facilitiesQ.data?.items ?? []).find(f => f.id === p.facilityId)?.code ?? "",
        v
      ),
    }));
  }

  const grades = gradesQ.data?.items ?? [];
  const teaVarieties = teaVarietiesQ.data?.items ?? [];

  function getFilteredGrades(line: LineItem): Grade[] {
    if (!line.teaVarietyId) return grades;
    const variety = teaVarieties.find(v => v.id === line.teaVarietyId);
    if (!variety?.productName) return grades;
    const filtered = grades.filter(g => g.loaiChe === variety.productName);
    return filtered.length > 0 ? filtered : grades;
  }

  function updateLine(key: string, field: keyof LineItem | "teaVarietyId", value: unknown) {
    setLines(prev => prev.map(l => {
      if (l._key !== key) return l;
      const updated = { ...l, [field]: value };

      if (field === "teaVarietyId") {
        if (value) {
          const variety = teaVarieties.find(v => v.id === Number(value));
          if (variety) {
            updated.productName = variety.name;
            updated.productId = null;
            if (variety.productName) {
              const filteredG = grades.filter(g => g.loaiChe === variety.productName);
              if (filteredG.length === 1) {
                updated.gradeId = filteredG[0].id;
                updated.gradeName = filteredG[0].name;
                updated.qualityPercent = "";
                updated.ghiChu = "";
              } else {
                updated.gradeId = null;
                updated.gradeName = "";
                updated.qualityPercent = "";
                updated.ghiChu = "";
              }
            }
          }
        } else {
          updated.productName = "";
          updated.productId = null;
          updated.gradeId = null;
          updated.gradeName = "";
        }
      }

      if (field === "gradeId") {
        if (value) {
          const g = grades.find(g => g.id === Number(value));
          if (g) {
            updated.gradeName = g.name;
            updated.qualityPercent = "";
            updated.ghiChu = "";
          }
        } else {
          updated.gradeName = "";
          updated.donGia = "";
        }
      }

      if (field === "qualityPercent") {
        const ql = (qlQ.data?.items ?? []).find(q => q.gradeId === updated.gradeId && q.danhGia === String(value));
        if (ql) {
          updated.ghiChu = ql.ghiChu;
        } else if (!value) {
          updated.ghiChu = "";
        }
      }

      if (field === "khoiLuong" || field === "donGia") {
        const kg = parseNum(field === "khoiLuong" ? String(value) : updated.khoiLuong);
        const dg = parseNum(field === "donGia" ? String(value) : updated.donGia);
        if (kg > 0 && dg > 0) updated.thanhTien = (kg * dg).toLocaleString("vi-VN") + " đ";
        else updated.thanhTien = "";
      }

      if (field === "gradeId" || field === "qualityPercent") {
        const kg = parseNum(updated.khoiLuong);
        const dg = parseNum(updated.donGia);
        if (kg > 0 && dg > 0) updated.thanhTien = (kg * dg).toLocaleString("vi-VN") + " đ";
      }

      return updated;
    }));
  }

  function handleSubmit() {
    setErr(null);
    if (!form.ngayThu) { setErr("Vui lòng chọn ngày thu."); return; }
    if (!form.facilityId) { setErr("Vui lòng chọn cơ sở thu mua."); return; }
    const validLines = lines.filter(l => l.gradeId || l.productName.trim());
    if (validLines.length === 0) { setErr("Vui lòng thêm ít nhất một sản phẩm thu mua."); return; }
    const lineItems = validLines.map(({ _key, teaVarietyId, ...rest }) => rest);
    const lamTron = calcLamTron(lamTronCong, lamTronTru);
    if (editItem) updateMu.mutate({ id: editItem.id, payload: { order: form, lineItems, lamTron } });
    else createMu.mutate({ order: form, lineItems, lamTron });
  }

  async function openPrint(o: PurchaseOrder) {
    setPrintTarget(o);
    setPrintLines([]);
    setPrintLoading(true);
    try {
      const { lineItems } = await fetchPurchaseOrder(o.id);
      setPrintLines(lineItems ?? []);
    } catch {
      setPrintLines([]);
    } finally {
      setPrintLoading(false);
    }
  }

  function doPrint() {
    window.print();
  }

  const items = listQ.data?.items ?? [];
  const filtered = items.filter(o => {
    if (search.trim() && ![o.facilityName, o.maLoMe ?? "", o.maPhieu].some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (dateFrom && o.ngayThu < dateFrom) return false;
    if (dateTo && o.ngayThu > dateTo) return false;
    return true;
  });
  const isPending = createMu.isPending || updateMu.isPending;
  const qualityLevels = qlQ.data?.items ?? [];
  const allFacilities = facilitiesQ.data?.items ?? [];
  const filteredFacilities = facilitySearch.trim()
    ? allFacilities.filter(f => f.name.toLowerCase().includes(facilitySearch.toLowerCase()) || f.code.toLowerCase().includes(facilitySearch.toLowerCase()))
    : allFacilities;

  const selectedFacility = allFacilities.find(f => f.id === form.facilityId);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">ERP / Thu mua</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Đơn Thu mua Chè</h1>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm cơ sở, mã lô…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground whitespace-nowrap">Từ</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-10 px-2 rounded-lg border border-border text-[13px] outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground whitespace-nowrap">đến</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-10 px-2 rounded-lg border border-border text-[13px] outline-none focus:border-primary" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="h-8 px-2 rounded-lg border border-border text-[12px] hover:bg-muted text-muted-foreground">Xóa lọc</button>
          )}
          <div className="flex-1" />
          <button onClick={() => setDrawerOpen(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110">
            <Plus className="w-4 h-4" /> Tạo phiếu thu mua
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3">Ngày thu mua</th>
                  <th className="px-4 py-3">Cơ sở thu mua</th>
                  <th className="px-4 py-3">Mã lô mẻ</th>
                  <th className="px-4 py-3">Khối lượng</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>}
                {!listQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <ShoppingBasket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search || dateFrom || dateTo ? "Không tìm thấy phiếu phù hợp." : "Chưa có phiếu thu mua nào."}
                  </td></tr>
                )}
                {filtered.map(o => (
                  <tr key={o.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3 font-medium">{fmtDate(o.ngayThu)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[13px]">{o.facilityName || "—"}</div>
                      {o.diaChuThu && <div className="text-[11.5px] text-muted-foreground">{o.diaChuThu}</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-mono">{o.maLoMe || "—"}</td>
                    <td className="px-4 py-3 text-[13px]">
                      {o.khoiLuongTong && o.khoiLuongTong !== "0"
                        ? <span className="font-semibold text-sky-700">{parseFloat(o.khoiLuongTong).toLocaleString("vi-VN")} kg</span>
                        : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{o.total || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const kl = o.khoiLuongTong && o.khoiLuongTong !== "0" ? parseFloat(o.khoiLuongTong).toFixed(1) : "?";
                            setQrInfo({ facilityName: o.facilityName, diaChuThu: o.diaChuThu, khoiLuong: kl, total: o.total });
                          }}
                          className="p-1.5 rounded hover:bg-blue-50" title="Xem QR"
                        >
                          <QrCode className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => openPrint(o)} className="p-1.5 rounded hover:bg-amber-50" title="In phiếu"><Printer className="w-4 h-4 text-amber-600" /></button>
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded hover:bg-muted" title="Sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded hover:bg-rose-50" title="Xóa"><X className="w-4 h-4 text-muted-foreground hover:text-rose-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-[13px] text-muted-foreground">{filtered.length} / {items.length} phiếu</div>
        </div>
      </div>

      {/* QR Modal */}
      {qrInfo && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-semibold flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" /> Mã QR phiếu thu mua</h3>
              <button onClick={() => setQrInfo(null)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 rounded-xl" />
              ) : (
                <div className="w-52 h-52 rounded-xl bg-muted flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              )}
              <div className="w-full space-y-1.5 text-[13px]">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Tên hộ:</span>
                  <span className="font-medium">{qrInfo.facilityName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Địa chỉ:</span>
                  <span className="font-medium">{qrInfo.diaChuThu || "—"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Khối lượng:</span>
                  <span className="font-semibold text-sky-700">{qrInfo.khoiLuong} kg</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground w-24 shrink-0">Tổng tiền:</span>
                  <span className="font-semibold text-emerald-700">{qrInfo.total}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setQrInfo(null)} className="mt-5 w-full h-10 rounded-xl bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110">Đóng</button>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printTarget && (
        <>
          <style>{`
            @media print {
              body > *:not(#print-overlay) { display: none !important; }
              #print-overlay { position: fixed !important; inset: 0 !important; background: white !important; z-index: 9999 !important; display: block !important; }
              #print-modal-actions { display: none !important; }
              #print-area { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 24px !important; }
            }
          `}</style>
          <div id="print-overlay" className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div id="print-modal-actions" className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
                <h3 className="text-[16px] font-semibold flex items-center gap-2"><Printer className="w-4 h-4 text-amber-600" /> Xem trước phiếu thu mua</h3>
                <div className="flex items-center gap-2">
                  <button onClick={doPrint} className="h-9 px-4 rounded-lg bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" /> In phiếu
                  </button>
                  <button onClick={() => setPrintTarget(null)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              </div>

              <div className="overflow-auto flex-1 p-4">
                {printLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : (
                  <div id="print-area" className="bg-white border border-border rounded-xl p-6 font-sans text-sm" style={{ minWidth: 480 }}>
                    {/* Header */}
                    <div className="text-center mb-5">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">Chè Quân Chu</div>
                      <h1 className="text-[20px] font-bold uppercase tracking-wide">Phiếu Thu Mua Chè</h1>
                      <div className="text-[12px] text-muted-foreground mt-0.5">Mã phiếu: <span className="font-mono font-semibold text-foreground">{printTarget.maPhieu}</span></div>
                    </div>

                    <div className="border-t border-b border-gray-300 py-3 mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-28 shrink-0">Ngày thu mua:</span>
                        <span className="font-semibold">{fmtDate(printTarget.ngayThu)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-28 shrink-0">Mã lô mẻ:</span>
                        <span className="font-mono font-semibold">{printTarget.maLoMe || "—"}</span>
                      </div>
                      <div className="flex gap-2 col-span-2">
                        <span className="text-muted-foreground w-28 shrink-0">Cơ sở thu mua:</span>
                        <span className="font-semibold">{printTarget.facilityName || "—"}</span>
                      </div>
                      <div className="flex gap-2 col-span-2">
                        <span className="text-muted-foreground w-28 shrink-0">Địa chỉ:</span>
                        <span>{printTarget.diaChuThu || "—"}</span>
                      </div>
                      {printTarget.notes && (
                        <div className="flex gap-2 col-span-2">
                          <span className="text-muted-foreground w-28 shrink-0">Ghi chú:</span>
                          <span>{printTarget.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Line items table */}
                    <table className="w-full text-[12.5px] border-collapse mb-4">
                      <thead>
                        <tr className="border-b-2 border-gray-400">
                          <th className="text-left py-1.5 pr-2 font-semibold">Quy cách</th>
                          <th className="text-center py-1.5 px-2 font-semibold">% CL</th>
                          <th className="text-right py-1.5 px-2 font-semibold">KL (kg)</th>
                          <th className="text-right py-1.5 px-2 font-semibold">Đơn giá</th>
                          <th className="text-right py-1.5 pl-2 font-semibold">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printLines.length === 0 && (
                          <tr><td colSpan={5} className="py-3 text-center text-muted-foreground text-[12px]">Không có dòng sản phẩm</td></tr>
                        )}
                        {printLines.map((l, i) => (
                          <tr key={i} className="border-b border-gray-200">
                            <td className="py-1.5 pr-2">{l.gradeName || l.productName || "—"}</td>
                            <td className="py-1.5 px-2 text-center">{l.qualityPercent || "—"}</td>
                            <td className="py-1.5 px-2 text-right">{l.khoiLuong ? parseFloat(l.khoiLuong).toLocaleString("vi-VN") : "—"}</td>
                            <td className="py-1.5 px-2 text-right">{l.donGia ? parseNum(l.donGia).toLocaleString("vi-VN") + " đ" : "—"}</td>
                            <td className="py-1.5 pl-2 text-right font-semibold">{l.thanhTien || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-t border-gray-300 pt-3 space-y-1 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng khối lượng:</span>
                        <span className="font-semibold text-sky-700">
                          {printTarget.khoiLuongTong && printTarget.khoiLuongTong !== "0"
                            ? parseFloat(printTarget.khoiLuongTong).toLocaleString("vi-VN") + " kg"
                            : "—"}
                        </span>
                      </div>
                      {printTarget.lamTron && printTarget.lamTron !== "0" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tiền lẻ điều chỉnh:</span>
                          <span className={parseNum(printTarget.lamTron) >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {parseNum(printTarget.lamTron) >= 0 ? "+" : ""}{parseNum(printTarget.lamTron).toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-[14px] font-bold border-t border-gray-400 pt-2 mt-1">
                        <span>Tổng cộng:</span>
                        <span className="text-emerald-700">{printTarget.total || "—"}</span>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 mt-8 text-[12.5px]">
                      <div className="text-center">
                        <div className="font-semibold mb-1">Người bán</div>
                        <div className="text-muted-foreground text-[11px] mb-10">(Ký, ghi rõ họ tên)</div>
                        <div className="border-t border-gray-400 pt-1 text-muted-foreground text-[11px]">{printTarget.facilityName}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold mb-1">Người mua</div>
                        <div className="text-muted-foreground text-[11px] mb-10">(Ký, ghi rõ họ tên)</div>
                        <div className="border-t border-gray-400 pt-1 text-muted-foreground text-[11px]">Chè Quân Chu</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><X className="w-5 h-5 text-rose-600" /></div>
            <h3 className="text-[16px] font-semibold text-center mb-1">Xóa phiếu thu mua?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">Ngày <span className="font-semibold text-foreground">{fmtDate(deleteTarget.ngayThu)}</span> — {deleteTarget.facilityName}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button disabled={deleteMu.isPending} onClick={() => deleteMu.mutate(deleteTarget.id)} className="flex-1 h-10 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={close_} />
          <aside className="fixed top-0 right-0 h-full w-full lg:w-[680px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="text-[18px] font-semibold">{editItem ? "Sửa phiếu thu mua" : "Tạo phiếu thu mua"}</div>
              <button onClick={close_} className="p-1.5 rounded hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              {/* Header fields */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Ngày thu mua <span className="text-rose-500">*</span></label>
                    <input type="date" value={form.ngayThu} onChange={e => setNgayThu(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Cơ sở thu mua <span className="text-rose-500">*</span></label>
                    <div className="relative" ref={facilityRef}>
                      <div
                        className={`w-full h-10 px-3 pr-8 rounded-lg border text-sm bg-white flex items-center cursor-pointer ${facilityOpen ? "border-primary" : "border-border"}`}
                        onClick={() => setFacilityOpen(p => !p)}
                      >
                        <span className={selectedFacility ? "text-foreground truncate" : "text-muted-foreground/70 truncate"}>
                          {selectedFacility ? `${selectedFacility.name}${selectedFacility.code ? ` (${selectedFacility.code})` : ""}` : "-- Chọn cơ sở / hộ --"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 transition-transform ${facilityOpen ? "rotate-180" : ""}`} />
                      </div>
                      {facilityOpen && (
                        <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-border shadow-lg overflow-hidden">
                          <div className="p-2">
                            <input
                              autoFocus
                              value={facilitySearch}
                              onChange={e => setFacilitySearch(e.target.value)}
                              placeholder="Tìm cơ sở…"
                              className="w-full h-8 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {filteredFacilities.length === 0 && (
                              <div className="px-3 py-4 text-[13px] text-muted-foreground text-center">Không tìm thấy</div>
                            )}
                            {filteredFacilities.map(f => (
                              <div
                                key={f.id}
                                onClick={() => selectFacility(f.id)}
                                className={`px-3 py-2.5 text-[13px] cursor-pointer hover:bg-muted border-t border-border/50 first:border-0 ${form.facilityId === f.id ? "bg-primary/10 text-primary font-medium" : ""}`}
                              >
                                <div>{f.name}{f.code ? ` (${f.code})` : ""}</div>
                                {f.address && <div className="text-[11px] text-muted-foreground">{f.address}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {form.facilityId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Địa chỉ thu mua
                      </label>
                      <input
                        value={form.diaChuThu}
                        onChange={e => setF("diaChuThu", e.target.value)}
                        placeholder="Tự điền từ cơ sở…"
                        className="w-full h-10 px-3 rounded-lg border border-border text-[13px] outline-none focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1.5">Mã lô mẻ</label>
                      <input
                        value={form.maLoMe}
                        onChange={e => setF("maLoMe", e.target.value)}
                        placeholder="CS001-20260506"
                        className="w-full h-10 px-3 rounded-lg border border-border text-[13px] outline-none focus:border-primary bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium mb-1.5">Ghi chú</label>
                  <input value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Ghi chú…" className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white" />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-3">
                <div className="text-[14px] font-semibold">Danh sách sản phẩm thu mua</div>

                {lines.map((line, idx) => {
                  const filteredGrades = getFilteredGrades(line);
                  const linkedQls = qualityLevels.filter(q => q.gradeId === line.gradeId || q.gradeId === null);

                  return (
                    <div key={line._key} className="rounded-xl border border-border bg-white overflow-hidden">
                      <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-muted-foreground">Sản phẩm #{idx + 1}</span>
                        {lines.length > 1 && (
                          <button onClick={() => setLines(p => p.filter(l => l._key !== line._key))} className="p-1 rounded hover:bg-rose-50">
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        {/* Row 1: Giống chè + Quy cách */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Giống chè</label>
                            <select
                              value={line.teaVarietyId ?? ""}
                              onChange={e => updateLine(line._key, "teaVarietyId", e.target.value ? Number(e.target.value) : null)}
                              className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none bg-white"
                            >
                              <option value="">-- Chọn giống chè --</option>
                              {teaVarieties.map(v => <option key={v.id} value={v.id}>{v.name}{v.code ? ` (${v.code})` : ""}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Quy cách <span className="text-rose-500">*</span></label>
                            <select
                              value={line.gradeId ?? ""}
                              onChange={e => updateLine(line._key, "gradeId", e.target.value ? Number(e.target.value) : null)}
                              className={`w-full h-9 px-2.5 rounded-lg border text-[13px] outline-none bg-white ${!line.gradeId ? "border-amber-300" : "border-border"}`}
                            >
                              <option value="">-- Chọn quy cách --</option>
                              {filteredGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Row 2: % Chất lượng */}
                        <div>
                          <label className="block text-[12px] font-medium mb-1 text-muted-foreground">% Chất lượng <span className="text-[11px] text-muted-foreground/70">(không bắt buộc)</span></label>
                          <select
                            value={line.qualityPercent}
                            onChange={e => updateLine(line._key, "qualityPercent", e.target.value)}
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none bg-white"
                          >
                            <option value="">-- Không áp dụng --</option>
                            {linkedQls.map(q => (
                              <option key={q.id} value={q.danhGia}>
                                {q.danhGia}{q.ghiChu ? ` — ${q.ghiChu}` : ""}
                              </option>
                            ))}
                          </select>
                          {line.ghiChu && (
                            <div className="mt-1 text-[11.5px] text-blue-600 font-medium flex items-center gap-1">
                              {line.ghiChu}
                            </div>
                          )}
                        </div>

                        {/* Row 3: Đơn giá */}
                        <div>
                          <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Đơn giá (đ/kg)</label>
                          <input
                            value={line.donGia}
                            onChange={e => updateLine(line._key, "donGia", e.target.value)}
                            placeholder="Nhập đơn giá…"
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                          />
                        </div>

                        {/* Row 4: Khối lượng + Thành tiền */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Khối lượng (kg)</label>
                            <input
                              value={line.khoiLuong}
                              onChange={e => updateLine(line._key, "khoiLuong", e.target.value)}
                              placeholder="0"
                              className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Thành tiền</label>
                            <div className="w-full h-9 px-2.5 rounded-lg border border-border bg-emerald-50/60 text-[13px] font-semibold text-emerald-700 flex items-center">
                              {line.thanhTien || "—"}
                            </div>
                          </div>
                        </div>

                        {/* Row 5: Mô tả */}
                        <div>
                          <label className="block text-[12px] font-medium mb-1 text-muted-foreground">Mô tả / Ghi chú chất lượng</label>
                          <input
                            value={line.moTa}
                            onChange={e => updateLine(line._key, "moTa", e.target.value)}
                            placeholder="Mô tả thêm về lô hàng…"
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Tổng kết */}
              <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
                <div className="text-[13.5px] font-semibold mb-2">Tổng kết phiếu</div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Tổng khối lượng:</span>
                  <span className="font-semibold text-sky-700">
                    {(() => {
                      const total = lines.reduce((acc, l) => acc + parseFloat(l.khoiLuong || "0"), 0);
                      return total > 0 ? total.toLocaleString("vi-VN") + " kg" : "0 kg";
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Tổng tiền hàng:</span>
                  <span className="font-semibold text-emerald-700">
                    {(() => {
                      const sum = lines.reduce((acc, l) => acc + parseNum(l.thanhTien), 0);
                      return sum > 0 ? sum.toLocaleString("vi-VN") + " đ" : "0 đ";
                    })()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-muted-foreground">Tiền lẻ điều chỉnh:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] text-muted-foreground mb-1">Trừ (−)</label>
                      <input
                        value={lamTronTru}
                        onChange={e => { setLamTronTru(e.target.value); if (e.target.value) setLamTronCong(""); }}
                        placeholder="0"
                        className="w-full h-9 px-2.5 rounded-lg border border-rose-200 bg-rose-50/40 text-[13px] outline-none focus:border-rose-400 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-muted-foreground mb-1">Cộng (+)</label>
                      <input
                        value={lamTronCong}
                        onChange={e => { setLamTronCong(e.target.value); if (e.target.value) setLamTronTru(""); }}
                        placeholder="0"
                        className="w-full h-9 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 text-[13px] outline-none focus:border-emerald-400 text-right"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[14px] font-bold border-t border-border pt-3">
                  <span>Tổng cộng:</span>
                  <span className="text-emerald-700">{calcGrandTotal(lines, lamTronCong, lamTronTru)}</span>
                </div>
              </div>

              {err && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{err}</div>}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={close_} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button disabled={isPending} onClick={handleSubmit} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Tạo phiếu"}
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
