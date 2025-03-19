
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface TaxEntry {
  id?: string;
  user_id?: string;
  tax_year: number;
  category: string;
  amount: number;
  description?: string;
  date_added: string;
  created_at?: string;
  updated_at?: string;
}

export const useTaxEntries = () => {
  const [taxEntries, setTaxEntries] = useState<TaxEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTaxEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("tax_entries")
        .select("*")
        .order("date_added", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setTaxEntries(data || []);
    } catch (err) {
      console.error("Error fetching tax entries:", err);
      setError("Failed to load tax entries. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load tax entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTaxEntry = async (entry: TaxEntry) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("tax_entries")
        .insert({
          user_id: user.id,
          tax_year: entry.tax_year,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          date_added: entry.date_added,
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Tax entry added successfully!",
      });
      
      await fetchTaxEntries();
    } catch (err) {
      console.error("Error creating tax entry:", err);
      setError("Failed to create tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaxEntry = async (entry: TaxEntry) => {
    if (!entry.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("tax_entries")
        .update({
          tax_year: entry.tax_year,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          date_added: entry.date_added,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Tax entry updated successfully!",
      });
      
      await fetchTaxEntries();
    } catch (err) {
      console.error("Error updating tax entry:", err);
      setError("Failed to update tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTaxEntry = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("tax_entries")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Tax entry deleted successfully!",
      });
      
      setTaxEntries(taxEntries.filter(entry => entry.id !== id));
    } catch (err) {
      console.error("Error deleting tax entry:", err);
      setError("Failed to delete tax entry. Please try again.");
      toast({
        title: "Error",
        description: "Failed to delete tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxEntries();
  }, []);

  return {
    taxEntries,
    isLoading,
    error,
    fetchTaxEntries,
    createTaxEntry,
    updateTaxEntry,
    deleteTaxEntry,
  };
};
