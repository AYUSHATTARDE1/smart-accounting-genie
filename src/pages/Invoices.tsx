
import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";

const EditInvoice = () => {
  const { id } = useParams();
  // This is a placeholder - we would fetch the invoice by ID here
  // In a real implementation, we would use the id to fetch the invoice data
  return <InvoiceForm />;
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
