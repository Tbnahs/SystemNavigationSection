import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import {
  Building2, Factory, Users, Home, ChevronDown, ChevronRight,
  ShieldCheck, MapPin, Phone, Loader2, Plus, ArrowRight,
  CheckCircle2, Clock, Lock, User, Crown,
  BarChart3, ScanLine, Leaf, Cpu, Globe,
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

type ModuleMetaItem = { label: string; color: string; bg: string; icon: React.ElementType };

const MODULE_META: Record<string, ModuleMetaItem[]> = {
  ERP:  [{ label: "ERP",                 color: "text-emerald-700", bg: "bg-emerald-100", icon: BarChart3 }],
  TXNG: [{ label: "Truy xuất nguồn gốc", color: "text-blue-700",    bg: "bg-blue-100",    icon: ScanLine  }],
  VT:   [
    { label: "Vùng trồng",               color: "text-amber-700",   bg: "bg-amber-100",   icon: Leaf      },
    { label: "Thiết bị IoT",             color: "text-rose-700",    bg: "bg-rose-100",    icon: Cpu       },
  ],
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
  const FacIcon = t.icon;
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <FacIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-foreground truncate">{facility.name}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-medium ring-1 ring-inset ${t.color}`}>{t.label}</span>
          </div>
          {facility.address && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground truncate">{facility.address}</span>
            </div>
          )}
        </div>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {expanded && facility.employees && facility.employees.length > 0 && (
        <div className="px-3 py-2.5 space-y-1.5 bg-white">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nhân viên phụ trách ({facility.employees.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {facility.employees.map(u => (
              <UserPill key={u.id} user={u} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EnterpriseCard({ dn }: { dn: AdminEnterprise }) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = STATUS_DN[dn.status] ?? STATUS_DN.active;
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
      <div
        className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-foreground">{dn.tenHienThi}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${statusMeta.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />{statusMeta.text}
            </span>
          </div>
          {dn.mst && <p className="text-[12px] text-muted-foreground mt-0.5">MST: {dn.mst}</p>}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {dn.phone && (
              <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Phone className="w-3 h-3" />{dn.phone}
              </div>
            )}
            {dn.modules && dn.modules.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {dn.modules.flatMap(m => MODULE_META[m] ?? []).map((meta, i) => {
                  const ModIcon = meta.icon;
                  return (
                    <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${meta.bg} ${meta.color}`}>
                      <ModIcon className="w-2.5 h-2.5" />{meta.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground shrink-0">
          <div className="text-center">
            <p className="text-[18px] font-bold text-foreground">{dn.userCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">người dùng</p>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border bg-muted/10">
          {dn.admins && dn.admins.length > 0 && (
            <div className="mt-3 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Admin doanh nghiệp</p>
              <div className="flex flex-wrap gap-2">
                {dn.admins.map(u => <UserPill key={u.id} user={u} isAdmin />)}
              </div>
            </div>
          )}
          {dn.facilities && dn.facilities.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Cơ sở ({dn.facilities.length})</p>
              {dn.facilities.map(f => <FacilityCard key={f.id} facility={f} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PortalPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = !currentUser?.enterpriseId;
  const [, navigate] = useLocation();
  const { data, isLoading } = useQuery({ queryKey: ["admin-tree"], queryFn: fetchAdminTree });
  const allEnterprises = data?.enterprises ?? [];
  const enterprises = isSuperAdmin
    ? allEnterprises
    : allEnterprises.filter(dn => dn.id === currentUser?.enterpriseId);

  const shortcuts = [
    ...( isSuperAdmin ? [{ icon: Building2, label: "Doanh nghiệp", desc: "Tạo & quản lý DN", href: "/portal/doanh-nghiep", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }] : []),
    { icon: Users,     label: "Người dùng",   desc: "Tạo & phân quyền",  href: "/portal/nguoi-dung",   color: "bg-blue-50 text-blue-700 border-blue-200"     },
    { icon: ShieldCheck, label: "Phân quyền", desc: "Gán quyền hệ thống", href: "/portal/nguoi-dung",  color: "bg-violet-50 text-violet-700 border-violet-200" },
    { icon: Factory,   label: "Cơ sở",        desc: "Hộ liên kết & CS SX", href: "/portal/co-so",      color: "bg-amber-50 text-amber-700 border-amber-200"   },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="text-[12px] text-muted-foreground">Portal / Tổng quan</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5 flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-600" />
            Portal ESG Valley
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">Quản lý tài khoản và phân quyền truy cập các hệ thống nghiệp vụ.</p>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {shortcuts.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.href + s.label}
                onClick={() => navigate(s.href)}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border bg-white hover:shadow-sm transition-all text-left group`}
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-foreground">{s.label}</div>
                  <div className="text-[11.5px] text-muted-foreground">{s.desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Enterprise tree */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13.5px] font-semibold text-foreground">Danh sách Doanh nghiệp</h2>
            {isSuperAdmin && (
            <button
              onClick={() => navigate("/portal/doanh-nghiep")}
              className="h-8 px-3 rounded-lg border border-border text-[12.5px] font-medium hover:bg-muted flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm mới
            </button>
          )}
          </div>
          {isLoading && (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải…
            </div>
          )}
          {!isLoading && enterprises.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Chưa có doanh nghiệp nào. Bắt đầu bằng cách thêm mới!
            </div>
          )}
          <div className="space-y-3">
            {enterprises.map(dn => <EnterpriseCard key={dn.id} dn={dn} />)}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
