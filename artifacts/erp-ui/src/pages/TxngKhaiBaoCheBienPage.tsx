import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import QRCode from "qrcode";
import {
  Factory, ArrowLeft, ChevronRight, Check, ImageIcon,
  QrCode, Download, Printer, ChevronDown, X, Info,
  CheckCircle2, Plus, Trash2, Package, RefreshCw, Tag,
} from "lucide-react";
import { fetchFacilities, fetchProducts, type Facility, type Product } from "@/lib/api";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function genLotCode(productCode: string, date: string) {
  const seq = String(Math.floor(Math.random() * 90) + 10);
  const abbr = (productCode || "CB").substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const d = date ? date.replace(/-/g, "").slice(2) : "000000";
  return `LOT${seq}-${abbr}-${d}`;
}

const MOCK_INPUT_LOTS = [
  {
    id: "L001",
    maLo: "LOT11-SHAN-240609",
    tenThuongPham: "Chè Shan Tuyết tươi",
    soLuongMax: 50,
    donVi: "Hộp",
    serials: Array.from({ length: 50 }, (_, i) => `SN-A${String(i + 1).padStart(3, "0")}`),
  },
  {
    id: "L002",
    maLo: "LOT08-TANT-240608",
    tenThuongPham: "Chè Tân Trào tươi",
    soLuongMax: 10,
    donVi: "Hộp",
    serials: Array.from({ length: 10 }, (_, i) => `SN-B${String(i + 1).padStart(3, "0")}`),
  },
  {
    id: "L003",
    maLo: "LOT03-KHOL-240607",
    tenThuongPham: "Chè Khô (bulk)",
    soLuongMax: 200,
    donVi: "Kg",
    serials: [],
  },
];

type SelectedInputLot = {
  lotId: string;
  maLo: string;
  tenThuongPham: string;
  coSoName: string;
  soLuongMax: number;
  donVi: string;
  soLuongSuDung: string;
  serials: string[];
  serialQuantities: Record<string, string>;
  expandedSerials: boolean;
};

type OutputProduct = {
  key: string;
  productId: string;
  tonKho: "khoi-luong" | "so-luong";
  khoiLuong: string;
  donViKL: string;
  soLuong: string;
  donViSL: string;
  loThuongPham: string;
  hanSuDung: string;
  xuatMaDonLe: boolean;
};

type LotRow = { id: string; maLo: string; tenThuongPham: string; soLuong: number; donVi: string; serials: string[] };
type TemAssign = { loTem: string; seriDau: string; seriCuoi: string; ganTemLo: boolean };
type SerialTemAssign = { loTem: string; seriDau: string; seriCuoi: string; trangThai: 'tu-dong' | 'thu-cong' | 'chua-gan' };

