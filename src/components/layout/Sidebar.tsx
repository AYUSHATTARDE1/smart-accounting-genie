
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart3,
  Receipt,
  FileText,
  Calculator,
  MessageSquare,
  Settings,
  User,
  LogOut,
  CreditCard,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
}

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: CreditCard,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: Receipt,
    badge: "New",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Tax Optimization",
    href: "/taxes",
    icon: Calculator,
  },
];

const secondaryNavItems: NavItem[] = [
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been logged out successfully.",
    });
    // Add actual logout logic here
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col w-72 transition-transform duration-300 ease-in-out transform bg-sidebar border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed && "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link to="/" className="flex items-center space-x-2">
          {!isCollapsed ? (
            <>
              <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-primary flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight">CA AI</span>
            </>
          ) : (
            <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-primary flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <div className="mb-6">
            {!isCollapsed && (
              <h2 className="px-4 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Main
              </h2>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0 w-5 h-5",
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="ml-3 whitespace-nowrap">{item.title}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-6">
            {!isCollapsed && (
              <h2 className="px-4 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Support
              </h2>
            )}
            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0 w-5 h-5",
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="ml-3">{item.title}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer hover:bg-accent",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 text-muted-foreground" />
          {!isCollapsed && <span className="ml-3">Log out</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
