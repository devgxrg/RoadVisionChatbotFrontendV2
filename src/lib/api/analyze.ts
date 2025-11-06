/**
 * TenderIQ Analyze Module API Service
 * Handles all API calls to /api/v1/tenderiq/analyze/* endpoints
 * Uses Redux for authentication token management
 */

import { API_BASE_URL } from '@/lib/config/api';
import { getAuthHeaders } from '@/lib/api/authHelper';
import {
  AnalyzeTenderRequest,
  AnalysisInitiatedResponse,
  AnalysisStatusResponse,
  AnalysisResultsResponse,
  RiskAssessmentResponse,
  RFPAnalysisResponse,
  ScopeOfWorkResponse,
  OnePagerResponse,
  DataSheetResponse,
  GenerateOnePagerRequest,
  AnalysesListResponse,
  DeleteAnalysisResponse,
} from '@/lib/types/analyze';

const ANALYZE_API_BASE = `${API_BASE_URL}/tenderiq/analyze`;

/**
 * Handle API response and throw on error
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }
  return response.json();
};

// ============================================================================
// Analysis Lifecycle Endpoints
// ============================================================================

/**
 * Initiate tender document analysis
 * POST /api/v1/tenderiq/analyze/tender/{tenderId}
 * @param tenderId - UUID of the tender
 * @param request - Analysis request parameters
 * @returns Analysis initiated response with analysis ID
 */
export const initiateAnalysis = async (
  tenderId: string,
  request: AnalyzeTenderRequest
): Promise<AnalysisInitiatedResponse> => {
  console.log(`Initiating analysis for tender: ${tenderId}`, request);

  const url = `${ANALYZE_API_BASE}/tender/${tenderId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in initiateAnalysis for tender ${tenderId}:`, error);
    throw error;
  }
};

/**
 * Get analysis status (lightweight polling endpoint)
 * GET /api/v1/tenderiq/analyze/status/{analysisId}
 * @param analysisId - UUID of the analysis
 * @returns Current status of the analysis
 */
export const getAnalysisStatus = async (analysisId: string): Promise<AnalysisStatusResponse> => {
  console.log(`Fetching analysis status: ${analysisId}`);

  const url = `${ANALYZE_API_BASE}/status/${analysisId}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in getAnalysisStatus for analysis ${analysisId}:`, error);
    throw error;
  }
};

/**
 * Get completed analysis results
 * GET /api/v1/tenderiq/analyze/results/{analysisId}
 * @param analysisId - UUID of the analysis
 * @returns Complete analysis results if available
 */
export const getAnalysisResults = async (analysisId: string): Promise<AnalysisResultsResponse> => {
  console.log(`Fetching analysis results: ${analysisId}`);

  const url = `${ANALYZE_API_BASE}/results/${analysisId}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in getAnalysisResults for analysis ${analysisId}:`, error);
    throw error;
  }
};

/**
 * Delete analysis and its results
 * DELETE /api/v1/tenderiq/analyze/results/{analysisId}
 * @param analysisId - UUID of the analysis to delete
 * @returns Deletion confirmation
 */
export const deleteAnalysis = async (analysisId: string): Promise<DeleteAnalysisResponse> => {
  console.log(`Deleting analysis: ${analysisId}`);

  const url = `${ANALYZE_API_BASE}/results/${analysisId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in deleteAnalysis for analysis ${analysisId}:`, error);
    throw error;
  }
};

// ============================================================================
// Risk Assessment Endpoints
// ============================================================================

/**
 * Get risk assessment for a tender
 * GET /api/v1/tenderiq/analyze/tender/{tenderId}/risks
 * @param tenderId - UUID of the tender
 * @param options - Optional parameters (depth, includeHistorical)
 * @returns Risk assessment with identified risks
 */
export const getRiskAssessment = async (
  tenderId: string,
  options?: {
    depth?: 'summary' | 'detailed';
    includeHistorical?: boolean;
  }
): Promise<RiskAssessmentResponse> => {
  console.log(`Fetching risk assessment for tender: ${tenderId}`, options);

  const params = new URLSearchParams();
  if (options?.depth) params.append('depth', options.depth);
  if (options?.includeHistorical) params.append('include_historical', 'true');

  const url = `${ANALYZE_API_BASE}/tender/${tenderId}/risks?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in getRiskAssessment for tender ${tenderId}:`, error);
    throw error;
  }
};

// ============================================================================
// RFP Analysis Endpoints
// ============================================================================

/**
 * Get RFP section analysis for a tender
 * GET /api/v1/tenderiq/analyze/tender/{tenderId}/rfp-sections
 * @param tenderId - UUID of the tender
 * @param options - Optional parameters (sectionNumber, includeCompliance)
 * @returns RFP sections analysis
 */
