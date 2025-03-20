
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define expense types
export interface Expense {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  receipt?: string;
}

interface NewExpense {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  receipt?: File;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setExpenses([]);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      
      if (fetchError) {
        throw fetchError;
      }
      
      setExpenses(data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses");
      toast({
        title: "Error",
        description: "Failed to load expenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (newExpense: NewExpense) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add expenses",
          variant: "destructive",
        });
        return;
      }
      
      // Handle receipt upload if provided
      let receiptUrl = null;
      if (newExpense.receipt) {
        const fileExt = newExpense.receipt.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(`receipts/${fileName}`, newExpense.receipt);
        
        if (uploadError) {
          console.error("Error uploading receipt:", uploadError);
        } else if (uploadData) {
          receiptUrl = uploadData.path;
        }
      }
      
      const expense = {
        user_id: user.id,
        date: newExpense.date,
        merchant: newExpense.merchant,
        category: newExpense.category,
        amount: newExpense.amount,
        status: "pending" as const,
        receipt: receiptUrl,
      };
      
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert(expense)
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      
      await fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpenseStatus = async (id: string, status: "approved" | "pending" | "rejected") => {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', id);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Success",
        description: `Expense status updated to ${status}!`,
      });
      
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? { ...expense, status } : expense
        )
      );
    } catch (err) {
      console.error("Error updating expense status:", err);
      toast({
        title: "Error",
        description: "Failed to update expense status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExpensesByStatus = (status: "approved" | "pending" | "rejected") => {
    return expenses.filter(expense => expense.status === status);
  };

  const getExpenseById = (id: string) => {
    return expenses.find(expense => expense.id === id);
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const calculateCategoryTotals = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const { category, amount } = expense;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
    
    return categoryTotals;
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
    updateExpenseStatus,
    getExpensesByStatus,
    getExpenseById,
    calculateTotalExpenses,
    calculateCategoryTotals,
    fetchExpenses,
  };
};
