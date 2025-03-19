
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Download,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  Briefcase,
  Home,
  ShoppingCart,
  Server,
  Car,
  Utensils,
  Smartphone,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CustomButton } from "@/components/ui/custom-button";

// Sample expenses data
interface Expense {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  receipt?: string;
}

const expenses: Expense[] = [
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

const categories = [
  { name: "Software", icon: Smartphone },
  { name: "Office Supplies", icon: Briefcase },
  { name: "Hosting", icon: Server },
  { name: "Travel", icon: Car },
  { name: "Rent", icon: Home },
  { name: "Transportation", icon: Car },
  { name: "Marketing", icon: ShoppingCart },
  { name: "Food", icon: Utensils },
];

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const { toast } = useToast();

  const handleAddExpense = () => {
    setIsAddExpenseOpen(false);
    toast({
      title: "Expense Added",
      description: "Your expense has been added successfully.",
    });
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.merchant
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? expense.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    const Icon = category?.icon || CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your business expenses
          </p>
        </div>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your expense.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">
                  Merchant
                </label>
                <Input className="col-span-3" placeholder="Enter merchant name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">
                  Date
                </label>
                <Input className="col-span-3" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">
                  Amount
                </label>
                <Input className="col-span-3" type="number" placeholder="0.00" step="0.01" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">
                  Category
                </label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center">
                          <category.icon className="mr-2 h-4 w-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium col-span-1">
                  Receipt
                </label>
                <Input className="col-span-3" type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                Cancel
              </Button>
              <CustomButton onClick={handleAddExpense}>Add Expense</CustomButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 shadow-subtle border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  This Month
                </div>
                <div className="text-2xl font-semibold">$2,450.62</div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <span>↓ 12% vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Last Month
                </div>
                <div className="text-2xl font-semibold">$2,782.45</div>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Quarter to Date
                </div>
                <div className="text-2xl font-semibold">$7,890.22</div>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Year to Date
                </div>
                <div className="text-2xl font-semibold">$24,125.67</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Export Expenses
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Manage Categories
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Set Budget Limits
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search expenses..."
                  className="w-full pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedCategory || ""}
                  onValueChange={(value) =>
                    setSelectedCategory(value === "" ? null : value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center">
                          <category.icon className="mr-2 h-4 w-4" />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="shadow-subtle border-border overflow-hidden">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Merchant
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end">
                          Amount
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-40 text-center text-muted-foreground"
                        >
                          No expenses found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{expense.merchant}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getCategoryIcon(expense.category)}
                              <span className="ml-2">{expense.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${expense.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                expense.status === "approved"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : expense.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {expense.status.charAt(0).toUpperCase() +
                                expense.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredExpenses.length} of {expenses.length} expenses
                  </div>
                  <div className="text-sm font-medium">
                    Total: ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card className="shadow-subtle border-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No pending expenses to review.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <Card className="shadow-subtle border-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                View all your approved expenses here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <Card className="shadow-subtle border-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No rejected expenses found.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Expenses;
