
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
import InvoiceForm from "./InvoiceForm";
import InvoiceView from "./InvoiceView";

const InvoiceList = () => {
  const { invoices, isLoading, deleteInvoice, downloadInvoiceAsPdf, fetchInvoices } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Force a refresh of invoices when component mounts
    fetchInvoices();
  }, [fetchInvoices]);

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
      await deleteInvoice(id);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    if (invoice.id) {
      setDownloadingId(invoice.id);
      try {
        await downloadInvoiceAsPdf(invoice);
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <FileText size={40} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          </div>
        ) : invoices.length === 0 ? (
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
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(invoice)}
                            >
                              <Edit size={16} />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="sm:max-w-xl">
                            <SheetHeader>
                              <SheetTitle>Edit Invoice</SheetTitle>
                            </SheetHeader>
                            {selectedInvoice && viewMode === "edit" && (
                              <InvoiceForm 
                                initialData={selectedInvoice} 
                                onSuccess={() => {
                                  setViewMode(null);
                                  fetchInvoices();
                                }}
                              />
                            )}
                          </SheetContent>
                        </Sheet>
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
