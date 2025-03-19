
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  category: string;
}

const transactions: Transaction[] = [
  {
    id: "t1",
    name: "Client Payment - ABC Corp",
    amount: 1850.0,
    date: "Today",
    type: "income",
    category: "Invoice Payment",
  },
  {
    id: "t2",
    name: "Adobe Creative Cloud",
    amount: 52.99,
    date: "Yesterday",
    type: "expense",
    category: "Software",
  },
  {
    id: "t3",
    name: "Office Supplies",
    amount: 125.65,
    date: "Yesterday",
    type: "expense",
    category: "Office",
  },
  {
    id: "t4",
    name: "Client Payment - XYZ Inc",
    amount: 3200.0,
    date: "Aug 15, 2023",
    type: "income",
    category: "Invoice Payment",
  },
  {
    id: "t5",
    name: "Server Hosting",
    amount: 75.0,
    date: "Aug 14, 2023",
    type: "expense",
    category: "Hosting",
  },
];

const RecentTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-subtle border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-muted/50 pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "mr-3 flex h-9 w-9 items-center justify-center rounded-full",
                      transaction.type === "income"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    )}
                  >
                    {transaction.type === "income" ? (
                      <ArrowDownLeft
                        className="h-4 w-4 text-green-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowUpRight
                        className="h-4 w-4 text-red-500"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date} · {transaction.category}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "font-medium tabular-nums",
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  )}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {transaction.amount.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
