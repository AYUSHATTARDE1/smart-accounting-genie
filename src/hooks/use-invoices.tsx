import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at?: string;
}

export interface Invoice {
  id?: string;
  user_id?: string;
  client_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

// Demo data for local usage
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
const DEMO_MODE = true; // Set to true to enable demo mode without authentication

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If not authenticated and not in demo mode, return empty array
        setInvoices([]);
        setIsLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (invoicesError) {
        throw invoicesError;
      }
      
      if (!invoicesData || invoicesData.length === 0) {
        setInvoices([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch items for each invoice
      const invoicesWithItems = await Promise.all(
        invoicesData.map(async (invoice) => {
          const { data: items, error: itemsError } = await supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", invoice.id);
          
          if (itemsError) {
            console.error("Error fetching invoice items:", itemsError);
            return { ...invoice, items: [] } as Invoice;
          }
          
          return { 
            ...invoice, 
            items: items || [],
            // Ensure status is a valid InvoiceStatus
            status: invoice.status as InvoiceStatus
          } as Invoice;
        })
      );
      
      setInvoices(invoicesWithItems);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Failed to load invoices. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (invoice: Invoice) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the user ID
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "Please login to create invoices",
          variant: "destructive",
        });
        throw new Error("User not authenticated");
      }
      
      const userId = sessionData.session.user.id;
      
      // Insert invoice
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_name: invoice.client_name,
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status,
          notes: invoice.notes,
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create invoice");
      }
      
      const createdInvoice = data[0];
      
      // Insert invoice items
      if (invoice.items && invoice.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            invoice.items.map(item => ({
              invoice_id: createdInvoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          );
        
        if (itemsError) {
          console.error("Error creating invoice items:", itemsError);
          throw itemsError;
        }
      }
      
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      });
      
      await fetchInvoices();
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError("Failed to create invoice. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    if (!invoice.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let userId = DEMO_USER_ID;
      
      if (!DEMO_MODE) {
        // Get the user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated");
        }
        
        userId = user.id;
      }
      
      // Update invoice
      const { error } = await supabase
        .from("invoices")
        .update({
          client_name: invoice.client_name,
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          status: invoice.status,
          notes: invoice.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.id);
      
      if (error) {
        throw error;
      }
      
      // Delete existing items
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoice.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert updated items
      if (invoice.items && invoice.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            invoice.items.map(item => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          );
        
        if (itemsError) {
          throw itemsError;
        }
      }
      
      toast({
        title: "Success", 
        description: "Invoice updated successfully!"
      });
      
      await fetchInvoices();
    } catch (err) {
      console.error("Error updating invoice:", err);
      setError("Failed to update invoice. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete invoice (cascade will delete items)
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Invoice deleted successfully!",
      });
      
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err);
      setError("Failed to delete invoice. Please try again.");
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoiceAsPdf = (invoice: Invoice) => {
    try {
      const doc = new jsPDF();
      
      // Add company info
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("My Bill Book", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Invoice #: " + invoice.invoice_number, 14, 32);
      
      // Add client info
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Client:", 14, 45);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(invoice.client_name, 14, 53);
      
      // Add dates
      doc.setFontSize(12);
      doc.text("Issue Date: " + new Date(invoice.issue_date).toLocaleDateString(), 150, 45);
      doc.text("Due Date: " + new Date(invoice.due_date).toLocaleDateString(), 150, 53);
      
      // Add status
      doc.setFontSize(12);
      doc.text("Status: " + invoice.status.toUpperCase(), 150, 61);
      
      // Add items table
      const tableColumn = ["Item", "Quantity", "Unit Price", "Amount"];
      const tableRows = invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        "$" + item.unit_price.toFixed(2),
        "$" + item.amount.toFixed(2)
      ]);
      
      // Add total row
      tableRows.push([
        "Total", "", "", "$" + invoice.total_amount.toFixed(2)
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Add notes if available
      if (invoice.notes) {
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text("Notes:", 14, finalY);
        doc.setFontSize(10);
        doc.text(invoice.notes, 14, finalY + 8);
      }
      
      // Save the PDF
      doc.save(`Invoice-${invoice.invoice_number}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice downloaded as PDF!",
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({
        title: "Error",
        description: "Failed to download invoice as PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    downloadInvoiceAsPdf,
  };
};
