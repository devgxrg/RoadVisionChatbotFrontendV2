import { DocumentAnalysisResult } from "@/lib/types/analyze-document";
import { API_BASE_URL } from "../config/api";

export async function downloadAnalysisReport(analysisData: DocumentAnalysisResult): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/legaliq/analyze-document/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(analysisData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to download report: ${response.statusText}`);
  }

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `Legal_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;

  if (contentDisposition) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  // Create blob and download
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/legaliq/analyze-document`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to analyze document: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Validate response structure
  if (data.error) {
    throw new Error(data.error);
  }

  // Ensure all required fields are present
  return {
    riskLevel: data.riskLevel || "medium",
    riskMessage: data.riskMessage || "Analysis completed",
    extractedFacts: {
      parties: data.extractedFacts?.parties || "Not specified",
      issueSummary: data.extractedFacts?.issueSummary || "Not specified",
      contractDate: data.extractedFacts?.contractDate || "Not specified",
      keyClauses: data.extractedFacts?.keyClauses || [],
    },
    aiSummary: data.aiSummary || "Analysis completed. Please review the document details.",
    riskAnalysis: data.riskAnalysis || [],
    nextSteps: data.nextSteps || [],
  };
}
