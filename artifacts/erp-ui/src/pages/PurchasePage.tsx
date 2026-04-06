import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, ChevronUp, ChevronDown, Users, Leaf,
  TrendingUp, Filter, X, Plus, MapPin, Phone, FileSpreadsheet,
  FileText, Printer, Trash2, Eye, CheckCircle2, Clock, Truck,
  Package, QrCode, ChevronRight, Warehouse, BadgeDollarSign,
  AlertCircle, ClipboardList, ShoppingCart,
} from "lucide-react";

/* ────────── Types ────────── */
type POStatus = "yeu-cau" | "dat-hang" | "nhan-hang" | "qc" | "nhap-kho" | "thanh-toan";
type QCResult = "pending" | "pass" | "fail" | "reduce";
type ThanhToan = "chua" | "mot-phan" | "da-thanh-toan";

const PO_STATUS_CFG: Record<POStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "yeu-cau":     { label: "Yêu cầu",   color: "bg-gray-100 text-gray-600",       icon: ClipboardList },
  "dat-hang":    { label: "Đặt hàng",  color: "bg-blue-100 text-blue-700",       icon: ShoppingCart },
  "nhan-hang":   { label: "Nhận hàng", color: "bg-amber-100 text-amber-700",     icon: Truck },
  "qc":          { label: "Kiểm tra",  color: "bg-violet-100 text-violet-700",   icon: AlertCircle },
  "nhap-kho":    { label: "Nhập kho",  color: "bg-emerald-100 text-emerald-700", icon: Warehouse },
  "thanh-toan":  { label: "Thanh toán",color: "bg-sky-100 text-sky-700",         icon: BadgeDollarSign },
};
const PO_FLOW: POStatus[] = ["yeu-cau","dat-hang","nhan-hang","qc","nhap-kho","thanh-toan"];

const QC_CFG: Record<QCResult, { label: string; color: string }> = {
  pending: { label: "Chưa QC",     color: "bg-gray-100 text-gray-600" },
  pass:    { label: "Đạt",         color: "bg-emerald-100 text-emerald-700" },
  fail:    { label: "Không đạt",   color: "bg-red-100 text-red-600" },
  reduce:  { label: "Giảm giá",    color: "bg-amber-100 text-amber-700" },
};

/* ────────── Farmer & Zone data ────────── */
const FARMERS = [
  { maHo: "NH001", tenHo: "Hoàng Thị Luyến",  diaChi: "Nà Hồng",   sdt: "0354125321", dienTich: 0.5 },
  { maHo: "NH002", tenHo: "Hoàng Thị Đào",    diaChi: "Nà Hồng",   sdt: "0374704822", dienTich: 0.4 },
  { maHo: "NH003", tenHo: "Phạm Thị Huyền",   diaChi: "Nà Hồng",   sdt: "0379251872", dienTich: 1.0 },
  { maHo: "NH004", tenHo: "Triệu Văn Thạo",   diaChi: "Nà Hồng",   sdt: "0354871949", dienTich: 0.8 },
  { maHo: "NH005", tenHo: "Hoàng Văn Thái",   diaChi: "Nà Hồng",   sdt: "0972061820", dienTich: 0.5 },
  { maHo: "NH006", tenHo: "Triệu Văn Hòa",    diaChi: "Nà Hồng",   sdt: "0378360830", dienTich: 0.8 },
  { maHo: "NH007", tenHo: "Hoàng Văn Tuấn",   diaChi: "Nà Hồng",   sdt: "0387851867", dienTich: 1.0 },
  { maHo: "NH008", tenHo: "Đồng Thị Khuyết",  diaChi: "Nà Hồng",   sdt: "0962041090", dienTich: 0.7 },
  { maHo: "NH009", tenHo: "Hạ Văn Thắng",     diaChi: "Nà Hồng",   sdt: "0337318858", dienTich: 1.5 },
  { maHo: "NH010", tenHo: "Dương Thị Tươi",   diaChi: "Nà Hồng",   sdt: "",           dienTich: 0.5 },
  { maHo: "NB001", tenHo: "Nông Thị Dung",    diaChi: "Nà Bay",    sdt: "0961466732", dienTich: 1.5 },
  { maHo: "NB002", tenHo: "Nông Văn Nghiễm",  diaChi: "Nà Bay",    sdt: "0814665955", dienTich: 1.0 },
  { maHo: "NB003", tenHo: "Mùng Văn Thời",    diaChi: "Nà Bay",    sdt: "0369254973", dienTich: 0.6 },
  { maHo: "NB004", tenHo: "Triệu Văn Mỹ",     diaChi: "Nà Bay",    sdt: "0383760794", dienTich: 1.0 },
  { maHo: "NB005", tenHo: "Nông Văn Đẳng",    diaChi: "Nà Bay",    sdt: "0374258744", dienTich: 1.0 },
  { maHo: "NB006", tenHo: "Hoàng Văn Thống",  diaChi: "Nà Bay",    sdt: "0967186387", dienTich: 1.0 },
  { maHo: "NB007", tenHo: "Nguyễn Văn Hân",   diaChi: "Nà Bay",    sdt: "0984922577", dienTich: 1.0 },
  { maHo: "NB008", tenHo: "Nguyễn Thị Đa",    diaChi: "Nà Bay",    sdt: "0372122030", dienTich: 0.7 },
  { maHo: "NB009", tenHo: "Triệu Văn Hánh",   diaChi: "Nà Bay",    sdt: "0345665232", dienTich: 0.8 },
  { maHo: "NB010", tenHo: "Mạnh Văn Hồ",      diaChi: "Nà Bay",    sdt: "0349055299", dienTich: 2.0 },
  { maHo: "NB011", tenHo: "Hoàng Thị Điềm",   diaChi: "Nà Bay",    sdt: "0375182932", dienTich: 0.4 },
  { maHo: "NB012", tenHo: "Lâm Thị Tới",      diaChi: "Nà Bay",    sdt: "0353839713", dienTich: 0.3 },
  { maHo: "NB013", tenHo: "Triệu Văn Cường",  diaChi: "Nà Bay",    sdt: "",           dienTich: 0.5 },
  { maHo: "BC001", tenHo: "Hoàng Phúc Khôi",  diaChi: "Bản Chang", sdt: "0333770931", dienTich: 0.6 },
  { maHo: "BC002", tenHo: "Triệu Văn Dựng",   diaChi: "Bản Chang", sdt: "0343233785", dienTich: 2.0 },
  { maHo: "BC003", tenHo: "Hoàng Văn Mỹ",     diaChi: "Bản Chang", sdt: "",           dienTich: 0.5 },
];

