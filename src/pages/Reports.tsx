
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Printer, Calendar, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data for charts
const revenueData = [
  { name: "Jan", revenue: 3800, expenses: 2200, profit: 1600 },
  { name: "Feb", revenue: 4500, expenses: 2800, profit: 1700 },
  { name: "Mar", revenue: 5200, expenses: 3200, profit: 2000 },
  { name: "Apr", revenue: 4000, expenses: 2500, profit: 1500 },
  { name: "May", revenue: 4800, expenses: 2900, profit: 1900 },
  { name: "Jun", revenue: 5500, expenses: 3500, profit: 2000 },
  { name: "Jul", revenue: 6200, expenses: 3800, profit: 2400 },
  { name: "Aug", revenue: 6800, expenses: 4000, profit: 2800 },
];

const expenseCategories = [
  { name: "Software", value: 35 },
  { name: "Office", value: 20 },
  { name: "Marketing", value: 15 },
  { name: "Travel", value: 10 },
  { name: "Rent", value: 20 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const MONTHS = ["This Month", "Last Month", "Last 3 Months", "Last 6 Months", "This Year", "Last Year", "Custom"];

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 3 Months");
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Report Exported",
      description: "Your report has been exported successfully",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Printing Report",
      description: "Preparing report for printing...",
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Insights</h1>
          <p className="text-muted-foreground">
            Financial analytics and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="taxes">Tax Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-subtle border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Revenue vs Expenses</CardTitle>
                <CardDescription>Comparison of revenue and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FF8042" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#FF8042"
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Profit Margin</CardTitle>
                <CardDescription>Monthly profit margin analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, "Profit"]}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Bar
                        dataKey="profit"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-subtle border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Expense Breakdown</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, "Percentage"]}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                  {expenseCategories.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-subtle border-border md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Key Performance Indicators</CardTitle>
                <CardDescription>Financial health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Cash Flow</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-semibold">$12,450</div>
                    <div className="text-xs text-green-500 mt-1">
                      +15% from last period
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Profit Margin</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-semibold">32.5%</div>
                    <div className="text-xs text-green-500 mt-1">
                      +3.2% from last period
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Expense Ratio</span>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-semibold">58.2%</div>
                    <div className="text-xs text-green-500 mt-1">
                      -2.5% from last period
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Revenue Growth</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-semibold">18.7%</div>
                    <div className="text-xs text-green-500 mt-1">
                      +5.3% from last period
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit-loss" className="mt-6">
          <Card className="shadow-subtle border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Profit & Loss Statement</CardTitle>
              <CardDescription>
                Detailed financial summary for {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Revenue</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Service Revenue</span>
                      <span className="font-medium">$32,450.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Product Sales</span>
                      <span className="font-medium">$12,785.50</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Other Income</span>
                      <span className="font-medium">$1,250.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2 font-medium">
                      <span>Total Revenue</span>
                      <span>$46,485.50</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Salaries & Wages</span>
                      <span className="font-medium">$18,450.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Rent & Utilities</span>
                      <span className="font-medium">$4,250.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Software & Subscriptions</span>
                      <span className="font-medium">$2,350.75</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Marketing & Advertising</span>
                      <span className="font-medium">$3,125.50</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Office Supplies</span>
                      <span className="font-medium">$785.25</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Insurance</span>
                      <span className="font-medium">$1,250.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2 font-medium">
                      <span>Total Expenses</span>
                      <span>$30,211.50</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2">
                  <div className="flex items-center justify-between py-2 text-lg font-bold">
                    <span>Net Profit</span>
                    <span className="text-primary">$16,274.00</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-sm">
                    <span>Profit Margin</span>
                    <span className="font-medium">35.0%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card className="shadow-subtle border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Expense Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Expense analysis content will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="mt-6">
          <Card className="shadow-subtle border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Tax Insights</CardTitle>
              <CardDescription>AI-powered tax planning recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Tax insights content will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
