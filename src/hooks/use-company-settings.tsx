
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name: string; // This field is required, which matches our usage
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return null;
      }
      
      console.log("Fetching settings for user:", user.id);
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      console.log("Fetched settings:", data);
      
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
      setError("Failed to load company settings");
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

  const ensureBucketExists = async () => {
    try {
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      
      if (bucketListError) {
        console.error("Error listing buckets:", bucketListError);
        return false;
      }
      
      const bucketName = 'company-assets';
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating ${bucketName} bucket`);
        const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          throw createBucketError;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error checking/creating bucket:", error);
      return false;
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to upload logo",
          variant: "destructive",
        });
        return null;
      }
      
      // Ensure the bucket exists
      const bucketReady = await ensureBucketExists();
      if (!bucketReady) {
        throw new Error("Could not create or access storage bucket");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log("Uploading logo to path:", filePath);
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }
      
      console.log("File uploaded successfully");
      
      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);
      
      console.log("Generated public URL:", urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("Could not upload company logo");
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
    setError(null);
    try {
      console.log("Saving settings:", updatedSettings);
      
      if (!updatedSettings.company_name) {
        throw new Error("Company name is required");
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
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
        logo_url: updatedSettings.company_logo_url || "",
        address: updatedSettings.address || "",
        email: updatedSettings.email || "",
        phone: updatedSettings.phone || "",
        tax_id: updatedSettings.tax_id || "",
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
        console.error("Error saving settings:", result.error);
        throw result.error;
      }
      
      console.log("Settings saved successfully");
      
      toast({
        title: "Settings saved",
        description: "Your company settings have been updated",
      });
      
      await fetchSettings();
      return true;
    } catch (error) {
      console.error("Error saving company settings:", error);
      setError("Failed to save company settings");
      toast({
        title: "Error",
        description: error.message || "Failed to save company settings",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Create bucket on initial load to avoid issues later
    ensureBucketExists();
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    uploadLogo,
    saveSettings
  };
};
