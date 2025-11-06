/**
 * Types for TenderIQ Analyze Module
 * Corresponds to /api/v1/tenderiq/analyze/* endpoints
 */

// ============================================================================
// Request Types
// ============================================================================

export interface AnalyzeTenderRequest {
  documentIds?: string[]; // Optional: specific documents to analyze
  analysisType?: 'full' | 'summary' | 'risk-only'; // Optional, default: 'full'
  includeRiskAssessment?: boolean; // default: true
  includeRfpAnalysis?: boolean; // default: true
  includeScopeOfWork?: boolean; // default: true
}

export interface GenerateOnePagerRequest {
  format?: 'markdown' | 'html' | 'pdf'; // default: 'markdown'
  includeRiskAssessment?: boolean; // default: true
  includeScopeOfWork?: boolean; // default: true
  includeFinancials?: boolean; // default: true
  maxLength?: number; // default: 800
}

// ============================================================================
// Response Types - Analysis Lifecycle
// ============================================================================

export interface AnalysisInitiatedResponse {
  analysisId: string;
  tenderId: string;
  status: string;
  createdAt: string; // ISO date-time
  estimatedCompletionTime: number; // milliseconds
}

export interface AnalysisStatusResponse {
  analysisId: string;
  tenderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string; // e.g., 'initializing', 'parsing-documents', 'analyzing-risk'
  errorMessage?: string | null;
}

export interface AnalysisResultsResponse {
  analysisId: string;
  tenderId: string;
  status: string;
  results: AnalysisResults;
  completedAt: string; // ISO date-time
  processingTimeMs?: number;
}

export interface AnalysisResults {
  summary?: SummaryResults;
  riskAssessment?: RiskAssessmentResponse;
  rfpAnalysis?: RFPAnalysisResponse;
  scopeOfWork?: ScopeOfWorkResponse;
  onePager?: OnePagerContent;
  dataSheet?: DataSheetContentResponse;
  [key: string]: any; // Allow additional properties
}

// ============================================================================
// Response Types - Risk Assessment
// ============================================================================

export interface RiskAssessmentResponse {
  tenderId: string;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  executiveSummary?: string | null;
  risks: RiskDetailResponse[];
  analyzedAt: string; // ISO date-time
}

export interface RiskDetailResponse {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  category: 'regulatory' | 'financial' | 'operational' | 'contractual' | 'market' | string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  mitigationStrategy?: string | null;
  recommendedAction?: string | null;
  relatedDocuments: string[]; // document IDs
}

// ============================================================================
// Response Types - RFP Analysis
// ============================================================================

export interface RFPAnalysisResponse {
  tenderId: string;
  totalSections: number;
  sections: RFPSectionResponse[];
  summary: RFPSectionSummaryResponse;
}

export interface RFPSectionResponse {
  id: string;
  number: string; // e.g., "1.1"
  title: string;
  description: string;
  keyRequirements: string[];
  compliance?: RFPSectionComplianceResponse | null;
  estimatedComplexity: 'low' | 'medium' | 'high';
  relatedSections: string[]; // section numbers
  documentReferences: DocumentReferenceResponse[];
}

export interface RFPSectionComplianceResponse {
  status: 'compliant' | 'non-compliant' | 'requires-review';
  issues: string[];
}

export interface RFPSectionSummaryResponse {
  totalRequirements: number;
  criticality: {
    high: number;
    medium: number;
    low: number;
    [key: string]: number;
  };
}

export interface DocumentReferenceResponse {
  documentId: string;
  pageNumber?: number | null;
}

// ============================================================================
// Response Types - Scope of Work
// ============================================================================

export interface ScopeOfWorkResponse {
  tenderId: string;
  scopeOfWork: ScopeOfWorkDetailResponse;
  analyzedAt: string; // ISO date-time
}

export interface ScopeOfWorkDetailResponse {
  description: string;
  workItems: WorkItemResponse[];
  keyDeliverables: DeliverableResponse[];
  estimatedTotalEffort: number; // days
  estimatedTotalDuration: string; // e.g., "120 days"
  keyDates: KeyDatesResponse;
}

export interface WorkItemResponse {
  id: string;
  description: string;
  estimatedDuration: string; // e.g., "30 days"
  priority: 'low' | 'medium' | 'high';
  dependencies: string[]; // IDs of dependent work items
}

export interface DeliverableResponse {
  id: string;
  description: string;
  deliveryDate?: string | null;
  acceptanceCriteria: string[];
}

export interface KeyDatesResponse {
  startDate?: string | null;
  endDate?: string | null;
}

// ============================================================================
// Response Types - One-Pager
// ============================================================================

