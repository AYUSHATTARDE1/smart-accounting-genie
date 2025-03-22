
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Upload, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { CompanySettings } from "@/hooks/use-company-settings";

const formSchema = z.object({
  company_name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  address: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
  business_type: z.string({
    required_error: "Please select a business type.",
  }),
});

const PostInitialSetup = () => {
  const navigate = useNavigate();
  const { settings, saveSettings, uploadLogo, isLoading } = useCompanySettings();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.company_logo_url || null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: settings?.company_name || "",
      address: settings?.address || "",
      email: settings?.email || "",
      phone: settings?.phone || "",
      tax_id: settings?.tax_id || "",
      business_type: settings?.business_type || "sole-proprietorship",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setLogoUploading(true);
    let logoUrl = settings?.company_logo_url;

    try {
      // Upload logo if a new one was selected
      if (logoFile) {
        const newLogoUrl = await uploadLogo(logoFile);
        if (newLogoUrl) {
          logoUrl = newLogoUrl;
        }
      }

      // Save company settings
      const updatedSettings: CompanySettings = {
        ...data,
        company_logo_url: logoUrl,
      };

      const success = await saveSettings(updatedSettings);
      if (success) {
        setFormComplete(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Complete Your Setup</h1>
      <p className="text-muted-foreground mb-8">
        Let's add some details about your business to get started.
      </p>

      <div className="flex justify-between mb-8">
        <div className={`flex flex-col items-center ${activeStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2">
            {activeStep > 1 ? <CheckCircle className="h-6 w-6" /> : "1"}
          </div>
          <span className="text-sm">Business Info</span>
        </div>
        <div className="grow h-0.5 bg-muted self-center mx-4" />
        <div className={`flex flex-col items-center ${activeStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2">
            {activeStep > 2 ? <CheckCircle className="h-6 w-6" /> : "2"}
          </div>
          <span className="text-sm">Logo</span>
        </div>
        <div className="grow h-0.5 bg-muted self-center mx-4" />
        <div className={`flex flex-col items-center ${activeStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2">
            {formComplete ? <CheckCircle className="h-6 w-6" /> : "3"}
          </div>
          <span className="text-sm">Complete</span>
        </div>
      </div>

      {formComplete ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Setup Complete!</CardTitle>
            <CardDescription className="text-center">
              Your business profile has been saved. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {activeStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    Enter your business information for invoices and reports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tax_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID / EIN</FormLabel>
                          <FormControl>
                            <Input placeholder="12-3456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Business St, City, State 12345"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="non-profit">Non-Profit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={() => setActiveStep(2)}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>
                    Upload your business logo to be displayed on invoices and reports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center">
                    {logoPreview ? (
                      <div className="mb-4">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-h-48 max-w-full object-contain border rounded p-2"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center mb-4 bg-muted">
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                      <input
                        id="logo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Recommended: Square image, 500x500px or larger
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveStep(3)}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Finish</CardTitle>
                  <CardDescription>
                    Review your information and save to complete setup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-1/3 font-medium">Company Name:</div>
                      <div>{form.getValues("company_name")}</div>
                    </div>
                    <Separator />
                    <div className="flex">
                      <div className="w-1/3 font-medium">Email:</div>
                      <div>{form.getValues("email")}</div>
                    </div>
                    <Separator />
                    <div className="flex">
                      <div className="w-1/3 font-medium">Phone:</div>
                      <div>{form.getValues("phone") || "Not provided"}</div>
                    </div>
                    <Separator />
                    <div className="flex">
                      <div className="w-1/3 font-medium">Tax ID:</div>
                      <div>{form.getValues("tax_id") || "Not provided"}</div>
                    </div>
                    <Separator />
                    <div className="flex">
                      <div className="w-1/3 font-medium">Address:</div>
                      <div>{form.getValues("address") || "Not provided"}</div>
                    </div>
                    <Separator />
                    <div className="flex">
                      <div className="w-1/3 font-medium">Business Type:</div>
                      <div>
                        {form.getValues("business_type") === "sole-proprietorship"
                          ? "Sole Proprietorship"
                          : form.getValues("business_type") === "llc"
                          ? "LLC"
                          : form.getValues("business_type") === "corporation"
                          ? "Corporation"
                          : form.getValues("business_type") === "partnership"
                          ? "Partnership"
                          : "Non-Profit"}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex">
                      <div className="w-1/3 font-medium">Logo:</div>
                      <div>
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Company logo"
                            className="h-10 object-contain"
                          />
                        ) : (
                          "No logo uploaded"
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(2)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading || logoUploading}>
                    {(isLoading || logoUploading) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </Form>
      )}
    </div>
  );
};

export default PostInitialSetup;
