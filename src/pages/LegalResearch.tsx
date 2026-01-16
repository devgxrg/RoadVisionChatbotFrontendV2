import { useState } from "react";
import { toast } from "sonner";
import { LegalResearchUI } from "@/components/legal-research/LegalResearchUI";
import { saveLegalResearchToCase } from "@/lib/api/case-tracker";

// Define the structure of a search result document
interface SearchDoc {
  tid: string;
  title: string;
  headline: string;
  docsource: string;
  date: string; // Add date field
}

// Define the structure of the API response
interface ApiResponse {
  docs: SearchDoc[];
  found: number;
  // Add other fields from the API response if needed
}

export default function LegalResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalResultsCount, setTotalResultsCount] = useState<number | null>(null);
  const [savingCaseId, setSavingCaseId] = useState<string | null>(null);

  const parseTotalCount = (found: any): number | null => {
    if (typeof found === 'number') return found;
    if (typeof found === 'string') {
      // Example formats: "1 - 10 of 486666" or "486666"
      const matches = found.match(/(\d[\d,]*)/g);
      if (matches && matches.length > 0) {
        const last = matches[matches.length - 1].replace(/,/g, '');
        const n = parseInt(last, 10);
        if (!isNaN(n)) return n;
      }
    }
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(0);

    try {
      const response = await fetch("http://localhost:8000/api/v1/legaliq/legal-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery, page: 0 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch search results");
      }

      const data: ApiResponse = await response.json();
      setSearchResults(data);
      // Parse the total count into a numeric value so UI logic works reliably
      const parsedTotal = parseTotalCount((data as any).found);
      setTotalResultsCount(parsedTotal);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Search failed: ${errorMessage}`);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!searchResults) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/legaliq/legal-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery, page: nextPage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch more results");
      }

      const data: ApiResponse = await response.json();
      // Append new docs to existing results
      setSearchResults((prev) => {
        if (!prev) return data;
        return {
          ...data,
          docs: [...prev.docs, ...(data.docs || [])],
          found: data.found || prev.found,
        } as ApiResponse;
      });
      // Update parsed total count in case the backend sends different metadata on later pages
      const parsedTotal = parseTotalCount((data as any).found);
      if (parsedTotal) setTotalResultsCount(parsedTotal);
      setCurrentPage(nextPage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Load more failed: ${errorMessage}`);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSaveToCase = async (result: SearchDoc) => {
    try {
      setSavingCaseId(result.tid);

      const newCase = await saveLegalResearchToCase({
        title: result.title,
        tid: result.tid,
        docsource: result.docsource,
        date: result.date,
      });

      toast.success(
        `"${result.title}" saved to Case Tracker! (Case ID: ${newCase.caseId})`,
        { duration: 5000 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to save case: ${errorMessage}`);
    } finally {
      setSavingCaseId(null);
    }
  };

  return (
    <LegalResearchUI
      searchQuery={searchQuery}
      hasSearched={hasSearched}
      searchResults={searchResults?.docs || []}
      totalResults={totalResultsCount ?? 0}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      savingCaseId={savingCaseId}
      onSearchQueryChange={setSearchQuery}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      onSaveToCase={handleSaveToCase}
    />
  );
}
