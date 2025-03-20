
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
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
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const params = useParams();
  const { createTaxEntry, updateTaxEntry, taxEntries } = useTaxEntries();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryData, setEntryData] = useState<TaxEntry | undefined>(initialData);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  
  // If we have an ID parameter, find the corresponding tax entry
  useEffect(() => {
    if (params.id && taxEntries.length > 0) {
      const entry = taxEntries.find(entry => entry.id === params.id);
      if (entry) {
        setEntryData(entry);
      }
    }
  }, [params.id, taxEntries]);
  
  const form = useForm<TaxEntryFormValues>({
    resolver: zodResolver(taxEntrySchema),
    defaultValues: entryData ? {
      tax_year: entryData.tax_year,
      category: entryData.category,
      amount: entryData.amount,
      description: entryData.description || "",
      date_added: entryData.date_added,
    } : {
      tax_year: currentYear,
      category: "",
      amount: 0,
      description: "",
      date_added: format(new Date(), "yyyy-MM-dd"),
    },
  });
  
  // Update form values when entryData changes
  useEffect(() => {
    if (entryData) {
      form.reset({
        tax_year: entryData.tax_year,
        category: entryData.category,
        amount: entryData.amount,
        description: entryData.description || "",
        date_added: entryData.date_added,
      });
    }
  }, [entryData, form]);

  const onSubmit = async (data: TaxEntryFormValues) => {
    setIsSubmitting(true);

    try {
      const taxEntryData: TaxEntry = {
        tax_year: data.tax_year,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date_added: data.date_added,
      };

      if (entryData?.id) {
        await updateTaxEntry({ ...taxEntryData, id: entryData.id });
        toast({
          title: "Success",
          description: "Tax entry updated successfully!",
        });
      } else {
        await createTaxEntry(taxEntryData);
        toast({
          title: "Success",
          description: "Tax entry created successfully!",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/taxes");
      }
    } catch (error) {
      console.error("Error saving tax entry:", error);
      toast({
        title: "Error",
        description: "Failed to save tax entry. Please try again.",
        variant: "destructive",
      });
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
                    onChange={(e) => field.onChange(parseInt(e.target.value) || currentYear)}
                    value={field.value}
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
                value={field.value}
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
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  value={field.value}
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
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
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
