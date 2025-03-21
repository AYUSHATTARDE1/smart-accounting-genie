
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoices } from "@/hooks/use-invoices";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EditInvoice = () => {
  const { id } = useParams();
  const { invoices, isLoading } = useInvoices();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find the invoice with the matching ID
  const invoice = invoices.find(inv => inv.id === id);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to access invoices.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  if (isLoading) {
    return <div className="py-8 text-center">Loading invoice details...</div>;
  }
  
  if (!invoice) {
    return <div className="py-8 text-center">Invoice not found. <Navigate to="/invoices" replace /></div>;
  }
  
  return <InvoiceForm initialData={invoice} />;
};

const NewInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to create invoices.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  return <InvoiceForm />;
};

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to access invoices.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
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
