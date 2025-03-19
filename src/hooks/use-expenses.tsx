
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

// Sample initial data
const initialExpenses: Expense[] = [
  {
    id: "exp-001",
    date: "2023-08-15",
    merchant: "Adobe Creative Cloud",
    category: "Software",
    amount: 52.99,
    status: "approved",
  },
  {
    id: "exp-002",
    date: "2023-08-14",
    merchant: "Office Depot",
    category: "Office Supplies",
    amount: 125.65,
    status: "approved",
  },
  {
    id: "exp-003",
    date: "2023-08-10",
    merchant: "AWS Cloud Services",
    category: "Hosting",
    amount: 215.30,
    status: "approved",
  },
  {
    id: "exp-004",
    date: "2023-08-08",
    merchant: "Delta Airlines",
    category: "Travel",
    amount: 450.00,
    status: "approved",
  },
  {
    id: "exp-005",
    date: "2023-08-05",
    merchant: "WeWork",
    category: "Rent",
    amount: 1250.00,
    status: "approved",
  },
  {
    id: "exp-006",
    date: "2023-08-03",
    merchant: "Uber",
    category: "Transportation",
    amount: 32.15,
    status: "approved",
  },
  {
    id: "exp-007",
    date: "2023-08-01",
    merchant: "Mailchimp",
    category: "Marketing",
    amount: 75.00,
    status: "pending",
  },
];

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
    // For now, we'll use our sample data
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      setExpenses(initialExpenses);
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
