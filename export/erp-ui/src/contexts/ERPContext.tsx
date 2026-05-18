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
  diaChi: string; sdt: string; mst?: string; ngayDat: string; ngayGiao: string;
  trangThai: OrderStatus; thanhToan: ThanhToanSO;
  sanPhams: OrderLine[]; tongTien: number; daThanhToan: number;
  chietKhau: number; vat: number; dieuKhoanTT: string; donViVC: string;
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
  /* ── 30/03/2026 ── */
  { id:1,  maPO:"PO-3003-001", maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng",   ngay:"30/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:13.50, donGia:27000,  thanhTien:364500,  batchId:"NH0043003" },
  { id:2,  maPO:"",            maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",     ngay:"30/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:12.00, donGia:27000,  thanhTien:324000,  batchId:"NB0023003" },
  /* ── 31/03/2026 – 1 tôm 2 lá ── */
  { id:3,  maPO:"PO-3103-002", maHo:"NH008", tenHo:"Đồng Thị Khuyết",  diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:8.50,  donGia:28500,  thanhTien:242250,  batchId:"NH0083103" },
  { id:4,  maPO:"",            maHo:"NH001", tenHo:"Hoàng Thị Luyến",  diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:10.00, donGia:28000,  thanhTien:280000,  batchId:"NH0013103" },
  { id:5,  maPO:"",            maHo:"NH002", tenHo:"Hoàng Thị Đào",    diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:9.00,  donGia:28000,  thanhTien:252000,  batchId:"NH0023103" },
  { id:6,  maPO:"",            maHo:"NH009", tenHo:"Hạ Văn Thắng",     diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:3.00,  donGia:27000,  thanhTien:81000,   batchId:"NH0093103" },
  { id:7,  maPO:"",            maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:25.50, donGia:28000,  thanhTien:714000,  batchId:"NH0043103" },
  { id:8,  maPO:"",            maHo:"NH006", tenHo:"Triệu Văn Hòa",    diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:15.00, donGia:28000,  thanhTien:420000,  batchId:"NH0063103" },
  { id:9,  maPO:"",            maHo:"NH008", tenHo:"Đồng Thị Khuyết",  diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:8.50,  donGia:28500,  thanhTien:242250,  batchId:"NH0083103" },
  { id:10, maPO:"",            maHo:"NH007", tenHo:"Hoàng Văn Tuấn",   diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:22.00, donGia:27000,  thanhTien:594000,  batchId:"NH0073103" },
  { id:11, maPO:"",            maHo:"NB009", tenHo:"Triệu Văn Hánh",   diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:13.50, donGia:28000,  thanhTien:378000,  batchId:"NB0093103" },
  { id:12, maPO:"PO-3103-003", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",    ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:5.00,  donGia:29000,  thanhTien:145000,  batchId:"NB0103103" },
  { id:13, maPO:"",            maHo:"NH010", tenHo:"Dương Thị Tươi",   diaChi:"Nà Hồng",   ngay:"31/03/2026", quyCach:"1 tôm 2 lá", khoiLuong:9.30,  donGia:27000,  thanhTien:251100,  batchId:"NH0103103" },
  /* ── 31/03/2026 – 1 tôm (Bạch trà) ── */
  { id:14, maPO:"PO-3103-003", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",    ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:2.50,  donGia:520000, thanhTien:1300000, batchId:"NB0103103" },
  { id:15, maPO:"",            maHo:"NB001", tenHo:"Nông Thị Dung",    diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:1.80,  donGia:520000, thanhTien:936000,  batchId:"NB0013103" },
  { id:16, maPO:"",            maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:2.80,  donGia:520000, thanhTien:1456000, batchId:"NB0023103" },
  { id:17, maPO:"",            maHo:"NB007", tenHo:"Nguyễn Văn Hân",   diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:2.37,  donGia:520000, thanhTien:1232400, batchId:"NB0073103" },
  { id:18, maPO:"",            maHo:"NB009", tenHo:"Triệu Văn Hánh",   diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:0.40,  donGia:520000, thanhTien:208000,  batchId:"NB0093103" },
  { id:19, maPO:"",            maHo:"NB004", tenHo:"Triệu Văn Mỹ",     diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:1.05,  donGia:520000, thanhTien:546000,  batchId:"NB0043103" },
  { id:20, maPO:"",            maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",     ngay:"31/03/2026", quyCach:"1 tôm",      khoiLuong:4.90,  donGia:520000, thanhTien:2548000, batchId:"NB0063103" },
  /* ── 01/04/2026 – 1 tôm 2 lá ── */
  { id:21, maPO:"",            maHo:"NH001", tenHo:"Hoàng Thị Luyến",  diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:3.20,  donGia:29000,  thanhTien:92800,   batchId:"NH001104" },
  { id:22, maPO:"",            maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:21.50, donGia:29000,  thanhTien:623500,  batchId:"NH004104" },
  { id:23, maPO:"",            maHo:"NB011", tenHo:"Hoàng Thị Điềm",   diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:5.00,  donGia:29000,  thanhTien:145000,  batchId:"NB011104" },
  { id:24, maPO:"",            maHo:"NB012", tenHo:"Lâm Thị Tới",      diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:11.50, donGia:29000,  thanhTien:333500,  batchId:"NB012104" },
  { id:25, maPO:"PO-3103-003", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",    ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:15.00, donGia:29000,  thanhTien:435000,  batchId:"NB010104" },
  { id:26, maPO:"PO-0104-005", maHo:"NB013", tenHo:"Triệu Văn Cường",  diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:35.70, donGia:29000,  thanhTien:1035300, batchId:"NB013104" },
  { id:27, maPO:"PO-0104-004", maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:19.30, donGia:29000,  thanhTien:559700,  batchId:"NB002104" },
  { id:28, maPO:"",            maHo:"NB004", tenHo:"Triệu Văn Mỹ",     diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:13.40, donGia:29000,  thanhTien:388600,  batchId:"NB004104" },
  { id:29, maPO:"",            maHo:"NB001", tenHo:"Nông Thị Dung",    diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:31.50, donGia:29000,  thanhTien:913500,  batchId:"NB001104" },
  { id:30, maPO:"PO-0304-006", maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:23.80, donGia:29000,  thanhTien:690200,  batchId:"NB006104" },
  { id:31, maPO:"",            maHo:"NH007", tenHo:"Hoàng Văn Tuấn",   diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:11.50, donGia:28000,  thanhTien:322000,  batchId:"NH007104" },
  { id:32, maPO:"",            maHo:"NH003", tenHo:"Phạm Thị Huyền",   diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:4.60,  donGia:28000,  thanhTien:128800,  batchId:"NH003104" },
  { id:33, maPO:"",            maHo:"NH010", tenHo:"Dương Thị Tươi",   diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:6.30,  donGia:28000,  thanhTien:176400,  batchId:"NH010104" },
  { id:34, maPO:"",            maHo:"BC003", tenHo:"Hoàng Văn Mỹ",     diaChi:"Bản Chang",  ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:11.70, donGia:28000,  thanhTien:327600,  batchId:"BC003104" },
  { id:35, maPO:"",            maHo:"NH006", tenHo:"Triệu Văn Hòa",    diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:16.50, donGia:28000,  thanhTien:462000,  batchId:"NH006104" },
  { id:36, maPO:"",            maHo:"NH008", tenHo:"Đồng Thị Khuyết",  diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:9.00,  donGia:28000,  thanhTien:252000,  batchId:"NH008104" },
  { id:37, maPO:"",            maHo:"NB009", tenHo:"Triệu Văn Hánh",   diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:34.50, donGia:27000,  thanhTien:931500,  batchId:"NB009104" },
  { id:38, maPO:"PO-0404-007", maHo:"NH009", tenHo:"Hạ Văn Thắng",     diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:18.00, donGia:29000,  thanhTien:522000,  batchId:"NH009104" },
  { id:39, maPO:"",            maHo:"NH002", tenHo:"Hoàng Thị Đào",    diaChi:"Nà Hồng",   ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:13.50, donGia:29000,  thanhTien:391500,  batchId:"NH002104" },
  { id:40, maPO:"",            maHo:"NB011", tenHo:"Hoàng Thị Điềm",   diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:0.60,  donGia:40000,  thanhTien:24000,   batchId:"NB011104" },
  { id:41, maPO:"",            maHo:"NB011", tenHo:"Hoàng Thị Điềm",   diaChi:"Nà Bay",     ngay:"01/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:0.60,  donGia:40000,  thanhTien:24000,   batchId:"NB011104" },
  /* ── 03/04/2026 – 1 tôm 2 lá ── */
  { id:42, maPO:"",            maHo:"NB009", tenHo:"Triệu Văn Hánh",   diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:15.00, donGia:28000,  thanhTien:420000,  batchId:"NB009304" },
  { id:43, maPO:"PO-0104-004", maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:44.00, donGia:29000,  thanhTien:1276000, batchId:"NB002304" },
  { id:44, maPO:"",            maHo:"NB001", tenHo:"Nông Thị Dung",    diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:32.00, donGia:29000,  thanhTien:928000,  batchId:"NB001304" },
  { id:45, maPO:"PO-0304-006", maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:49.20, donGia:29000,  thanhTien:1426800, batchId:"NB006304" },
  { id:46, maPO:"PO-0104-005", maHo:"NB013", tenHo:"Triệu Văn Cường",  diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:50.00, donGia:29000,  thanhTien:1450000, batchId:"NB013304" },
  { id:47, maPO:"",            maHo:"NH006", tenHo:"Triệu Văn Hòa",    diaChi:"Nà Hồng",   ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:10.80, donGia:28000,  thanhTien:302400,  batchId:"NH006304" },
  { id:48, maPO:"",            maHo:"NH002", tenHo:"Hoàng Thị Đào",    diaChi:"Nà Hồng",   ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:6.00,  donGia:28000,  thanhTien:168000,  batchId:"NH002304" },
  { id:49, maPO:"",            maHo:"NH003", tenHo:"Phạm Thị Huyền",   diaChi:"Nà Hồng",   ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:6.00,  donGia:28000,  thanhTien:168000,  batchId:"NH003304" },
  { id:50, maPO:"",            maHo:"NH001", tenHo:"Hoàng Thị Luyến",  diaChi:"Nà Hồng",   ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:3.00,  donGia:28000,  thanhTien:84000,   batchId:"NH001304" },
  { id:51, maPO:"",            maHo:"NH004", tenHo:"Triệu Văn Thạo",   diaChi:"Nà Hồng",   ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:23.50, donGia:29000,  thanhTien:681500,  batchId:"NH004304" },
  { id:52, maPO:"",            maHo:"NH009", tenHo:"Hạ Văn Thắng",     diaChi:"Nà Hồng",   ngay:"03/04/2026", quyCach:"1 tôm 2 lá", khoiLuong:6.00,  donGia:27000,  thanhTien:162000,  batchId:"NH009304" },
  /* ── 03/04/2026 – 1 tôm (Bạch trà) ── */
  { id:53, maPO:"PO-3103-003", maHo:"NB010", tenHo:"Mạnh Văn Hồ",      diaChi:"Nà Bay",    ngay:"03/04/2026", quyCach:"1 tôm",      khoiLuong:1.04,  donGia:520000, thanhTien:540800,  batchId:"NB010304" },
  { id:54, maPO:"",            maHo:"NB009", tenHo:"Triệu Văn Hánh",   diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm",      khoiLuong:2.40,  donGia:520000, thanhTien:1248000, batchId:"NB009304" },
  { id:55, maPO:"PO-0104-004", maHo:"NB002", tenHo:"Nông Văn Nghiễm",  diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm",      khoiLuong:3.30,  donGia:520000, thanhTien:1716000, batchId:"NB002304" },
  { id:56, maPO:"PO-0304-006", maHo:"NB006", tenHo:"Hoàng Văn Thống",  diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm",      khoiLuong:2.60,  donGia:520000, thanhTien:1352000, batchId:"NB006304" },
  { id:57, maPO:"",            maHo:"NB001", tenHo:"Nông Thị Dung",    diaChi:"Nà Bay",     ngay:"03/04/2026", quyCach:"1 tôm",      khoiLuong:0.75,  donGia:520000, thanhTien:390000,  batchId:"NB001304" },
];

const LOSX_SEED: LoSX[] = [
  /* ── 30/03/2026 ── */
  { id:"1",  maLo:"L013003",  ngaySX:"30/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:25.5,  klTP:5.5,  tyLeKhoHao:21.6, trangThai:"da-nhap-kho", cacMaBatch:["NH0043003","NB0023003"],                        batchTP:"L013003",  ghiChu:"" },
  /* ── 31/03/2026 – Hồng trà ── */
  { id:"2",  maLo:"L023103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:3, klNVL:27.5,  klTP:5.7,  tyLeKhoHao:20.7, trangThai:"da-nhap-kho", cacMaBatch:["NH0013103","NH0023103","NH0083103"],              batchTP:"L023103",  ghiChu:"" },
  { id:"3",  maLo:"L033103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:28.5,  klTP:6.4,  tyLeKhoHao:22.5, trangThai:"da-nhap-kho", cacMaBatch:["NH0093103","NH0043103"],                         batchTP:"L033103",  ghiChu:"" },
  { id:"4",  maLo:"L043103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:23.5,  klTP:5.5,  tyLeKhoHao:23.4, trangThai:"da-nhap-kho", cacMaBatch:["NH0063103","NH0083103"],                         batchTP:"L043103",  ghiChu:"" },
  { id:"5",  maLo:"L053103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:1, klNVL:22.0,  klTP:4.7,  tyLeKhoHao:21.4, trangThai:"da-nhap-kho", cacMaBatch:["NH0073103"],                                    batchTP:"L053103",  ghiChu:"" },
  { id:"6",  maLo:"L063103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:2, klNVL:18.5,  klTP:4.5,  tyLeKhoHao:24.3, trangThai:"da-nhap-kho", cacMaBatch:["NB0093103","NB0103103"],                         batchTP:"L063103",  ghiChu:"" },
  /* ── 31/03/2026 – Bạch trà (1 tôm) ── */
  { id:"7",  maLo:"L073103",  ngaySX:"31/03/2026", loaiChe:"Bạch trà",  soHo:7, klNVL:15.82, klTP:1.7,  tyLeKhoHao:10.7, trangThai:"da-nhap-kho", cacMaBatch:["NB0103103","NB0013103","NB0023103","NB0073103","NB0093103","NB0043103","NB0063103"], batchTP:"L073103", ghiChu:"Tôm trắng đặc sản" },
  /* ── 31/03/2026 – Hồng trà (tiếp) ── */
  { id:"8",  maLo:"L083103",  ngaySX:"31/03/2026", loaiChe:"Hồng trà",  soHo:1, klNVL:9.3,   klTP:2.2,  tyLeKhoHao:23.7, trangThai:"da-nhap-kho", cacMaBatch:["NH0103103"],                                    batchTP:"L083103",  ghiChu:"" },
  /* ── 01/04/2026 – Chè xanh ── */
  { id:"9",  maLo:"L09104",   ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:24.7,  klTP:5.3,  tyLeKhoHao:21.5, trangThai:"hoan-thanh",  cacMaBatch:["NH001104","NH004104"],                           batchTP:"L09104",   ghiChu:"" },
  { id:"10", maLo:"L010104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:3, klNVL:31.5,  klTP:6.6,  tyLeKhoHao:21.0, trangThai:"hoan-thanh",  cacMaBatch:["NB011104","NB012104","NB010104"],                 batchTP:"L010104",  ghiChu:"" },
  { id:"11", maLo:"L011104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:55.0,  klTP:10.9, tyLeKhoHao:19.8, trangThai:"hoan-thanh",  cacMaBatch:["NB013104","NB002104"],                           batchTP:"L011104",  ghiChu:"" },
  { id:"12", maLo:"L012104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:44.9,  klTP:9.1,  tyLeKhoHao:20.3, trangThai:"hoan-thanh",  cacMaBatch:["NB004104","NB001104"],                           batchTP:"L012104",  ghiChu:"" },
  { id:"13", maLo:"L013104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:23.8,  klTP:4.9,  tyLeKhoHao:20.6, trangThai:"hoan-thanh",  cacMaBatch:["NB006104"],                                     batchTP:"L013104",  ghiChu:"" },
  { id:"14", maLo:"L014104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:3, klNVL:22.4,  klTP:4.6,  tyLeKhoHao:20.5, trangThai:"hoan-thanh",  cacMaBatch:["NH007104","NH003104","NH010104"],                 batchTP:"L014104",  ghiChu:"" },
  { id:"15", maLo:"L015104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:11.7,  klTP:2.8,  tyLeKhoHao:23.9, trangThai:"hoan-thanh",  cacMaBatch:["BC003104"],                                     batchTP:"L015104",  ghiChu:"" },
  { id:"16", maLo:"L016104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:25.5,  klTP:5.6,  tyLeKhoHao:22.0, trangThai:"hoan-thanh",  cacMaBatch:["NH006104","NH008104"],                           batchTP:"L016104",  ghiChu:"" },
  { id:"17", maLo:"L017104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:34.5,  klTP:7.1,  tyLeKhoHao:20.6, trangThai:"hoan-thanh",  cacMaBatch:["NB009104"],                                     batchTP:"L017104",  ghiChu:"" },
  { id:"18", maLo:"L018104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:2, klNVL:31.5,  klTP:6.0,  tyLeKhoHao:19.0, trangThai:"hoan-thanh",  cacMaBatch:["NH009104","NH002104"],                           batchTP:"L018104",  ghiChu:"" },
  { id:"19", maLo:"L019104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:0.6,   klTP:0.15, tyLeKhoHao:25.0, trangThai:"hoan-thanh",  cacMaBatch:["NB011104"],                                     batchTP:"L019104",  ghiChu:"Búp 1 tôm chất lượng cao" },
  { id:"20", maLo:"L020104",  ngaySX:"01/04/2026", loaiChe:"Chè xanh",  soHo:1, klNVL:0.6,   klTP:0.15, tyLeKhoHao:25.0, trangThai:"hoan-thanh",  cacMaBatch:["NB011104"],                                     batchTP:"L020104",  ghiChu:"Búp 1 tôm chất lượng cao" },
];

const LODG_SEED: LoDG[] = [
  /* ── 30/03/2026 ── */
  { id:"1",  maDG:"S013003",  maLoSX:"L013003", thoiGian:"30/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g", klDG:5.5,  soSP:22,  trangThai:"da-xuat-kho",  qrCode:"QR-S013003", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  /* ── 31/03/2026 ── */
  { id:"2",  maDG:"S023103",  maLoSX:"L023103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g", klDG:5.7,  soSP:23,  trangThai:"da-xuat-kho",  qrCode:"QR-S023103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"3",  maDG:"S033103",  maLoSX:"L033103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-thiec-250g", klDG:6.4,  soSP:26,  trangThai:"da-xuat-kho",  qrCode:"QR-S033103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"4",  maDG:"S043103",  maLoSX:"L043103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",  klDG:5.5,  soSP:55,  trangThai:"da-xuat-kho",  qrCode:"QR-S043103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"5",  maDG:"S053103",  maLoSX:"L053103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",  klDG:4.7,  soSP:47,  trangThai:"da-xuat-kho",  qrCode:"QR-S053103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"6",  maDG:"S063103",  maLoSX:"L063103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"hop-giay-100g",  klDG:4.5,  soSP:45,  trangThai:"da-xuat-kho",  qrCode:"QR-S063103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"7",  maDG:"S073103",  maLoSX:"L073103", thoiGian:"31/03/2026", thanhPham:"Bạch trà",  loaiBaoBi:"tui-kraft-50g",  klDG:1.7,  soSP:34,  trangThai:"da-xuat-kho",  qrCode:"QR-S073103", nguoiTao:"HTX Hồng Hà", ghiChu:"Tôm trắng đặc sản" },
  { id:"8",  maDG:"S083103",  maLoSX:"L083103", thoiGian:"31/03/2026", thanhPham:"Hồng trà",  loaiBaoBi:"tui-kraft-50g",  klDG:2.2,  soSP:44,  trangThai:"da-xuat-kho",  qrCode:"QR-S083103", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  /* ── 01/04/2026 ── */
  { id:"9",  maDG:"S09104",   maLoSX:"L09104",  thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:5.3,  soSP:53,  trangThai:"hoan-thanh",   qrCode:"QR-S09104",  nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"10", maDG:"S010104",  maLoSX:"L010104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:6.6,  soSP:66,  trangThai:"hoan-thanh",   qrCode:"QR-S010104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"11", maDG:"S011104",  maLoSX:"L011104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",   klDG:10.9, soSP:11,  trangThai:"hoan-thanh",   qrCode:"QR-S011104", nguoiTao:"HTX Hồng Hà", ghiChu:"Bulk NPP" },
  { id:"12", maDG:"S012104",  maLoSX:"L012104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",   klDG:9.1,  soSP:9,   trangThai:"hoan-thanh",   qrCode:"QR-S012104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"13", maDG:"S013104",  maLoSX:"L013104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:4.9,  soSP:49,  trangThai:"hoan-thanh",   qrCode:"QR-S013104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"14", maDG:"S014104",  maLoSX:"L014104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:4.6,  soSP:46,  trangThai:"hoan-thanh",   qrCode:"QR-S014104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"15", maDG:"S015104",  maLoSX:"L015104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:2.8,  soSP:28,  trangThai:"hoan-thanh",   qrCode:"QR-S015104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"16", maDG:"S016104",  maLoSX:"L016104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:5.6,  soSP:56,  trangThai:"hoan-thanh",   qrCode:"QR-S016104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"17", maDG:"S017104",  maLoSX:"L017104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-bulk-1kg",   klDG:7.1,  soSP:7,   trangThai:"hoan-thanh",   qrCode:"QR-S017104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"18", maDG:"S018104",  maLoSX:"L018104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"hop-giay-100g",  klDG:6.0,  soSP:60,  trangThai:"hoan-thanh",   qrCode:"QR-S018104", nguoiTao:"HTX Hồng Hà", ghiChu:"" },
  { id:"19", maDG:"S019104",  maLoSX:"L019104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-kraft-50g",  klDG:0.15, soSP:3,   trangThai:"hoan-thanh",   qrCode:"QR-S019104", nguoiTao:"HTX Hồng Hà", ghiChu:"Búp 1 tôm đặc sản" },
  { id:"20", maDG:"S020104",  maLoSX:"L020104", thoiGian:"01/04/2026", thanhPham:"Chè xanh",  loaiBaoBi:"tui-kraft-50g",  klDG:0.15, soSP:3,   trangThai:"hoan-thanh",   qrCode:"QR-S020104", nguoiTao:"HTX Hồng Hà", ghiChu:"Búp 1 tôm đặc sản" },
];

const SALES_SEED: SalesOrder[] = [
  { id:"1", maDon:"SO-2603-001", loaiKhach:"dai-ly",    khachHang:"Cty TNHH Trà Thái Nguyên",   diaChi:"TP. Thái Nguyên",   sdt:"0208 3856 123", mst:"0102376801", ngayDat:"26/03/2026", ngayGiao:"02/04/2026", trangThai:"hoan-thanh", thanhToan:"da-thanh-toan", daThanhToan:23000000, maVanDon:"VD-2026-0312", chietKhau:5, vat:0,  dieuKhoanTT:"NET15", donViVC:"Nội bộ",      nguoiTao:"Nguyễn A", ghiChu:"Giao nguyên kiện", sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:20, donVi:"kg", donGia:850000,  thanhTien:17000000, maLoSX:"L013003" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:5, donVi:"kg", donGia:1200000, thanhTien:6000000, maLoSX:"L073103" }], tongTien:23000000 },
  { id:"2", maDon:"SO-2803-002", loaiKhach:"sieu-thi",  khachHang:"Siêu thị Lotte Mart Hà Nội", diaChi:"Đống Đa, Hà Nội",   sdt:"024 3562 7890", mst:"0101684601", ngayDat:"28/03/2026", ngayGiao:"08/04/2026", trangThai:"dang-giao",  thanhToan:"mot-phan",    daThanhToan:10000000, maVanDon:"VD-2026-0401", chietKhau:2, vat:10, dieuKhoanTT:"NET30", donViVC:"GHTK",        nguoiTao:"Trần B",    ghiChu:"Hộp quà tặng",    sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:8,  donVi:"kg", donGia:1200000, thanhTien:9600000,  maLoSX:"L073103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:12, donVi:"kg", donGia:850000, thanhTien:10200000, maLoSX:"L043103" }], tongTien:19800000 },
  { id:"3", maDon:"SO-0104-003", loaiKhach:"xuat-khau", khachHang:"Cty CP XNK Hà Nội",          diaChi:"Hà Nội",             sdt:"024 3825 6789", mst:"0104384101", ngayDat:"01/04/2026", ngayGiao:"10/04/2026", trangThai:"xuat-kho",   thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             chietKhau:8, vat:0,  dieuKhoanTT:"NET30", donViVC:"GHN",         nguoiTao:"Nguyễn A", ghiChu:"OCOP + CO/CQ",     sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:30, donVi:"kg", donGia:850000, thanhTien:25500000, maLoSX:"L023103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:10, donVi:"kg", donGia:1200000, thanhTien:12000000, maLoSX:"L073103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:20, donVi:"kg", donGia:420000, thanhTien:8400000, maLoSX:"L09104" }], tongTien:45900000 },
  { id:"4", maDon:"SO-0204-004", loaiKhach:"sieu-thi",  khachHang:"WinMart Hà Nội",              diaChi:"Cầu Giấy, Hà Nội",  sdt:"024 3901 2345", mst:"0100686209", ngayDat:"02/04/2026", ngayGiao:"09/04/2026", trangThai:"xac-nhan",   thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             chietKhau:2, vat:10, dieuKhoanTT:"NET15", donViVC:"GHTK",        nguoiTao:"Trần B",    ghiChu:"",                 sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:50, donVi:"kg", donGia:420000, thanhTien:21000000, maLoSX:"L010104" }], tongTien:21000000 },
  { id:"5", maDon:"SO-0304-005", loaiKhach:"le",        khachHang:"Quán trà Sen – Đỗ Thị Mai",  diaChi:"Quận 1, TP.HCM",    sdt:"090 3456 789",  ngayDat:"03/04/2026", ngayGiao:"12/04/2026", trangThai:"bao-gia",    thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             chietKhau:0, vat:10, dieuKhoanTT:"COD",   donViVC:"",            nguoiTao:"Lê C",      ghiChu:"KH mới",           sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:5, donVi:"kg", donGia:420000, thanhTien:2100000, maLoSX:"L011104" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:2, donVi:"kg", donGia:850000, thanhTien:1700000, maLoSX:"L033103" }], tongTien:3800000 },
  { id:"6", maDon:"SO-0304-006", loaiKhach:"dai-ly",    khachHang:"NPP Hoàng Phát – Bắc Giang", diaChi:"Bắc Giang",          sdt:"0204 3987 654", mst:"0201234501", ngayDat:"03/04/2026", ngayGiao:"09/04/2026", trangThai:"bao-gia",    thanhToan:"chua",        daThanhToan:0,        maVanDon:"",             chietKhau:5, vat:0,  dieuKhoanTT:"NET15", donViVC:"Viettel Post", nguoiTao:"Nguyễn A", ghiChu:"Bulk đại lý",      sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:100, donVi:"kg", donGia:380000, thanhTien:38000000, maLoSX:"L012104" }], tongTien:38000000 },
  { id:"7", maDon:"SO-0104-W01", loaiKhach:"le", khachHang:"Nguyễn Thị Lan",    diaChi:"Hoàng Mai, Hà Nội",    sdt:"098 7654 321", ngayDat:"01/04/2026", ngayGiao:"05/04/2026", trangThai:"hoan-thanh", thanhToan:"da-thanh-toan", daThanhToan:1200000, maVanDon:"GHTK-20260401-HN", chietKhau:0, vat:10, dieuKhoanTT:"COD", donViVC:"GHTK", nguoiTao:"Website", ghiChu:"Mua thử, giao giờ hành chính", nguon:"web", sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:1, donVi:"kg", donGia:1200000, thanhTien:1200000, maLoSX:"L073103" }], tongTien:1320000 },
  { id:"8", maDon:"SO-0204-W02", loaiKhach:"le", khachHang:"Trần Văn Minh",     diaChi:"Bình Thạnh, TP.HCM",   sdt:"091 2345 678", ngayDat:"02/04/2026", ngayGiao:"07/04/2026", trangThai:"dang-giao",  thanhToan:"chua",          daThanhToan:0,       maVanDon:"GHN-20260402-HCM",  chietKhau:0, vat:10, dieuKhoanTT:"COD", donViVC:"GHN",  nguoiTao:"Website", ghiChu:"Quà tặng, gói đẹp",           nguon:"web", sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:0.5, donVi:"kg", donGia:850000, thanhTien:425000, maLoSX:"L013003" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Chè xanh", soLuong:0.5, donVi:"kg", donGia:420000, thanhTien:210000, maLoSX:"L09104" }], tongTien:698500 },
  { id:"9", maDon:"SO-0504-W03", loaiKhach:"le", khachHang:"Lê Thị Hoa",        diaChi:"Hải Châu, Đà Nẵng",    sdt:"090 1122 334", ngayDat:"05/04/2026", ngayGiao:"10/04/2026", trangThai:"bao-gia",    thanhToan:"chua",          daThanhToan:0,       maVanDon:"",                  chietKhau:0, vat:10, dieuKhoanTT:"COD", donViVC:"GHTK", nguoiTao:"Website", ghiChu:"Đặt combo quà Tết sớm",        nguon:"web", sanPhams:[{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Bạch trà", soLuong:0.5, donVi:"kg", donGia:1200000, thanhTien:600000, maLoSX:"L073103" },{ sanPham:"Chè Shan Tuyết Bằng Phúc", loai:"Hồng trà", soLuong:0.5, donVi:"kg", donGia:850000, thanhTien:425000, maLoSX:"L013003" }], tongTien:1127500 },
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
