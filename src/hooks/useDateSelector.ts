import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAvailableDates, getLatestScrapedDate, AvailableDate } from '@/lib/api/tenderiq';

interface UseDateSelectorResult {
  availableDates: AvailableDate[];
  isLoading: boolean;
  error: Error | null;
  displayLabel: string;
}

/**
 * Get the display label for date selection UI
 */
const getDisplayLabel = (
  selectedDate?: string,
  selectedDateRange?: string,
  includeAllDates?: boolean,
  availableDates?: AvailableDate[]
): string => {
  if (includeAllDates) {
    return "All Dates";
  }

  if (selectedDateRange) {
    const rangeLabels: Record<string, string> = {
      last_1_day: "Last 1 Day",
      last_5_days: "Last 5 Days",
      last_7_days: "Last 7 Days",
      last_30_days: "Last 30 Days",
    };
    return rangeLabels[selectedDateRange] || selectedDateRange;
  }

  if (selectedDate && availableDates) {
    const selectedDateObj = availableDates.find(d => d.date === selectedDate);
    if (selectedDateObj) {
      return `${selectedDateObj.date_str} (${selectedDateObj.tender_count} tenders)`;
    }
    return selectedDate;
  }

  // If no date is explicitly selected, show the latest scraped date from API response
  const latestDate = getLatestScrapedDate();
  if (latestDate) {
    return `${latestDate.dateStr} (Latest)`;
  }

  return "Loading dates...";
};

/**
 * Group and deduplicate dates by combining tender counts from multiple runs
 */
const groupAndSortDates = (rawDates: AvailableDate[]): AvailableDate[] => {
  const dateMap = new Map<string, AvailableDate>();

  rawDates.forEach(d => {
    if (dateMap.has(d.date)) {
      const existing = dateMap.get(d.date)!;
      existing.tender_count += d.tender_count;
      if (d.is_latest) {
        existing.is_latest = true;
      }
    } else {
      // Create a copy to avoid modifying the original from the query cache
      dateMap.set(d.date, { ...d });
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

/**
 * Custom hook to fetch and manage available dates for the date selector
 * Uses React Query for caching and automatic refetching
 */
export const useDateSelector = (
  selectedDate?: string,
  selectedDateRange?: string,
  includeAllDates?: boolean
): UseDateSelectorResult => {
  const { data: rawDates, isLoading, error } = useQuery<AvailableDate[]>({
    queryKey: ['availableDates'],
    queryFn: fetchAvailableDates,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const availableDates = useMemo(
    () => (rawDates ? groupAndSortDates(rawDates) : []),
    [rawDates]
  );

  const displayLabel = useMemo(
    () => getDisplayLabel(selectedDate, selectedDateRange, includeAllDates, availableDates),
    [selectedDate, selectedDateRange, includeAllDates, availableDates]
  );

  return {
    availableDates,
    isLoading,
    error: error instanceof Error ? error : null,
    displayLabel,
  };
};