const LOT_TEM_OPTIONS = ["LT-ESG-001", "LT-ESG-002", "LT-ESG-003", "LT-ESG-004"];

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Khai báo chế biến", "QR định danh", "Kích hoạt tem"];
  return (
    <div className="flex items-stretch bg-white border border-border rounded-xl overflow-hidden mb-4">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const isActive = step === n;
        const isDone = step > n;
        return (
          <div
            key={n}
            className={`flex-1 flex items-center gap-2.5 px-4 py-3 border-b-2 transition-colors ${
              isActive ? "border-amber-500 bg-amber-50/60" : isDone ? "border-green-500 bg-green-50/30" : "border-transparent"
            } ${n < 3 ? "border-r border-r-border" : ""}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive ? "bg-amber-500 text-white" : isDone ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : n}
            </span>
            <span className={`text-[13px] font-medium ${isActive ? "text-amber-700" : isDone ? "text-green-700" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TxngKhaiBaoCheBienPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [coSoId, setCoSoId] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [nguoiThucHien, setNguoiThucHien] = useState(user?.name || "");
  const [ngayCheBien, setNgayCheBien] = useState(todayStr());

  const [selectedInputLots, setSelectedInputLots] = useState<SelectedInputLot[]>([]);
  const [lotDropdownVal, setLotDropdownVal] = useState("");

  const [outputProducts, setOutputProducts] = useState<OutputProduct[]>([]);

  const [lots, setLots] = useState<LotRow[]>([]);
  const [expandedLots, setExpandedLots] = useState<Set<string>>(new Set());
  const [qrLot, setQrLot] = useState<LotRow | null>(null);
  const [qrSerial, setQrSerial] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const [temAssigns, setTemAssigns] = useState<Map<string, TemAssign>>(new Map());
  const [confirmed, setConfirmed] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [serialTemMap, setSerialTemMap] = useState<Map<string, Map<string, SerialTemAssign>>>(new Map());
  const [modalLot, setModalLot] = useState<LotRow | null>(null);
  const [modalLotLoTem, setModalLotLoTem] = useState("");
  const [modalLotSeriDau, setModalLotSeriDau] = useState("");
  const [modalGanTemLo, setModalGanTemLo] = useState(false);
  const [modalTabFilter, setModalTabFilter] = useState<'all' | 'da-gan' | 'chua-gan'>('all');

  const { data: facilitiesData } = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const { data: productsData } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const facilities = (facilitiesData as { items: Facility[] } | undefined)?.items ?? [];
  const products = (productsData as { items: Product[] } | undefined)?.items ?? [];

  useEffect(() => {
    const f = facilities.find((f) => String(f.id) === coSoId);
    setDiaChi(f?.address ?? "");
  }, [coSoId, facilities]);

  useEffect(() => {
    const text = qrSerial ?? qrLot?.maLo ?? "";
    if (!text) { setQrDataUrl(""); return; }
    QRCode.toDataURL(text, { width: 128, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [qrLot, qrSerial]);

  const availableInputLots = MOCK_INPUT_LOTS.filter(
    (l) => !selectedInputLots.find((s) => s.lotId === l.id)
  );

  function addInputLot(lotId: string) {
    const lot = MOCK_INPUT_LOTS.find((l) => l.id === lotId);
    if (!lot) return;
    const coSo = facilities.find((f) => String(f.id) === coSoId);
    setSelectedInputLots((prev) => [
      ...prev,
      {
        lotId: lot.id,
        maLo: lot.maLo,
        tenThuongPham: lot.tenThuongPham,
        coSoName: coSo?.name || "",
        soLuongMax: lot.soLuongMax,
        donVi: lot.donVi,
        soLuongSuDung: "",
        serials: lot.serials,
        serialQuantities: {},
        expandedSerials: false,
      },
    ]);
  }

  function removeInputLot(lotId: string) {
    setSelectedInputLots((prev) => prev.filter((l) => l.lotId !== lotId));
  }

  function updateInputLot(lotId: string, updates: Partial<SelectedInputLot>) {
    setSelectedInputLots((prev) =>
      prev.map((l) => (l.lotId === lotId ? { ...l, ...updates } : l))
    );
  }

  function addOutputProduct(productId?: string) {
    const key = String(Date.now());
    const product = productId ? products.find((p) => String(p.id) === productId) : undefined;
    setOutputProducts((prev) => [
      ...prev,
      {
        key,
        productId: productId || "",
        tonKho: "khoi-luong",
        khoiLuong: "",
        donViKL: "Kg",
        soLuong: "",
        donViSL: product?.unitName || "Cái",
        loThuongPham: product ? genLotCode(product.code || "SP", ngayCheBien) : "",
        hanSuDung: "",
        xuatMaDonLe: false,
      },
    ]);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeOutputProduct(key: string) {
    setOutputProducts((prev) => prev.filter((p) => p.key !== key));
  }

  function updateOutputProduct(key: string, updates: Partial<OutputProduct>) {
    setOutputProducts((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const updated = { ...p, ...updates };
        if ((updates.productId !== undefined || updates.tonKho !== undefined) && updated.productId) {
          const product = products.find((pr) => String(pr.id) === updated.productId);
          updated.loThuongPham = genLotCode(product?.code || "CB", ngayCheBien);
        }
        return updated;
      })
    );
  }

  function goToStep2() {
    const newLots: LotRow[] = outputProducts
      .filter((op) => op.productId)
      .map((op) => {
        const product = products.find((p) => String(p.id) === op.productId);
        const qty = parseInt(op.soLuong) || 1;
        return {
          id: op.loThuongPham || op.key,
          maLo: op.loThuongPham || genLotCode(product?.code || "CB", ngayCheBien),
          tenThuongPham: product?.name || "Không xác định",
          soLuong: qty,
          donVi: product?.unitName || "",
          serials: op.xuatMaDonLe ? Array.from({ length: Math.min(qty, 100) }, (_, i) => `SC-${String(i + 1).padStart(3, "0")}`) : [],
        };
      });

    setLots(newLots);
    const assigns = new Map<string, TemAssign>();
    newLots.forEach((lot) => {
      assigns.set(lot.id, { loTem: "", seriDau: "1", seriCuoi: String(lot.soLuong), ganTemLo: false });
    });
    setTemAssigns(assigns);
    setStep(2);
  }

  function toggleExpand(lotId: string) {
    setExpandedLots((prev) => {
      const next = new Set(prev);
      next.has(lotId) ? next.delete(lotId) : next.add(lotId);
      return next;
    });
  }

  function updateTemAssign(lotId: string, updates: Partial<TemAssign>) {
    setTemAssigns((prev) => {
      const next = new Map(prev);
      const cur = next.get(lotId) || { loTem: "", seriDau: "1", seriCuoi: "1", ganTemLo: false };
      next.set(lotId, { ...cur, ...updates });
      return next;
    });
  }

  function openTemModal(lot: LotRow) {
    const assign = temAssigns.get(lot.id);
    setModalLotLoTem(assign?.loTem || "");
    setModalLotSeriDau(assign?.seriDau || "");
    setModalGanTemLo(assign?.ganTemLo || false);
    setModalTabFilter("all");
    setSerialTemMap((prev) => {
      if (prev.has(lot.id)) return prev;
      const map = new Map<string, SerialTemAssign>();
      lot.serials.forEach((s) => map.set(s, { loTem: "", seriDau: "", seriCuoi: "", trangThai: "chua-gan" }));
      const next = new Map(prev);
      next.set(lot.id, map);
      return next;
    });
    setModalLot(lot);
  }

  function handleAutoDistribute() {
    if (!modalLot || !modalLotLoTem || !modalLotSeriDau) return;
    const startSeri = parseInt(modalLotSeriDau);
    if (isNaN(startSeri)) return;
    const newMap = new Map<string, SerialTemAssign>();
    modalLot.serials.forEach((serial, i) => {
      const seriNum = startSeri + i;
      newMap.set(serial, { loTem: modalLotLoTem, seriDau: String(seriNum), seriCuoi: String(seriNum), trangThai: "tu-dong" });
    });
    setSerialTemMap((prev) => { const next = new Map(prev); next.set(modalLot!.id, newMap); return next; });
    updateTemAssign(modalLot.id, {
      loTem: modalLotLoTem,
      seriDau: modalLotSeriDau,
      seriCuoi: String(startSeri + modalLot.serials.length - 1),
    });
  }

  function updateSerialTem(serial: string, updates: Partial<SerialTemAssign>) {
    if (!modalLot) return;
    setSerialTemMap((prev) => {
      const next = new Map(prev);
      const lotMap = new Map(next.get(modalLot!.id) || []);
      const cur = lotMap.get(serial) || { loTem: "", seriDau: "", seriCuoi: "", trangThai: "chua-gan" as const };
      const updated = { ...cur, ...updates };
      if (!updates.trangThai) {
        updated.trangThai = updated.loTem && updated.seriDau ? "thu-cong" : "chua-gan";
      }
      lotMap.set(serial, updated as SerialTemAssign);
      next.set(modalLot!.id, lotMap);
      return next;
    });
  }

  function countGanForLot(lotId: string): number {
    const map = serialTemMap.get(lotId);
    if (!map) return 0;
    return Array.from(map.values()).filter((a) => a.loTem && a.seriDau).length;
  }

  const canProceed1 = selectedInputLots.length > 0 && outputProducts.some((p) => p.productId);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <button onClick={() => navigate("/module/txng")} className="hover:text-foreground transition">Truy xuất nguồn gốc</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate("/module/txng/khai-bao")} className="hover:text-foreground transition">Khai báo truy xuất</button>
          <ChevronRight className="w-3 h-3" />
          <span>Chế biến</span>
        </div>

        <h1 className="text-lg font-bold flex items-center gap-2">
          <Factory className="w-5 h-5 text-amber-600" />
          Khai báo chế biến
        </h1>

        <Stepper step={step} />

        {/* ═══════════════════════════════ STEP 1 ═══════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {/* ── LEFT: Image + Info ── */}
              <div className="w-56 shrink-0 space-y-3">
                <div
                  className="bg-white border border-border rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <div className="relative h-36">
                    {imageUrl ? (
                      <img src={imageUrl} className="w-full h-full object-cover" alt="facility" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[11px] font-medium">Thay đổi hình ảnh</span>
                    </div>
                  </div>
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

                <div className="bg-white border border-border rounded-xl p-3.5 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5 block">
                      Cơ sở <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={coSoId}
                      onChange={(e) => setCoSoId(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-green-400"
                    >
                      <option value="">— Chọn cơ sở —</option>
                      {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Địa chỉ</label>
                    <textarea
                      value={diaChi}
                      onChange={(e) => setDiaChi(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-white text-xs outline-none focus:border-green-400 resize-none"
                      placeholder="<địa chỉ cụ thể, xã/phường, quận/huyện, tỉnh/thành phố>"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5 block">
                      Người thực hiện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={nguoiThucHien}
                      onChange={(e) => setNguoiThucHien(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-green-400"
                      placeholder="Tự fill theo tên tài khoản"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5 block">
                      Thời gian thực hiện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={ngayCheBien}
                      onChange={(e) => setNgayCheBien(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-green-400"
                    />
                  </div>
                </div>
              </div>

              {/* ── MIDDLE: ĐẦU VÀO ── */}
              <div className="flex-1 bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-foreground leading-tight">ĐẦU VÀO</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">Nguyên liệu / Lô thành phẩm sử dụng</p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Tag multi-select cho lô */}
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-0.5">
                      Lô đầu vào <span className="text-rose-500">*</span>
                    </label>
                    <div className="min-h-[38px] border border-border rounded-lg bg-white px-2 py-1 flex flex-wrap gap-1.5 items-center">
                      {selectedInputLots.map((sl) => (
                        <span key={sl.lotId} className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-[11px] px-2 py-0.5 rounded-md font-medium">
                          {sl.maLo} ({sl.serials.length}/{sl.soLuongMax} Serial)
                          <button
                            onClick={() => removeInputLot(sl.lotId)}
                            className="text-green-500 hover:text-green-800 leading-none ml-0.5"
                          >×</button>
                        </span>
                      ))}
                      {availableInputLots.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) addInputLot(e.target.value); }}
                          className="flex-1 min-w-[120px] h-7 text-[12px] bg-transparent outline-none text-muted-foreground cursor-pointer"
                        >
                          <option value="">Chọn lô đầu vào...</option>
                          {availableInputLots.map((l) => (
                            <option key={l.id} value={l.id}>{l.maLo} ({l.soLuongMax} {l.donVi})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {selectedInputLots.length === 0 && (
                    <div className="py-6 text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[12px]">Chưa chọn lô nguyên liệu đầu vào</p>
                    </div>
                  )}

                  {/* Lot cards */}
                  <div className="space-y-3">
                    {selectedInputLots.map((sl, idx) => {
                      const totalSerial = sl.serials.reduce((sum, s) => sum + (parseFloat(sl.serialQuantities[s] || "0") || 0), 0);
                      const slSuDung = parseFloat(sl.soLuongSuDung) || 0;
                      const hasError = sl.serials.length > 0 && !!sl.soLuongSuDung && Math.abs(totalSerial - slSuDung) > 0.001;
                      return (
                        <div key={sl.lotId} className="border border-border rounded-xl overflow-hidden">
                          <div className="px-3 py-2 bg-muted/20 flex items-center gap-2.5 border-b border-border/60">
                            <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[12px] font-bold text-foreground">{sl.maLo}</p>
                              <p className="text-[10px] text-muted-foreground">{sl.tenThuongPham}{sl.coSoName ? ` - ${sl.coSoName}` : ""}</p>
                            </div>
                            <button onClick={() => removeInputLot(sl.lotId)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="px-3 py-2.5 space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-0.5">
                                Khối lượng / SL sử dụng <span className="text-rose-500">*</span>
                              </label>
                              <span className="text-[10px] text-muted-foreground">Tối đa: {sl.soLuongMax} {sl.donVi}</span>
                            </div>
                            <div className="flex">
                              <input
                                type="number"
                                value={sl.soLuongSuDung}
                                onChange={(e) => updateInputLot(sl.lotId, { soLuongSuDung: e.target.value })}
                                placeholder="0"
                                className={`min-w-0 flex-1 h-9 px-3 rounded-l-lg border border-r-0 text-sm outline-none focus:border-green-400 ${hasError ? "border-rose-400 bg-rose-50/50" : "border-border bg-white"}`}
                              />
                              <select className="h-9 w-20 px-1 rounded-r-lg border border-border bg-muted/20 text-[11px] outline-none shrink-0">
                                <option>{sl.donVi}</option>
                                <option>Kg</option>
                              </select>
                            </div>

                            {hasError && (
                              <p className="text-[11px] text-rose-600 leading-snug">
                                Lỗi: Tổng SL của Serial ({totalSerial} {sl.donVi}) phải bằng SL Lô cha sử dụng ({slSuDung} {sl.donVi}).
                              </p>
                            )}

                            {sl.serials.length > 0 && (
                              <div className="mt-1">
                                <button
                                  onClick={() => updateInputLot(sl.lotId, { expandedSerials: !sl.expandedSerials })}
                                  className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition"
                                >
                                  {sl.expandedSerials ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  <span className="uppercase tracking-wider text-[10px]">Mã đơn lẻ</span>
                                  {sl.expandedSerials && (
                                    <span className="ml-auto text-[10px] font-bold text-foreground">
                                      TỔNG: {totalSerial} {sl.donVi.toUpperCase()}
                                    </span>
                                  )}
                                </button>

                                {sl.expandedSerials && (
                                  <div className="border border-border rounded-lg overflow-hidden mt-1.5">
                                    <div className="px-3 py-1.5 bg-muted/30 border-b border-border flex justify-between items-center">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mã đơn lẻ</span>
                                      <span className="text-[10px] font-bold text-foreground">TỔNG: {totalSerial} {sl.donVi.toUpperCase()}</span>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto divide-y divide-border/50">
                                      {sl.serials.slice(0, 15).map((serial) => (
                                        <div key={serial} className="flex items-center gap-2 px-3 py-1.5">
                                          <span className="font-mono text-[11px] text-muted-foreground flex-1 truncate">{serial}</span>
                                          <input
                                            type="number"
                                            value={sl.serialQuantities[serial] || ""}
                                            onChange={(e) => updateInputLot(sl.lotId, { serialQuantities: { ...sl.serialQuantities, [serial]: e.target.value } })}
                                            placeholder="0"
                                            className="w-16 h-6 px-2 rounded border border-border bg-white text-[11px] text-center outline-none focus:border-green-400"
                                          />
                                          <span className="text-[10px] text-muted-foreground w-8 shrink-0">{sl.donVi}</span>
                                          <button className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                      {sl.serials.length > 15 && (
                                        <div className="px-3 py-1.5 text-[10px] text-muted-foreground italic">...và {sl.serials.length - 15} serial khác</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: ĐẦU RA ── */}
              <div className="flex-1 bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-foreground leading-tight">ĐẦU RA THƯƠNG PHẨM</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">Tối đa 5 thương phẩm</p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Tag multi-select cho thương phẩm */}
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-0.5">
                      Thương phẩm đầu ra <span className="text-rose-500">*</span>
                    </label>
                    <div className="min-h-[38px] border border-border rounded-lg bg-white px-2 py-1 flex flex-wrap gap-1.5 items-center">
                      {outputProducts.filter((op) => op.productId).map((op) => {
                        const p = products.find((pr) => String(pr.id) === op.productId);
                        return (
                          <span key={op.key} className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-[11px] px-2 py-0.5 rounded-md font-medium">
                            {p?.name || ""}
                            <button onClick={() => removeOutputProduct(op.key)} className="text-green-500 hover:text-green-800 leading-none ml-0.5">×</button>
                          </span>
                        );
                      })}
                      {outputProducts.length < 5 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            if (outputProducts.some((op) => op.productId === e.target.value)) return;
                            addOutputProduct(e.target.value);
                          }}
                          className="flex-1 min-w-[120px] h-7 text-[12px] bg-transparent outline-none text-muted-foreground cursor-pointer"
                        >
                          <option value="">Chọn thương phẩm...</option>
                          {products
                            .filter((p) => !outputProducts.some((op) => op.productId === String(p.id)))
                            .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  {outputProducts.length === 0 && (
                    <div className="py-6 text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[12px]">Chưa có thương phẩm đầu ra</p>
                    </div>
                  )}

                  {/* Product cards */}
                  <div className="space-y-3">
                    {outputProducts.map((op, idx) => {
                      const selectedProduct = products.find((p) => String(p.id) === op.productId);
                      return (
                        <div key={op.key} className="border border-border rounded-xl overflow-hidden">
                          <div className="px-3 py-2 bg-muted/20 flex items-center gap-2.5 border-b border-border/60">
                            <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                            <span className="flex-1 text-[12px] font-semibold text-foreground">{selectedProduct?.name || "—"}</span>
                            <button onClick={() => removeOutputProduct(op.key)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="px-3 py-2.5 space-y-2.5">
                            {/* Quy tắc tồn kho */}
                            <div>
                              <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">Quy tắc tồn kho</label>
                              <div className="flex gap-5">
                                {([["khoi-luong", "Theo Khối lượng"], ["so-luong", "Theo Số lượng"]] as const).map(([val, label]) => (
                                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="radio"
                                      checked={op.tonKho === val}
                                      onChange={() => updateOutputProduct(op.key, { tonKho: val })}
                                      className="accent-green-600 w-3.5 h-3.5"
                                    />
                                    <span className="text-[11px]">{label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* KL + SL */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5">
                                  Khối lượng <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex">
                                  <input
                                    type="number"
                                    value={op.khoiLuong}
                                    onChange={(e) => updateOutputProduct(op.key, { khoiLuong: e.target.value })}
                                    placeholder="0"
                                    className="min-w-0 flex-1 h-8 px-2 rounded-l-lg border border-r-0 border-border bg-white text-xs outline-none focus:border-green-400"
                                  />
                                  <select
                                    value={op.donViKL}
                                    onChange={(e) => updateOutputProduct(op.key, { donViKL: e.target.value })}
                                    className="h-8 w-16 px-1 rounded-r-lg border border-border bg-muted/20 text-[11px] outline-none"
                                  >
                                    <option>Kg</option>
                                    <option>Tấn</option>
                                    <option>G</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5">
                                  Số lượng <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex">
                                  <input
                                    type="number"
                                    value={op.soLuong}
                                    onChange={(e) => updateOutputProduct(op.key, { soLuong: e.target.value })}
                                    placeholder="0"
                                    className="min-w-0 flex-1 h-8 px-2 rounded-l-lg border border-r-0 border-border bg-white text-xs outline-none focus:border-green-400"
                                  />
                                  <select
                                    value={op.donViSL}
                                    onChange={(e) => updateOutputProduct(op.key, { donViSL: e.target.value })}
                                    className="h-8 w-20 px-1 rounded-r-lg border border-border bg-muted/20 text-[11px] outline-none"
                                  >
                                    <option>Cái</option>
                                    <option>Hộp</option>
                                    <option>Túi</option>
                                    <option>Thùng</option>
                                    {selectedProduct?.unitName && !["Cái","Hộp","Túi","Thùng"].includes(selectedProduct.unitName) && (
                                      <option>{selectedProduct.unitName}</option>
                                    )}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Lô thương phẩm */}
                            <div>
                              <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5">
                                Lô thương phẩm <span className="text-rose-500">*</span>
                              </label>
                              <input
                                value={op.loThuongPham}
                                readOnly
                                className="w-full h-8 px-2 rounded-lg border border-border bg-muted/20 text-[11px] font-mono text-muted-foreground outline-none"
                                placeholder="Chọn sản phẩm để tạo mã lô"
                              />
                            </div>

                            {/* Xuất mã đơn lẻ */}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={op.xuatMaDonLe}
                                onChange={(e) => updateOutputProduct(op.key, { xuatMaDonLe: e.target.checked })}
                                className="w-4 h-4 accent-green-600 rounded"
                              />
                              <span className="text-[11px] font-medium text-foreground">Xuất mã đơn lẻ</span>
                            </label>

                            {/* Hạn sử dụng */}
                            <div>
                              <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-0.5">
                                Hạn sử dụng <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={op.hanSuDung}
                                onChange={(e) => updateOutputProduct(op.key, { hanSuDung: e.target.value })}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-green-400"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-1 pb-2">
              <button
                onClick={() => navigate("/module/txng/khai-bao")}
                className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition"
              >
                Hủy
              </button>
              <button
                onClick={goToStep2}
                disabled={!canProceed1}
                className="h-9 px-6 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                Xác nhận khai báo
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ STEP 2 ═══════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-3 w-10"></th>
                    <th className="px-3 py-3 text-left text-[12px] font-semibold text-muted-foreground w-10">#</th>
                    <th className="px-3 py-3 text-left text-[12px] font-semibold text-muted-foreground">Mã lô (Đầu ra)</th>
                    <th className="px-3 py-3 text-left text-[12px] font-semibold text-muted-foreground">Tên thương phẩm</th>
                    <th className="px-3 py-3 text-right text-[12px] font-semibold text-muted-foreground w-28">Số lượng</th>
                    <th className="px-3 py-3 text-center text-[12px] font-semibold text-muted-foreground w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Không có lô đầu ra
                      </td>
                    </tr>
                  )}
                  {lots.map((lot, idx) => {
                    const isExp = expandedLots.has(lot.id);
                    return (
                      <>
                        <tr key={lot.id} className="border-b border-border hover:bg-muted/20 transition">
                          <td className="px-3 py-3">
                            {lot.serials.length > 0 && (
                              <button onClick={() => toggleExpand(lot.id)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
                                {isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-3 font-mono text-[13px] font-semibold text-amber-700">{lot.maLo}</td>
                          <td className="px-3 py-3 text-[13px]">{lot.tenThuongPham}</td>
                          <td className="px-3 py-3 text-[13px] text-right font-medium">{lot.soLuong.toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => { setQrLot(lot); setQrSerial(null); }} title="Xem QR" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition">
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button title="Tải xuống" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition">
                                <Download className="w-4 h-4" />
                              </button>
                              <button title="In" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition">
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-1 pb-2">
              <button onClick={() => navigate("/module/txng/khai-bao")} className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">
                ← Thoát
              </button>
              <button onClick={() => setStep(3)} className="h-9 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
                Kích hoạt tem <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ STEP 3 ═══════════════════════════════ */}
        {step === 3 && !confirmed && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Kích hoạt tem truy xuất</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">Gán lô tem và dải seri cho từng lô thương phẩm đầu ra.</p>
            </div>

            <div className="border border-green-200 bg-green-50 rounded-xl p-4">
              <p className="text-[11px] font-bold text-green-700 mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> CHÚ Ý:
              </p>
              <ul className="text-[12px] text-green-800 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Lô không có mã đơn lẻ: Nhập dải số vào ô Seri đầu → Seri cuối.</li>
                <li>Lô có mã đơn lẻ: Nhập Seri đầu ở Lô cha và bấm <strong>"Phân bổ tự động"</strong> <RefreshCw className="w-3 h-3 inline-block align-middle mx-0.5" /> để cấp tem cho các mã đơn lẻ.</li>
                <li>Chọn "Gán tem lô": hệ thống sẽ cấp tem đầu tiên của dải tem đã chọn cho Lô cha, các số tiếp theo sẽ cấp tuần tự cho Mã đơn lẻ.</li>
                <li>Không gán tem đã kích hoạt cho Lô và Mã đơn lẻ.</li>
              </ul>
            </div>

            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1060px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-3 w-8"></th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-8">#</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground">Tên lô (BATCH)</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground">Thương phẩm</th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold text-muted-foreground w-24">Số lượng</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-36">Lô tem <span className="text-rose-500">*</span></th>
                      <th className="px-3 py-3 text-center text-[11px] font-semibold text-muted-foreground w-32">Tem đã kích hoạt</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-32">Seri đầu <span className="text-rose-500">*</span></th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-24">Seri cuối <span className="text-rose-500">*</span></th>
                      <th className="px-3 py-3 text-center text-[11px] font-semibold text-muted-foreground w-20">Đơn vị con</th>
                      <th className="px-3 py-3 text-center text-[11px] font-semibold text-muted-foreground w-20">Gán tem lô</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot, idx) => {
                      const assign = temAssigns.get(lot.id) || { loTem: "", seriDau: "1", seriCuoi: String(lot.soLuong), ganTemLo: false };
                      const isExp = expandedLots.has(lot.id);
                      const sD = parseInt(assign.seriDau) || 0;
                      const sC = parseInt(assign.seriCuoi) || 0;
                      const dvCon = assign.loTem && sD > 0 && sC >= sD ? `${sC - sD + 1}/${lot.soLuong}` : "—";
                      return (
                        <>
                          <tr key={lot.id} className="border-b border-border hover:bg-muted/10 transition">
                            <td className="px-3 py-3 w-8">
                              {lot.serials.length > 0 && (
                                <button onClick={() => toggleExpand(lot.id)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
                                  {isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-3 text-[12px] text-muted-foreground">{idx + 1}</td>
                            <td className="px-3 py-3 max-w-[130px]">
                              <span title={lot.maLo} className="block truncate font-mono text-[12px] font-semibold text-amber-700">{lot.maLo}</span>
                            </td>
                            <td className="px-3 py-3 max-w-[130px]">
                              <span title={lot.tenThuongPham} className="block truncate text-[12px]">{lot.tenThuongPham}</span>
                            </td>
                            <td className="px-3 py-3 text-[12px] text-right whitespace-nowrap">
                              {lot.soLuong > 0 ? `${lot.soLuong.toLocaleString()}${lot.donVi ? ` ${lot.donVi}` : ""}` : "—"}
                            </td>
                            <td className="px-3 py-3">
                              <select
                                value={assign.loTem}
                                onChange={(e) => updateTemAssign(lot.id, { loTem: e.target.value })}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                              >
                                <option value="">— Chọn lô tem —</option>
                                {LOT_TEM_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                {assign.loTem ? (
                                  <button className="text-[11px] text-amber-600 hover:underline whitespace-nowrap">DS tem đã kích hoạt</button>
                                ) : (
                                  <span className="text-[12px] text-muted-foreground">—</span>
                                )}
                                {lot.serials.length > 0 && (
                                  <button
                                    onClick={() => openTemModal(lot)}
                                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap border border-blue-200 rounded-md px-1.5 py-0.5 hover:bg-blue-50 transition"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {countGanForLot(lot.id) > 0 ? `${countGanForLot(lot.id)}/${lot.serials.length} đã gán` : "Kích hoạt đơn lẻ"}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex gap-1 items-center">
                                <input
                                  type="number"
                                  value={assign.seriDau}
                                  onChange={(e) => updateTemAssign(lot.id, { seriDau: e.target.value })}
                                  className="min-w-0 flex-1 h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                                />
                                <button
                                  onClick={() => updateTemAssign(lot.id, { seriCuoi: String(Number(assign.seriDau) + lot.soLuong - 1) })}
                                  title="Phân bổ tự động"
                                  className="w-7 h-8 shrink-0 flex items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={assign.seriCuoi}
                                onChange={(e) => updateTemAssign(lot.id, { seriCuoi: e.target.value })}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                              />
                            </td>
                            <td className="px-3 py-3 text-center text-[12px] font-medium text-muted-foreground">
                              {dvCon}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={assign.ganTemLo}
                                onChange={(e) => updateTemAssign(lot.id, { ganTemLo: e.target.checked })}
                                className="w-4 h-4 accent-amber-500"
                              />
                            </td>
                          </tr>
                          {isExp && lot.serials.slice(0, 30).map((serial, si) => (
                            <tr key={serial} className="border-b border-border bg-amber-50/30 hover:bg-amber-50/50 transition">
                              <td className="pl-7 py-2" colSpan={2}>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                              </td>
                              <td className="px-3 py-2" colSpan={2}>
                                <span className="font-mono text-[11px] text-amber-600">{serial}</span>
                                <span className="ml-2 text-[11px] text-muted-foreground">{idx + 1}.{si + 1}</span>
                              </td>
                              <td className="px-3 py-2 text-[11px] text-right text-muted-foreground">1</td>
                              <td colSpan={6} />
                            </tr>
                          ))}
                          {isExp && lot.serials.length > 30 && (
                            <tr className="bg-amber-50/20">
                              <td colSpan={11} className="px-7 py-2 text-[11px] text-muted-foreground italic">
                                ...và {lot.serials.length - 30} serial khác
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-1 pb-2">
              <button onClick={() => setStep(2)} className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">
                ← Quay lại
              </button>
              <button onClick={() => setConfirmed(true)} className="h-9 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận kích hoạt
              </button>
            </div>
          </div>
        )}

        {step === 3 && confirmed && (
          <div className="bg-white border border-border rounded-xl p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Khai báo chế biến thành công!</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Sự kiện chế biến đã được ghi nhận vào hệ thống truy xuất nguồn gốc.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => navigate("/module/txng/khai-bao")} className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">
                Về trang khai báo
              </button>
              <button
                onClick={() => { setStep(1); setConfirmed(false); setLots([]); setSelectedInputLots([]); setOutputProducts([]); }}
                className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
              >
                Khai báo mới
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ Kích hoạt tem mã đơn lẻ Modal ═══════ */}
      {modalLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h3 className="text-base font-bold">Kích hoạt tem mã đơn lẻ</h3>
              <button onClick={() => setModalLot(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground transition"><X className="w-4.5 h-4.5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* CHÚ Ý */}
              <div className="border border-green-200 bg-green-50 rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-green-700 mb-1.5 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> CHÚ Ý:</p>
                <ul className="text-[11px] text-green-800 space-y-1 list-disc pl-4 leading-relaxed">
                  <li>Lô có mã đơn lẻ: Nhập Seri đầu ở Lô cha và bấm <strong>"Phân bổ tự động"</strong> <RefreshCw className="w-2.5 h-2.5 inline-block align-middle mx-0.5" /> để cấp tem cho các mã đơn lẻ.</li>
                  <li>Chọn "Gán tem lô": hệ thống sẽ cấp tem đầu tiên của dải tem đã chọn cho Lô cha, các số tiếp theo sẽ cấp tuần tự cho Mã đơn lẻ.</li>
                  <li>Không gán tem đã kích hoạt cho Lô và Mã đơn lẻ.</li>
                </ul>
              </div>

              {/* Lot info + Controls */}
              <div className="flex items-start gap-4 bg-muted/20 rounded-xl px-4 py-3">
                <div className="shrink-0 min-w-[160px]">
                  <p className="font-mono text-[13px] font-bold text-primary">{modalLot.maLo}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{modalLot.tenThuongPham}</p>
                  <p className="text-[12px] font-medium">{modalLot.soLuong} {modalLot.donVi || "hộp"}</p>
                </div>
                <div className="flex-1 flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">LÔ TEM *</label>
                    <select
                      value={modalLotLoTem}
                      onChange={(e) => setModalLotLoTem(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                    >
                      <option value="">— Chọn lô tem —</option>
                      {LOT_TEM_OPTIONS.map((o) => <option key={o} value={o}>{o} (còn 1.980)</option>)}
                    </select>
                    {modalLotLoTem && (
                      <button className="text-[11px] text-amber-600 hover:underline mt-0.5 block">DS tem đã kích hoạt</button>
                    )}
                  </div>
                  <div className="w-40">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">SERI ĐẦU</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={modalLotSeriDau}
                        onChange={(e) => setModalLotSeriDau(e.target.value)}
                        placeholder="Nhập số..."
                        className="min-w-0 flex-1 h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={handleAutoDistribute}
                        title="Phân bổ tự động"
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-28">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">SERI CUỐI</label>
                    <input
                      readOnly
                      value={(() => { const sd = parseInt(modalLotSeriDau); return !isNaN(sd) && modalLot.serials.length > 0 ? String(sd + modalLot.serials.length - 1) : ""; })()}
                      placeholder="Tự động"
                      className="w-full h-8 px-2 rounded-lg border border-border bg-muted/30 text-[12px] text-muted-foreground outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer h-8">
                    <input type="checkbox" checked={modalGanTemLo} onChange={(e) => setModalGanTemLo(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                    <span className="text-[12px] font-medium">Gán tem lô</span>
                  </label>
                </div>
              </div>

              {/* Filter tabs */}
              {(() => {
                const serials = modalLot.serials;
                const map = serialTemMap.get(modalLot.id) || new Map();
                const daGan = serials.filter((s) => { const a = map.get(s); return a?.loTem && a?.seriDau; }).length;
                const chuaGan = serials.length - daGan;
                return (
                  <div className="flex gap-0 border-b border-border">
                    {([
                      { key: "all", label: `Tất cả (${serials.length})`, cls: "" },
                      { key: "da-gan", label: `Đã gán (${daGan})`, cls: "text-emerald-600" },
                      { key: "chua-gan", label: `Chưa gán (${chuaGan})`, cls: "text-rose-500" },
                    ] as const).map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setModalTabFilter(t.key)}
                        className={`px-5 py-2 text-[12px] font-medium border-b-2 -mb-px transition ${modalTabFilter === t.key ? "border-primary text-primary" : `border-transparent ${t.cls || "text-muted-foreground"} hover:text-foreground`}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Serial table */}
              {(() => {
                const map = serialTemMap.get(modalLot.id) || new Map();
                let serials = modalLot.serials;
                if (modalTabFilter === "da-gan") serials = serials.filter((s) => { const a = map.get(s); return a?.loTem && a?.seriDau; });
                if (modalTabFilter === "chua-gan") serials = serials.filter((s) => { const a = map.get(s); return !a?.loTem || !a?.seriDau; });
                return (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Mã Serial Con</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Lô Tem</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-36">Seri Đầu <span className="text-rose-500">*</span></th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-36">Seri Cuối <span className="text-rose-500">*</span></th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-36">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serials.length === 0 && (
                          <tr><td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">Không có serial nào</td></tr>
                        )}
                        {serials.slice(0, 50).map((serial) => {
                          const assign = map.get(serial) || { loTem: "", seriDau: "", seriCuoi: "", trangThai: "chua-gan" as const };
                          return (
                            <tr key={serial} className="border-b border-border last:border-0 hover:bg-muted/20">
                              <td className="px-4 py-2.5 font-mono text-[12px] font-semibold text-primary">{serial}</td>
                              <td className="px-4 py-2.5 text-[12px]">{assign.loTem || <span className="text-muted-foreground">—</span>}</td>
                              <td className="px-4 py-2.5">
                                <input
                                  type="number"
                                  value={assign.seriDau}
                                  onChange={(e) => updateSerialTem(serial, { seriDau: e.target.value, loTem: assign.loTem || modalLotLoTem })}
                                  placeholder="Nhập số..."
                                  className="w-full h-7 px-2 rounded border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <input
                                  type="number"
                                  value={assign.seriCuoi}
                                  onChange={(e) => updateSerialTem(serial, { seriCuoi: e.target.value, loTem: assign.loTem || modalLotLoTem })}
                                  placeholder="Nhập số..."
                                  className="w-full h-7 px-2 rounded border border-border bg-white text-[12px] outline-none focus:border-amber-400"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                {assign.trangThai === "tu-dong" && <span className="text-[11px] font-semibold text-emerald-600">Tự động</span>}
                                {assign.trangThai === "thu-cong" && <span className="text-[11px] font-semibold text-amber-600">Gán thủ công</span>}
                                {assign.trangThai === "chua-gan" && <span className="text-[11px] text-muted-foreground">Chưa gán</span>}
                              </td>
                            </tr>
                          );
                        })}
                        {serials.length > 50 && (
                          <tr><td colSpan={5} className="px-4 py-2 text-[11px] text-muted-foreground italic text-center">...và {serials.length - 50} serial khác</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
              <p className="text-[13px] text-muted-foreground">
                Đã gán thành công: <span className="font-bold text-foreground">{countGanForLot(modalLot.id)} / {modalLot.serials.length}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setModalLot(null)} className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">Hủy bỏ</button>
                <button
                  onClick={() => {
                    updateTemAssign(modalLot.id, { loTem: modalLotLoTem, ganTemLo: modalGanTemLo });
                    setModalLot(null);
                  }}
                  className="h-9 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrLot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm font-mono">{qrSerial || qrLot.maLo}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">{qrLot.tenThuongPham}</p>
              </div>
              <button onClick={() => { setQrLot(null); setQrSerial(null); }} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 border border-border rounded-lg" />
              ) : (
                <div className="w-36 h-36 border border-border rounded-lg bg-muted/30 flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-muted-foreground/30" />
                </div>
              )}
              <p className="font-mono text-xs text-center text-muted-foreground">{qrSerial || qrLot.maLo}</p>
              <div className="flex gap-2">
                <button className="h-8 px-4 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Tải xuống
                </button>
                <button className="h-8 px-4 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
