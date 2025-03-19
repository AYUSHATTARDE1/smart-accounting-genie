
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Close sidebar when changing routes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Is this the login or signup page?
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isHomePage = location.pathname === "/";

  // Don't show the sidebar and navbar on auth pages
  if (isAuthPage) {
    return (
      <main className="min-h-screen">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} />

      {/* Backdrop for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main
        className={cn(
          "transition-all duration-300 pt-16",
          isSidebarOpen && !isMobile ? "ml-72" : "ml-0"
        )}
      >
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </div>
      </main>

      {/* AI Chat Button (not shown on home page) */}
      {!isHomePage && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all",
              isChatOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
            )}
            onClick={toggleChat}
          >
            {isChatOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      {/* AI Chat Widget */}
      {isChatOpen && !isHomePage && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-96 bg-card rounded-lg shadow-glass border border-border overflow-hidden animate-slideIn">
          <div className="h-full flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between bg-primary/5">
              <h3 className="font-medium flex items-center text-sm">
                <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                AI Financial Assistant
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleChat}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-accent rounded-lg p-3 max-w-[85%]">
                <p className="text-sm">
                  Hello! I'm your AI financial assistant. How can I help you today?
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 max-w-[85%] ml-auto">
                <p className="text-sm">
                  What's my current account balance?
                </p>
              </div>
              <div className="bg-accent rounded-lg p-3 max-w-[85%]">
                <p className="text-sm">
                  Your current account balance is $12,580.45. You have 3 upcoming bills totaling $850 due next week.
                </p>
              </div>
            </div>
            <div className="p-3 border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about your finances..."
                  className="w-full p-2 pr-10 rounded-md input-glass text-sm"
                />
                <Button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  size="icon"
                  variant="ghost"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
