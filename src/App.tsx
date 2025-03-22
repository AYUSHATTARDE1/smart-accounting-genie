
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
import PostInitialSetup from "./pages/PostInitialSetup";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 300000, // 5 minutes
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean | null>(null);

  // Improved auth state management to persist sessions
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);

        if (currentSession) {
          checkCompletedSetup(currentSession.user.id);
        } else {
          setHasCompletedSetup(null);
        }
        
        // Don't set isAuthLoading to false here, wait for the checkSession call
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
        
        if (data.session) {
          await checkCompletedSetup(data.session.user.id);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    const checkCompletedSetup = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error checking business profile:", error);
          setHasCompletedSetup(false);
          return;
        }

        setHasCompletedSetup(!!data);
      } catch (err) {
        console.error("Profile check failed:", err);
        setHasCompletedSetup(false);
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

  // Direct users to appropriate setup pages
  const getRedirectPath = () => {
    if (!isAuthenticated) {
      return "/login";
    }
    
    if (hasCompletedSetup === false) {
      return "/post-initial-setup";
    }
    
    return "/dashboard";
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Login />
            } />
            <Route path="/signup" element={
              isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Login />
            } />
            <Route path="/get-started" element={
              isAuthenticated ? <GetStarted /> : <Navigate to="/login" />
            } />
            <Route path="/post-initial-setup" element={
              isAuthenticated ? <PostInitialSetup /> : <Navigate to="/login" />
            } />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/document-upload" element={<DocumentUpload />} />
            
            {/* Protected routes - wrapped in AppLayout */}
            <Route element={
              isAuthenticated ? 
                (hasCompletedSetup === false ? <Navigate to="/post-initial-setup" /> : <AppLayout />) 
                : <Navigate to="/login" />
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
