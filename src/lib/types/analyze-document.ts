export interface DocumentAnalysisResult {
  id?: string;
  fileName?: string;
  analysisDate?: string;
  riskLevel: "low" | "medium" | "high";
  riskMessage: string;
  extractedFacts: ExtractedFacts;
  aiSummary: string;
  riskAnalysis: RiskAnalysisItem[];
  nextSteps: string[];
}

export interface ExtractedFacts {
  parties: string;
  issueSummary: string;
  contractDate: string;
  keyClauses: string[];
}

export interface RiskAnalysisItem {
  level: "low" | "medium" | "high";
  title: string;
  description: string;
}
