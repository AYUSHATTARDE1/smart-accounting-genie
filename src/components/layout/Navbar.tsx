
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import { useToast } from "@/hooks/use-toast";
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Search,
  X,
  UserCircle
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar = ({ toggleSidebar, isSidebarOpen }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Check if dark mode is enabled on initial load
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  // Handle scroll events to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      toast({
        description: "Dark mode enabled",
        duration: 1500,
      });
    } else {
      document.documentElement.classList.remove("dark");
      toast({
        description: "Light mode enabled",
        duration: 1500,
      });
    }
  };

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Home";
      case "/dashboard":
        return "Dashboard";
      case "/expenses":
        return "Expenses";
      case "/reports":
        return "Reports";
      case "/taxes":
        return "Tax Optimization";
      case "/settings":
        return "Settings";
      case "/login":
        return "Login";
      case "/signup":
        return "Sign Up";
      default:
        return "CA AI";
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled 
          ? "bg-white/80 dark:bg-black/50 shadow-subtle" 
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-xl font-medium tracking-tight">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {!isMobile && !isSearchOpen ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="rounded-full"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    toast({
                      title: "No new notifications",
                      description: "You're all caught up!",
                      duration: 2000,
                    });
                  }}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="rounded-full"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                
                {location.pathname !== "/login" && location.pathname !== "/signup" && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      toast({
                        title: "Account",
                        description: "Profile options coming soon",
                      });
                    }}
                  >
                    <UserCircle className="h-5 w-5" />
                  </Button>
                )}
              </>
            ) : isMobile && !isSearchOpen ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </>
            ) : null}

            {isSearchOpen && (
              <div className="absolute inset-0 flex items-center justify-center px-4 bg-background/95 backdrop-blur-sm animate-fadeIn z-50">
                <div className="relative w-full max-w-2xl">
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    className="w-full h-12 pl-4 pr-10 input-glass rounded-lg"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {location.pathname === "/" && (
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link to="/login">Login</Link>
                </Button>
                <CustomButton 
                  variant="default" 
                  size="sm" 
                  className="animate-pulse"
                  asChild
                >
                  <Link to="/signup">Get Started</Link>
                </CustomButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
