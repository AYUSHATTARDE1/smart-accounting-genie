
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TaxEntryList from "@/components/tax/TaxEntryList";
import TaxEntryForm from "@/components/tax/TaxEntryForm";

const TaxesPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Routes>
        <Route path="/" element={<TaxEntryList />} />
        <Route path="/new" element={<TaxEntryForm />} />
        <Route path="/edit/:id" element={<TaxEntryForm />} />
        <Route path="*" element={<Navigate to="/taxes" replace />} />
      </Routes>
    </div>
  );
};

export default TaxesPage;
