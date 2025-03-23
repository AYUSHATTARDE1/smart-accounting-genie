
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoices } from "@/hooks/use-invoices";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { Skeleton } from "@/components/ui/skeleton";

// Create a shared authentication hook to avoid duplicate code
const useAuthCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchSettings } = useCompanySettings();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          if (isMounted) {
            toast({
              title: "Authentication error",
              description: error.message,
              variant: "destructive",
            });
            navigate('/login');
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          if (!data.session) {
            console.log("No active session found");
            toast({
              title: "Authentication required",
              description: "Please log in to access this feature.",
              variant: "destructive",
            });
            navigate('/login');
            setIsAuthenticated(false);
          } else {
            console.log("User is authenticated");
            setIsAuthenticated(true);
            // Fetch company settings when user is authenticated
            await fetchSettings();
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
          navigate('/login');
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, toast, fetchSettings]);

  return { isAuthenticated, isLoading };
};

const LoadingState = () => (
  <div className="container mx-auto py-6 space-y-6">
    <Skeleton className="h-8 w-64 mb-4" />
    <Skeleton className="h-4 w-96 mb-6" />
    <div className="border rounded-md p-6">
      <Skeleton className="h-8 w-full mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

const EditInvoice = () => {
  const { id } = useParams();
  const { invoices, isLoading: invoicesLoading, fetchInvoices } = useInvoices();
  const { isAuthenticated, isLoading: authLoading } = useAuthCheck();
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log("EditInvoice: User authenticated, fetching invoices...");
      fetchInvoices();
    }
  }, [isAuthenticated, fetchInvoices]);
  
  if (authLoading || invoicesLoading) {
    return <LoadingState />;
  }
  
  if (!isAuthenticated) {
    return null; // Auth check will redirect
  }
  
  // Find the invoice with the matching ID
  const invoice = invoices.find(inv => inv.id === id);
  
  if (!invoice) {
    console.log("Invoice not found, redirecting to invoices list");
    return <div className="py-8 text-center">Invoice not found. <Navigate to="/invoices" replace /></div>;
  }
  
  return <InvoiceForm initialData={invoice} />;
};

const NewInvoice = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  useEffect(() => {
    console.log("NewInvoice component: Auth state", { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!isAuthenticated) {
    return null; // Auth check will redirect
  }
  
  return <InvoiceForm />;
};

const InvoicesPage = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const { fetchInvoices } = useInvoices();
  
  useEffect(() => {
    console.log("InvoicesPage mounted, auth state:", { isAuthenticated, isLoading });
    if (isAuthenticated) {
      fetchInvoices();
    }
  }, [isAuthenticated, fetchInvoices]);
  
  if (isLoading) {
    console.log("InvoicesPage: Still loading auth state...");
    return <LoadingState />;
  }
  
  if (!isAuthenticated) {
    console.log("InvoicesPage: User not authenticated, should redirect via useAuthCheck");
    return null; // Auth check will redirect
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Invoice Management</h1>
      <p className="text-muted-foreground">Create and manage your business invoices</p>
      
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/new" element={<NewInvoice />} />
        <Route path="/edit/:id" element={<EditInvoice />} />
        <Route path="*" element={<Navigate to="/invoices" replace />} />
      </Routes>
    </div>
  );
};

export default InvoicesPage;
