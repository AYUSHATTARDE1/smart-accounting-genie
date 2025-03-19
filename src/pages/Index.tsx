
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowRight, Check, ChevronRight, DollarSign, BarChart3, FileText, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20 px-4 animate-fadeIn">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium animate-pulse">
            <span>Introducing CA AI — Your Financial Co-Pilot</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Smart Financial Management <br /> Powered by <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your accounting, optimize taxes, and gain powerful financial insights 
            with our AI-powered assistant designed for businesses and individuals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CustomButton size="lg" className="px-8 py-6 rounded-xl font-medium text-base">
              <Link to="/signup">Get Started for Free</Link>
            </CustomButton>
            <Button variant="outline" size="lg" className="rounded-xl font-medium text-base">
              <Link to="/login" className="flex items-center">
                Log In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              CA AI combines powerful financial tools with artificial intelligence to make managing your
              finances effortless and insightful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-subtle card-hover">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Accounting</h3>
              <p className="text-muted-foreground mb-4">
                Automate your expense tracking, invoice management, and financial reporting with AI-powered categorization.
              </p>
              <ul className="space-y-2">
                {["Expense Tracking", "Invoice Management", "Financial Reports"].map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-subtle card-hover">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tax Optimization</h3>
              <p className="text-muted-foreground mb-4">
                Get personalized tax saving recommendations and stay compliant with AI-driven tax insights.
              </p>
              <ul className="space-y-2">
                {["Tax Deduction Finder", "Compliance Monitoring", "Tax Planning"].map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-subtle card-hover">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Financial Assistant</h3>
              <p className="text-muted-foreground mb-4">
                Ask questions, get advice, and receive personalized financial insights from your AI assistant.
              </p>
              <ul className="space-y-2">
                {["Financial Analysis", "Growth Recommendations", "24/7 Assistance"].map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/signup" 
              className="inline-flex items-center text-primary hover:text-primary/90 font-medium"
            >
              Explore All Features <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 border border-primary/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Financial Management?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of businesses and individuals who are saving time and money with CA AI.
            </p>
            <CustomButton size="lg" className="rounded-xl px-8 py-6 font-medium text-base">
              <Link to="/signup">Get Started for Free</Link>
            </CustomButton>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Free 14-day trial.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">CA AI</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CA AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
