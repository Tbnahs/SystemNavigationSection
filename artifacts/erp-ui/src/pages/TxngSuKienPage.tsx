import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Plus, Pencil, Trash2, Info, ImageIcon,
  CalendarClock, Search, ShoppingBasket, Factory,
  Package, Leaf, FlaskConical, Droplets, Scissors,
  Truck, ClipboardCheck,
} from "lucide-react";

type Tab = "su_kien" | "hoat_dong";

type SuKienItem = {
  id: number;
  tab: Tab;
  tenSuKien: string;
  moTa: string;
  imageUrl?: string;
  icon: React.ElementType;
  iconBg: string;
};

const MOCK_DATA: SuKienItem[] = [
  { id: 1, tab: "su_kien",  tenSuKien: "Thu mua",              moTa: "Khai báo sự kiện thu mua nguyên liệu chè tươi từ các hộ liên kết",   icon: ShoppingBasket, iconBg: "bg-emerald-100 text-emerald-700", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
  { id: 2, tab: "su_kien",  tenSuKien: "Chế biến",             moTa: "Khai báo quá trình chế biến chè tại cơ sở sản xuất",                icon: Factory,        iconBg: "bg-blue-100 text-blue-700",     imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80" },
  { id: 3, tab: "su_kien",  tenSuKien: "Đóng gói - Niêm phong",moTa: "Khai báo sự kiện đóng gói và niêm phong thành phẩm",                icon: Package,        iconBg: "bg-violet-100 text-violet-700", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80" },
  { id: 4, tab: "su_kien",  tenSuKien: "Vận chuyển",           moTa: "Khai báo sự kiện vận chuyển hàng hóa giữa các điểm trong chuỗi",    icon: Truck,          iconBg: "bg-sky-100 text-sky-700",       imageUrl: "" },
  { id: 5, tab: "su_kien",  tenSuKien: "Kiểm định chất lượng", moTa: "Khai báo kết quả kiểm định chất lượng sản phẩm",                    icon: ClipboardCheck, iconBg: "bg-amber-100 text-amber-700",   imageUrl: "" },

  { id: 6, tab: "hoat_dong", tenSuKien: "Bón phân",           moTa: "Ghi nhận hoạt động bón phân cho vùng nguyên liệu",                  icon: Leaf,           iconBg: "bg-green-100 text-green-700",   imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80" },
  { id: 7, tab: "hoat_dong", tenSuKien: "Phun thuốc BVTV",    moTa: "Ghi nhận hoạt động phun thuốc bảo vệ thực vật",                     icon: FlaskConical,   iconBg: "bg-rose-100 text-rose-600",     imageUrl: "" },
  { id: 8, tab: "hoat_dong", tenSuKien: "Tưới nước",          moTa: "Ghi nhận hoạt động tưới nước cho vùng nguyên liệu",                 icon: Droplets,       iconBg: "bg-cyan-100 text-cyan-700",     imageUrl: "" },
  { id: 9, tab: "hoat_dong", tenSuKien: "Thu hoạch chè",      moTa: "Ghi nhận hoạt động thu hoạch chè tươi tại vùng nguyên liệu",        icon: Scissors,       iconBg: "bg-amber-100 text-amber-700",   imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
];

const EMPTY_FORM = { tenSuKien: "", moTa: "", imageUrl: "", tab: "su_kien" as Tab };

const TABS: { key: Tab; label: string }[] = [
  { key: "hoat_dong", label: "Hoạt động nuôi trồng" },
  { key: "su_kien",   label: "Sự kiện trọng yếu" },
];

export default function TxngSuKienPage() {
  const [items, setItems] = useState<SuKienItem[]>(MOCK_DATA);
  const [activeTab, setActiveTab] = useState<Tab>("su_kien");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<SuKienItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<SuKienItem | null>(null);

  const filtered = useMemo(() =>
    items
      .filter(i => i.tab === activeTab)
      .filter(i => !search.trim() || i.tenSuKien.toLowerCase().includes(search.toLowerCase())),
    [items, activeTab, search]
  );

  function openCreate() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, tab: activeTab });
    setDrawerOpen(true);
  }

  function openEdit(item: SuKienItem) {
    setEditItem(item);
    setForm({ tenSuKien: item.tenSuKien, moTa: item.moTa, imageUrl: item.imageUrl ?? "", tab: item.tab });
    setDrawerOpen(true);
  }

  function handleSave() {
    if (!form.tenSuKien.trim()) return;
    if (editItem) {
      setItems(p => p.map(i => i.id === editItem.id ? { ...i, ...form } : i));
    } else {
      const newItem: SuKienItem = {
        id: Date.now(), tab: form.tab, tenSuKien: form.tenSuKien,
        moTa: form.moTa, imageUrl: form.imageUrl,
        icon: CalendarClock, iconBg: "bg-blue-100 text-blue-700",
      };
      setItems(p => [newItem, ...p]);
    }
    setDrawerOpen(false);
  }

  function handleDelete(item: SuKienItem) {
    setItems(p => p.filter(i => i.id !== item.id));
    setDeleteTarget(null);
  }

  return (
    <AppLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wide uppercase text-foreground">
              Khai báo truy xuất
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

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setSearch(""); }}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nhập tên sự kiện..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm">Chưa có sự kiện nào{search ? ` khớp với "${search}"` : ""}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-border rounded-xl overflow-hidden flex hover:shadow-sm hover:border-primary/30 transition-all group"
                >
                  {/* Image / placeholder */}
                  <div className="w-32 sm:w-36 shrink-0 bg-muted/30 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.tenSuKien}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center`}>
                          <Icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                      </div>
                    )}
                    {/* Fallback overlay icon for broken images */}
                    {item.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-[14px] text-foreground leading-tight mb-1">
                        {item.tenSuKien}
                      </p>
                      {item.moTa && (
                        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                          {item.moTa}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <button
                        type="button"
                        className="h-8 px-4 rounded-lg border border-primary text-primary text-[12.5px] font-medium hover:bg-primary hover:text-white transition-all"
                      >
                        Khai báo
                      </button>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <button type="button" onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground transition text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Phân loại</label>
                <select
                  value={form.tab}
                  onChange={e => setForm(p => ({ ...p, tab: e.target.value as Tab }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                >
                  {TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Tên sự kiện <span className="text-rose-500">*</span></label>
                <input
                  value={form.tenSuKien}
                  onChange={e => setForm(p => ({ ...p, tenSuKien: e.target.value }))}
                  placeholder="Nhập tên sự kiện..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">Mô tả</label>
                <textarea
                  value={form.moTa}
                  onChange={e => setForm(p => ({ ...p, moTa: e.target.value }))}
                  rows={3}
                  placeholder="Mô tả ngắn về sự kiện..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">URL hình ảnh</label>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="mt-2 w-full h-28 object-cover rounded-lg border border-border" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
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

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Xác nhận xóa</h3>
            <p className="text-sm text-muted-foreground">
              Bạn có chắc muốn xóa sự kiện <span className="font-medium text-foreground">"{deleteTarget.tenSuKien}"</span>? Hành động này không thể hoàn tác.
            </p>
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
