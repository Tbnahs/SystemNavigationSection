import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Leaf } from "lucide-react";

const QUY_CACH: Array<{ stt: number; quyCach: string; donGia: string; loaiChe: string; color: string; badge: string }> = [
  { stt: 1, quyCach: "1 tôm",      donGia: "27,000 – 30,000 đ/kg", loaiChe: "Chè xanh",  color: "bg-emerald-50 text-emerald-800 border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { stt: 2, quyCach: "1 tôm 1 lá", donGia: "50,000 đ/kg",          loaiChe: "Hồng trà",  color: "bg-rose-50 text-rose-800 border-rose-200",           badge: "bg-rose-100 text-rose-800 border-rose-300" },
  { stt: 3, quyCach: "1 tôm 2 lá", donGia: "27,000 – 30,000 đ/kg", loaiChe: "Bạch trà",  color: "bg-sky-50 text-sky-800 border-sky-200",              badge: "bg-sky-100 text-sky-800 border-sky-300" },
  { stt: 4, quyCach: "2 lá",       donGia: "27,000 đ/kg",           loaiChe: "Chè thường",color: "bg-amber-50 text-amber-800 border-amber-200",        badge: "bg-amber-100 text-amber-800 border-amber-300" },
  { stt: 5, quyCach: "Cây di sản", donGia: "40,000 – 60,000 đ/kg", loaiChe: "Đặc sản",   color: "bg-violet-50 text-violet-800 border-violet-200",     badge: "bg-violet-100 text-violet-800 border-violet-300" },
];

const QUALITY_PRICE = [
  { stt: 1, danhGia: "70 – 79%",   donGia: "27,000 đ/kg", xepLoai: "Đạt cơ bản" },
  { stt: 2, danhGia: "80 – 89%",   donGia: "28,000 đ/kg", xepLoai: "Khá" },
  { stt: 3, danhGia: "90 – 99%",   donGia: "29,000 đ/kg", xepLoai: "Tốt" },
  { stt: 4, danhGia: "100%",        donGia: "30,000 đ/kg", xepLoai: "Xuất sắc" },
  { stt: 5, danhGia: "Cây di sản", donGia: "40,000 – 60,000 đ/kg", xepLoai: "Di sản / Đặc sản" },
];

const TIEU_CHUAN = [
  { stt: "01", title: "Độ non, già của búp chè",        desc: "Búp phải non, đúng quy cách được chỉ định. Không hái già, không lẫn búp đen. Búp 1 tôm: chỉ lấy đỉnh búp cuộn. 1 tôm 2 lá: 2 lá non đầu tiên.", color: "bg-emerald-500" },
  { stt: "02", title: "Độ đồng đều khi thu hái",         desc: "Búp chè đồng đều về kích cỡ và độ trưởng thành. Không lẫn quy cách khác. Tỷ lệ lẫn không được vượt quá 3% theo khối lượng.", color: "bg-blue-500" },
  { stt: "03", title: "Độ chuẩn chỉ khi thu hái",        desc: "Thu hái đúng kỹ thuật: ngắt sát cuống, không dập nát, không để bị oxy hoá trước khi giao. Vận chuyển trong giỏ thoáng, không nén chặt.", color: "bg-amber-500" },
];

export default function QuyCachPage() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/module/erp")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Quy cách & Tiêu chuẩn</h1>
            <p className="text-sm text-muted-foreground">Bảng quy cách thu hái và đơn giá thu mua chè Shan Tuyết Bằng Phúc — HTX Hồng Hà</p>
          </div>
        </div>

        {/* Bảng 1: Quy cách & đơn giá */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20">
            <h2 className="font-semibold text-sm">Bảng quy cách thu hái & đơn giá</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ban hành theo quy định thu mua — áp dụng cho vụ thu hái 2026</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-12">STT</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Quy cách</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đơn giá</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Loại chè</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {QUY_CACH.map(row => (
                  <tr key={row.stt} className={`hover:bg-muted/10 transition-colors border-l-2 ${row.color}`}>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{row.stt}</td>
                    <td className="px-4 py-3 font-bold text-base">{row.quyCach}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{row.donGia}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-lg font-semibold border ${row.badge}`}>{row.loaiChe}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.stt === 2 ? "Giá cố định" : row.stt === 4 ? "Giá cố định" : row.stt === 5 ? "Giá cố định" : "Tính theo % chất lượng"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/20 border-t-2 border-border">
                  <td colSpan={2} className="px-4 py-2.5 text-xs font-bold text-muted-foreground">Tổng cộng</td>
                  <td colSpan={3} className="px-4 py-2.5 text-xs text-muted-foreground">5 quy cách · 3 loại chè chính</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng 2: Đơn giá theo % */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20">
            <h2 className="font-semibold text-sm">Bảng đơn giá theo % chất lượng</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Áp dụng cho: <strong>1 tôm</strong> (Chè xanh) và <strong>1 tôm 2 lá</strong> (Bạch trà)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-12">STT</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đánh giá %</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đơn giá</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {QUALITY_PRICE.map((row, i) => (
                  <tr key={row.stt} className={`hover:bg-muted/10 transition-colors ${i === 4 ? "bg-violet-50/50" : ""}`}>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{row.stt}</td>
                    <td className={`px-4 py-3 font-semibold ${i === 4 ? "text-violet-800" : ""}`}>{row.danhGia}</td>
                    <td className={`px-4 py-3 text-right font-bold ${i === 4 ? "text-violet-700" : "text-emerald-700"}`}>{row.donGia}</td>
                    <td className={`px-4 py-3 text-xs ${i === 4 ? "text-violet-600 font-medium" : "text-muted-foreground"}`}>{row.xepLoai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Tiêu chuẩn đánh giá */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/20">
            <h2 className="font-semibold text-sm">Tiêu chuẩn đánh giá tỉ lệ đạt chất lượng khi thu hái</h2>
          </div>
          <div className="divide-y divide-border/60">
            {TIEU_CHUAN.map(item => (
              <div key={item.stt} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/10 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className="text-white text-xs font-bold">{item.stt}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">* {item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
