
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Sample data
const data = [
  { name: "Jan", amount: 1200 },
  { name: "Feb", amount: 900 },
  { name: "Mar", amount: 1500 },
  { name: "Apr", amount: 1100 },
  { name: "May", amount: 1400 },
  { name: "Jun", amount: 1800 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-md shadow-lg">
        <p className="text-sm font-medium">{`${label}: $${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ExpenseTracker = () => {
  return (
    <Card className="shadow-subtle border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">Expense Tracker</CardTitle>
          <CardDescription>
            Your monthly expenses for the last 6 months
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs font-medium">
          <Link to="/expenses" className="flex items-center">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.6 + (index % 6) * 0.05})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Largest expense</span>
            <span className="font-medium">Office Rent - $1,250.00</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Frequent category</span>
            <span className="font-medium">Software Subscriptions</span>
          </div>
          <div className="pt-4">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/expenses/new" className="flex items-center justify-center">
                <Plus className="mr-1 h-4 w-4" /> Add New Expense
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTracker;
