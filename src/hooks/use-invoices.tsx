
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
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
          
          return { ...invoice, items: items || [] } as Invoice;
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Insert invoice
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
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
      // Get the user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
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
  };
};
