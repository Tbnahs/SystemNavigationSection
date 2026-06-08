import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Search, QrCode, CheckCircle2, Clock, MapPin, Users, Package,
  Factory, Truck, ShoppingBag, Leaf, X, ChevronRight,
  AlertCircle, ArrowDown, Building2, Scissors,
} from "lucide-react";

type EventType = "thu-mua" | "san-xuat" | "dong-goi" | "xuat-kho" | "giao-hang" | "thu-hoach";
const EVENT_CFG: Record<EventType, { label: string; icon: React.ElementType; color: string; bg: string; line: string }> = {
  "thu-hoach": { label: "Thu hoạch",   icon: Scissors,  color: "text-amber-700",  bg: "bg-amber-100",  line: "border-amber-300" },
  "thu-mua":   { label: "Thu mua",     icon: Users,     color: "text-blue-700",   bg: "bg-blue-100",   line: "border-blue-300" },
  "san-xuat":  { label: "Sản xuất",    icon: Factory,   color: "text-violet-700", bg: "bg-violet-100", line: "border-violet-300" },
  "dong-goi":  { label: "Đóng gói",    icon: Package,   color: "text-pink-700",   bg: "bg-pink-100",   line: "border-pink-300" },
  "xuat-kho":  { label: "Xuất kho",    icon: Truck,     color: "text-orange-700", bg: "bg-orange-100", line: "border-orange-300" },
  "giao-hang": { label: "Giao hàng",   icon: ShoppingBag,color:"text-emerald-700",bg: "bg-emerald-100",line: "border-emerald-300"},
};

interface TraceEvent {
  type: EventType;
  thoiGian: string;
  diaDiem: string;
  nguoiThucHien: string;
  moTa: string;
  maLo?: string;
  khLuong?: string;
  details: { label: string; value: string }[];
}

interface LotInfo {
  maLo: string;
  thuongPham: string;
  loai: string;
  khLuong: string;
  ngayTao: string;
  serialTem?: string;
  trangThai: "dang-sx" | "hoan-thanh" | "da-ban";
  events: TraceEvent[];
  farmInfo?: { tenHo: string; maHo: string; diaChi: string; giong: string; dienTich: string; chungNhan: string };
  enterprise?: { ten: string; mst: string; diaChi: string };
}

