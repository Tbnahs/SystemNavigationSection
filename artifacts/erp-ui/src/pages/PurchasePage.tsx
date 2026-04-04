import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft, Search, Download, ChevronUp, ChevronDown,
  Users, Leaf, TrendingUp, Calendar, Filter, X,
  CheckSquare, Square, Plus, ChevronRight, MapPin, Phone,
  FileSpreadsheet, FileText, Printer,
} from "lucide-react";

const thuMuaData = [
  { stt: 1,  maHo: "NH004", tenHo: "Triệu Văn Thạo",    diaChi: "Nà Hồng",   thoiGian: "30/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 27000,  thanhTien: 364500,  maME: "NH0043003" },
  { stt: 2,  maHo: "NB002", tenHo: "Nông Văn Nghiễm",   diaChi: "Nà Bay",    thoiGian: "30/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 12.00, donGia: 27000,  thanhTien: 324000,  maME: "NB0023003" },
  { stt: 3,  maHo: "NH008", tenHo: "Đồng Thị Khuyết",   diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 8.50,  donGia: 28500,  thanhTien: 242250,  maME: "NH0083103" },
  { stt: 4,  maHo: "NH001", tenHo: "Hoàng Thị Luyến",   diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 10.00, donGia: 28000,  thanhTien: 280000,  maME: "NH0013103" },
  { stt: 5,  maHo: "NH002", tenHo: "Hoàng Thị Đào",     diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.00,  donGia: 28000,  thanhTien: 252000,  maME: "NH0023103" },
  { stt: 6,  maHo: "NH009", tenHo: "Hạ Văn Thắng",      diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 3.00,  donGia: 27000,  thanhTien: 81000,   maME: "NH0093103" },
  { stt: 7,  maHo: "NH004", tenHo: "Triệu Văn Thạo",    diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 25.50, donGia: 28000,  thanhTien: 714000,  maME: "NH0043103" },
  { stt: 8,  maHo: "NH006", tenHo: "Triệu Văn Hòa",     diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 15.00, donGia: 28000,  thanhTien: 420000,  maME: "NH0063103" },
  { stt: 9,  maHo: "NH007", tenHo: "Hoàng Văn Tuấn",    diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 22.00, donGia: 27000,  thanhTien: 594000,  maME: "NH0073103" },
  { stt: 10, maHo: "NB009", tenHo: "Triệu Văn Hánh",    diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 28000,  thanhTien: 378000,  maME: "NB0093103" },
  { stt: 11, maHo: "NB010", tenHo: "Mạnh Văn Hồ",       diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 5.00,  donGia: 29000,  thanhTien: 145000,  maME: "NB0103103" },
  { stt: 12, maHo: "NH010", tenHo: "Dương Thị Tươi",    diaChi: "Nà Hồng",   thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.30,  donGia: 27000,  thanhTien: 251100,  maME: "NH0103103" },
  { stt: 13, maHo: "NB010", tenHo: "Mạnh Văn Hồ",       diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 2.50,  donGia: 520000, thanhTien: 1300000, maME: "NB0103103" },
  { stt: 14, maHo: "NB001", tenHo: "Nông Thị Dung",     diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 1.80,  donGia: 520000, thanhTien: 936000,  maME: "NB0013103" },
  { stt: 15, maHo: "NB002", tenHo: "Nông Văn Nghiễm",   diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 2.80,  donGia: 520000, thanhTien: 1456000, maME: "NB0023103" },
  { stt: 16, maHo: "NB007", tenHo: "Nguyễn Văn Hân",    diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 2.37,  donGia: 520000, thanhTien: 1232400, maME: "NB0073103" },
  { stt: 17, maHo: "NB009", tenHo: "Triệu Văn Hánh",    diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 0.40,  donGia: 520000, thanhTien: 208000,  maME: "NB0093103" },
  { stt: 18, maHo: "NB004", tenHo: "Triệu Văn Mỹ",      diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 1.05,  donGia: 520000, thanhTien: 546000,  maME: "NB0043103" },
  { stt: 19, maHo: "NB006", tenHo: "Hoàng Văn Thống",   diaChi: "Nà Bay",    thoiGian: "31/03/2026", quyCach: "1 tôm",      khoiLuong: 4.90,  donGia: 520000, thanhTien: 2548000, maME: "NB0063103" },
  { stt: 20, maHo: "NH001", tenHo: "Hoàng Thị Luyến",   diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 3.20,  donGia: 29000,  thanhTien: 92800,   maME: "NH001104" },
  { stt: 21, maHo: "NH004", tenHo: "Triệu Văn Thạo",    diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 21.50, donGia: 29000,  thanhTien: 623500,  maME: "NH004104" },
  { stt: 22, maHo: "NB011", tenHo: "Hoàng Thị Điềm",    diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 5.00,  donGia: 29000,  thanhTien: 145000,  maME: "NB011104" },
  { stt: 23, maHo: "NB012", tenHo: "Lâm Thị Tới",       diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.50, donGia: 29000,  thanhTien: 333500,  maME: "NB012104" },
  { stt: 24, maHo: "NB010", tenHo: "Mạnh Văn Hồ",       diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 15.00, donGia: 29000,  thanhTien: 435000,  maME: "NB010104" },
  { stt: 25, maHo: "NB013", tenHo: "Triệu Văn Cường",   diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 35.70, donGia: 29000,  thanhTien: 1035300, maME: "NB013104" },
  { stt: 26, maHo: "NB002", tenHo: "Nông Văn Nghiễm",   diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 19.30, donGia: 29000,  thanhTien: 559700,  maME: "NB002104" },
  { stt: 27, maHo: "NB004", tenHo: "Triệu Văn Mỹ",      diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.40, donGia: 29000,  thanhTien: 388600,  maME: "NB004104" },
  { stt: 28, maHo: "NB001", tenHo: "Nông Thị Dung",     diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 31.50, donGia: 29000,  thanhTien: 913500,  maME: "NB001104" },
  { stt: 29, maHo: "NB006", tenHo: "Hoàng Văn Thống",   diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 23.80, donGia: 29000,  thanhTien: 690200,  maME: "NB006104" },
  { stt: 30, maHo: "NH007", tenHo: "Hoàng Văn Tuấn",    diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.50, donGia: 28000,  thanhTien: 322000,  maME: "NH007104" },
  { stt: 31, maHo: "NH003", tenHo: "Phạm Thị Huyền",    diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 4.60,  donGia: 28000,  thanhTien: 128800,  maME: "NH003104" },
  { stt: 32, maHo: "NH010", tenHo: "Dương Thị Tươi",    diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 6.30,  donGia: 28000,  thanhTien: 176400,  maME: "NH010104" },
  { stt: 33, maHo: "BC003", tenHo: "Hoàng Văn Mỹ",      diaChi: "Bản Chang", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.70, donGia: 28000,  thanhTien: 327600,  maME: "BC003104" },
  { stt: 34, maHo: "NH006", tenHo: "Triệu Văn Hòa",     diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 16.50, donGia: 28000,  thanhTien: 462000,  maME: "NH006104" },
  { stt: 35, maHo: "NH008", tenHo: "Đồng Thị Khuyết",   diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.00,  donGia: 28000,  thanhTien: 252000,  maME: "NH008104" },
  { stt: 36, maHo: "NB009", tenHo: "Triệu Văn Hánh",    diaChi: "Nà Bay",    thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 34.50, donGia: 27000,  thanhTien: 931500,  maME: "NB009104" },
  { stt: 37, maHo: "NH009", tenHo: "Hạ Văn Thắng",      diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 18.00, donGia: 29000,  thanhTien: 522000,  maME: "NH009104" },
  { stt: 38, maHo: "NH002", tenHo: "Hoàng Thị Đào",     diaChi: "Nà Hồng",   thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 29000,  thanhTien: 391500,  maME: "NH002104" },
  { stt: 39, maHo: "NB009", tenHo: "Triệu Văn Hánh",    diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 15.00, donGia: 28000,  thanhTien: 420000,  maME: "NB009304" },
  { stt: 40, maHo: "NB002", tenHo: "Nông Văn Nghiễm",   diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 44.00, donGia: 29000,  thanhTien: 1276000, maME: "NB002304" },
  { stt: 41, maHo: "NB001", tenHo: "Nông Thị Dung",     diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 32.00, donGia: 29000,  thanhTien: 928000,  maME: "NB001304" },
  { stt: 42, maHo: "NB006", tenHo: "Hoàng Văn Thống",   diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 49.20, donGia: 29000,  thanhTien: 1426800, maME: "NB006304" },
  { stt: 43, maHo: "NB013", tenHo: "Triệu Văn Cường",   diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 50.00, donGia: 29000,  thanhTien: 1450000, maME: "NB013304" },
  { stt: 44, maHo: "NB004", tenHo: "Triệu Văn Mỹ",      diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 21.50, donGia: 29000,  thanhTien: 623500,  maME: "NB004304" },
  { stt: 45, maHo: "NB011", tenHo: "Hoàng Thị Điềm",    diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.00, donGia: 29000,  thanhTien: 319000,  maME: "NB011304" },
  { stt: 46, maHo: "NB005", tenHo: "Nông Văn Đẳng",     diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 16.00, donGia: 27000,  thanhTien: 432000,  maME: "NB005304" },
  { stt: 47, maHo: "NB008", tenHo: "Nguyễn Thị Đa",     diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.20,  donGia: 27000,  thanhTien: 248400,  maME: "NB008304" },
  { stt: 48, maHo: "NH005", tenHo: "Hoàng Văn Thái",    diaChi: "Nà Hồng",   thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 8.00,  donGia: 27000,  thanhTien: 216000,  maME: "NH005304" },
  { stt: 49, maHo: "BC001", tenHo: "Hoàng Phúc Khôi",   diaChi: "Bản Chang", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 12.40, donGia: 28000,  thanhTien: 347200,  maME: "BC001304" },
  { stt: 50, maHo: "BC002", tenHo: "Triệu Văn Dựng",    diaChi: "Bản Chang", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 17.60, donGia: 28000,  thanhTien: 492800,  maME: "BC002304" },
  { stt: 51, maHo: "NB010", tenHo: "Mạnh Văn Hồ",       diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm",      khoiLuong: 1.20,  donGia: 520000, thanhTien: 624000,  maME: "NB010304" },
  { stt: 52, maHo: "NB002", tenHo: "Nông Văn Nghiễm",   diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm",      khoiLuong: 0.80,  donGia: 520000, thanhTien: 416000,  maME: "NB002304B" },
  { stt: 53, maHo: "NH009", tenHo: "Hạ Văn Thắng",      diaChi: "Nà Hồng",   thoiGian: "03/04/2026", quyCach: "1 tôm",      khoiLuong: 1.50,  donGia: 520000, thanhTien: 780000,  maME: "NH009304" },
  { stt: 54, maHo: "NB007", tenHo: "Nguyễn Văn Hân",    diaChi: "Nà Bay",    thoiGian: "03/04/2026", quyCach: "1 tôm",      khoiLuong: 0.60,  donGia: 520000, thanhTien: 312000,  maME: "NB007304" },
];

const dsHoLKData = [
  { stt: 1,  hoDan: "Hoàng Thị Luyến",  maHo: "NH001", diaChi: "Nà Hồng",   sdt: "354125321", dienTich: 0.5 },
  { stt: 2,  hoDan: "Hoàng Thị Đào",    maHo: "NH002", diaChi: "Nà Hồng",   sdt: "374704822", dienTich: 0.4 },
  { stt: 3,  hoDan: "Phạm Thị Huyền",   maHo: "NH003", diaChi: "Nà Hồng",   sdt: "379251872", dienTich: 1.0 },
  { stt: 4,  hoDan: "Triệu Văn Thạo",   maHo: "NH004", diaChi: "Nà Hồng",   sdt: "354871949", dienTich: 0.8 },
  { stt: 5,  hoDan: "Hoàng Văn Thái",   maHo: "NH005", diaChi: "Nà Hồng",   sdt: "972061820", dienTich: 0.5 },
  { stt: 6,  hoDan: "Triệu Văn Hòa",    maHo: "NH006", diaChi: "Nà Hồng",   sdt: "378360830", dienTich: 0.8 },
  { stt: 7,  hoDan: "Hoàng Văn Tuấn",   maHo: "NH007", diaChi: "Nà Hồng",   sdt: "387851867", dienTich: 1.0 },
  { stt: 8,  hoDan: "Đồng Thị Khuyết",  maHo: "NH008", diaChi: "Nà Hồng",   sdt: "962041090", dienTich: 0.7 },
  { stt: 9,  hoDan: "Hạ Văn Thắng",     maHo: "NH009", diaChi: "Nà Hồng",   sdt: "337318858", dienTich: 1.5 },
  { stt: 10, hoDan: "Dương Thị Tươi",   maHo: "NH010", diaChi: "Nà Hồng",   sdt: "",          dienTich: 0.5 },
  { stt: 11, hoDan: "Nông Thị Dung",    maHo: "NB001", diaChi: "Nà Bay",    sdt: "961466732", dienTich: 1.5 },
  { stt: 12, hoDan: "Nông Văn Nghiễm",  maHo: "NB002", diaChi: "Nà Bay",    sdt: "814665955", dienTich: 1.0 },
  { stt: 13, hoDan: "Mùng Văn Thời",    maHo: "NB003", diaChi: "Nà Bay",    sdt: "369254973", dienTich: 0.6 },
  { stt: 14, hoDan: "Triệu Văn Mỹ",     maHo: "NB004", diaChi: "Nà Bay",    sdt: "383760794", dienTich: 1.0 },
  { stt: 15, hoDan: "Nông Văn Đẳng",    maHo: "NB005", diaChi: "Nà Bay",    sdt: "374258744", dienTich: 1.0 },
  { stt: 16, hoDan: "Hoàng Văn Thống",  maHo: "NB006", diaChi: "Nà Bay",    sdt: "967186387", dienTich: 1.0 },
  { stt: 17, hoDan: "Nguyễn Văn Hân",   maHo: "NB007", diaChi: "Nà Bay",    sdt: "984922577", dienTich: 1.0 },
  { stt: 18, hoDan: "Nguyễn Thị Đa",    maHo: "NB008", diaChi: "Nà Bay",    sdt: "372122030", dienTich: 0.7 },
  { stt: 19, hoDan: "Triệu Văn Hánh",   maHo: "NB009", diaChi: "Nà Bay",    sdt: "345665232", dienTich: 0.8 },
  { stt: 20, hoDan: "Mạnh Văn Hồ",      maHo: "NB010", diaChi: "Nà Bay",    sdt: "349055299", dienTich: 2.0 },
  { stt: 21, hoDan: "Hoàng Thị Điềm",   maHo: "NB011", diaChi: "Nà Bay",    sdt: "375182932", dienTich: 0.4 },
  { stt: 22, hoDan: "Lâm Thị Tới",      maHo: "NB012", diaChi: "Nà Bay",    sdt: "353839713", dienTich: 0.0 },
  { stt: 23, hoDan: "Triệu Văn Cường",  maHo: "NB013", diaChi: "Nà Bay",    sdt: "",          dienTich: 0.0 },
  { stt: 24, hoDan: "Hoàng Phúc Khôi",  maHo: "BC001", diaChi: "Bản Chang", sdt: "333770931", dienTich: 0.6 },
  { stt: 25, hoDan: "Triệu Văn Dựng",   maHo: "BC002", diaChi: "Bản Chang", sdt: "343233785", dienTich: 2.0 },
  { stt: 26, hoDan: "Hoàng Văn Mỹ",     maHo: "BC003", diaChi: "Bản Chang", sdt: "",          dienTich: 0.0 },
];

const vuonTrongData: Record<string, { maVuon: string; tenVuon: string; dienTich: number; loaiChe: string }[]> = {
  NH001: [{ maVuon: "NH001-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.3, loaiChe: "Shan Tuyết" }, { maVuon: "NH001-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.2, loaiChe: "Shan Tuyết" }],
  NH002: [{ maVuon: "NH002-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NH003: [{ maVuon: "NH003-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }, { maVuon: "NH003-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
  NH004: [{ maVuon: "NH004-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }, { maVuon: "NH004-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.3, loaiChe: "Shan Tuyết" }],
  NH005: [{ maVuon: "NH005-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
  NH006: [{ maVuon: "NH006-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.4, loaiChe: "Shan Tuyết" }, { maVuon: "NH006-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NH007: [{ maVuon: "NH007-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.6, loaiChe: "Shan Tuyết" }, { maVuon: "NH007-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NH008: [{ maVuon: "NH008-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.7, loaiChe: "Shan Tuyết" }],
  NH009: [{ maVuon: "NH009-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.8, loaiChe: "Shan Tuyết" }, { maVuon: "NH009-V2", tenVuon: "Vườn Nà Hồng 2", dienTich: 0.7, loaiChe: "Shan Tuyết" }],
  NH010: [{ maVuon: "NH010-V1", tenVuon: "Vườn Nà Hồng 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
  NB001: [{ maVuon: "NB001-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.8, loaiChe: "Shan Tuyết" }, { maVuon: "NB001-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.7, loaiChe: "Shan Tuyết" }],
  NB002: [{ maVuon: "NB002-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.6, loaiChe: "Shan Tuyết" }, { maVuon: "NB002-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NB003: [{ maVuon: "NB003-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.6, loaiChe: "Shan Tuyết" }],
  NB004: [{ maVuon: "NB004-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }, { maVuon: "NB004-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
  NB005: [{ maVuon: "NB005-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 1.0, loaiChe: "Shan Tuyết" }],
  NB006: [{ maVuon: "NB006-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.6, loaiChe: "Shan Tuyết" }, { maVuon: "NB006-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NB007: [{ maVuon: "NB007-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }, { maVuon: "NB007-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
  NB008: [{ maVuon: "NB008-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.7, loaiChe: "Shan Tuyết" }],
  NB009: [{ maVuon: "NB009-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }, { maVuon: "NB009-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.3, loaiChe: "Shan Tuyết" }],
  NB010: [{ maVuon: "NB010-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 1.0, loaiChe: "Shan Tuyết" }, { maVuon: "NB010-V2", tenVuon: "Vườn Nà Bay 2", dienTich: 0.6, loaiChe: "Shan Tuyết" }, { maVuon: "NB010-V3", tenVuon: "Vườn Nà Bay 3", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NB011: [{ maVuon: "NB011-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.4, loaiChe: "Shan Tuyết" }],
  NB012: [{ maVuon: "NB012-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
  NB013: [{ maVuon: "NB013-V1", tenVuon: "Vườn Nà Bay 1", dienTich: 0.7, loaiChe: "Shan Tuyết" }],
  BC001: [{ maVuon: "BC001-V1", tenVuon: "Vườn Bản Chang 1", dienTich: 0.6, loaiChe: "Shan Tuyết" }],
  BC002: [{ maVuon: "BC002-V1", tenVuon: "Vườn Bản Chang 1", dienTich: 1.2, loaiChe: "Shan Tuyết" }, { maVuon: "BC002-V2", tenVuon: "Vườn Bản Chang 2", dienTich: 0.8, loaiChe: "Shan Tuyết" }],
  BC003: [{ maVuon: "BC003-V1", tenVuon: "Vườn Bản Chang 1", dienTich: 0.5, loaiChe: "Shan Tuyết" }],
};

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

type SortKey = string;
type SortDir = "asc" | "desc";

export default function PurchasePage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("stt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [quyCachFilter, setQuyCachFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [formStep, setFormStep] = useState<"chon-ho" | "nhap-chi-tiet">("chon-ho");
  const [hoSearch, setHoSearch] = useState("");
  const [selectedHo, setSelectedHo] = useState<typeof dsHoLKData[number] | null>(null);
  const [selectedVuon, setSelectedVuon] = useState("");
  const [formDate, setFormDate] = useState(new Date().toLocaleDateString("vi-VN").replace(/\//g, "/"));
  const [formQuyCach, setFormQuyCach] = useState("1 tôm 2 lá");
  const [formChatLuong, setFormChatLuong] = useState(85);
  const [formKhoiLuong, setFormKhoiLuong] = useState("");
  const [formGhiChu, setFormGhiChu] = useState("");

  const donGiaTinhToan = useMemo(() => {
    if (formQuyCach === "1 tôm") return 520000;
    if (formChatLuong < 80) return 27000;
    if (formChatLuong < 90) return 28000;
    if (formChatLuong < 100) return 29000;
    return 30000;
  }, [formQuyCach, formChatLuong]);

  const thanhTienTinhToan = useMemo(() => {
    const kg = parseFloat(formKhoiLuong) || 0;
    return kg * donGiaTinhToan;
  }, [formKhoiLuong, donGiaTinhToan]);

  const filteredHoSearch = useMemo(() => {
    if (!hoSearch) return dsHoLKData;
    const q = hoSearch.toLowerCase();
    return dsHoLKData.filter(
      (h) => h.hoDan.toLowerCase().includes(q) || h.maHo.toLowerCase().includes(q) || h.diaChi.toLowerCase().includes(q)
    );
  }, [hoSearch]);

  const vuonsOfSelected = selectedHo ? (vuonTrongData[selectedHo.maHo] ?? []) : [];

  const resetForm = () => {
    setFormStep("chon-ho");
    setHoSearch("");
    setSelectedHo(null);
    setSelectedVuon("");
    setFormDate(new Date().toLocaleDateString("vi-VN").replace(/\//g, "/"));
    setFormQuyCach("1 tôm 2 lá");
    setFormChatLuong(85);
    setFormKhoiLuong("");
    setFormGhiChu("");
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const rows = thuMuaData.map((r) => ({
      STT: r.stt,
      "Mã hộ": r.maHo,
      "Tên hộ": r.tenHo,
      "Địa chỉ": r.diaChi,
      "Thời gian": r.thoiGian,
      "Quy cách": r.quyCach,
      "Khối lượng (kg)": r.khoiLuong,
      "Đơn giá (đ)": r.donGia,
      "Thành tiền (đ)": r.thanhTien,
      "Mã mẻ": r.maME,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [8, 10, 20, 12, 14, 14, 14, 14, 16, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Thu mua");
    const date = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
    XLSX.writeFile(wb, `HTX_HongHa_ThuMua_${date}.xlsx`);
  };

  const totalKhoiLuong = thuMuaData.reduce((s, r) => s + r.khoiLuong, 0);
  const totalThanhTien = thuMuaData.reduce((s, r) => s + r.thanhTien, 0);
  const uniqueHo = new Set(thuMuaData.map((r) => r.maHo)).size;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const uniqueQuyCach = [...new Set(thuMuaData.map((r) => r.quyCach))];
  const uniqueDates = [...new Set(thuMuaData.map((r) => r.thoiGian))];

  const parseDateVN = (s: string) => { const [d, m, y] = s.split("/"); return `${y}-${m}-${d}`; };

  const filteredThuMua = useMemo(() => {
    let data = thuMuaData;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.maHo.toLowerCase().includes(q) ||
          r.tenHo.toLowerCase().includes(q) ||
          r.diaChi.toLowerCase().includes(q) ||
          r.maME.toLowerCase().includes(q)
      );
    }
    if (quyCachFilter) data = data.filter((r) => r.quyCach === quyCachFilter);
    if (dateFrom) data = data.filter((r) => parseDateVN(r.thoiGian) >= dateFrom);
    if (dateTo) data = data.filter((r) => parseDateVN(r.thoiGian) <= dateTo);
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [search, sortKey, sortDir, dateFilter]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <button onClick={() => setLocation("/module/erp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Thu mua</h1>
            <p className="text-sm text-muted-foreground mt-0.5">HTX Hồng Hà · Chè Shan Tuyết Bằng Phúc</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <Printer className="w-3.5 h-3.5" /> In
            </button>
            <button
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Thêm phiếu
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Leaf,      label: "Tổng khối lượng", value: `${totalKhoiLuong.toFixed(2)} kg`, sub: "thu mua",              color: "text-emerald-600 bg-emerald-50" },
          { icon: TrendingUp, label: "Tổng thành tiền", value: formatCurrency(totalThanhTien),     sub: "chi trả",             color: "text-blue-600 bg-blue-50" },
          { icon: Users,     label: "Hộ dân liên kết",  value: `${uniqueHo} hộ`,                   sub: `/ ${dsHoLKData.length} hộ tổng`, color: "text-violet-600 bg-violet-50" },
          { icon: Calendar,  label: "Ngày thu mua",     value: `${uniqueDates.length} ngày`,       sub: "trong kỳ",            color: "text-orange-600 bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-base font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã hộ, tên hộ, địa chỉ..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={quyCachFilter}
            onChange={(e) => setQuyCachFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Tất cả</option>
            {uniqueQuyCach.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <span className="text-muted-foreground text-sm">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
          <button
            onClick={() => { setSearch(""); setQuyCachFilter(""); setDateFrom(""); setDateTo(""); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>

        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: "stt",        label: "STT" },
                  { key: "maHo",       label: "Mã hộ" },
                  { key: "tenHo",      label: "Tên hộ" },
                  { key: "diaChi",     label: "Địa chỉ" },
                  { key: "thoiGian",   label: "Thời gian" },
                  { key: "quyCach",    label: "Quy cách" },
                  { key: "khoiLuong",  label: "KL (kg)" },
                  { key: "donGia",     label: "Đơn giá" },
                  { key: "thanhTien",  label: "Thành tiền" },
                  { key: "maME",       label: "Mã mẻ" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left py-2.5 px-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredThuMua.map((row, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.stt}</td>
                  <td className="py-2.5 px-2 font-mono text-xs font-semibold text-primary">{row.maHo}</td>
                  <td className="py-2.5 px-2 font-medium">{row.tenHo}</td>
                  <td className="py-2.5 px-2 text-muted-foreground">{row.diaChi}</td>
                  <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{row.thoiGian}</td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${row.quyCach === "1 tôm" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {row.quyCach}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-semibold">{row.khoiLuong.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right text-muted-foreground whitespace-nowrap">{row.donGia.toLocaleString("vi-VN")} đ</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-foreground whitespace-nowrap">{formatCurrency(row.thanhTien)}</td>
                  <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground">{row.maME}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={6} className="py-2.5 px-2 font-bold text-sm">Tổng cộng</td>
                <td className="py-2.5 px-2 text-right font-bold">{filteredThuMua.reduce((s, r) => s + r.khoiLuong, 0).toFixed(2)}</td>
                <td className="py-2.5 px-2" />
                <td className="py-2.5 px-2 text-right font-bold text-primary whitespace-nowrap">
                  {formatCurrency(filteredThuMua.reduce((s, r) => s + r.thanhTien, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Hiển thị {filteredThuMua.length} / {thuMuaData.length} bản ghi</p>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg mx-0 sm:mx-4 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {formStep === "nhap-chi-tiet" && (
                  <button onClick={() => setFormStep("chon-ho")} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 mr-1">
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">
                  {formStep === "chon-ho" ? "Chọn nông hộ" : "Nhập chi tiết thu mua"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${formStep === "chon-ho" ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}>1</div>
                  <div className="w-4 h-px bg-border" />
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${formStep === "nhap-chi-tiet" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>2</div>
                </div>
                <button onClick={() => setShowAddForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Step 1: Chọn nông hộ */}
            {formStep === "chon-ho" && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="px-5 pt-4 pb-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={hoSearch}
                      onChange={(e) => setHoSearch(e.target.value)}
                      placeholder="Tìm tên, mã hộ, địa chỉ..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{filteredHoSearch.length} nông hộ liên kết</p>
                </div>
                <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-1.5">
                  {filteredHoSearch.map((ho) => (
                    <button
                      key={ho.maHo}
                      onClick={() => {
                        setSelectedHo(ho);
                        setSelectedVuon(vuonTrongData[ho.maHo]?.[0]?.maVuon ?? "");
                        setFormStep("nhap-chi-tiet");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                        {ho.hoDan.split(" ").slice(-1)[0]?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{ho.hoDan}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-muted-foreground">{ho.maHo}</span>
                          <span className="text-muted-foreground text-xs">·</span>
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{ho.diaChi}</span>
                          {ho.sdt && (
                            <>
                              <span className="text-muted-foreground text-xs">·</span>
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{ho.sdt}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">{ho.dienTich > 0 ? `${ho.dienTich} ha` : ""}</div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Nhập chi tiết */}
            {formStep === "nhap-chi-tiet" && selectedHo && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="mx-5 mt-4 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {selectedHo.hoDan.split(" ").slice(-1)[0]?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{selectedHo.hoDan}</p>
                    <p className="text-xs text-muted-foreground">{selectedHo.maHo} · {selectedHo.diaChi}</p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Vườn trồng <span className="text-red-500">*</span></label>
                    {vuonsOfSelected.length > 0 ? (
                      <div className="space-y-1.5">
                        {vuonsOfSelected.map((v) => (
                          <button
                            key={v.maVuon}
                            onClick={() => setSelectedVuon(v.maVuon)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${selectedVuon === v.maVuon ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"}`}
                          >
                            {selectedVuon === v.maVuon ? <CheckSquare className="w-4 h-4 text-primary shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                            <span className="flex-1 text-sm font-medium">{v.tenVuon}</span>
                            <span className="text-xs text-muted-foreground">{v.dienTich} ha · {v.loaiChe}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Không có vườn trồng đã đăng ký</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Ngày thu mua <span className="text-red-500">*</span></label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Quy cách <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {["1 tôm", "1 tôm 1 lá", "1 tôm 2 lá", "2 lá"].map((qc) => (
                        <button key={qc} onClick={() => setFormQuyCach(qc)} className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${formQuyCach === qc ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40 text-foreground"}`}>
                          {qc}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formQuyCach !== "1 tôm" ? (
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Chất lượng: <span className="text-primary font-bold">{formChatLuong}%</span>
                        <span className="ml-2 text-muted-foreground font-normal">→ Đơn giá: <span className="text-primary font-semibold">{donGiaTinhToan.toLocaleString("vi-VN")} đ/kg</span></span>
                      </label>
                      <input type="range" min={70} max={100} value={formChatLuong} onChange={(e) => setFormChatLuong(Number(e.target.value))} className="w-full accent-primary" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>70% · 27k</span><span>80% · 28k</span><span>90% · 29k</span><span>100% · 30k</span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      Quy cách "1 tôm" có đơn giá cố định: <strong>520.000 đ/kg</strong>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Khối lượng (kg) <span className="text-red-500">*</span></label>
                    <input type="number" step="0.1" min="0" value={formKhoiLuong} onChange={(e) => setFormKhoiLuong(e.target.value)} placeholder="0.0" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  {thanhTienTinhToan > 0 && (
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-700">Thành tiền dự tính</span>
                        <span className="text-lg font-bold text-emerald-700">{formatCurrency(thanhTienTinhToan)}</span>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">{parseFloat(formKhoiLuong).toFixed(2)} kg × {donGiaTinhToan.toLocaleString("vi-VN")} đ/kg</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Ghi chú</label>
                    <textarea value={formGhiChu} onChange={(e) => setFormGhiChu(e.target.value)} placeholder="Ghi chú tùy chọn..." rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </div>
                <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
                  <button onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors">Hủy</button>
                  <button
                    disabled={!selectedVuon || !formKhoiLuong || parseFloat(formKhoiLuong) <= 0}
                    onClick={() => { setShowAddForm(false); resetForm(); }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tạo phiếu thu mua
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
