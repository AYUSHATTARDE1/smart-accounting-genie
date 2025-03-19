
import React from "react";
import { Invoice } from "@/hooks/use-invoices";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface InvoiceViewProps {
  invoice: Invoice;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice }) => {
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
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">Invoice #{invoice.invoice_number}</h3>
          <p className="text-muted-foreground">
            {invoice.created_at
              ? format(new Date(invoice.created_at), "PPP")
              : ""}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            invoice.status
          )}`}
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">From</h4>
          <p className="font-medium">Your Company Name</p>
          <p className="text-sm">123 Business Street</p>
          <p className="text-sm">City, State 12345</p>
          <p className="text-sm">contact@yourcompany.com</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Bill To</h4>
          <p className="font-medium">{invoice.client_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Issue Date</h4>
          <p>{format(new Date(invoice.issue_date), "PPP")}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h4>
          <p>{format(new Date(invoice.due_date), "PPP")}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-2">Invoice Items</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-1/3">
          <div className="flex justify-between py-2">
            <span className="font-medium">Total:</span>
            <span className="font-bold">${invoice.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;
