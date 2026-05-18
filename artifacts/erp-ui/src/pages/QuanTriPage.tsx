import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import {
  Building2, Factory, Users, Home, ChevronDown, ChevronRight,
  ShieldCheck, MapPin, Phone, Loader2, Plus, ArrowRight,
  CheckCircle2, Clock, Lock, User, Crown,
} from "lucide-react";
import { fetchAdminTree, type AdminEnterprise, type AdminFacility } from "@/lib/api";

const STATUS_DN: Record<string, { text: string; cls: string; dot: string }> = {
  active:  { text: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  pending: { text: "Chờ duyệt",      cls: "bg-amber-50 text-amber-700 ring-amber-200",       dot: "bg-amber-400"  },
  locked:  { text: "Tạm khóa",       cls: "bg-slate-100 text-slate-600 ring-slate-300",     dot: "bg-slate-400"  },
};
const STATUS_U: Record<string, { icon: React.ElementType; color: string }> = {
  active:  { icon: CheckCircle2, color: "text-emerald-500" },
  invited: { icon: Clock,        color: "text-amber-500"   },
  locked:  { icon: Lock,         color: "text-slate-400"   },
};
const TYPE_LABEL: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ho_lien_ket:      { label: "Hộ liên kết",             color: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: Home    },
  co_so_thue_ngoai: { label: "Cơ sở SX (thuê ngoài)",   color: "bg-blue-50 text-blue-700 ring-blue-200",         icon: Building2 },
  co_so_noi_bo:     { label: "Cơ sở SX (nội bộ)",       color: "bg-violet-50 text-violet-700 ring-violet-200",   icon: Factory },
};