export const getRFPAnalysis = async (
  tenderId: string,
  options?: {
    sectionNumber?: string;
    includeCompliance?: boolean;
  }
): Promise<RFPAnalysisResponse> => {
  console.log(`Fetching RFP analysis for tender: ${tenderId}`, options);

  const params = new URLSearchParams();
  if (options?.sectionNumber) params.append('section_number', options.sectionNumber);
  if (options?.includeCompliance) params.append('include_compliance', 'true');

  const url = `${ANALYZE_API_BASE}/tender/${tenderId}/rfp-sections?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in getRFPAnalysis for tender ${tenderId}:`, error);
    throw error;
  }
};

// ============================================================================
// Scope of Work Endpoints
// ============================================================================

/**
 * Get scope of work analysis for a tender
 * GET /api/v1/tenderiq/analyze/tender/{tenderId}/scope-of-work
 * @param tenderId - UUID of the tender
 * @returns Scope of work analysis
 */
export const getScopeOfWork = async (tenderId: string): Promise<ScopeOfWorkResponse> => {
  console.log(`Fetching scope of work for tender: ${tenderId}`);

  const url = `${ANALYZE_API_BASE}/tender/${tenderId}/scope-of-work`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in getScopeOfWork for tender ${tenderId}:`, error);
    throw error;
  }
};

// ============================================================================
// One-Pager Endpoints
// ============================================================================

/**
 * Generate one-pager executive summary
 * POST /api/v1/tenderiq/analyze/tender/{tenderId}/one-pager
 * @param tenderId - UUID of the tender
 * @param request - Generation request parameters
 * @returns Generated one-pager document
 */
export const generateOnePager = async (
  tenderId: string,
  request: GenerateOnePagerRequest
): Promise<OnePagerResponse> => {
  console.log(`Generating one-pager for tender: ${tenderId}`, request);

  const url = `${ANALYZE_API_BASE}/tender/${tenderId}/one-pager`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in generateOnePager for tender ${tenderId}:`, error);
    throw error;
  }
};

// ============================================================================
// Data Sheet Endpoints
// ============================================================================

/**
 * Generate data sheet for a tender
 * GET /api/v1/tenderiq/analyze/tender/{tenderId}/data-sheet
 * @param tenderId - UUID of the tender
 * @param options - Optional parameters (format, includeAnalysis)
 * @returns Generated data sheet
 */
export const generateDataSheet = async (
  tenderId: string,
  options?: {
    format?: 'json' | 'csv' | 'excel';
    includeAnalysis?: boolean;
  }
): Promise<DataSheetResponse> => {
  console.log(`Generating data sheet for tender: ${tenderId}`, options);

  const params = new URLSearchParams();
  if (options?.format) params.append('format', options.format);
  if (options?.includeAnalysis !== undefined) params.append('include_analysis', options.includeAnalysis.toString());

  const url = `${ANALYZE_API_BASE}/tender/${tenderId}/data-sheet?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error(`Error in generateDataSheet for tender ${tenderId}:`, error);
    throw error;
  }
};

// ============================================================================
// List Analyses Endpoints
// ============================================================================

/**
 * List recent analyses for the authenticated user
 * GET /api/v1/tenderiq/analyze/analyses
 * @param options - Optional parameters (limit, offset, status, tenderId)
 * @returns List of analyses with pagination
 */
export const listAnalyses = async (options?: {
  limit?: number;
  offset?: number;
  status?: string;
  tenderId?: string;
}): Promise<AnalysesListResponse> => {
  console.log('Fetching list of analyses', options);

  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.status) params.append('status', options.status);
  if (options?.tenderId) params.append('tender_id', options.tenderId);

  const url = `${ANALYZE_API_BASE}/analyses?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error in listAnalyses:', error);
    throw error;
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Poll for analysis completion with exponential backoff
 * @param analysisId - UUID of the analysis
 * @param maxAttempts - Maximum number of poll attempts
 * @param initialDelay - Initial delay in milliseconds
 * @returns Completed analysis results
 */
export const pollAnalysisCompletion = async (
  analysisId: string,
  maxAttempts: number = 60,
  initialDelay: number = 500
): Promise<AnalysisResultsResponse> => {
  console.log(`Polling for analysis completion: ${analysisId}`);

  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      const results = await getAnalysisResults(analysisId);

      if (results.status === 'completed') {
        console.log(`Analysis completed: ${analysisId}`);
        return results;
      }

      if (results.status === 'failed') {
        throw new Error(`Analysis failed: ${analysisId}`);
      }

      // Still processing, wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 5000); // Max 5 second delay
      attempt++;
    } catch (error) {
      // If 202 or still processing, continue polling
      if (error instanceof Error && error.message.includes('API Error')) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 5000);
        attempt++;
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Analysis polling timeout after ${maxAttempts} attempts: ${analysisId}`);
};
