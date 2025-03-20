
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileUpload, 
  FileText, 
  ArrowRight, 
  Building, 
  Receipt, 
  Calculator, 
  CreditCard, 
  CheckCircle 
} from "lucide-react";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  receiptUpload: z.any().optional(),
});

const GetStarted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      address: "",
      email: "",
      phone: "",
      taxId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to save your business details",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          business_name: values.businessName,
          business_type: values.businessType,
          address: values.address,
          email: values.email,
          phone: values.phone,
          tax_id: values.taxId,
        });

      if (error) throw error;

      toast({
        title: "Setup Complete",
        description: "Your business profile has been saved. You're ready to start!",
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save business profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to upload files",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const files = Array.from(e.target.files);
      const newUploadedFiles = [...uploadedFiles];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        newUploadedFiles.push(file.name);
      }

      setUploadedFiles(newUploadedFiles);
      
      toast({
        title: "Upload Successful",
        description: `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 mx-auto animate-fadeIn">
      <h1 className="text-3xl font-bold text-center mb-8">Get Started with My Bill Book</h1>
      
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Setup Your Business Profile</CardTitle>
          <CardDescription>
            Complete the following steps to set up your account and start managing your finances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-8 border-b pb-4">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="flex justify-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
                  1
                </div>
              </div>
              <p className="text-sm font-medium">Business Details</p>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="flex justify-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
                  2
                </div>
              </div>
              <p className="text-sm font-medium">Upload Documents</p>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="flex justify-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
                  3
                </div>
              </div>
              <p className="text-sm font-medium">Complete</p>
            </div>
          </div>
          
          {step === 1 && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => setStep(2))} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sole_proprietor">Sole Proprietorship</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="nonprofit">Non-profit</SelectItem>
                            <SelectItem value="freelancer">Freelancer</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Textarea placeholder="Your business address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / EIN (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your tax identification number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    Next Step <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-muted/40 rounded-lg p-6 text-center">
                <FileUpload className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Upload Your Documents</h3>
                <p className="text-muted-foreground mb-4">
                  Upload receipts, invoices, or other financial documents to get started.
                </p>
                
                <div className="relative">
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    disabled={uploading}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-2 mb-4"
                  >
                    {uploading ? "Uploading..." : "Select Files"}
                  </Button>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <h4 className="font-medium mb-2">Uploaded Files:</h4>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="flex items-center text-sm bg-background rounded p-2">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Previous Step
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="gap-2"
                >
                  Next Step <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-medium mb-2">You're All Set!</h3>
                <p className="text-muted-foreground mb-6">
                  Your profile is ready. Now you can start managing your business finances.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 hover:bg-muted/20 transition cursor-pointer" onClick={() => navigate('/invoices')}>
                  <div className="flex items-center gap-3">
                    <Receipt className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Create Invoices</h4>
                      <p className="text-sm text-muted-foreground">Start billing your clients</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 hover:bg-muted/20 transition cursor-pointer" onClick={() => navigate('/expenses')}>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Track Expenses</h4>
                      <p className="text-sm text-muted-foreground">Manage your business spending</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 hover:bg-muted/20 transition cursor-pointer" onClick={() => navigate('/taxes')}>
                  <div className="flex items-center gap-3">
                    <Calculator className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Tax Management</h4>
                      <p className="text-sm text-muted-foreground">Keep track of tax deductions</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 hover:bg-muted/20 transition cursor-pointer" onClick={() => navigate('/dashboard')}>
                  <div className="flex items-center gap-3">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Dashboard</h4>
                      <p className="text-sm text-muted-foreground">View business overview</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => onSubmit(form.getValues())} className="gap-2">
                  Complete Setup <CheckCircle size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStarted;
