# Case Tracker Module Updates

**Date:** January 14, 2026
**File Modified:** `frontend/src/pages/CaseTracker.tsx`

This document outlines the recent enhancements and functional updates made to the Case Tracker module to improve dynamic data handling and feature completeness.

## 1. Dynamic Hearing Management

The Hearing section has been refactored to support dynamic data rendering instead of static placeholders.

### Changes Implemented:
- **Data Structure Update:** The `allCases` mock data was updated to include a comprehensive list of hearing records for each case, including dates, judges, purposes, outcomes, and document links.
- **Dynamic Rendering:** The "Hearings" tab now iterates over the `selectedCase.hearings` array to display the hearing history table and timeline.
- **Next Hearing Calculation (Case Level):** Logic was added to automatically identify the latest or upcoming hearing for the currently selected case to display in the "Next Hearing Date" widget within the Hearings tab.

## 2. AI Insights Integration

The AI Insights section in the "Analytics" tab has been activated to display case-specific intelligence.

### Changes Implemented:
- **Data Model Extension:** Added an `aiInsights` object to the case data structure containing:
  - `summary`: A brief overview of the case status.
  - `winProbability`: Estimated success rate.
  - `estimatedDuration`: Projected timeline.
  - `recommendedAction`: Strategic advice.
- **UI Integration:** The UI now binds to these fields. If data is missing, it gracefully falls back to "Analysis pending..." or "Calculating..." states.

## 3. Dynamic Dashboard Widgets

The four summary cards at the top of the Case Tracker dashboard have been updated to calculate metrics dynamically based on the available dataset.

### Metrics & Logic:
1.  **Total Active Cases:**
    -   **Logic:** Filters the `allCases` array to count items where `litigationStatus` is not "Closed".
    -   **Display:** Shows the count of active cases.

2.  **Upcoming Hearings:**
    -   **Logic:** 
        -   Aggregates all hearings from all cases.
        -   Filters for hearings where the date is greater than or equal to today (`new Date()`).
        -   Sorts them chronologically.
    -   **Display:** Shows the total count of future hearings and the date of the *next immediate* hearing across all cases.

3.  **Avg. Case Duration:**
    -   **Logic:** 
        -   Iterates through all cases.
        -   Calculates the duration in months from `filingDate` to the current date (or closed date).
        -   Computes the average across the dataset.
    -   **Display:** Shows the average duration in months (e.g., "4.8 months").

4.  **Recent Cases:**
    -   **Logic:** Counts the total number of cases in the `allCases` array.
    -   **Display:** Shows the total database count.

## Summary of Modified Code Blocks

### Dashboard Metrics Calculation
```typescript
// Calculate Summary Metrics
const activeCasesCount = allCases.filter(c => c.litigationStatus !== "Closed").length;

// Calculate upcoming hearings across all cases
const today = new Date();
const allUpcomingHearings = allCases.flatMap(c => 
  c.hearings
    .filter(h => new Date(h.date) >= today)
    .map(h => ({ ...h, caseId: c.caseId, caseTitle: c.caseTitle }))
).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const upcomingHearingsCount = allUpcomingHearings.length;
const nextHearingGlobal = allUpcomingHearings.length > 0 ? allUpcomingHearings[0] : null;

// Calculate average duration
const calculateDurationInMonths = (startDate: string, endDate?: string) => {
  // ... calculation logic ...
};
```

### AI Insights Data Structure
```typescript
aiInsights: {
  summary: "The case is in early stages...",
  winProbability: "75%",
  estimatedDuration: "12-18 months",
  recommendedAction: "Prepare rejoinder draft..."
}
```
