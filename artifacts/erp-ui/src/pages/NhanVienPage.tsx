import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, X, Upload,
  Users, Mail, Phone, ArrowLeft, ArrowRight,
  Shield, Pencil, Loader2, ChevronDown, Check, RotateCcw, Factory,
  Eye, EyeOff, KeyRound, ExternalLink,
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

/* ─── Module info ────────────────────────────────────────────────── */
const MODULE_DEFS: { key: "ERP" | "TXNG" | "VT"; name: string; desc: string; color: "emerald" | "blue" | "amber" }[] = [
  { key: "ERP",  name: "ERP",          desc: "Quản trị nguồn lực doanh nghiệp: thu mua, sản xuất, đóng gói, bán hàng.", color: "emerald" },
  { key: "TXNG", name: "TXNG",         desc: "Truy xuất nguồn gốc sản phẩm theo từng lô, mã QR.",                       color: "blue"    },
  { key: "VT",   name: "Vùng trồng",   desc: "Quản lý vùng nguyên liệu, hộ liên kết, bản đồ canh tác.",                 color: "amber"   },
];

/* ─── Form type ─────────────────────────────────────────────────── */
type EForm = {
  name: string;
  email: string;
  phone: string;
  enterpriseId: number | null;
  role: string;
  modules: ("ERP" | "TXNG" | "VT")[];
  avatarUrl: string | null;
  facilityIds: number[];
  matKhau: string;
};
const EMPTY_E: EForm = {
  name: "", email: "", phone: "", enterpriseId: null,
  role: "Nhân viên", modules: [], avatarUrl: null,
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

/* ─── ModuleToggle ───────────────────────────────────────────────── */
function ModuleToggle({ name, desc, checked, onChange, color }: {
  name: string; desc: string; checked: boolean; onChange: (v: boolean) => void; color: "emerald" | "blue" | "amber";
}) {
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "🏭", border: checked ? "border-emerald-300 bg-emerald-50/30" : "border-border" },
    blue:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "🔍", border: checked ? "border-blue-300 bg-blue-50/30"    : "border-border" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "🌱", border: checked ? "border-amber-300 bg-amber-50/30"  : "border-border" },
  }[color];
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 transition ${tones.border}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${tones.bg}`}>
        {tones.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-foreground">{name}</div>
        <div className="text-[12.5px] text-muted-foreground leading-snug">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function toggleMod(arr: ("ERP" | "TXNG" | "VT")[], m: "ERP" | "TXNG" | "VT", on: boolean): ("ERP" | "TXNG" | "VT")[] {
  return on ? Array.from(new Set([...arr, m])) : arr.filter(x => x !== m);
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function NhanVienPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = !currentUser?.enterpriseId;

  const [, setLocation] = useLocation();
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
      modules: (u as Employee & { modules?: ("ERP" | "TXNG" | "VT")[] }).modules ?? [],
      avatarUrl: u.avatarUrl ?? null,
      facilityIds: [],
      matKhau: "",
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

  function setEnterprise(eid: number | null) {
    setForm(p => ({ ...p, enterpriseId: eid }));
  }

  function setRole(r: string) {
    setForm(p => ({ ...p, role: r }));
  }

  const selectedDN = form.enterpriseId
    ? (dnQ.data?.items ?? []).find(d => d.id === form.enterpriseId) ?? null
    : null;
  const availableModules = selectedDN ? selectedDN.modules : (["ERP", "TXNG", "VT"] as ("ERP" | "TXNG" | "VT")[]);

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
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">{t("nv.page-title")}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label={t("nv.stat.total")} value={String(statsQ.data?.total ?? "—")} delta={t("common.real-data")} tone="emerald" icon={Users} />
          <Stat label={t("nv.stat.active")} value={String(statsQ.data?.active ?? "—")} delta={statsQ.data ? `${Math.round(((statsQ.data.active || 0) / Math.max(statsQ.data.total, 1)) * 100)}% tổng` : ""} tone="blue" icon={Shield} />
          <Stat label={t("nv.stat.locked")} value={String(statsQ.data?.locked ?? "—")} delta="" tone="rose" icon={X} />
        </div>

        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("nv.search-placeholder")}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <SelectChip label={t("common.col.enterprise")} />
          <SelectChip label={t("nv.col.role")} />
          <SelectChip label={t("common.col.status")} />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Filter className="w-4 h-4" /> {t("common.filter")}
          </button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Download className="w-4 h-4" /> {t("common.export-excel")}
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> {t("nv.add")}
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-primary" /></th>
                  <th className="px-3 py-3">{t("nv.col.employee")}</th>
                  <th className="px-3 py-3">{t("nv.col.contact")}</th>
                  <th className="px-3 py-3">{t("common.col.enterprise")}</th>
                  <th className="px-3 py-3">{t("nv.col.facility")}</th>
                  <th className="px-3 py-3">{t("common.col.module")}</th>
                  <th className="px-3 py-3">{t("common.col.status")}</th>
                  <th className="px-3 py-3">{t("nv.col.last-active")}</th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />{t("common.loading")}</td></tr>
                )}
                {listQ.isError && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-rose-600">Lỗi: {(listQ.error as Error).message}</td></tr>
                )}
                {!listQ.isLoading && !listQ.isError && filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">{search ? t("nv.not-found") : t("nv.empty")}</td></tr>
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
                        <span className="text-[12px] text-muted-foreground italic">{t("nv.not-assigned")}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium ring-1 ring-inset ${roleClr(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${STATUS[u.status].cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS[u.status].dot}`} />
                        {u.status === "active" ? t("common.status.active") : u.status === "locked" ? t("common.status.locked") : t("common.status.pending")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-muted-foreground">{u.lastSeen}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button onClick={() => setLocation(`/portal/nguoi-dung/${u.id}`)} className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-600" title="Xem chi tiết"><ExternalLink className="w-4 h-4" /></button>
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
            <h3 className="text-[17px] font-semibold text-center mb-1">{t("nv.lock-title")}</h3>
            <p className="text-[13.5px] text-muted-foreground text-center mb-6">
              {t("nv.lock-desc").replace("{name}", lockTarget.name)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setLockTarget(null)} className="flex-1 h-11 rounded-xl border border-border font-medium text-[14px] hover:bg-muted">{t("common.cancel")}</button>
              <button
                disabled={lockMu.isPending}
                onClick={() => lockMu.mutate(lockTarget.id)}
                className="flex-1 h-11 rounded-xl bg-amber-500 text-white font-semibold text-[14px] hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {lockMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("nv.lock-account")}
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
            <h3 className="text-[17px] font-semibold text-center mb-1">{t("nv.reset-title")}</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">
              {t("nv.reset-desc").replace("{name}", resetTarget.name)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResetTarget(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted">{t("common.cancel")}</button>
              <button
                disabled={resetMu.isPending}
                onClick={() => resetMu.mutate(resetTarget.id)}
                className="flex-1 h-10 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("common.confirm")}
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
            <h3 className="text-[17px] font-semibold text-center mb-2">{t("nv.reset-success")}</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-3">{t("nv.reset-new-pw")}</p>
            <div className="bg-muted rounded-lg px-4 py-3 text-center font-mono font-semibold text-[16px] tracking-wider mb-5 select-all">
              {resetDonePassword}
            </div>
            <p className="text-[12px] text-muted-foreground text-center mb-5">{t("nv.reset-notify")}</p>
            <button onClick={() => setResetDonePassword(null)} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110">{t("common.close")}</button>
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
                <div className="text-[18px] font-semibold">{editItem ? t("nv.edit-title") : t("nv.add-title")}</div>
                <div className="text-[12.5px] text-muted-foreground">{editItem ? t("nv.edit-subtitle") : t("nv.add-subtitle")}</div>
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

              {/* Module toggles */}
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">Bật tắt phân hệ</label>
                <div className="space-y-2">
                  {MODULE_DEFS.filter(m => availableModules.includes(m.key)).map(m => (
                    <ModuleToggle
                      key={m.key}
                      name={m.name}
                      desc={m.desc}
                      color={m.color}
                      checked={form.modules.includes(m.key)}
                      onChange={(v) => setF("modules", toggleMod(form.modules, m.key, v))}
                    />
                  ))}
                  {availableModules.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-[13px] text-muted-foreground">
                      Doanh nghiệp này chưa đăng ký phân hệ nào.
                    </div>
                  )}
                </div>
              </div>

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
