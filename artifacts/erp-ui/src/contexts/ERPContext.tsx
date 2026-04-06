import { createContext, useContext, useState, useMemo, ReactNode } from "react";

/* ───────────────────────── Shared Types ───────────────────────── */
export type POStatus   = "yeu-cau"|"dat-hang"|"nhan-hang"|"qc"|"nhap-kho"|"thanh-toan";
export type QCResult   = "pending"|"pass"|"fail"|"reduce";
export type ThanhToanPO = "chua"|"mot-phan"|"da-thanh-toan";

export interface PurchaseOrder {
  id: string; maPO: string; maHo: string; tenHo: string; diaChi: string; sdt: string;
  maVuon: string; tenVuon: string; ngayTao: string; ngayGiao: string;
  quyCach: string; khoiLuongDat: number; khoiLuongNhan: number;
  donGia: number; chatLuong: number; qcResult: QCResult;
  trangThai: POStatus; thanhToan: ThanhToanPO;
  batchId: string; ghiChu: string; nguoiTao: string;
}

export interface RawReceipt {
  id: number; maPO: string; maHo: string; tenHo: string; diaChi: string;
  ngay: string; quyCach: string; khoiLuong: number; donGia: number;
  thanhTien: number; batchId: string;
}

export type ProdStatus = "ke-hoach"|"xuat-nvl"|"dang-che-bien"|"hoan-thanh"|"da-nhap-kho";
export interface LoSX {
  id: string; maLo: string; ngaySX: string; loaiChe: string; soHo: number;
  klNVL: number; klTP: number; tyLeKhoHao: number; trangThai: ProdStatus;
  cacMaBatch: string[]; batchTP: string; ghiChu: string;
}

export type PackStatus = "cho-dong-goi"|"dang-dong-goi"|"hoan-thanh"|"da-xuat-kho";
export interface LoDG {
  id: string; maDG: string; maLoSX: string; thoiGian: string; thanhPham: string;
  loaiBaoBi: string; klDG: number; soSP: number; trangThai: PackStatus;
  qrCode: string; nguoiTao: string; ghiChu: string;
}

export type OrderStatus = "bao-gia"|"xac-nhan"|"xuat-kho"|"dang-giao"|"hoan-thanh"|"huy";
export type ThanhToanSO = "chua"|"mot-phan"|"da-thanh-toan";
export type LoaiKhach   = "dai-ly"|"sieu-thi"|"xuat-khau"|"le";
export interface OrderLine {
  sanPham: string; loai: string; soLuong: number; donVi: string;
  donGia: number; thanhTien: number; maLoSX: string;
}
export interface SalesOrder {
  id: string; maDon: string; loaiKhach: LoaiKhach; khachHang: string;
  diaChi: string; sdt: string; ngayDat: string; ngayGiao: string;
  trangThai: OrderStatus; thanhToan: ThanhToanSO;
  sanPhams: OrderLine[]; tongTien: number; daThanhToan: number;
  ghiChu: string; nguoiTao: string; maVanDon: string;
  nguon?: "web" | "admin";
}

export type TonStatus = "binh-thuong"|"sap-het"|"het-hang";
export interface StockItem {
  id: string; maSP: string; tenSP: string; nhom: string; loai: string;
  donVi: string; tonDau: number; nhapKho: number; xuatKho: number; tonCuoi: number;
  donGia: number; trangThai: TonStatus; kho: string;
}
export interface BatchItem {
  id: string; batchId: string; loaiHang: string; maHo: string; tenHo: string;
  vung: string; ngayNhap: string; soLuong: number; tonCon: number; hanSD: string;
}
export interface MoveItem {
  id: string; maPhieu: string; loai: "nhap"|"xuat"; tenHang: string;
  batchId: string; soLuong: number; donVi: string; ngay: string;
  lyDo: string; nguoiTao: string;
}

export type AccTrangThai = "da-duyet"|"cho-duyet"|"tu-choi";
export type PhuongThuc  = "Tiền mặt"|"Chuyển khoản"|"Ví điện tử";
export interface Phieu {
  id: string; maPhieu: string; loai: "thu"|"chi"; doiTuong: string;
  danhMuc: string; soTien: number; ngay: string; phuongThuc: PhuongThuc;
  trangThai: AccTrangThai; ghiChu: string; nguoiTao: string;
}

