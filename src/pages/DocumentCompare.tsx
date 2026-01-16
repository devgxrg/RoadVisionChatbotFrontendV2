import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileDiff, ArrowRight, CheckCircle, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/common/BackButton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DocumentCompare() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      toast.success(`File "${file.name}" uploaded`);
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) {
      toast.error("Please upload both documents to compare");
      return;
    }

    setIsComparing(true);
    
    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    try {
      const response = await fetch("http://localhost:8000/api/v1/legaliq/compare-documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to compare documents");
      }

      const data = await response.json();
      setComparisonResult(data);
      toast.success("Comparison complete!");
    } catch (error) {
      console.error("Error comparing documents:", error);
      toast.error("Failed to compare documents. Please try again.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setComparisonResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/ceigalliq" />
          <h1 className="text-3xl font-bold text-foreground mb-2 mt-2">Document Compare</h1>
          <p className="text-muted-foreground">
            Upload two versions of a document to detect changes, additions, and deletions.
          </p>
        </div>
        {comparisonResult && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            New Comparison
          </Button>
        )}
      </div>

      {!comparisonResult ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Document 1 Upload */}
          <Card className="border-dashed border-2 shadow-none hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">A</div>
                Original Version
              </CardTitle>
              <CardDescription>Upload the original document (PDF, DOCX)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              {file1 ? (
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{file1.name}</p>
                    <p className="text-sm text-muted-foreground">{(file1.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFile1(null)}>Change File</Button>
                </div>
              ) : (
                <div className="text-center w-full">
                  <input
                    type="file"
                    id="file1-upload"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileUpload(e, setFile1)}
                  />
                  <label htmlFor="file1-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <span className="text-sm font-medium text-primary hover:underline">Click to upload</span>
                    <span className="text-xs text-muted-foreground mt-1">or drag and drop</span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document 2 Upload */}
          <Card className="border-dashed border-2 shadow-none hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">B</div>
                Revised Version
              </CardTitle>
              <CardDescription>Upload the new version to compare</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              {file2 ? (
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{file2.name}</p>
                    <p className="text-sm text-muted-foreground">{(file2.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFile2(null)}>Change File</Button>
                </div>
              ) : (
                <div className="text-center w-full">
                  <input
                    type="file"
                    id="file2-upload"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => handleFileUpload(e, setFile2)}
                  />
                  <label htmlFor="file2-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <span className="text-sm font-medium text-primary hover:underline">Click to upload</span>
                    <span className="text-xs text-muted-foreground mt-1">or drag and drop</span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compare Action */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <Button 
              size="lg" 
              className="w-full md:w-1/3 gap-2 text-lg" 
              onClick={handleCompare}
              disabled={!file1 || !file2 || isComparing}
            >
              {isComparing ? (
                <>Comparing Documents...</>
              ) : (
                <>
                  <FileDiff className="h-5 w-5" />
                  Compare Documents
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{comparisonResult.summary.additions}</div>
                <p className="text-sm text-green-700 font-medium">Additions</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-red-600">{comparisonResult.summary.deletions}</div>
                <p className="text-sm text-red-700 font-medium">Deletions</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-amber-600">{comparisonResult.summary.modifications}</div>
                <p className="text-sm text-amber-700 font-medium">Modifications</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{comparisonResult.summary.similarityScore}</div>
                <p className="text-sm text-blue-700 font-medium">Similarity Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Changes */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Change Log</CardTitle>
                <CardDescription>List of all detected changes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {comparisonResult.changes.map((change: any, index: number) => (
                      <div key={index} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            change.type === 'addition' ? 'secondary' : 
                            change.type === 'deletion' ? 'destructive' : 'secondary'
                          } className={
                            change.type === 'addition' ? 'bg-gray-200 text-gray-800' : 
                            change.type === 'modification' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                          }>
                            {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Page {change.page}</span>
                        </div>
                        <p className="text-sm line-clamp-3">{change.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Comparison View</CardTitle>
                <CardDescription>Visualizing changes between Version A and Version B</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="unified">
                  <TabsList className="mb-4">
                    <TabsTrigger value="unified">Unified View</TabsTrigger>
                    <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="unified" className="min-h-[500px] border rounded-md p-6 bg-background font-serif text-sm leading-relaxed whitespace-pre-wrap">
                    {comparisonResult.unified_view ? (
                      comparisonResult.unified_view.map((segment: any, index: number) => {
                        if (segment.type === 'unchanged') {
                          return <span key={index}>{segment.text}</span>;
                        } else if (segment.type === 'deletion') {
                          // Only show deletion if it's not part of a modification (handled by backend logic, but here we just render)
                          // If it's a pure deletion (line removed), it should be block style.
                          // If it's inline, it's inline.
                          // The backend now returns granular segments.
                          return (
                            <span key={index} className="bg-red-100 dark:bg-red-900/30 px-1 line-through decoration-red-500 text-red-700 dark:text-red-400" title="Deleted">
                              {segment.text}
                            </span>
                          );
                        } else if (segment.type === 'addition') {
                          return (
                            <span key={index} className="bg-green-100 dark:bg-green-900/30 px-1 border-b-2 border-green-500 text-green-700 dark:text-green-400" title="Added">
                              {segment.text}
                            </span>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <p className="text-muted-foreground italic text-center">Unified view not available.</p>
                    )}
                    <p className="text-muted-foreground italic mt-8 text-center">
                      -- End of Document Preview --
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="side-by-side" className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 bg-background/50">
                      <h4 className="font-semibold mb-2 text-center border-b pb-2">Original (Version A)</h4>
                      <div className="font-serif text-xs leading-relaxed opacity-80 whitespace-pre-wrap">
                        {comparisonResult.original_text || "Original text not available."}
                      </div>
                    </div>
                    <div className="border rounded-md p-4 bg-background">
                      <h4 className="font-semibold mb-2 text-center border-b pb-2">Revised (Version B)</h4>
                      <div className="font-serif text-xs leading-relaxed whitespace-pre-wrap">
                        {comparisonResult.revised_text || "Revised text not available."}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
