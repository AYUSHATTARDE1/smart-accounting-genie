
import {
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
}

const MetricCard = ({ title, value, change, icon: Icon, trend }: MetricCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-subtle card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
          <div className="flex items-center mt-2">
            {trend === "up" && (
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            )}
            {trend === "down" && (
              <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </span>
          </div>
        </div>
        <div className="rounded-full p-3 bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

const FinancialMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Revenue"
        value="$24,532.95"
        change="+12.5% from last month"
        icon={DollarSign}
        trend="up"
      />
      <MetricCard
        title="Total Expenses"
        value="$8,935.60"
        change="+3.2% from last month"
        icon={CreditCard}
        trend="up"
      />
      <MetricCard
        title="Net Income"
        value="$15,597.35"
        change="+18.3% from last month"
        icon={TrendingUp}
        trend="up"
      />
      <MetricCard
        title="Pending Invoices"
        value="$3,250.00"
        change="3 invoices pending"
        icon={Receipt}
        trend="neutral"
      />
    </div>
  );
};

export default FinancialMetrics;
