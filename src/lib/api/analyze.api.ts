/**
 * TenderIQ Analyze Module API Service
 * Single endpoint for fetching complete tender analysis
 * GET /api/v1/tenderiq/analyze/{tenderId}
 */

import { API_BASE_URL } from '@/lib/config/api';
import { getAuthHeaders } from '@/lib/api/authHelper';
import { TenderAnalysisResponse } from '@/lib/types/analyze.type';
import { mockTenderAnalysis } from '../mock/analyze.mock';

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

/**
 * Fetch complete tender analysis data
 * GET /api/v1/tenderiq/analyze/{tenderId}
 *
 * @param tenderId - UUID of the tender
 * @returns Complete analysis response with all sections
 */
export const fetchTenderAnalysis = async (tenderId: string): Promise<TenderAnalysisResponse> => {
  console.log(`Fetching tender analysis for: ${tenderId}`);
  // return mockTenderAnalysis

  const url = `${API_BASE_URL}/analyze/${tenderId}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await response.json() as TenderAnalysisResponse;
    data.rfp_sections = data.rfp_sections || mockTenderAnalysis.rfp_sections
    data.data_sheet = data.data_sheet || mockTenderAnalysis.data_sheet
    return data

  } catch (error) {
    console.error(`Error in fetchTenderAnalysis for tender ${tenderId}:`, error);
    throw error;
  }
};