const MOCK_DB: Record<string, LotInfo> = {
  "L09104": {
    maLo: "L09104", thuongPham: "Chè xanh Bằng Phúc", loai: "Chè xanh", khLuong: "5.9 kg",
    ngayTao: "01/04/2026", trangThai: "hoan-thanh",
    enterprise: { ten: "Chè Quân Chu – HTX Bằng Phúc", mst: "0482156798", diaChi: "Bằng Phúc, Chợ Đồn, Bắc Kạn" },
    farmInfo: { tenHo: "Nhiều hộ – Nà Bay & Nà Hồng", maHo: "NB002/NB013", diaChi: "Nà Bay, Bằng Phúc", giong: "Shan Tuyết Bằng Phúc", dienTich: "12.4 ha", chungNhan: "VietGAP 2025" },
    events: [
      { type:"thu-hoach", thoiGian:"28/03/2026 07:00", diaDiem:"Nà Bay, Bằng Phúc", nguoiThucHien:"Nông Thị Dung + 5 hộ", moTa:"Thu hoạch tôm chè 1-2 lá, đạt độ ẩm 78%", khLuong:"24.7 kg búp tươi", details:[{label:"Giống",value:"Shan Tuyết Bằng Phúc"},{label:"Độ ẩm đất",value:"65%"},{label:"Thời tiết",value:"Nắng, 22°C"},{label:"Phương pháp",value:"Hái tay"}] },
      { type:"thu-mua", thoiGian:"01/04/2026 08:00", diaDiem:"Cơ sở thu mua Nà Bay", nguoiThucHien:"Nguyễn Văn An", moTa:"Thu mua từ 2 hộ liên kết (NB002, NB013), tổng 24.7kg", maLo:"RAW-NB002-0104 / RAW-NB013-0104", khLuong:"24.7 kg", details:[{label:"Đơn thu mua",value:"PO-0104-004"},{label:"Đơn giá",value:"70.000 đ/kg"},{label:"Xếp loại",value:"Loại A - Tôm 1 lá"},{label:"QC",value:"Đạt – ẩm <80%, không tạp chất"}] },
      { type:"san-xuat", thoiGian:"01/04/2026 14:00", diaDiem:"Nhà máy Bằng Phúc", nguoiThucHien:"HTX Hồng Hà", moTa:"Chế biến: hong khô → sao khô → đóng gói sơ bộ. Tỷ lệ thu hồi 23.9%", maLo:"L09104", khLuong:"5.9 kg thành phẩm", details:[{label:"Lệnh SX",value:"LSX-0401-001"},{label:"Nhiệt độ sao",value:"80-90°C"},{label:"Thời gian",value:"4.5 giờ"},{label:"Tỷ lệ thu hồi",value:"23.9%"}] },
      { type:"dong-goi", thoiGian:"03/04/2026 09:00", diaDiem:"Nhà máy Bằng Phúc", nguoiThucHien:"Tổ đóng gói #2", moTa:"Đóng gói thành 59 túi 100g, gắn tem TXNG và QR code lô", khLuong:"5.9 kg → 59 hộp 100g", details:[{label:"Mã serial",value:"S09104"},{label:"Loại bao bì",value:"Túi kraft 100g + thiếc"},{label:"Tem TXNG",value:"TEM-DG-0403-001 (59 tem)"},{label:"Hạn SD",value:"01/04/2027"}] },
      { type:"xuat-kho", thoiGian:"05/04/2026 11:00", diaDiem:"Kho thành phẩm – Nhà máy BP", nguoiThucHien:"Trần Thị Bình", moTa:"Xuất kho 2.7 kg (27 hộp) theo đơn hàng ĐH-001", khLuong:"2.7 kg (27 hộp)", details:[{label:"Phiếu XK",value:"XK-0004"},{label:"Đơn hàng",value:"ĐH-001 – Trà Thái Nguyên"},{label:"Tồn kho còn",value:"3.2 kg (32 hộp)"}] },
      { type:"giao-hang", thoiGian:"06/04/2026 08:00", diaDiem:"TP. Thái Nguyên", nguoiThucHien:"GHTK – mã vận đơn G40123456", moTa:"Giao thành công cho Cty TNHH Trà Thái Nguyên", khLuong:"2.7 kg", details:[{label:"Khách hàng",value:"Cty TNHH Trà Thái Nguyên"},{label:"Trạng thái",value:"Hoàn thành"},{label:"Mã vận đơn",value:"G40123456"}] },
    ],
  },
  "TM-NB002-0104": {
    maLo: "RAW-NB002-0104", thuongPham: "Chè búp tươi Nà Bay", loai: "Nguyên liệu", khLuong: "44.0 kg",
    ngayTao: "01/04/2026", trangThai: "hoan-thanh",
    enterprise: { ten: "Chè Quân Chu – HTX Bằng Phúc", mst: "0482156798", diaChi: "Bằng Phúc, Chợ Đồn, Bắc Kạn" },
    farmInfo: { tenHo: "Nông Văn Nghiễm", maHo: "NB002", diaChi: "Nà Bay, Bằng Phúc, Bắc Kạn", giong: "Shan Tuyết Bằng Phúc (cây 35 năm tuổi)", dienTich: "1.0 ha", chungNhan: "VietGAP 2025, Hộ tiêu biểu" },
    events: [
      { type:"thu-hoach", thoiGian:"30/03/2026 06:30", diaDiem:"Vườn hộ NB002 – Nà Bay", nguoiThucHien:"Nông Văn Nghiễm + gia đình", moTa:"Thu hoạch 44kg chè búp tươi tôm 1-2 lá từ vườn cây 35 năm", khLuong:"44.0 kg", details:[{label:"Giống",value:"Shan Tuyết cổ thụ 35 năm"},{label:"Phương pháp",value:"Hái tay, tôm 1-2 lá"},{label:"Độ ẩm",value:"76%"},{label:"Thời tiết",value:"Sáng sớm mát, sương"}] },
      { type:"thu-mua", thoiGian:"01/04/2026 08:00", diaDiem:"Điểm thu mua Nà Bay", nguoiThucHien:"Nguyễn Văn An", moTa:"Thu mua 44kg từ hộ NB002, xếp loại A", maLo:"RAW-NB002-0104", khLuong:"44.0 kg", details:[{label:"Đơn giá",value:"70.000 đ/kg"},{label:"Thành tiền",value:"3.080.000 đ"},{label:"Xếp loại",value:"Loại A"},{label:"Đơn thu mua",value:"PO-0104-004"}] },
    ],
  },
};

const QUICK_EXAMPLES = ["L09104", "TM-NB002-0104", "L013003", "L073103"];

