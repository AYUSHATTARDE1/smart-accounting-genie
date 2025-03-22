
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const businessTypes = [
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "s-corporation", label: "S Corporation" },
  { value: "non-profit", label: "Non-Profit Organization" },
];

const GetStarted = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [businessType, setBusinessType] = useState("sole-proprietorship");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get current user information
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "Authentication required",
            description: "Please sign in to set up your business",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        if (!data.session) {
          toast({
            title: "Authentication required",
            description: "Please sign in to set up your business",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Check if user already has a business profile
        const { data: profileData, error: profileError } = await supabase
          .from("business_profiles")
          .select("*")
          .eq("user_id", data.session.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error checking profile:", profileError);
        }
        
        if (profileData) {
          // User already has a profile, set form fields with existing data
          setBusinessName(profileData.business_name || "");
          setEmail(profileData.email || "");
          setPhone(profileData.phone || "");
          setAddress(profileData.address || "");
          setTaxId(profileData.tax_id || "");
          setBusinessType(profileData.business_type || "sole-proprietorship");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!businessName || !email || !businessType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      const profileData = {
        user_id: user.id,
        business_name: businessName,
        email: email,
        phone: phone,
        address: address,
        tax_id: taxId,
        business_type: businessType,
      };
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking profile:", checkError);
      }
      
      let result;
      
      if (existingProfile?.id) {
        // Update existing profile
        result = await supabase
          .from("business_profiles")
          .update(profileData)
          .eq("id", existingProfile.id);
      } else {
        // Insert new profile
        result = await supabase
          .from("business_profiles")
          .insert(profileData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Success",
        description: "Your business information has been saved.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving business data:", error);
      toast({
        title: "Error",
        description: "Failed to save business information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Checking your account...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Set Up Your Business</CardTitle>
          <CardDescription>
            Provide your business information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-base">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="businessType" className="text-base">
                  Business Type <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={businessType} 
                  onValueChange={setBusinessType}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-base">
                  Business Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@business.com"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-base">
                  Business Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="text-base">
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, Zip"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="taxId" className="text-base">
                  Tax ID / EIN
                </Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save and Continue'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default GetStarted;
