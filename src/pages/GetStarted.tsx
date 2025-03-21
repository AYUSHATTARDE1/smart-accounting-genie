
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Calculator, FileText, Upload, ChevronRight } from "lucide-react";

interface FormData {
  businessName: string;
  businessType: string;
  address: string;
  email: string;
  phone: string;
  taxId: string;
}

const GetStarted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    businessType: "sole-proprietorship",
    address: "",
    email: "",
    phone: "",
    taxId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user already has a business profile
  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get existing profile
        const { data, error } = await supabase
          .from("business_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          // User already has a profile, redirect to dashboard
          navigate('/dashboard');
          return;
        }
        
        // Pre-fill email if available
        if (user.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.businessName || !formData.businessType || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to save your business profile.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      // Save business profile
      const { error } = await supabase
        .from("business_profiles")
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          tax_id: formData.taxId,
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile saved",
        description: "Your business profile has been saved successfully.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Error saving business profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 md:py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 md:py-12 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to My Bill Book</h1>
        <p className="text-muted-foreground mt-2">Let's set up your business profile</p>
      </div>
      
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Enter your business information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.businessType} 
                  onValueChange={(value) => handleChange("businessType", value)}
                >
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                placeholder="123 Business St, City, State, ZIP"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@business.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
              <Input
                id="taxId"
                placeholder="XX-XXXXXXX"
                value={formData.taxId}
                onChange={(e) => handleChange("taxId", e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <span className="text-sm text-muted-foreground">or explore these options</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-center" 
              onClick={() => navigate('/calculator')}
            >
              <Calculator className="h-4 w-4" />
              Calculate Finances
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-center" 
              onClick={() => navigate('/document-upload')}
            >
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-center" 
              onClick={() => navigate('/invoices')}
            >
              <FileText className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GetStarted;
