import { API_BASE_URL } from "../config/api";
import { mockHistoryPageResponse } from "../mock/wishlist";
import { HistoryPageResponse } from "../types/wishlist";

{/*
Endpoint: {api_root}/tenderiq/history-wishlist
Request Method: GET
Parameters: None
Response: JSON
```
{
  "report_file_url": "https://example.com/report.xlsx", // Excel file
  "tenders": [
    {
      "id": "1", // string
      "title": "Tender 1", // string
      "authority": "Authority 1", // string
      "value": 100000, // number
      "emd": 50000, // number
      "due_date": "15 Dec", // string
      "category": "Category 1", // string
      "progress": 50, // number
      "analysis_state": true, // boolean
      "synopsis_state": false, // boolean
      "evaluated_state": false, // boolean
      "results": "pending" // "won" | "rejected" | "incomplete" | "pending"
    }
  ]
}
```
*/}
export async function getHistoryWishlistData(): Promise<HistoryPageResponse> {
  // return mockHistoryPageResponse;
  try {
    const response = await fetch(`${API_BASE_URL}/tenderiq/history-wishlist`)
    if (!response.ok) {
      throw new Error('Failed to fetch wishlisted tenders');
    }
    const data = await response.json() as HistoryPageResponse;
    return data;
  } catch (error) {
    console.error(error)
    return mockHistoryPageResponse;
  }
}
