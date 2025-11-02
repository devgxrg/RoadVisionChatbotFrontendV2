// Status and Level enums from OpenAPI spec
export type DocumentStatus = 'pending' | 'processing' | 'active' | 'archived';
export type ConfidentialityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type PermissionLevel = 'read' | 'write' | 'admin';

// Summary response from backend
export interface DocumentSummary {
  total_documents: number;
  recent_uploads: number;
  storage_used: string;
  shared_documents: number;
}

// Category from backend
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

// Permission for document/folder access
export interface Permission {
  id: string;
  user_id?: string;
  role?: string;
  permission_level: PermissionLevel;
  created_at: string;
}

// Folder from backend
export interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  path: string;
  document_count: number;
  subfolders?: Folder[];
  created_at: string;
  modified_at: string;
  department?: string;
}

// Document from backend
export interface Document {
  id: string;
  name: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  folder_id?: string | null;
  folder_path?: string;
  category_ids?: string[];
  tags?: string[];
  status: DocumentStatus;
  confidentiality_level: ConfidentialityLevel;
  version: number;
}

// Request types

export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  category_ids?: string[];
  tags?: string[];
  confidentiality_level?: ConfidentialityLevel;
}

export interface CreateFolderRequest {
  name: string;
  parent_folder_id?: string;
  department?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  department?: string;
}

// AI Summary (for /askai integration)
export interface AISummary {
  documentType: string;
  keyTopic: string;
  language: string;
  generatedAt: string;
  executiveSummary: string;
  keyInformation: Record<string, string>;
  importantDates: Array<{ date: string; description: string }>;
  keyEntities: {
    organizations: string[];
    people: string[];
    locations: string[];
  };
  riskFlags: string[];
  tags: string[];
  confidenceScore: number;
}
