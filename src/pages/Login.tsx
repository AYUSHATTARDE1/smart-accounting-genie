
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { DollarSign, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on signup path
  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsSignUp(true);
    }
  }, [location.pathname]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setAuthChecked(true);
          return;
        }
        
        if (data.session) {
          console.log("User already authenticated, redirecting");
          // Check if user has a business profile
          const { data: profileData, error: profileError } = await supabase
            .from("business_profiles")
            .select("*")
            .eq("user_id", data.session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error checking profile:", profileError);
          }
          
          if (profileData) {
            navigate("/dashboard");
          } else {
            navigate("/get-started");
          }
        } else {
          console.log("No active session found");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (isSignUp) {
        // Sign up
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        // Sign in
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Success",
        description: isSignUp 
          ? "Account created successfully. Please check your email to verify your account."
          : "You have been logged in successfully",
      });
      
      if (result.data.session) {
        // Check if user has a business profile
        const { data: profileData, error } = await supabase
          .from("business_profiles")
          .select("*")
          .eq("user_id", result.data.session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Profile check error:", error);
        }
          
        if (profileData) {
          navigate("/dashboard");
        } else {
          navigate("/get-started");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="ml-2">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30 animate-fadeIn">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link 
          to="/" 
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border shadow-subtle p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{isSignUp ? "Create an account" : "Welcome back"}</h1>
            <p className="text-muted-foreground">{isSignUp ? "Sign up to get started" : "Sign in to your account"}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                {!isSignUp && (
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-primary hover:text-primary/90"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <CustomButton 
              type="submit" 
              className="w-full"
              isLoading={isLoading}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </CustomButton>
          </form>
          
          <div className="mt-6 text-center text-sm">
            {isSignUp ? (
              <>
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:text-primary/90 font-medium">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="text-primary hover:text-primary/90 font-medium">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
