
import { useState, useEffect } from "react";

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
  
  useEffect(() => {
    // In a real app, this would be an API call to fetch expenses
    // For now, we'll use localStorage to persist data
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  useEffect(() => {
    // Save expenses to localStorage when they change
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (newExpense: NewExpense) => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      date: newExpense.date,
      merchant: newExpense.merchant,
      category: newExpense.category,
      amount: newExpense.amount,
      status: "pending", // New expenses are pending by default
    };
    
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateExpenseStatus = (id: string, status: "approved" | "pending" | "rejected") => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, status } : expense
      )
    );
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
    addExpense,
    deleteExpense,
    updateExpenseStatus,
    getExpensesByStatus,
    getExpenseById,
    calculateTotalExpenses,
    calculateCategoryTotals,
  };
};
