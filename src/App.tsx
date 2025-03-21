
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import Taxes from "./pages/Taxes";
import GetStarted from "./pages/GetStarted";
import Calculator from "./pages/Calculator";
import DocumentUpload from "./pages/DocumentUpload";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import ChatInterface from "./components/ai/ChatInterface";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check for dark mode preference and auth state
  useEffect(() => {
    // Dark mode check
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
    
    // Auth state check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );
    
    // Initial auth check
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/document-upload" element={<DocumentUpload />} />
            
            {/* Protected routes - wrapped in AppLayout */}
            <Route element={<AppLayout />}>
              <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/expenses" 
                element={isAuthenticated ? <Expenses /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/reports" 
                element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/taxes/*" 
                element={isAuthenticated ? <Taxes /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/invoices/*" 
                element={isAuthenticated ? <Invoices /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/ai-assistant" 
                element={isAuthenticated ? <ChatInterface /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/settings" 
                element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/support" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
              />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
