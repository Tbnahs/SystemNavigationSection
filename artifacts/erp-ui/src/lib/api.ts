export type Enterprise = {
  id: number;
  mst: string;
  ten: string;
  tenHienThi: string;
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
  createdAt: string;
  updatedAt: string;
  enterpriseName?: string | null;
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

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const API = `${BASE}/api`.replace("//api", "/api");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = "";
    try { detail = JSON.stringify(await res.json()); } catch { /* ignore */ }
    throw new Error(`${res.status} ${res.statusText} ${detail}`);
  }
  return res.json() as Promise<T>;
}

/* ── Enterprises ─────────────────────────────────────────── */
export const fetchEnterprises = () => request<{ items: Enterprise[] }>("/enterprises");
export const fetchEnterprise = (id: number | string) =>
  request<{ item: Enterprise; members: Employee[] }>(`/enterprises/${id}`);
export const createEnterprise = (body: Partial<Enterprise> & { matKhau?: string }) =>
  request<{ item: Enterprise; adminUser: Employee }>("/enterprises", { method: "POST", body: JSON.stringify(body) });
export const updateEnterprise = (id: number, body: Partial<Enterprise>) =>
  request<{ item: Enterprise }>(`/enterprises/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteEnterprise = (id: number) =>
  request<{ ok: true }>(`/enterprises/${id}`, { method: "DELETE" });
export const fetchEnterpriseStats = () => request<EnterpriseStats>("/enterprises-stats");

/* ── Auth ────────────────────────────────────────────────── */
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
export const loginUser = (email: string, password: string) =>
  request<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/* ── Employees ───────────────────────────────────────────── */
export const fetchEmployees = () => request<{ items: Employee[] }>("/employees");
export const createEmployee = (body: Partial<Employee> & { matKhau?: string }) =>
  request<{ item: Employee }>("/employees", { method: "POST", body: JSON.stringify(body) });
export const updateEmployee = (id: number, body: Partial<Employee>) =>
  request<{ item: Employee }>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteEmployee = (id: number) =>
  request<{ ok: true }>(`/employees/${id}`, { method: "DELETE" });
export const fetchEmployeeStats = () => request<EmployeeStats>("/employees-stats");
export const resetEmployeePassword = (id: number) =>
  request<{ ok: true; defaultPassword: string }>(`/employees/${id}/reset-password`, { method: "POST" });
export const setEmployeeFacilities = (id: number, facilityIds: number[]) =>
  request<{ ok: true }>(`/employees/${id}/set-facilities`, { method: "POST", body: JSON.stringify({ facilityIds }) });
export const fetchEmployeeFacilities = (id: number) =>
  request<{ facilityIds: number[] }>(`/employees/${id}/facilities`);

/* ── Units (Đơn vị tính) ─────────────────────────────────── */
export const fetchUnits = () => request<{ items: Unit[] }>("/units");
export const createUnit = (body: Partial<Unit>) =>
  request<{ item: Unit }>("/units", { method: "POST", body: JSON.stringify(body) });
export const updateUnit = (id: number, body: Partial<Unit>) =>
  request<{ item: Unit }>(`/units/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteUnit = (id: number) =>
  request<{ ok: true }>(`/units/${id}`, { method: "DELETE" });

/* ── Facilities (Cơ sở) ──────────────────────────────────── */
export const fetchFacilities = () => request<{ items: Facility[] }>("/facilities");
export const createFacility = (body: Partial<Facility>) =>
  request<{ item: Facility }>("/facilities", { method: "POST", body: JSON.stringify(body) });
export const updateFacility = (id: number, body: Partial<Facility>) =>
  request<{ item: Facility }>(`/facilities/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteFacility = (id: number) =>
  request<{ ok: true }>(`/facilities/${id}`, { method: "DELETE" });
export const assignFacilityEmployees = (id: number, employeeIds: number[]) =>
  request<{ ok: true }>(`/facilities/${id}/assign`, { method: "POST", body: JSON.stringify({ employeeIds }) });

/* ── Products (Thương phẩm) ──────────────────────────────── */
export const fetchProducts = () => request<{ items: Product[] }>("/products");
export const createProduct = (body: Partial<Product>) =>
  request<{ item: Product }>("/products", { method: "POST", body: JSON.stringify(body) });
export const updateProduct = (id: number, body: Partial<Product>) =>
  request<{ item: Product }>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteProduct = (id: number) =>
  request<{ ok: true }>(`/products/${id}`, { method: "DELETE" });

/* ── Grades (Quy cách) ───────────────────────────────────── */
export const fetchGrades = () => request<{ items: Grade[] }>("/grades");
export const createGrade = (body: Partial<Grade>) =>
  request<{ item: Grade }>("/grades", { method: "POST", body: JSON.stringify(body) });
export const updateGrade = (id: number, body: Partial<Grade>) =>
  request<{ item: Grade }>(`/grades/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteGrade = (id: number) =>
  request<{ ok: true }>(`/grades/${id}`, { method: "DELETE" });

/* ── Quality Levels (% Chất lượng) ──────────────────────── */
export const fetchQualityLevels = () => request<{ items: QualityLevel[] }>("/quality-levels");
export const createQualityLevel = (body: Partial<QualityLevel>) =>
  request<{ item: QualityLevel }>("/quality-levels", { method: "POST", body: JSON.stringify(body) });
export const updateQualityLevel = (id: number, body: Partial<QualityLevel>) =>
  request<{ item: QualityLevel }>(`/quality-levels/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteQualityLevel = (id: number) =>
  request<{ ok: true }>(`/quality-levels/${id}`, { method: "DELETE" });

/* ── Standards (Tiêu chuẩn) ─────────────────────────────── */
export const fetchStandards = () => request<{ items: Standard[] }>("/standards");
export const createStandard = (body: Partial<Standard>) =>
  request<{ item: Standard }>("/standards", { method: "POST", body: JSON.stringify(body) });
export const updateStandard = (id: number, body: Partial<Standard>) =>
  request<{ item: Standard }>(`/standards/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteStandard = (id: number) =>
  request<{ ok: true }>(`/standards/${id}`, { method: "DELETE" });

/* ── Admin Tree ──────────────────────────────────────────── */
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
export const fetchAdminTree = () => request<AdminTree>("/admin-tree");

/* ── Purchase Orders (Đơn thu mua) ──────────────────────── */
export const fetchPurchaseOrders = () => request<{ items: PurchaseOrder[] }>("/purchase-orders");
export const fetchPurchaseOrder = (id: number) =>
  request<{ item: PurchaseOrder; lineItems: PurchaseOrderItem[] }>(`/purchase-orders/${id}`);
export const createPurchaseOrder = (body: Partial<PurchaseOrder> & { lineItems?: PurchaseOrderItem[] }) =>
  request<{ item: PurchaseOrder }>("/purchase-orders", { method: "POST", body: JSON.stringify(body) });
export const updatePurchaseOrder = (id: number, body: Partial<PurchaseOrder> & { lineItems?: PurchaseOrderItem[] }) =>
  request<{ item: PurchaseOrder }>(`/purchase-orders/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deletePurchaseOrder = (id: number) =>
  request<{ ok: true }>(`/purchase-orders/${id}`, { method: "DELETE" });

/* ── Profile / Change Password ───────────────────────────── */
export const changePassword = (oldPassword: string, newPassword: string) => {
  const stored = localStorage.getItem("erp_user");
  const email = stored ? (JSON.parse(stored) as { email?: string }).email ?? "" : "";
  return request<{ ok: true }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ email, oldPassword, newPassword }),
  });
};
