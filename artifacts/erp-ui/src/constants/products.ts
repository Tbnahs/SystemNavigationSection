export interface SanPham {
  id: string;
  ten: string;
  maCode: string;
  donGia: number;
  tyLeKhoHao: number;
  ghiChu: string;
}

export const DANH_SACH_SAN_PHAM: SanPham[] = [
  { id: "1", ten: "Chè xanh",     maCode: "CX", donGia: 420000,  tyLeKhoHao: 23.9, ghiChu: "Tiêu chuẩn OCOP 4 sao" },
  { id: "2", ten: "Hồng trà",     maCode: "HT", donGia: 850000,  tyLeKhoHao: 22.0, ghiChu: "Sao vàng, ủ ẩm" },
  { id: "3", ten: "Bạch trà",     maCode: "BT", donGia: 1200000, tyLeKhoHao: 17.8, ghiChu: "Tôm trắng, phơi tự nhiên" },
  { id: "4", ten: "Phổ nhĩ",      maCode: "PN", donGia: 980000,  tyLeKhoHao: 24.5, ghiChu: "Lên men ủ ẩm 30 ngày" },
  { id: "5", ten: "Chè đặc biệt", maCode: "CD", donGia: 2500000, tyLeKhoHao: 18.0, ghiChu: "Cổ thụ 100+ năm" },
];

export const TEN_SAN_PHAM: string[] = DANH_SACH_SAN_PHAM.map(p => p.ten);

export const MAU_SAN_PHAM: Record<string, string> = {
  "Chè xanh":     "bg-emerald-100 text-emerald-700",
  "Hồng trà":     "bg-rose-100 text-rose-700",
  "Bạch trà":     "bg-sky-100 text-sky-700",
  "Phổ nhĩ":      "bg-amber-100 text-amber-700",
  "Chè đặc biệt": "bg-violet-100 text-violet-700",
};

export const QUY_CACH_OPTIONS: string[] = [
  "1 tôm",
  "1 tôm 1 lá",
  "1 tôm 2 lá",
  "2 lá không tôm",
];

export function getSanPhamByTen(ten: string): SanPham | undefined {
  return DANH_SACH_SAN_PHAM.find(p => p.ten === ten);
}