const ZONES: Record<string, { maVuon: string; tenVuon: string; dienTich: number }[]> = {
  NH001: [{ maVuon: "NH001-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.3 }, { maVuon: "NH001-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.2 }],
  NH002: [{ maVuon: "NH002-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.4 }],
  NH003: [{ maVuon: "NH003-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5 }, { maVuon: "NH003-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.5 }],
  NH004: [{ maVuon: "NH004-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5 }, { maVuon: "NH004-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.3 }],
  NH005: [{ maVuon: "NH005-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5 }],
  NH006: [{ maVuon: "NH006-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.4 }, { maVuon: "NH006-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.4 }],
  NH007: [{ maVuon: "NH007-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.6 }, { maVuon: "NH007-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.4 }],
  NH008: [{ maVuon: "NH008-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.7 }],
  NH009: [{ maVuon: "NH009-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.8 }, { maVuon: "NH009-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.7 }],
  NH010: [{ maVuon: "NH010-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5 }],
  NB001: [{ maVuon: "NB001-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.8 }, { maVuon: "NB001-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.7 }],
  NB002: [{ maVuon: "NB002-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.6 }, { maVuon: "NB002-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.4 }],
  NB003: [{ maVuon: "NB003-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.6 }],
  NB004: [{ maVuon: "NB004-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5 }, { maVuon: "NB004-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.5 }],
  NB005: [{ maVuon: "NB005-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 1.0 }],
  NB006: [{ maVuon: "NB006-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.6 }, { maVuon: "NB006-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.4 }],
  NB007: [{ maVuon: "NB007-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5 }, { maVuon: "NB007-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.5 }],
  NB008: [{ maVuon: "NB008-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.7 }],
  NB009: [{ maVuon: "NB009-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5 }, { maVuon: "NB009-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.3 }],
  NB010: [{ maVuon: "NB010-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 1.0 }, { maVuon: "NB010-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.6 }, { maVuon: "NB010-V3", tenVuon: "Vườn Nà Bay 3", dienTich: 0.4 }],
  NB011: [{ maVuon: "NB011-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.4 }],
  NB012: [{ maVuon: "NB012-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.3 }],
  NB013: [{ maVuon: "NB013-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5 }],
  BC001: [{ maVuon: "BC001-V1", tenVuon: "Vườn Bản Chang 1", dienTich: 0.6 }],
  BC002: [{ maVuon: "BC002-V1", tenVuon: "Vườn Bản Chang 1", dienTich: 1.2 }, { maVuon: "BC002-V2", tenVuon: "Vườn Bản Chang 2", dienTich: 0.8 }],
  BC003: [{ maVuon: "BC003-V1", tenVuon: "Vườn Bản Chang 1", dienTich: 0.5 }],
};

/* ────────── Purchase Order data ────────── */
interface PurchaseOrder {
  id: string;
  maPO: string;
  maHo: string;
  tenHo: string;
  diaChi: string;
  sdt: string;
  maVuon: string;
  tenVuon: string;
  ngayTao: string;
  ngayGiao: string;
  quyCach: string;
  khoiLuongDat: number;
  khoiLuongNhan: number;
  donGia: number;
  chatLuong: number;
  qcResult: QCResult;
  trangThai: POStatus;
  thanhToan: ThanhToan;
  batchId: string;
  ghiChu: string;
  nguoiTao: string;
}

/* ── Quy cách specs (per official price table) ── */
const QUY_CACH_CFG: Record<string, { loaiChe: string; priceNote: string; color: string; fixedPrice?: number }> = {
  "1 tôm":        { loaiChe: "Chè xanh",  priceNote: "27,000 – 30,000 đ/kg",   color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  "1 tôm 1 lá":   { loaiChe: "Hồng trà",  priceNote: "50,000 đ/kg",            color: "bg-rose-100 text-rose-800 border-rose-300", fixedPrice: 50000 },
  "1 tôm 2 lá":   { loaiChe: "Bạch trà",  priceNote: "27,000 – 30,000 đ/kg",   color: "bg-sky-100 text-sky-800 border-sky-300" },
  "2 lá":         { loaiChe: "Chè thường", priceNote: "27,000 đ/kg",            color: "bg-amber-100 text-amber-800 border-amber-300", fixedPrice: 27000 },
  "Cây di sản":   { loaiChe: "Đặc sản",   priceNote: "40,000 – 60,000 đ/kg",   color: "bg-violet-100 text-violet-800 border-violet-300", fixedPrice: 50000 },
};

/* Đơn giá theo % chất lượng (áp dụng cho "1 tôm", "1 tôm 2 lá") */
const QUALITY_PRICE_TABLE = [
  { min: 70, max: 79, gia: 27000, label: "70–79%" },
  { min: 80, max: 89, gia: 28000, label: "80–89%" },
  { min: 90, max: 99, gia: 29000, label: "90–99%" },
  { min: 100, max: 100, gia: 30000, label: "100%" },
];

const calcDonGia = (quyCach: string, cl: number) => {
  const cfg = QUY_CACH_CFG[quyCach];
  if (cfg?.fixedPrice) return cfg.fixedPrice;
  if (cl >= 100) return 30000;
  if (cl >= 90)  return 29000;
  if (cl >= 80)  return 28000;
  return 27000;
};

const PO_SEED: PurchaseOrder[] = [
  { id: "1", maPO: "PO-3003-001", maHo: "NH004", tenHo: "Triệu Văn Thạo",   diaChi: "Nà Hồng", sdt: "0354871949", maVuon: "NH004-V1", tenVuon: "Vườn Nà Hồng 1", ngayTao: "28/03/2026", ngayGiao: "30/03/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 15.0, khoiLuongNhan: 13.5,  donGia: 27000,  chatLuong: 78, qcResult: "pass",  trangThai: "thanh-toan", thanhToan: "da-thanh-toan", batchId: "RAW-NH004-3003", ghiChu: "",                nguoiTao: "Nguyễn A" },
  { id: "2", maPO: "PO-3103-002", maHo: "NH008", tenHo: "Đồng Thị Khuyết",  diaChi: "Nà Hồng", sdt: "0962041090", maVuon: "NH008-V1", tenVuon: "Vườn Nà Hồng 1", ngayTao: "29/03/2026", ngayGiao: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 10.0, khoiLuongNhan: 8.5,   donGia: 28500,  chatLuong: 83, qcResult: "pass",  trangThai: "thanh-toan", thanhToan: "da-thanh-toan", batchId: "RAW-NH008-3103", ghiChu: "",                nguoiTao: "Nguyễn A" },
  { id: "3", maPO: "PO-3103-003", maHo: "NB010", tenHo: "Mạnh Văn Hồ",      diaChi: "Nà Bay",  sdt: "0349055299", maVuon: "NB010-V1", tenVuon: "Vườn Nà Bay 1",    ngayTao: "29/03/2026", ngayGiao: "31/03/2026", quyCach: "1 tôm",      khoiLuongDat: 3.0,  khoiLuongNhan: 2.5,   donGia: 29000,  chatLuong: 98, qcResult: "pass",  trangThai: "nhap-kho",   thanhToan: "mot-phan",    batchId: "RAW-NB010-3103", ghiChu: "1 tôm chất lượng cao (90–99%)", nguoiTao: "Trần B" },
  { id: "4", maPO: "PO-0104-004", maHo: "NB002", tenHo: "Nông Văn Nghiễm",  diaChi: "Nà Bay",  sdt: "0814665955", maVuon: "NB002-V1", tenVuon: "Vườn Nà Bay 1",    ngayTao: "01/04/2026", ngayGiao: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 50.0, khoiLuongNhan: 44.0,  donGia: 29000,  chatLuong: 90, qcResult: "pass",  trangThai: "nhap-kho",   thanhToan: "chua",         batchId: "RAW-NB002-0104", ghiChu: "",                nguoiTao: "Nguyễn A" },
  { id: "5", maPO: "PO-0104-005", maHo: "NB013", tenHo: "Triệu Văn Cường",  diaChi: "Nà Bay",  sdt: "",           maVuon: "NB013-V1", tenVuon: "Vườn Nà Bay 1",    ngayTao: "01/04/2026", ngayGiao: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 60.0, khoiLuongNhan: 50.0,  donGia: 29000,  chatLuong: 91, qcResult: "pass",  trangThai: "qc",         thanhToan: "chua",         batchId: "",               ghiChu: "",                nguoiTao: "Trần B" },
  { id: "6", maPO: "PO-0304-006", maHo: "NB006", tenHo: "Hoàng Văn Thống",  diaChi: "Nà Bay",  sdt: "0967186387", maVuon: "NB006-V1", tenVuon: "Vườn Nà Bay 1",    ngayTao: "03/04/2026", ngayGiao: "05/04/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 55.0, khoiLuongNhan: 49.2,  donGia: 29000,  chatLuong: 89, qcResult: "pass",  trangThai: "nhan-hang",  thanhToan: "chua",         batchId: "",               ghiChu: "",                nguoiTao: "Nguyễn A" },
  { id: "7", maPO: "PO-0404-007", maHo: "NH009", tenHo: "Hạ Văn Thắng",     diaChi: "Nà Hồng", sdt: "0337318858", maVuon: "NH009-V2", tenVuon: "Vườn Nà Hồng 2",  ngayTao: "04/04/2026", ngayGiao: "06/04/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 20.0, khoiLuongNhan: 0,     donGia: 29000,  chatLuong: 92, qcResult: "pending", trangThai: "dat-hang",   thanhToan: "chua",         batchId: "",               ghiChu: "Dự kiến thu buổi sáng", nguoiTao: "Trần B" },
  { id: "8", maPO: "PO-0504-008", maHo: "BC002", tenHo: "Triệu Văn Dựng",   diaChi: "Bản Chang", sdt: "0343233785", maVuon: "BC002-V1", tenVuon: "Vườn Bản Chang 1", ngayTao: "05/04/2026", ngayGiao: "07/04/2026", quyCach: "1 tôm 2 lá", khoiLuongDat: 25.0, khoiLuongNhan: 0,     donGia: 28000,  chatLuong: 85, qcResult: "pending", trangThai: "yeu-cau",    thanhToan: "chua",         batchId: "",               ghiChu: "",                nguoiTao: "Nguyễn A" },
];

/* ────────── Nhận hàng raw records ────────── */
const RAW_RECEIPTS = [
  { id: 1,  maPO: "PO-3003-001", maHo: "NH004", tenHo: "Triệu Văn Thạo",   diaChi: "Nà Hồng",   ngay: "30/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 27000,  thanhTien: 364500,  batchId: "RAW-NH004-3003" },
  { id: 2,  maPO: "PO-3103-003", maHo: "NB010", tenHo: "Mạnh Văn Hồ",      diaChi: "Nà Bay",    ngay: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 2.50,  donGia: 29000,  thanhTien: 72500,   batchId: "RAW-NB010-3103" },
  { id: 3,  maPO: "PO-3103-002", maHo: "NH008", tenHo: "Đồng Thị Khuyết",  diaChi: "Nà Hồng",   ngay: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 8.50,  donGia: 28500,  thanhTien: 242250,  batchId: "RAW-NH008-3103" },
  { id: 4,  maPO: "PO-0104-004", maHo: "NB002", tenHo: "Nông Văn Nghiễm",  diaChi: "Nà Bay",    ngay: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 44.00, donGia: 29000,  thanhTien: 1276000, batchId: "RAW-NB002-0104" },
  { id: 5,  maPO: "PO-0104-005", maHo: "NB013", tenHo: "Triệu Văn Cường",  diaChi: "Nà Bay",    ngay: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 50.00, donGia: 29000,  thanhTien: 1450000, batchId: "" },
  { id: 6,  maPO: "PO-0304-006", maHo: "NB006", tenHo: "Hoàng Văn Thống",  diaChi: "Nà Bay",    ngay: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 49.20, donGia: 29000,  thanhTien: 1426800, batchId: "" },
  { id: 7,  maPO: "",            maHo: "NH001", tenHo: "Hoàng Thị Luyến",  diaChi: "Nà Hồng",   ngay: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 3.20,  donGia: 29000,  thanhTien: 92800,   batchId: "" },
  { id: 8,  maPO: "",            maHo: "NH007", tenHo: "Hoàng Văn Tuấn",   diaChi: "Nà Hồng",   ngay: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.50, donGia: 28000,  thanhTien: 322000,  batchId: "" },
  { id: 9,  maPO: "",            maHo: "BC001", tenHo: "Hoàng Phúc Khôi",  diaChi: "Bản Chang",  ngay: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 12.40, donGia: 28000,  thanhTien: 347200,  batchId: "" },
  { id: 10, maPO: "",            maHo: "NB004", tenHo: "Triệu Văn Mỹ",     diaChi: "Nà Bay",    ngay: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 21.50, donGia: 29000,  thanhTien: 623500,  batchId: "" },
];

let _nextId = 200;
const genId = () => String(++_nextId);

function fmt(v: number) { return v.toLocaleString("vi-VN") + " đ"; }
function fmtKg(v: number) { return v.toFixed(2).replace(".", ",") + " kg"; }

const AREA_COLORS: Record<string, string> = {
  "Nà Hồng":   "bg-emerald-100 text-emerald-700",
  "Nà Bay":    "bg-blue-100 text-blue-700",
  "Bản Chang": "bg-amber-100 text-amber-700",
};

/* ────────── Component ────────── */
export default function PurchasePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"po" | "receipt" | "farmers" | "quy-cach">("po");
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "">("");
  const [diaChi, setDiaChi]   = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [sortKey, setSortKey]   = useState("ngayTao");
  const [sortDir, setSortDir]   = useState<"asc"|"desc">("desc");

  const [poList, setPoList]     = useState<PurchaseOrder[]>(PO_SEED);
  const [receipts]              = useState(RAW_RECEIPTS);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  /* form state */
  const [step, setStep]           = useState<"chon-ho" | "chi-tiet">("chon-ho");
  const [hoSearch, setHoSearch]   = useState("");
  const [qrMode, setQrMode]       = useState(false);
  const [selHo, setSelHo]         = useState<typeof FARMERS[number] | null>(null);
  const [selVuon, setSelVuon]     = useState("");
  const [fDate, setFDate]         = useState(new Date().toISOString().slice(0,10));
  const [fGiao, setFGiao]         = useState("");
  const [fQuyCach, setFQuyCach]   = useState("1 tôm 2 lá");
  const [fKL, setFKL]             = useState("");
  const [fCL, setFCL]             = useState(85);
  const [fNote, setFNote]         = useState("");
  const [farmerSearch, setFarmerSearch] = useState("");

  const fDonGia   = useMemo(() => calcDonGia(fQuyCach, fCL), [fQuyCach, fCL]);
  const fTotal    = useMemo(() => (parseFloat(fKL) || 0) * fDonGia, [fKL, fDonGia]);
  const filteredHo = useMemo(() => {
    if (!hoSearch) return FARMERS;
    const q = hoSearch.toLowerCase();
    return FARMERS.filter(h => h.tenHo.toLowerCase().includes(q) || h.maHo.toLowerCase().includes(q) || h.diaChi.toLowerCase().includes(q));
  }, [hoSearch]);
  const zonesOfSel = selHo ? (ZONES[selHo.maHo] ?? []) : [];

  const resetForm = () => {
    setStep("chon-ho"); setHoSearch(""); setSelHo(null); setSelVuon("");
    setFDate(new Date().toISOString().slice(0,10)); setFGiao(""); setFQuyCach("1 tôm 2 lá");
    setFKL(""); setFCL(85); setFNote(""); setQrMode(false);
  };

  const handleCreate = () => {
    if (!selHo || !fKL) return;
    const vuon = zonesOfSel.find(v => v.maVuon === selVuon) ?? zonesOfSel[0];
    const [y, m, d] = fDate.split("-");
    const newPO: PurchaseOrder = {
      id: genId(),
      maPO: `PO-${d}${m}-${String(poList.length + 1).padStart(3,"0")}`,
      maHo: selHo.maHo, tenHo: selHo.tenHo, diaChi: selHo.diaChi, sdt: selHo.sdt,
      maVuon: vuon?.maVuon ?? "", tenVuon: vuon?.tenVuon ?? "",
      ngayTao: `${d}/${m}/${y}`, ngayGiao: fGiao ? (() => { const [gy,gm,gd] = fGiao.split("-"); return `${gd}/${gm}/${gy}`; })() : "",
      quyCach: fQuyCach, khoiLuongDat: parseFloat(fKL), khoiLuongNhan: 0,
      donGia: fDonGia, chatLuong: fCL, qcResult: "pending",
      trangThai: "yeu-cau", thanhToan: "chua", batchId: "", ghiChu: fNote, nguoiTao: "Admin",
    };
    setPoList(prev => [newPO, ...prev]);
    setShowCreate(false); resetForm();
  };

  const handleStatusChange = (id: string, s: POStatus) => {
    setPoList(prev => prev.map(o => {
      if (o.id !== id) return o;
      const updated = { ...o, trangThai: s };
      if (s === "nhap-kho" && !updated.batchId) {
        const ts = Date.now().toString().slice(-4);
        updated.batchId = `RAW-${o.maHo}-${ts}`;
      }
      return updated;
    }));
    if (selectedPO?.id === id) setSelectedPO(prev => {
      if (!prev) return prev;
      const upd = { ...prev, trangThai: s };
      if (s === "nhap-kho" && !upd.batchId) { const ts = Date.now().toString().slice(-4); upd.batchId = `RAW-${prev.maHo}-${ts}`; }
      return upd;
    });
  };

  const handleQCChange = (id: string, qc: QCResult) => {
    setPoList(prev => prev.map(o => o.id !== id ? o : { ...o, qcResult: qc }));
    if (selectedPO?.id === id) setSelectedPO(p => p ? { ...p, qcResult: qc } : p);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Xóa đơn mua này?")) return;
    setPoList(prev => prev.filter(o => o.id !== id));
    if (selectedPO?.id === id) setSelectedPO(null);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const rows = receipts.map(r => ({ "Mã hộ": r.maHo, "Tên hộ": r.tenHo, "Ngày": r.ngay, "Quy cách": r.quyCach, "KL (kg)": r.khoiLuong, "Đơn giá": r.donGia, "Thành tiền": r.thanhTien }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Nhận hàng");
    XLSX.writeFile(wb, `HTX_HongHa_ThuMua_${new Date().toLocaleDateString("vi-VN").replace(/\//g,"-")}.xlsx`);
  };

  const parseDateVN = (s: string) => { const [d,m,y] = s.split("/"); return `${y}-${m}-${d}`; };
  const handleSort = (k: string) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;

  const filteredPO = useMemo(() => {
    let data = poList;
    if (search) { const q = search.toLowerCase(); data = data.filter(o => o.maPO.toLowerCase().includes(q) || o.tenHo.toLowerCase().includes(q) || o.maHo.toLowerCase().includes(q)); }
    if (statusFilter) data = data.filter(o => o.trangThai === statusFilter);
    if (diaChi) data = data.filter(o => o.diaChi === diaChi);
    if (dateFrom) data = data.filter(o => parseDateVN(o.ngayTao) >= dateFrom);
    if (dateTo)   data = data.filter(o => parseDateVN(o.ngayTao) <= dateTo);
    return [...data].sort((a, b) => {
      const av = (a as Record<string,unknown>)[sortKey];
      const bv = (b as Record<string,unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [poList, search, statusFilter, diaChi, dateFrom, dateTo, sortKey, sortDir]);

  const filteredFarmers = useMemo(() => {
    if (!farmerSearch) return FARMERS;
    const q = farmerSearch.toLowerCase();
    return FARMERS.filter(f => f.tenHo.toLowerCase().includes(q) || f.maHo.toLowerCase().includes(q) || f.diaChi.toLowerCase().includes(q));
  }, [farmerSearch]);

  /* Stats */
  const totalKL   = receipts.reduce((s,r) => s + r.khoiLuong, 0);
  const totalTien = receipts.reduce((s,r) => s + r.thanhTien, 0);
  const pendingCount = poList.filter(o => ["yeu-cau","dat-hang","nhan-hang","qc"].includes(o.trangThai)).length;
  const uniqueHoCount = new Set(receipts.map(r => r.maHo)).size;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Mua hàng</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Yêu cầu mua → Đặt hàng → Nhận hàng → QC → Nhập kho → Thanh toán</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"><FileText className="w-3.5 h-3.5" /> PDF</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"><Printer className="w-3.5 h-3.5" /> In</button>
            <button onClick={() => { setShowCreate(true); resetForm(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"><Plus className="w-4 h-4" /> Tạo đơn mua</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Leaf,           label: "Tổng thu mua",  value: fmtKg(totalKL),             sub: "nguyên liệu tươi",    color: "text-emerald-600 bg-emerald-50" },
          { icon: TrendingUp,     label: "Chi phí",        value: (totalTien/1e6).toFixed(1)+" tr đ", sub: "đã thanh toán",  color: "text-blue-600 bg-blue-50" },
          { icon: Clock,          label: "Đang xử lý",     value: `${pendingCount} đơn`,       sub: "cần xử lý tiếp",       color: "text-amber-600 bg-amber-50" },
          { icon: Users,          label: "Nông hộ",         value: `${uniqueHoCount} hộ`,      sub: "đã giao chè",          color: "text-violet-600 bg-violet-50" },
        ].map((s,i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border overflow-x-auto">
        {[
          { key: "po",        label: "Đơn mua (PO)",  count: poList.length },
          { key: "receipt",   label: "Nhận hàng",      count: receipts.length },
          { key: "farmers",   label: "Nông hộ",         count: FARMERS.length },
          { key: "quy-cach",  label: "Quy cách & Giá", count: Object.keys(QUY_CACH_CFG).length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab === tab.key ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── PO Tab ── */}
      {activeTab === "po" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã PO, nông hộ..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as POStatus | "")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Tất cả TT</option>
              {Object.entries(PO_STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={diaChi} onChange={e => setDiaChi(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Tất cả vùng</option>
              {["Nà Hồng","Nà Bay","Bản Chang"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background" />
            <span className="text-muted-foreground text-sm">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background" />
            <button onClick={() => { setSearch(""); setStatusFilter(""); setDiaChi(""); setDateFrom(""); setDateTo(""); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"><Filter className="w-3.5 h-3.5" /> Lọc</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {[
                  { key:"maPO", label:"Mã PO" }, { key:"tenHo", label:"Nông hộ" },
                  { key:"maVuon", label:"Vùng trồng" }, { key:"ngayTao", label:"Ngày tạo" },
                  { key:"khoiLuongDat", label:"KL đặt (kg)" }, { key:"khoiLuongNhan", label:"KL nhận (kg)" },
                  { key:"trangThai", label:"Trạng thái" }, { key:"qcResult", label:"QC" },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground uppercase tracking-wide">Thao tác</th>
              </tr></thead>
              <tbody>
                {filteredPO.map(po => {
                  const sc = PO_STATUS_CFG[po.trangThai];
                  const Ic = sc.icon;
                  const qc = QC_CFG[po.qcResult];
                  return (
                    <tr key={po.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedPO(po)}>
                      <td className="py-3 px-4"><span className="font-mono text-xs font-semibold text-primary">{po.maPO}</span></td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">{po.tenHo}</p>
                        <span className={`inline-flex text-xs px-1.5 py-0.5 rounded-md font-medium ${AREA_COLORS[po.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{po.diaChi}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{po.maVuon}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{po.ngayTao}</td>
                      <td className="py-3 px-4 font-medium text-sm">{po.khoiLuongDat}</td>
                      <td className="py-3 px-4 text-sm">{po.khoiLuongNhan > 0 ? <span className="font-semibold text-emerald-700">{po.khoiLuongNhan}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}><Ic className="w-3 h-3" />{sc.label}</span></td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${qc.color}`}>{qc.label}</span></td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => setSelectedPO(po)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" title="Xem"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(po.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors" title="Xóa"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPO.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Không có đơn mua nào</div>}
          </div>
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Hiển thị {filteredPO.length} / {poList.length} đơn</p>
            <p className="text-xs font-semibold">KL: {filteredPO.reduce((s,o) => s+o.khoiLuongNhan, 0).toFixed(1)} kg nhận · {filteredPO.reduce((s,o) => s+o.khoiLuongDat, 0).toFixed(1)} kg đặt</p>
          </div>
        </div>
      )}

      {/* ── Nhận hàng Tab ── */}
      {activeTab === "receipt" && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Tìm nông hộ, mã PO..." className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"><FileSpreadsheet className="w-3.5 h-3.5" /> Xuất Excel</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {["STT","Mã PO","Nông hộ","Vùng","Ngày nhận","Quy cách","KL (kg)","Đơn giá","Thành tiền","Batch ID"].map((h,i) => (
                  <th key={i} className="text-left py-2.5 px-4 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {receipts.map((r, i) => (
                  <tr key={r.id} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{i+1}</td>
                    <td className="py-2.5 px-4"><span className="font-mono text-xs text-primary">{r.maPO || "—"}</span></td>
                    <td className="py-2.5 px-4">
                      <p className="font-medium text-sm">{r.tenHo}</p>
                      <span className="text-xs text-muted-foreground">{r.maHo}</span>
                    </td>
                    <td className="py-2.5 px-4"><span className={`inline-flex text-xs px-1.5 py-0.5 rounded-md font-medium ${AREA_COLORS[r.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{r.diaChi}</span></td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{r.ngay}</td>
                    <td className="py-2.5 px-4 text-xs">{r.quyCach}</td>
                    <td className="py-2.5 px-4 font-semibold">{r.khoiLuong.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-xs">{r.donGia.toLocaleString("vi-VN")}</td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-700">{fmt(r.thanhTien)}</td>
                    <td className="py-2.5 px-4">{r.batchId ? <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">{r.batchId}</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-emerald-50/50">
            <p className="text-xs text-muted-foreground">{receipts.length} phiếu nhận hàng</p>
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold">Tổng KL: <span className="text-emerald-700">{fmtKg(receipts.reduce((s,r) => s+r.khoiLuong, 0))}</span></p>
              <p className="text-xs font-semibold">Tổng tiền: <span className="text-emerald-700">{fmt(receipts.reduce((s,r) => s+r.thanhTien, 0))}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* ── Nông hộ Tab ── */}
      {activeTab === "farmers" && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={farmerSearch} onChange={e => setFarmerSearch(e.target.value)} placeholder="Tìm tên hộ, mã hộ, vùng..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFarmers.map(f => {
              const zones = ZONES[f.maHo] ?? [];
              const farmerReceipts = receipts.filter(r => r.maHo === f.maHo);
              const totalKLFarmer = farmerReceipts.reduce((s,r) => s+r.khoiLuong, 0);
              return (
                <div key={f.maHo} className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{f.tenHo}</p>
                        <span className="font-mono text-xs text-muted-foreground">{f.maHo}</span>
                      </div>
                    </div>
                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${AREA_COLORS[f.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{f.diaChi}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {f.sdt && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{f.sdt}</div>}
                    <div className="flex items-center gap-1.5"><Leaf className="w-3 h-3" />{f.dienTich} ha · Shan Tuyết</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{zones.length} vùng trồng · {zones.map(z => z.tenVuon).join(", ")}</div>
                  </div>
                  {totalKLFarmer > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Đã giao</span>
                      <span className="text-xs font-semibold text-emerald-700">{fmtKg(totalKLFarmer)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quy cách & Giá Tab ── */}
      {activeTab === "quy-cach" && (
        <div className="space-y-5">
          {/* Bảng quy cách + đơn giá */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-sm">Bảng quy cách thu hái & đơn giá</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ban hành theo quy định thu mua chè Shan Tuyết Bằng Phúc — HTX Hồng Hà</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">STT</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Quy cách</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Loại chè</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đơn giá (đ/kg)</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Object.entries(QUY_CACH_CFG).map(([q, cfg], i) => (
                    <tr key={q} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-bold">{q}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs px-2.5 py-1 rounded-lg font-semibold border ${cfg.color}`}>{cfg.loaiChe}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{cfg.priceNote}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {cfg.fixedPrice ? "Giá cố định" : "Tính theo % chất lượng"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bảng đơn giá theo % chất lượng */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-sm">Bảng đơn giá theo % chất lượng</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Áp dụng cho quy cách: <strong>1 tôm</strong> (Chè xanh) và <strong>1 tôm 2 lá</strong> (Bạch trà)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">STT</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">% Đánh giá</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Đơn giá</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {QUALITY_PRICE_TABLE.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold">{row.label}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{row.gia.toLocaleString("vi-VN")} đ/kg</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {i === 0 ? "Đạt cơ bản" : i === 1 ? "Khá" : i === 2 ? "Tốt" : "Xuất sắc"}
                      </td>
                    </tr>
                  ))}
                  <tr className="hover:bg-muted/20 transition-colors bg-violet-50/60">
                    <td className="px-4 py-3 text-muted-foreground text-xs">5</td>
                    <td className="px-4 py-3 font-semibold text-violet-800">Cây di sản</td>
                    <td className="px-4 py-3 text-right font-bold text-violet-700">40,000 – 60,000 đ/kg</td>
                    <td className="px-4 py-3 text-xs text-violet-600 font-medium">Đặc sản / Di sản</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 tiêu chuẩn đánh giá từ quy cách */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-sm">Tiêu chuẩn đánh giá chất lượng búp chè</h3>
              <p className="text-xs text-muted-foreground mt-0.5">3 tiêu chí cốt lõi theo quy cách thu mua</p>
            </div>
            <div className="divide-y divide-border/60">
              {[
                { stt: "01", tieu: "Độ non, già của búp chè", moTa: "Búp phải non, đúng quy cách cam kết. Không hái già, không lẫn búp đen. Búp 1 tôm: chỉ lấy đỉnh búp cuộn. Tôm 2 lá: 2 lá non đầu tiên.", mau: "bg-emerald-500" },
                { stt: "02", tieu: "Độ đồng đều khi thu hái",  moTa: "Búp chè đồng đều về kích cỡ và độ trưởng thành. Không lẫn quy cách khác. Tỷ lệ lẫn không được vượt quá 3% theo khối lượng.", mau: "bg-blue-500" },
                { stt: "03", tieu: "Độ chuẩn chỉ khi thu hái", moTa: "Thu hái đúng kỹ thuật: ngắt sát cuống, không dập nát, không để bị oxy hoá trước khi giao. Vận chuyển trong giỏ thoáng, không nén chặt.", mau: "bg-amber-500" },
              ].map(item => (
                <div key={item.stt} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/10 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${item.mau} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className="text-white text-xs font-bold">{item.stt}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.tieu}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.moTa}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PO Detail Drawer ── */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedPO(null)} />
          <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{selectedPO.maPO}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Tạo bởi {selectedPO.nguoiTao} · {selectedPO.ngayTao}</p>
              </div>
              <button onClick={() => setSelectedPO(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 px-5 py-4 space-y-5">
              {/* Status stepper */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Luồng nghiệp vụ</p>
                <div className="grid grid-cols-6 gap-0.5">
                  {PO_FLOW.map((s, i) => {
                    const sc = PO_STATUS_CFG[s];
                    const idx = PO_FLOW.indexOf(selectedPO.trangThai);
                    const isActive  = idx >= i;
                    const isCurrent = selectedPO.trangThai === s;
                    return (
                      <button key={s} onClick={() => handleStatusChange(selectedPO.id, s)}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all ${isCurrent ? "bg-primary/10 border border-primary/30" : isActive ? "bg-muted/40" : "opacity-40 hover:opacity-70"}`}>
                        <sc.icon className={`w-3.5 h-3.5 ${isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`} />
                        <span className={`text-[9px] font-medium text-center leading-tight ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{sc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QC */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Kết quả kiểm tra chất lượng (QC)</p>
                <div className="flex gap-2">
                  {(["pending","pass","fail","reduce"] as QCResult[]).map(q => (
                    <button key={q} onClick={() => handleQCChange(selectedPO.id, q)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${selectedPO.qcResult === q ? `${QC_CFG[q].color} border-current` : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                      {QC_CFG[q].label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Độ ẩm / chất lượng:</span>
                  <span className="text-xs font-semibold text-primary">{selectedPO.chatLuong}%</span>
                  <span className="text-xs text-muted-foreground">· Quy cách: <strong>{selectedPO.quyCach}</strong></span>
                </div>
              </div>

              {/* Farmer + Zone */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nông hộ & Vùng trồng</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{selectedPO.tenHo} <span className="font-mono text-xs text-muted-foreground">({selectedPO.maHo})</span></p>
                    <span className={`inline-flex text-xs px-1.5 py-0.5 rounded-full font-medium ${AREA_COLORS[selectedPO.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{selectedPO.diaChi}</span>
                    {selectedPO.sdt && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{selectedPO.sdt}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div><p className="text-xs text-muted-foreground">Vùng trồng</p><p className="text-sm font-medium">{selectedPO.maVuon}</p></div>
                  <div><p className="text-xs text-muted-foreground">Tên vườn</p><p className="text-sm font-medium">{selectedPO.tenVuon}</p></div>
                  <div><p className="text-xs text-muted-foreground">Ngày đặt</p><p className="text-sm font-medium">{selectedPO.ngayTao}</p></div>
                  <div><p className="text-xs text-muted-foreground">Ngày giao dự kiến</p><p className="text-sm font-medium">{selectedPO.ngayGiao || "—"}</p></div>
                </div>
              </div>

              {/* Quantities + price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">KL đặt</p>
                  <p className="text-xl font-bold text-foreground">{selectedPO.khoiLuongDat}</p>
                  <p className="text-xs text-muted-foreground">kg · {selectedPO.quyCach}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">KL thực nhận</p>
                  <p className={`text-xl font-bold ${selectedPO.khoiLuongNhan > 0 ? "text-emerald-700" : "text-muted-foreground"}`}>{selectedPO.khoiLuongNhan > 0 ? selectedPO.khoiLuongNhan : "—"}</p>
                  {selectedPO.khoiLuongNhan > 0 && <p className="text-xs text-muted-foreground">kg · {fmt(selectedPO.khoiLuongNhan * selectedPO.donGia)}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-muted/20 rounded-xl">
                <span className="text-sm text-muted-foreground">Đơn giá</span>
                <span className="text-lg font-bold text-primary">{fmt(selectedPO.donGia)}/kg</span>
              </div>

              {/* Batch */}
              {selectedPO.batchId ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Package className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold">Batch nguyên liệu (gốc truy xuất)</p>
                    <p className="font-mono text-sm font-bold text-emerald-800">{selectedPO.batchId}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">Batch sẽ được tạo tự động khi chuyển sang bước <strong>Nhập kho</strong></p>
                </div>
              )}

              {/* Trace chain snapshot */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Chuỗi truy xuất nguồn gốc (Snapshot)</p>
                <div className="flex items-start gap-1.5 flex-wrap text-xs">
                  {[
                    { label:"Nông hộ", val:`${selectedPO.tenHo} (${selectedPO.maHo})`, color:"bg-emerald-100 border-emerald-300 text-emerald-800" },
                    { label:"Vùng trồng", val:selectedPO.diaChi, color:"bg-blue-100 border-blue-300 text-blue-800" },
                    { label:"Vườn cụ thể", val:`${selectedPO.maVuon}`, color:"bg-violet-100 border-violet-300 text-violet-800" },
                    { label:"Batch RAW", val:selectedPO.batchId||"Chưa tạo", color:selectedPO.batchId?"bg-amber-100 border-amber-300 text-amber-800":"bg-gray-100 border-gray-300 text-gray-600" },
                  ].map((step,si)=>(
                    <div key={si} className="flex items-center gap-1">
                      {si>0&&<ArrowRight className="w-3 h-3 text-muted-foreground shrink-0"/>}
                      <div className={`border px-2.5 py-1.5 rounded-lg ${step.color}`}>
                        <p className="font-semibold text-[10px] uppercase tracking-wide opacity-70">{step.label}</p>
                        <p className="font-bold text-xs mt-0.5">{step.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2.5">✓ Thông tin vùng trồng đã được lưu snapshot tại thời điểm tạo đơn mua</p>
              </div>

              {selectedPO.ghiChu && (
                <div className="px-4 py-3 bg-muted/20 rounded-xl">
                  <p className="text-xs text-muted-foreground">Ghi chú</p>
                  <p className="text-sm italic mt-0.5">{selectedPO.ghiChu}</p>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors"><Printer className="w-3.5 h-3.5" /> In phiếu</button>
              <button onClick={() => handleDelete(selectedPO.id)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create PO Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowCreate(false); resetForm(); }} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Tạo đơn mua nguyên liệu</span>
              </div>
              <div className="flex items-center gap-2">
                {/* step indicator */}
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${step === "chon-ho" ? "bg-primary" : "bg-primary/30"}`} />
                  <span className={`w-2 h-2 rounded-full ${step === "chi-tiet" ? "bg-primary" : "bg-primary/30"}`} />
                </div>
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>

            {step === "chon-ho" ? (
              /* ── Step 1: Chọn nông hộ ── */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Bước 1: Chọn nông hộ</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input value={hoSearch} onChange={e => setHoSearch(e.target.value)} placeholder="Tìm tên, mã hộ, vùng..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <button onClick={() => setQrMode(m => !m)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${qrMode ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                      <QrCode className="w-4 h-4" /> QR
                    </button>
                  </div>
                  {qrMode && (
                    <div className="mt-3 border-2 border-dashed border-primary/30 rounded-xl p-4 text-center bg-primary/5">
                      <QrCode className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                      <p className="text-xs text-primary/70 font-medium">Camera QR sẽ mở ở đây</p>
                      <p className="text-xs text-muted-foreground mt-1">Hướng vào mã QR trên thẻ nông hộ để điền tự động</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-border">
                  {filteredHo.map(h => (
                    <button key={h.maHo} onClick={() => { setSelHo(h); const vs = ZONES[h.maHo]; setSelVuon(vs?.[0]?.maVuon ?? ""); }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left ${selHo?.maHo === h.maHo ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
                        <div>
                          <p className="text-sm font-medium">{h.tenHo}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs text-muted-foreground">{h.maHo}</span>
                            <span className={`inline-flex text-xs px-1.5 rounded-md font-medium ${AREA_COLORS[h.diaChi] ?? "bg-gray-100 text-gray-600"}`}>{h.diaChi}</span>
                            <span className="text-xs text-muted-foreground">{h.dienTich} ha</span>
                          </div>
                        </div>
                      </div>
                      {selHo?.maHo === h.maHo && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="p-4 border-t border-border shrink-0">
                  <button onClick={() => selHo && setStep("chi-tiet")} disabled={!selHo}
                    className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                    Tiếp theo: Thông tin đơn <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ── Step 2: Chi tiết đơn mua ── */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                  {/* Selected farmer summary */}
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{selHo?.tenHo} <span className="font-mono text-xs text-muted-foreground">({selHo?.maHo})</span></p>
                      <p className="text-xs text-muted-foreground">{selHo?.diaChi} · {selHo?.dienTich} ha</p>
                    </div>
                    <button onClick={() => setStep("chon-ho")} className="text-xs text-primary hover:underline">Đổi</button>
                  </div>

                  {/* Zone selection */}
                  {zonesOfSel.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Vùng trồng</label>
                      <div className="grid grid-cols-2 gap-2">
                        {zonesOfSel.map(z => (
                          <button key={z.maVuon} onClick={() => setSelVuon(z.maVuon)}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${selVuon === z.maVuon ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}>
                            <p className="font-semibold">{z.maVuon}</p>
                            <p>{z.tenVuon} · {z.dienTich} ha</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold mb-1.5">Ngày tạo</label><input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                    <div><label className="block text-xs font-semibold mb-1.5">Ngày giao dự kiến</label><input type="date" value={fGiao} onChange={e => setFGiao(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                  </div>

                  {/* Quy cách */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Quy cách hái</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {Object.entries(QUY_CACH_CFG).map(([q, cfg]) => (
                        <button key={q} onClick={() => setFQuyCach(q)}
                          className={`px-3 py-2.5 text-left rounded-xl border-2 transition-all ${fQuyCach === q ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}>
                          <p className="text-sm font-bold">{q}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.loaiChe} · <span className="font-semibold text-primary">{cfg.priceNote}</span></p>
                        </button>
                      ))}
                    </div>
                    {fQuyCach && (
                      <div className={`text-xs px-3 py-2 rounded-lg border ${QUY_CACH_CFG[fQuyCach]?.color ?? "bg-muted/20 border-border"}`}>
                        <span className="font-semibold">{fQuyCach}</span> → Sản xuất <strong>{QUY_CACH_CFG[fQuyCach]?.loaiChe}</strong> · Giá: {QUY_CACH_CFG[fQuyCach]?.priceNote}
                        {!QUY_CACH_CFG[fQuyCach]?.fixedPrice && <span className="ml-1 opacity-70">(tính theo % chất lượng bên dưới)</span>}
                      </div>
                    )}
                  </div>

                  {/* KL + Chat luong */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Khối lượng (kg) <span className="text-red-500">*</span></label>
                      <input type="number" value={fKL} onChange={e => setFKL(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Chất lượng ({fCL}%)</label>
                      <input type="range" min={70} max={100} value={fCL} onChange={e => setFCL(+e.target.value)} className="w-full mt-3 accent-primary" />
                    </div>
                  </div>

                  {/* Price preview */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/20 rounded-xl">
                    <div>
                      <p className="text-xs text-muted-foreground">Đơn giá tính toán</p>
                      <p className="text-lg font-bold text-primary">{fmt(fDonGia)}/kg</p>
                    </div>
                    {fKL && <div className="text-right">
                      <p className="text-xs text-muted-foreground">Thành tiền</p>
                      <p className="text-xl font-bold text-emerald-700">{fmt(fTotal)}</p>
                    </div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Ghi chú</label>
                    <textarea value={fNote} onChange={e => setFNote(e.target.value)} rows={2} placeholder="Ghi chú đơn mua..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
                  <button onClick={() => setStep("chon-ho")} className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Quay lại</button>
                  <button onClick={handleCreate} disabled={!fKL || parseFloat(fKL) <= 0}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Tạo đơn mua
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