export interface OnePagerResponse {
  tenderId: string;
  onePager: OnePagerContent;
}

export interface OnePagerContent {
  content: string; // markdown/html/pdf formatted content
  format: 'markdown' | 'html' | 'pdf';
  generatedAt: string; // ISO date-time
  [key: string]: any;
}

// ============================================================================
// Response Types - Data Sheet
// ============================================================================

export interface DataSheetResponse {
  tenderId: string;
  dataSheet: DataSheetContentResponse;
  generatedAt: string; // ISO date-time
}

export interface DataSheetContentResponse {
  basicInfo: BasicInfoResponse;
  financialInfo: FinancialInfoResponse;
  temporal: TemporalInfoResponse;
  scope: ScopeInfoResponse;
  analysis?: AnalysisInfoResponse | null;
}

export interface BasicInfoResponse {
  tenderNumber: string;
  tenderName: string;
  tenderingAuthority: string;
  tenderUrl: string;
}

export interface FinancialInfoResponse {
  estimatedValue?: number | null;
  currency: string; // default: "INR"
  emd?: number | null;
  bidSecurityRequired: boolean;
}

export interface TemporalInfoResponse {
  releaseDate?: string | null;
  dueDate?: string | null;
  openingDate?: string | null;
}

export interface ScopeInfoResponse {
  location: string;
  category: string;
  description: string;
}

export interface AnalysisInfoResponse {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: number; // days
  complexityLevel: 'low' | 'medium' | 'high';
}

// ============================================================================
// Response Types - List & Pagination
// ============================================================================

export interface AnalysesListResponse {
  analyses: AnalysisListItemResponse[];
  pagination: PaginationResponse;
}

export interface AnalysisListItemResponse {
  analysisId: string;
  tenderId: string;
  tenderName?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string; // ISO date-time
  completedAt?: string | null; // ISO date-time
  processingTimeMs?: number | null;
}

export interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Response Types - Delete
// ============================================================================

export interface DeleteAnalysisResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Summary Results (for completeness)
// ============================================================================

export interface SummaryResults {
  title: string;
  overview: string;
  keyPoints: string[];
  [key: string]: any;
}

// ============================================================================
// Tender Analysis Schema Types (Backend Response Format)
// ============================================================================

export interface TenderAnalysisResponse {
  tenderId: string;
  status: 'completed' | 'failed';
  analyzedAt: string; // ISO 8601
  tenderInfo: TenderInfo;
  onePager: OnePagerData;
  scopeOfWork: ScopeOfWorkData;
  rfpSections: RFPSection[];
  dataSheet: DataSheetData;
  templates: TemplateData;
  aiInsights: AIInsights;
  metadata: AnalysisMetadata;
}

export interface MoneyAmount {
  amount: number;
  currency: 'INR';
  displayText: string;
}

export interface KeyValuePair {
  label: string;
  value: string;
  highlight?: boolean;
  type?: 'text' | 'money' | 'date' | 'duration';
}

// ============================================================================
// TenderInfo
// ============================================================================

export interface TenderInfo {
  referenceNumber: string;
  title: string;
  issuingOrganization: string;
  department: string;
  contactPerson?: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
  estimatedValue: MoneyAmount;
  publishedDate: string; // ISO 8601
  submissionDeadline: string; // ISO 8601
  technicalBidOpening?: string; // ISO 8601
  financialBidOpening?: string; // ISO 8601
  projectLocation: {
    state: string;
    city?: string;
    district?: string;
    coordinates?: {
      from: string;
      to: string;
    };
  };
  category: string;
  subCategory?: string;
  tenderType: 'open' | 'limited' | 'eoi' | 'rateContract';
  status: 'active' | 'closed' | 'cancelled' | 'awarded';
}

// ============================================================================
// OnePagerData
// ============================================================================

export interface OnePagerData {
  projectOverview: {
    description: string;
    keyHighlights: string[];
    projectScope: string;
  };
  financialRequirements: {
    contractValue: MoneyAmount;
    emdAmount: MoneyAmount;
    emdPercentage: number;
    performanceBankGuarantee: MoneyAmount;
    pbgPercentage: number;
    tenderDocumentFee: MoneyAmount;
    processingFee?: MoneyAmount;
    totalUpfrontCost: MoneyAmount;
  };
  eligibilityHighlights: {
    minimumExperience: string;
    minimumTurnover: MoneyAmount;
    requiredSimilarProjects: {
      count: number;
      minimumValue: MoneyAmount;
      timePeriod: string;
    };
    specialRelaxations: string[];
  };
  keyDates: {
    prebidMeeting?: string; // ISO 8601
    bidSubmissionDeadline: string;
    technicalEvaluation: string;
    financialBidOpening: string;
    expectedAwardDate?: string; // ISO 8601
    projectStartDate?: string; // ISO 8601
    projectDuration: {
      value: number;
      unit: 'days' | 'months' | 'years';
      displayText: string;
    };
  };
  riskFactors: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  competitiveAnalysis?: {
    estimatedBidders: string;
    complexity: 'simple' | 'moderate' | 'complex';
    barriers: string[];
  };
}

