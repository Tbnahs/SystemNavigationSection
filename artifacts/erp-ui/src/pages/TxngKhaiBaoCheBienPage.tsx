import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import QRCode from "qrcode";
import {
  Factory, ArrowLeft, ChevronRight, Check, ImageIcon,
  QrCode, Download, Printer, ChevronDown, X, Info,
  CheckCircle2, Plus, Trash2, Package,
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
  soLuongMax: number;
  donVi: string;
  soLuongSuDung: string;
  serials: string[];
  expandedSerials: boolean;
};

type OutputProduct = {
  key: string;
  productId: string;
  tonKho: "khoi-luong" | "so-luong";
  khoiLuong: string;
  soLuong: string;
  loThuongPham: string;
  hanSuDung: string;
};

type LotRow = { id: string; maLo: string; tenThuongPham: string; soLuong: number; serials: string[] };
type TemAssign = { loTem: string; seriDau: string; seriCuoi: string; ganTemLo: boolean };

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
    QRCode.toDataURL(text, { width: 128, margin: 1, color: { dark: "#92400e", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [qrLot, qrSerial]);

  const availableInputLots = MOCK_INPUT_LOTS.filter(
    (l) => !selectedInputLots.find((s) => s.lotId === l.id)
  );

  function addInputLot() {
    const lot = MOCK_INPUT_LOTS.find((l) => l.id === lotDropdownVal);
    if (!lot) return;
    setSelectedInputLots((prev) => [
      ...prev,
      {
        lotId: lot.id,
        maLo: lot.maLo,
        tenThuongPham: lot.tenThuongPham,
        soLuongMax: lot.soLuongMax,
        donVi: lot.donVi,
        soLuongSuDung: "",
        serials: lot.serials,
        expandedSerials: false,
      },
    ]);
    setLotDropdownVal("");
  }

  function removeInputLot(lotId: string) {
    setSelectedInputLots((prev) => prev.filter((l) => l.lotId !== lotId));
  }

  function updateInputLot(lotId: string, updates: Partial<SelectedInputLot>) {
    setSelectedInputLots((prev) =>
      prev.map((l) => (l.lotId === lotId ? { ...l, ...updates } : l))
    );
  }

  function addOutputProduct() {
    const key = String(Date.now());
    setOutputProducts((prev) => [
      ...prev,
      { key, productId: "", tonKho: "so-luong", khoiLuong: "", soLuong: "", loThuongPham: "", hanSuDung: "" },
    ]);
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
          serials: [],
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
            <div className="flex gap-4 items-start min-h-0">
              {/* Left panel */}
              <div className="w-52 shrink-0 space-y-3">
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="h-28 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center relative group cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-white/60" />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Thay đổi hình ảnh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-3.5 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Thông tin chung</p>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Cơ sở chế biến</label>
                    <select
                      value={coSoId}
                      onChange={(e) => setCoSoId(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-amber-400"
                    >
                      <option value="">— Chọn cơ sở —</option>
                      {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Địa chỉ</label>
                    <input
                      value={diaChi}
                      onChange={(e) => setDiaChi(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-amber-400"
                      placeholder="Tự động từ cơ sở"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Người thực hiện</label>
                    <input
                      value={nguoiThucHien}
                      onChange={(e) => setNguoiThucHien(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Thời gian chế biến</label>
                    <input
                      type="date"
                      value={ngayCheBien}
                      onChange={(e) => setNgayCheBien(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Middle: ĐẦU VÀO */}
              <div className="flex-1 bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Đầu vào</span>
                  <span className="text-[10px] text-amber-600">Lô nguyên liệu</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={lotDropdownVal}
                      onChange={(e) => setLotDropdownVal(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-amber-400"
                    >
                      <option value="">— Chọn lô nguyên liệu —</option>
                      {availableInputLots.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.maLo} ({l.soLuongMax} {l.donVi})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addInputLot}
                      disabled={!lotDropdownVal}
                      className="h-9 px-3 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedInputLots.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[12px]">Chưa chọn lô nguyên liệu đầu vào</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedInputLots.map((sl) => (
                      <div key={sl.lotId} className="border border-amber-200 bg-amber-50/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-mono text-[12px] font-semibold text-amber-800">{sl.maLo}</p>
                            <p className="text-[11px] text-muted-foreground">{sl.tenThuongPham}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {sl.serials.length > 0 && (
                              <button
                                onClick={() => updateInputLot(sl.lotId, { expandedSerials: !sl.expandedSerials })}
                                className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full hover:bg-amber-200 transition"
                              >
                                {sl.serials.length} Serial {sl.expandedSerials ? "▲" : "▼"}
                              </button>
                            )}
                            <button
                              onClick={() => removeInputLot(sl.lotId)}
                              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {sl.expandedSerials && sl.serials.length > 0 && (
                          <div className="bg-white rounded-lg border border-amber-200 max-h-28 overflow-y-auto p-2">
                            <div className="flex flex-wrap gap-1">
                              {sl.serials.slice(0, 30).map((s) => (
                                <span key={s} className="text-[10px] font-mono bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-amber-800">
                                  {s}
                                </span>
                              ))}
                              {sl.serials.length > 30 && (
                                <span className="text-[10px] text-muted-foreground italic">+{sl.serials.length - 30} khác</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">KL sử dụng (Kg)</label>
                            <input
                              type="number"
                              placeholder="0"
                              className="w-full h-7 px-2 rounded border border-border bg-white text-xs outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">SL sử dụng ({sl.donVi})</label>
                            <input
                              type="number"
                              value={sl.soLuongSuDung}
                              onChange={(e) => updateInputLot(sl.lotId, { soLuongSuDung: e.target.value })}
                              placeholder={`0 / ${sl.soLuongMax}`}
                              className="w-full h-7 px-2 rounded border border-border bg-white text-xs outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: ĐẦU RA */}
              <div className="flex-1 bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-green-50 border-b border-green-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-green-700">Đầu ra thương phẩm</span>
                  </div>
                  <button
                    onClick={addOutputProduct}
                    className="h-6 px-2.5 rounded-md bg-green-600 text-white text-[11px] font-medium hover:bg-green-700 transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {outputProducts.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[12px]">Chưa có thương phẩm đầu ra</p>
                      <p className="text-[11px] mt-0.5 opacity-70">Nhấn "+ Thêm" để thêm</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {outputProducts.map((op, idx) => {
                      const selectedProduct = products.find((p) => String(p.id) === op.productId);
                      return (
                        <div key={op.key} className="border border-green-200 bg-green-50/40 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-green-800">Thương phẩm #{idx + 1}</span>
                            <button
                              onClick={() => removeOutputProduct(op.key)}
                              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <select
                            value={op.productId}
                            onChange={(e) => updateOutputProduct(op.key, { productId: e.target.value })}
                            className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-green-400"
                          >
                            <option value="">— Chọn thương phẩm —</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                          </select>

                          {op.productId && (
                            <>
                              <div className="flex gap-2">
                                {(["so-luong", "khoi-luong"] as const).map((val) => (
                                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="radio"
                                      checked={op.tonKho === val}
                                      onChange={() => updateOutputProduct(op.key, { tonKho: val })}
                                      className="accent-green-600 w-3 h-3"
                                    />
                                    <span className="text-[11px]">{val === "so-luong" ? "Theo SL" : "Theo KL"}</span>
                                  </label>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">Khối lượng (Kg)</label>
                                  <input
                                    type="number"
                                    value={op.khoiLuong}
                                    onChange={(e) => updateOutputProduct(op.key, { khoiLuong: e.target.value })}
                                    placeholder="0"
                                    className="w-full h-7 px-2 rounded border border-border bg-white text-xs outline-none focus:border-green-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">Số lượng (Cái)</label>
                                  <input
                                    type="number"
                                    value={op.soLuong}
                                    onChange={(e) => updateOutputProduct(op.key, { soLuong: e.target.value })}
                                    placeholder="0"
                                    className="w-full h-7 px-2 rounded border border-border bg-white text-xs outline-none focus:border-green-400"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                                  Lô thương phẩm
                                  <span className="ml-1 text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded">Tự động</span>
                                </label>
                                <input
                                  value={op.loThuongPham}
                                  readOnly
                                  className="w-full h-7 px-2 rounded border border-border bg-muted/20 text-[11px] font-mono text-muted-foreground outline-none"
                                  placeholder="Chọn sản phẩm để tạo mã lô"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">Hạn sử dụng</label>
                                <input
                                  type="date"
                                  value={op.hanSuDung}
                                  onChange={(e) => updateOutputProduct(op.key, { hanSuDung: e.target.value })}
                                  className="w-full h-7 px-2 rounded border border-border bg-white text-xs outline-none focus:border-green-400"
                                />
                              </div>
                            </>
                          )}
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
                className="h-9 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2"
              >
                Tiếp theo <ChevronRight className="w-4 h-4" />
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

            <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex gap-3">
              <Info className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              <p className="text-[13px] text-green-800 leading-relaxed">
                Kích hoạt tem giúp liên kết lô thương phẩm sau chế biến với tem vật lý. Sau khi xác nhận, người tiêu dùng có thể quét tem để truy xuất toàn bộ chuỗi cung ứng.
              </p>
            </div>

            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-8">#</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground">Tên lô (BATCH)</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground">Thương phẩm</th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold text-muted-foreground w-24">Số lượng</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-36">Lô tem</th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold text-muted-foreground w-28">Tem đã kích hoạt</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-24">Seri đầu</th>
                      <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground w-24">Seri cuối</th>
                      <th className="px-3 py-3 text-center text-[11px] font-semibold text-muted-foreground w-24">Gán tem lô</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot, idx) => {
                      const assign = temAssigns.get(lot.id) || { loTem: "", seriDau: "1", seriCuoi: String(lot.soLuong), ganTemLo: false };
                      return (
                        <tr key={lot.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition">
                          <td className="px-3 py-3 text-[12px] text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-3 font-mono text-[12px] font-semibold text-amber-700">{lot.maLo}</td>
                          <td className="px-3 py-3 text-[12px]">{lot.tenThuongPham}</td>
                          <td className="px-3 py-3 text-[12px] text-right">{lot.soLuong.toLocaleString()}</td>
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
                          <td className="px-3 py-3 text-[12px] text-right text-muted-foreground">{assign.loTem ? "0" : "—"}</td>
                          <td className="px-3 py-3">
                            <input type="number" value={assign.seriDau} onChange={(e) => updateTemAssign(lot.id, { seriDau: e.target.value })}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400" />
                          </td>
                          <td className="px-3 py-3">
                            <input type="number" value={assign.seriCuoi} onChange={(e) => updateTemAssign(lot.id, { seriCuoi: e.target.value })}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-amber-400" />
                          </td>
                          <td className="px-3 py-3 flex justify-center mt-1">
                            <input type="checkbox" checked={assign.ganTemLo} onChange={(e) => updateTemAssign(lot.id, { ganTemLo: e.target.checked })}
                              className="w-4 h-4 accent-amber-500" />
                          </td>
                        </tr>
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
