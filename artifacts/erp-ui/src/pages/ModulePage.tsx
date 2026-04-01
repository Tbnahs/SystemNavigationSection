import { useParams, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";
import AppLayout from "@/components/AppLayout";
import {
  BarChart3,
  ScanLine,
  Leaf,
  ShoppingCart,
  Truck,
  Package,
  DollarSign,
  Users,
  Factory,
  UserCircle,
  FileBarChart,
  Settings,
  QrCode,
  Link2,
  Award,
  Layers,
  GitBranch,
  Search,
  MapPin,
  Sprout,
  FlaskConical,
  Scissors,
  CloudSun,
  ClipboardCheck,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

interface SubModule {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  color: string;
  bgColor: string;
}

const moduleConfig: Record<
  string,
  {
    nameKey: TranslationKey;
    descKey: TranslationKey;
    gradient: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    subModules: SubModule[];
  }
> = {
  erp: {
    nameKey: "module.erp",
    descKey: "module.erp.desc",
    gradient: "from-blue-500 to-blue-600",
    icon: BarChart3,
    subModules: [
      { id: "sales", icon: ShoppingCart, nameKey: "submodule.erp.sales", descKey: "submodule.erp.sales.desc", color: "text-blue-600", bgColor: "bg-blue-50" },
      { id: "purchase", icon: Truck, nameKey: "submodule.erp.purchase", descKey: "submodule.erp.purchase.desc", color: "text-indigo-600", bgColor: "bg-indigo-50" },
      { id: "inventory", icon: Package, nameKey: "submodule.erp.inventory", descKey: "submodule.erp.inventory.desc", color: "text-violet-600", bgColor: "bg-violet-50" },
      { id: "accounting", icon: DollarSign, nameKey: "submodule.erp.accounting", descKey: "submodule.erp.accounting.desc", color: "text-emerald-600", bgColor: "bg-emerald-50" },
      { id: "hr", icon: Users, nameKey: "submodule.erp.hr", descKey: "submodule.erp.hr.desc", color: "text-pink-600", bgColor: "bg-pink-50" },
      { id: "production", icon: Factory, nameKey: "submodule.erp.production", descKey: "submodule.erp.production.desc", color: "text-orange-600", bgColor: "bg-orange-50" },
      { id: "crm", icon: UserCircle, nameKey: "submodule.erp.crm", descKey: "submodule.erp.crm.desc", color: "text-sky-600", bgColor: "bg-sky-50" },
      { id: "reports", icon: FileBarChart, nameKey: "submodule.erp.reports", descKey: "submodule.erp.reports.desc", color: "text-teal-600", bgColor: "bg-teal-50" },
      { id: "settings", icon: Settings, nameKey: "submodule.erp.settings", descKey: "submodule.erp.settings.desc", color: "text-slate-600", bgColor: "bg-slate-50" },
    ],
  },
  txng: {
    nameKey: "module.txng",
    descKey: "module.txng.desc",
    gradient: "from-emerald-500 to-green-600",
    icon: ScanLine,
    subModules: [
      { id: "qrcode", icon: QrCode, nameKey: "submodule.txng.qrcode", descKey: "submodule.txng.qrcode.desc", color: "text-emerald-600", bgColor: "bg-emerald-50" },
      { id: "supplychain", icon: Link2, nameKey: "submodule.txng.supplychain", descKey: "submodule.txng.supplychain.desc", color: "text-green-600", bgColor: "bg-green-50" },
      { id: "certification", icon: Award, nameKey: "submodule.txng.certification", descKey: "submodule.txng.certification.desc", color: "text-yellow-600", bgColor: "bg-yellow-50" },
      { id: "batch", icon: Layers, nameKey: "submodule.txng.batch", descKey: "submodule.txng.batch.desc", color: "text-teal-600", bgColor: "bg-teal-50" },
      { id: "timeline", icon: GitBranch, nameKey: "submodule.txng.timeline", descKey: "submodule.txng.timeline.desc", color: "text-cyan-600", bgColor: "bg-cyan-50" },
      { id: "audit", icon: Search, nameKey: "submodule.txng.audit", descKey: "submodule.txng.audit.desc", color: "text-slate-600", bgColor: "bg-slate-50" },
    ],
  },
  farming: {
    nameKey: "module.farming",
    descKey: "module.farming.desc",
    gradient: "from-lime-500 to-green-500",
    icon: Leaf,
    subModules: [
      { id: "zones", icon: MapPin, nameKey: "submodule.farming.zones", descKey: "submodule.farming.zones.desc", color: "text-green-600", bgColor: "bg-green-50" },
      { id: "crops", icon: Sprout, nameKey: "submodule.farming.crops", descKey: "submodule.farming.crops.desc", color: "text-lime-600", bgColor: "bg-lime-50" },
      { id: "pesticides", icon: FlaskConical, nameKey: "submodule.farming.pesticides", descKey: "submodule.farming.pesticides.desc", color: "text-amber-600", bgColor: "bg-amber-50" },
      { id: "harvest", icon: Scissors, nameKey: "submodule.farming.harvest", descKey: "submodule.farming.harvest.desc", color: "text-orange-600", bgColor: "bg-orange-50" },
      { id: "weather", icon: CloudSun, nameKey: "submodule.farming.weather", descKey: "submodule.farming.weather.desc", color: "text-sky-600", bgColor: "bg-sky-50" },
      { id: "inspection", icon: ClipboardCheck, nameKey: "submodule.farming.inspection", descKey: "submodule.farming.inspection.desc", color: "text-teal-600", bgColor: "bg-teal-50" },
    ],
  },
};

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
      {label}
    </span>
  );
}

export default function ModulePage() {
  const params = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const moduleId = params.id || "erp";
  const config = moduleConfig[moduleId];

  if (!config) {
    setLocation("/home");
    return null;
  }

  const ModuleIcon = config.icon;

  return (
    <AppLayout>
      {/* Module Header */}
      <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 mb-6 relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/home")}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("submodule.back")}
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <ModuleIcon className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t(config.nameKey)}</h1>
              <p className="text-white/80 text-sm mt-0.5">{t(config.descKey)}</p>
            </div>
          </div>
          {moduleId === "txng" && (
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              <TrustBadge label="Trust" />
              <TrustBadge label="Trace" />
              <TrustBadge label="Transparency" />
            </div>
          )}
        </div>
      </div>

      {/* Sub-modules grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {config.subModules.map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              data-testid={`card-submodule-${sub.id}`}
              onClick={() => setLocation(`/module/${moduleId}/${sub.id}`)}
              className="group bg-card border border-card-border rounded-2xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-xl ${sub.bgColor} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-5 h-5 ${sub.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{t(sub.nameKey)}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(sub.descKey)}</p>
              <div className="flex items-center justify-end mt-3">
                <ChevronRight className={`w-4 h-4 ${sub.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            </button>
          );
        })}
      </div>
    </AppLayout>
  );
}
