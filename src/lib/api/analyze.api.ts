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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch analysis: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as TenderAnalysisResponse;
    data.rfp_sections = data.rfp_sections || mockTenderAnalysis.rfp_sections
    data.data_sheet = data.data_sheet || mockTenderAnalysis.data_sheet
    return data

  } catch (error) {
    console.error(`Error in fetchTenderAnalysis for tender ${tenderId}:`, error);
    throw error;
  }
};

/**
 * Download tender analysis report in specified format
 *
 * @param tenderId - UUID of the tender
 * @param format - Report format (pdf, excel, word)
 */
export const downloadAnalysisReport = async (tenderId: string, format: 'pdf' | 'excel' | 'word' = 'pdf'): Promise<void> => {
  const url = `${API_BASE_URL}/analyze/report/download/${tenderId}?format=${format}`;

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to download analysis report');
    }

    // Get filename from Content-Disposition header or construct default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Tender_Analysis_${tenderId}.${format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : 'pdf'}`;

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

    console.log('Analysis report downloaded:', filename);
  } catch (error) {
    console.error('Error downloading analysis report:', error);
    throw error;
  }
};

/**
 * Download a template file
 *
 * @param templateId - UUID of the template
 * @returns Promise that resolves when download completes
 */
export const downloadTemplate = async (templateId: string, templateName: string): Promise<void> => {
  const url = `${API_BASE_URL}/analyze/templates/download/${templateId}`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = templateName.replace(/\s+/g, '_') + '.pdf';
    
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
    
    console.log('Template downloaded:', filename);
  } catch (error) {
    console.error('Error downloading template:', error);
    throw error;
  }
};
