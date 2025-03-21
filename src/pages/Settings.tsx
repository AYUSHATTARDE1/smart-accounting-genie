
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Save, LogOut } from "lucide-react";

interface BusinessProfile {
  id?: string;
  user_id?: string;
  business_name: string;
  business_type: string;
  address: string;
  email: string;
  phone: string;
  tax_id: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    business_name: "",
    business_type: "sole-proprietorship",
    address: "",
    email: "",
    phone: "",
    tax_id: "",
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setProfile({
          id: data.id,
          user_id: data.user_id,
          business_name: data.business_name,
          business_type: data.business_type,
          address: data.address || "",
          email: data.email,
          phone: data.phone || "",
          tax_id: data.tax_id || "",
        });
      }
    } catch (error) {
      console.error("Error fetching business profile:", error);
      toast({
        title: "Error",
        description: "Failed to load business profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.business_name || !profile.email) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
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
      
      const profileData = {
        user_id: user.id,
        business_name: profile.business_name,
        business_type: profile.business_type,
        address: profile.address,
        email: profile.email,
        phone: profile.phone,
        tax_id: profile.tax_id,
      };
      
      let result;
      
      if (profile.id) {
        // Update existing profile
        result = await supabase
          .from("business_profiles")
          .update(profileData)
          .eq("id", profile.id);
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
        title: "Profile saved",
        description: "Your business profile has been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error saving business profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and business settings</p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Update your business information and settings
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
                      value={profile.business_name}
                      onChange={(e) => handleChange("business_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={profile.business_type} 
                      onValueChange={(value) => handleChange("business_type", value)}
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
                    value={profile.address}
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
                      value={profile.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="(123) 456-7890"
                      value={profile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    placeholder="XX-XXXXXXX"
                    value={profile.tax_id}
                    onChange={(e) => handleChange("tax_id", e.target.value)}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full mt-4 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Manage your login credentials and account security settings
                </p>
                <Button variant="outline" className="mt-2" onClick={() => navigate('/reset-password')}>
                  Change Password
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <Label>Account Actions</Label>
                <div className="mt-4">
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
