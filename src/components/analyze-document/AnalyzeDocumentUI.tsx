import { useRef, useState } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, Download, FileEdit, Bot, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DocumentAnalysisResult } from "@/lib/types/analyze-document";
import { BackButton } from "@/components/common/BackButton";
import { cn } from "@/lib/utils";

interface AnalyzeDocumentUIProps {
  isAnalyzing: boolean;
  isAnalyzed: boolean;
  progress: number;
  result: DocumentAnalysisResult | null;
  previousAnalyses?: DocumentAnalysisResult[];
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onUpload: () => void;
  onUploadAnother: () => void;
  onViewAnalysis?: (analysis: DocumentAnalysisResult) => void;
  onNavigate: (path: string) => void;
  onDownloadReport: () => void;
  onDownloadAllReports?: () => void;
}

export function AnalyzeDocumentUI({
  isAnalyzing,
  isAnalyzed,
  progress,
  result,
  previousAnalyses = [],
  selectedFile,
  onFileSelect,
  onUpload,
  onUploadAnother,
  onViewAnalysis,
  onNavigate,
  onDownloadReport,
  onDownloadAllReports,
}: AnalyzeDocumentUIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt)) {
        onFileSelect(file);
      }
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAnotherClick = () => {
    onUploadAnother();
    // Reset file input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/legaliq" />
          <h1 className="text-3xl font-bold text-foreground mt-2">Analyze Document</h1>
          <p className="text-muted-foreground mt-1">Upload legal documents for AI-powered analysis</p>
        </div>
        {isAnalyzed && (
          <div className="flex gap-2">
            <Button onClick={() => onNavigate("/legaliq/ask-ai")} variant="outline" className="gap-2">
              <Bot className="h-4 w-4" />
              Ask LegalAI
            </Button>
            <Button onClick={handleUploadAnotherClick} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Another
            </Button>
            <Button onClick={onDownloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        )}
        {!isAnalyzed && previousAnalyses.length > 0 && (
          <div className="flex gap-2">
             <Button onClick={onDownloadAllReports} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download All PDFs
            </Button>
          </div>
        )}
      </div>

      {!isAnalyzed ? (
        <div className="space-y-8">
        <Card className={cn(
          "border-2 border-dashed shadow-md transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-primary/30"
        )}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Upload Legal Document</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md mx-auto">
                Drag and drop your document here, or click to browse. Supported formats: PDF, DOC, DOCX
              </p>
              
              {selectedFile ? (
                <div className="flex items-center gap-3 bg-muted p-4 rounded-lg max-w-md mx-auto">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }} 
                  className="gap-2" 
                  size="lg"
                >
                  <FileText className="h-4 w-4" />
                  Choose File
                </Button>
              )}
            </div>
            
            {selectedFile && (
              <Button 
                onClick={onUpload} 
                className="gap-2 mt-4" 
                size="lg"
                disabled={isAnalyzing}
              >
                <Upload className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Document"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Previous Analyses List */}
        {previousAnalyses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Previous Analyses</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {previousAnalyses.map((analysis) => (
                <Card 
                  key={analysis.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onViewAnalysis?.(analysis)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <FileText className="h-5 w-5 text-primary" />
                      <Badge variant={
                        analysis.riskLevel === 'high' ? 'destructive' : 
                        analysis.riskLevel === 'medium' ? 'secondary' : 'default' // Changed 'warning' to 'secondary' or 'default' as 'warning' might not be a standard variant
                      } className={
                        analysis.riskLevel === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                        analysis.riskLevel === 'low' ? 'bg-green-500 hover:bg-green-600' : ''
                      }>
                        {analysis.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 truncate" title={analysis.fileName}>
                      {analysis.fileName || "Unknown Document"}
                    </CardTitle>
                    <CardDescription>
                      {analysis.analysisDate ? new Date(analysis.analysisDate).toLocaleDateString() : "Unknown Date"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {analysis.aiSummary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>
      ) : null}

      {isAnalyzing && (
        <Card className="shadow-md">
          <CardContent className="py-12">
            <div className="text-center mb-6">
              <div className="inline-flex h-16 w-16 rounded-full bg-primary/10 items-center justify-center mb-4 animate-pulse">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyzing with LegalGPT...</h3>
              <p className="text-muted-foreground">Processing your document using AI</p>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {isAnalyzed && result && (
        <div className="space-y-6">
          {/* Risk Rating */}
          <Card className="shadow-md border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className="bg-warning text-white text-lg px-4 py-2">
                  {result.riskLevel.toUpperCase()} RISK
                </Badge>
                <p className="text-muted-foreground">{result.riskMessage}</p>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Extracted Facts */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Extracted Case Facts</CardTitle>
                <CardDescription>[AI Extracted from Document]</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parties</label>
                  <p className="text-foreground">{result.extractedFacts.parties}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Issue Summary</label>
                  <p className="text-foreground">{result.extractedFacts.issueSummary}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Date</label>
                  <p className="text-foreground">{result.extractedFacts.contractDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Key Clauses Identified</label>
                  <div className="space-y-1 mt-1">
                    {result.extractedFacts.keyClauses.map((clause, idx) => (
                      <p key={idx} className="text-sm">• {clause}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Summary */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>AI-Generated Summary</CardTitle>
                <CardDescription>Intelligent document overview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{result.aiSummary}</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis Details */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Detailed Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.riskAnalysis.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      risk.level === "high"
                        ? "bg-destructive/5 border border-destructive/20"
                        : risk.level === "medium"
                        ? "bg-warning/5 border border-warning/20"
                        : "bg-success/5 border border-success/20"
                    }`}
                  >
                    {risk.level === "low" ? (
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          risk.level === "high" ? "text-destructive" : "text-warning"
                        }`}
                      />
                    )}
                    <div>
                      <h4
                        className={`font-semibold ${
                          risk.level === "high"
                            ? "text-destructive"
                            : risk.level === "medium"
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {risk.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Next Steps */}
          <Card className="shadow-md border-primary/20">
            <CardHeader>
              <CardTitle>Suggested Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.nextSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <p className="text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" size="lg" onClick={onDownloadReport}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button variant="outline" className="gap-2" size="lg" onClick={() => onNavigate("/drafting")}>
              <FileEdit className="h-4 w-4" />
              Generate Draft Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
