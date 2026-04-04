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
  Cpu,
  Zap,
  Bell,
  Activity,
  BarChart2,
  CheckSquare,
} from "lucide-react";

interface SubModule {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  nameKey: TranslationKey;
  descKey: TranslationKey;
}

const moduleConfig: Record<
  string,
  {
    nameKey: TranslationKey;
    descKey: TranslationKey;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    subModules: SubModule[];
  }
> = {
  erp: {
    nameKey: "module.erp",
    descKey: "module.erp.desc",
    icon: BarChart3,
    subModules: [
      { id: "sales", icon: ShoppingCart, nameKey: "submodule.erp.sales", descKey: "submodule.erp.sales.desc" },
      { id: "purchase", icon: Truck, nameKey: "submodule.erp.purchase", descKey: "submodule.erp.purchase.desc" },
      { id: "inventory", icon: Package, nameKey: "submodule.erp.inventory", descKey: "submodule.erp.inventory.desc" },
      { id: "accounting", icon: DollarSign, nameKey: "submodule.erp.accounting", descKey: "submodule.erp.accounting.desc" },
      { id: "hr", icon: Users, nameKey: "submodule.erp.hr", descKey: "submodule.erp.hr.desc" },
      { id: "production", icon: Factory, nameKey: "submodule.erp.production", descKey: "submodule.erp.production.desc" },
      { id: "quality", icon: CheckSquare, nameKey: "submodule.erp.quality", descKey: "submodule.erp.quality.desc" },
      { id: "farmers", icon: Users, nameKey: "submodule.erp.farmers", descKey: "submodule.erp.farmers.desc" },
      { id: "packaging", icon: Package, nameKey: "submodule.erp.packaging", descKey: "submodule.erp.packaging.desc" },
      { id: "crm", icon: UserCircle, nameKey: "submodule.erp.crm", descKey: "submodule.erp.crm.desc" },
      { id: "reports", icon: FileBarChart, nameKey: "submodule.erp.reports", descKey: "submodule.erp.reports.desc" },
      { id: "settings", icon: Settings, nameKey: "submodule.erp.settings", descKey: "submodule.erp.settings.desc" },
    ],
  },
  txng: {
    nameKey: "module.txng",
    descKey: "module.txng.desc",
    icon: ScanLine,
    subModules: [
      { id: "qrcode", icon: QrCode, nameKey: "submodule.txng.qrcode", descKey: "submodule.txng.qrcode.desc" },
      { id: "supplychain", icon: Link2, nameKey: "submodule.txng.supplychain", descKey: "submodule.txng.supplychain.desc" },
      { id: "certification", icon: Award, nameKey: "submodule.txng.certification", descKey: "submodule.txng.certification.desc" },
      { id: "batch", icon: Layers, nameKey: "submodule.txng.batch", descKey: "submodule.txng.batch.desc" },
      { id: "timeline", icon: GitBranch, nameKey: "submodule.txng.timeline", descKey: "submodule.txng.timeline.desc" },
      { id: "audit", icon: Search, nameKey: "submodule.txng.audit", descKey: "submodule.txng.audit.desc" },
    ],
  },
  farming: {
    nameKey: "module.farming",
    descKey: "module.farming.desc",
    icon: Leaf,
    subModules: [
      { id: "zones", icon: MapPin, nameKey: "submodule.farming.zones", descKey: "submodule.farming.zones.desc" },
      { id: "crops", icon: Sprout, nameKey: "submodule.farming.crops", descKey: "submodule.farming.crops.desc" },
      { id: "pesticides", icon: FlaskConical, nameKey: "submodule.farming.pesticides", descKey: "submodule.farming.pesticides.desc" },
      { id: "harvest", icon: Scissors, nameKey: "submodule.farming.harvest", descKey: "submodule.farming.harvest.desc" },
      { id: "weather", icon: CloudSun, nameKey: "submodule.farming.weather", descKey: "submodule.farming.weather.desc" },
      { id: "inspection", icon: ClipboardCheck, nameKey: "submodule.farming.inspection", descKey: "submodule.farming.inspection.desc" },
      { id: "iot-sensors", icon: Cpu, nameKey: "submodule.iot.sensors", descKey: "submodule.iot.sensors.desc" },
      { id: "iot-alerts", icon: Bell, nameKey: "submodule.iot.alerts", descKey: "submodule.iot.alerts.desc" },
      { id: "iot-monitoring", icon: Activity, nameKey: "submodule.iot.monitoring", descKey: "submodule.iot.monitoring.desc" },
      { id: "iot-reports", icon: BarChart2, nameKey: "submodule.iot.reports", descKey: "submodule.iot.reports.desc" },
    ],
  },
};

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
      <div className="bg-white border border-border rounded-xl p-5 mb-6 flex items-center gap-4">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/home")}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ModuleIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-bold text-foreground text-base leading-tight">{t(config.nameKey)}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t(config.descKey)}</p>
        </div>
      </div>

      {/* Sub-modules grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {config.subModules.map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              data-testid={`card-submodule-${sub.id}`}
              onClick={() => {
                if (moduleId === "erp" && sub.id === "purchase") {
                  setLocation("/module/erp/purchase");
                } else if (moduleId === "erp" && sub.id === "sales") {
                  setLocation("/module/erp/sales");
                } else if (moduleId === "erp" && sub.id === "production") {
                  setLocation("/module/erp/production");
                } else if (moduleId === "erp" && sub.id === "quality") {
                  setLocation("/module/erp/quality");
                } else if (moduleId === "erp" && sub.id === "farmers") {
                  setLocation("/module/erp/farmers");
                } else if (moduleId === "erp" && sub.id === "packaging") {
                  setLocation("/module/erp/packaging");
                } else {
                  setLocation(`/module/${moduleId}/${sub.id}`);
                }
              }}
              className="group bg-white border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-sm active:scale-[0.99] transition-all duration-150 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{t(sub.nameKey)}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(sub.descKey)}</p>
              <div className="flex items-center justify-end mt-3">
                <ChevronRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          );
        })}
      </div>
    </AppLayout>
  );
}