function Avatar({ name, color, size = "sm" }: { name: string; color: string; size?: "sm" | "md" }) {
  const initials = name.trim().split(/\s+/).slice(-2).map(s => s[0]?.toUpperCase() ?? "").join("") || "??";
  const cls = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-[12px]";
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

function UserPill({ user, isAdmin }: { user: { name: string; role: string; status: string; avatarColor: string }; isAdmin?: boolean }) {
  const StatusIcon = STATUS_U[user.status]?.icon ?? CheckCircle2;
  const statusColor = STATUS_U[user.status]?.color ?? "text-emerald-500";
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted transition-colors">
      <Avatar name={user.name} color={user.avatarColor} />
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[12.5px] font-medium text-foreground truncate">{user.name}</span>
          {isAdmin && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <StatusIcon className={`w-2.5 h-2.5 ${statusColor} shrink-0`} />
          {user.role}
        </div>
      </div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: AdminFacility }) {
  const [expanded, setExpanded] = useState(true);
  const t = TYPE_LABEL[facility.type] ?? TYPE_LABEL.ho_lien_ket;
  const Icon = t.icon;
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold text-foreground truncate">{facility.name}</span>
            {facility.code && (
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{facility.code}</span>
            )}
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10.5px] font-medium ring-1 ring-inset shrink-0 ${t.color}`}>
              {t.label}
            </span>
            {facility.status === "inactive" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10.5px] font-medium ring-1 ring-inset bg-slate-100 text-slate-500 ring-slate-300 shrink-0">
                Ngưng HĐ
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {facility.address && (
              <div className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{facility.address}</span>
              </div>
            )}
            {facility.phone && (
              <div className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
                <Phone className="w-3 h-3 shrink-0" />{facility.phone}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[12px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
            {facility.users.length} user
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-border/60 pt-2.5">
          {facility.users.length === 0 ? (
            <p className="text-[12px] text-muted-foreground italic py-1">Chưa có user được gán vào cơ sở này</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {facility.users.map(u => (
                <UserPill key={u.id} user={u} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EnterpriseCard({ dn }: { dn: AdminEnterprise }) {
  const [expanded, setExpanded] = useState(true);
  const [, setLocation] = useLocation();
  const s = STATUS_DN[dn.status] ?? STATUS_DN.active;

  const initials = dn.tenHienThi.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Enterprise Header */}
      <div className="flex items-start gap-4 px-5 py-4 border-b border-border bg-muted/20">
        {dn.logoUrl ? (
          <img src={dn.logoUrl} alt={dn.tenHienThi} className="w-12 h-12 rounded-xl object-cover shrink-0 ring-2 ring-border" />
        ) : (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[15px] shrink-0 ${dn.logoColor}`}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-bold text-foreground">{dn.tenHienThi}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${s.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.text}
            </span>
          </div>
          <div className="text-[12px] text-muted-foreground truncate mt-0.5">{dn.ten}</div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[12px] text-muted-foreground flex items-center gap-1">
              <Factory className="w-3.5 h-3.5" /> {dn.facilities.length} cơ sở
            </span>
            <span className="text-[12px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {dn.adminUsers.length} admin
            </span>
            <span className="text-[12px] text-muted-foreground flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {dn.facilities.reduce((s, f) => s + f.users.length, 0)} operator
            </span>
            <div className="flex gap-1 ml-1">
              {dn.modules.map(m => (
                <span key={m} className="text-[10.5px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">{m}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLocation(`/quan-tri/doanh-nghiep/${dn.id}`)}
            className="h-8 px-3 rounded-lg border border-border text-[12.5px] font-medium hover:bg-muted flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Chi tiết <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(v => !v)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-4 space-y-3">
          {/* Admin/Manager users - enterprise level */}
          {dn.adminUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                  User Doanh nghiệp (Admin / Manager)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 mb-3">
                {dn.adminUsers.map(u => (
                  <UserPill key={u.id} user={u} isAdmin />
                ))}
              </div>
            </div>
          )}

          {/* Connector line label */}
          {dn.facilities.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                Cơ sở & User phụ trách (Operator)
              </span>
            </div>
          )}

          {/* Facilities */}
          {dn.facilities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Factory className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-[13px]">Chưa có cơ sở nào. Thêm cơ sở trong mục <span className="font-medium text-foreground">Quản lý Cơ sở</span>.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dn.facilities.map(f => (
                <FacilityCard key={f.id} facility={f} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuanTriPage() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-tree"],
    queryFn: fetchAdminTree,
  });

  const tree = data?.tree ?? [];
  const superAdmins = data?.superAdmins ?? [];

  const totalFacilities = tree.reduce((s, dn) => s + dn.facilities.length, 0);
  const totalUsers = tree.reduce((s, dn) =>
    s + dn.adminUsers.length + dn.facilities.reduce((ss, f) => ss + f.users.length, 0), 0
  ) + superAdmins.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[12px] text-muted-foreground">Quản trị hệ thống</div>
            <h1 className="text-xl lg:text-2xl font-bold mt-0.5">Tổng quan tổ chức</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Sơ đồ phân cấp: Doanh nghiệp → Cơ sở → Người dùng
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setLocation("/quan-tri/co-so")}
              className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium hover:bg-muted flex items-center gap-2 text-muted-foreground"
            >
              <Factory className="w-4 h-4" /> Cơ sở
            </button>
            <button
              onClick={() => setLocation("/quan-tri/nguoi-dung")}
              className="h-9 px-3 rounded-lg border border-border text-[13px] font-medium hover:bg-muted flex items-center gap-2 text-muted-foreground"
            >
              <Users className="w-4 h-4" /> Người dùng
            </button>
            <button
              onClick={() => setLocation("/quan-tri/doanh-nghiep")}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2 hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> Thêm doanh nghiệp
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Doanh nghiệp", value: tree.length, icon: Building2, color: "bg-emerald-50 text-emerald-600" },
            { label: "Cơ sở",         value: totalFacilities, icon: Factory,   color: "bg-blue-50 text-blue-600" },
            { label: "Người dùng",    value: totalUsers,      icon: Users,     color: "bg-violet-50 text-violet-600" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] text-muted-foreground">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{isLoading ? "—" : s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bg-white border border-border rounded-xl px-4 py-3 flex items-center gap-5 flex-wrap">
          <span className="text-[12px] text-muted-foreground font-medium">Chú thích:</span>
          <div className="flex items-center gap-1.5 text-[12px]">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-foreground">User Doanh nghiệp (Admin / Manager)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-foreground">User Cơ sở (Operator)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Đang hoạt động</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Đã mời</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Tạm khóa</span>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="bg-white border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin inline mr-2" />Đang tải sơ đồ tổ chức…
          </div>
        )}
        {isError && (
          <div className="bg-white border border-border rounded-2xl p-12 text-center text-rose-600">
            Lỗi tải dữ liệu: {(error as Error).message}
          </div>
        )}

        {/* Tree */}
        {!isLoading && !isError && tree.length === 0 && (
          <div className="bg-white border border-border rounded-2xl p-12 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
            <p className="text-[14px] font-medium text-foreground mb-1">Chưa có doanh nghiệp nào</p>
            <p className="text-[13px] text-muted-foreground mb-4">Thêm doanh nghiệp đầu tiên để bắt đầu cấu hình hệ thống.</p>
            <button
              onClick={() => setLocation("/quan-tri/doanh-nghiep")}
              className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[13.5px] font-semibold hover:brightness-110"
            >
              Thêm doanh nghiệp
            </button>
          </div>
        )}

        {!isLoading && !isError && tree.map(dn => (
          <EnterpriseCard key={dn.id} dn={dn} />
        ))}

        {/* Super Admins (no enterprise) */}
        {!isLoading && !isError && superAdmins.length > 0 && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Super Admin</h3>
                <p className="text-[12px] text-muted-foreground">Không thuộc doanh nghiệp cụ thể</p>
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
              {superAdmins.map(u => (
                <UserPill key={u.id} user={u} isAdmin />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
