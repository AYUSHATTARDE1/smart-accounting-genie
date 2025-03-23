
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useCompanySettings } from "./use-company-settings";

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
  const { settings, fetchSettings } = useCompanySettings();

  const fetchTaxEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTaxEntries([]);
        setIsLoading(false);
        toast({
          title: "Authentication required",
          description: "Please log in to view your tax entries",
          variant: "destructive",
        });
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
        toast({
          title: "Authentication required",
          description: "Please log in to create tax entries",
          variant: "destructive",
        });
        throw new Error("Authentication required");
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
      return data[0];
    } catch (err) {
      console.error("Error creating tax entry:", err);
      setError("Failed to create tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create tax entry. Please try again.",
        variant: "destructive",
      });
      throw err;
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
      throw err;
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
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTaxReportAsPdf = async (year?: number) => {
    try {
      // Ensure company settings are loaded
      if (!settings) {
        await fetchSettings();
      }
      
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
        return false;
      }
      
      const doc = new jsPDF();
      let yPos = 20;
      
      // Add company info if available
      if (settings) {
        // Add company logo if available
        if (settings.company_logo_url) {
          try {
            // Calculate max logo dimensions for proper scaling
            const maxLogoWidth = 60;
            const maxLogoHeight = 30;
            
            // Place the logo in the top-left corner
            doc.addImage(settings.company_logo_url, 'JPEG', 20, yPos, maxLogoWidth, maxLogoHeight, undefined, 'FAST');
            yPos += maxLogoHeight + 10;
          } catch (logoError) {
            console.error("Error adding logo to PDF:", logoError);
            // Continue without logo if there's an error
            yPos += 10;
          }
        }
        
        // Add company name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(settings.company_name || "Your Company", 20, yPos);
        yPos += 8;
        
        // Add company details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        if (settings.address) {
          doc.text(settings.address, 20, yPos);
          yPos += 5;
        }
        
        if (settings.email) {
          doc.text(`Email: ${settings.email}`, 20, yPos);
          yPos += 5;
        }
        
        if (settings.phone) {
          doc.text(`Phone: ${settings.phone}`, 20, yPos);
          yPos += 5;
        }
        
        if (settings.tax_id) {
          doc.text(`Tax ID: ${settings.tax_id}`, 20, yPos);
          yPos += 5;
        }
        
        yPos += 10;
      }
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Tax Report ${year ? '- ' + year : ''}`, 14, yPos);
      yPos += 10;
      
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
        startY: yPos,
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
      
      return true;
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({
        title: "Error",
        description: "Failed to download tax report as PDF. Please try again.",
        variant: "destructive",
      });
      return false;
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
