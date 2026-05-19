import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, X, Upload,
  Users, Mail, Phone, ArrowLeft, ArrowRight,
  Shield, Pencil, Loader2, ChevronDown, Check, RotateCcw, Factory,
  Eye, EyeOff, KeyRound,
} from "lucide-react";
import {
  fetchEmployees, fetchEmployeeStats, createEmployee,
  updateEmployee, deleteEmployee, fetchEnterprises,
  resetEmployeePassword, setEmployeeFacilities,
  fetchFacilities, fetchAdminTree, type Employee, type Facility,
} from "@/lib/api";

/* ─── Constants ────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-orange-500",
];

const STATUS: Record<Employee["status"], { text: string; cls: string; dot: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  invited: { text: "Đã mời", cls: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
};

const ROLE_CLR: Record<string, string> = {
  "Admin": "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Quản lý": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Nhân viên": "bg-slate-50 text-slate-700 ring-slate-500/20",
  "Kế toán": "bg-violet-50 text-violet-700 ring-violet-600/20",
};
function roleClr(role: string) { return ROLE_CLR[role] ?? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"; }

const DEFAULT_ROLES = ["Admin", "Quản lý", "Nhân viên", "Kế toán"];

/* ─── Permissions ───────────────────────────────────────────────── */
const ALL_PERMS: { id: string; label: string; group: string }[] = [
  { id: "erp.dn.xem",  label: "Xem nội dung doanh nghiệp",       group: "ERP" },
  { id: "erp.dn.sua",  label: "Chỉnh sửa nội dung doanh nghiệp", group: "ERP" },
  { id: "erp.bc.xem",  label: "Xem báo cáo ERP",                  group: "ERP" },
  { id: "erp.bc.xuat", label: "Kết xuất dữ liệu",                 group: "ERP" },
  { id: "txng.xem",    label: "Xem truy xuất nguồn gốc",          group: "TXNG" },
  { id: "txng.tao",    label: "Tạo / Cập nhật lô hàng",           group: "TXNG" },
  { id: "txng.xoa",    label: "Xóa lô hàng",                      group: "TXNG" },
  { id: "txng.duyet",  label: "Phê duyệt lô hàng",                group: "TXNG" },
  { id: "vt.xem",      label: "Xem vùng trồng",                   group: "Vùng Trồng" },
  { id: "vt.sua",      label: "Thêm / Sửa vùng trồng",            group: "Vùng Trồng" },
  { id: "vt.xoa",      label: "Xóa vùng trồng",                   group: "Vùng Trồng" },
  { id: "vt.muavu",    label: "Quản lý mùa vụ",                   group: "Vùng Trồng" },
];
const ALL_IDS = ALL_PERMS.map(p => p.id);
const ROLE_PRESET: Record<string, string[]> = {
  "Admin":    ALL_IDS,
  "Quản lý": ["erp.dn.xem","erp.dn.sua","erp.bc.xem","erp.bc.xuat","txng.xem","txng.tao","txng.duyet","vt.xem","vt.sua","vt.muavu"],
  "Kế toán": ["erp.dn.xem","erp.bc.xem","erp.bc.xuat","txng.xem","vt.xem"],
  "Nhân viên":["txng.xem","txng.tao","vt.xem","vt.muavu"],
};
function presetFor(role: string) { return ROLE_PRESET[role] ?? []; }

const PERM_GROUPS = [...new Set(ALL_PERMS.map(p => p.group))];

const MODULE_TO_GROUP: Record<string, string> = {
  "ERP": "ERP",
  "TXNG": "TXNG",
  "VT": "Vùng Trồng",
};

/* ─── Form type ─────────────────────────────────────────────────── */
type EForm = {
  name: string;
  email: string;
  phone: string;
  enterpriseId: number | null;
  role: string;
  permissions: string[];
  avatarUrl: string | null;
  facilityIds: number[];
  matKhau: string;
};
const EMPTY_E: EForm = {
  name: "", email: "", phone: "", enterpriseId: null,
  role: "Nhân viên", permissions: presetFor("Nhân viên"), avatarUrl: null,
  facilityIds: [], matKhau: "",
};

