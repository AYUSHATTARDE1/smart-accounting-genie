
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceForm from "@/components/invoices/InvoiceForm";

const InvoicesPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/new" element={<InvoiceForm />} />
        <Route path="*" element={<Navigate to="/invoices" replace />} />
      </Routes>
    </div>
  );
};

export default InvoicesPage;
