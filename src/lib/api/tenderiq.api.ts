import { API_BASE_URL } from "../config/api";
import { FullTenderDetails, Report, ScrapeDateResponse, Tender, TenderActionRequest, TenderHistoryItem } from "../types/tenderiq.types";
import { getCurrencyNumberFromText } from "../utils/conversions";
import { getAuthHeaders } from "./authHelper";

/**
 * Fetch all wishlisted tenders.
 * @returns Array of wishlisted tenders.
 */
export const fetchWishlistedTenders = async (): Promise<Tender[]> => {
  const url = `${API_BASE_URL}/tenderiq/wishlist`;
  console.log('Fetching wishlisted tenders from:', url);
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch wishlisted tenders: ${response.status} ${errorText}`);
      throw new Error(`Failed to fetch wishlisted tenders: ${response.status} ${errorText}`);
    }
    const data: Tender[] = await response.json();
    return data
  } catch (error) {
    console.error('Error fetching wishlisted tenders:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - check if backend is running on port 8000');
    }
    throw error;
  }
};

/**
 * Perform an action on a tender (e.g., wishlist, archive).
 * @param tenderId The ID of the tender.
 * @param action The action to perform.
 */
export const performTenderAction = async (
  tenderId: string,
  action: TenderActionRequest
): Promise<void> => {
  const url = `${API_BASE_URL}/tenderiq/tenders/${tenderId}/actions`;
  console.log(`Performing action on tender ${tenderId}:`, action);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to perform action on tender: ${response.status} ${errorText}`);
    }
    
    console.log(`Action ${action.action} on tender ${tenderId} successful.`);
  } catch (error) {
    console.error(`Error in performTenderAction for tender ${tenderId}:`, error);
    throw error;
  }
};

/**
* Fetch the full details of a tender
* */
export const fetchFullTenderDetails = async (tenderId: string, tdr?: string): Promise<FullTenderDetails> => {
  let url = `${API_BASE_URL}/tenderiq/tenders/${tenderId}/full`;
  if (tdr) {
    url += `?tdr=${encodeURIComponent(tdr)}`;
  }
  console.log(`Fetching analysis for tender ${tenderId} from:`, url);
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch tender analysis: ${response.status} ${errorText}`);
    }
    const data = await response.json() as FullTenderDetails;
    console.log(`Analysis for tender ${tenderId} successful:`, data);
    return data;
  } catch (error) {
    console.error(`Error in fetchTenderAnalysis for tender ${tenderId}:`, error);
    throw error;
  }
}

export const getScrapeDates = async (): Promise<ScrapeDateResponse> => {
  const url = `${API_BASE_URL}/tenderiq/dates`
  console.log(`Fetching available dates from:`, url);
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch available dates: ${response.status} ${errorText}`);
      throw new Error(`Failed to fetch available dates: ${response.status} ${errorText}`);
    }
    const data = await response.json() as ScrapeDateResponse;
    console.log(`Available dates successful:`, data);
    return data;
  } catch (error) {
    console.error(`Error in getScrapeDates:`, error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - check if backend is running on port 8000 and proxy is configured');
    }
    throw error;
  }
}

export async function getTodayTenders(): Promise<Report | undefined> {
  const url = `${API_BASE_URL}/tenderiq/tenders-sse`
  try {
    const data = await fetch(url)
    const json = await data.json() as Report
    // json.queries.forEach((query) => {
    //   query.tenders.forEach((tender) => tender.tender_value = getCurrencyNumberFromText(tender.tender_value).toString())
    // })
    // This creates a brand new object and leaves the original 'json' unchanged
    const newJson = {
      ...json,
      queries: json.queries.map((query) => ({
        ...query,
        tenders: query.tenders.map((tender) => ({
          ...tender,
          tender_value: getCurrencyNumberFromText(tender.tender_value).toString(),
        })),
      })),
    };
    console.log(newJson)

    return newJson
  } catch (error) {
    console.error('Error fetching tenders:', error)
    return undefined
  }
}

/**
 * Fetch tender change history (corrigendums and amendments)
 * Accepts either tender UUID or TDR; backend supports both.
 */
export const fetchTenderHistory = async (tenderIdOrTdr: string): Promise<TenderHistoryItem[]> => {
  const url = `${API_BASE_URL}/tenderiq/corrigendum/${tenderIdOrTdr}/history`;
  console.log(`Fetching tender history for ${tenderIdOrTdr} from:`, url);
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch tender history: ${response.status} ${errorText}`);
    }
    const data = await response.json() as TenderHistoryItem[];
    console.log(`Tender history for ${tenderIdOrTdr} successful:`, data);
    return data;
  } catch (error) {
    console.error(`Error in fetchTenderHistory for tender ${tenderIdOrTdr}:`, error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}