// ============================================================================
// ScopeOfWorkData
// ============================================================================

export interface ScopeOfWorkData {
  projectDetails: {
    projectName: string;
    location: string;
    totalLength?: string;
    totalArea?: string;
    duration: string;
    contractValue: string;
  };
  workPackages: WorkPackage[];
  technicalSpecifications: {
    standards: string[];
    qualityRequirements: string[];
    materialsSpecification: MaterialSpec[];
    testingRequirements: string[];
  };
  deliverables: {
    item: string;
    description: string;
    quantity?: string;
    unit?: string;
    timeline?: string;
  }[];
  exclusions?: string[];
}

export interface WorkPackage {
  id: string;
  name: string;
  description: string;
  components: WorkComponent[];
  estimatedDuration?: string;
  dependencies?: string[];
}

export interface WorkComponent {
  item: string;
  description: string;
  quantity?: number;
  unit?: string;
  specifications?: string;
}

export interface MaterialSpec {
  material: string;
  specification: string;
  source?: string;
  testingStandard?: string;
}

// ============================================================================
// RFPSection
// ============================================================================

export interface RFPSection {
  sectionNumber: string;
  sectionName: string;
  summary: string;
  keyPoints: string[];
  criticalRequirements: string[];
  considerations: string[];
  risks: string[];
  actionItems: string[];
  documents: string[];
}

// ============================================================================
// DataSheetData
// ============================================================================

export interface DataSheetData {
  projectInformation: KeyValuePair[];
  contractDetails: KeyValuePair[];
  financialDetails: KeyValuePair[];
  technicalSummary: KeyValuePair[];
  importantDates: KeyValuePair[];
}

// ============================================================================
// TemplateData
// ============================================================================

export interface TemplateData {
  bidSubmissionForms: TemplateItem[];
  financialFormats: TemplateItem[];
  technicalDocuments: TemplateItem[];
  complianceFormats: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'excel' | 'word' | 'dwg';
  downloadUrl?: string;
  mandatory: boolean;
  annex: string;
}

// ============================================================================
// AIInsights
// ============================================================================

export interface AIInsights {
  strengthsWeaknessesAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  bidDecisionRecommendation: {
    recommendation: 'highly_recommended' | 'recommended' | 'proceed_with_caution' | 'not_recommended';
    score: number; // 0-100
    reasoning: string[];
  };
  competitiveIntelligence: {
    estimatedCompetition: string;
    competitiveAdvantages: string[];
    competitiveChallenges: string[];
  };
  riskAssessment: RiskItem[];
  complianceChecklist: ComplianceItem[];
  estimatedCosts: CostBreakdown;
  winProbability: {
    score: number; // 0-100
    factors: WinFactor[];
  };
}

export interface RiskItem {
  risk: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  impact: string;
}

export interface ComplianceItem {
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'requires_verification' | 'not_applicable';
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CostBreakdown {
  upfrontCosts: MoneyAmount;
  estimatedProjectCosts: MoneyAmount;
  contingency: MoneyAmount;
  totalEstimated: MoneyAmount;
  breakdown: {
    category: string;
    amount: MoneyAmount;
  }[];
}

export interface WinFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-10
  description: string;
}

// ============================================================================
// AnalysisMetadata
// ============================================================================

export interface AnalysisMetadata {
  documentInfo: {
    originalFileName: string;
    fileSize: number;
    fileType: string;
    pageCount: number;
    uploadedAt: string; // ISO 8601
  };
  processingInfo: {
    processingStarted: string; // ISO 8601
    processingCompleted: string; // ISO 8601
    processingDuration: number; // In seconds
    aiModel: string;
    ocrRequired: boolean;
    ocrConfidence?: number; // 0-100
  };
  qualityIndicators: {
    dataCompleteness: number; // 0-100
    confidenceScore: number; // 0-100
    warnings: string[];
    recommendations: string[];
  };
  extractionSummary: {
    sectionsExtracted: number;
    tablesExtracted: number;
    figuresExtracted: number;
    annexuresIdentified: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplexityLevel = 'low' | 'medium' | 'high';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'requires-review';
export type Priority = 'low' | 'medium' | 'high';
export type Format = 'markdown' | 'html' | 'pdf' | 'json' | 'csv' | 'excel';
