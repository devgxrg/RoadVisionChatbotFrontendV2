export interface TenderActionPayload {
  status?: TenderStatusEnum;
  review_status?: ReviewStatusEnum;
  notes?: string;
}

export type TenderActionType =
  | "toggle_wishlist"
  | "toggle_favorite"
  | "toggle_archive"
  | "update_status"
  | "update_review_status";

export interface TenderActionRequest {
  action: TenderActionType;
  payload?: TenderActionPayload;
}


/**
 * Represents the 'AnalysisStatusEnum' schema.
 */
export type AnalysisStatusEnum =
  | "pending"
  | "failed"
  | "skipped"
  | "completed";

export type RiskLevel =
  | "low"
  | "medium"
  | "high"

/**
 * Represents the 'StatusEnum' schema.
 */
export type StatusEnum =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "bid_preparation"
  | "submitted"
  | "won"
  | "lost"
  | "not_interested"
  | "pending_results";

/**
 * Represents the 'ReviewStatusEnum' schema.
 */
export type ReviewStatusEnum = "not_reviewed" | "reviewed" | "shortlisted";

/**
 * Represents the 'TenderActionEnum' schema.
 * Enumeration for user actions on a tender.
 */
export type TenderActionEnum =
  | "viewed"
  | "wishlisted"
  | "unwishlisted"
  | "analysis_started"
  | "analysis_completed"
  | "shortlisted"
  | "accepted"
  | "rejected";

/**
 * Interface for the 'TenderFile' schema.
 */
export interface TenderFile {
  id: string;

  // File metadata
  file_name: string;
  file_url: string;
  file_description: string;
  file_size: string;

  // DMS storage metadata
  dms_path: string;
  is_cached: string;
  cache_status: string;
  cache_error: string;

  // Relationship
  tender_id: string;

  file_type: string;
}

/**
 * Interface for the 'HistoryItem' schema.
 * Logs specific user-driven actions on a tender for history tracking.
 */
export interface ActionHistoryItem {
  id: string;
  tender_id: string;
  user_id: string;
  action: TenderActionEnum;
  notes: string;
  timestamp: string; // 'datetime' is typically 'string' (e.g., ISO 8601) in JSON
}

export type TenderHistoryType = 
  "due_date_extension" |
  "bid_deadline_extension" |
  "corrigendum" |
  "amendment";

export interface TenderHistoryDateChange {
  from: string;
  to: string;
}

export interface TenderHistoryItem {
  id: string;
  tender_id: string;
  tdr: string;
  type: TenderHistoryType;
  note: string;
  update_date: string;
  files_changed?: TenderFile[];
  date_change?: TenderHistoryDateChange;
}

/**
 * Interface for the 'FullTenderDetails' schema.
 */
export interface FullTenderDetails {
  risk_level: RiskLevel;

  // From ScrapedTender / Tender
  // Note: 'id' and 'state' were defined multiple times; they are unified here.
  id: string;

  // From Tender model
  tender_id_str: string;
  tender_name: string;
  tender_url: string;
  city: string;
  summary: string;
  value: string;
  due_date: string;

  analysis_status: AnalysisStatusEnum;
  error_message: string;

  query_id: string;
  query: string;

  // From TenderDetailPage models
  // TenderDetailNotice
  tdr: string;
  tendering_authority: string;
  tender_no: string;
  tender_id_detail: string;
  tender_brief: string;
  state: string;
  document_fees: string;
  emd: string;
  tender_value: string;
  tender_type: string;
  bidding_type: string;
  competition_type: string;

  // TenderDetailDetails
  tender_details: string;

  // TenderDetailKeyDates
  publish_date: string;
  last_date_of_bid_submission: string;
  tender_opening_date: string;

  // TenderDetailContactInformation
  company_name: string;
  contact_person: string;
  address: string;

  // TenderDetailOtherDetail
  information_source: string;

  files: TenderFile[];

  // From Tender
  tender_ref_number: string;
  tender_title: string;
  description: string;
  employer_name: string;
  employer_address: string;
  issuing_authority: string;
  location: string;
  category: string;
  mode: string;
  estimated_cost: number;
  bid_security: number;
  length_km: number;
  per_km_cost: number;
  span_length: number;
  road_work_amount: number;
  structure_work_amount: number;
  e_published_date: string; // 'datetime' -> 'string'
  identification_date: string; // 'datetime' -> 'string'
  submission_deadline: string; // 'datetime' -> 'string'
  prebid_meeting_date: string; // 'datetime' -> 'string'
  site_visit_deadline: string; // 'datetime' -> 'string'
  portal_source: string;
  portal_url: string;
  document_url: string;
  status: StatusEnum;
  review_status: ReviewStatusEnum;
  reviewed_by_id: string;
  reviewed_at: string; // 'datetime' -> 'string'
  created_at: string; // 'datetime' -> 'string'
  updated_at: string; // 'datetime' -> 'string'
  is_favorite: boolean;
  is_archived: boolean;
  is_wishlisted: boolean;
  history: ActionHistoryItem[];
  tender_history: TenderHistoryItem[];
}

/**
 * Interface for a single tender's details.
 */
export interface Tender {
  id: string; // UUID
  tender_id_str: string;
  tender_name: string;
  tender_url: string;
  drive_url: string;
  city: string;
  summary: string;
  value: string;
  due_date: string; // Date string
  tdr: string;
  tendering_authority: string;
  tender_no: string;
  tender_id_detail: string;
  tender_brief: string;
  state: string;
  document_fees: string;
  emd: string;
  tender_value: string;
  tender_type: string;
  bidding_type: string;
  competition_type: string;
  tender_details: string;
  publish_date: string; // Date string
  last_date_of_bid_submission: string; // Date string
  tender_opening_date: string; // Date string
  company_name: string;
  contact_person: string;
  address: string;
  information_source: string;
  files: TenderFile[];
  is_wishlisted: boolean;
  dms_folder_id: string; // UUID
}

/**
 * Interface for a query, which contains multiple tenders.
 */
export interface Query {
  id: string; // UUID
  query_name: string;
  number_of_tenders: string;
  tenders: Tender[];
}

/**
 * Interface for the top-level report object.
 */
export interface Report {
  id: string; // UUID
  run_at: string; // ISO 8601 Date string
  date_str: string;
  name: string;
  contact: string;
  no_of_new_tenders: string;
  company: string;
  queries: Query[];
}
