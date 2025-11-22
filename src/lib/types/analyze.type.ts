/**
 * Types for TenderIQ Analyze Module
 * Simplified for single endpoint: GET /api/v1/tenderiq/analyze/{tenderId}
 */

// ============================================================================
// Money & Utility Types
// ============================================================================

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
// One-Pager Data Structure
// ============================================================================

export interface OnePagerData {
  project_overview: string;
  financial_requirements: string[];
  eligibility_highlights: string[];
  important_dates: string[];
  risk_analysis: {
    summary: string;
  };
}

// ============================================================================
// Scope of Work Data Structure
// ============================================================================

export interface WorkComponent {
  item: string;
  description: string;
  quantity?: number;
  unit?: string;
  specifications?: string;
}

export interface WorkPackage {
  id: string;
  name: string;
  description: string;
  components: WorkComponent[];
  estimated_duration?: string;
  dependencies?: string[];
}

export interface MaterialSpec {
  material: string;
  specification: string;
  source?: string;
  testing_standard?: string;
}

export interface TechnicalSpecifications {
  standards: string[];
  quality_requirements: string[];
  materials_specification: MaterialSpec[];
  testing_requirements: string[];
}

export interface ProjectDetails {
  project_name: string;
  location: string;
  total_length?: string;
  total_area?: string;
  duration: string;
  contract_value: string;
}

export interface Deliverable {
  item: string;
  description: string;
  quantity?: string;
  unit?: string;
  timeline?: string;
}

export interface ScopeOfWorkData {
  project_details: ProjectDetails;
  work_packages: WorkPackage[];
  technical_specifications: TechnicalSpecifications;
  deliverables: Deliverable[];
  exclusions?: string[];
}

// ============================================================================
// RFP Sections Data Structure
// ============================================================================

export interface RFPSection {
  section_name: string;
  section_title: string;
  summary: string;
  key_requirements: string[];
  compliance_issues: string[];
  page_references: string[];
}

export interface RFPSummary {
  total_sections: number;
  total_requirements: number;
}

export interface RFPSectionsData {
  rfp_summary: RFPSummary;
  sections: RFPSection[];
}

// ============================================================================
// Data Sheet Data Structure
// ============================================================================

export interface DataSheetData {
  project_information: KeyValuePair[];
  contract_details: KeyValuePair[];
  financial_details: KeyValuePair[];
  technical_summary: KeyValuePair[];
  important_dates: KeyValuePair[];
}

// ============================================================================
// Template Data Structure
// ============================================================================

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'excel' | 'word' | 'dwg';
  downloadUrl?: string;
  mandatory: boolean;
  annex: string;
}

export interface TemplateSection {
  bid_submission_forms: TemplateItem[];
  financial_formats: TemplateItem[];
  technical_documents: TemplateItem[];
  compliance_formats: TemplateItem[];
}

export interface TemplatesData extends TemplateSection {}

// ============================================================================
// Complete Analysis Response - Single Endpoint
// ============================================================================

export interface TenderAnalysisResponse {
  id: string;
  tender_id: string;
  status: 'completed' | 'processing' | 'analyzing' | 'parsing' | 'pending' | 'failed';
  progress?: number; // 0-100
  analyzed_at: string; // ISO 8601
  one_pager: OnePagerData | null;
  scope_of_work: ScopeOfWorkData | null;
  rfp_sections: RFPSectionsData | null;
  data_sheet: DataSheetData | null;
  templates: TemplatesData | null;
}

// ============================================================================
// Analysis Status Enum
// ============================================================================

export type AnalysisStatus = 'completed' | 'in_progress' | 'failed';
