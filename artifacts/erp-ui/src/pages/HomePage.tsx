import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useERP } from "@/contexts/ERPContext";
import AppLayout from "@/components/AppLayout";
import {
  BarChart3, ScanLine, Leaf, TrendingUp, ShoppingCart, Package,
  ArrowRight, Clock, CheckCircle2, AlertCircle, MapPin, Globe,
  Users, Building2, Ruler, Store, Wifi, WifiOff, ShieldCheck,
  QrCode, Link2, Award, Factory, Layers,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  fetchEnterpriseStats, fetchEmployeeStats, fetchFacilities, fetchUnits,
} from "@/lib/api";
import { TranslationKey } from "@/i18n/translations";

/* ── Constants ───────────────────────────────────────────── */

const ALL_SYSTEMS: {
  id: string; icon: React.ElementType; labelKey?: TranslationKey; label: string;
  descKey: TranslationKey; href: string; count: string; gradient: string; badge: string;
}[] = [
  { id: "portal",     icon: Globe,    label: "Portal",        descKey: "home.system.portal.desc",      href: "/portal",           count: "4",  gradient: "from-violet-500 to-purple-600", badge: "bg-violet-100 text-violet-700" },
  { id: "erp",        icon: BarChart3, label: "ERP",          descKey: "home.system.erp.desc",         href: "/module/erp",       count: "13", gradient: "from-emerald-500 to-green-600", badge: "bg-emerald-100 text-emerald-700" },
  { id: "txng",       icon: ScanLine, labelKey: "nav.module.txng",  label: "Truy xuất nguồn gốc",    descKey: "home.system.txng.desc",    href: "/module/txng",      count: "6",  gradient: "from-blue-500 to-cyan-600",     badge: "bg-blue-100 text-blue-700" },
  { id: "vung_trong", icon: Leaf,     labelKey: "nav.module.vung-trong", label: "Vùng trồng & IoT",  descKey: "home.system.vung-trong.desc", href: "/module/vung-trong", count: "10", gradient: "from-amber-500 to-orange-500",  badge: "bg-amber-100 text-amber-700" },
];

type ActivityItem = { icon: React.ElementType; ok: boolean; textKey: TranslationKey; time: string };

const ERP_ACTIVITIES: ActivityItem[] = [
  { icon: CheckCircle2, ok: true,  textKey: "home.activity.erp.1", time: "5 phút trước" },
  { icon: ShoppingCart, ok: true,  textKey: "home.activity.erp.2", time: "32 phút trước" },
  { icon: CheckCircle2, ok: true,  textKey: "home.activity.erp.3", time: "2 giờ trước" },
  { icon: AlertCircle,  ok: false, textKey: "home.activity.erp.4", time: "3 giờ trước" },
  { icon: Package,      ok: true,  textKey: "home.activity.erp.5", time: "5 giờ trước" },
];

const TXNG_ACTIVITIES: ActivityItem[] = [
  { icon: QrCode,       ok: true,  textKey: "home.activity.txng.1", time: "10 phút trước" },
  { icon: CheckCircle2, ok: true,  textKey: "home.activity.txng.2", time: "1 giờ trước" },
  { icon: Link2,        ok: true,  textKey: "home.activity.txng.3", time: "3 giờ trước" },
  { icon: Award,        ok: true,  textKey: "home.activity.txng.4", time: "Hôm qua" },
  { icon: AlertCircle,  ok: false, textKey: "home.activity.txng.5", time: "Hôm qua" },
];

const IOT_ACTIVITIES: ActivityItem[] = [
  { icon: Wifi,         ok: true,  textKey: "home.activity.iot.1", time: "Vừa xong" },
  { icon: CheckCircle2, ok: true,  textKey: "home.activity.iot.2", time: "2 giờ trước" },
  { icon: AlertCircle,  ok: false, textKey: "home.activity.iot.3", time: "3 giờ trước" },
  { icon: Wifi,         ok: true,  textKey: "home.activity.iot.4", time: "5 giờ trước" },
  { icon: AlertCircle,  ok: false, textKey: "home.activity.iot.5", time: "Hôm qua" },
];

