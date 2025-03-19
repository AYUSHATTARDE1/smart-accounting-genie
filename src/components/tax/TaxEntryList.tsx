
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
import { Trash2, Edit, Calculator, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TaxEntryForm from "./TaxEntryForm";

const TaxEntryList = () => {
  const { taxEntries, isLoading, deleteTaxEntry } = useTaxEntries();
  const [selectedEntry, setSelectedEntry] = useState<TaxEntry | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = (entry: TaxEntry) => {
    setSelectedEntry(entry);
    setIsEditSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tax entry?")) {
      await deleteTaxEntry(id);
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
              <Calculator size={40} className="mx-auto mb-2 text-muted-foreground" />
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
                      <div className="text-sm">
                        Total Deductions: ${totalDeductions.toFixed(2)}
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
                                  <Sheet open={isEditSheetOpen && selectedEntry?.id === entry.id} onOpenChange={setIsEditSheetOpen}>
                                    <SheetTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(entry)}
                                      >
                                        <Edit size={16} />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right">
                                      <SheetHeader>
                                        <SheetTitle>Edit Tax Entry</SheetTitle>
                                      </SheetHeader>
                                      {selectedEntry && (
                                        <TaxEntryForm
                                          initialData={selectedEntry}
                                          onSuccess={() => setIsEditSheetOpen(false)}
                                        />
                                      )}
                                    </SheetContent>
                                  </Sheet>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => entry.id && handleDelete(entry.id)}
                                  >
                                    <Trash2 size={16} />
                                    <span className="sr-only">Delete</span>
                                  </Button>
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
    </Card>
  );
};

export default TaxEntryList;
