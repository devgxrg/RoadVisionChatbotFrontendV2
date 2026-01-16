import { API_BASE_URL } from "../config/api";
import type { SourceReference } from "../types/ask-ai";

interface LegalHistoryEntry {
  user: string;
  ai: string;
}

interface LegalQueryRequest {
  query: string;
  history: LegalHistoryEntry[];
}

interface LegalQueryResponse {
  response: string;
  sources?: SourceReference[];
}

export async function uploadLegalDocs(files: File[]): Promise<void> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${API_BASE_URL}/legaliq/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload documents: ${res.status} ${text}`);
  }
}

export async function askLegalQuestion(
  query: string,
  history: LegalHistoryEntry[]
): Promise<LegalQueryResponse> {
  const payload: LegalQueryRequest = { query, history };

  const res = await fetch(`${API_BASE_URL}/legaliq/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to query LegalAI: ${res.status} ${text}`);
  }

  const data = (await res.json()) as LegalQueryResponse;
  return data;
}

