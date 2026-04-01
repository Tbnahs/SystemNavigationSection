import { useParams, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Construction } from "lucide-react";

export default function SubModulePage() {
  const params = useParams<{ moduleId: string; subId: string }>();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="mb-6">
        <button
          data-testid="button-back-submodule"
          onClick={() => setLocation(`/module/${params.moduleId}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("submodule.back")}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {params.moduleId?.toUpperCase()} / {params.subId}
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Chức năng này đang được phát triển. Vui lòng quay lại sau.
        </p>
        <button
          onClick={() => setLocation(`/module/${params.moduleId}`)}
          className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("submodule.back")}
        </button>
      </div>
    </AppLayout>
  );
}
