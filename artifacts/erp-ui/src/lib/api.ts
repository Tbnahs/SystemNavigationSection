// ─── Types ────────────────────────────────────────────────────────────────────

export type Enterprise = {
  id: number;
  mst: string;
  ten: string;
  tenHienThi: string;
  tenDangNhap: string;
  daiDien: string;
  sdt: string;
  email: string;
  diaChi: string;
  tinh: string;
  xa: string;
  modules: ("ERP" | "TXNG" | "VT")[];
  status: "active" | "pending" | "locked";
  logoColor: string;
  logoUrl: string | null;
  gcp: string;
  gln: string;
  website: string;
  videoUrl: string;
  chungChiUrls: string[];
  cauChuyen: string;
  createdAt: string;
  updatedAt: string;
};

export type Employee = {
  id: number;
  enterpriseId: number | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "invited" | "locked";
  avatarColor: string;
  avatarUrl: string | null;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  enterpriseName?: string | null;
};

export type EnterpriseStats = { total: number; active: number; pending: number; locked: number };
export type EmployeeStats = { total: number; active: number; invited: number; locked: number };

export type Unit = {
  id: number;
  enterpriseId: number | null;
  name: string;
  abbreviation: string;
  loaiDonVi: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Facility = {
  id: number;
  enterpriseId: number | null;
  name: string;
  code: string;
  type: "ho_lien_ket" | "co_so_thue_ngoai" | "co_so_noi_bo";
  phone: string;
  address: string;
  tinh: string;
  xa: string;
  gln: string;
  status: "active" | "inactive";
  notes: string;
  giong_che_ids: number[];
  createdAt: string;
  updatedAt: string;
  enterpriseName?: string | null;
};

export type Product = {
  id: number;
  enterpriseId: number | null;
  name: string;
  code: string;
  gtin: string;
  type: "ban_thanh_pham" | "thanh_pham_cuoi";
  unitId: number | null;
  price: string;
  imageUrl: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  unitName?: string | null;
  enterpriseName?: string | null;
  khoiLuong?: string;
  donViKhoiLuong?: string;
  chieuDai?: string;
  chieuRong?: string;
  chieuCao?: string;
  donViKichThuoc?: string;
  donViBan?: string;
  soLuongDonViCon?: string;
  donViConId?: number | null;
  thuongHieu?: string;
  xuatXu?: string;
  anhChungChi?: string;
  dacDiem?: string;
  giongCheId?: number | null;
};

export type Grade = {
  id: number;
  name: string;
  price: string;
  prices: string;
  loaiChe: string;
  ghiChu: string;
  colorKey: string;
  createdAt: string;
  updatedAt: string;
};

export type QualityLevel = {
  id: number;
  gradeId: number | null;
  danhGia: string;
  donGia: string;
  prices: string;
  ghiChu: string;
  createdAt: string;
  updatedAt: string;
};

export type Standard = {
  id: number;
  title: string;
  description: string;
  colorKey: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  id: number;
  maPhieu: string;
  enterpriseId: number | null;
  facilityId: number | null;
  facilityName: string;
  diaChuThu: string;
  maLoMe: string;
  ngayThu: string;
  status: "draft" | "confirmed" | "cancelled";
  notes: string;
  total: string;
  lamTron: string;
  khoiLuongTong: string;
  createdAt: string;
  updatedAt: string;
  enterpriseName?: string | null;
};

export type TeaVariety = {
  id: number;
  name: string;
  code: string;
  notes: string;
  productId: number | null;
  productName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderItem = {
  id?: number;
  orderId?: number;
  productId: number | null;
  gradeId: number | null;
  productName: string;
  gradeName: string;
  qualityPercent: string;
  ghiChu: string;
  khoiLuong: string;
  donGia: string;
  thanhTien: string;
  moTa: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  enterpriseId: number | null;
  enterpriseName: string | null;
  avatarUrl: string | null;
  avatarColor: string;
  modules: string[];
};

export type AdminFacilityUser = {
  id: number; name: string; role: string;
  status: "active" | "invited" | "locked";
  avatarColor: string; email: string;
};
export type AdminFacility = {
  id: number; enterpriseId: number | null; name: string; code: string;
  type: "ho_lien_ket" | "co_so_thue_ngoai" | "co_so_noi_bo";
  status: "active" | "inactive"; address: string; phone: string;
  users: AdminFacilityUser[];
};
export type AdminEnterprise = {
  id: number; tenHienThi: string; ten: string; email: string;
  logoColor: string; logoUrl: string | null;
  status: "active" | "pending" | "locked";
  modules: ("ERP" | "TXNG" | "VT")[];
  facilities: AdminFacility[];
  adminUsers: AdminFacilityUser[];
};
export type AdminTree = {
  tree: AdminEnterprise[];
  superAdmins: AdminFacilityUser[];
};

// ─── Mock helpers ──────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const delay = <T>(val: T, ms = 280): Promise<T> =>
  new Promise((res) => setTimeout(() => res(val), ms));
let _seq = 100;
const nextId = () => ++_seq;

// ─── Mock stores (in-memory, mutable) ─────────────────────────────────────────

let enterprises: Enterprise[] = [
  {
    id: 1, mst: "0101234567", ten: "Công ty TNHH Chè Quân Chu",
    tenHienThi: "Chè Quân Chu", tenDangNhap: "chequanchu",
    daiDien: "Nguyễn Văn An",
    sdt: "0912345678", email: "admin@chequanchu.vn",
    diaChi: "Thôn Quân Chu, xã Quân Chu, huyện Đại Từ",
    tinh: "Thái Nguyên", xa: "Quân Chu",
    modules: ["ERP", "TXNG", "VT"], status: "active",
    logoColor: "#16a34a", logoUrl: null,
    gcp: "8938500100", gln: "8938500100001",
    website: "https://chequanchu.vn", videoUrl: "",
    chungChiUrls: [], cauChuyen: "Chè Quân Chu xuất phát từ vùng chè đặc sản xã Quân Chu, huyện Đại Từ, Thái Nguyên — nơi có khí hậu mát mẻ, đất đai màu mỡ phù hợp trồng chè chất lượng cao.",
    createdAt: "2024-01-10T07:00:00.000Z", updatedAt: "2024-03-01T07:00:00.000Z",
  },
  {
    id: 2, mst: "0109876543", ten: "HTX Chè La Bằng",
    tenHienThi: "La Bằng Tea", tenDangNhap: "labangtea",
    daiDien: "Trần Thị Bình",
    sdt: "0987654321", email: "contact@labang.vn",
    diaChi: "Xóm La Bằng, xã La Bằng, huyện Đại Từ",
    tinh: "Thái Nguyên", xa: "La Bằng",
    modules: ["ERP", "TXNG"], status: "active",
    logoColor: "#ca8a04", logoUrl: null,
    gcp: "", gln: "",
    website: "", videoUrl: "", chungChiUrls: [], cauChuyen: "",
    createdAt: "2024-02-15T07:00:00.000Z", updatedAt: "2024-03-05T07:00:00.000Z",
  },
  {
    id: 3, mst: "0105556789", ten: "Hộ kinh doanh Chè Tiến Đạt",
    tenHienThi: "Tiến Đạt Tea", tenDangNhap: "tiendat",
    daiDien: "Lê Văn Tiến",
    sdt: "0966111222", email: "tiendat@gmail.com",
    diaChi: "Thôn 2, xã Văn Yên, huyện Đại Từ",
    tinh: "Thái Nguyên", xa: "Văn Yên",
    modules: ["ERP"], status: "pending",
    logoColor: "#0284c7", logoUrl: null,
    gcp: "", gln: "",
    website: "", videoUrl: "", chungChiUrls: [], cauChuyen: "",
    createdAt: "2024-04-01T07:00:00.000Z", updatedAt: "2024-04-01T07:00:00.000Z",
  },
];

let employees: Employee[] = [
  {
    id: 1, enterpriseId: null, name: "Super Admin", email: "admin@esgvalley.com",
    phone: "0900000001", role: "super_admin", status: "active",
    avatarColor: "#7c3aed", avatarUrl: null,
    lastSeen: now(), createdAt: "2024-01-01T00:00:00.000Z", updatedAt: now(),
    enterpriseName: null,
  },
  {
    id: 2, enterpriseId: 1, name: "Nguyễn Văn An", email: "an.nguyen@chequanchu.vn",
    phone: "0912345678", role: "admin", status: "active",
    avatarColor: "#16a34a", avatarUrl: null,
    lastSeen: now(), createdAt: "2024-01-10T08:00:00.000Z", updatedAt: now(),
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 3, enterpriseId: 1, name: "Phạm Thị Hoa", email: "hoa.pham@chequanchu.vn",
    phone: "0933222111", role: "staff", status: "active",
    avatarColor: "#db2777", avatarUrl: null,
    lastSeen: now(), createdAt: "2024-02-01T08:00:00.000Z", updatedAt: now(),
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 4, enterpriseId: 2, name: "Trần Thị Bình", email: "binh.tran@labang.vn",
    phone: "0987654321", role: "admin", status: "active",
    avatarColor: "#ca8a04", avatarUrl: null,
    lastSeen: now(), createdAt: "2024-02-15T08:00:00.000Z", updatedAt: now(),
    enterpriseName: "La Bằng Tea",
  },
  {
    id: 5, enterpriseId: 1, name: "Đỗ Minh Khoa", email: "khoa.do@chequanchu.vn",
    phone: "0944333555", role: "staff", status: "invited",
    avatarColor: "#0284c7", avatarUrl: null,
    lastSeen: "2024-04-20T10:00:00.000Z", createdAt: "2024-04-20T08:00:00.000Z", updatedAt: now(),
    enterpriseName: "Chè Quân Chu",
  },
];

let units: Unit[] = [
  { id: 1, enterpriseId: 1, name: "Kilogram", abbreviation: "kg", loaiDonVi: "Khối lượng", description: "Đơn vị khối lượng cơ bản", createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 2, enterpriseId: 1, name: "Tấn",      abbreviation: "tấn", loaiDonVi: "Khối lượng", description: "1 tấn = 1000 kg",          createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 3, enterpriseId: 1, name: "Hộp",      abbreviation: "hộp", loaiDonVi: "Đóng gói",   description: "Hộp sản phẩm",            createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 4, enterpriseId: 1, name: "Túi",      abbreviation: "túi", loaiDonVi: "Đóng gói",   description: "Túi bao bì",              createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 5, enterpriseId: 1, name: "Thùng",    abbreviation: "thùng", loaiDonVi: "Đóng gói", description: "Thùng carton",            createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
];

let facilities: Facility[] = [
  {
    id: 1, enterpriseId: 1, name: "Hộ ông Nguyễn Văn Thắng", code: "QC-001",
    type: "ho_lien_ket", phone: "0912111222",
    address: "Xóm Quân Chu 1, xã Quân Chu", tinh: "Thái Nguyên", xa: "Quân Chu",
    gln: "8938500100011", status: "active", notes: "Hộ trồng chè búp tươi lâu năm",
    giong_che_ids: [1, 2],
    createdAt: "2024-01-15T00:00:00.000Z", updatedAt: "2024-01-15T00:00:00.000Z",
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 2, enterpriseId: 1, name: "Hộ bà Lê Thị Mai", code: "QC-002",
    type: "ho_lien_ket", phone: "0933444555",
    address: "Xóm Quân Chu 2, xã Quân Chu", tinh: "Thái Nguyên", xa: "Quân Chu",
    gln: "8938500100022", status: "active", notes: "",
    giong_che_ids: [1],
    createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z",
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 3, enterpriseId: 1, name: "Xưởng chế biến Quân Chu", code: "QC-XB-01",
    type: "co_so_noi_bo", phone: "0912345678",
    address: "Thôn Quân Chu, xã Quân Chu, huyện Đại Từ", tinh: "Thái Nguyên", xa: "Quân Chu",
    gln: "8938500100033", status: "active", notes: "Xưởng chế biến chính",
    giong_che_ids: [],
    createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z",
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 4, enterpriseId: 2, name: "Hộ anh Vũ Đình Nam", code: "LB-001",
    type: "ho_lien_ket", phone: "0977888999",
    address: "Xóm La Bằng, xã La Bằng", tinh: "Thái Nguyên", xa: "La Bằng",
    gln: "8938500200011", status: "active", notes: "",
    giong_che_ids: [3],
    createdAt: "2024-02-20T00:00:00.000Z", updatedAt: "2024-02-20T00:00:00.000Z",
    enterpriseName: "La Bằng Tea",
  },
];

let products: Product[] = [
  {
    id: 1, enterpriseId: 1, name: "Chè Búp Tươi Quân Chu", code: "TP-001",
    gtin: "8938500100101", type: "ban_thanh_pham", unitId: 1, price: "45000",
    imageUrl: "", description: "Chè búp tươi loại 1, hái một tôm hai lá",
    status: "active", createdAt: "2024-01-15T00:00:00.000Z", updatedAt: "2024-01-15T00:00:00.000Z",
    unitName: "kg", enterpriseName: "Chè Quân Chu",
  },
  {
    id: 2, enterpriseId: 1, name: "Chè Đinh Quân Chu", code: "TP-002",
    gtin: "8938500100102", type: "thanh_pham_cuoi", unitId: 3, price: "850000",
    imageUrl: "", description: "Chè đinh cao cấp, hương thơm đặc trưng Quân Chu",
    status: "active", createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z",
    unitName: "hộp", enterpriseName: "Chè Quân Chu",
  },
  {
    id: 3, enterpriseId: 1, name: "Chè Nõn Tôm Quân Chu", code: "TP-003",
    gtin: "8938500100103", type: "thanh_pham_cuoi", unitId: 4, price: "320000",
    imageUrl: "", description: "Chè nõn tôm thượng hạng",
    status: "active", createdAt: "2024-02-01T00:00:00.000Z", updatedAt: "2024-02-01T00:00:00.000Z",
    unitName: "túi", enterpriseName: "Chè Quân Chu",
  },
];

let grades: Grade[] = [
  {
    id: 1, name: "Loại A — Tôm 1 lá", price: "55000",
    prices: JSON.stringify([{ label: "Giá cơ bản", value: "55000" }, { label: "Giá cao điểm", value: "60000" }]),
    loaiChe: "Chè Búp Tươi Quân Chu", ghiChu: "Hái một tôm một lá non", colorKey: "green",
    createdAt: "2024-01-15T00:00:00.000Z", updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: 2, name: "Loại B — Tôm 2 lá", price: "42000",
    prices: JSON.stringify([{ label: "Giá cơ bản", value: "42000" }, { label: "Giá thấp điểm", value: "38000" }]),
    loaiChe: "Chè Búp Tươi Quân Chu", ghiChu: "Hái một tôm hai lá", colorKey: "blue",
    createdAt: "2024-01-15T00:00:00.000Z", updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: 3, name: "Loại C — Búp bánh tẻ", price: "28000",
    prices: JSON.stringify([{ label: "Giá cơ bản", value: "28000" }]),
    loaiChe: "Chè Búp Tươi Quân Chu", ghiChu: "Búp già hơn, lá bánh tẻ", colorKey: "amber",
    createdAt: "2024-01-15T00:00:00.000Z", updatedAt: "2024-01-15T00:00:00.000Z",
  },
];

let qualityLevels: QualityLevel[] = [
  { id: 1, gradeId: 1, danhGia: "90%", donGia: "55000", prices: JSON.stringify([{ label: "Giá 90%", value: "55000" }]), ghiChu: "Đạt chuẩn xuất khẩu",   createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z" },
  { id: 2, gradeId: 1, danhGia: "80%", donGia: "50000", prices: JSON.stringify([{ label: "Giá 80%", value: "50000" }]), ghiChu: "Đạt chuẩn nội địa",     createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z" },
  { id: 3, gradeId: 2, danhGia: "85%", donGia: "42000", prices: JSON.stringify([{ label: "Giá 85%", value: "42000" }]), ghiChu: "Búp đều, ít lá già",    createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z" },
  { id: 4, gradeId: 2, danhGia: "70%", donGia: "35000", prices: JSON.stringify([{ label: "Giá 70%", value: "35000" }]), ghiChu: "Lẫn nhiều lá già",      createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z" },
  { id: 5, gradeId: 3, danhGia: "75%", donGia: "28000", prices: JSON.stringify([{ label: "Giá 75%", value: "28000" }]), ghiChu: "",                       createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z" },
];

let standards: Standard[] = [
  { id: 1, title: "TCVN 1053:2014 — Chè búp tươi", description: "Tiêu chuẩn Việt Nam về chất lượng chè búp tươi dùng để chế biến", colorKey: "green",  createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 2, title: "VietGAP — Thực hành sản xuất nông nghiệp tốt", description: "Quy trình thực hành sản xuất nông nghiệp tốt cho chè", colorKey: "blue", createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
];

let purchaseOrders: PurchaseOrder[] = [
  {
    id: 1, maPhieu: "TM-20240501-001", enterpriseId: 1, facilityId: 1,
    facilityName: "Hộ ông Nguyễn Văn Thắng",
    diaChuThu: "Xóm Quân Chu 1, xã Quân Chu, Thái Nguyên",
    maLoMe: "QC001-20240501", ngayThu: "2024-05-01",
    status: "confirmed", notes: "Thu mua đợt 1 tháng 5",
    total: "2750000", lamTron: "0", khoiLuongTong: "55",
    createdAt: "2024-05-01T07:00:00.000Z", updatedAt: "2024-05-01T07:00:00.000Z",
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 2, maPhieu: "TM-20240510-002", enterpriseId: 1, facilityId: 2,
    facilityName: "Hộ bà Lê Thị Mai",
    diaChuThu: "Xóm Quân Chu 2, xã Quân Chu, Thái Nguyên",
    maLoMe: "QC002-20240510", ngayThu: "2024-05-10",
    status: "confirmed", notes: "",
    total: "1680000", lamTron: "0", khoiLuongTong: "40",
    createdAt: "2024-05-10T07:00:00.000Z", updatedAt: "2024-05-10T07:00:00.000Z",
    enterpriseName: "Chè Quân Chu",
  },
  {
    id: 3, maPhieu: "TM-20240520-003", enterpriseId: 1, facilityId: 1,
    facilityName: "Hộ ông Nguyễn Văn Thắng",
    diaChuThu: "Xóm Quân Chu 1, xã Quân Chu, Thái Nguyên",
    maLoMe: "QC001-20240520", ngayThu: "2024-05-20",
    status: "draft", notes: "Chờ xác nhận",
    total: "1540000", lamTron: "0", khoiLuongTong: "30",
    createdAt: "2024-05-20T07:00:00.000Z", updatedAt: "2024-05-20T07:00:00.000Z",
    enterpriseName: "Chè Quân Chu",
  },
];

let purchaseOrderItems: (PurchaseOrderItem & { id: number; orderId: number })[] = [
  { id: 1, orderId: 1, productId: 1, gradeId: 1, productName: "Chè Búp Tươi Quân Chu", gradeName: "Loại A — Tôm 1 lá", qualityPercent: "90%", ghiChu: "Đạt chuẩn xuất khẩu", khoiLuong: "30", donGia: "55000", thanhTien: "1650000", moTa: "" },
  { id: 2, orderId: 1, productId: 1, gradeId: 2, productName: "Chè Búp Tươi Quân Chu", gradeName: "Loại B — Tôm 2 lá", qualityPercent: "85%", ghiChu: "",                   khoiLuong: "25", donGia: "44000", thanhTien: "1100000", moTa: "" },
  { id: 3, orderId: 2, productId: 1, gradeId: 2, productName: "Chè Búp Tươi Quân Chu", gradeName: "Loại B — Tôm 2 lá", qualityPercent: "85%", ghiChu: "",                   khoiLuong: "40", donGia: "42000", thanhTien: "1680000", moTa: "" },
  { id: 4, orderId: 3, productId: 1, gradeId: 1, productName: "Chè Búp Tươi Quân Chu", gradeName: "Loại A — Tôm 1 lá", qualityPercent: "80%", ghiChu: "",                   khoiLuong: "30", donGia: "50000", thanhTien: "1500000", moTa: "" },
];

let teaVarieties: TeaVariety[] = [
  { id: 1, name: "Trung Du",    code: "TD",   notes: "Giống chè bản địa Thái Nguyên, búp nhỏ, hương thơm đặc trưng", productId: 1, productName: "Chè Búp Tươi Quân Chu", createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 2, name: "Kim Tuyên",   code: "KT",   notes: "Giống nhập từ Đài Loan, năng suất cao, chất lượng tốt",          productId: 1, productName: "Chè Búp Tươi Quân Chu", createdAt: "2024-01-10T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z" },
  { id: 3, name: "PH1",         code: "PH1",  notes: "Giống lai, búp to, thích hợp chế biến chè đen",                  productId: 1, productName: "Chè Búp Tươi Quân Chu", createdAt: "2024-02-01T00:00:00.000Z", updatedAt: "2024-02-01T00:00:00.000Z" },
];

// Employee ↔ Facility mapping
let employeeFacilityMap: { employeeId: number; facilityId: number }[] = [
  { employeeId: 2, facilityId: 1 },
  { employeeId: 2, facilityId: 3 },
  { employeeId: 3, facilityId: 2 },
  { employeeId: 3, facilityId: 3 },
];

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const loginUser = (email: string, _password: string) => {
  const emp = employees.find((e) => e.email === email);
  if (!emp) {
    return delay(
      (() => { throw new Error("Email hoặc mật khẩu không đúng"); })()
    );
  }
  const ent = enterprises.find((en) => en.id === emp.enterpriseId);
  const allModules = ["portal", "erp", "txng", "vung_trong", "iot"];
  const moduleMap: Record<string, string[]> = { ERP: ["erp"], TXNG: ["txng"], VT: ["vung_trong", "iot"] };
  const modules = emp.role === "super_admin"
    ? allModules
    : (ent?.modules ?? []).flatMap((m) => moduleMap[m] ?? []);

  const user: AuthUser = {
    id: emp.id, name: emp.name, email: emp.email, role: emp.role,
    enterpriseId: emp.enterpriseId, enterpriseName: ent?.tenHienThi ?? null,
    avatarUrl: emp.avatarUrl, avatarColor: emp.avatarColor,
    modules: ["portal", ...modules],
  };
  return delay({ user });
};

export const changePassword = (_old: string, _new: string) => delay({ ok: true as const });

// ─── Enterprises ───────────────────────────────────────────────────────────────

export const fetchEnterprises = () => delay({ items: [...enterprises] });

export const fetchEnterprise = (id: number | string) => {
  const item = enterprises.find((e) => e.id === Number(id));
  if (!item) throw new Error("Not found");
  const members = employees.filter((e) => e.enterpriseId === item.id);
  return delay({ item, members });
};

export const createEnterprise = (body: Partial<Enterprise> & { matKhau?: string }) => {
  const item: Enterprise = {
    id: nextId(), mst: body.mst ?? "", ten: body.ten ?? "", tenHienThi: body.tenHienThi ?? body.ten ?? "",
    tenDangNhap: body.tenDangNhap ?? "",
    daiDien: body.daiDien ?? "", sdt: body.sdt ?? "", email: body.email ?? "",
    diaChi: body.diaChi ?? "", tinh: body.tinh ?? "", xa: body.xa ?? "",
    modules: body.modules ?? [], status: body.status ?? "pending",
    logoColor: body.logoColor ?? "#6b7280", logoUrl: body.logoUrl ?? null,
    gcp: body.gcp ?? "", gln: body.gln ?? "",
    website: body.website ?? "", videoUrl: body.videoUrl ?? "",
    chungChiUrls: body.chungChiUrls ?? [], cauChuyen: body.cauChuyen ?? "",
    createdAt: now(), updatedAt: now(),
  };
  enterprises.push(item);
  const adminUser: Employee = {
    id: nextId(), enterpriseId: item.id, name: body.daiDien ?? "Admin",
    email: body.email ?? "", phone: body.sdt ?? "", role: "admin", status: "active",
    avatarColor: item.logoColor, avatarUrl: null, lastSeen: now(), createdAt: now(), updatedAt: now(),
    enterpriseName: item.tenHienThi,
  };
  employees.push(adminUser);
  return delay({ item, adminUser });
};

export const updateEnterprise = (id: number, body: Partial<Enterprise>) => {
  const idx = enterprises.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Not found");
  enterprises[idx] = { ...enterprises[idx], ...body, updatedAt: now() };
  return delay({ item: enterprises[idx] });
};

export const deleteEnterprise = (id: number) => {
  enterprises = enterprises.filter((e) => e.id !== id);
  return delay({ ok: true as const });
};

export const fetchEnterpriseStats = () => {
  const stats: EnterpriseStats = {
    total: enterprises.length,
    active: enterprises.filter((e) => e.status === "active").length,
    pending: enterprises.filter((e) => e.status === "pending").length,
    locked: enterprises.filter((e) => e.status === "locked").length,
  };
  return delay(stats);
};

// ─── Employees ─────────────────────────────────────────────────────────────────

export const fetchEmployees = () => delay({ items: [...employees] });

export const createEmployee = (body: Partial<Employee> & { matKhau?: string }) => {
  const ent = enterprises.find((e) => e.id === body.enterpriseId);
  const item: Employee = {
    id: nextId(), enterpriseId: body.enterpriseId ?? null, name: body.name ?? "",
    email: body.email ?? "", phone: body.phone ?? "", role: body.role ?? "staff",
    status: body.status ?? "invited", avatarColor: body.avatarColor ?? "#6b7280",
    avatarUrl: body.avatarUrl ?? null, lastSeen: now(), createdAt: now(), updatedAt: now(),
    enterpriseName: ent?.tenHienThi ?? null,
  };
  employees.push(item);
  return delay({ item });
};

export const updateEmployee = (id: number, body: Partial<Employee> & { matKhau?: string }) => {
  const idx = employees.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Not found");
  const ent = enterprises.find((e) => e.id === (body.enterpriseId ?? employees[idx].enterpriseId));
  employees[idx] = { ...employees[idx], ...body, updatedAt: now(), enterpriseName: ent?.tenHienThi ?? null };
  return delay({ item: employees[idx] });
};

export const deleteEmployee = (id: number) => {
  employees = employees.filter((e) => e.id !== id);
  return delay({ ok: true as const });
};

export const fetchEmployeeStats = () => {
  const stats: EmployeeStats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    invited: employees.filter((e) => e.status === "invited").length,
    locked: employees.filter((e) => e.status === "locked").length,
  };
  return delay(stats);
};

export const resetEmployeePassword = (_id: number) =>
  delay({ ok: true as const, defaultPassword: "Abc@123456" });

export const setEmployeeFacilities = (id: number, facilityIds: number[]) => {
  employeeFacilityMap = employeeFacilityMap.filter((m) => m.employeeId !== id);
  facilityIds.forEach((fid) => employeeFacilityMap.push({ employeeId: id, facilityId: fid }));
  return delay({ ok: true as const });
};

export const fetchEmployeeFacilities = (id: number) => {
  const facilityIds = employeeFacilityMap.filter((m) => m.employeeId === id).map((m) => m.facilityId);
  return delay({ facilityIds });
};

// ─── Units ─────────────────────────────────────────────────────────────────────

export const fetchUnits = () => delay({ items: [...units] });

export const createUnit = (body: Partial<Unit>) => {
  const item: Unit = {
    id: nextId(), enterpriseId: body.enterpriseId ?? null,
    name: body.name ?? "", abbreviation: body.abbreviation ?? "",
    loaiDonVi: body.loaiDonVi ?? "", description: body.description ?? "",
    createdAt: now(), updatedAt: now(),
  };
  units.push(item);
  return delay({ item });
};

export const updateUnit = (id: number, body: Partial<Unit>) => {
  const idx = units.findIndex((u) => u.id === id);
  if (idx < 0) throw new Error("Not found");
  units[idx] = { ...units[idx], ...body, updatedAt: now() };
  return delay({ item: units[idx] });
};

export const deleteUnit = (id: number) => {
  units = units.filter((u) => u.id !== id);
  return delay({ ok: true as const });
};

// ─── Facilities ────────────────────────────────────────────────────────────────

export const fetchFacilities = () => delay({ items: [...facilities] });

export const createFacility = (body: Partial<Facility>) => {
  const ent = enterprises.find((e) => e.id === body.enterpriseId);
  const item: Facility = {
    id: nextId(), enterpriseId: body.enterpriseId ?? null,
    name: body.name ?? "", code: body.code ?? "",
    type: body.type ?? "ho_lien_ket", phone: body.phone ?? "",
    address: body.address ?? "", tinh: body.tinh ?? "", xa: body.xa ?? "",
    gln: body.gln ?? "", status: body.status ?? "active", notes: body.notes ?? "",
    giong_che_ids: body.giong_che_ids ?? [],
    createdAt: now(), updatedAt: now(), enterpriseName: ent?.tenHienThi ?? null,
  };
  facilities.push(item);
  return delay({ item });
};

export const updateFacility = (id: number, body: Partial<Facility>) => {
  const idx = facilities.findIndex((f) => f.id === id);
  if (idx < 0) throw new Error("Not found");
  facilities[idx] = { ...facilities[idx], ...body, updatedAt: now() };
  return delay({ item: facilities[idx] });
};

export const deleteFacility = (id: number) => {
  facilities = facilities.filter((f) => f.id !== id);
  return delay({ ok: true as const });
};

export const assignFacilityEmployees = (id: number, employeeIds: number[]) => {
  employeeFacilityMap = employeeFacilityMap.filter((m) => m.facilityId !== id);
  employeeIds.forEach((eid) => employeeFacilityMap.push({ employeeId: eid, facilityId: id }));
  return delay({ ok: true as const });
};

// ─── Products ──────────────────────────────────────────────────────────────────

export const fetchProducts = () => delay({ items: [...products] });

export const createProduct = (body: Partial<Product>) => {
  const ent = enterprises.find((e) => e.id === body.enterpriseId);
  const unit = units.find((u) => u.id === body.unitId);
  const item: Product = {
    id: nextId(), enterpriseId: body.enterpriseId ?? null,
    name: body.name ?? "", code: body.code ?? "", gtin: body.gtin ?? "",
    type: body.type ?? "ban_thanh_pham", unitId: body.unitId ?? null,
    price: body.price ?? "0", imageUrl: body.imageUrl ?? "",
    description: body.description ?? "", status: body.status ?? "active",
    createdAt: now(), updatedAt: now(),
    unitName: unit?.abbreviation ?? null, enterpriseName: ent?.tenHienThi ?? null,
  };
  products.push(item);
  return delay({ item });
};

export const updateProduct = (id: number, body: Partial<Product>) => {
  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Not found");
  const unit = units.find((u) => u.id === (body.unitId ?? products[idx].unitId));
  products[idx] = { ...products[idx], ...body, updatedAt: now(), unitName: unit?.abbreviation ?? null };
  return delay({ item: products[idx] });
};

export const deleteProduct = (id: number) => {
  products = products.filter((p) => p.id !== id);
  return delay({ ok: true as const });
};

// ─── Grades ────────────────────────────────────────────────────────────────────

export const fetchGrades = () => delay({ items: [...grades] });

export const createGrade = (body: Partial<Grade>) => {
  const item: Grade = {
    id: nextId(), name: body.name ?? "", price: body.price ?? "0",
    prices: body.prices ?? "[]", loaiChe: body.loaiChe ?? "",
    ghiChu: body.ghiChu ?? "", colorKey: body.colorKey ?? "gray",
    createdAt: now(), updatedAt: now(),
  };
  grades.push(item);
  return delay({ item });
};

export const updateGrade = (id: number, body: Partial<Grade>) => {
  const idx = grades.findIndex((g) => g.id === id);
  if (idx < 0) throw new Error("Not found");
  grades[idx] = { ...grades[idx], ...body, updatedAt: now() };
  return delay({ item: grades[idx] });
};

export const deleteGrade = (id: number) => {
  grades = grades.filter((g) => g.id !== id);
  return delay({ ok: true as const });
};

// ─── Quality Levels ────────────────────────────────────────────────────────────

export const fetchQualityLevels = () => delay({ items: [...qualityLevels] });

export const createQualityLevel = (body: Partial<QualityLevel>) => {
  const item: QualityLevel = {
    id: nextId(), gradeId: body.gradeId ?? null, danhGia: body.danhGia ?? "",
    donGia: body.donGia ?? "0", prices: body.prices ?? "[]",
    ghiChu: body.ghiChu ?? "", createdAt: now(), updatedAt: now(),
  };
  qualityLevels.push(item);
  return delay({ item });
};

export const updateQualityLevel = (id: number, body: Partial<QualityLevel>) => {
  const idx = qualityLevels.findIndex((q) => q.id === id);
  if (idx < 0) throw new Error("Not found");
  qualityLevels[idx] = { ...qualityLevels[idx], ...body, updatedAt: now() };
  return delay({ item: qualityLevels[idx] });
};

export const deleteQualityLevel = (id: number) => {
  qualityLevels = qualityLevels.filter((q) => q.id !== id);
  return delay({ ok: true as const });
};

// ─── Standards ─────────────────────────────────────────────────────────────────

export const fetchStandards = () => delay({ items: [...standards] });

export const createStandard = (body: Partial<Standard>) => {
  const item: Standard = {
    id: nextId(), title: body.title ?? "", description: body.description ?? "",
    colorKey: body.colorKey ?? "gray", createdAt: now(), updatedAt: now(),
  };
  standards.push(item);
  return delay({ item });
};

export const updateStandard = (id: number, body: Partial<Standard>) => {
  const idx = standards.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("Not found");
  standards[idx] = { ...standards[idx], ...body, updatedAt: now() };
  return delay({ item: standards[idx] });
};

export const deleteStandard = (id: number) => {
  standards = standards.filter((s) => s.id !== id);
  return delay({ ok: true as const });
};

// ─── Admin Tree ────────────────────────────────────────────────────────────────

export const fetchAdminTree = (): Promise<AdminTree> => {
  const tree: AdminEnterprise[] = enterprises.map((ent) => {
    const entFacilities = facilities.filter((f) => f.enterpriseId === ent.id);
    const adminUsers: AdminFacilityUser[] = employees
      .filter((e) => e.enterpriseId === ent.id && e.role === "admin")
      .map((e) => ({ id: e.id, name: e.name, role: e.role, status: e.status, avatarColor: e.avatarColor, email: e.email }));
    return {
      id: ent.id, tenHienThi: ent.tenHienThi, ten: ent.ten, email: ent.email,
      logoColor: ent.logoColor, logoUrl: ent.logoUrl, status: ent.status, modules: ent.modules,
      adminUsers,
      facilities: entFacilities.map((f) => {
        const fUsers = employeeFacilityMap
          .filter((m) => m.facilityId === f.id)
          .map((m) => employees.find((e) => e.id === m.employeeId))
          .filter(Boolean)
          .map((e) => ({ id: e!.id, name: e!.name, role: e!.role, status: e!.status, avatarColor: e!.avatarColor, email: e!.email }));
        return { id: f.id, enterpriseId: f.enterpriseId, name: f.name, code: f.code, type: f.type, status: f.status, address: f.address, phone: f.phone, users: fUsers };
      }),
    };
  });
  const superAdmins: AdminFacilityUser[] = employees
    .filter((e) => e.role === "super_admin")
    .map((e) => ({ id: e.id, name: e.name, role: e.role, status: e.status, avatarColor: e.avatarColor, email: e.email }));
  return delay({ tree, superAdmins });
};

// ─── Purchase Orders ───────────────────────────────────────────────────────────

export const fetchPurchaseOrders = () => delay({ items: [...purchaseOrders] });

export const fetchPurchaseOrder = (id: number) => {
  const item = purchaseOrders.find((o) => o.id === id);
  if (!item) throw new Error("Not found");
  const lineItems = purchaseOrderItems.filter((li) => li.orderId === id);
  return delay({ item, lineItems });
};

export const createPurchaseOrder = (body: Partial<PurchaseOrder> & { lineItems?: PurchaseOrderItem[] }) => {
  const id = nextId();
  const item: PurchaseOrder = {
    id, maPhieu: body.maPhieu ?? `TM-${Date.now()}`,
    enterpriseId: body.enterpriseId ?? null, facilityId: body.facilityId ?? null,
    facilityName: body.facilityName ?? "", diaChuThu: body.diaChuThu ?? "",
    maLoMe: body.maLoMe ?? "", ngayThu: body.ngayThu ?? new Date().toISOString().slice(0, 10),
    status: body.status ?? "draft", notes: body.notes ?? "",
    total: body.total ?? "0", lamTron: body.lamTron ?? "0", khoiLuongTong: body.khoiLuongTong ?? "0",
    createdAt: now(), updatedAt: now(), enterpriseName: body.enterpriseName ?? null,
  };
  purchaseOrders.push(item);
  (body.lineItems ?? []).forEach((li) => {
    purchaseOrderItems.push({ ...li, id: nextId(), orderId: id });
  });
  return delay({ item });
};

export const updatePurchaseOrder = (id: number, body: Partial<PurchaseOrder> & { lineItems?: PurchaseOrderItem[] }) => {
  const idx = purchaseOrders.findIndex((o) => o.id === id);
  if (idx < 0) throw new Error("Not found");
  purchaseOrders[idx] = { ...purchaseOrders[idx], ...body, updatedAt: now() };
  if (body.lineItems !== undefined) {
    purchaseOrderItems.filter((li) => li.orderId !== id);
    const kept = purchaseOrderItems.filter((li) => li.orderId !== id);
    purchaseOrderItems.length = 0;
    kept.forEach((li) => purchaseOrderItems.push(li));
    body.lineItems.forEach((li) => purchaseOrderItems.push({ ...li, id: nextId(), orderId: id }));
  }
  return delay({ item: purchaseOrders[idx] });
};

export const deletePurchaseOrder = (id: number) => {
  purchaseOrders = purchaseOrders.filter((o) => o.id !== id);
  purchaseOrderItems.filter((li) => li.orderId !== id);
  return delay({ ok: true as const });
};

// ─── Tea Varieties ─────────────────────────────────────────────────────────────

export const fetchTeaVarieties = () => delay({ items: [...teaVarieties] });

export const createTeaVariety = (body: Partial<TeaVariety>) => {
  const prod = products.find((p) => p.id === body.productId);
  const item: TeaVariety = {
    id: nextId(), name: body.name ?? "", code: body.code ?? "",
    notes: body.notes ?? "", productId: body.productId ?? null,
    productName: prod?.name ?? null, createdAt: now(), updatedAt: now(),
  };
  teaVarieties.push(item);
  return delay({ item });
};

export const updateTeaVariety = (id: number, body: Partial<TeaVariety>) => {
  const idx = teaVarieties.findIndex((t) => t.id === id);
  if (idx < 0) throw new Error("Not found");
  const prod = products.find((p) => p.id === (body.productId ?? teaVarieties[idx].productId));
  teaVarieties[idx] = { ...teaVarieties[idx], ...body, updatedAt: now(), productName: prod?.name ?? null };
  return delay({ item: teaVarieties[idx] });
};

export const deleteTeaVariety = (id: number) => {
  teaVarieties = teaVarieties.filter((t) => t.id !== id);
  return delay({ ok: true as const });
};
