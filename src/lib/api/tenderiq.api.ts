import { API_BASE_URL } from "../config/api";
import { Report } from "../types/tenderiq.types";
import { getCurrencyNumberFromText } from "../utils/conversions";

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
