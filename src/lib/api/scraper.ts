/**
 * Scraper API Client
 * Handles API calls to /api/v1/scraper/* endpoints
 */

import { API_BASE_URL } from '@/lib/config/api';
import { getAuthHeaders } from './authHelper';

export interface ScrapeLinkRequest {
  link: string;
  source_priority?: 'low' | 'normal' | 'high';
  skip_dedup_check?: boolean;
}

export interface ScrapeStatusResponse {
  status: string;
  message: string;
  scrape_run_id?: string;
}

export interface ScrapeRun {
  id: string;
  run_at: string | null;
  tender_release_date: string | null;
  date_str: string | null;
  name: string | null;
  company: string | null;
  contact: string | null;
  no_of_new_tenders: string | null;
}

export interface ScrapeRunDetails extends ScrapeRun {
  queries: Array<{
    id: string;
    query_name: string;
    number_of_tenders: string;
  }>;
}

export interface ScrapeRunsResponse {
  runs: ScrapeRun[];
  total: number;
}

/**
 * Trigger scraping for a tender link
 * POST /api/v1/scraper/scrape/link
 */
export const triggerScrape = async (
  request: ScrapeLinkRequest
): Promise<ScrapeStatusResponse> => {
  const url = `${API_BASE_URL}/scraper/scrape/link`;
  console.log('Triggering scrape for link:', request.link);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to trigger scrape: ${response.status} ${errorText}`);
      throw new Error(`Failed to trigger scrape: ${response.status} ${errorText}`);
    }

    const data = await response.json() as ScrapeStatusResponse;
    console.log('Scrape triggered successfully:', data);
    return data;
  } catch (error) {
    console.error('Error triggering scrape:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - check if backend is running on port 8000');
    }
    throw error;
  }
};

/**
 * Get recent scrape runs
 * GET /api/v1/scraper/scrape/runs
 */
export const getScrapeRuns = async (
  limit: number = 10
): Promise<ScrapeRunsResponse> => {
  const url = `${API_BASE_URL}/scraper/scrape/runs?limit=${limit}`;
  console.log('Fetching scrape runs');

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch scrape runs: ${response.status} ${errorText}`);
      throw new Error(`Failed to fetch scrape runs: ${response.status} ${errorText}`);
    }

    const data = await response.json() as ScrapeRunsResponse;
    console.log(`Fetched ${data.runs.length} scrape runs`);
    return data;
  } catch (error) {
    console.error('Error fetching scrape runs:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - check if backend is running on port 8000');
    }
    throw error;
  }
};

/**
 * Get details of a specific scrape run
 * GET /api/v1/scraper/scrape/runs/{run_id}
 */
export const getScrapeRunDetails = async (
  runId: string
): Promise<ScrapeRunDetails> => {
  const url = `${API_BASE_URL}/scraper/scrape/runs/${runId}`;
  console.log('Fetching scrape run details for:', runId);

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch scrape run details: ${response.status} ${errorText}`);
      throw new Error(`Failed to fetch scrape run details: ${response.status} ${errorText}`);
    }

    const data = await response.json() as ScrapeRunDetails;
    console.log('Scrape run details fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching scrape run details:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - check if backend is running on port 8000');
    }
    throw error;
  }
};
