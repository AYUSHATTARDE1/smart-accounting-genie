
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
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Improved auth state management to persist sessions
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setIsAuthLoading(false);
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
        }
        setSession(data.session);
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  const isAuthenticated = !!session;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
            } />
            <Route path="/signup" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
            } />
            <Route path="/get-started" element={
              isAuthenticated ? <GetStarted /> : <Navigate to="/login" />
            } />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/document-upload" element={<DocumentUpload />} />
            
            {/* Protected routes - wrapped in AppLayout */}
            <Route element={
              isAuthenticated ? <AppLayout /> : <Navigate to="/login" />
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/taxes/*" element={<Taxes />} />
              <Route path="/invoices/*" element={<Invoices />} />
              <Route path="/ai-assistant" element={<ChatInterface />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Dashboard />} />
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
