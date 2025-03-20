
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Download, Trash2, CheckCircle2, Eye, Plus, FileQuestion } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FileItem {
  name: string;
  id: string;
  size: number;
  created_at: string;
  url: string;
  type: string;
}

const categories = [
  "Invoice",
  "Receipt",
  "Tax Document",
  "Bank Statement",
  "Contract",
  "Other",
];

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processStage, setProcessStage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to view your documents",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .storage
        .from("documents")
        .list(user.id, {
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        throw error;
      }

      if (data) {
        const filePromises = data.map(async (file) => {
          const { data: urlData } = await supabase
            .storage
            .from("documents")
            .createSignedUrl(`${user.id}/${file.name}`, 3600);

          const fileType = getFileType(file.name);

          return {
            id: file.id,
            name: file.name,
            size: file.metadata.size,
            created_at: file.created_at,
            url: urlData?.signedUrl || "",
            type: fileType,
          };
        });

        const fileData = await Promise.all(filePromises);
        setFiles(fileData);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your documents.",
        variant: "destructive",
      });
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || "";
    
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "Image";
    } else if (["pdf"].includes(extension)) {
      return "PDF";
    } else if (["doc", "docx"].includes(extension)) {
      return "Word";
    } else if (["xls", "xlsx", "csv"].includes(extension)) {
      return "Spreadsheet";
    } else {
      return "Other";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setUploading(true);
    setIsProcessingDialogOpen(true);
    setUploadProgress(0);
    setProcessStage("Uploading files...");
    
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
      const totalFiles = files.length;
      let uploadedCount = 0;

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        // Create a more readable filename that includes the original name
        const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${cleanFileName}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Update progress
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
        
        const { error } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (error) {
          throw error;
        }
        
        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      // Process documents
      setProcessStage("Processing documents...");
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProcessStage("Extracting data...");
      // Simulate data extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProcessStage("Complete");
      
      toast({
        title: "Upload Successful",
        description: `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded and processed successfully.`,
      });
      
      // Refresh the file list
      await fetchFiles();
      
      setTimeout(() => {
        setIsProcessingDialogOpen(false);
        setProcessStage(null);
      }, 1000);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
      setIsProcessingDialogOpen(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { error } = await supabase
        .storage
        .from('documents')
        .remove([`${user.id}/${fileName}`]);
      
      if (error) throw error;
      
      setFiles(files.filter(file => file.id !== fileId));
      
      toast({
        title: "File Deleted",
        description: "The file has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const viewFile = (url: string) => {
    window.open(url, "_blank");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || file.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "Image":
        return <img src="/placeholder.svg" className="w-8 h-8 rounded" alt="Thumbnail" />;
      case "PDF":
        return <FileText className="w-6 h-6 text-red-500" />;
      case "Word":
        return <FileText className="w-6 h-6 text-blue-500" />;
      case "Spreadsheet":
        return <FileText className="w-6 h-6 text-green-500" />;
      default:
        return <FileQuestion className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="container py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Manager</h1>
          <p className="text-muted-foreground">
            Upload, process, and manage your business documents
          </p>
        </div>
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" /> Upload Documents
            </Button>
          </DialogTrigger>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2 mb-6">
            <Plus className="h-4 w-4" /> Upload New Documents
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload invoices, receipts, or other financial documents to analyze and process.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="file-upload">Select files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, Images (JPG, PNG), Documents (DOC, DOCX), Spreadsheets (XLS, XLSX, CSV)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => document.getElementById("dialog-close")?.click()}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Documents</DialogTitle>
            <DialogDescription>
              Please wait while we upload and process your documents.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <div className="flex items-center justify-between text-sm">
              <span>{processStage}</span>
              <span>{uploadProgress}%</span>
            </div>
            
            {processStage === "Complete" && (
              <div className="flex items-center justify-center p-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Your Documents</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Documents</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Image">Images</SelectItem>
                  <SelectItem value="Word">Word Documents</SelectItem>
                  <SelectItem value="Spreadsheet">Spreadsheets</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            {files.length} documents uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                  <p className="text-muted-foreground">
                    {files.length === 0 
                      ? "Upload some documents to get started."
                      : "No documents match your search criteria."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-36 flex items-center justify-center bg-muted/40 p-4">
                        {getFileIcon(file.type)}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium truncate" title={file.name}>
                              {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs font-medium mt-1">{file.type}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => viewFile(file.url)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => downloadFile(file.url, file.name)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                  <p className="text-muted-foreground">
                    {files.length === 0 
                      ? "Upload some documents to get started."
                      : "No documents match your search criteria."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="truncate max-w-[200px]" title={file.name}>
                              {file.name}
                            </span>
                          </TableCell>
                          <TableCell>{file.type}</TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button size="icon" variant="ghost" onClick={() => viewFile(file.url)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => downloadFile(file.url, file.name)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteFile(file.id, file.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