const PORTAL_ACTIVITIES: ActivityItem[] = [
  { icon: Users,        ok: true,  textKey: "home.activity.portal.1", time: "15 phút trước" },
  { icon: Building2,    ok: true,  textKey: "home.activity.portal.2", time: "1 giờ trước" },
  { icon: CheckCircle2, ok: true,  textKey: "home.activity.portal.3", time: "2 giờ trước" },
  { icon: Store,        ok: true,  textKey: "home.activity.portal.4", time: "Hôm qua" },
  { icon: AlertCircle,  ok: false, textKey: "home.activity.portal.5", time: "Hôm qua" },
];

function fmtCur(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + " tỷ";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(0) + " tr";
  return v.toLocaleString("vi-VN") + " đ";
}

function tTime(t: (k: TranslationKey) => string, time: string): string {
  if (time === "Vừa xong") return t("time.just-now");
  if (time === "Hôm qua")  return t("time.yesterday");
  const minMatch = time.match(/^(\d+) phút trước$/);
  if (minMatch) return `${minMatch[1]} ${t("time.min-ago")}`;
  const hrMatch = time.match(/^(\d+) giờ trước$/);
  if (hrMatch) return `${hrMatch[1]} ${t("time.hour-ago")}`;
  return time;
}

const PIE_COLORS = ["#16a34a", "#15803d", "#4ade80", "#86efac", "#bbf7d0"];

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="font-medium">
          {p.name}: <span className="text-foreground">{p.value.toFixed(1)} kg</span>
        </p>
      ))}
    </div>
  );
};

function CustomTooltipPie({ active, payload, finishedKgLabel }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p style={{ color: d.payload.fill }} className="font-medium">
        {d.value.toFixed(1)} {finishedKgLabel}
      </p>
    </div>
  );
}

