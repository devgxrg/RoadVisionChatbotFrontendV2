import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeDocument, downloadAnalysisReport } from "@/lib/api/analyze-document";
import { DocumentAnalysisResult } from "@/lib/types/analyze-document";
import { AnalyzeDocumentUI } from "@/components/analyze-document/AnalyzeDocumentUI";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { API_BASE_URL } from "@/lib/config/api";

export default function AnalyzeDocument() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<DocumentAnalysisResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load previous analyses from local storage on mount
  useEffect(() => {
    const savedAnalyses = localStorage.getItem("legalIQ_previousAnalyses");
    if (savedAnalyses) {
      try {
        setPreviousAnalyses(JSON.parse(savedAnalyses));
      } catch (e) {
        console.error("Failed to parse saved analyses", e);
      }
    }
  }, []);

  // Save previous analyses to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("legalIQ_previousAnalyses", JSON.stringify(previousAnalyses));
  }, [previousAnalyses]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90; // Don't go to 100 until API call completes
        }
        return prev + 5;
      });
    }, 500);

    try {
      const analysisResult = await analyzeDocument(selectedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsAnalyzing(false);
      setIsAnalyzed(true);
      
      // Add metadata to result
      const resultWithMeta: DocumentAnalysisResult = {
        ...analysisResult,
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        analysisDate: new Date().toISOString()
      };
      
      setResult(resultWithMeta);
      setPreviousAnalyses(prev => [resultWithMeta, ...prev]);
      
      toast({
        title: "Analysis complete",
        description: "Your document has been analyzed successfully.",
      });
    } catch (error) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze document";
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUploadAnother = () => {
    setIsAnalyzed(false);
    setResult(null);
    setSelectedFile(null);
    setProgress(0);
  };

  const handleViewAnalysis = (analysis: DocumentAnalysisResult) => {
    setResult(analysis);
    setIsAnalyzed(true);
    setSelectedFile(null); // Or keep it if we stored the file object, but usually we don't keep old file objects in memory for long
  };

  const handleDownloadReport = async () => {
    if (!result) {
      toast({
        title: "No analysis available",
        description: "Please analyze a document first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await downloadAnalysisReport(result);
      toast({
        title: "Report downloaded",
        description: "The analysis report has been downloaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to download report";
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDownloadAllReports = async () => {
    if (previousAnalyses.length === 0) {
      toast({
        title: "No analyses available",
        description: "There are no previous analyses to download.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Preparing download...",
        description: `Compressing ${previousAnalyses.length} reports. This may take a moment.`,
      });

      const zip = new JSZip();
      const folder = zip.folder("Legal_Analysis_Reports");

      // Fetch PDF blobs for each analysis
      const promises = previousAnalyses.map(async (analysis, index) => {
        try {
          const response = await fetch(`${API_BASE_URL}/legaliq/analyze-document/report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(analysis),
          });

          if (!response.ok) {
            console.error(`Failed to fetch report for ${analysis.fileName}`);
            return null;
          }

          const blob = await response.blob();
          // Use filename from analysis or fallback
          const filename = analysis.fileName 
            ? `${analysis.fileName.replace(/\.[^/.]+$/, "")}_Report.pdf` 
            : `Report_${index + 1}.pdf`;
            
          return { filename, blob };
        } catch (e) {
          console.error(`Error fetching report for ${analysis.fileName}`, e);
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      let count = 0;
      results.forEach((item) => {
        if (item && folder) {
          folder.file(item.filename, item.blob);
          count++;
        }
      });

      if (count === 0) {
        throw new Error("Failed to generate any reports.");
      }

      const content = await zip.generateAsync({ type: "blob" });
      const downloadUrl = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Legal_Analysis_Reports_${new Date().toISOString().split('T')[0]}.zip`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download complete",
        description: `Successfully downloaded ${count} reports.`,
      });

    } catch (error) {
       console.error(error);
       toast({
        title: "Download failed",
        description: "Failed to generate zip file.",
        variant: "destructive",
      });
    }
  };

  return (
    <AnalyzeDocumentUI
      isAnalyzing={isAnalyzing}
      isAnalyzed={isAnalyzed}
      progress={progress}
      result={result}
      previousAnalyses={previousAnalyses}
      selectedFile={selectedFile}
      onFileSelect={setSelectedFile}
      onUpload={handleUpload}
      onUploadAnother={handleUploadAnother}
      onViewAnalysis={handleViewAnalysis}
      onNavigate={navigate}
      onDownloadReport={handleDownloadReport}
      onDownloadAllReports={handleDownloadAllReports}
    />
  );
}
