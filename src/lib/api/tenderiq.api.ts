import { API_BASE_URL } from "../config/api";
import { FullTenderDetails, Report, Tender, TenderActionRequest } from "../types/tenderiq.types";
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
      throw new Error('Failed to fetch wishlisted tenders');
    }
    const data: Tender[] = await response.json();
    return data
  } catch (error) {
    console.error('Error fetching wishlisted tenders:', error);
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
export const fetchFullTenderDetails = async (tenderId: string): Promise<FullTenderDetails> => {
  const url = `${API_BASE_URL}/tenderiq/tenders/${tenderId}/full`;
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
