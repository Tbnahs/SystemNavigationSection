import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import PortalPage from "@/pages/PortalPage";
import DoanhNghiepPage from "@/pages/DoanhNghiepPage";
import DoanhNghiepDetailPage from "@/pages/DoanhNghiepDetailPage";
import NhanVienPage from "@/pages/NhanVienPage";
import DonViTinhPage from "@/pages/DonViTinhPage";
import CoSoPage from "@/pages/CoSoPage";
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

      {/* Portal routes */}
      <Route path="/portal">
        {() => <ProtectedRoute component={PortalPage} />}
      </Route>
      <Route path="/portal/doanh-nghiep">
        {() => <ProtectedRoute component={DoanhNghiepPage} />}
      </Route>
      <Route path="/portal/doanh-nghiep/:id">
        {() => <ProtectedRoute component={DoanhNghiepDetailPage} />}
      </Route>
      <Route path="/portal/nguoi-dung">
        {() => <ProtectedRoute component={NhanVienPage} />}
      </Route>
      <Route path="/portal/don-vi-tinh">
        {() => <ProtectedRoute component={DonViTinhPage} />}
      </Route>
      <Route path="/portal/co-so">
        {() => <ProtectedRoute component={CoSoPage} />}
      </Route>

      {/* Legacy /quan-tri routes */}
      <Route path="/quan-tri">
        {() => <ProtectedRoute component={PortalPage} />}
      </Route>
      <Route path="/quan-tri/doanh-nghiep">
        {() => <ProtectedRoute component={DoanhNghiepPage} />}
      </Route>
      <Route path="/quan-tri/doanh-nghiep/:id">
        {() => <ProtectedRoute component={DoanhNghiepDetailPage} />}
      </Route>
      <Route path="/quan-tri/nguoi-dung">
        {() => <ProtectedRoute component={NhanVienPage} />}
      </Route>
      <Route path="/quan-tri/don-vi-tinh">
        {() => <ProtectedRoute component={DonViTinhPage} />}
      </Route>
      <Route path="/quan-tri/co-so">
        {() => <ProtectedRoute component={CoSoPage} />}
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
          <TooltipProvider>
            <WouterRouter>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
