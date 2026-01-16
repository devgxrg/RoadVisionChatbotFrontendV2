import { CaseTrackerData, Case } from "@/lib/types/case-tracker";

const API_BASE_URL = "/api/v1";

export async function getCaseTrackerData(): Promise<CaseTrackerData> {
  try {
    const response = await fetch(`${API_BASE_URL}/casetracker/cases`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching case tracker data:", error);
    throw error;
  }
}

export async function getCaseById(id: number): Promise<Case | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/casetracker/cases/${id}`);

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching case ${id}:`, error);
    throw error;
  }
}

export async function uploadCase(
  file: File,
  metadata?: {
    caseTitle?: string;
    caseId?: string;
    courtName?: string;
    caseType?: string;
    litigationStatus?: string;
  }
): Promise<{ message: string; case: Case }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add optional metadata
    if (metadata?.caseTitle) {
      formData.append("caseTitle", metadata.caseTitle);
    }
    if (metadata?.caseId) {
      formData.append("caseId", metadata.caseId);
    }
    if (metadata?.courtName) {
      formData.append("courtName", metadata.courtName);
    }
    if (metadata?.caseType) {
      formData.append("caseType", metadata.caseType);
    }
    if (metadata?.litigationStatus) {
      formData.append("litigationStatus", metadata.litigationStatus);
    }

    const response = await fetch(`${API_BASE_URL}/casetracker/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading case:", error);
    throw error;
  }
}

export async function updateCase(
  id: number,
  updateData: Partial<Case>
): Promise<Case> {
  try {
    const response = await fetch(`${API_BASE_URL}/casetracker/cases/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating case ${id}:`, error);
    throw error;
  }
}

export async function deleteCase(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/casetracker/cases/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting case ${id}:`, error);
    throw error;
  }
}

/**
 * Save a legal research case to Case Tracker
 * 
 * @param data - Case data from Indian Kanoon (title, tid, docsource, date)
 * @returns Promise<Case> - Created case with all details
 */
export async function saveLegalResearchToCase(data: {
  title: string;
  tid: string;
  docsource: string;
  date?: string;
}): Promise<Case> {
  try {
    // Build request body, only including date if it exists
    const requestBody: any = {
      title: data.title,
      tid: String(data.tid), // Convert to string to match backend schema
      docsource: data.docsource,
    };

    if (data.date) {
      requestBody.date = data.date;
    }

    console.log("Sending request to save-research-case:", requestBody);

    const response = await fetch(`${API_BASE_URL}/casetracker/save-research-case`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API Error Response:", error);

      // Format validation errors for display
      let errorMessage = "Failed to save research case";

      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // FastAPI validation errors are an array
          const validationErrors = error.detail.map((err: any) =>
            `${err.loc?.join('.')} - ${err.msg}`
          ).join('; ');
          errorMessage = `Validation error: ${validationErrors}`;
        } else if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else {
          errorMessage = JSON.stringify(error.detail);
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error saving legal research case:", error);
    throw error;
  }
}
