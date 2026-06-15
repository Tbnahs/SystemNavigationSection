import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import QRCode from "qrcode";
import {
  ShoppingBasket, ArrowLeft, ChevronRight, Check, ImageIcon,
  QrCode, Download, Printer, ChevronDown, X, Info, CheckCircle2, Tag,
} from "lucide-react";
import {
  fetchFacilities, fetchProducts, fetchPurchaseOrders,
  type Facility, type Product, type PurchaseOrder,
} from "@/lib/api";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function genLotCode(productCode: string, date: string) {
  const seq = String(Math.floor(Math.random() * 90) + 10);
  const abbr = (productCode || "SP").substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const d = date ? date.replace(/-/g, "").slice(2) : "000000";
  return `LOT${seq}-${abbr}-${d}`;
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Khai báo thu mua", "QR định danh", "Kích hoạt tem"];
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
              isActive
                ? "border-blue-500 bg-blue-50/60"
                : isDone
                ? "border-green-500 bg-green-50/30"
                : "border-transparent"
            } ${n < 3 ? "border-r border-r-border" : ""}`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDone
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : n}
            </span>
            <span
              className={`text-[13px] font-medium ${
                isActive ? "text-blue-700" : isDone ? "text-green-700" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type LotRow = { id: string; maLo: string; tenThuongPham: string; soLuong: number; serials: string[] };
type TemAssign = { loTem: string; seriDau: string; seriCuoi: string; ganTemLo: boolean };

const LOT_TEM_OPTIONS = ["LT-ESG-001", "LT-ESG-002", "LT-ESG-003", "LT-ESG-004"];

export default function TxngKhaiBaoThuMuaPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [coSoId, setCoSoId] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [nguoiThucHien, setNguoiThucHien] = useState(user?.name || "");
  const [ngayThuMua, setNgayThuMua] = useState(todayStr());
  const [donThuMuaId, setDonThuMuaId] = useState("");
  const [thuongPhamId, setThuongPhamId] = useState("");
  const [tonKho, setTonKho] = useState<"khoi-luong" | "so-luong">("khoi-luong");
  const [khoiLuong, setKhoiLuong] = useState("80");
  const [soLuong, setSoLuong] = useState("800");
  const [loThuongPham, setLoThuongPham] = useState("");
  const [xuatMaDonLe, setXuatMaDonLe] = useState(true);
  const [hanSuDung, setHanSuDung] = useState("");

  const [lots, setLots] = useState<LotRow[]>([]);
  const [expandedLots, setExpandedLots] = useState<Set<string>>(new Set());
  const [qrLot, setQrLot] = useState<LotRow | null>(null);
  const [qrSerial, setQrSerial] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const [temAssigns, setTemAssigns] = useState<Map<string, TemAssign>>(new Map());
  const [confirmed, setConfirmed] = useState(false);

  const { data: facilitiesData } = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const { data: productsData } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: ordersData } = useQuery({ queryKey: ["purchase-orders"], queryFn: fetchPurchaseOrders });

  const facilities = (facilitiesData as { items: Facility[] } | undefined)?.items ?? [];
  const products = (productsData as { items: Product[] } | undefined)?.items ?? [];
  const orders = (ordersData as { items: PurchaseOrder[] } | undefined)?.items ?? [];

  const selectedPO = orders.find((o) => String(o.id) === donThuMuaId) ?? null;

  useEffect(() => {
    const f = facilities.find((f) => String(f.id) === coSoId);
    setDiaChi(f?.address ?? "");
  }, [coSoId, facilities]);

  useEffect(() => {
    if (thuongPhamId && ngayThuMua) {
      const p = products.find((p) => String(p.id) === thuongPhamId);
      setLoThuongPham(genLotCode(p?.code || "SP", ngayThuMua));
    }
  }, [thuongPhamId, ngayThuMua, products]);

  useEffect(() => {
    const text = qrSerial ?? qrLot?.maLo ?? "";
    if (!text) { setQrDataUrl(""); return; }
    QRCode.toDataURL(text, { width: 128, margin: 1, color: { dark: "#1e40af", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [qrLot, qrSerial]);

  function goToStep2() {
    const product = products.find((p) => String(p.id) === thuongPhamId);
    const qty = parseInt(soLuong) || 1;
    const serials = xuatMaDonLe
      ? Array.from({ length: Math.min(qty, 100) }, (_, i) => `SC-${String(i + 1).padStart(3, "0")}`)
      : [];
    const lot: LotRow = {
      id: loThuongPham || "LOT-TEMP",
      maLo: loThuongPham || "LOT-TEMP",
      tenThuongPham: product?.name || "Không xác định",
      soLuong: qty,
      serials,
    };
    setLots([lot]);
    const assigns = new Map<string, TemAssign>();
    assigns.set(lot.id, { loTem: "", seriDau: "1", seriCuoi: String(qty), ganTemLo: false });
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

  const canProceed1 = !!thuongPhamId && !!loThuongPham;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <button onClick={() => navigate("/module/txng")} className="hover:text-foreground transition">Truy xuất nguồn gốc</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate("/module/txng/khai-bao")} className="hover:text-foreground transition">Khai báo truy xuất</button>
          <ChevronRight className="w-3 h-3" />
          <span>Thu mua</span>
        </div>

        <h1 className="text-lg font-bold flex items-center gap-2">
          <ShoppingBasket className="w-5 h-5 text-blue-600" />
          Khai báo thu mua
        </h1>

        <Stepper step={step} />

        {/* ═══════════════════════════════ STEP 1 ═══════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {/* Left panel */}
              <div className="w-56 shrink-0 space-y-3">
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center relative group cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-white/60" />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Thay đổi hình ảnh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-3.5 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Thông tin chung</p>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Cơ sở</label>
                    <select
                      value={coSoId}
                      onChange={(e) => setCoSoId(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-blue-400"
                    >
                      <option value="">— Chọn cơ sở —</option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Địa chỉ</label>
                    <input
                      value={diaChi}
                      onChange={(e) => setDiaChi(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-blue-400"
                      placeholder="Tự động từ cơ sở"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Người thực hiện</label>
                    <input
                      value={nguoiThucHien}
                      onChange={(e) => setNguoiThucHien(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Thời gian thu mua</label>
                    <input
                      type="date"
                      value={ngayThuMua}
                      onChange={(e) => setNgayThuMua(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Main form */}
              <div className="flex-1 bg-white border border-border rounded-xl p-5 space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Thông tin thu mua</p>

                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1">Đơn thu mua</label>
                  <select
                    value={donThuMuaId}
                    onChange={(e) => setDonThuMuaId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">— Chọn đơn thu mua —</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.maPhieu} — {o.facilityName || "Chưa có cơ sở"} ({o.ngayThu})
                      </option>
                    ))}
                  </select>
                  {orders.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">Chưa có đơn thu mua. Tạo đơn trong module ERP trước.</p>
                  )}
                </div>

                {selectedPO && (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-3 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-700">Thông tin thu mua</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Cơ sở thu mua:</span>
                      <span className="font-medium">{selectedPO.facilityName || "—"}</span>
                      <span className="text-muted-foreground">Địa chỉ hộ thu mua:</span>
                      <span className="font-medium">{selectedPO.diaChuThu || "—"}</span>
                      <span className="text-muted-foreground">Mã lô mẻ:</span>
                      <span className="font-medium font-mono">{selectedPO.maLoMe || "—"}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1">
                    Thương phẩm <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={thuongPhamId}
                    onChange={(e) => setThuongPhamId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">— Chọn thương phẩm —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Quy tắc tồn kho</label>
                  <div className="flex gap-6">
                    {(["khoi-luong", "so-luong"] as const).map((val) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={val}
                          checked={tonKho === val}
                          onChange={() => setTonKho(val)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm">{val === "khoi-luong" ? "Theo Khối lượng" : "Theo Số lượng"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-muted-foreground mb-1">Khối lượng</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={khoiLuong}
                        onChange={(e) => setKhoiLuong(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-blue-400"
                        placeholder="0"
                      />
                      <span className="h-9 px-3 flex items-center text-sm text-muted-foreground bg-muted/50 rounded-lg border border-border shrink-0">Kg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-muted-foreground mb-1">Số lượng</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={soLuong}
                        onChange={(e) => setSoLuong(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-blue-400"
                        placeholder="0"
                      />
                      <span className="h-9 px-3 flex items-center text-sm text-muted-foreground bg-muted/50 rounded-lg border border-border shrink-0">Cái</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1">
                    Lô thương phẩm
                    <span className="ml-1.5 text-[10px] font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Tự động</span>
                  </label>
                  <input
                    value={loThuongPham}
                    readOnly
                    className="w-full h-9 px-3 rounded-lg border border-border bg-muted/20 text-sm font-mono text-muted-foreground outline-none"
                    placeholder="Chọn thương phẩm và ngày để tạo mã lô..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={xuatMaDonLe}
                    onChange={(e) => setXuatMaDonLe(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="text-sm">Xuất mã đơn lẻ (tạo QR code cho từng đơn vị)</span>
                </label>

                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={hanSuDung}
                    onChange={(e) => setHanSuDung(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 pb-2">
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
                    <th className="px-3 py-3 text-left text-[12px] font-semibold text-muted-foreground">Mã lô</th>
                    <th className="px-3 py-3 text-left text-[12px] font-semibold text-muted-foreground">Tên thương phẩm</th>
                    <th className="px-3 py-3 text-right text-[12px] font-semibold text-muted-foreground w-28">Số lượng</th>
                    <th className="px-3 py-3 text-center text-[12px] font-semibold text-muted-foreground w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot, idx) => {
                    const isExp = expandedLots.has(lot.id);
                    return (
                      <>
                        <tr key={lot.id} className="border-b border-border hover:bg-muted/20 transition">
                          <td className="px-3 py-3">
                            {lot.serials.length > 0 && (
                              <button
                                onClick={() => toggleExpand(lot.id)}
                                className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                {isExp ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-3 font-mono text-[13px] font-semibold text-blue-700">{lot.maLo}</td>
                          <td className="px-3 py-3 text-[13px]">{lot.tenThuongPham}</td>
                          <td className="px-3 py-3 text-[13px] text-right font-medium">{lot.soLuong.toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {[
                                { icon: QrCode, label: "Xem QR", action: () => { setQrLot(lot); setQrSerial(null); }, color: "hover:bg-blue-50 hover:text-blue-600" },
                                { icon: Download, label: "Tải xuống", action: () => {}, color: "hover:bg-muted" },
                                { icon: Printer, label: "In", action: () => {}, color: "hover:bg-muted" },
                              ].map(({ icon: Icon, label, action, color }) => (
                                <button
                                  key={label}
                                  onClick={action}
                                  title={label}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground ${color} transition`}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                        {isExp &&
                          lot.serials.slice(0, 50).map((serial, si) => (
                            <tr key={serial} className="border-b border-border bg-blue-50/30 hover:bg-blue-50/50 transition">
                              <td className="px-3 py-2 pl-7">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                              </td>
                              <td className="px-3 py-2 text-[11px] text-muted-foreground">{idx + 1}.{si + 1}</td>
                              <td className="px-3 py-2 font-mono text-[12px] text-blue-600">{serial}</td>
                              <td className="px-3 py-2 text-[11px] text-muted-foreground">{lot.tenThuongPham}</td>
                              <td className="px-3 py-2 text-[11px] text-right text-muted-foreground">1</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => { setQrLot(lot); setQrSerial(serial); }}
                                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-blue-100 hover:text-blue-600 transition"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition">
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {isExp && lot.serials.length > 50 && (
                          <tr className="bg-blue-50/20">
                            <td colSpan={6} className="px-7 py-2 text-[11px] text-muted-foreground italic">
                              ...và {lot.serials.length - 50} serial khác
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-1 pb-2">
              <button
                onClick={() => navigate("/module/txng/khai-bao")}
                className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition"
              >
                ← Thoát
              </button>
              <button
                onClick={() => setStep(3)}
                className="h-9 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
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
              <p className="text-[13px] text-muted-foreground mt-0.5">Gán lô tem và dải seri cho từng lô thương phẩm.</p>
            </div>

            <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex gap-3">
              <Info className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              <p className="text-[13px] text-green-800 leading-relaxed">
                Kích hoạt tem giúp liên kết lô thương phẩm với tem vật lý. Sau khi xác nhận, người tiêu dùng có thể quét tem để truy xuất thông tin nguồn gốc.
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
                          <td className="px-3 py-3 font-mono text-[12px] font-semibold text-blue-700">{lot.maLo}</td>
                          <td className="px-3 py-3 text-[12px]">{lot.tenThuongPham}</td>
                          <td className="px-3 py-3 text-[12px] text-right">{lot.soLuong.toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <select
                              value={assign.loTem}
                              onChange={(e) => updateTemAssign(lot.id, { loTem: e.target.value })}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-blue-400"
                            >
                              <option value="">— Chọn lô tem —</option>
                              {LOT_TEM_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3 text-[12px] text-right text-muted-foreground">
                            {assign.loTem ? "0" : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={assign.seriDau}
                              onChange={(e) => updateTemAssign(lot.id, { seriDau: e.target.value })}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-blue-400"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              value={assign.seriCuoi}
                              onChange={(e) => updateTemAssign(lot.id, { seriCuoi: e.target.value })}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[12px] outline-none focus:border-blue-400"
                            />
                          </td>
                          <td className="px-3 py-3 flex justify-center mt-1">
                            <input
                              type="checkbox"
                              checked={assign.ganTemLo}
                              onChange={(e) => updateTemAssign(lot.id, { ganTemLo: e.target.checked })}
                              className="w-4 h-4 accent-blue-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-1 pb-2">
              <button
                onClick={() => setStep(2)}
                className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition"
              >
                ← Quay lại
              </button>
              <button
                onClick={() => setConfirmed(true)}
                className="h-9 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận kích hoạt
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ SUCCESS ═══════════════════════════════ */}
        {step === 3 && confirmed && (
          <div className="bg-white border border-border rounded-xl p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Khai báo thành công!</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Lô thương phẩm <span className="font-mono font-semibold text-blue-700">{lots[0]?.maLo}</span> đã được ghi nhận vào hệ thống truy xuất nguồn gốc.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => navigate("/module/txng/khai-bao")}
                className="h-9 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition"
              >
                Về trang khai báo
              </button>
              <button
                onClick={() => {
                  setStep(1); setConfirmed(false); setLots([]);
                  setDonThuMuaId(""); setThuongPhamId(""); setLoThuongPham("");
                  setSoLuong("800"); setKhoiLuong("80");
                }}
                className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
              >
                Khai báo mới
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {(qrLot !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm font-mono">{qrSerial || qrLot.maLo}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">{qrLot.tenThuongPham} — {qrLot.soLuong} {qrSerial ? "đơn vị" : "SP"}</p>
              </div>
              <button onClick={() => { setQrLot(null); setQrSerial(null); }} className="text-muted-foreground hover:text-foreground transition mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* QR image */}
              <div className="flex flex-col items-center mb-5 gap-3">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 border border-border rounded-lg" />
                ) : (
                  <div className="w-32 h-32 border border-border rounded-lg bg-muted/30 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <p className="font-mono text-xs text-center text-muted-foreground">{qrSerial || qrLot.maLo}</p>
              </div>

              {/* Serial list (only if viewing lot, not a specific serial) */}
              {!qrSerial && qrLot.serials.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                    Danh sách mã đơn lẻ ({qrLot.serials.length})
                  </p>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Mã serial con</th>
                          <th className="px-3 py-2 text-center font-medium text-muted-foreground w-28">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qrLot.serials.slice(0, 30).map((s) => (
                          <tr key={s} className="border-b border-border last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-2 font-mono text-blue-700">{s}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setQrSerial(s)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-blue-100 hover:text-blue-600 transition"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                                <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition">
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition">
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {qrLot.serials.length > 30 && (
                          <tr>
                            <td colSpan={2} className="px-3 py-2 text-center text-muted-foreground italic">
                              ...và {qrLot.serials.length - 30} serial khác
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Back button when viewing individual serial */}
              {qrSerial && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setQrSerial(null)}
                    className="h-8 px-4 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition"
                  >
                    ← Về danh sách serial
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
              <button className="h-8 px-4 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Tải xuống
              </button>
              <button className="h-8 px-4 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> In
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
