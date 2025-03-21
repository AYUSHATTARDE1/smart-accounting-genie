
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useCompanySettings } from "@/hooks/use-company-settings";

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
  const { settings, fetchSettings } = useCompanySettings();

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

  const downloadInvoiceAsPdf = async (invoice: Invoice) => {
    try {
      // Ensure we have the latest company settings
      await fetchSettings();
      
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Set document properties
      doc.setProperties({
        title: `Invoice ${invoice.invoice_number}`,
        subject: 'Invoice',
        author: settings?.company_name || 'My Bill Book',
        keywords: 'invoice, bill',
        creator: 'My Bill Book'
      });
      
      // Define colors
      const primaryColor = '#9b87f5';
      const secondaryColor = '#6E59A5';
      const textColor = '#1A1F2C';
      const mutedColor = '#8E9196';
      
      // Add logo and styling
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Add company logo if available
      if (settings?.company_logo_url) {
        // Create an image element to get dimensions
        const img = new Image();
        img.src = settings.company_logo_url;
        
        // Wait for image to load
        await new Promise((resolve) => {
          img.onload = resolve;
          // Set a timeout in case the image fails to load
          setTimeout(resolve, 3000);
        });
        
        // Calculate dimensions to maintain aspect ratio
        const maxWidth = 50;
        const maxHeight = 30;
        
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        if (imgWidth > maxWidth) {
          const ratio = maxWidth / imgWidth;
          imgWidth = maxWidth;
          imgHeight = imgHeight * ratio;
        }
        
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          imgWidth = imgWidth * ratio;
        }
        
        // Add logo to PDF
        doc.addImage(
          settings.company_logo_url, 
          'JPEG', 
          10, 
          5, 
          imgWidth, 
          imgHeight
        );
      }
      
      // Add company info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(settings?.company_name || 'My Bill Book', settings?.company_logo_url ? 65 : 14, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('INVOICE', pageWidth - 20, 20, { align: 'right' });
      
      // Add invoice details section
      const startY = 50;
      
      // Invoice number and dates
      doc.setTextColor(textColor);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Invoice #: ${invoice.invoice_number}`, 14, startY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedColor);
      doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 14, startY + 10);
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 14, startY + 18);
      
      // Status badge
      doc.setFillColor(getStatusColor(invoice.status));
      doc.roundedRect(pageWidth - 60, startY - 5, 50, 15, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(
        invoice.status.toUpperCase(), 
        pageWidth - 35, 
        startY + 3, 
        { align: 'center' }
      );
      
      // Bill to section
      const billToY = startY + 30;
      doc.setTextColor(secondaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 14, billToY);
      
      doc.setTextColor(textColor);
      doc.setFontSize(11);
      doc.text(invoice.client_name, 14, billToY + 10);
      
      // From section
      doc.setTextColor(secondaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FROM', pageWidth - 90, billToY);
      
      doc.setTextColor(textColor);
      doc.setFontSize(11);
      doc.text(settings?.company_name || 'My Company', pageWidth - 90, billToY + 10);
      
      if (settings?.address) {
        doc.setFontSize(9);
        doc.text(settings.address, pageWidth - 90, billToY + 18);
      }
      
      if (settings?.email) {
        doc.setFontSize(9);
        doc.text(settings.email, pageWidth - 90, billToY + 26);
      }
      
      if (settings?.phone) {
        doc.setFontSize(9);
        doc.text(settings.phone, pageWidth - 90, billToY + 34);
      }
      
      // Add items table
      const tableStartY = billToY + 50;
      
      const tableColumn = [
        "Item Description", 
        "Quantity", 
        "Unit Price", 
        "Amount"
      ];
      
      const tableRows = invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        `$${item.unit_price.toFixed(2)}`,
        `$${item.amount.toFixed(2)}`
      ]);
      
      // Configure the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: 'grid',
        headStyles: {
          fillColor: [110, 89, 165],
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
      });
      
      // Get the final Y position after the table is rendered
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Total section
      doc.setFillColor(245, 245, 245);
      doc.rect(pageWidth - 100, finalY, 90, 20, 'F');
      
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', pageWidth - 90, finalY + 13);
      
      doc.setTextColor(primaryColor);
      doc.setFontSize(14);
      doc.text(
        `$${invoice.total_amount.toFixed(2)}`, 
        pageWidth - 10, 
        finalY + 13, 
        { align: 'right' }
      );
      
      // Add notes if available
      if (invoice.notes) {
        const notesY = finalY + 40;
        doc.setTextColor(secondaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES', 14, notesY);
        
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.notes, 14, notesY + 10);
      }
      
      // Add footer
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setTextColor(mutedColor);
      doc.setFontSize(8);
      doc.text(
        `${settings?.company_name || 'My Bill Book'} - Invoice #${invoice.invoice_number}`, 
        pageWidth / 2, 
        footerY, 
        { align: 'center' }
      );
      
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
  
  const getStatusColor = (status: string): number[] => {
    switch (status.toLowerCase()) {
      case "paid":
        return [39, 174, 96]; // Green
      case "sent":
        return [41, 128, 185]; // Blue
      case "overdue":
        return [192, 57, 43]; // Red
      default:
        return [149, 165, 166]; // Gray
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
