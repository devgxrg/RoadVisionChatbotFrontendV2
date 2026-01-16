import { LegalResearchData } from "@/lib/types/legal-research";

const API_BASE_URL = "/api/v1";

export async function searchLegalCases(query: string): Promise<LegalResearchData> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/legal-research/search?q=${encodeURIComponent(query)}`);
  // return response.json();

  // Hardcoded data for now
  return {
    searchResults: [
      {
        caseName: "Union of India vs. ABC Infrastructure Ltd.",
        citation: "2023 SCC OnLine Del 1234",
        summary: "This judgment addresses the interpretation of force majeure clauses in infrastructure contracts during extraordinary circumstances.",
        relevance: 95,
        court: "Delhi High Court",
        date: "2023-08-15",
      },
      {
        caseName: "State Bank of India vs. XYZ Construction Co.",
        citation: "AIR 2022 SC 567",
        summary: "Supreme Court ruling on payment obligations under construction contracts and the applicability of Section 73 of the Indian Contract Act.",
        relevance: 92,
        court: "Supreme Court",
        date: "2022-11-20",
      },
      {
        caseName: "National Highway Authority vs. Road Builders Pvt. Ltd.",
        citation: "2024 SCC OnLine Bom 234",
        summary: "Addresses disputes arising from delayed milestone payments in road construction projects.",
        relevance: 88,
        court: "Bombay High Court",
        date: "2024-02-10",
      },
      {
        caseName: "Ministry of Railways vs. Metro Infra Corp.",
        citation: "2023 SCC 789",
        summary: "Landmark judgment on arbitration clauses in government infrastructure contracts.",
        relevance: 85,
        court: "Supreme Court",
        date: "2023-05-30",
      },
    ],
  };
}

