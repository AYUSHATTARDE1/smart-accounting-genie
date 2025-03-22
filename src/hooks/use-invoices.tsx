import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useCompanySettings } from "@/hooks/use-company-settings";

// Define types for the invoice data
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id?: string;
  user_id?: string;
  client_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { settings } = useCompanySettings();

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }
      
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });
      
      if (invoicesError) throw invoicesError;
      
      // Fetch invoice items for all invoices
      const invoiceIds = invoicesData.map(inv => inv.id);
      
      if (invoiceIds.length === 0) {
        setInvoices([]);
        setIsLoading(false);
        return;
      }
      
      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .in("invoice_id", invoiceIds);
      
      if (itemsError) throw itemsError;
      
      // Combine invoices with their items
      const populatedInvoices = invoicesData.map(invoice => {
        const items = itemsData
          .filter(item => item.invoice_id === invoice.id)
          .map(item => ({
            id: item.id,
            invoice_id: item.invoice_id,
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            amount: Number(item.amount)
          }));
        
        // Ensure status is a valid InvoiceStatus type
        const status = validateInvoiceStatus(invoice.status);
        
        return {
          ...invoice,
          status,
          total_amount: Number(invoice.total_amount),
          items
        };
      });
      
      setInvoices(populatedInvoices as Invoice[]);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate and convert status string to InvoiceStatus type
  const validateInvoiceStatus = (status: string): InvoiceStatus => {
    const validStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
    return validStatuses.includes(status as InvoiceStatus) 
      ? (status as InvoiceStatus) 
      : "draft"; // Default to draft if invalid
  };

  const createInvoice = async (invoice: Invoice): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to create an invoice",
          variant: "destructive",
        });
        return null;
      }
      
      // Create invoice record
      const invoiceData = {
        user_id: user.id,
        client_name: invoice.client_name,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
        notes: invoice.notes,
        total_amount: invoice.total_amount
      };
      
      const { data: newInvoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      const itemsData = invoice.items.map(item => ({
        invoice_id: newInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount
      }));
      
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsData);
      
      if (itemsError) throw itemsError;
      
      toast({
        title: "Invoice created",
        description: `Invoice #${invoice.invoice_number} has been created`,
      });
      
      await fetchInvoices();
      return newInvoice.id;
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoice = async (invoice: Invoice): Promise<boolean> => {
    if (!invoice.id) {
      toast({
        title: "Error",
        description: "Invoice ID is required for updating",
        variant: "destructive",
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      // Update invoice record
      const invoiceData = {
        client_name: invoice.client_name,
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
        notes: invoice.notes,
        total_amount: invoice.total_amount
      };
      
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", invoice.id);
      
      if (invoiceError) throw invoiceError;
      
      // Delete all existing items
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoice.id);
      
      if (deleteError) throw deleteError;
      
      // Create new items
      const itemsData = invoice.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount
      }));
      
      if (itemsData.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsData);
        
        if (itemsError) throw itemsError;
      }
      
      toast({
        title: "Invoice updated",
        description: `Invoice #${invoice.invoice_number} has been updated`,
      });
      
      await fetchInvoices();
      return true;
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Delete invoice items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", id);
      
      if (itemsError) throw itemsError;
      
      // Delete invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);
      
      if (invoiceError) throw invoiceError;
      
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted",
      });
      
      await fetchInvoices();
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoiceAsPdf = async (invoice: Invoice) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Add company info if available
      if (settings) {
        // Add company logo if available
        if (settings.company_logo_url) {
          try {
            // Get the image dimensions for proper scaling
            const img = new Image();
            img.src = settings.company_logo_url;
            
            // Calculate aspect ratio and set max width/height
            const maxLogoWidth = 60;
            const maxLogoHeight = 30;
            
            // Place the logo in the top-left corner
            doc.addImage(settings.company_logo_url, 'JPEG', 20, yPos, maxLogoWidth, maxLogoHeight);
            yPos += maxLogoHeight + 10;
          } catch (logoError) {
            console.error("Error adding logo to PDF:", logoError);
          }
        }
        
        // Add company name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(settings.company_name, 20, yPos);
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
        
        yPos += 5;
      }
      
      // Add invoice title and number
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
      yPos += 8;
      
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.invoice_number}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 8;
      
      // Add invoice dates
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 5;
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 10;
      
      // Add client info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Bill To:", 20, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(invoice.client_name, 20, yPos);
      yPos += 15;
      
      // Add invoice items table
      const tableColumn = ["Description", "Quantity", "Unit Price", "Amount"];
      const tableRows = invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        `$${item.unit_price.toFixed(2)}`,
        `$${item.amount.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [60, 60, 60] },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });
      
      // Get the Y position after the table
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Add total amount
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: $${invoice.total_amount.toFixed(2)}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 15;
      
      // Add invoice status
      const statusText = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
      doc.text(`Status: ${statusText}`, pageWidth - 20, yPos, { align: "right" });
      yPos += 15;
      
      // Add notes if available
      if (invoice.notes) {
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", 20, yPos);
        yPos += 6;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Split long notes into multiple lines
        const textLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
        doc.text(textLines, 20, yPos);
      }
      
      // Save the PDF
      doc.save(`Invoice_${invoice.invoice_number}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `Invoice #${invoice.invoice_number} has been downloaded`,
      });
      
      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    downloadInvoiceAsPdf
  };
};
