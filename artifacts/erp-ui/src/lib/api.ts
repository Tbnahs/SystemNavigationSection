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

/* Enterprises */
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

/* Auth */
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  enterpriseId: number | null;
  enterpriseName: string | null;
  avatarUrl: string | null;
  avatarColor: string;
};
export const loginUser = (email: string, password: string) =>
  request<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/* Employees */
export const fetchEmployees = () => request<{ items: Employee[] }>("/employees");
export const createEmployee = (body: Partial<Employee>) =>
  request<{ item: Employee }>("/employees", { method: "POST", body: JSON.stringify(body) });
export const updateEmployee = (id: number, body: Partial<Employee>) =>
  request<{ item: Employee }>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteEmployee = (id: number) =>
  request<{ ok: true }>(`/employees/${id}`, { method: "DELETE" });
export const fetchEmployeeStats = () => request<EmployeeStats>("/employees-stats");
