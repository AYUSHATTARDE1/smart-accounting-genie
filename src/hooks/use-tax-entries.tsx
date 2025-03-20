
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface TaxEntry {
  id?: string;
  user_id?: string;
  tax_year: number;
  category: string;
  amount: number;
  description?: string;
  date_added: string;
  created_at?: string;
  updated_at?: string;
}

export const useTaxEntries = () => {
  const [taxEntries, setTaxEntries] = useState<TaxEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTaxEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTaxEntries([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("tax_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date_added", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setTaxEntries(data || []);
    } catch (err) {
      console.error("Error fetching tax entries:", err);
      setError("Failed to load tax entries. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load tax entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTaxEntry = async (entry: TaxEntry) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("tax_entries")
        .insert({
          user_id: user.id,
          tax_year: entry.tax_year,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          date_added: entry.date_added,
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Tax entry added successfully!",
      });
      
      await fetchTaxEntries();
    } catch (err) {
      console.error("Error creating tax entry:", err);
      setError("Failed to create tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaxEntry = async (entry: TaxEntry) => {
    if (!entry.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("tax_entries")
        .update({
          tax_year: entry.tax_year,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          date_added: entry.date_added,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Tax entry updated successfully!",
      });
      
      await fetchTaxEntries();
    } catch (err) {
      console.error("Error updating tax entry:", err);
      setError("Failed to update tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTaxEntry = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("tax_entries")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Tax entry deleted successfully!",
      });
      
      setTaxEntries(taxEntries.filter(entry => entry.id !== id));
    } catch (err) {
      console.error("Error deleting tax entry:", err);
      setError("Failed to delete tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to delete tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTaxReportAsPdf = (year?: number) => {
    try {
      let entriesToDownload = taxEntries;
      
      if (year) {
        entriesToDownload = taxEntries.filter(entry => entry.tax_year === year);
      }
      
      if (entriesToDownload.length === 0) {
        toast({
          title: "No Data",
          description: "There are no tax entries to download.",
          variant: "destructive",
        });
        return;
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Tax Report ${year ? '- ' + year : ''}`, 14, 22);
      
      // Group entries by category
      const entriesByCategory: Record<string, TaxEntry[]> = {};
      entriesToDownload.forEach(entry => {
        if (!entriesByCategory[entry.category]) {
          entriesByCategory[entry.category] = [];
        }
        entriesByCategory[entry.category].push(entry);
      });
      
      // Calculate category totals
      const categoryTotals: Record<string, number> = {};
      Object.entries(entriesByCategory).forEach(([category, entries]) => {
        categoryTotals[category] = entries.reduce((sum, entry) => sum + entry.amount, 0);
      });
      
      // Add entries table
      const tableColumn = ["Date", "Category", "Description", "Amount"];
      const tableRows = entriesToDownload.map(entry => [
        new Date(entry.date_added).toLocaleDateString(),
        entry.category,
        entry.description || "",
        "$" + entry.amount.toFixed(2)
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Add category summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Category Summary", 14, finalY);
      
      const summaryColumn = ["Category", "Total Amount"];
      const summaryRows = Object.entries(categoryTotals).map(([category, total]) => [
        category,
        "$" + total.toFixed(2)
      ]);
      
      // Add grand total
      const grandTotal = Object.values(categoryTotals).reduce((sum, total) => sum + total, 0);
      summaryRows.push(["GRAND TOTAL", "$" + grandTotal.toFixed(2)]);
      
      autoTable(doc, {
        head: [summaryColumn],
        body: summaryRows,
        startY: finalY + 5,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Save the PDF
      doc.save(`Tax-Report${year ? '-' + year : ''}.pdf`);
      
      toast({
        title: "Success",
        description: "Tax report downloaded as PDF!",
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({
        title: "Error",
        description: "Failed to download tax report as PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTaxEntries();
  }, []);

  return {
    taxEntries,
    isLoading,
    error,
    fetchTaxEntries,
    createTaxEntry,
    updateTaxEntry,
    deleteTaxEntry,
    downloadTaxReportAsPdf,
  };
};
