
import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoices } from "@/hooks/use-invoices";

const EditInvoice = () => {
  const { id } = useParams();
  const { invoices, isLoading } = useInvoices();
  
  // Find the invoice with the matching ID
  const invoice = invoices.find(inv => inv.id === id);
  
  if (isLoading) {
    return <div className="py-8 text-center">Loading invoice details...</div>;
  }
  
  if (!invoice) {
    return <div className="py-8 text-center">Invoice not found. <Navigate to="/invoices" replace /></div>;
  }
  
  return <InvoiceForm initialData={invoice} />;
};

const InvoicesPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Invoice Management</h1>
      <p className="text-muted-foreground">Create and manage your business invoices</p>
      
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/new" element={<InvoiceForm />} />
        <Route path="/edit/:id" element={<EditInvoice />} />
        <Route path="*" element={<Navigate to="/invoices" replace />} />
      </Routes>
    </div>
  );
};

export default InvoicesPage;