export default function TxngTheoLoPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LotInfo | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  function doSearch(q: string) {
    if (!q.trim()) return;
    setSearching(true);
    setNotFound(false);
    setResult(null);
    setTimeout(() => {
      setSearching(false);
      const found = MOCK_DB[q.trim().toUpperCase()] || MOCK_DB[q.trim()];
      if (found) { setResult(found); setExpandedEvent(null); }
      else setNotFound(true);
    }, 800);
  }

  const statusCfg = result ? {
    "dang-sx":    { label: "Đang sản xuất", color: "bg-amber-100 text-amber-700" },
    "hoan-thanh": { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-700" },
    "da-ban":     { label: "Đã bán",        color: "bg-blue-100 text-blue-700" },
  }[result.trangThai] : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="text-[12px] text-muted-foreground">TXNG / Truy xuất</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5 flex items-center gap-2">
            <Search className="w-6 h-6 text-sky-600" />
            Truy xuất theo Lô / Serial
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">Nhập mã lô hoặc serial tem để xem toàn bộ chuỗi cung ứng.</p>
        </div>

        {/* Search */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch(query)}
                placeholder="Nhập mã lô (VD: L09104) hoặc serial tem (VD: TM240601001)..."
                className="w-full pl-10 pr-4 py-3 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              onClick={() => doSearch(query)}
              disabled={searching || !query.trim()}
              className="px-6 py-3 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <QrCode className="w-4 h-4" />}
              Tra cứu
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Ví dụ:</span>
            {QUICK_EXAMPLES.map(ex => (
              <button key={ex} onClick={() => { setQuery(ex); doSearch(ex); }} className="text-xs px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-100 font-mono">{ex}</button>
            ))}
          </div>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Không tìm thấy</p>
              <p className="text-sm text-amber-700 mt-0.5">Không có lô/serial <span className="font-mono font-bold">"{query}"</span> trong hệ thống. Kiểm tra lại mã hoặc thử ví dụ bên trên.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Product header */}
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${statusCfg?.color}`}>{statusCfg?.label}</span>
                  <h2 className="text-lg font-bold text-foreground">{result.thuongPham}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Mã lô: <span className="font-mono font-semibold text-primary">{result.maLo}</span> · {result.loai}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{result.khLuong}</p>
                  <p className="text-xs text-muted-foreground">Tạo ngày {result.ngayTao}</p>
                </div>
              </div>

              {result.enterprise && (
                <div className="mt-4 pt-4 border-t border-border flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Doanh nghiệp</p>
                    <p className="text-sm font-semibold">{result.enterprise.ten}</p>
                    <p className="text-xs text-muted-foreground">MST {result.enterprise.mst} · {result.enterprise.diaChi}</p>
                  </div>
                </div>
              )}

              {result.farmInfo && (
                <div className="mt-3 flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vùng trồng / Nông hộ</p>
                    <p className="text-sm font-semibold">{result.farmInfo.tenHo} · <span className="font-mono text-xs text-blue-700">{result.farmInfo.maHo}</span></p>
                    <p className="text-xs text-muted-foreground">{result.farmInfo.diaChi} · {result.farmInfo.giong} · {result.farmInfo.chungNhan}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Chuỗi cung ứng ({result.events.length} sự kiện)
              </h3>
              <div className="relative">
                {result.events.map((ev, i) => {
                  const cfg = EVENT_CFG[ev.type];
                  const Icon = cfg.icon;
                  const isExpanded = expandedEvent === i;
                  const isLast = i === result.events.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      {/* Line + icon */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.line}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} strokeWidth={1.5} />
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1 mb-1" />}
                      </div>
                      {/* Content */}
                      <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
                        <button
                          onClick={() => setExpandedEvent(isExpanded ? null : i)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} mb-1`}>{cfg.label}</span>
                              <p className="text-sm font-semibold text-foreground">{ev.moTa}</p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{ev.thoiGian}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.diaDiem}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{ev.nguoiThucHien}</span>
                              </div>
                              {ev.khLuong && <p className="text-xs font-semibold text-blue-700 mt-1">{ev.khLuong}</p>}
                            </div>
                            <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </div>
                        </button>

                        {isExpanded && ev.details.length > 0 && (
                          <div className="mt-3 bg-muted/20 rounded-xl p-3 space-y-1.5">
                            {ev.details.map((d, j) => (
                              <div key={j} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className="font-semibold text-right ml-4">{d.value}</span>
                              </div>
                            ))}
                            {ev.maLo && (
                              <div className="pt-1.5 border-t border-border/60 flex justify-between text-xs">
                                <span className="text-muted-foreground">Mã lô</span>
                                <span className="font-mono font-bold text-primary">{ev.maLo}</span>
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
        )}
      </div>
    </AppLayout>
  );
}
