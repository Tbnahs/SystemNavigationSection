import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, Trash2, Loader2, Search, Award, ImageIcon,
  X, FileSpreadsheet, Eye, Calendar, Building2, ShieldCheck,
} from "lucide-react";
import {
  fetchProductCertificates, createProductCertificate,
  updateProductCertificate, deleteProductCertificate,
  fetchProducts,
  type ProductCertificate,
} from "@/lib/api";

const LOAI_CHUNG_CHI = [
  "VietGAP", "GlobalGAP", "Organic", "HACCP", "ISO 22000",
  "FDA", "Halal", "OCOP", "Khác",
];

type CForm = {
  productId: number | null;
  loaiChungChi: string;
  tenChungChi: string;
  coQuanCap: string;
  soChungChi: string;
  ngayCap: string;
  ngayHetHan: string;
  imageUrl: string;
};
const EMPTY: CForm = {
  productId: null, loaiChungChi: "", tenChungChi: "",
  coQuanCap: "", soChungChi: "", ngayCap: "", ngayHetHan: "", imageUrl: "",
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch { return iso; }
}

export default function ChungChiThuongPhamPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isSuperAdmin = !user?.enterpriseId;

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductCertificate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCertificate | null>(null);
  const [viewItem, setViewItem] = useState<ProductCertificate | null>(null);
  const [form, setForm] = useState<CForm>(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: certData, isLoading } = useQuery({
    queryKey: ["product-certificates", user?.enterpriseId],
    queryFn: () => fetchProductCertificates(isSuperAdmin ? undefined : user?.enterpriseId),
  });
  const { data: prodData } = useQuery({
    queryKey: ["products", user?.enterpriseId],
    queryFn: fetchProducts,
  });

  const certs = certData?.items ?? [];
  const products = prodData?.items ?? [];

  const visibleProducts = isSuperAdmin
    ? products
    : products.filter((p) => p.enterpriseId === user?.enterpriseId);

  const filtered = certs.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.tenChungChi.toLowerCase().includes(q) ||
      c.loaiChungChi.toLowerCase().includes(q) ||
      c.coQuanCap.toLowerCase().includes(q) ||
      c.soChungChi.toLowerCase().includes(q) ||
      (c.productName ?? "").toLowerCase().includes(q)
    );
  });

  const setF = <K extends keyof CForm>(k: K, v: CForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY);
    setErr(null);
    setModalOpen(true);
  }
  function openEdit(c: ProductCertificate) {
    setEditItem(c);
    setForm({
      productId: c.productId,
      loaiChungChi: c.loaiChungChi,
      tenChungChi: c.tenChungChi,
      coQuanCap: c.coQuanCap,
      soChungChi: c.soChungChi,
      ngayCap: c.ngayCap,
      ngayHetHan: c.ngayHetHan,
      imageUrl: c.imageUrl,
    });
    setErr(null);
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditItem(null); setErr(null); }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.productId) throw new Error("Vui lòng chọn thương phẩm.");
      if (!form.loaiChungChi) throw new Error("Vui lòng chọn loại chứng chỉ.");
      if (!form.tenChungChi.trim()) throw new Error("Vui lòng nhập tên chứng chỉ.");
      if (!form.coQuanCap.trim()) throw new Error("Vui lòng nhập cơ quan cấp.");
      if (!form.soChungChi.trim()) throw new Error("Vui lòng nhập số chứng chỉ.");
      if (!form.ngayCap) throw new Error("Vui lòng nhập ngày cấp.");
      if (!form.ngayHetHan) throw new Error("Vui lòng nhập ngày hết hạn.");
      const body = { ...form, enterpriseId: user?.enterpriseId ?? null };
      if (editItem) return updateProductCertificate(editItem.id, body);
      return createProductCertificate(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-certificates"] });
      closeModal();
    },
    onError: (e: Error) => setErr(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteProductCertificate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-certificates"] });
      setDeleteTarget(null);
    },
  });

  async function handleImageUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) { setErr("Ảnh tối đa 5MB."); return; }
    const url = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    setF("imageUrl", url);
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
          <div>
            <h1 className="text-[15px] font-bold text-foreground tracking-wide uppercase">
              Chứng chỉ thương phẩm
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Quản lý chứng chỉ, chứng nhận của các thương phẩm
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-muted flex items-center gap-2 text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
            </button>
            <button
              onClick={openAdd}
              className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:brightness-110 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm mới
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-border bg-white flex items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm chứng chỉ…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="rounded-xl border border-border overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground w-20">Ảnh</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground">Thông tin chứng chỉ</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground">Thuộc sản phẩm</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground w-32">Ngày tạo</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-muted-foreground w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Award className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-[13px]">
                        {search ? "Không tìm thấy chứng chỉ nào." : "Không có chứng chỉ nào được tìm thấy."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.tenChungChi}
                            className="w-14 h-14 object-cover rounded-lg border border-border cursor-pointer"
                            onClick={() => setViewItem(c)}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[13px] text-foreground">{c.tenChungChi}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-medium">
                            {c.loaiChungChi}
                          </span>
                        </p>
                        <p className="text-[12px] text-muted-foreground mt-1">
                          <span className="font-medium">Cơ quan cấp:</span> {c.coQuanCap}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          <span className="font-medium">Số CC:</span> {c.soChungChi}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          <span className="font-medium">Ngày cấp:</span> {fmtDate(c.ngayCap)}
                          {c.ngayHetHan && (
                            <> &nbsp;→&nbsp; <span className="font-medium">Hết hạn:</span> {fmtDate(c.ngayHetHan)}</>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {c.productName ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px]">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            {c.productName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[12px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">
                        {fmtDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewItem(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Xem"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                            title="Sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination bar */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
              <span className="text-[12px] text-muted-foreground">
                Tổng số {filtered.length} chứng chỉ
              </span>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded border border-border text-[12px] hover:bg-muted">«</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-border text-[12px] hover:bg-muted">‹</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-primary bg-primary text-white text-[12px]">1</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-border text-[12px] hover:bg-muted">›</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-border text-[12px] hover:bg-muted">»</button>
                <select className="h-7 px-2 rounded border border-border text-[12px] ml-2 bg-white outline-none">
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-[14px] font-bold uppercase tracking-wide text-foreground">
                {editItem ? "Sửa chứng chỉ" : "Thêm chứng chỉ"}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Thương phẩm — full width */}
              <div>
                <label className="block text-[13px] font-medium mb-1.5">
                  Thương phẩm <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.productId ?? ""}
                  onChange={(e) => setF("productId", e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white"
                >
                  <option value="">Chọn thương phẩm</option>
                  {visibleProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Image + Fields row */}
              <div className="flex gap-5">
                {/* Left: Image upload */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div
                    className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden"
                    onClick={() => fileRef.current?.click()}
                  >
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-1.5" strokeWidth={1.5} />
                        <span className="text-[11px] text-muted-foreground text-center px-2">No image available</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-white text-[12px] font-medium hover:brightness-110"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Tải ảnh
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f);
                      e.target.value = "";
                    }}
                  />
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setF("imageUrl", "")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Right: fields grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3.5">
                  {/* Loại chứng chỉ */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Loại chứng chỉ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.loaiChungChi}
                      onChange={(e) => setF("loaiChungChi", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary bg-white"
                    >
                      <option value="">Chọn loại chứng chỉ</option>
                      {LOAI_CHUNG_CHI.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tên chứng chỉ */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Tên chứng chỉ, chứng nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.tenChungChi}
                      onChange={(e) => setF("tenChungChi", e.target.value)}
                      placeholder="Nhập tên chứng chỉ"
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {/* Cơ quan cấp */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Cơ quan cấp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.coQuanCap}
                      onChange={(e) => setF("coQuanCap", e.target.value)}
                      placeholder="Tên cơ quan cấp"
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {/* Số chứng chỉ */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Số chứng chỉ, chứng nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={form.soChungChi}
                      onChange={(e) => setF("soChungChi", e.target.value)}
                      placeholder="Số/mã chứng chỉ"
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {/* Ngày cấp */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Ngày cấp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.ngayCap}
                      onChange={(e) => setF("ngayCap", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {/* Ngày hết hạn */}
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">
                      Ngày hết hạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.ngayHetHan}
                      onChange={(e) => setF("ngayHetHan", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {err && (
                <p className="text-[12px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {err}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="h-9 px-5 rounded-lg border border-border text-[13px] font-medium hover:bg-muted flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Hủy
              </button>
              <button
                disabled={saveMut.isPending}
                onClick={() => { setErr(null); saveMut.mutate(); }}
                className="h-9 px-5 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-sm hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
              >
                {saveMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-[14px] font-bold text-foreground">Chi tiết chứng chỉ</h2>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Image */}
              {viewItem.imageUrl ? (
                <div className="flex justify-center">
                  <img
                    src={viewItem.imageUrl}
                    alt={viewItem.tenChungChi}
                    className="max-h-56 rounded-xl border border-border object-contain"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.5} />
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Thương phẩm</p>
                  <p className="text-[13px] font-semibold">{viewItem.productName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Loại chứng chỉ</p>
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-[12px] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {viewItem.loaiChungChi}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Tên chứng chỉ, chứng nhận</p>
                  <p className="text-[13px] font-semibold">{viewItem.tenChungChi}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Cơ quan cấp</p>
                  <p className="text-[13px]">{viewItem.coQuanCap}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Số chứng chỉ</p>
                  <p className="text-[13px]">{viewItem.soChungChi}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Ngày cấp</p>
                  <p className="text-[13px] flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />{fmtDate(viewItem.ngayCap)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Ngày hết hạn</p>
                  <p className="text-[13px] flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />{fmtDate(viewItem.ngayHetHan)}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-2">
              <button
                onClick={() => { setViewItem(null); openEdit(viewItem); }}
                className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-muted flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" /> Sửa
              </button>
              <button
                onClick={() => setViewItem(null)}
                className="h-9 px-5 rounded-lg bg-primary text-white text-[13px] font-semibold hover:brightness-110"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-[15px] font-bold mb-2">Xóa chứng chỉ</h3>
            <p className="text-[13px] text-muted-foreground mb-5">
              Bạn có chắc muốn xóa chứng chỉ <span className="font-semibold text-foreground">"{deleteTarget.tenChungChi}"</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium hover:bg-muted">Hủy</button>
              <button
                disabled={delMut.isPending}
                onClick={() => delMut.mutate(deleteTarget.id)}
                className="h-9 px-4 rounded-lg bg-rose-600 text-white text-[13px] font-semibold hover:bg-rose-700 disabled:opacity-60 flex items-center gap-2"
              >
                {delMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
