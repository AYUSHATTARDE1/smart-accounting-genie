
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Invoice, useInvoices } from "@/hooks/use-invoices";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Eye, FileText, Plus, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import InvoiceForm from "./InvoiceForm";
import InvoiceView from "./InvoiceView";

const InvoiceList = () => {
  const { invoices, isLoading, deleteInvoice, downloadInvoiceAsPdf, fetchInvoices } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("InvoiceList component mounted, fetching invoices...");
    // Force a refresh of invoices when component mounts
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    console.log("Current invoices state:", { count: invoices?.length, isLoading });
  }, [invoices, isLoading]);

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode("edit");
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode("view");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting invoice:", error);
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    if (invoice.id) {
      setDownloadingId(invoice.id);
      try {
        await downloadInvoiceAsPdf(invoice);
      } catch (error) {
        console.error("Error downloading invoice:", error);
        toast({
          title: "Error",
          description: "Failed to download invoice PDF",
          variant: "destructive",
        });
      } finally {
        setDownloadingId(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Invoices</CardTitle>
            <CardDescription>
              Manage and track all your client invoices.
            </CardDescription>
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-16 w-full mb-2" />
              <Skeleton className="h-16 w-full mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Invoices</CardTitle>
          <CardDescription>
            Manage and track all your client invoices.
          </CardDescription>
        </div>
        <Button
          onClick={() => navigate("/invoices/new")}
          className="gap-2"
        >
          <Plus size={16} />
          New Invoice
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invoice to get started.
            </p>
            <Button 
              onClick={() => navigate("/invoices/new")}
              className="gap-2"
            >
              <Plus size={16} />
              Create Invoice
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ${invoice.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(invoice)}
                            >
                              <Eye size={16} />
                              <span className="sr-only">View</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="sm:max-w-lg">
                            <SheetHeader>
                              <SheetTitle>
                                Invoice #{invoice.invoice_number}
                              </SheetTitle>
                            </SheetHeader>
                            {selectedInvoice && viewMode === "view" && (
                              <InvoiceView invoice={selectedInvoice} />
                            )}
                          </SheetContent>
                        </Sheet>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(invoice)}
                        >
                          <Edit size={16} />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(invoice)}
                          disabled={downloadingId === invoice.id}
                        >
                          {downloadingId === invoice.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Download size={16} />
                          )}
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => invoice.id && handleDelete(invoice.id)}
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
