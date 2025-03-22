
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name: string;
  company_logo_url?: string;
  address?: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  business_type?: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return null;
      }
      
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setSettings(data ? {
        id: data.id,
        user_id: data.user_id,
        company_name: data.business_name || "",
        company_logo_url: data.logo_url || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        tax_id: data.tax_id || "",
        business_type: data.business_type || ""
      } : null);
      
      return data;
    } catch (error) {
      console.error("Error fetching company settings:", error);
      toast({
        title: "Error",
        description: "Failed to load company settings",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to upload logo",
          variant: "destructive",
        });
        return null;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;
      
      // Check if the bucket exists before uploading
      const { data: buckets } = await supabase
        .storage
        .listBuckets();
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'company-assets');
      
      if (!bucketExists) {
        console.error("Bucket 'company-assets' does not exist");
        toast({
          title: "Upload failed",
          description: "Storage bucket not configured properly",
          variant: "destructive",
        });
        return null;
      }
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload company logo",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveSettings = async (updatedSettings: CompanySettings): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to save settings",
          variant: "destructive",
        });
        return false;
      }
      
      const profileData = {
        user_id: user.id,
        business_name: updatedSettings.company_name,
        logo_url: updatedSettings.company_logo_url,
        address: updatedSettings.address,
        email: updatedSettings.email,
        phone: updatedSettings.phone,
        tax_id: updatedSettings.tax_id,
        business_type: updatedSettings.business_type || "sole-proprietorship" // Set default value
      };
      
      let result;
      
      if (settings?.id) {
        // Update existing profile
        result = await supabase
          .from("business_profiles")
          .update(profileData)
          .eq("id", settings.id);
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
        title: "Settings saved",
        description: "Your company settings have been updated",
      });
      
      await fetchSettings();
      return true;
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    fetchSettings,
    uploadLogo,
    saveSettings
  };
};
