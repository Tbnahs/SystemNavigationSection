import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Star, Package, Box, Info } from "lucide-react";

const productColor: Record<string, string> = {
  "Hồng trà":  "bg-rose-100 text-rose-700",
  "Bạch trà":  "bg-sky-100 text-sky-700",
  "Chè xanh":  "bg-emerald-100 text-emerald-700",
};

const quyCachData = [
  { stt: 1, quyCach: "1 tôm",       donGia: "520.000 đ/kg",          moTa: "Búp non một tôm, không có lá", loaiChe: "Bạch trà" },
  { stt: 2, quyCach: "1 tôm 1 lá",  donGia: "27.000 – 30.000 đ/kg", moTa: "Búp và một lá non kèm theo",  loaiChe: "Hồng trà" },
  { stt: 3, quyCach: "1 tôm 2 lá",  donGia: "27.000 – 30.000 đ/kg", moTa: "Búp và hai lá non kèm theo",  loaiChe: "Chè xanh" },
  { stt: 4, quyCach: "2 lá",         donGia: "27.000 đ/kg",           moTa: "Hai lá non, không kèm búp",   loaiChe: "" },
];

const tichLuongData = [
  { stt: 1, danhGia: "70–79%",      donGia: "27.000 đ/kg",             mauSac: "bg-gray-100 text-gray-600" },
  { stt: 2, danhGia: "80–89%",      donGia: "28.000 đ/kg",             mauSac: "bg-blue-100 text-blue-700" },
  { stt: 3, danhGia: "90–99%",      donGia: "29.000 đ/kg",             mauSac: "bg-violet-100 text-violet-700" },
  { stt: 4, danhGia: "100%",        donGia: "30.000 đ/kg",             mauSac: "bg-emerald-100 text-emerald-700" },
  { stt: 5, danhGia: "Cây di sản",  donGia: "40.000 – 60.000 đ/kg",  mauSac: "bg-amber-100 text-amber-700" },
];

const tieuChuanData = [
  { tieu: "Độ non, già của búp chè",                  moTa: "Búp phải non, chưa mở lá hoàn toàn, màu xanh non đặc trưng" },
  { tieu: "Độ đồng đều của búp chè khi thu hái",      moTa: "Kích cỡ búp đồng đều, không lẫn lá già hay cành non" },
  { tieu: "Độ chuẩn chỉ khi thu hái",                 moTa: "Thu hái đúng quy cách (1 tôm / 1 tôm 1 lá / 1 tôm 2 lá)" },
];

export default function QualityPage() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout>
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Quy cách & Tiêu chuẩn chất lượng</h1>
          <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Chè Shan Tuyết Bằng Phúc</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quy cách thu mua */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-sm text-foreground">Quy cách thu mua</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["STT", "Quy cách", "Đơn giá", "Loại chè", "Mô tả"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quyCachData.map((row) => (
                  <tr key={row.stt} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.stt}</td>
                    <td className="py-3 px-4 font-semibold">{row.quyCach}</td>
                    <td className="py-3 px-4 font-mono text-sm text-primary font-semibold whitespace-nowrap">{row.donGia}</td>
                    <td className="py-3 px-4">
                      {row.loaiChe
                        ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.loaiChe] ?? "bg-gray-100 text-gray-600"}`}>{row.loaiChe}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.moTa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tiêu chuẩn chất lượng theo % */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Package className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-sm text-foreground">Tiêu chuẩn đánh giá chất lượng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["STT", "Mức đánh giá", "Đơn giá"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tichLuongData.map((row) => (
                  <tr key={row.stt} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-xs">{row.stt}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.mauSac}`}>{row.danhGia}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-primary whitespace-nowrap">{row.donGia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thang trượt minh họa */}
          <div className="px-5 pb-5 pt-3">
            <p className="text-xs font-semibold text-foreground mb-3">Thang giá theo chất lượng (% đạt)</p>
            <div className="flex items-end gap-1 h-16">
              {[
                { label: "70%", val: 27, color: "bg-gray-300" },
                { label: "80%", val: 28, color: "bg-blue-300" },
                { label: "90%", val: 29, color: "bg-violet-400" },
                { label: "100%", val: 30, color: "bg-emerald-400" },
                { label: "Di sản", val: 50, color: "bg-amber-400" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-bold text-foreground">{b.val}k</span>
                  <div className={`w-full rounded-t-md ${b.color}`} style={{ height: `${(b.val / 50) * 100}%` }} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tiêu chí đánh giá */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Info className="w-4 h-4 text-violet-500" />
            <h2 className="font-semibold text-sm text-foreground">Tiêu chí đánh giá tỷ lệ chất lượng</h2>
          </div>
          <div className="p-5 space-y-3">
            {tieuChuanData.map((item, i) => (
              <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-xl border border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">{i + 1}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.tieu}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.moTa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
