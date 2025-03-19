
import FinancialMetrics from "@/components/dashboard/FinancialMetrics";
import ExpenseTracker from "@/components/dashboard/ExpenseTracker";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight, DollarSign, Clock, Calendar, Info } from "lucide-react";
import { Link } from "react-router-dom";

// Sample data for the pie chart
const data = [
  { name: "Operating Expenses", value: 35 },
  { name: "Taxes", value: 25 },
  { name: "Payroll", value: 20 },
  { name: "Marketing", value: 15 },
  { name: "Others", value: 5 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.2)",
];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview and recent activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button asChild>
            <Link to="/invoices/new">Create Invoice</Link>
          </Button>
        </div>
      </div>

      <FinancialMetrics />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <Card className="shadow-subtle border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Expense Breakdown</CardTitle>
              <CardDescription>Distribution of your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
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
                {data.map((item, index) => (
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
        </div>
        
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <ExpenseTracker />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <RecentTransactions />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-subtle border-border md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Tax Saving Opportunities</CardTitle>
            <CardDescription>AI-detected savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50">
              <div className="mt-0.5">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Home Office Deduction</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You may qualify for a home office deduction based on your expense patterns.
                </p>
                <p className="text-sm font-medium mt-2 text-primary">
                  Potential savings: $1,200
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50">
              <div className="mt-0.5">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Missed Travel Expenses</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  There are business travel expenses that haven't been categorized properly.
                </p>
                <p className="text-sm font-medium mt-2 text-primary">
                  Potential savings: $850
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/taxes">
                View All Opportunities <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-border md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Upcoming Tasks</CardTitle>
            <CardDescription>Actions that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50">
                <div className="mt-0.5">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Quarterly Tax Payment</h3>
                    <span className="text-xs text-amber-500 font-medium">Due in 5 days</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your estimated quarterly tax payment of $3,450 is due soon.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50">
                <div className="mt-0.5">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Review Subscription Expenses</h3>
                    <span className="text-xs text-blue-500 font-medium">Recommended</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI has detected 3 potentially unused subscription services.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50">
                <div className="mt-0.5">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Unpaid Invoice: XYZ Corp</h3>
                    <span className="text-xs text-red-500 font-medium">Overdue by 3 days</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invoice #INV-2023-089 for $2,750 is past due.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
