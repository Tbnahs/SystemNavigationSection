import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Search, Plus, Filter, Download, MoreHorizontal, ChevronDown, X, Upload,
  Building2, Users, Package, Sprout, Leaf, Bell,
  Pencil, Eye, MapPin, ArrowLeft, ArrowRight, LayoutGrid, Loader2,
} from "lucide-react";
import {
  fetchEnterprises, fetchEnterpriseStats, createEnterprise,
  updateEnterprise, deleteEnterprise,
  type Enterprise,
} from "@/lib/api";

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
  daiDien: string;
  sdt: string;
  email: string;
  diaChi: string;
  tinh: string;
  xa: string;
  modules: ("ERP" | "TXNG" | "VT")[];
  logoUrl: string | null;
};

const EMPTY_FORM: FormState = {
  mst: "", ten: "", tenHienThi: "", daiDien: "", sdt: "", email: "",
  diaChi: "", tinh: "Thái Nguyên", xa: "",
  modules: ["ERP", "TXNG"],
  logoUrl: null,
};

const LOGO_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

export default function DoanhNghiepPage() {
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Enterprise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enterprise | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "location" | "modules">("general");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

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
      }),
    onSuccess: () => { invalidate(); closeDrawer(); },
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
    setActiveTab("general");
    setSubmitErr(null);
  }

  function openEdit(dn: Enterprise) {
    setEditItem(dn);
    setForm({
      mst: dn.mst, ten: dn.ten, tenHienThi: dn.tenHienThi,
      daiDien: dn.daiDien, sdt: dn.sdt, email: dn.email,
      diaChi: dn.diaChi, tinh: dn.tinh, xa: dn.xa,
      modules: dn.modules,
      logoUrl: dn.logoUrl ?? null,
    });
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

  const items = listQ.data?.items ?? [];
  const filtered = search.trim()
    ? items.filter((d) =>
        [d.mst, d.ten, d.tenHienThi, d.daiDien]
          .some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

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
    if (editItem) {
      updateMu.mutate({ id: editItem.id, body: form });
    } else {
      createMu.mutate(form);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <div className="text-[12px] text-muted-foreground">Quản trị hệ thống / Doanh nghiệp</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Quản lý Doanh nghiệp</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Tổng doanh nghiệp" value={String(statsQ.data?.total ?? "—")} delta="Dữ liệu thực tế" tone="emerald" icon={Building2} />
          <Stat label="Đang hoạt động" value={String(statsQ.data?.active ?? "—")} delta={statsQ.data ? `${Math.round(((statsQ.data.active || 0) / Math.max(statsQ.data.total, 1)) * 100)}% tổng` : ""} tone="blue" icon={Users} />
          <Stat label="Chờ duyệt" value={String(statsQ.data?.pending ?? "—")} delta="Cần xử lý" tone="amber" icon={Bell} />
          <Stat label="Tạm khóa" value={String(statsQ.data?.locked ?? "—")} delta="" tone="rose" icon={X} />
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-border rounded-xl p-3 lg:p-4 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo MST, tên doanh nghiệp, người đại diện…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          <SelectChip label="Tỉnh / Thành phố" />
          <SelectChip label="Phân hệ" />
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
            <Plus className="w-4 h-4" /> Thêm doanh nghiệp
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-primary" /></th>
                  <th className="px-3 py-3">Doanh nghiệp</th>
                  <th className="px-3 py-3">Tên tài khoản</th>
                  <th className="px-3 py-3">Người đại diện</th>
                  <th className="px-3 py-3">Phân hệ</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {listQ.isLoading && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải dữ liệu…</td></tr>
                )}
                {listQ.isError && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-rose-600">Lỗi tải dữ liệu: {(listQ.error as Error).message}</td></tr>
                )}
                {!listQ.isLoading && !listQ.isError && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{search ? "Không tìm thấy doanh nghiệp phù hợp." : "Chưa có doanh nghiệp nào — bấm \"Thêm doanh nghiệp\" để bắt đầu."}</td></tr>
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
                        {STATUS_BADGE[dn.status].text}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button onClick={() => setLocation(`/quan-tri/doanh-nghiep/${dn.id}`)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
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
            <div>Hiển thị {filtered.length} / {items.length} doanh nghiệp</div>
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

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-center mb-1">Xóa doanh nghiệp?</h3>
            <p className="text-[13.5px] text-muted-foreground text-center mb-6">
              Bạn sắp xóa <span className="font-semibold text-foreground">{deleteTarget.tenHienThi}</span> khỏi hệ thống.
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-11 rounded-xl border border-border font-medium text-[14px] hover:bg-muted"
              >
                Hủy
              </button>
              <button
                disabled={deleteMu.isPending}
                onClick={() => deleteMu.mutate(deleteTarget.id)}
                className="flex-1 h-11 rounded-xl bg-rose-600 text-white font-semibold text-[14px] hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMu.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xóa vĩnh viễn
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
                <div className="text-[18px] font-semibold">{editItem ? "Sửa thông tin doanh nghiệp" : "Thêm doanh nghiệp mới"}</div>
                <div className="text-[12.5px] text-muted-foreground">Điền đầy đủ thông tin để khởi tạo hồ sơ doanh nghiệp.</div>
              </div>
              <button onClick={closeDrawer} className="p-1.5 rounded hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 pt-4 border-b border-border">
              <div className="flex gap-1">
                {[
                  { k: "general", label: "Hồ sơ chung", n: 1 },
                  { k: "location", label: "Vị trí địa lý", n: 2 },
                  { k: "modules", label: "Phân hệ", n: 3 },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setActiveTab(t.k as typeof activeTab)}
                    className={`px-3 py-2.5 text-[13px] font-medium border-b-2 -mb-px flex items-center gap-2 transition ${activeTab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${activeTab === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t.n}</span>
                    {t.label}
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
                    <Field label="Email" placeholder="lienhe@congty.vn" value={form.email} onChange={(v) => setF("email", v)} />
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ProvinceSelect value={form.tinh} onChange={(v) => setF("tinh", v)} />
                    <Field label="Xã / Phường" placeholder="Vd: Quân Chu" value={form.xa} onChange={(v) => setF("xa", v)} />
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

              {submitErr && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px]">
                  {submitErr}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
              <div className="text-[12.5px] text-muted-foreground">
                Bước <span className="font-semibold text-foreground">{activeTab === "general" ? 1 : activeTab === "location" ? 2 : 3}</span> / 3
              </div>
              <div className="flex items-center gap-2">
                <button onClick={closeDrawer} className="h-10 px-4 rounded-lg border border-border text-[13.5px] font-medium hover:bg-muted">Hủy</button>
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (!editItem && activeTab === "general") setActiveTab("location");
                    else if (!editItem && activeTab === "location") setActiveTab("modules");
                    else handleSubmit();
                  }}
                  className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? "Lưu thay đổi" : activeTab === "modules" ? "Tạo doanh nghiệp" : "Tiếp tục"}
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

const PROVINCES_VN_2025 = [
  "Hà Nội",
  "Hải Phòng",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Cao Bằng",
  "Thái Nguyên",
  "Lào Cai",
  "Điện Biên",
  "Hà Giang",
  "Lạng Sơn",
  "Bắc Ninh",
  "Hưng Yên",
  "Thanh Hóa",
  "Nghệ An",
  "Huế",
  "Quảng Ngãi",
  "Bình Định",
  "Khánh Hòa",
  "Gia Lai",
  "Đắk Lắk",
  "Lâm Đồng",
  "Bình Thuận",
  "Đồng Nai",
  "Tây Ninh",
  "Long An",
  "Tiền Giang",
  "Vĩnh Long",
  "Đồng Tháp",
  "An Giang",
  "Kiên Giang",
  "Bến Tre",
  "Trà Vinh",
  "Cà Mau",
];

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
          {PROVINCES_VN_2025.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