/* ─── Helpers ───────────────────────────────────────────────────── */
function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "??";
}
const DN_COLORS = [
  "bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700",
];
function colorFor(idx: number) { return DN_COLORS[idx % DN_COLORS.length]; }

/* ─── Sub-components ────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[13px] font-medium text-foreground mb-1.5">{children}</label>;
}
function Field({ label, required, placeholder, value, onChange }: {
  label: string; required?: boolean; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-1.5 hover:bg-muted text-foreground whitespace-nowrap">
      {label} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}

function Stat({ label, value, delta, tone, icon: Icon }: {
  label: string; value: string; delta: string; tone: "emerald" | "blue" | "amber" | "rose"; icon: React.ElementType;
}) {
  const c = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c[tone]}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {delta && <div className="text-[11.5px] text-muted-foreground mt-1">{delta}</div>}
    </div>
  );
}

/* ─── RoleCombobox ──────────────────────────────────────────────── */
function RoleCombobox({ value, onChange, roles, onAddRole }: {
  value: string;
  onChange: (v: string) => void;
  roles: string[];
  onAddRole: (r: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = roles.filter(r => r.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = roles.some(r => r.toLowerCase() === search.toLowerCase());
  const canCreate = search.trim() && !exactMatch;

  function select(r: string) {
    onChange(r);
    setSearch("");
    setOpen(false);
  }
  function create() {
    const r = search.trim();
    onAddRole(r);
    onChange(r);
    setSearch("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => { setOpen(o => !o); }}
        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm flex items-center justify-between cursor-pointer hover:border-primary/60 transition-colors"
      >
        {open ? (
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm vai trò…"
            className="flex-1 outline-none bg-transparent text-sm"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span>{value || "Chọn vai trò"}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-muted-foreground ml-2 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg py-1 max-h-52 overflow-auto">
          {filtered.length === 0 && !canCreate && (
            <div className="px-3 py-2.5 text-[13px] text-muted-foreground text-center">Không tìm thấy</div>
          )}
          {filtered.map(r => (
            <button
              key={r}
              onClick={() => select(r)}
              className="w-full px-3 py-2 text-left text-[13.5px] flex items-center justify-between hover:bg-muted/60"
            >
              <span>{r}</span>
              {r === value && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
          {canCreate && (
            <button
              onClick={create}
              className="w-full px-3 py-2 text-left text-[13.5px] flex items-center gap-2 hover:bg-emerald-50 text-emerald-700 border-t border-border mt-1 pt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo vai trò "<span className="font-semibold">{search.trim()}</span>"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── PermissionMatrix ──────────────────────────────────────────── */
const GROUP_META: Record<string, { icon: string; color: string; activeCls: string; badgeCls: string }> = {
  "ERP":         { icon: "🏢", color: "text-blue-600",   activeCls: "border-blue-500 text-blue-700 bg-blue-50/60",   badgeCls: "bg-blue-100 text-blue-700" },
  "TXNG":        { icon: "🔍", color: "text-violet-600", activeCls: "border-violet-500 text-violet-700 bg-violet-50/60", badgeCls: "bg-violet-100 text-violet-700" },
  "Vùng Trồng":  { icon: "🌱", color: "text-emerald-600",activeCls: "border-emerald-500 text-emerald-700 bg-emerald-50/60", badgeCls: "bg-emerald-100 text-emerald-700" },
};

function PermissionMatrix({ permissions, onChange, role, activeGroups }: {
  permissions: string[];
  onChange: (p: string[]) => void;
  role: string;
  activeGroups: string[] | null;
}) {
  const visibleGroups = activeGroups ? PERM_GROUPS.filter(g => activeGroups.includes(g)) : PERM_GROUPS;
  const [activeTab, setActiveTab] = useState<string>(() => visibleGroups[0] ?? "");

  const currentTab = visibleGroups.includes(activeTab) ? activeTab : (visibleGroups[0] ?? "");

  const visiblePreset = presetFor(role).filter(id => {
    const perm = ALL_PERMS.find(p => p.id === id);
    return perm && (!activeGroups || activeGroups.includes(perm.group));
  });
  const isDefault = JSON.stringify([...permissions].sort()) === JSON.stringify([...visiblePreset].sort());

  function toggle(id: string) {
    onChange(permissions.includes(id) ? permissions.filter(p => p !== id) : [...permissions, id]);
  }
  function reset() { onChange(visiblePreset); }

  if (activeGroups !== null && visibleGroups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-slate-50/60 p-4 text-center text-[13px] text-muted-foreground">
        Doanh nghiệp này chưa đăng ký phân hệ nào.
      </div>
    );
  }

  const tabPerms = ALL_PERMS.filter(p => p.group === currentTab);
  const tabChecked = tabPerms.filter(p => permissions.includes(p.id)).length;
  const tabAllChecked = tabChecked === tabPerms.length;
  const tabSomeChecked = tabChecked > 0 && !tabAllChecked;

  function toggleTabGroup() {
    const ids = tabPerms.map(p => p.id);
    if (tabAllChecked) onChange(permissions.filter(id => !ids.includes(id)));
    else onChange([...new Set([...permissions, ...ids])]);
  }

  const meta = GROUP_META[currentTab] ?? { icon: "•", color: "text-foreground", activeCls: "border-primary text-primary bg-primary/5", badgeCls: "bg-primary/10 text-primary" };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-white">
        <div>
          <div className="text-[13px] font-semibold">Phạm vi tài khoản</div>
          <div className="text-[11.5px] text-muted-foreground mt-0.5">
            Chọn chức năng được phép truy cập theo từng phân hệ
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDefault ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 font-medium">
              Mặc định theo vai trò
            </span>
          ) : (
            <>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 font-medium">
                Đã tùy chỉnh
              </span>
              <button
                onClick={reset}
                className="h-7 px-2.5 rounded-lg border border-border text-[11.5px] flex items-center gap-1 hover:bg-muted text-muted-foreground"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
        {visibleGroups.map(group => {
          const gPerms = ALL_PERMS.filter(p => p.group === group);
          const gChecked = gPerms.filter(p => permissions.includes(p.id)).length;
          const gMeta = GROUP_META[group] ?? { icon: "•", activeCls: "border-primary text-primary bg-white", badgeCls: "bg-primary/10 text-primary" };
          const isActive = group === currentTab;
          return (
            <button
              key={group}
              onClick={() => setActiveTab(group)}
              className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? `${gMeta.activeCls} border-b-2`
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{gMeta.icon}</span>
              <span>{group}</span>
              <span className={`text-[10.5px] px-1.5 py-0.5 rounded-full font-semibold ${isActive ? gMeta.badgeCls : "bg-muted text-muted-foreground"}`}>
                {gChecked}/{gPerms.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {/* Select-all row */}
        <button
          onClick={toggleTabGroup}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-3 border transition-colors ${
            tabAllChecked ? "bg-primary/5 border-primary/20" : tabSomeChecked ? "bg-primary/5 border-primary/10" : "border-border hover:bg-muted/50"
          }`}
        >
          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
            tabAllChecked ? "bg-primary border-primary" : tabSomeChecked ? "bg-primary/30 border-primary/50" : "border-border"
          }`}>
            {tabAllChecked && <Check className="w-2.5 h-2.5 text-white" />}
            {tabSomeChecked && <div className="w-2 h-0.5 bg-primary rounded" />}
          </div>
          <span className="text-[12.5px] font-semibold text-foreground">
            {tabAllChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"} chức năng {meta.icon} {currentTab}
          </span>
          <span className="ml-auto text-[11.5px] text-muted-foreground">{tabChecked}/{tabPerms.length} đã chọn</span>
        </button>

        {/* Permission list */}
        <div className="space-y-1">
          {tabPerms.map(p => (
            <label
              key={p.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                permissions.includes(p.id) ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-muted/40"
              }`}
            >
              <div
                onClick={() => toggle(p.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                  permissions.includes(p.id) ? "bg-primary border-primary" : "border-border hover:border-primary/50"
                }`}
              >
                {permissions.includes(p.id) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-[13px] text-foreground/90">{p.label}</span>
              {permissions.includes(p.id) && (
                <span className="ml-auto w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-none stroke-white stroke-2"><polyline points="1.5,6 4.5,9 10.5,3"/></svg>
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function NhanVienPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = !currentUser?.enterpriseId;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [lockTarget, setLockTarget] = useState<Employee | null>(null);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
  const [resetDonePassword, setResetDonePassword] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<EForm>(() => ({
    ...EMPTY_E,
    enterpriseId: currentUser?.enterpriseId ?? null,
  }));
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [showPwdInDrawer, setShowPwdInDrawer] = useState(false);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });
  const statsQ = useQuery({ queryKey: ["employees-stats"], queryFn: fetchEmployeeStats });
  const dnQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const facQ = useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities });
  const treeQ = useQuery({ queryKey: ["admin-tree"], queryFn: fetchAdminTree });

  const empFacilityMap = useMemo<Record<number, Facility[]>>(() => {
    if (!treeQ.data || !facQ.data) return {};
    const facilityById: Record<number, Facility> = {};
    for (const f of facQ.data.items) facilityById[f.id] = f;
    const map: Record<number, Facility[]> = {};
    for (const dn of treeQ.data.tree) {
      for (const f of dn.facilities) {
        for (const u of f.users) {
          if (!map[u.id]) map[u.id] = [];
          const fac = facilityById[f.id];
          if (fac) map[u.id].push(fac);
        }
      }
    }
    return map;
  }, [treeQ.data, facQ.data]);

  const facilities = facQ.data?.items ?? [];
  const facilitiesForEnt = form.enterpriseId
    ? facilities.filter(f => f.enterpriseId === form.enterpriseId)
    : facilities;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["employees-stats"] });
  }

  const createMu = useMutation({
    mutationFn: async (body: EForm) => {
      const result = await createEmployee({
        ...body,
        matKhau: body.matKhau || undefined,
        status: "active",
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        lastSeen: "Chưa đăng nhập",
      });
      if (body.facilityIds.length > 0) {
        await setEmployeeFacilities(result.item.id, body.facilityIds);
      }
      return result;
    },
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ["admin-tree"] }); closeDrawer(); },
    onError: (e: Error) => setSubmitErr(e.message),
  });

  const updateMu = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: EForm }) => {
      const result = await updateEmployee(id, body);
      await setEmployeeFacilities(id, body.facilityIds);
      return result;
    },
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ["admin-tree"] }); closeDrawer(); },
    onError: (e: Error) => setSubmitErr(e.message),
  });

  const lockMu = useMutation({
    mutationFn: (id: number) => updateEmployee(id, { status: "locked" }),
    onSuccess: () => { invalidate(); setLockTarget(null); },
    onError: (e: Error) => alert("Lỗi cập nhật trạng thái: " + e.message),
  });

  const resetMu = useMutation({
    mutationFn: (id: number) => resetEmployeePassword(id),
    onSuccess: (data) => { setResetTarget(null); setResetDonePassword(data.defaultPassword); },
    onError: (e: Error) => alert("Lỗi đặt lại mật khẩu: " + e.message),
  });

  function closeDrawer() {
    setDrawerOpen(false);
    setEditItem(null);
    setForm({ ...EMPTY_E, enterpriseId: currentUser?.enterpriseId ?? null });
    setSubmitErr(null);
  }

  function openEdit(u: Employee) {
    if (!roles.includes(u.role)) setRoles(r => [...r, u.role]);
    setEditItem(u);
    setForm({
      name: u.name, email: u.email, phone: u.phone,
      enterpriseId: u.enterpriseId,
      role: u.role,
      permissions: presetFor(u.role),
      avatarUrl: u.avatarUrl ?? null,
      facilityIds: [],
    });
    setSubmitErr(null);
    setDrawerOpen(true);
    fetch(`${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}/api/employees/${u.id}/facilities`)
      .then(r => r.json())
      .then((d: { facilityIds: number[] }) => setForm(p => ({ ...p, facilityIds: d.facilityIds ?? [] })))
      .catch(() => {});
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setF("avatarUrl", ev.target?.result as string ?? null);
    };
    reader.readAsDataURL(file);
  }

  function setF<K extends keyof EForm>(k: K, v: EForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

  function getGroupsForDN(eid: number | null): string[] | null {
    if (!eid) return null;
    const dn = (dnQ.data?.items ?? []).find(d => d.id === eid);
    if (!dn) return null;
    return dn.modules.map(m => MODULE_TO_GROUP[m]).filter(Boolean);
  }

  function filterPermsToGroups(perms: string[], groups: string[] | null): string[] {
    if (!groups) return perms;
    return perms.filter(id => {
      const p = ALL_PERMS.find(pp => pp.id === id);
      return p && groups.includes(p.group);
    });
  }

  function setEnterprise(eid: number | null) {
    const groups = getGroupsForDN(eid);
    setForm(p => ({
      ...p,
      enterpriseId: eid,
      permissions: filterPermsToGroups(p.permissions, groups),
    }));
  }

  function setRole(r: string) {
    setForm(p => {
      const groups = getGroupsForDN(p.enterpriseId);
      const preset = filterPermsToGroups(presetFor(r), groups);
      return { ...p, role: r, permissions: preset };
    });
  }

  const selectedDN = form.enterpriseId
    ? (dnQ.data?.items ?? []).find(d => d.id === form.enterpriseId) ?? null
    : null;
  const activeGroups: string[] | null = selectedDN
    ? selectedDN.modules.map(m => MODULE_TO_GROUP[m]).filter(Boolean)
    : null;

  const isPending = createMu.isPending || updateMu.isPending;

  const items = (listQ.data?.items ?? []).filter(u =>
    isSuperAdmin ? true : u.enterpriseId === currentUser?.enterpriseId
  );
  const filtered = search.trim()
    ? items.filter((u) =>
        [u.name, u.email, u.phone].some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  function handleSubmit() {
    setSubmitErr(null);
    if (!form.name.trim()) { setSubmitErr("Vui lòng nhập họ và tên."); return; }
    if (editItem) {
      updateMu.mutate({ id: editItem.id, body: form });
    } else {
      createMu.mutate(form);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Người dùng</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Quản lý Nhân viên</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Tổng nhân viên" value={String(statsQ.data?.total ?? "—")} delta="Dữ liệu thực tế" tone="emerald" icon={Users} />
          <Stat label="Đang hoạt động" value={String(statsQ.data?.active ?? "—")} delta={statsQ.data ? `${Math.round(((statsQ.data.active || 0) / Math.max(statsQ.data.total, 1)) * 100)}% tổng` : ""} tone="blue" icon={Shield} />
          <Stat label="Tạm khóa" value={String(statsQ.data?.locked ?? "—")} delta="" tone="rose" icon={X} />
        </div>

        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <SelectChip label="Doanh nghiệp" />
          <SelectChip label="Vai trò" />
          <SelectChip label="Trạng thái" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Filter className="w-4 h-4" /> Bộ lọc
          </button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Thêm nhân viên
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-primary" /></th>
                  <th className="px-3 py-3">Nhân viên</th>
                  <th className="px-3 py-3">Liên hệ</th>
                  <th className="px-3 py-3">Doanh nghiệp</th>
                  <th className="px-3 py-3">Cơ sở phụ trách</th>
                  <th className="px-3 py-3">Phân hệ</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Hoạt động cuối</th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</td></tr>
                )}
                {listQ.isError && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-rose-600">Lỗi: {(listQ.error as Error).message}</td></tr>
                )}
                {!listQ.isLoading && !listQ.isError && filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">{search ? "Không tìm thấy nhân viên phù hợp." : "Chưa có nhân viên nào."}</td></tr>
                )}
                {filtered.map((u, i) => {
                  return (
                  <tr key={u.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3"><input type="checkbox" className="accent-primary" /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center flex-shrink-0 ${u.avatarColor}`}>{getInitials(u.name)}</div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">{u.name}</div>
                          <div className="text-[11.5px] text-muted-foreground">ID: USR-{1000 + u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[13px] text-foreground"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{u.email || "—"}</div>
                      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground mt-0.5"><Phone className="w-3 h-3" />{u.phone || "—"}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ${colorFor(i)}`}>{u.enterpriseName ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3">
                      {empFacilityMap[u.id]?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {empFacilityMap[u.id].map(f => (
                            <span key={f.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium">
                              <Factory className="w-2.5 h-2.5" />{f.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-muted-foreground italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${roleClr(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${STATUS[u.status].cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS[u.status].dot}`} />
                        {STATUS[u.status].text}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-muted-foreground">{u.lastSeen}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Sửa"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setResetTarget(u)} className="p-1.5 rounded hover:bg-amber-50 text-muted-foreground hover:text-amber-600" title="Đặt lại mật khẩu"><RotateCcw className="w-4 h-4" /></button>
                        <button onClick={() => setLockTarget(u)} className="p-1.5 rounded hover:bg-amber-50 text-muted-foreground hover:text-amber-600" title="Ngừng hoạt động"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            <div>Hiển thị {filtered.length} / {items.length} nhân viên</div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowLeft className="w-4 h-4" /></button>
              {[1, 2, 3, "…", 21].map((p, i) => (
                <button key={i} className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "bg-primary text-primary-foreground font-semibold" : "border border-border hover:bg-muted"}`}>{p}</button>
              ))}
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Lock confirmation */}
      {lockTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-center mb-1">Ngừng hoạt động tài khoản?</h3>
            <p className="text-[13.5px] text-muted-foreground text-center mb-6">
              Tài khoản <span className="font-semibold text-foreground">{lockTarget.name}</span> sẽ bị khóa và không thể đăng nhập vào hệ thống.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setLockTarget(null)} className="flex-1 h-11 rounded-xl border border-border font-medium text-[14px] hover:bg-muted">Hủy</button>
              <button
                disabled={lockMu.isPending}
                onClick={() => lockMu.mutate(lockTarget.id)}
                className="flex-1 h-11 rounded-xl bg-amber-500 text-white font-semibold text-[14px] hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {lockMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận ngừng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password confirm */}
      {resetTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-center mb-1">Đặt lại mật khẩu?</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">
              Đặt lại mật khẩu của <span className="font-semibold text-foreground">{resetTarget.name}</span> về mật khẩu mặc định.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResetTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">Hủy</button>
              <button
                disabled={resetMu.isPending}
                onClick={() => resetMu.mutate(resetTarget.id)}
                className="flex-1 h-10 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password success */}
      {resetDonePassword && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-center mb-2">Đặt lại thành công!</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-3">Mật khẩu mặc định mới:</p>
            <div className="bg-muted rounded-lg px-4 py-3 text-center font-mono font-semibold text-[16px] tracking-wider mb-5 select-all">
              {resetDonePassword}
            </div>
            <p className="text-[12px] text-muted-foreground text-center mb-5">Vui lòng thông báo cho nhân viên và yêu cầu đổi mật khẩu sau khi đăng nhập.</p>
            <button onClick={() => setResetDonePassword(null)} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110">Đóng</button>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeDrawer} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">{editItem ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}</div>
                <div className="text-[12.5px] text-muted-foreground">{editItem ? "Cập nhật thông tin nhân viên." : "Tạo tài khoản và gửi lời mời qua email."}</div>
              </div>
              <button onClick={closeDrawer} className="p-1.5 rounded hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              {/* Avatar */}
              <div>
                <Label>Ảnh đại diện</Label>
                <div className="flex items-center gap-4">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="avatar"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-[18px] font-semibold flex items-center justify-center">
                      {form.name ? getInitials(form.name) : "NV"}
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted"
                    >
                      <Upload className="w-4 h-4" /> Tải ảnh lên
                    </button>
                    {form.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setF("avatarUrl", null)}
                        className="h-7 px-2.5 rounded-lg text-[12px] text-muted-foreground hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Xóa ảnh
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Field label="Họ và tên" required placeholder="Nguyễn Văn A" value={form.name} onChange={(v) => setF("name", v)} />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại" placeholder="09xx xxx xxx" value={form.phone} onChange={(v) => setF("phone", v)} />
                <Field label="Email" placeholder="ten@congty.vn" value={form.email} onChange={(v) => setF("email", v)} />
              </div>

              {/* Doanh nghiệp — chỉ Super Admin mới thấy */}
              {isSuperAdmin && (
                <div>
                  <Label>Doanh nghiệp</Label>
                  <select
                    value={form.enterpriseId ?? ""}
                    onChange={(e) => setEnterprise(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                  >
                    <option value="">-- Không gắn doanh nghiệp --</option>
                    {(dnQ.data?.items ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.tenHienThi}
                        {d.modules.length > 0 ? ` (${d.modules.join(", ")})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cơ sở phụ trách */}
              {facilitiesForEnt.length > 0 && (
                <div>
                  <Label>Cơ sở phụ trách (Operator)</Label>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-3 py-2 bg-muted/40 border-b border-border text-[11.5px] text-muted-foreground">
                      {form.facilityIds.length === 0
                        ? "Chưa gán cơ sở (tài khoản cấp doanh nghiệp)"
                        : `Đã chọn ${form.facilityIds.length} cơ sở`}
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y divide-border">
                      {facilitiesForEnt.map(f => {
                        const checked = form.facilityIds.includes(f.id);
                        return (
                          <label key={f.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40">
                            <div
                              onClick={() => setF("facilityIds", checked
                                ? form.facilityIds.filter(id => id !== f.id)
                                : [...form.facilityIds, f.id]
                              )}
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                                checked ? "bg-primary border-primary" : "border-border hover:border-primary/50"
                              }`}
                            >
                              {checked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                                <Factory className="w-3.5 h-3.5 text-muted-foreground" />{f.name}
                              </div>
                              {f.address && <div className="text-[11px] text-muted-foreground truncate">{f.address}</div>}
                            </div>
                            {f.code && <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{f.code}</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-1">
                    Không chọn cơ sở = tài khoản quản lý cấp doanh nghiệp (Admin/Manager).
                  </p>
                </div>
              )}

              {/* Vai trò – searchable combobox */}
              <div>
                <Label>Vai trò</Label>
                <RoleCombobox
                  value={form.role}
                  onChange={setRole}
                  roles={roles}
                  onAddRole={(r) => setRoles(prev => [...prev, r])}
                />
              </div>

              {/* Permission matrix */}
              <PermissionMatrix
                permissions={form.permissions}
                onChange={(p) => setF("permissions", p)}
                role={form.role}
                activeGroups={activeGroups}
              />

              {/* Password field */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[13px] font-medium text-foreground/80">
                    {editItem ? "Đổi mật khẩu" : "Mật khẩu đăng nhập"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPwdInDrawer ? "text" : "password"}
                    value={form.matKhau}
                    onChange={(e) => setF("matKhau", e.target.value)}
                    placeholder={editItem ? "Để trống nếu không đổi mật khẩu" : "Để trống → dùng mặc định: esgvalley@2025"}
                    className="w-full h-10 pl-3 pr-10 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button type="button" onClick={() => setShowPwdInDrawer(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwdInDrawer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11.5px] text-muted-foreground mt-1">
                  {editItem ? "Nhập mật khẩu mới để thay đổi. Để trống = giữ nguyên mật khẩu cũ." : "Để trống sẽ dùng mặc định."}
                </div>
              </div>

              {submitErr && (
                <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">{submitErr}</div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              <button onClick={closeDrawer} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
              <button
                disabled={isPending}
                onClick={handleSubmit}
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Lưu thay đổi" : "Tạo tài khoản"}
              </button>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