/* ───────────────────────── Seed Data ───────────────────────── */
const PO_SEED: PurchaseOrder[] = [
  { id:"1", maPO:"PO-3003-001", maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng", sdt:"0354871949", maVuon:"NH004-V1", tenVuon:"Vườn Nà Hồng 1", ngayTao:"28/03/2026", ngayGiao:"30/03/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:15.0, khoiLuongNhan:13.5, donGia:27000, chatLuong:78, qcResult:"pass", trangThai:"thanh-toan", thanhToan:"da-thanh-toan", batchId:"RAW-NH004-3003", ghiChu:"", nguoiTao:"Nguyễn A" },
  { id:"2", maPO:"PO-3103-002", maHo:"NH008", tenHo:"Đồng Thị Khuyết",  diaChi:"Nà Hồng", sdt:"0962041090", maVuon:"NH008-V1", tenVuon:"Vườn Nà Hồng 1", ngayTao:"29/03/2026", ngayGiao:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:10.0, khoiLuongNhan:8.5,  donGia:28500, chatLuong:83, qcResult:"pass", trangThai:"thanh-toan", thanhToan:"da-thanh-toan", batchId:"RAW-NH008-3103", ghiChu:"", nguoiTao:"Nguyễn A" },
  { id:"3", maPO:"PO-3103-003", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",  sdt:"0349055299", maVuon:"NB010-V1", tenVuon:"Vườn Nà Bay 1",   ngayTao:"29/03/2026", ngayGiao:"31/03/2026", quyCach:"1 tôm",      khoiLuongDat:3.0,  khoiLuongNhan:2.5,  donGia:29000, chatLuong:98, qcResult:"pass", trangThai:"nhap-kho",   thanhToan:"mot-phan",    batchId:"RAW-NB010-3103", ghiChu:"1 tôm CL cao", nguoiTao:"Trần B" },
  { id:"4", maPO:"PO-0104-004", maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",  sdt:"0814665955", maVuon:"NB002-V1", tenVuon:"Vườn Nà Bay 1",   ngayTao:"01/04/2026", ngayGiao:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:50.0, khoiLuongNhan:44.0, donGia:29000, chatLuong:90, qcResult:"pass", trangThai:"nhap-kho",   thanhToan:"chua",         batchId:"RAW-NB002-0104", ghiChu:"", nguoiTao:"Nguyễn A" },
  { id:"5", maPO:"PO-0104-005", maHo:"NB013", tenHo:"Triệu Văn Cường",  diaChi:"Nà Bay",  sdt:"",           maVuon:"NB013-V1", tenVuon:"Vườn Nà Bay 1",   ngayTao:"01/04/2026", ngayGiao:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:60.0, khoiLuongNhan:50.0, donGia:29000, chatLuong:91, qcResult:"pass", trangThai:"qc",         thanhToan:"chua",         batchId:"",               ghiChu:"", nguoiTao:"Trần B" },
  { id:"6", maPO:"PO-0304-006", maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",  sdt:"0967186387", maVuon:"NB006-V1", tenVuon:"Vườn Nà Bay 1",   ngayTao:"03/04/2026", ngayGiao:"05/04/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:55.0, khoiLuongNhan:49.2, donGia:29000, chatLuong:89, qcResult:"pass", trangThai:"nhan-hang",  thanhToan:"chua",         batchId:"",               ghiChu:"", nguoiTao:"Nguyễn A" },
  { id:"7", maPO:"PO-0404-007", maHo:"NH009", tenHo:"Hạ Văn Thắng",     diaChi:"Nà Hồng", sdt:"0337318858", maVuon:"NH009-V2", tenVuon:"Vườn Nà Hồng 2", ngayTao:"04/04/2026", ngayGiao:"06/04/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:20.0, khoiLuongNhan:0,    donGia:29000, chatLuong:92, qcResult:"pending", trangThai:"dat-hang", thanhToan:"chua",       batchId:"",               ghiChu:"Dự kiến buổi sáng", nguoiTao:"Trần B" },
  { id:"8", maPO:"PO-0504-008", maHo:"BC002", tenHo:"Triệu Văn Dựng",   diaChi:"Bản Chang", sdt:"0343233785", maVuon:"BC002-V1", tenVuon:"Vườn Bản Chang 1", ngayTao:"05/04/2026", ngayGiao:"07/04/2026", quyCach:"1 tôm 2 lá", khoiLuongDat:25.0, khoiLuongNhan:0, donGia:28000, chatLuong:85, qcResult:"pending", trangThai:"yeu-cau", thanhToan:"chua",       batchId:"",               ghiChu:"", nguoiTao:"Nguyễn A" },
];

const RAW_RECEIPTS_SEED: RawReceipt[] = [
  { id:1,  maPO:"PO-3003-001", maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng", ngay:"30/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:13.50, donGia:27000, thanhTien:364500,  batchId:"RAW-NH004-3003" },
  { id:2,  maPO:"PO-3103-003", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",  ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:2.50,  donGia:29000, thanhTien:72500,   batchId:"RAW-NB010-3103" },
  { id:3,  maPO:"PO-3103-002", maHo:"NH008", tenHo:"Đồng Thị Khuyết",  diaChi:"Nà Hồng", ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:8.50,  donGia:28500, thanhTien:242250,  batchId:"RAW-NH008-3103" },
  { id:4,  maPO:"PO-0104-004", maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",  ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:44.00, donGia:29000, thanhTien:1276000, batchId:"RAW-NB002-0104" },
  { id:5,  maPO:"PO-0104-005", maHo:"NB013", tenHo:"Triệu Văn Cường",  diaChi:"Nà Bay",  ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:50.00, donGia:29000, thanhTien:1450000, batchId:"" },
  { id:6,  maPO:"PO-0304-006", maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",  ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:49.20, donGia:29000, thanhTien:1426800, batchId:"" },
  { id:7,  maPO:"",            maHo:"NH001", tenHo:"Hoàng Thị Luyến",  diaChi:"Nà Hồng", ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:3.20,  donGia:29000, thanhTien:92800,   batchId:"" },
  { id:8,  maPO:"",            maHo:"NH007", tenHo:"Hoàng Văn Tuấn",   diaChi:"Nà Hồng", ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:11.50, donGia:28000, thanhTien:322000,  batchId:"" },
  { id:9,  maPO:"",            maHo:"BC001", tenHo:"Hoàng Phúc Khôi",  diaChi:"Bản Chang", ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:12.40, donGia:28000, thanhTien:347200, batchId:"" },
  { id:10, maPO:"",            maHo:"NB004", tenHo:"Triệu Văn Mỹ",     diaChi:"Nà Bay",  ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:21.50, donGia:29000, thanhTien:623500,  batchId:"" },
];

const LOSX_SEED: LoSX[] = [
  { id:"1",  maLo:"L013003",  ngaySX:"30/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:25.5, klTP:5.6,  tyLeKhoHao:22.0, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NH004-3003","RAW-NB002-3003"], batchTP:"L013003",  ghiChu:"" },
  { id:"2",  maLo:"L023103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:3, klNVL:27.5, klTP:6.1,  tyLeKhoHao:22.2, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NH001-3103","RAW-NH002-3103","RAW-NH008-3103"], batchTP:"L023103",  ghiChu:"" },
  { id:"3",  maLo:"L033103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:28.5, klTP:6.3,  tyLeKhoHao:22.1, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NH009-3103","RAW-NH004-3103"], batchTP:"L033103",  ghiChu:"" },
  { id:"4",  maLo:"L043103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:22.0, klTP:4.8,  tyLeKhoHao:21.8, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NH006-3103","RAW-NH007-3103"], batchTP:"L043103",  ghiChu:"" },
  { id:"5",  maLo:"L053103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:1, klNVL:22.0, klTP:4.8,  tyLeKhoHao:21.8, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NH007-3103"],               batchTP:"L053103",  ghiChu:"" },
  { id:"6",  maLo:"L063103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:18.5, klTP:4.1,  tyLeKhoHao:22.2, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NB009-3103","RAW-NB010-3103"],batchTP:"L063103",  ghiChu:"" },
  { id:"7",  maLo:"L073103",  ngaySX:"31/03/2026", loaiChe:"Bạch trà",  soHo:4, klNVL:9.5,  klTP:1.7,  tyLeKhoHao:17.9, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NB010-3103","RAW-NB001-3103","RAW-NB002-3103","RAW-NB007-3103"], batchTP:"L073103", ghiChu:"Tôm trắng đặc sản" },
  { id:"8",  maLo:"L083103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:1, klNVL:9.3,  klTP:2.0,  tyLeKhoHao:21.5, trangThai:"da-nhap-kho", cacMaBatch:["RAW-NH010-3103"],               batchTP:"L083103",  ghiChu:"" },
  { id:"9",  maLo:"L09104",   ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:24.7, klTP:5.9,  tyLeKhoHao:23.9, trangThai:"hoan-thanh",  cacMaBatch:["RAW-NH001-0104","RAW-NH004-0104"],batchTP:"L09104",   ghiChu:"" },
  { id:"10", maLo:"L010104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:3, klNVL:31.5, klTP:7.5,  tyLeKhoHao:23.8, trangThai:"hoan-thanh",  cacMaBatch:["RAW-NB011-0104","RAW-NB012-0104","RAW-NB010-0104"], batchTP:"L010104", ghiChu:"" },
  { id:"11", maLo:"L011104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:55.2, klTP:13.2, tyLeKhoHao:23.9, trangThai:"hoan-thanh",  cacMaBatch:["RAW-NB013-0104","RAW-NB002-0104"],batchTP:"L011104",  ghiChu:"" },
  { id:"12", maLo:"L012104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:45.0, klTP:10.8, tyLeKhoHao:24.0, trangThai:"hoan-thanh",  cacMaBatch:["RAW-NB004-0104","RAW-NB001-0104"],batchTP:"L012104",  ghiChu:"" },
  { id:"13", maLo:"L013104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:23.8, klTP:5.7,  tyLeKhoHao:24.0, trangThai:"hoan-thanh",  cacMaBatch:["RAW-NB006-0104"],               batchTP:"L013104",  ghiChu:"" },
  { id:"14", maLo:"L014104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:3, klNVL:26.4, klTP:0,    tyLeKhoHao:0,    trangThai:"dang-che-bien",cacMaBatch:["RAW-NH007-0104","RAW-NH003-0104","RAW-NH010-0104"], batchTP:"",       ghiChu:"" },
  { id:"15", maLo:"L015104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:11.7, klTP:0,    tyLeKhoHao:0,    trangThai:"dang-che-bien",cacMaBatch:["RAW-BC003-0104"],               batchTP:"",         ghiChu:"" },
  { id:"16", maLo:"L016104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:25.5, klTP:0,    tyLeKhoHao:0,    trangThai:"xuat-nvl",     cacMaBatch:["RAW-NH006-0104","RAW-NH008-0104"],batchTP:"",        ghiChu:"" },
  { id:"17", maLo:"L017104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:34.5, klTP:0,    tyLeKhoHao:0,    trangThai:"xuat-nvl",     cacMaBatch:["RAW-NB009-0104"],               batchTP:"",         ghiChu:"" },
  { id:"18", maLo:"L018104",  ngaySX:"02/04/2026", loaiChe:"Phổ nhĩ",   soHo:2, klNVL:22.0, klTP:0,    tyLeKhoHao:0,    trangThai:"ke-hoach",     cacMaBatch:[],                               batchTP:"",         ghiChu:"Kế hoạch T4" },
  { id:"19", maLo:"L019104",  ngaySX:"03/04/2026", loaiChe:"Bạch trà",  soHo:2, klNVL:8.0,  klTP:0,    tyLeKhoHao:0,    trangThai:"ke-hoach",     cacMaBatch:[],                               batchTP:"",         ghiChu:"Đơn KH-003" },
];

const LODG_SEED: LoDG[] = [
  { id:"1",  maDG:"S013003",  maLoSX:"L013003", thoiGian:"30/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g", klDG:5.5,  soSP:22, trangThai:"da-xuat-kho",  qrCode:"QR-S013003", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"2",  maDG:"S023103",  maLoSX:"L023103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g", klDG:6.0,  soSP:24, trangThai:"da-xuat-kho",  qrCode:"QR-S023103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"3",  maDG:"S033103",  maLoSX:"L033103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g", klDG:6.2,  soSP:25, trangThai:"da-xuat-kho",  qrCode:"QR-S033103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"4",  maDG:"S043103",  maLoSX:"L043103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",  klDG:4.7,  soSP:47, trangThai:"da-xuat-kho",  qrCode:"QR-S043103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"5",  maDG:"S053103",  maLoSX:"L053103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",  klDG:4.7,  soSP:47, trangThai:"da-xuat-kho",  qrCode:"QR-S053103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"6",  maDG:"S063103",  maLoSX:"L063103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",  klDG:4.0,  soSP:40, trangThai:"da-xuat-kho",  qrCode:"QR-S063103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"7",  maDG:"S073103",  maLoSX:"L073103", thoiGian:"31/03/2026", thanhPham:"Bạch trà",  loaiBaoBi:"tui-kraft-50g",  klDG:1.65, soSP:33, trangThai:"da-xuat-kho",  qrCode:"QR-S073103", nguoiTao:"HTX Hồng Hà", ghiChu:"Tôm trắng" },
  { id:"8",  maDG:"S083103",  maLoSX:"L083103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"tui-kraft-50g",  klDG:1.95, soSP:39, trangThai:"da-xuat-kho",  qrCode:"QR-S083103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"9",  maDG:"S09104",   maLoSX:"L09104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:5.8,  soSP:58, trangThai:"hoan-thanh",   qrCode:"QR-S09104",  nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"10", maDG:"S010104",  maLoSX:"L010104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:7.4,  soSP:74, trangThai:"hoan-thanh",   qrCode:"QR-S010104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"11", maDG:"S011104",  maLoSX:"L011104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",   klDG:13.0, soSP:13, trangThai:"hoan-thanh",   qrCode:"QR-S011104", nguoiTao:"HTX Hồng Hà", ghiChu:"Bulk NPP" },
  { id:"12", maDG:"S012104",  maLoSX:"L012104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",   klDG:10.5, soSP:11, trangThai:"hoan-thanh",   qrCode:"QR-S012104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"13", maDG:"S013104",  maLoSX:"L013104", thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-qua-tang",   klDG:5.5,  soSP:28, trangThai:"dang-dong-goi",qrCode:"",           nguoiTao:"HTX Hồng Hà", ghiChu:"Lotte Mart" },
  { id:"14", maDG:"S014104",  maLoSX:"L09104",  thoiGian:"02/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:0.8,  soSP:8,  trangThai:"cho-dong-goi", qrCode:"",           nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"15", maDG:"S015104",  maLoSX:"L073103", thoiGian:"03/04/2026", thanhPham:"Bạch trà",  loaiBaoBi:"hop-qua-tang",   klDG:0.3,  soSP:2,  trangThai:"cho-dong-goi", qrCode:"",           nguoiTao:"HTX Hồng Hà", ghiChu:"KH-003" },
];

const SALES_SEED: SalesOrder[] = [
  { id:"1", maDon:"SO-2603-001", loaiKhach:"dai-ly",    khachHang:"Cty TNHH Trà Thái Nguyên",   diaChi:"TP. Thái Nguyên",   sdt:"0208 3856 123", ngayDat:"26/03/2026", ngayGiao:"02/04/2026", trangThai:"hoan-thanh", thanhToan:"da-thanh-toan", daThanhToan:23000000, maVanDon:"VD-2026-0312", nguoiTao:"Nguyễn A", ghiChu:"Giao nguyên kiện", sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:20, donVi:"kg", donGia:850000,  thanhTien:17000000, maLoSX:"L013003" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:5, donVi:"kg", donGia:1200000, thanhTien:6000000, maLoSX:"L073103" }], tongTien:23000000 },
  { id:"2", maDon:"SO-2803-002", loaiKhach:"sieu-thi",  khachHang:"Siêu thị Lotte Mart Hà Nội", diaChi:"Đống Đa, Hà Nội",   sdt:"024 3562 7890", ngayDat:"28/03/2026", ngayGiao:"08/04/2026", trangThai:"dang-giao",  thanhToan:"mot-phan",    daThanhToan:10000000, maVanDon:"VD-2026-0401", nguoiTao:"Trần B",    ghiChu:"Hộp quà tặng",    sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:8,  donVi:"kg", donGia:1200000, thanhTien:9600000,  maLoSX:"L073103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:12, donVi:"kg", donGia:850000, thanhTien:10200000, maLoSX:"L043103" }], tongTien:19800000 },
  { id:"3", maDon:"SO-0104-003", loaiKhach:"xuat-khau", khachHang:"Cty CP XNK Hà Nội",          diaChi:"Hà Nội",             sdt:"024 3825 6789", ngayDat:"01/04/2026", ngayGiao:"10/04/2026", trangThai:"xuat-kho",   thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             nguoiTao:"Nguyễn A", ghiChu:"OCOP + CO/CQ",     sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:30, donVi:"kg", donGia:850000, thanhTien:25500000, maLoSX:"L023103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:10, donVi:"kg", donGia:1200000, thanhTien:12000000, maLoSX:"L073103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:20, donVi:"kg", donGia:420000, thanhTien:8400000, maLoSX:"L09104" }], tongTien:45900000 },
  { id:"4", maDon:"SO-0204-004", loaiKhach:"sieu-thi",  khachHang:"WinMart Hà Nội",              diaChi:"Cầu Giấy, Hà Nội",  sdt:"024 3901 2345", ngayDat:"02/04/2026", ngayGiao:"09/04/2026", trangThai:"xac-nhan",   thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             nguoiTao:"Trần B",    ghiChu:"",                 sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:50, donVi:"kg", donGia:420000, thanhTien:21000000, maLoSX:"L010104" }], tongTien:21000000 },
  { id:"5", maDon:"SO-0304-005", loaiKhach:"le",        khachHang:"Quán trà Sen – Đỗ Thị Mai",  diaChi:"Quận 1, TP.HCM",    sdt:"090 3456 789",  ngayDat:"03/04/2026", ngayGiao:"12/04/2026", trangThai:"bao-gia",    thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             nguoiTao:"Lê C",      ghiChu:"KH mới",           sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:5, donVi:"kg", donGia:420000, thanhTien:2100000, maLoSX:"L011104" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:2, donVi:"kg", donGia:850000, thanhTien:1700000, maLoSX:"L033103" }], tongTien:3800000 },
  { id:"6", maDon:"SO-0304-006", loaiKhach:"dai-ly",    khachHang:"NPP Hoàng Phát – Bắc Giang", diaChi:"Bắc Giang",          sdt:"0204 3987 654", ngayDat:"03/04/2026", ngayGiao:"09/04/2026", trangThai:"bao-gia",    thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             nguoiTao:"Nguyễn A", ghiChu:"Bulk đại lý",      sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:100, donVi:"kg", donGia:380000, thanhTien:38000000, maLoSX:"L012104" }], tongTien:38000000 },
];

const PHIEU_SEED: Phieu[] = [
  { id:"1",  maPhieu:"PT-0401", loai:"thu", doiTuong:"Cty TNHH Trà Thái Nguyên",    danhMuc:"Doanh thu bán hàng",  soTien:23000000, ngay:"2026-03-26", phuongThuc:"Chuyển khoản", trangThai:"da-duyet",  ghiChu:"SO-2603-001", nguoiTao:"Nguyễn A" },
  { id:"2",  maPhieu:"PT-0402", loai:"thu", doiTuong:"HTX Chè Tân Cương",            danhMuc:"Doanh thu bán hàng",  soTien:21000000, ngay:"2026-03-28", phuongThuc:"Chuyển khoản", trangThai:"da-duyet",  ghiChu:"SO-2803-002", nguoiTao:"Trần B" },
  { id:"3",  maPhieu:"PT-0403", loai:"thu", doiTuong:"Cty CP XNK Hà Nội",            danhMuc:"Doanh thu bán hàng",  soTien:45900000, ngay:"2026-04-01", phuongThuc:"Chuyển khoản", trangThai:"cho-duyet", ghiChu:"SO-0104-003", nguoiTao:"Nguyễn A" },
  { id:"4",  maPhieu:"PT-0404", loai:"thu", doiTuong:"Siêu thị Lotte Mart",          danhMuc:"Doanh thu bán hàng",  soTien:19800000, ngay:"2026-04-02", phuongThuc:"Chuyển khoản", trangThai:"cho-duyet", ghiChu:"SO-2803-002", nguoiTao:"Trần B" },
  { id:"5",  maPhieu:"PT-0405", loai:"thu", doiTuong:"Hỗ trợ OCOP Hà Giang",        danhMuc:"Hỗ trợ nhà nước",     soTien:30000000, ngay:"2026-04-01", phuongThuc:"Chuyển khoản", trangThai:"da-duyet",  ghiChu:"Hỗ trợ vùng NL", nguoiTao:"Nguyễn A" },
  { id:"6",  maPhieu:"PT-0406", loai:"thu", doiTuong:"Quán trà Sen – Đỗ Thị Mai",   danhMuc:"Doanh thu bán hàng",  soTien:3800000,  ngay:"2026-04-03", phuongThuc:"Tiền mặt",    trangThai:"cho-duyet", ghiChu:"SO-0304-005", nguoiTao:"Nguyễn A" },
  { id:"7",  maPhieu:"PC-0401", loai:"chi", doiTuong:"Triệu Văn Thạo (NH004)",      danhMuc:"Thu mua nguyên liệu", soTien:364500,   ngay:"2026-03-30", phuongThuc:"Tiền mặt",    trangThai:"da-duyet",  ghiChu:"PO-3003-001", nguoiTao:"Lê C" },
  { id:"8",  maPhieu:"PC-0402", loai:"chi", doiTuong:"Mạnh Văn Hồ (NB010)",         danhMuc:"Thu mua nguyên liệu", soTien:1300000,  ngay:"2026-03-31", phuongThuc:"Tiền mặt",    trangThai:"da-duyet",  ghiChu:"PO-3103-003", nguoiTao:"Lê C" },
  { id:"9",  maPhieu:"PC-0403", loai:"chi", doiTuong:"Nhân viên HTX (12 người)",     danhMuc:"Lương tháng 3/2026",  soTien:52000000, ngay:"2026-03-31", phuongThuc:"Chuyển khoản", trangThai:"da-duyet",  ghiChu:"Lương + phụ cấp", nguoiTao:"Nguyễn A" },
  { id:"10", maPhieu:"PC-0404", loai:"chi", doiTuong:"Cty in ấn Hà Giang",           danhMuc:"Bao bì đóng gói",     soTien:8500000,  ngay:"2026-04-01", phuongThuc:"Chuyển khoản", trangThai:"da-duyet",  ghiChu:"Đặt bao bì Q2", nguoiTao:"Trần B" },
  { id:"11", maPhieu:"PC-0405", loai:"chi", doiTuong:"Nông Văn Nghiễm (NB002)",      danhMuc:"Thu mua nguyên liệu", soTien:1276000,  ngay:"2026-04-01", phuongThuc:"Tiền mặt",    trangThai:"cho-duyet", ghiChu:"PO-0104-004", nguoiTao:"Lê C" },
  { id:"12", maPhieu:"PC-0406", loai:"chi", doiTuong:"Điện lực Hà Giang",            danhMuc:"Điện sản xuất",       soTien:3200000,  ngay:"2026-03-28", phuongThuc:"Chuyển khoản", trangThai:"da-duyet",  ghiChu:"Điện tháng 3", nguoiTao:"Nguyễn A" },
  { id:"13", maPhieu:"PC-0407", loai:"chi", doiTuong:"Nhiên liệu vận chuyển",         danhMuc:"Vận hành",            soTien:4500000,  ngay:"2026-04-03", phuongThuc:"Tiền mặt",    trangThai:"cho-duyet", ghiChu:"Xăng dầu T4", nguoiTao:"Trần B" },
  { id:"14", maPhieu:"PC-0408", loai:"chi", doiTuong:"Bảo dưỡng máy sao chè",        danhMuc:"Bảo trì thiết bị",    soTien:6800000,  ngay:"2026-03-20", phuongThuc:"Tiền mặt",    trangThai:"da-duyet",  ghiChu:"Thay phụ tùng", nguoiTao:"Lê C" },
  { id:"15", maPhieu:"PC-0409", loai:"chi", doiTuong:"Kiểm định VSATTP",              danhMuc:"Pháp lý",             soTien:5000000,  ngay:"2026-03-15", phuongThuc:"Chuyển khoản", trangThai:"tu-choi",   ghiChu:"Gia hạn giấy phép", nguoiTao:"Nguyễn A" },
];

/* ───────────────────────── Context ───────────────────────── */
interface ERPContextType {
  /* Core state */
  purchaseOrders: PurchaseOrder[];    setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  rawReceipts: RawReceipt[];          setRawReceipts: React.Dispatch<React.SetStateAction<RawReceipt[]>>;
  productionBatches: LoSX[];          setProductionBatches: React.Dispatch<React.SetStateAction<LoSX[]>>;
  packagingLots: LoDG[];              setPackagingLots: React.Dispatch<React.SetStateAction<LoDG[]>>;
  salesOrders: SalesOrder[];          setSalesOrders: React.Dispatch<React.SetStateAction<SalesOrder[]>>;
  accountingEntries: Phieu[];         setAccountingEntries: React.Dispatch<React.SetStateAction<Phieu[]>>;

  /* Derived cross-module lookups */
  availableProductionBatches: LoSX[];        // For Packaging form dropdown
  availableLotsForSales: { maLoSX: string; thanhPham: string; klCon: number }[]; // For Sales form

  /* Dashboard summary (all computed from context state) */
  summary: {
    totalPurchaseKg: number;
    totalPurchaseCost: number;
    activePOs: number;
    totalProductionBatches: number;
    completedProductionKg: number;
    pendingPackaging: number;
    totalSalesRevenue: number;
    totalSalesOrders: number;
    completedSales: number;
    totalReceivable: number;
    totalPayable: number;
  };

  /* Cross-module actions */
  advancePOToNhapKho: (poId: string) => void;
  advanceProductionToNhapKho: (loId: string) => void;
  createAccountingEntryFromPO: (po: PurchaseOrder) => void;
  createAccountingEntryFromSO: (so: SalesOrder) => void;
}

const ERPContext = createContext<ERPContextType | null>(null);

export function ERPProvider({ children }: { children: ReactNode }) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(PO_SEED);
  const [rawReceipts, setRawReceipts]       = useState<RawReceipt[]>(RAW_RECEIPTS_SEED);
  const [productionBatches, setProductionBatches] = useState<LoSX[]>(LOSX_SEED);
  const [packagingLots, setPackagingLots]   = useState<LoDG[]>(LODG_SEED);
  const [salesOrders, setSalesOrders]       = useState<SalesOrder[]>(SALES_SEED);
  const [accountingEntries, setAccountingEntries] = useState<Phieu[]>(PHIEU_SEED);

  /* Production batches ready for packaging (hoàn thành or đã nhập kho) */
  const availableProductionBatches = useMemo(() =>
    productionBatches.filter(b => b.trangThai === "hoan-thanh" || b.trangThai === "da-nhap-kho"),
    [productionBatches]
  );

  /* Packaging lots for sales form — group by product */
  const availableLotsForSales = useMemo(() => {
    const map = new Map<string, { maLoSX: string; thanhPham: string; klCon: number }>();
    packagingLots.forEach(l => {
      if (l.trangThai === "hoan-thanh" || l.trangThai === "da-xuat-kho") {
        const existing = map.get(l.maLoSX);
        if (!existing) map.set(l.maLoSX, { maLoSX: l.maLoSX, thanhPham: l.thanhPham, klCon: l.klDG });
        else existing.klCon += l.klDG;
      }
    });
    return Array.from(map.values());
  }, [packagingLots]);

  /* Dashboard summary */
  const summary = useMemo(() => {
    const totalPurchaseKg   = rawReceipts.reduce((s, r) => s + r.khoiLuong, 0);
    const totalPurchaseCost = rawReceipts.reduce((s, r) => s + r.thanhTien, 0);
    const activePOs = purchaseOrders.filter(p => !["thanh-toan","nhap-kho"].includes(p.trangThai)).length;
    const completedProd = productionBatches.filter(b => b.trangThai === "hoan-thanh" || b.trangThai === "da-nhap-kho");
    const completedProductionKg = completedProd.reduce((s, b) => s + b.klTP, 0);
    const pendingPackaging = packagingLots.filter(l => l.trangThai !== "da-xuat-kho").length;
    const totalSalesRevenue = salesOrders.filter(o => o.trangThai !== "huy").reduce((s, o) => s + o.tongTien, 0);
    const completedSales    = salesOrders.filter(o => o.trangThai === "hoan-thanh").length;
    const totalReceivable   = salesOrders.filter(o => o.trangThai !== "huy").reduce((s, o) => s + (o.tongTien - o.daThanhToan), 0);
    const totalPayable      = purchaseOrders.filter(p => p.thanhToan !== "da-thanh-toan" && p.khoiLuongNhan > 0)
                               .reduce((s, p) => s + p.khoiLuongNhan * p.donGia, 0);
    return {
      totalPurchaseKg, totalPurchaseCost, activePOs,
      totalProductionBatches: productionBatches.length,
      completedProductionKg, pendingPackaging,
      totalSalesRevenue, totalSalesOrders: salesOrders.length,
      completedSales, totalReceivable, totalPayable,
    };
  }, [purchaseOrders, rawReceipts, productionBatches, packagingLots, salesOrders]);

  /* ── Cross-module action: Advance PO to nhập kho → auto-create phiếu chi ── */
  const advancePOToNhapKho = (poId: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po;
      if (po.trangThai !== "qc") return po;
      const batchId = po.batchId || `RAW-${po.maHo}-${po.ngayGiao.replace(/\//g, "").slice(0, 6)}`;
      return { ...po, trangThai: "nhap-kho", batchId };
    }));
  };

  /* ── Cross-module action: Production → nhập kho TP ── */
  const advanceProductionToNhapKho = (loId: string) => {
    setProductionBatches(prev => prev.map(lo => {
      if (lo.id !== loId || lo.trangThai !== "hoan-thanh") return lo;
      const klTP = lo.klTP || parseFloat((lo.klNVL * (lo.loaiChe === "Bạch trà" ? 0.178 : 0.239)).toFixed(1));
      const tyLe = parseFloat(((klTP / lo.klNVL) * 100).toFixed(1));
      return { ...lo, trangThai: "da-nhap-kho", klTP, tyLeKhoHao: tyLe, batchTP: lo.maLo };
    }));
  };

  /* ── Auto-create phiếu chi khi mua hàng hoàn tất ── */
  const createAccountingEntryFromPO = (po: PurchaseOrder) => {
    const thanhTien = po.khoiLuongNhan * po.donGia;
    if (!thanhTien) return;
    const exists = accountingEntries.some(p => p.ghiChu === po.maPO && p.loai === "chi");
    if (exists) return;
    const newPhieu: Phieu = {
      id: String(Date.now()), maPhieu: `PC-AUTO-${po.maPO}`, loai: "chi",
      doiTuong: `${po.tenHo} (${po.maHo})`, danhMuc: "Thu mua nguyên liệu",
      soTien: thanhTien, ngay: new Date().toISOString().slice(0, 10),
      phuongThuc: "Tiền mặt", trangThai: "cho-duyet", ghiChu: po.maPO, nguoiTao: "Hệ thống",
    };
    setAccountingEntries(prev => [newPhieu, ...prev]);
  };

  /* ── Auto-create phiếu thu khi bán hàng hoàn tất ── */
  const createAccountingEntryFromSO = (so: SalesOrder) => {
    const exists = accountingEntries.some(p => p.ghiChu === so.maDon && p.loai === "thu");
    if (exists) return;
    const newPhieu: Phieu = {
      id: String(Date.now()), maPhieu: `PT-AUTO-${so.maDon}`, loai: "thu",
      doiTuong: so.khachHang, danhMuc: "Doanh thu bán hàng",
      soTien: so.tongTien, ngay: new Date().toISOString().slice(0, 10),
      phuongThuc: "Chuyển khoản", trangThai: "cho-duyet", ghiChu: so.maDon, nguoiTao: "Hệ thống",
    };
    setAccountingEntries(prev => [newPhieu, ...prev]);
  };

  return (
    <ERPContext.Provider value={{
      purchaseOrders, setPurchaseOrders,
      rawReceipts, setRawReceipts,
      productionBatches, setProductionBatches,
      packagingLots, setPackagingLots,
      salesOrders, setSalesOrders,
      accountingEntries, setAccountingEntries,
      availableProductionBatches,
      availableLotsForSales,
      summary,
      advancePOToNhapKho,
      advanceProductionToNhapKho,
      createAccountingEntryFromPO,
      createAccountingEntryFromSO,
    }}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error("useERP must be used within ERPProvider");
  return ctx;
}
