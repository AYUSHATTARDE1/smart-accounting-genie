
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TaxEntry, useTaxEntries } from "@/hooks/use-tax-entries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Calculator, Plus, Download, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const TaxEntryList = () => {
  const { taxEntries, isLoading, deleteTaxEntry, downloadTaxReportAsPdf } = useTaxEntries();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEdit = (entry: TaxEntry) => {
    if (entry.id) {
      navigate(`/taxes/edit/${entry.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTaxEntry(id);
      toast({
        title: "Success",
        description: "Tax entry deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete tax entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete tax entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownloadReport = async (year?: number) => {
    setIsDownloading(true);
    try {
      await downloadTaxReportAsPdf(year);
    } finally {
      setIsDownloading(false);
    }
  };

  // Group tax entries by year
  const groupedEntries = taxEntries.reduce((acc, entry) => {
    const year = entry.tax_year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(entry);
    return acc;
  }, {} as Record<number, TaxEntry[]>);

  // Calculate totals by category for each year
  const getTotalsByCategory = (entries: TaxEntry[]) => {
    return entries.reduce((acc, entry) => {
      const { category, amount } = entry;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Tax Management</CardTitle>
          <CardDescription>
            Track your tax deductions and expenses for better tax planning.
          </CardDescription>
        </div>
        <Button 
          onClick={() => navigate("/taxes/new")}
          className="gap-2"
        >
          <Plus size={16} />
          Add Tax Entry
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <Loader2 size={40} className="mx-auto mb-2 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading tax entries...</p>
            </div>
          </div>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-8">
            <Calculator size={40} className="mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">No tax entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first tax entry to start tracking.
            </p>
            <Button 
              onClick={() => navigate("/taxes/new")}
              className="gap-2"
            >
              <Plus size={16} />
              Add Tax Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedEntries)
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => {
                const entries = groupedEntries[Number(year)];
                const totalsByCategory = getTotalsByCategory(entries);
                const totalDeductions = Object.values(totalsByCategory).reduce(
                  (sum, amount) => sum + amount,
                  0
                );

                return (
                  <div key={year} className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-lg font-medium">Tax Year {year}</h3>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          Total Deductions: ${totalDeductions.toFixed(2)}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleDownloadReport(Number(year))}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                          Export
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">
                                {entry.category}
                              </TableCell>
                              <TableCell>{entry.description}</TableCell>
                              <TableCell>
                                {new Date(entry.date_added).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                ${entry.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(entry)}
                                  >
                                    <Edit size={16} />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                      >
                                        <Trash2 size={16} />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Tax Entry</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this tax entry? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => entry.id && handleDelete(entry.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          {isDeleting === entry.id ? (
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                          ) : (
                                            <Trash2 size={16} className="mr-2" />
                                          )}
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="rounded-md border p-4 bg-muted/30">
                      <h4 className="font-medium mb-2">Category Summary</h4>
                      <div className="space-y-2">
                        {Object.entries(totalsByCategory).map(([category, total]) => (
                          <div 
                            key={category} 
                            className="flex justify-between items-center text-sm"
                          >
                            <span>{category}</span>
                            <span className="font-medium">${total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
        <Button 
          onClick={() => handleDownloadReport()} 
          className="gap-2"
          disabled={isDownloading || taxEntries.length === 0}
        >
          {isDownloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaxEntryList;
