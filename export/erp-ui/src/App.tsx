import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ERPProvider } from "@/contexts/ERPContext";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ModulePage from "@/pages/ModulePage";
import SubModulePage from "@/pages/SubModulePage";
import PurchasePage from "@/pages/PurchasePage";
import SalesPage from "@/pages/SalesPage";
import ProductionPage from "@/pages/ProductionPage";
import PackagingPage from "@/pages/PackagingPage";
import FarmersPage from "@/pages/FarmersPage";
import QualityPage from "@/pages/QualityPage";
import QuyCachPage from "@/pages/QuyCachPage";
import InventoryPage from "@/pages/InventoryPage";
import AccountingPage from "@/pages/AccountingPage";
import HRPage from "@/pages/HRPage";
import CRMPage from "@/pages/CRMPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import ThuongPhamPage from "@/pages/ThuongPhamPage";
import DonThuMuaPage from "@/pages/DonThuMuaPage";
import GiongChePage from "@/pages/GiongChePage";
import ModuleSelectPage from "@/pages/ModuleSelectPage";
import HoSoPage from "@/pages/HoSoPage";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/home">
        {() => <ProtectedRoute component={HomePage} />}
      </Route>
      <Route path="/chon-phan-he">
        {() => <ProtectedRoute component={ModuleSelectPage} />}
      </Route>

      {/* ERP module routes */}
      <Route path="/module/erp/purchase">
        {() => <ProtectedRoute component={PurchasePage} />}
      </Route>
      <Route path="/module/erp/sales">
        {() => <ProtectedRoute component={SalesPage} />}
      </Route>
      <Route path="/module/erp/production">
        {() => <ProtectedRoute component={ProductionPage} />}
      </Route>
      <Route path="/module/erp/packaging">
        {() => <ProtectedRoute component={PackagingPage} />}
      </Route>
      <Route path="/module/erp/farmers">
        {() => <ProtectedRoute component={FarmersPage} />}
      </Route>
      <Route path="/module/erp/quality">
        {() => <ProtectedRoute component={QualityPage} />}
      </Route>
      <Route path="/module/erp/quy-cach">
        {() => <ProtectedRoute component={QuyCachPage} />}
      </Route>
      <Route path="/module/erp/inventory">
        {() => <ProtectedRoute component={InventoryPage} />}
      </Route>
      <Route path="/module/erp/accounting">
        {() => <ProtectedRoute component={AccountingPage} />}
      </Route>
      <Route path="/module/erp/hr">
        {() => <ProtectedRoute component={HRPage} />}
      </Route>
      <Route path="/module/erp/crm">
        {() => <ProtectedRoute component={CRMPage} />}
      </Route>
      <Route path="/module/erp/reports">
        {() => <ProtectedRoute component={ReportsPage} />}
      </Route>
      <Route path="/module/erp/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>
      <Route path="/module/erp/thuong-pham">
        {() => <ProtectedRoute component={ThuongPhamPage} />}
      </Route>
      <Route path="/module/erp/thu-mua">
        {() => <ProtectedRoute component={DonThuMuaPage} />}
      </Route>
      <Route path="/module/erp/giong-che">
        {() => <ProtectedRoute component={GiongChePage} />}
      </Route>

      {/* Generic fallbacks */}
      <Route path="/module/:moduleId/:subId">
        {() => <ProtectedRoute component={SubModulePage} />}
      </Route>
      <Route path="/module/:id">
        {() => <ProtectedRoute component={ModulePage} />}
      </Route>

      <Route path="/ho-so">
        {() => <ProtectedRoute component={HoSoPage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ERPProvider>
            <TooltipProvider>
              <WouterRouter>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </ERPProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
