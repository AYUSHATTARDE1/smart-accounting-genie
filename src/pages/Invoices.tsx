
import React from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoices } from "@/hooks/use-invoices";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useCompanySettings } from "@/hooks/use-company-settings";

// Create a shared authentication hook to avoid duplicate code
const useAuthCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchSettings } = useCompanySettings();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this feature.",
          variant: "destructive",
        });
        navigate('/login');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        // Fetch company settings when user is authenticated
        await fetchSettings();
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast, fetchSettings]);

  return { isAuthenticated, isLoading };
};

const EditInvoice = () => {
  const { id } = useParams();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { isAuthenticated, isLoading: authLoading } = useAuthCheck();
  
  // Find the invoice with the matching ID
  const invoice = invoices.find(inv => inv.id === id);
  
  if (authLoading || invoicesLoading) {
    return <div className="py-8 text-center">Loading invoice details...</div>;
  }
  
  if (!isAuthenticated) {
    return null; // Auth check will redirect
  }
  
  if (!invoice) {
    return <div className="py-8 text-center">Invoice not found. <Navigate to="/invoices" replace /></div>;
  }
  
  return <InvoiceForm initialData={invoice} />;
};

const NewInvoice = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null; // Auth check will redirect
  }
  
  return <InvoiceForm />;
};

const InvoicesPage = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
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
