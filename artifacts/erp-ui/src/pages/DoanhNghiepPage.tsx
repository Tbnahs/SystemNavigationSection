import { useState, useRef } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, ChevronDown, X, Upload,
  Building2, Users, Package, Sprout, Leaf, Bell, KeyRound, Copy, CheckCheck,
  Pencil, Eye, EyeOff, MapPin, ArrowLeft, ArrowRight, LayoutGrid, Loader2,
  Globe, Video, Image, BookOpen, Barcode, AtSign, ShieldCheck, Trash2,
} from "lucide-react";
import {
  fetchEnterprises, fetchEnterpriseStats, createEnterprise,
  updateEnterprise, deleteEnterprise,
  type Enterprise,
} from "@/lib/api";
import { PROVINCES_VN, COMMUNE_MAP } from "@/lib/vietnam-data";

const STATUS_BADGE: Record<Enterprise["status"], { text: string; cls: string }> = {
  active: { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  pending: { text: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  locked: { text: "Tạm khóa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

const MODULE_INFO = {
  ERP: { label: "ERP", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  TXNG: { label: "TXNG", color: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  VT: { label: "Vùng trồng", color: "bg-amber-50 text-amber-700 ring-amber-600/20" },
} as const;

type FormState = {
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
  logoUrl: string | null;
  matKhau: string;
  gcp: string;
  gln: string;
  website: string;
  videoUrl: string;
  chungChiUrls: string[];
  cauChuyen: string;
};

const EMPTY_FORM: FormState = {
  mst: "", ten: "", tenHienThi: "", tenDangNhap: "", daiDien: "", sdt: "", email: "",
  diaChi: "", tinh: "Thái Nguyên", xa: "",
  modules: ["ERP", "TXNG"],
  logoUrl: null,
  matKhau: "",
  gcp: "", gln: "",
  website: "", videoUrl: "", chungChiUrls: [], cauChuyen: "",
};

const LOGO_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

type ChungChiItem = {
  id: number;
  loai: string;
  ten: string;
  coQuan: string;
  soChungChi: string;
  ngayCap: string;
  ngayHetHan: string;
  imageUrl: string;
};

const LOAI_CHUNG_CHI_OPTIONS = [
  "VietGAP", "GlobalGAP", "Organic", "HACCP", "ISO 22000",
  "FDA", "Halal", "OCOP", "Khác",
];

const EMPTY_CC: ChungChiItem = {
  id: 0, loai: "VietGAP", ten: "", coQuan: "",
  soChungChi: "", ngayCap: "", ngayHetHan: "", imageUrl: "",
};

function parseDNChungChis(dn: Enterprise): ChungChiItem[] {
  const raw = dn.chungChiUrls;
  if (!raw || raw.length === 0) return [];
  if (raw.length === 1) {
    try { return JSON.parse(raw[0]) as ChungChiItem[]; } catch {}
  }
  return raw.filter(Boolean).map((url, i) => ({
    id: i + 1, loai: "Khác", ten: "", coQuan: "",
    soChungChi: "", ngayCap: "", ngayHetHan: "", imageUrl: url,
  }));
}

function fmtDateCC(s: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

export default function DoanhNghiepPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = !currentUser?.enterpriseId;
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Enterprise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enterprise | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "location" | "modules" | "quangba">("general");
  const [search, setSearch] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [showPwdInDrawer, setShowPwdInDrawer] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string; name: string } | null>(null);
  const [chungChis, setChungChis] = useState<ChungChiItem[]>([]);
  const [showCCForm, setShowCCForm] = useState(false);
  const [ccForm, setCcForm] = useState<ChungChiItem>(EMPTY_CC);
  const [editCCIdx, setEditCCIdx] = useState<number | null>(null);
  const ccFileRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["enterprises"], queryFn: fetchEnterprises });
  const statsQ = useQuery({ queryKey: ["enterprises-stats"], queryFn: fetchEnterpriseStats });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["enterprises"] });
    qc.invalidateQueries({ queryKey: ["enterprises-stats"] });
  }

  const createMu = useMutation({
    mutationFn: (body: FormState) =>
      createEnterprise({
        ...body,
        status: "active",
        logoColor: LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)],
        logoUrl: body.logoUrl ?? null,
        matKhau: body.matKhau || undefined,
      }),
    onSuccess: (data, vars) => {
      invalidate();
      closeDrawer();
      setCreatedCreds({
        email: data.item.email,
        password: vars.matKhau || "esgvalley@2025",
        name: data.adminUser?.name || data.item.daiDien || data.item.tenHienThi,
      });
    },
    onError: (e: Error) => setSubmitErr(e.message),
  });

  const updateMu = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormState }) => updateEnterprise(id, body),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["enterprise", editItem?.id] });
      closeDrawer();
    },
    onError: (e: Error) => setSubmitErr(e.message),
  });

  const deleteMu = useMutation({
    mutationFn: (id: number) => deleteEnterprise(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
    onError: (e: Error) => alert("Lỗi xóa: " + e.message),
  });

  function closeDrawer() {
    setDrawerOpen(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
    setActiveTab("general" as const);
    setSubmitErr(null);
    setChungChis([]);
    setShowCCForm(false);
    setCcForm(EMPTY_CC);
    setEditCCIdx(null);
  }

  function openEdit(dn: Enterprise) {
    setEditItem(dn);
    setForm({
      mst: dn.mst, ten: dn.ten, tenHienThi: dn.tenHienThi,
      tenDangNhap: dn.tenDangNhap ?? "",
      daiDien: dn.daiDien, sdt: dn.sdt, email: dn.email,
      diaChi: dn.diaChi, tinh: dn.tinh, xa: dn.xa,
      modules: dn.modules,
      logoUrl: dn.logoUrl ?? null,
      matKhau: "",
      gcp: dn.gcp ?? "", gln: dn.gln ?? "",
      website: dn.website ?? "", videoUrl: dn.videoUrl ?? "",
      chungChiUrls: [], cauChuyen: dn.cauChuyen ?? "",
    });
    setChungChis(parseDNChungChis(dn));
    setShowCCForm(false);
    setCcForm(EMPTY_CC);
    setEditCCIdx(null);
    setActiveTab("general");
    setSubmitErr(null);
    setDrawerOpen(true);
  }

  const fileLogoRef = useRef<HTMLInputElement>(null);
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setF("logoUrl", (ev.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }

  const isPending = createMu.isPending || updateMu.isPending;

  const items = (listQ.data?.items ?? []).filter(d =>
    isSuperAdmin ? true : d.id === currentUser?.enterpriseId
  );
  const provinces = Array.from(new Set(items.map(d => d.tinhThanh).filter(Boolean))) as string[];

  const filtered = items.filter((d) => {
    if (search.trim() && !([d.mst, d.ten, d.tenHienThi, d.daiDien].some(s => s.toLowerCase().includes(search.toLowerCase())))) return false;
    if (filterProvince && d.tinhThanh !== filterProvince) return false;
    if (filterModule && !d.modules.includes(filterModule as "ERP" | "TXNG" | "VT")) return false;
    if (filterStatus && d.status !== filterStatus) return false;
    return true;
  });

  function setF<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit() {
    setSubmitErr(null);
    if (!form.mst.trim() || !form.ten.trim() || !form.tenHienThi.trim()) {
      setActiveTab("general");
      setSubmitErr("Vui lòng nhập đủ Mã số thuế, Tên doanh nghiệp và Tên hiển thị.");
      return;
    }
    if (!form.tenDangNhap.trim()) {
      setActiveTab("general");
      setSubmitErr("Tên đăng nhập là bắt buộc.");
      return;
    }
    if (!form.email.trim()) {
      setActiveTab("general");
      setSubmitErr("Email doanh nghiệp là bắt buộc để tạo tài khoản đăng nhập.");
      return;
    }
    const ccPayload = chungChis.length > 0 ? [JSON.stringify(chungChis)] : [];
    if (editItem) {
      updateMu.mutate({ id: editItem.id, body: { ...form, chungChiUrls: ccPayload } });
    } else {
      createMu.mutate({ ...form, chungChiUrls: ccPayload });
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Doanh nghiệp</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">{t("dn.page-title")}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label={t("dn.stat.total")} value={String(statsQ.data?.total ?? "—")} delta={t("common.real-data")} tone="emerald" icon={Building2} />
          <Stat label={t("dn.stat.active")} value={String(statsQ.data?.active ?? "—")} delta={statsQ.data ? `${Math.round(((statsQ.data.active || 0) / Math.max(statsQ.data.total, 1)) * 100)}% tổng` : ""} tone="blue" icon={Users} />
          <Stat label={t("dn.stat.pending")} value={String(statsQ.data?.pending ?? "—")} delta={t("dn.stat.pending-note")} tone="amber" icon={Bell} />
          <Stat label={t("dn.stat.locked")} value={String(statsQ.data?.locked ?? "—")} delta="" tone="rose" icon={X} />
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dn.search-ph")}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
            className={`h-10 px-3 rounded-lg border text-sm outline-none cursor-pointer ${filterProvince ? "border-primary text-primary bg-primary/5 font-medium" : "border-border text-muted-foreground hover:bg-muted"}`}>
            <option value="">{t("common.province")}: Tất cả</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
            className={`h-10 px-3 rounded-lg border text-sm outline-none cursor-pointer ${filterModule ? "border-primary text-primary bg-primary/5 font-medium" : "border-border text-muted-foreground hover:bg-muted"}`}>
            <option value="">{t("common.col.module")}: Tất cả</option>
            <option value="ERP">ERP</option>
            <option value="TXNG">TXNG</option>
            <option value="VT">Vùng trồng</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className={`h-10 px-3 rounded-lg border text-sm outline-none cursor-pointer ${filterStatus ? "border-primary text-primary bg-primary/5 font-medium" : "border-border text-muted-foreground hover:bg-muted"}`}>
            <option value="">{t("common.col.status")}: Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="pending">Chờ kích hoạt</option>
            <option value="locked">Tạm khóa</option>
          </select>
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Filter className="w-4 h-4" /> {t("common.filter")}
          </button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
            <Download className="w-4 h-4" /> {t("common.export-excel")}
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-sm hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> {t("dn.add")}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-primary" /></th>
                  <th className="px-3 py-3">{t("common.col.enterprise")}</th>
                  <th className="px-3 py-3">{t("dn.col.account")}</th>
                  <th className="px-3 py-3">{t("dn.col.representative")}</th>
                  <th className="px-3 py-3">{t("common.col.module")}</th>
                  <th className="px-3 py-3">{t("common.col.status")}</th>
                  <th className="px-3 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />{t("common.loading")}</td></tr>
                )}
                {listQ.isError && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-rose-600">Lỗi tải dữ liệu: {(listQ.error as Error).message}</td></tr>
                )}
                {!listQ.isLoading && !listQ.isError && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{search ? t("dn.not-found") : t("dn.empty")}</td></tr>
                )}
                {filtered.map((dn) => (
                  <tr key={dn.id} className="border-t border-border hover:bg-emerald-50/30">
                    <td className="px-4 py-3"><input type="checkbox" className="accent-primary" /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {dn.logoUrl ? (
                          <img src={dn.logoUrl} alt={dn.tenHienThi} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-[13px] flex-shrink-0 ${dn.logoColor}`}>
                            {dn.tenHienThi.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">{dn.ten}</div>
                          <div className="text-[12px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dn.diaChi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-foreground">{dn.email || <span className="text-muted-foreground italic">Chưa có</span>}</td>
                    <td className="px-3 py-3">
                      <div className="text-foreground">{dn.daiDien}</div>
                      <div className="text-[12px] text-muted-foreground">{dn.sdt}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {dn.modules.map((m) => (
                          <span key={m} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${MODULE_INFO[m].color}`}>
                            {MODULE_INFO[m].label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${STATUS_BADGE[dn.status].cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
                        {dn.status === "active" ? t("common.status.active") : dn.status === "pending" ? t("common.status.pending") : t("common.status.locked")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button onClick={() => setLocation(`/portal/doanh-nghiep/${dn.id}`)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(dn)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Sửa"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(dn)} className="p-1.5 rounded hover:bg-rose-50 text-muted-foreground hover:text-rose-600" title="Xóa"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-[13px] text-muted-foreground">
            <div>{t("dn.showing").replace("{n}", String(filtered.length)).replace("{total}", String(items.length))}</div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowLeft className="w-4 h-4" /></button>
              {[1, 2, 3, "…", 8].map((p, i) => (
                <button key={i} className={`w-8 h-8 rounded-lg text-sm ${p === 1 ? "bg-primary text-primary-foreground font-semibold" : "border border-border hover:bg-muted"}`}>{p}</button>
              ))}
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials success modal */}
      {createdCreds && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-center mb-1">{t("dn.created")}</h3>
            <p className="text-[13px] text-muted-foreground text-center mb-5">
              Tài khoản Admin cho <span className="font-semibold text-foreground">{createdCreds.name}</span> đã sẵn sàng đăng nhập.
            </p>
            <div className="space-y-3 bg-muted/50 rounded-xl p-4 mb-5">
              <CredRow label="Email đăng nhập" value={createdCreds.email} />
              <CredRow label="Mật khẩu" value={createdCreds.password} secret />
            </div>
            <p className="text-[11.5px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4 text-center">
              Lưu thông tin này — mật khẩu sẽ không hiển thị lại sau khi đóng.
            </p>
            <button
              onClick={() => setCreatedCreds(null)}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px] hover:brightness-110"
            >
              {t("common.save-changes")}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-center mb-1">{t("dn.delete-confirm")}</h3>
            <p className="text-[13.5px] text-muted-foreground text-center mb-6">
              {t("dn.delete-desc").replace("{name}", deleteTarget.tenHienThi)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-11 rounded-xl border border-border font-medium text-[14px] hover:bg-muted"
              >
                {t("common.cancel")}
              </button>
              <button
                disabled={deleteMu.isPending}
                onClick={() => deleteMu.mutate(deleteTarget.id)}
                className="flex-1 h-11 rounded-xl bg-rose-600 text-white font-semibold text-[14px] hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("common.delete-permanent")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit DN Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeDrawer} />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[540px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-[18px] font-semibold">{editItem ? t("dn.edit-title") : t("dn.add-title")}</div>
                <div className="text-[12.5px] text-muted-foreground">{t("dn.drawer-subtitle")}</div>
              </div>
              <button onClick={closeDrawer} className="p-1.5 rounded hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 pt-4 border-b border-border">
              <div className="flex gap-1 overflow-x-auto">
                {[
                  { k: "general",  label: t("dn.section.profile"), n: 1 },
                  { k: "location", label: t("dn.section.location"), n: 2 },
                  { k: "modules",  label: t("dn.section.modules"), n: 3 },
                  { k: "quangba",  label: t("dn.section.promo"), n: 4 },
                ].map((tab) => (
                  <button
                    key={tab.k}
                    onClick={() => setActiveTab(tab.k as typeof activeTab)}
                    className={`px-3 py-2.5 text-[13px] font-medium border-b-2 -mb-px flex items-center gap-2 transition whitespace-nowrap ${activeTab === tab.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center shrink-0 ${activeTab === tab.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{tab.n}</span>
                    {tab.label}
                    {tab.k === "quangba" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-normal">{t("common.optional")}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <Label>Ảnh logo</Label>
                    <div className="flex items-center gap-4">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="logo"
                          className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
                          <Leaf className="w-8 h-8" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileLogoRef.current?.click()}
                          className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium flex items-center gap-2 hover:bg-muted"
                        >
                          <Upload className="w-4 h-4" /> Tải ảnh lên
                        </button>
                        {form.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setF("logoUrl", null)}
                            className="h-7 px-2.5 rounded-lg text-[12px] text-muted-foreground hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Xóa logo
                          </button>
                        )}
                        <div className="text-[11.5px] text-muted-foreground">PNG / JPG, tối đa 2MB. Khuyến nghị 512×512.</div>
                      </div>
                      <input
                        ref={fileLogoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Mã số thuế" required placeholder="46xxxxxxxx" value={form.mst} onChange={(v) => setF("mst", v)} />
                    <Field label="SĐT doanh nghiệp" placeholder="09xx xxx xxx" value={form.sdt} onChange={(v) => setF("sdt", v)} />
                  </div>
                  <Field label="Tên doanh nghiệp" required placeholder="Tên đầy đủ theo giấy phép kinh doanh" value={form.ten} onChange={(v) => setF("ten", v)} />
                  <Field label="Tên hiển thị" required placeholder="Tên ngắn dùng trong giao diện" hint="Tên ngắn hiển thị trong giao diện và truy xuất nguồn gốc." value={form.tenHienThi} onChange={(v) => setF("tenHienThi", v)} />

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Người đại diện" placeholder="Họ và tên" value={form.daiDien} onChange={(v) => setF("daiDien", v)} />
                    <Field label="Email" required placeholder="lienhe@congty.vn" value={form.email} onChange={(v) => setF("email", v)} />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <AtSign className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-medium text-foreground/80">Tên đăng nhập</span>
                      <span className="text-rose-500">*</span>
                    </div>
                    <input
                      value={form.tenDangNhap}
                      onChange={(e) => setF("tenDangNhap", e.target.value.replace(/\s/g, "").toLowerCase())}
                      placeholder="vd: chequanchu (không dấu, không khoảng trắng)"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <div className="text-[11.5px] text-muted-foreground mt-1">Dùng để đăng nhập thay cho email. Chỉ chứa chữ thường, số và dấu gạch dưới.</div>
                  </div>

                  {/* GS1 Info */}
                  <div className="rounded-xl border border-border bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Barcode className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[13px] font-semibold text-foreground">Thông tin GS1</span>
                      <span className="text-[11px] text-muted-foreground font-normal ml-1">(không bắt buộc)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[12.5px] font-medium mb-1 text-foreground/80">Mã đăng ký GCP</div>
                        <input
                          value={form.gcp}
                          onChange={(e) => setF("gcp", e.target.value)}
                          placeholder="vd: 8938500100"
                          className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm font-mono outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-medium mb-1 text-foreground/80">GLN doanh nghiệp</div>
                        <input
                          value={form.gln}
                          onChange={(e) => setF("gln", e.target.value)}
                          placeholder="vd: 8938500100001"
                          className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm font-mono outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">GCP (Global Company Prefix) và GLN (Global Location Number) do GS1 Việt Nam cấp.</div>
                  </div>

                  {!editItem && (
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[13px] font-medium text-foreground/80">Mật khẩu đăng nhập</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPwdInDrawer ? "text" : "password"}
                          value={form.matKhau}
                          onChange={(e) => setF("matKhau", e.target.value)}
                          placeholder="Để trống → dùng mặc định: esgvalley@2025"
                          className="w-full h-10 pl-3 pr-10 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                        <button type="button" onClick={() => setShowPwdInDrawer(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPwdInDrawer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="text-[11.5px] text-muted-foreground mt-1">Mật khẩu sẽ dùng để đăng nhập bằng email doanh nghiệp.</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ProvinceSelect value={form.tinh} onChange={(v) => { setF("tinh", v); setF("xa", ""); }} />
                    <CommuneSelect province={form.tinh} value={form.xa} onChange={(v) => setF("xa", v)} />
                  </div>
                  <Field label="Địa chỉ chi tiết" placeholder="Số nhà, đường, xóm…" value={form.diaChi} onChange={(v) => setF("diaChi", v)} />
                  {(() => {
                    const q = [form.diaChi, form.xa, form.tinh].filter(Boolean).join(", ");
                    return q ? (
                      <div className="rounded-xl border border-border overflow-hidden h-44">
                        <iframe
                          key={q}
                          title="Bản đồ vị trí"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=14`}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/40 h-44 flex items-center justify-center text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mr-2" /> Nhập địa chỉ bên trên để xem bản đồ
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-3">
                  <div className="text-[13px] text-muted-foreground mb-1">Chọn các phân hệ doanh nghiệp được phép truy cập.</div>
                  <ModuleToggle name="ERP" desc="Quản trị nguồn lực doanh nghiệp: bán hàng, kho, kế toán, nhân sự…" icon={LayoutGrid} color="emerald" checked={form.modules.includes("ERP")} onChange={(v) => setF("modules", toggleModule(form.modules, "ERP", v))} />
                  <ModuleToggle name="TXNG" desc="Truy xuất nguồn gốc sản phẩm theo từng lô, mã QR." icon={Package} color="blue" checked={form.modules.includes("TXNG")} onChange={(v) => setF("modules", toggleModule(form.modules, "TXNG", v))} />
                  <ModuleToggle name="Vùng trồng" desc="Quản lý vùng nguyên liệu, hộ liên kết, bản đồ canh tác." icon={Sprout} color="amber" checked={form.modules.includes("VT")} onChange={(v) => setF("modules", toggleModule(form.modules, "VT", v))} />
                </div>
              )}

              {activeTab === "quangba" && (
                <div className="space-y-5">
                  <div className="text-[13px] text-muted-foreground">Thông tin quảng bá hiển thị trên trang giới thiệu doanh nghiệp và profile truy xuất nguồn gốc. Tất cả các trường đều không bắt buộc.</div>

                  {/* Website & Video */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[13px] font-medium text-foreground/80">Website</span>
                      </div>
                      <input
                        value={form.website}
                        onChange={(e) => setF("website", e.target.value)}
                        placeholder="https://chequanchu.vn"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Video className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[13px] font-medium text-foreground/80">URL Video giới thiệu</span>
                      </div>
                      <input
                        value={form.videoUrl}
                        onChange={(e) => setF("videoUrl", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  {/* Chứng chỉ / Chứng nhận */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[13px] font-medium text-foreground/80">Chứng chỉ / Chứng nhận</span>
                      </div>
                      {!showCCForm && (
                        <button
                          type="button"
                          onClick={() => { setCcForm({ ...EMPTY_CC, id: Date.now() }); setEditCCIdx(null); setShowCCForm(true); }}
                          className="text-[12px] text-primary font-medium flex items-center gap-1 hover:opacity-80"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm chứng chỉ
                        </button>
                      )}
                    </div>

                    {/* Inline add/edit form */}
                    {showCCForm && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-3">
                        <div className="flex gap-4">
                          {/* Left: image */}
                          <div className="shrink-0">
                            <div
                              className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-white flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition overflow-hidden relative"
                              onClick={() => ccFileRef.current?.click()}
                            >
                              {ccForm.imageUrl ? (
                                <img src={ccForm.imageUrl} alt="cert" className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <Image className="w-5 h-5 text-muted-foreground mb-1" />
                                  <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">No image available</span>
                                </>
                              )}
                            </div>
                            <input
                              ref={ccFileRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => setCcForm((p) => ({ ...p, imageUrl: (ev.target?.result as string) ?? "" }));
                                reader.readAsDataURL(file);
                                e.target.value = "";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => ccFileRef.current?.click()}
                              className="mt-1.5 w-24 h-7 rounded-lg bg-primary text-white text-[11px] font-medium hover:bg-primary/90 transition"
                            >
                              Tải ảnh
                            </button>
                          </div>
                          {/* Right: fields */}
                          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2.5">
                            <div className="col-span-2">
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Loại chứng chỉ</label>
                              <select
                                value={ccForm.loai}
                                onChange={(e) => setCcForm((p) => ({ ...p, loai: e.target.value }))}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary"
                              >
                                {LOAI_CHUNG_CHI_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Tên chứng chỉ</label>
                              <input
                                value={ccForm.ten}
                                onChange={(e) => setCcForm((p) => ({ ...p, ten: e.target.value }))}
                                placeholder="VD: VietGAP 2024"
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Cơ quan cấp</label>
                              <input
                                value={ccForm.coQuan}
                                onChange={(e) => setCcForm((p) => ({ ...p, coQuan: e.target.value }))}
                                placeholder="VD: Bộ NN&PTNT"
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Số chứng chỉ</label>
                              <input
                                value={ccForm.soChungChi}
                                onChange={(e) => setCcForm((p) => ({ ...p, soChungChi: e.target.value }))}
                                placeholder="VD: VG-2024-001"
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Ngày cấp</label>
                              <input
                                type="date"
                                value={ccForm.ngayCap}
                                onChange={(e) => setCcForm((p) => ({ ...p, ngayCap: e.target.value }))}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Ngày hết hạn</label>
                              <input
                                type="date"
                                value={ccForm.ngayHetHan}
                                onChange={(e) => setCcForm((p) => ({ ...p, ngayHetHan: e.target.value }))}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-white text-[13px] outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => { setShowCCForm(false); setEditCCIdx(null); setCcForm(EMPTY_CC); }}
                            className="h-8 px-4 rounded-lg border border-border bg-white text-[13px] font-medium hover:bg-muted/50 transition"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editCCIdx !== null) {
                                setChungChis((p) => p.map((c, i) => i === editCCIdx ? ccForm : c));
                              } else {
                                setChungChis((p) => [...p, { ...ccForm, id: Date.now() }]);
                              }
                              setShowCCForm(false);
                              setEditCCIdx(null);
                              setCcForm(EMPTY_CC);
                            }}
                            className="h-8 px-4 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition"
                          >
                            {editCCIdx !== null ? "Cập nhật" : "Thêm"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Certificate list */}
                    {chungChis.length === 0 && !showCCForm && (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
                        <ShieldCheck className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                        <div className="text-[12.5px] text-muted-foreground">Chưa có chứng chỉ. Nhấn "Thêm chứng chỉ" để bắt đầu.</div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {chungChis.map((cc, idx) => (
                        <div key={cc.id} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
                          <div className="w-14 h-14 rounded-lg border border-border bg-muted/30 shrink-0 overflow-hidden flex items-center justify-center">
                            {cc.imageUrl ? (
                              <img src={cc.imageUrl} alt={cc.ten} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <ShieldCheck className="w-5 h-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">{cc.loai}</span>
                              {cc.ten && <span className="text-[13px] font-medium truncate">{cc.ten}</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 text-[11.5px] text-muted-foreground">
                              {cc.coQuan && <span className="truncate">Cơ quan: {cc.coQuan}</span>}
                              {cc.soChungChi && <span className="truncate">Số: {cc.soChungChi}</span>}
                              {cc.ngayCap && <span>Ngày cấp: {fmtDateCC(cc.ngayCap)}</span>}
                              {cc.ngayHetHan && <span>Hết hạn: {fmtDateCC(cc.ngayHetHan)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => { setCcForm(cc); setEditCCIdx(idx); setShowCCForm(true); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setChungChis((p) => p.filter((_, i) => i !== idx))}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Câu chuyện thương hiệu */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-medium text-foreground/80">Câu chuyện thương hiệu</span>
                    </div>
                    <RichTextEditor
                      value={form.cauChuyen}
                      onChange={(val) => setF("cauChuyen", val)}
                      placeholder="Kể về lịch sử hình thành, vùng nguyên liệu, cam kết chất lượng của doanh nghiệp…"
                      minHeight={140}
                    />
                  </div>
                </div>
              )}

              {submitErr && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">
                  {submitErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
              <div className="text-[12.5px] text-muted-foreground">
                Bước <span className="font-semibold text-foreground">
                  {activeTab === "general" ? 1 : activeTab === "location" ? 2 : activeTab === "modules" ? 3 : 4}
                </span> / 4
              </div>
              <div className="flex items-center gap-2">
                <button onClick={closeDrawer} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
                {activeTab !== "general" && !editItem && (
                  <button
                    onClick={() => {
                      if (activeTab === "location") setActiveTab("general");
                      else if (activeTab === "modules") setActiveTab("location");
                      else if (activeTab === "quangba") setActiveTab("modules");
                    }}
                    className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
                )}
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (!editItem && activeTab === "general") setActiveTab("location");
                    else if (!editItem && activeTab === "location") setActiveTab("modules");
                    else if (!editItem && activeTab === "modules") setActiveTab("quangba");
                    else handleSubmit();
                  }}
                  className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? "Lưu thay đổi" : activeTab === "quangba" ? "Tạo doanh nghiệp" : <><span>Tiếp tục</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}

function Stat({ label, value, delta, tone, icon: Icon }: { label: string; value: string; delta: string; tone: "emerald" | "blue" | "amber" | "rose"; icon: React.ComponentType<{ className?: string }>; }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="bg-white border border-border rounded-xl p-4 flex items-start justify-between">
      <div>
        <div className="text-[12.5px] text-muted-foreground">{label}</div>
        <div className="text-[24px] font-bold text-foreground leading-tight mt-0.5">{value}</div>
        <div className="text-[11.5px] text-muted-foreground mt-0.5">{delta}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-10 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted text-muted-foreground">
      {label}<ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium mb-1.5 text-foreground/80">{children}</div>;
}

function Field({ label, value, placeholder, required, hint, onChange }: { label: string; value?: string; placeholder?: string; required?: boolean; hint?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium text-foreground/80">{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </div>
      <input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      {hint && <div className="text-[11.5px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function ModuleToggle({ name, desc, checked, onChange, icon: Icon, color }: { name: string; desc: string; checked: boolean; onChange: (v: boolean) => void; icon: React.ComponentType<{ className?: string }>; color: "emerald" | "blue" | "amber"; }) {
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: checked ? "border-emerald-300 bg-emerald-50/40" : "border-border" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: checked ? "border-blue-300 bg-blue-50/40" : "border-border" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: checked ? "border-amber-300 bg-amber-50/40" : "border-border" },
  }[color];
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 transition ${tones.border}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones.bg} ${tones.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-foreground">{name}</div>
        <div className="text-[12.5px] text-muted-foreground leading-snug">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function toggleModule(arr: ("ERP" | "TXNG" | "VT")[], m: "ERP" | "TXNG" | "VT", on: boolean): ("ERP" | "TXNG" | "VT")[] {
  return on ? Array.from(new Set([...arr, m])) : arr.filter((x) => x !== m);
}


function CredRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [show, setShow] = useState(!secret);
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[12.5px] text-muted-foreground w-32 flex-shrink-0">{label}</div>
      <div className="flex-1 font-mono text-[13px] text-foreground bg-white rounded-lg px-3 py-1.5 border border-border flex items-center justify-between gap-2 min-w-0">
        <span className="truncate">{show ? value : "••••••••••••"}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {secret && (
            <button type="button" onClick={() => setShow(p => !p)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
          <button type="button" onClick={copy} className="text-muted-foreground hover:text-primary">
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProvinceSelect({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium text-foreground/80">Tỉnh / Thành phố</span>
      </div>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 pl-3 pr-8 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
        >
          <option value="">-- Chọn tỉnh / thành phố --</option>
          {PROVINCES_VN.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function CommuneSelect({ province, value, onChange }: { province?: string; value?: string; onChange?: (v: string) => void }) {
  const options = province ? (COMMUNE_MAP[province] ?? []) : [];
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[13px] font-medium text-foreground/80">Xã / Phường</span>
      </div>
      {options.length > 0 ? (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
          >
            <option value="">-- Chọn xã / phường --</option>
            {options.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Nhập xã / phường / thị trấn"
          className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      )}
    </div>
  );
}