/* ── StatCard ────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color = "text-primary", bg = "bg-primary/10" }: {
  icon: React.ElementType; label: string; value: string; sub: string;
  color?: string; bg?: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
        </div>
        <span className={`text-xs font-medium ${color}`}>{sub}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

/* ── Module section label ─────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

/* ── Placeholder chart (for TXNG / IoT — coming soon) ────── */
function PlaceholderChart({ label, icon: Icon, color }: { label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
      <Icon className={`w-8 h-8 ${color} opacity-40`} strokeWidth={1} />
      <p className="text-sm text-muted-foreground text-center">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { summary, rawReceipts, productionBatches } = useERP();

  const userModules: string[] = user?.modules ?? ["portal"];
  const hasERP  = userModules.includes("erp");
  const hasTXNG = userModules.includes("txng");
  const hasIoT  = userModules.includes("vung_trong") || userModules.includes("iot");
  const isPortalOnly = !hasERP && !hasTXNG && !hasIoT;

  const firstName = user?.name?.split(" ").pop() || "bạn";

  /* Portal stats (real API — only fetched when needed) */
  const { data: entStats } = useQuery({ queryKey: ["enterprise-stats"], queryFn: fetchEnterpriseStats, enabled: isPortalOnly });
  const { data: empStats } = useQuery({ queryKey: ["employee-stats"],   queryFn: fetchEmployeeStats,   enabled: isPortalOnly });
  const { data: facData  } = useQuery({ queryKey: ["facilities"],       queryFn: fetchFacilities,      enabled: isPortalOnly });
  const { data: unitData } = useQuery({ queryKey: ["units"],            queryFn: fetchUnits,           enabled: isPortalOnly });

  /* ERP charts data */
  const dailyPurchaseData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const r of rawReceipts) {
      const parts = r.ngay.split("/");
      const label = `${parts[0]}/${parts[1]}`;
      if (!map.has(label)) map.set(label, { "Nà Hồng": 0, "Nà Bay": 0, "Bản Chang": 0 });
      const entry = map.get(label)!;
      const area = r.diaChi.startsWith("Nà Hồng") ? "Nà Hồng"
                 : r.diaChi.startsWith("Nà Bay")  ? "Nà Bay"
                 : "Bản Chang";
      entry[area] = (entry[area] || 0) + r.khoiLuong;
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, areas]) => ({ date, ...areas }));
  }, [rawReceipts]);

  const productionByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of productionBatches) {
      map.set(b.loaiChe, (map.get(b.loaiChe) || 0) + b.klTP);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [productionBatches]);

  const areaTotal = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rawReceipts) {
      const area = r.diaChi.startsWith("Nà Hồng") ? "Nà Hồng"
                 : r.diaChi.startsWith("Nà Bay")  ? "Nà Bay"
                 : "Bản Chang";
      map.set(area, (map.get(area) || 0) + r.khoiLuong);
    }
    return Array.from(map.entries()).map(([area, kg]) => ({ area, kg })).sort((a, b) => b.kg - a.kg);
  }, [rawReceipts]);

  /* Activities */
  const activities = hasERP ? ERP_ACTIVITIES : hasTXNG ? TXNG_ACTIVITIES : hasIoT ? IOT_ACTIVITIES : PORTAL_ACTIVITIES;

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {t("home.greeting")}, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm">{t("home.subtitle")}</p>
      </div>

      {/* ── ERP stats ────────────────────────────────────── */}
      {hasERP && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.erp")}</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp}   label={t("home.erp.revenue")}    value={fmtCur(summary.totalSalesRevenue)}         sub={`${summary.completedSales} ${t("home.erp.completed")}`} />
            <StatCard icon={ShoppingCart} label={t("home.erp.purchase.vol")} value={`${summary.totalPurchaseKg.toFixed(0)} kg`} sub={`${summary.activePOs} ${t("home.erp.po-active")}`} />
            <StatCard icon={Factory}      label={t("home.erp.production")}  value={String(summary.totalProductionBatches)}     sub={`${summary.completedProductionKg.toFixed(0)} ${t("home.erp.kg-tp")}`} />
            <StatCard icon={Package}      label={t("home.erp.packaging")}   value={String(summary.pendingPackaging)}           sub={`${summary.totalSalesOrders} ${t("home.erp.sales-orders")}`} />
          </div>
        </section>
      )}

      {/* ── TXNG stats ───────────────────────────────────── */}
      {hasTXNG && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.txng")}</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={QrCode}       label={t("home.txng.qr")}       value="156" sub={t("home.txng.qr.sub")}       color="text-blue-600"  bg="bg-blue-50" />
            <StatCard icon={CheckCircle2} label={t("home.txng.verified")} value="42"  sub={t("home.txng.verified.sub")} color="text-blue-600"  bg="bg-blue-50" />
            <StatCard icon={Link2}        label={t("home.txng.chain")}    value="7"   sub={t("home.txng.chain.sub")}    color="text-cyan-600"  bg="bg-cyan-50" />
            <StatCard icon={Award}        label={t("home.txng.cert")}     value="18"  sub={t("home.txng.cert.sub")}     color="text-cyan-600"  bg="bg-cyan-50" />
          </div>
        </section>
      )}

      {/* ── IoT / Vùng trồng stats ───────────────────────── */}
      {hasIoT && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.iot")}</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={MapPin}      label={t("home.iot.zones")}        value="3"      sub="Nà Hồng · Nà Bay · Bản Chang"  color="text-amber-600"  bg="bg-amber-50" />
            <StatCard icon={Leaf}        label={t("home.iot.plants")}       value="1.247"  sub={t("home.iot.plants.sub")}       color="text-amber-600"  bg="bg-amber-50" />
            <StatCard icon={Wifi}        label={t("home.iot.devices.label")} value="24/24" sub={t("home.iot.devices.sub")}     color="text-orange-600" bg="bg-orange-50" />
            <StatCard icon={AlertCircle} label={t("home.iot.alerts")}       value="2"      sub={t("home.iot.alerts.sub")}      color="text-rose-600"   bg="bg-rose-50" />
          </div>
        </section>
      )}

      {/* ── Portal-only stats (real API data) ───────────── */}
      {isPortalOnly && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.portal")}</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Building2} label={t("home.portal.enterprises")} value={String(entStats?.active ?? "—")}       sub={`${entStats?.total ?? 0} ${t("home.portal.enterprises.sub")}`}  color="text-violet-600" bg="bg-violet-50" />
            <StatCard icon={Users}     label={t("home.portal.users.label")} value={String(empStats?.total ?? "—")}         sub={`${empStats?.active ?? 0} ${t("home.portal.users.sub")}`}       color="text-violet-600" bg="bg-violet-50" />
            <StatCard icon={Store}     label={t("home.portal.facilities")}  value={String(facData?.items.length ?? "—")}   sub={t("home.portal.facilities.sub")}                                 color="text-purple-600" bg="bg-purple-50" />
            <StatCard icon={Ruler}     label={t("home.portal.units")}       value={String(unitData?.items.length ?? "—")}  sub={t("home.portal.units.sub")}                                      color="text-purple-600" bg="bg-purple-50" />
          </div>
        </section>
      )}

      {/* ── ERP Charts (chỉ hiện khi có module ERP) ──────── */}
      {hasERP && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.purchase-stats")}</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{t("home.chart.purchase.title")}</p>
              <p className="text-xs text-muted-foreground mb-4">{t("home.chart.purchase.sub")}</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyPurchaseData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltipBar />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Nà Hồng"   fill="#16a34a" radius={[3,3,0,0]} />
                  <Bar dataKey="Nà Bay"    fill="#4ade80" radius={[3,3,0,0]} />
                  <Bar dataKey="Bản Chang" fill="#86efac" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{t("home.chart.production.title")}</p>
              <p className="text-xs text-muted-foreground mb-2">{t("home.chart.production.sub")}</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={productionByType} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {productionByType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPie finishedKgLabel={t("home.chart.finished-kg")} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-foreground">{t("home.chart.zone.title")}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{t("home.chart.zone.sub")}</p>
            <div className="space-y-3">
              {areaTotal.map((item, i) => {
                const max = areaTotal[0].kg;
                const pct = (item.kg / max) * 100;
                return (
                  <div key={item.area}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{item.area}</span>
                      <span className="text-xs text-muted-foreground">{item.kg.toFixed(1)} kg</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TXNG Charts placeholder ───────────────────────── */}
      {hasTXNG && !hasERP && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.txng-stats")}</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PlaceholderChart label={t("home.placeholder.txng.qr")}  icon={QrCode} color="text-blue-500" />
            <PlaceholderChart label={t("home.placeholder.txng.map")} icon={Link2}  color="text-cyan-500" />
          </div>
        </section>
      )}

      {/* ── IoT Charts placeholder ────────────────────────── */}
      {hasIoT && !hasERP && !hasTXNG && (
        <section className="mb-8">
          <SectionLabel>{t("home.section.iot-monitor")}</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PlaceholderChart label={t("home.placeholder.iot.temp")} icon={Wifi}   color="text-amber-500" />
            <PlaceholderChart label={t("home.placeholder.iot.map")}  icon={Layers} color="text-orange-500" />
          </div>
        </section>
      )}

      {/* ── Systems ──────────────────────────────────────── */}
      <section className="mb-8">
        <SectionLabel>{t("home.modules")}</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {ALL_SYSTEMS.filter(sys => userModules.includes(sys.id)).map((sys) => {
            const Icon = sys.icon;
            return (
              <button
                key={sys.id}
                data-testid={`card-module-${sys.id}`}
                onClick={() => setLocation(sys.href)}
                className="group bg-white border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-transparent active:scale-[0.99] transition-all duration-150 cursor-pointer relative overflow-hidden"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${sys.gradient}`} />
                <div className="flex items-start justify-between mb-4 pt-1">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sys.gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${sys.badge}`}>
                    {sys.count} {t("home.functions")}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{sys.labelKey ? t(sys.labelKey) : sys.label}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t(sys.descKey)}</p>
                <div className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("home.enter-system")} <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Recent Activity ──────────────────────────────── */}
      <section>
        <SectionLabel>{t("home.recentActivity")}</SectionLabel>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div
                key={i}
                data-testid={`activity-item-${i}`}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${i < activities.length - 1 ? "border-b border-border" : ""}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${activity.ok ? "text-primary" : "text-amber-500"}`} strokeWidth={1.5} />
                <p className="flex-1 text-sm text-foreground">{t(activity.textKey)}</p>
                <div className="shrink-0 flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs whitespace-nowrap">{tTime(t, activity.time)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
