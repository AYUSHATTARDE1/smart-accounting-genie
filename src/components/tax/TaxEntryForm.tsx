
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { TaxEntry, useTaxEntries } from "@/hooks/use-tax-entries";
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
import { Save } from "lucide-react";

const TAX_CATEGORIES = [
  "Business Expenses",
  "Charitable Donations",
  "Education",
  "Healthcare",
  "Home Office",
  "Interest Payments",
  "Investment Expenses",
  "Retirement Contributions",
  "Self-Employment Taxes",
  "Travel Expenses",
  "Other",
];

const taxEntrySchema = z.object({
  tax_year: z.number().min(2000, "Invalid year").max(2100, "Invalid year"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  date_added: z.string(),
});

type TaxEntryFormValues = z.infer<typeof taxEntrySchema>;

interface TaxEntryFormProps {
  initialData?: TaxEntry;
  onSuccess?: () => void;
}

const TaxEntryForm: React.FC<TaxEntryFormProps> = ({ 
  initialData, 
  onSuccess 
}) => {
  const navigate = useNavigate();
  const { createTaxEntry, updateTaxEntry } = useTaxEntries();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  
  const form = useForm<TaxEntryFormValues>({
    resolver: zodResolver(taxEntrySchema),
    defaultValues: initialData ? {
      tax_year: initialData.tax_year,
      category: initialData.category,
      amount: initialData.amount,
      description: initialData.description || "",
      date_added: initialData.date_added,
    } : {
      tax_year: currentYear,
      category: "",
      amount: 0,
      description: "",
      date_added: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (data: TaxEntryFormValues) => {
    setIsSubmitting(true);

    try {
      const entryData: TaxEntry = {
        tax_year: data.tax_year,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date_added: data.date_added,
      };

      if (initialData?.id) {
        await updateTaxEntry({ ...entryData, id: initialData.id });
      } else {
        await createTaxEntry(entryData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/taxes");
      }
    } catch (error) {
      console.error("Error saving tax entry:", error);
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
            name="tax_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="2000" 
                    max="2100" 
                    placeholder="2023" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_added"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TAX_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional details about this tax entry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => 
              onSuccess ? onSuccess() : navigate("/taxes")
            }
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
                Save Entry
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaxEntryForm;
