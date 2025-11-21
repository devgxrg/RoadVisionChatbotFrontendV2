import { BidSynopsisData, BidSynopsisProps, SynopsisContent } from '@/lib/types/bidsynopsis.types';
import { generateMockSynopsisContent } from '@/lib/mock/bidsynopsis.mock';
import { API_BASE_URL } from '../config/api';

/**
 * Fetches bid synopsis data for a given tender
 * Currently returns mock data - will be replaced with actual API call
 */
export const fetchBidSynopsis = async (
  tenderId: string,
  tenderData?: BidSynopsisProps
): Promise<SynopsisContent> => {
  const url = `${API_BASE_URL}/bidsynopsis/synopsis/${tenderId}`;
  console.log(`Fetching bid synopsis for tender ${tenderId} from:`, url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch bid synopsis: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    console.log(`Bid synopsis for tender ${tenderId} successful:`, data);
    return data;
  } catch (e) {
    console.error(`Error in fetchBidSynopsis for tender ${tenderId}:`, e);
    return null
  }
};

/**
 * Saves bid synopsis data to backend database
 */
export const saveBidSynopsis = async (
  tenderId: string,
  data: BidSynopsisData
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/bidsynopsis/synopsis/save`;
  console.log(`Saving bid synopsis for tender ${tenderId} to:`, url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tender_id: tenderId,
        ceigall_data: data.ceigallData || {},
        requirement_data: data.requirementData || {},
        extracted_value_data: data.extractedValueData || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save bid synopsis: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log(`Bid synopsis for tender ${tenderId} saved successfully:`, result);

    // Also save to localStorage as backup
    const storageKey = `bid-synopsis-${tenderId}`;
    const dataToSave = {
      ...data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    return { success: true, message: result.message || 'Saved successfully' };
  } catch (e) {
    console.error(`Error saving bid synopsis for tender ${tenderId}:`, e);

    // Fallback to localStorage on error
    const storageKey = `bid-synopsis-${tenderId}`;
    const dataToSave = {
      ...data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    return { success: false, message: e instanceof Error ? e.message : 'Failed to save' };
  }
};

/**
 * Loads bid synopsis data from localStorage
 */
export const loadBidSynopsis = async (tenderId: string): Promise<BidSynopsisData | null> => {
  const url = `${API_BASE_URL}/bidsynopsis/synopsis/${tenderId}`;
  console.log(`Fetching bid synopsis for tender ${tenderId} from:`, url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch bid synopsis: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    console.log(`Bid synopsis for tender ${tenderId} successful:`, data);
    return data;
  } catch (e) {
    console.error(`Error in fetchBidSynopsis for tender ${tenderId}:`, e);
    return null
  }
};

/**
 * Exports bid synopsis to PDF
 * Placeholder for future implementation
 */
export const exportBidSynopsisToPDF = async (
  tenderId: string,
  data: BidSynopsisData
): Promise<void> => {
  // TODO: Implement PDF export functionality
  console.log('Exporting to PDF:', { tenderId, data });
  throw new Error('PDF export not yet implemented');
};

