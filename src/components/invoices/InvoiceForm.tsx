import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useInvoices, Invoice, InvoiceItem, InvoiceStatus } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const invoiceSchema = z.object({
  client_name: z.string().min(2, "Client name is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  initialData?: Invoice;
  onSuccess?: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  initialData, 
  onSuccess 
}) => {
  const navigate = useNavigate();
  const { createInvoice, updateInvoice } = useInvoices();
  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [{ description: "", quantity: 1, unit_price: 0, amount: 0 }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData ? {
      client_name: initialData.client_name,
      invoice_number: initialData.invoice_number,
      issue_date: initialData.issue_date,
      due_date: initialData.due_date,
      status: initialData.status,
      notes: initialData.notes || "",
    } : {
      client_name: "",
      invoice_number: `INV-${new Date().getTime().toString().slice(-6)}`,
      issue_date: format(new Date(), "yyyy-MM-dd"),
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      status: "draft",
      notes: "",
    },
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unit_price: 0, amount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === "quantity" || field === "unit_price") {
      const quantity = field === "quantity" 
        ? parseFloat(value as string) 
        : newItems[index].quantity;
        
      const unitPrice = field === "unit_price" 
        ? parseFloat(value as string) 
        : newItems[index].unit_price;
        
      newItems[index].amount = parseFloat((quantity * unitPrice).toFixed(2));
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    if (items.length === 0 || items.some(item => !item.description)) {
      alert("Please add at least one item with a description");
      return;
    }

    setIsSubmitting(true);

    try {
      const invoiceData: Invoice = {
        client_name: data.client_name,
        invoice_number: data.invoice_number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        status: data.status as InvoiceStatus,
        notes: data.notes,
        items: items,
        total_amount: calculateTotal(),
      };

      if (initialData?.id) {
        await updateInvoice({ ...invoiceData, id: initialData.id });
      } else {
        await createInvoice(invoiceData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/invoices");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-000001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Invoice Items</h3>
          <div className="rounded-md border overflow-hidden">
            <div className="bg-muted/50 p-3 grid grid-cols-12 gap-2 text-sm font-medium">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((item, index) => (
              <div key={index} className="p-3 grid grid-cols-12 gap-2 border-t">
                <div className="col-span-5">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, "unit_price", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    disabled
                    value={`$${item.amount.toFixed(2)}`}
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <div className="p-3 border-t flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleAddItem}
              >
                <Plus size={16} />
                Add Item
              </Button>
              <div className="font-medium">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes or payment instructions" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/invoices")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={16} />
                Save Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
