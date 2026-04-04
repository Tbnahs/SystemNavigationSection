import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  Users,
  Package,
  Box,
  Star,
  Leaf,
  TrendingUp,
  Calendar,
  Filter,
  X,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Plus,
  ChevronRight,
  MapPin,
  Phone,
} from "lucide-react";

const TABS = [
  { id: "thu-mua", label: "1. Thu mua" },
  { id: "san-xuat", label: "2. Sản xuất" },
  { id: "dong-goi", label: "3. Đóng gói" },
  { id: "ds-ho-lk", label: "DS hộ LK" },
  { id: "quy-cach", label: "Quy cách" },
];

const thuMuaData = [
  { stt: 1, maHo: "NH004", tenHo: "Triệu Văn Thạo", diaChi: "Nà Hồng", thoiGian: "30/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 27000, thanhTien: 364500, maME: "NH0043003" },
  { stt: 2, maHo: "NB002", tenHo: "Nông Văn Nghiễm", diaChi: "Nà Bay", thoiGian: "30/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 12.00, donGia: 27000, thanhTien: 324000, maME: "NB0023003" },
  { stt: 3, maHo: "NH008", tenHo: "Đồng Thị Khuyết", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 8.50, donGia: 28500, thanhTien: 242250, maME: "NH0083103" },
  { stt: 4, maHo: "NH001", tenHo: "Hoàng Thị Luyến", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 10.00, donGia: 28000, thanhTien: 280000, maME: "NH0013103" },
  { stt: 5, maHo: "NH002", tenHo: "Hoàng Thị Đào", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.00, donGia: 28000, thanhTien: 252000, maME: "NH0023103" },
  { stt: 6, maHo: "NH009", tenHo: "Hạ Văn Thắng", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 3.00, donGia: 27000, thanhTien: 81000, maME: "NH0093103" },
  { stt: 7, maHo: "NH004", tenHo: "Triệu Văn Thạo", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 25.50, donGia: 28000, thanhTien: 714000, maME: "NH0043103" },
  { stt: 8, maHo: "NH006", tenHo: "Triệu Văn Hòa", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 15.00, donGia: 28000, thanhTien: 420000, maME: "NH0063103" },
  { stt: 9, maHo: "NH007", tenHo: "Hoàng Văn Tuấn", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 22.00, donGia: 27000, thanhTien: 594000, maME: "NH0073103" },
  { stt: 10, maHo: "NB009", tenHo: "Triệu Văn Hánh", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 28000, thanhTien: 378000, maME: "NB0093103" },
  { stt: 11, maHo: "NB010", tenHo: "Mạnh Văn Hồ", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 5.00, donGia: 29000, thanhTien: 145000, maME: "NB0103103" },
  { stt: 12, maHo: "NH010", tenHo: "Dương Thị Tươi", diaChi: "Nà Hồng", thoiGian: "31/03/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.30, donGia: 27000, thanhTien: 251100, maME: "NH0103103" },
  { stt: 13, maHo: "NB010", tenHo: "Mạnh Văn Hồ", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 2.50, donGia: 520000, thanhTien: 1300000, maME: "NB0103103" },
  { stt: 14, maHo: "NB001", tenHo: "Nông Thị Dung", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 1.80, donGia: 520000, thanhTien: 936000, maME: "NB0013103" },
  { stt: 15, maHo: "NB002", tenHo: "Nông Văn Nghiễm", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 2.80, donGia: 520000, thanhTien: 1456000, maME: "NB0023103" },
  { stt: 16, maHo: "NB007", tenHo: "Nguyễn Văn Hân", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 2.37, donGia: 520000, thanhTien: 1232400, maME: "NB0073103" },
  { stt: 17, maHo: "NB009", tenHo: "Triệu Văn Hánh", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 0.40, donGia: 520000, thanhTien: 208000, maME: "NB0093103" },
  { stt: 18, maHo: "NB004", tenHo: "Triệu Văn Mỹ", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 1.05, donGia: 520000, thanhTien: 546000, maME: "NB0043103" },
  { stt: 19, maHo: "NB006", tenHo: "Hoàng Văn Thống", diaChi: "Nà Bay", thoiGian: "31/03/2026", quyCach: "1 tôm", khoiLuong: 4.90, donGia: 520000, thanhTien: 2548000, maME: "NB0063103" },
  { stt: 20, maHo: "NH001", tenHo: "Hoàng Thị Luyến", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 3.20, donGia: 29000, thanhTien: 92800, maME: "NH001104" },
  { stt: 21, maHo: "NH004", tenHo: "Triệu Văn Thạo", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 21.50, donGia: 29000, thanhTien: 623500, maME: "NH004104" },
  { stt: 22, maHo: "NB011", tenHo: "Hoàng Thị Điềm", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 5.00, donGia: 29000, thanhTien: 145000, maME: "NB011104" },
  { stt: 23, maHo: "NB012", tenHo: "Lâm Thị Tới", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.50, donGia: 29000, thanhTien: 333500, maME: "NB012104" },
  { stt: 24, maHo: "NB010", tenHo: "Mạnh Văn Hồ", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 15.00, donGia: 29000, thanhTien: 435000, maME: "NB010104" },
  { stt: 25, maHo: "NB013", tenHo: "Triệu Văn Cường", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 35.70, donGia: 29000, thanhTien: 1035300, maME: "NB013104" },
  { stt: 26, maHo: "NB002", tenHo: "Nông Văn Nghiễm", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 19.30, donGia: 29000, thanhTien: 559700, maME: "NB002104" },
  { stt: 27, maHo: "NB004", tenHo: "Triệu Văn Mỹ", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.40, donGia: 29000, thanhTien: 388600, maME: "NB004104" },
  { stt: 28, maHo: "NB001", tenHo: "Nông Thị Dung", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 31.50, donGia: 29000, thanhTien: 913500, maME: "NB001104" },
  { stt: 29, maHo: "NB006", tenHo: "Hoàng Văn Thống", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 23.80, donGia: 29000, thanhTien: 690200, maME: "NB006104" },
  { stt: 30, maHo: "NH007", tenHo: "Hoàng Văn Tuấn", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.50, donGia: 28000, thanhTien: 322000, maME: "NH007104" },
  { stt: 31, maHo: "NH003", tenHo: "Phạm Thị Huyền", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 4.60, donGia: 28000, thanhTien: 128800, maME: "NH003104" },
  { stt: 32, maHo: "NH010", tenHo: "Dương Thị Tươi", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 6.30, donGia: 28000, thanhTien: 176400, maME: "NH010104" },
  { stt: 33, maHo: "BC003", tenHo: "Hoàng Văn Mỹ", diaChi: "Bản Chang", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 11.70, donGia: 28000, thanhTien: 327600, maME: "BC003104" },
  { stt: 34, maHo: "NH006", tenHo: "Triệu Văn Hòa", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 16.50, donGia: 28000, thanhTien: 462000, maME: "NH006104" },
  { stt: 35, maHo: "NH008", tenHo: "Đồng Thị Khuyết", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 9.00, donGia: 28000, thanhTien: 252000, maME: "NH008104" },
  { stt: 36, maHo: "NB009", tenHo: "Triệu Văn Hánh", diaChi: "Nà Bay", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 34.50, donGia: 27000, thanhTien: 931500, maME: "NB009104" },
  { stt: 37, maHo: "NH009", tenHo: "Hạ Văn Thắng", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 18.00, donGia: 29000, thanhTien: 522000, maME: "NH009104" },
  { stt: 38, maHo: "NH002", tenHo: "Hoàng Thị Đào", diaChi: "Nà Hồng", thoiGian: "01/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 13.50, donGia: 29000, thanhTien: 391500, maME: "NH002104" },
  { stt: 39, maHo: "NB009", tenHo: "Triệu Văn Hánh", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 15.00, donGia: 28000, thanhTien: 420000, maME: "NB009304" },
  { stt: 40, maHo: "NB002", tenHo: "Nông Văn Nghiễm", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 44.00, donGia: 29000, thanhTien: 1276000, maME: "NB002304" },
  { stt: 41, maHo: "NB001", tenHo: "Nông Thị Dung", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 32.00, donGia: 29000, thanhTien: 928000, maME: "NB001304" },
  { stt: 42, maHo: "NB006", tenHo: "Hoàng Văn Thống", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 49.20, donGia: 29000, thanhTien: 1426800, maME: "NB006304" },
  { stt: 43, maHo: "NB013", tenHo: "Triệu Văn Cường", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 50.00, donGia: 29000, thanhTien: 1450000, maME: "NB013304" },
  { stt: 44, maHo: "NH006", tenHo: "Triệu Văn Hòa", diaChi: "Nà Hồng", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 10.80, donGia: 28000, thanhTien: 302400, maME: "NH006304" },
  { stt: 45, maHo: "NH002", tenHo: "Hoàng Thị Đào", diaChi: "Nà Hồng", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 6.00, donGia: 28000, thanhTien: 168000, maME: "NH002304" },
  { stt: 46, maHo: "NH003", tenHo: "Phạm Thị Huyền", diaChi: "Nà Hồng", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 6.00, donGia: 28000, thanhTien: 168000, maME: "NH003304" },
  { stt: 47, maHo: "NH001", tenHo: "Hoàng Thị Luyến", diaChi: "Nà Hồng", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 3.00, donGia: 28000, thanhTien: 84000, maME: "NH001304" },
  { stt: 48, maHo: "NH004", tenHo: "Triệu Văn Thạo", diaChi: "Nà Hồng", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 23.50, donGia: 29000, thanhTien: 681500, maME: "NH004304" },
  { stt: 49, maHo: "NH009", tenHo: "Hạ Văn Thắng", diaChi: "Nà Hồng", thoiGian: "03/04/2026", quyCach: "1 tôm 2 lá", khoiLuong: 6.00, donGia: 27000, thanhTien: 162000, maME: "NH009304" },
  { stt: 50, maHo: "NB010", tenHo: "Mạnh Văn Hồ", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm", khoiLuong: 1.04, donGia: 520000, thanhTien: 540800, maME: "NB010304" },
  { stt: 51, maHo: "NB009", tenHo: "Triệu Văn Hánh", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm", khoiLuong: 2.40, donGia: 520000, thanhTien: 1248000, maME: "NB009304" },
  { stt: 52, maHo: "NB002", tenHo: "Nông Văn Nghiễm", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm", khoiLuong: 3.30, donGia: 520000, thanhTien: 1716000, maME: "NB002304" },
  { stt: 53, maHo: "NB006", tenHo: "Hoàng Văn Thống", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm", khoiLuong: 2.60, donGia: 520000, thanhTien: 1352000, maME: "NB006304" },
  { stt: 54, maHo: "NB001", tenHo: "Nông Thị Dung", diaChi: "Nà Bay", thoiGian: "03/04/2026", quyCach: "1 tôm", khoiLuong: 0.75, donGia: 520000, thanhTien: 390000, maME: "NB001304" },
];

const sanXuatData = [
  { stt: 1, maME: "NH0043003", nguoiThucHien: "HTX Hồng Hà", thoiGian: "30/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L013003" },
  { stt: 1, maME: "NB0023003", nguoiThucHien: "HTX Hồng Hà", thoiGian: "30/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L013003" },
  { stt: 2, maME: "NH0013103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L023103" },
  { stt: 2, maME: "NH0023103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L023103" },
  { stt: 2, maME: "NH0083103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L023103" },
  { stt: 3, maME: "NH0093103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L033103" },
  { stt: 3, maME: "NH0043103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L033103" },
  { stt: 4, maME: "NH0063103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L043103" },
  { stt: 4, maME: "NH0083103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L043103" },
  { stt: 5, maME: "NH0073103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L053103" },
  { stt: 6, maME: "NB0093103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L063103" },
  { stt: 6, maME: "NB0103103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L063103" },
  { stt: 7, maME: "NB0103103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 7, maME: "NB0013103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 7, maME: "NB0023103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 7, maME: "NB0073103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maLoSX: "L073103" },
  { stt: 8, maME: "NH0103103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maLoSX: "L083103" },
  { stt: 9, maME: "NH001104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L09104" },
  { stt: 9, maME: "NH004104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L09104" },
  { stt: 10, maME: "NB011104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L010104" },
  { stt: 10, maME: "NB012104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L010104" },
  { stt: 10, maME: "NB010104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L010104" },
  { stt: 11, maME: "NB013104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L011104" },
  { stt: 11, maME: "NB002104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L011104" },
  { stt: 12, maME: "NB004104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L012104" },
  { stt: 12, maME: "NB001104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L012104" },
  { stt: 13, maME: "NB006104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L013104" },
  { stt: 14, maME: "NH007104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L014104" },
  { stt: 14, maME: "NH003104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L014104" },
  { stt: 14, maME: "NH010104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L014104" },
  { stt: 15, maME: "BC003104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L015104" },
  { stt: 16, maME: "NH006104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L016104" },
  { stt: 16, maME: "NH008104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L016104" },
  { stt: 17, maME: "NB009104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L017104" },
  { stt: 18, maME: "NH009104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L018104" },
  { stt: 18, maME: "NH002104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maLoSX: "L018104" },
];

const dongGoiData = [
  { stt: 1, maLoSX: "L013003", nguoiThucHien: "HTX Hồng Hà", thoiGian: "30/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S013003" },
  { stt: 2, maLoSX: "L023103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S023103" },
  { stt: 3, maLoSX: "L033103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S033103" },
  { stt: 4, maLoSX: "L043103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S043103" },
  { stt: 5, maLoSX: "L053103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S053103" },
  { stt: 6, maLoSX: "L063103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S063103" },
  { stt: 7, maLoSX: "L073103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Bạch trà", maDongGoi: "S073103" },
  { stt: 8, maLoSX: "L083103", nguoiThucHien: "HTX Hồng Hà", thoiGian: "31/03/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Hồng trà", maDongGoi: "S083103" },
  { stt: 9, maLoSX: "L09104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S09104" },
  { stt: 10, maLoSX: "L010104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S010104" },
  { stt: 11, maLoSX: "L011104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S011104" },
  { stt: 12, maLoSX: "L012104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S012104" },
  { stt: 13, maLoSX: "L013104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S013104" },
  { stt: 14, maLoSX: "L014104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S014104" },
  { stt: 15, maLoSX: "L015104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S015104" },
  { stt: 16, maLoSX: "L016104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S016104" },
  { stt: 17, maLoSX: "L017104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S017104" },
  { stt: 18, maLoSX: "L018104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S018104" },
  { stt: 19, maLoSX: "L019104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S019104" },
  { stt: 20, maLoSX: "L020104", nguoiThucHien: "HTX Hồng Hà", thoiGian: "01/04/2026", diaDiem: "HTX Hồng Hà", thanhPham: "Chè xanh", maDongGoi: "S020104" },
];

const dsHoLKData = [
  { stt: 1, hoDan: "Hoàng Thị Luyến", maHo: "NH001", diaChi: "Nà Hồng", sdt: "354125321", dienTich: 0.5 },
  { stt: 2, hoDan: "Hoàng Thị Đào", maHo: "NH002", diaChi: "Nà Hồng", sdt: "374704822", dienTich: 0.4 },
  { stt: 3, hoDan: "Phạm Thị Huyền", maHo: "NH003", diaChi: "Nà Hồng", sdt: "379251872", dienTich: 1.0 },
  { stt: 4, hoDan: "Triệu Văn Thạo", maHo: "NH004", diaChi: "Nà Hồng", sdt: "354871949", dienTich: 0.8 },
  { stt: 5, hoDan: "Hoàng Văn Thái", maHo: "NH005", diaChi: "Nà Hồng", sdt: "972061820", dienTich: 0.5 },
  { stt: 6, hoDan: "Triệu Văn Hòa", maHo: "NH006", diaChi: "Nà Hồng", sdt: "378360830", dienTich: 0.8 },
  { stt: 7, hoDan: "Hoàng Văn Tuấn", maHo: "NH007", diaChi: "Nà Hồng", sdt: "387851867", dienTich: 1.0 },
  { stt: 8, hoDan: "Đồng Thị Khuyết", maHo: "NH008", diaChi: "Nà Hồng", sdt: "962041090", dienTich: 0.7 },
  { stt: 9, hoDan: "Hạ Văn Thắng", maHo: "NH009", diaChi: "Nà Hồng", sdt: "337318858", dienTich: 1.5 },
  { stt: 10, hoDan: "Dương Thị Tươi", maHo: "NH010", diaChi: "Nà Hồng", sdt: "", dienTich: 0.5 },
  { stt: 11, hoDan: "Nông Thị Dung", maHo: "NB001", diaChi: "Nà Bay", sdt: "961466732", dienTich: 1.5 },
  { stt: 12, hoDan: "Nông Văn Nghiễm", maHo: "NB002", diaChi: "Nà Bay", sdt: "814665955", dienTich: 1.0 },
  { stt: 13, hoDan: "Mùng Văn Thời", maHo: "NB003", diaChi: "Nà Bay", sdt: "369254973", dienTich: 0.6 },
  { stt: 14, hoDan: "Triệu Văn Mỹ", maHo: "NB004", diaChi: "Nà Bay", sdt: "383760794", dienTich: 1.0 },
  { stt: 15, hoDan: "Nông Văn Đẳng", maHo: "NB005", diaChi: "Nà Bay", sdt: "374258744", dienTich: 1.0 },
  { stt: 16, hoDan: "Hoàng Văn Thống", maHo: "NB006", diaChi: "Nà Bay", sdt: "967186387", dienTich: 1.0 },
  { stt: 17, hoDan: "Nguyễn Văn Hân", maHo: "NB007", diaChi: "Nà Bay", sdt: "984922577", dienTich: 1.0 },
  { stt: 18, hoDan: "Nguyễn Thị Đa", maHo: "NB008", diaChi: "Nà Bay", sdt: "372122030", dienTich: 0.7 },
  { stt: 19, hoDan: "Triệu Văn Hánh", maHo: "NB009", diaChi: "Nà Bay", sdt: "345665232", dienTich: 0.8 },
  { stt: 20, hoDan: "Mạnh Văn Hồ", maHo: "NB010", diaChi: "Nà Bay", sdt: "349055299", dienTich: 2.0 },
  { stt: 21, hoDan: "Hoàng Thị Điềm", maHo: "NB011", diaChi: "Nà Bay", sdt: "375182932", dienTich: 0.4 },
  { stt: 22, hoDan: "Lâm Thị Tới", maHo: "NB012", diaChi: "Nà Bay", sdt: "353839713", dienTich: 0.0 },
  { stt: 23, hoDan: "Triệu Văn Cường", maHo: "NB013", diaChi: "Nà Bay", sdt: "", dienTich: 0.0 },
  { stt: 24, hoDan: "Hoàng Phúc Khôi", maHo: "BC001", diaChi: "Bản Chang", sdt: "333770931", dienTich: 0.6 },
  { stt: 25, hoDan: "Triệu Văn Dựng", maHo: "BC002", diaChi: "Bản Chang", sdt: "343233785", dienTich: 2.0 },
  { stt: 26, hoDan: "Hoàng Văn Mỹ", maHo: "BC003", diaChi: "Bản Chang", sdt: "", dienTich: 0.0 },
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

const quyCachData = [
  { stt: 1, quyCach: "1 tôm", donGia: "27.000 - 30.000 đ/kg", loaiChe: "Chè xanh" },
  { stt: 2, quyCach: "1 tôm 1 lá", donGia: "50.000 đ/kg", loaiChe: "Hồng trà" },
  { stt: 3, quyCach: "1 tôm 2 lá", donGia: "27.000 - 30.000 đ/kg", loaiChe: "Bạch trà" },
  { stt: 4, quyCach: "2 lá", donGia: "27.000 đ/kg", loaiChe: "" },
];

const tichLuongData = [
  { stt: 1, danhGia: "70–79%", donGia: "27.000 đ/kg" },
  { stt: 2, danhGia: "80–89%", donGia: "28.000 đ/kg" },
  { stt: 3, danhGia: "90–99%", donGia: "29.000 đ/kg" },
  { stt: 4, danhGia: "100%", donGia: "30.000 đ/kg" },
  { stt: 5, danhGia: "Cây di sản", donGia: "40.000 – 60.000 đ/kg" },
];

const productColor: Record<string, string> = {
  "Hồng trà": "bg-rose-100 text-rose-700",
  "Bạch trà": "bg-blue-100 text-blue-700",
  "Chè xanh": "bg-emerald-100 text-emerald-700",
};

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

type SortKey = string;
type SortDir = "asc" | "desc";

export default function PurchasePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("thu-mua");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("stt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dateFilter, setDateFilter] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(
    new Set(["thu-mua", "san-xuat", "dong-goi", "ds-ho-lk", "quy-cach"])
  );

  // Add purchase form state
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

  const toggleSheet = (id: string) => {
    setSelectedSheets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    if (selectedSheets.has("thu-mua")) {
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
    }

    if (selectedSheets.has("san-xuat")) {
      const rows = sanXuatData.map((r) => ({
        STT: r.stt,
        "Mã mẻ": r.maME,
        "Người thực hiện": r.nguoiThucHien,
        "Thời gian": r.thoiGian,
        "Địa điểm": r.diaDiem,
        "Thành phẩm": r.thanhPham,
        "Mã lô SX": r.maLoSX,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "San xuat");
    }

    if (selectedSheets.has("dong-goi")) {
      const rows = dongGoiData.map((r) => ({
        STT: r.stt,
        "Mã lô SX": r.maLoSX,
        "Người thực hiện": r.nguoiThucHien,
        "Thời gian": r.thoiGian,
        "Địa điểm": r.diaDiem,
        "Thành phẩm": r.thanhPham,
        "Mã đóng gói": r.maDongGoi,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Dong goi");
    }

    if (selectedSheets.has("ds-ho-lk")) {
      const rows = dsHoLKData.map((r) => ({
        STT: r.stt,
        "Họ và tên": r.hoDan,
        "Mã hộ": r.maHo,
        "Địa chỉ": r.diaChi,
        "Số điện thoại": r.sdt,
        "Diện tích (ha)": r.dienTich,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "DS ho LK");
    }

    if (selectedSheets.has("quy-cach")) {
      const rows1 = quyCachData.map((r) => ({
        STT: r.stt,
        "Quy cách": r.quyCach,
        "Đơn giá": r.donGia,
        "Loại chè": r.loaiChe,
      }));
      const ws = XLSX.utils.json_to_sheet(rows1);
      XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
      XLSX.utils.sheet_add_aoa(ws, [["STT", "Đánh giá %", "Đơn giá", "Ghi chú"]], { origin: -1 });
      tichLuongData.forEach((r) => {
        XLSX.utils.sheet_add_aoa(ws, [[r.stt, r.danhGia, r.donGia, ""]], { origin: -1 });
      });
      XLSX.utils.book_append_sheet(wb, ws, "Quy cach");
    }

    const date = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
    XLSX.writeFile(wb, `HTX_HongHa_ThuMua_${date}.xlsx`);
    setShowExportModal(false);
  };

  const totalKhoiLuong = thuMuaData.reduce((s, r) => s + r.khoiLuong, 0);
  const totalThanhTien = thuMuaData.reduce((s, r) => s + r.thanhTien, 0);
  const uniqueHo = new Set(thuMuaData.map((r) => r.maHo)).size;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

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
    if (dateFilter) {
      data = data.filter((r) => r.thoiGian === dateFilter);
    }
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [search, sortKey, sortDir, dateFilter]);

  const filteredSanXuat = useMemo(() => {
    if (!search) return sanXuatData;
    const q = search.toLowerCase();
    return sanXuatData.filter(
      (r) =>
        r.maME.toLowerCase().includes(q) ||
        r.maLoSX.toLowerCase().includes(q) ||
        r.thanhPham.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredDongGoi = useMemo(() => {
    if (!search) return dongGoiData;
    const q = search.toLowerCase();
    return dongGoiData.filter(
      (r) =>
        r.maLoSX.toLowerCase().includes(q) ||
        r.maDongGoi.toLowerCase().includes(q) ||
        r.thanhPham.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredHoLK = useMemo(() => {
    if (!search) return dsHoLKData;
    const q = search.toLowerCase();
    return dsHoLKData.filter(
      (r) =>
        r.hoDan.toLowerCase().includes(q) ||
        r.maHo.toLowerCase().includes(q) ||
        r.diaChi.toLowerCase().includes(q)
    );
  }, [search]);

  const uniqueDates = [...new Set(thuMuaData.map((r) => r.thoiGian))].sort();

  return (
    <AppLayout>
      <div className="mb-5">
        <button
          onClick={() => setLocation("/module/erp")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại ERP
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Quản lý Thu mua</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              HTX Hồng Hà · Chè Shan Tuyết Bằng Phúc
            </p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Leaf, label: "Tổng khối lượng", value: `${totalKhoiLuong.toFixed(2)} kg`, sub: "thu mua", color: "text-emerald-600 bg-emerald-50" },
          { icon: TrendingUp, label: "Tổng thành tiền", value: formatCurrency(totalThanhTien), sub: "chi trả", color: "text-blue-600 bg-blue-50" },
          { icon: Users, label: "Hộ dân liên kết", value: `${uniqueHo} hộ`, sub: `/ ${dsHoLKData.length} hộ tổng`, color: "text-violet-600 bg-violet-50" },
          { icon: Calendar, label: "Ngày thu mua", value: `${uniqueDates.length} ngày`, sub: "trong kỳ", color: "text-orange-600 bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-4.5 h-4.5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-base font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); setDateFilter(""); }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Search + Filter bar */}
          {activeTab !== "quy-cach" && (
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {activeTab === "thu-mua" && (
                <>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Tất cả ngày</option>
                      {uniqueDates.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm phiếu
                  </button>
                </>
              )}
            </div>
          )}

          {/* Thu mua tab */}
          {activeTab === "thu-mua" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { key: "stt", label: "STT" },
                      { key: "maHo", label: "Mã hộ" },
                      { key: "tenHo", label: "Tên hộ" },
                      { key: "diaChi", label: "Địa chỉ" },
                      { key: "thoiGian", label: "Thời gian" },
                      { key: "quyCach", label: "Quy cách" },
                      { key: "khoiLuong", label: "KL (kg)" },
                      { key: "donGia", label: "Đơn giá" },
                      { key: "thanhTien", label: "Thành tiền" },
                      { key: "maME", label: "Mã mẻ" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="text-left pb-2 px-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                      >
                        <span className="flex items-center gap-1">
                          {col.label} <SortIcon col={col.key} />
                        </span>
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
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.quyCach === "1 tôm" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                        }`}>
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
                    <td className="py-2.5 px-2"></td>
                    <td className="py-2.5 px-2 text-right font-bold text-primary whitespace-nowrap">
                      {formatCurrency(filteredThuMua.reduce((s, r) => s + r.thanhTien, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                Hiển thị {filteredThuMua.length} / {thuMuaData.length} bản ghi
              </p>
            </div>
          )}

          {/* Sản xuất tab */}
          {activeTab === "san-xuat" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["STT", "Mã mẻ", "Người thực hiện", "Thời gian", "Địa điểm", "Thành phẩm", "Mã lô SX"].map((h) => (
                      <th key={h} className="text-left pb-2 px-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSanXuat.map((row, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.stt}</td>
                      <td className="py-2.5 px-2 font-mono text-xs font-semibold text-primary">{row.maME}</td>
                      <td className="py-2.5 px-2">{row.nguoiThucHien}</td>
                      <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{row.thoiGian}</td>
                      <td className="py-2.5 px-2 text-muted-foreground">{row.diaDiem}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.thanhPham] ?? "bg-gray-100 text-gray-600"}`}>
                          {row.thanhPham}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground">{row.maLoSX}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                {filteredSanXuat.length} bản ghi
              </p>
            </div>
          )}

          {/* Đóng gói tab */}
          {activeTab === "dong-goi" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["STT", "Mã lô SX", "Người thực hiện", "Thời gian", "Địa điểm", "Thành phẩm", "Mã đóng gói"].map((h) => (
                      <th key={h} className="text-left pb-2 px-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDongGoi.map((row, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.stt}</td>
                      <td className="py-2.5 px-2 font-mono text-xs font-semibold text-primary">{row.maLoSX}</td>
                      <td className="py-2.5 px-2">{row.nguoiThucHien}</td>
                      <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{row.thoiGian}</td>
                      <td className="py-2.5 px-2 text-muted-foreground">{row.diaDiem}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.thanhPham] ?? "bg-gray-100 text-gray-600"}`}>
                          {row.thanhPham}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground">{row.maDongGoi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                {filteredDongGoi.length} lô đóng gói
              </p>
            </div>
          )}

          {/* DS hộ LK tab */}
          {activeTab === "ds-ho-lk" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["STT", "Họ và tên", "Mã hộ", "Địa chỉ", "Số điện thoại", "Diện tích (ha)"].map((h) => (
                      <th key={h} className="text-left pb-2 px-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHoLK.map((row, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.stt}</td>
                      <td className="py-2.5 px-2 font-medium">{row.hoDan}</td>
                      <td className="py-2.5 px-2 font-mono text-xs font-semibold text-primary">{row.maHo}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.diaChi === "Nà Hồng" ? "bg-emerald-100 text-emerald-700" :
                          row.diaChi === "Nà Bay" ? "bg-blue-100 text-blue-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {row.diaChi}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground font-mono text-xs">{row.sdt || "—"}</td>
                      <td className="py-2.5 px-2 text-right">
                        {row.dienTich > 0 ? (
                          <span className="font-semibold">{row.dienTich.toFixed(1)} ha</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td colSpan={5} className="py-2.5 px-2 font-bold text-sm">Tổng cộng ({filteredHoLK.length} hộ)</td>
                    <td className="py-2.5 px-2 text-right font-bold">
                      {filteredHoLK.reduce((s, r) => s + r.dienTich, 0).toFixed(1)} ha
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Quy cách tab */}
          {activeTab === "quy-cach" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Quy cách thu mua
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["STT", "Quy cách", "Đơn giá", "Loại chè"].map((h) => (
                          <th key={h} className="text-left pb-2 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quyCachData.map((row) => (
                        <tr key={row.stt} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 text-muted-foreground text-xs">{row.stt}</td>
                          <td className="py-2.5 px-3 font-semibold">{row.quyCach}</td>
                          <td className="py-2.5 px-3 font-mono text-sm text-primary font-semibold">{row.donGia}</td>
                          <td className="py-2.5 px-3">
                            {row.loaiChe ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productColor[row.loaiChe] ?? "bg-gray-100 text-gray-600"}`}>
                                {row.loaiChe}
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Tiêu chuẩn đánh giá chất lượng
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["STT", "Đánh giá %", "Đơn giá", "Ghi chú"].map((h) => (
                          <th key={h} className="text-left pb-2 px-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tichLuongData.map((row) => (
                        <tr key={row.stt} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 text-muted-foreground text-xs">{row.stt}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              row.danhGia === "100%" ? "bg-emerald-100 text-emerald-700" :
                              row.danhGia === "Cây di sản" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-50 text-blue-700"
                            }`}>
                              {row.danhGia}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-primary">{row.donGia}</td>
                          <td className="py-2.5 px-3 text-muted-foreground text-xs">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-foreground mb-2">Tiêu chuẩn đánh giá tỉ lệ đạt chất lượng:</p>
                  <ul className="space-y-1">
                    {["Độ non, già của búp chè", "Độ đồng đều của búp chè khi thu hái", "Độ chuẩn chỉ khi thu hái"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Box className="w-3 h-3 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Add Purchase Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg mx-0 sm:mx-4 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {formStep === "nhap-chi-tiet" && (
                  <button
                    onClick={() => setFormStep("chon-ho")}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 mr-1"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">
                  {formStep === "chon-ho" ? "Chọn nông hộ" : "Nhập chi tiết thu mua"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Steps indicator */}
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
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {ho.dienTich > 0 ? `${ho.dienTich} ha` : ""}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Nhập chi tiết */}
            {formStep === "nhap-chi-tiet" && selectedHo && (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Selected farmer banner */}
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
                  {/* Vườn trồng */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Vườn trồng <span className="text-red-500">*</span>
                    </label>
                    {vuonsOfSelected.length > 0 ? (
                      <div className="space-y-1.5">
                        {vuonsOfSelected.map((v) => (
                          <button
                            key={v.maVuon}
                            onClick={() => setSelectedVuon(v.maVuon)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                              selectedVuon === v.maVuon ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"
                            }`}
                          >
                            {selectedVuon === v.maVuon
                              ? <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                              : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                            <span className="flex-1 text-sm font-medium">{v.tenVuon}</span>
                            <span className="text-xs text-muted-foreground">{v.dienTich} ha · {v.loaiChe}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Không có vườn trồng đã đăng ký</p>
                    )}
                  </div>

                  {/* Ngày thu mua */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Ngày thu mua <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* Quy cách */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Quy cách <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["1 tôm", "1 tôm 1 lá", "1 tôm 2 lá", "2 lá"].map((qc) => (
                        <button
                          key={qc}
                          onClick={() => setFormQuyCach(qc)}
                          className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            formQuyCach === qc ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          {qc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chất lượng */}
                  {formQuyCach !== "1 tôm" && (
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Chất lượng: <span className="text-primary font-bold">{formChatLuong}%</span>
                        <span className="ml-2 text-muted-foreground font-normal">
                          → Đơn giá: <span className="text-primary font-semibold">{donGiaTinhToan.toLocaleString("vi-VN")} đ/kg</span>
                        </span>
                      </label>
                      <input
                        type="range"
                        min={70}
                        max={100}
                        value={formChatLuong}
                        onChange={(e) => setFormChatLuong(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>70% · 27k</span>
                        <span>80% · 28k</span>
                        <span>90% · 29k</span>
                        <span>100% · 30k</span>
                      </div>
                    </div>
                  )}
                  {formQuyCach === "1 tôm" && (
                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      Quy cách "1 tôm" có đơn giá cố định: <strong>520.000 đ/kg</strong>
                    </div>
                  )}

                  {/* Khối lượng */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Khối lượng (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formKhoiLuong}
                      onChange={(e) => setFormKhoiLuong(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* Tóm tắt thành tiền */}
                  {thanhTienTinhToan > 0 && (
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-700">Thành tiền dự tính</span>
                        <span className="text-lg font-bold text-emerald-700">{formatCurrency(thanhTienTinhToan)}</span>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">
                        {parseFloat(formKhoiLuong).toFixed(2)} kg × {donGiaTinhToan.toLocaleString("vi-VN")} đ/kg
                      </p>
                    </div>
                  )}

                  {/* Ghi chú */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Ghi chú</label>
                    <textarea
                      value={formGhiChu}
                      onChange={(e) => setFormGhiChu(e.target.value)}
                      placeholder="Ghi chú tùy chọn..."
                      rows={2}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2 shrink-0">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={!selectedVuon || !formKhoiLuong || parseFloat(formKhoiLuong) <= 0}
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo phiếu thu mua
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-sm text-foreground">Xuất file Excel</span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-4">
                Chọn các sheet muốn xuất vào file Excel. Mỗi sheet sẽ là một trang riêng.
              </p>

              <div className="space-y-2">
                {[
                  { id: "thu-mua", label: "Thu mua", count: `${thuMuaData.length} bản ghi` },
                  { id: "san-xuat", label: "Sản xuất", count: `${sanXuatData.length} bản ghi` },
                  { id: "dong-goi", label: "Đóng gói", count: `${dongGoiData.length} lô` },
                  { id: "ds-ho-lk", label: "DS hộ LK", count: `${dsHoLKData.length} hộ` },
                  { id: "quy-cach", label: "Quy cách", count: "bảng giá" },
                ].map((sheet) => {
                  const checked = selectedSheets.has(sheet.id);
                  return (
                    <button
                      key={sheet.id}
                      onClick={() => toggleSheet(sheet.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                        checked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-sm font-medium flex-1 ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                        {sheet.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{sheet.count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    const all = new Set(["thu-mua", "san-xuat", "dong-goi", "ds-ho-lk", "quy-cach"]);
                    setSelectedSheets(selectedSheets.size === 5 ? new Set() : all);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedSheets.size === 5 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedSheets.size} sheet được chọn
                </span>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleExport}
                disabled={selectedSheets.size === 0}
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
