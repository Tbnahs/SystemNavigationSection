import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ModulePage from "@/pages/ModulePage";
import SubModulePage from "@/pages/SubModulePage";
import PurchasePage from "@/pages/PurchasePage";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
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
      <Route path="/module/:id">
        {() => <ProtectedRoute component={ModulePage} />}
      </Route>
      <Route path="/module/erp/purchase">
        {() => <ProtectedRoute component={PurchasePage} />}
      </Route>
      <Route path="/module/:moduleId/:subId">
        {() => <ProtectedRoute component={SubModulePage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
