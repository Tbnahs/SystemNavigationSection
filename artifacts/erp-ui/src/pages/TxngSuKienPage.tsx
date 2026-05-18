import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Eye, Pencil, Trash2, Info, ImageIcon,
  CalendarClock, ChevronLeft, ChevronRight,
} from "lucide-react";

type LoaiSuKien = "Chuyển đổi" | "Bắt đầu" | "Kết thúc" | "Vận chuyển" | "Sơ chế";

type SuKienItem = {
  id: number;
  tenSuKien: string;
  loai: LoaiSuKien;
  moTa: string;
  ngayTao: string;
  imageUrl?: string;
};

const LOAI_BADGE: Record<LoaiSuKien, { text: string; cls: string }> = {
  "Chuyển đổi": { text: "Chuyển đổi", cls: "bg-blue-100 text-blue-700" },
  "Bắt đầu":    { text: "Bắt đầu",    cls: "bg-teal-100 text-teal-700" },
  "Kết thúc":   { text: "Kết thúc",   cls: "bg-rose-100 text-rose-600" },
  "Vận chuyển": { text: "Vận chuyển", cls: "bg-emerald-100 text-emerald-700" },
  "Sơ chế":     { text: "Sơ chế",     cls: "bg-amber-100 text-amber-700" },
};

const LOAI_OPTIONS: LoaiSuKien[] = ["Chuyển đổi", "Bắt đầu", "Kết thúc", "Vận chuyển", "Sơ chế"];

const MOCK_DATA: SuKienItem[] = [
  { id: 1, tenSuKien: "Sự kiện 2",        loai: "Chuyển đổi", moTa: "", ngayTao: "13/05/2026 09:29" },
  { id: 2, tenSuKien: "Sự kiện 1",        loai: "Chuyển đổi", moTa: "", ngayTao: "13/05/2026 09:29" },
  { id: 3, tenSuKien: "thu mua",          loai: "Bắt đầu",    moTa: "", ngayTao: "12/05/2026 02:29" },
  { id: 4, tenSuKien: "bán hàng",         loai: "Kết thúc",   moTa: "", ngayTao: "03/04/2026 10:01" },
  { id: 5, tenSuKien: "Sự kiện gì đó",   loai: "Vận chuyển", moTa: "", ngayTao: "19/03/2026 09:07" },
  { id: 6, tenSuKien: "Vận chuyển (text)",loai: "Vận chuyển", moTa: "", ngayTao: "27/01/2026 08:06" },
  { id: 7, tenSuKien: "Sự kiện test",     loai: "Bắt đầu",    moTa: "", ngayTao: "17/01/2026 08:10" },
  { id: 8, tenSuKien: "Sơ chế",          loai: "Chuyển đổi", moTa: "", ngayTao: "12/01/2026 08:23" },
];

const EMPTY_FORM = { tenSuKien: "", loai: "Chuyển đổi" as LoaiSuKien, moTa: "", imageUrl: "" };

export default function TxngSuKienPage() {
  const [items, setItems] = useState<SuKienItem[]>(MOCK_DATA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<SuKienItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<SuKienItem | null>(null);
  const [viewItem, setViewItem] = useState<SuKienItem | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(item: SuKienItem) {
    setEditItem(item);
    setForm({ tenSuKien: item.tenSuKien, loai: item.loai, moTa: item.moTa, imageUrl: item.imageUrl ?? "" });
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!form.tenSuKien.trim()) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (editItem) {
      setItems((p) => p.map((i) => i.id === editItem.id ? { ...i, ...form } : i));
    } else {
      setItems((p) => [{ id: Date.now(), ...form, ngayTao: ts }, ...p]);
    }
    setDrawerOpen(false);
  }

  function handleDelete(item: SuKienItem) {
    setItems((p) => p.filter((i) => i.id !== item.id));
    setDeleteTarget(null);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wide uppercase text-foreground">
              Danh sách sự kiện
            </h1>
            <button type="button" className="text-muted-foreground hover:text-primary transition">
              <Info className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground w-12">STT</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground w-20">Hình ảnh</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground">Tên sự kiện</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground w-36">Loại sự kiện</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground">Mô tả công việc</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-muted-foreground w-44">Ngày Tạo</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold text-muted-foreground w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">
                    <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Chưa có sự kiện nào
                  </td>
                </tr>
              )}
              {paged.map((item, idx) => {
                const badge = LOAI_BADGE[item.loai] ?? { text: item.loai, cls: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition">
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-14 h-14 rounded-lg border border-border bg-muted/30 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.tenSuKien} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[13px]">{item.tenSuKien}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{item.moTa || <span className="italic opacity-50">—</span>}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground">{item.ngayTao}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewItem(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <span>Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, items.length)} / {items.length} mục</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg border text-[13px] font-medium transition ${
                    p === page ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-base">{editItem ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Tên sự kiện <span className="text-rose-500">*</span></label>
                <input
                  value={form.tenSuKien}
                  onChange={(e) => setForm((p) => ({ ...p, tenSuKien: e.target.value }))}
                  placeholder="Nhập tên sự kiện..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Loại sự kiện</label>
                <select
                  value={form.loai}
                  onChange={(e) => setForm((p) => ({ ...p, loai: e.target.value as LoaiSuKien }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                >
                  {LOAI_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Mô tả công việc</label>
                <textarea
                  value={form.moTa}
                  onChange={(e) => setForm((p) => ({ ...p, moTa: e.target.value }))}
                  rows={3}
                  placeholder="Mô tả ngắn về sự kiện..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">URL hình ảnh</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="mt-2 w-16 h-16 object-cover rounded-lg border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button type="button" onClick={() => setDrawerOpen(false)} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">Hủy</button>
              <button type="button" onClick={handleSave} disabled={!form.tenSuKien.trim()} className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition">
                {editItem ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Dialog */}
      {viewItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">{viewItem.tenSuKien}</h3>
              <button type="button" onClick={() => setViewItem(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            {viewItem.imageUrl && (
              <img src={viewItem.imageUrl} alt={viewItem.tenSuKien} className="w-full h-40 object-cover rounded-xl border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-28 shrink-0">Loại sự kiện:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${LOAI_BADGE[viewItem.loai]?.cls ?? "bg-gray-100 text-gray-600"}`}>{viewItem.loai}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground w-28 shrink-0">Mô tả:</span>
                <span>{viewItem.moTa || <span className="italic text-muted-foreground">Chưa có mô tả</span>}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-28 shrink-0">Ngày tạo:</span>
                <span>{viewItem.ngayTao}</span>
              </div>
            </div>
            <button type="button" onClick={() => setViewItem(null)} className="w-full h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">Đóng</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Xác nhận xóa</h3>
            <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa sự kiện <span className="font-medium text-foreground">"{deleteTarget.tenSuKien}"</span>? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition">Hủy</button>
              <button type="button" onClick={() => handleDelete(deleteTarget)} className="h-9 px-4 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
