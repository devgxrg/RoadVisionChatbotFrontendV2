
import { NavigateFunction } from 'react-router-dom';
import { LucideProps } from 'lucide-react';
import { Tender } from './tenderiq.types';

export interface WishlistItem extends Tender {
  addedAt: string; // ISO date string
}

export interface HistoryItem extends Tender {
  viewedAt: string; // ISO date string
  lastAction: 'viewed' | 'analyzed' | 'downloaded';
}

export interface WishlistResponse {
  count: number;
  items: WishlistItem[];
}

export interface HistoryResponse {
  count: number;
  items: HistoryItem[];
}

export interface ScrapedTender {
    id: string

    // From Tender model
    tender_id_str: string
    tender_name: string
    tender_url: string
    dms_folder_id?: string
    city: string
    summary: string
    value: string
    due_date: string

    analysis_status?: string
    error_message?: string

    query_id: string

    // From TenderDetailPage models
    // TenderDetailNotice
    tdr: string
    tendering_authority: string
    tender_no: string
    tender_id_detail: string
    tender_brief: string
    // city is already there from Tender model
    state: string
    document_fees: string
    emd: string
    tender_value: string
    tender_type: string
    bidding_type: string
    competition_type: string

    // TenderDetailDetails
    tender_details: string

    // TenderDetailKeyDates
    publish_date: string
    last_date_of_bid_submission: string
    tender_opening_date: string

    // TenderDetailContactInformation
    company_name: string
    contact_person: string
    address: string

    information_source: string

    // Additional fields from Tender model
    length_km?: number
    per_km_cost?: number
    span_length?: number
    road_work_amount?: number
    structure_work_amount?: number
    remarks?: string
    current_status?: string
}

export interface WorkComponentSchema {
    item: string
    description?: string
    quantity?: number
    unit?: string
    specifications?: string
}


export interface WorkPackageSchema {
    id: string
    name: string
    description?: string
    components: WorkComponentSchema[]
    estimated_duration?: string
    dependencies?: string[]
}


export interface MaterialSpecificationSchema {
    material: string
    specification: string
    source?: string
    testing_standard?: string
}


export interface TechnicalSpecificationsSchema {
    standards?: string[]
    quality_requirements?: string[]
    materials_specification?: MaterialSpecificationSchema[]
    testing_requirements?: string[]
}


export interface DeliverableSchema {
    item: string
    description?: string
    timeline?: string
}


export interface ScopeOfWorkProjectDetailsSchema {
    project_name?: string
    location?: string
    total_length?: string
    total_area?: string
    duration?: string
    contract_value?: string
    // Engineering metrics for Excel export
    road_length_km?: number
    span_length_m?: number
    road_work_value_cr?: number
    structure_work_value_cr?: number
}



export interface ScopeOfWorkSchema {
    project_details?: ScopeOfWorkProjectDetailsSchema
    work_packages?: WorkPackageSchema[]
    technical_specifications?: TechnicalSpecificationsSchema
    deliverables?: DeliverableSchema[]
    exclusions?: string[]
}

export interface DataSheetItemSchema {
    label: string
    value: string
    type?: string
    highlight: boolean
}

export interface DataSheetSchema {
    project_information?: DataSheetItemSchema[]
    contract_details?: DataSheetItemSchema[]
    financial_details?: DataSheetItemSchema[]
    technical_summary?: DataSheetItemSchema[]
    important_dates?: DataSheetItemSchema[]

}

export interface RiskAnalysisSchema {
    summary?: string
    high_risk_factors?: string[]
    low_risk_areas?: string[]
    compliance_concerns?: string[]
}

export interface OnePagerSchema {
    project_overview: string
    eligibility_highlights: string[]
    important_dates: string[]
    financial_requirements: string[]
    risk_analysis?: RiskAnalysisSchema
}

export interface TenderAnalysis {
    id: string
    
    // One-to-one relationship to the ScrapedTender being analyzed. This refers to scraped_tenders.tender_id_str.
    tender_id: string
    user_id?: string
    chat_id?: string
    
    // Analysis metadata
    status: "pending" | "parsing" | "processing" | "analyzing" | "completed" | "failed"
    progress: number
    status_message?: string
    error_message?: string
    
    // Timestamps
    created_at: string
    updated_at: string
    analysis_started_at: string
    analysis_completed_at: string
    
    // Analysis Results - JSON columns (untyped to avoid circular imports)
    one_pager_json: OnePagerSchema
    scope_of_work_json: ScopeOfWorkSchema
    data_sheet_json: DataSheetSchema
}


export interface HistoryData {
  id: string;
  title: string;
  authority: string;
  value: number;
  emd: number;
  due_date: string;
  category: string;
  progress: number;
  analysis_state: string;
  synopsis_state: boolean;
  evaluated_state: boolean;
  results: "won" | "rejected" | "incomplete" | "pending";
  full_scraped_details?: ScrapedTender;
  analysis_details?: TenderAnalysis;
}

export interface HistoryPageResponse {
  report_file_url: string;
  tenders: HistoryData[];
}

export interface WishlistHistoryUIProps {
  navigate: NavigateFunction;
  data: HistoryPageResponse;
  handleViewTender: (id: string) => void;
  handleRemoveFromWishlist: (id: string) => Promise<void>;
}

export interface MetadataCardProps {
  title: string;
  value: string;
  LucideIcon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  description: string;
}

// Report-related types
export interface ReportMetrics {
  totalSaved: number;
  totalAnalyzed: number;
  totalWon: number;
  totalRejected: number;
  totalIncomplete: number;
  totalPending: number;
  totalTenderValue: number;
  averageTenderValue: number;
  totalEMD: number;
  averageEMD: number;
}

export interface WishlistReportTableRow extends HistoryData {
  formattedValue: string;
  formattedEMD: string;
  statusLabel: string;
  analysisStateLabel: string;
}

export interface WishlistReportData {
  metrics: ReportMetrics;
  tenders: WishlistReportTableRow[];
  generatedAt: string;
  totalCount: number;
}

export interface WishlistReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: WishlistReportData;
  onExportToPDF: () => void;
  isExporting?: boolean;
}
