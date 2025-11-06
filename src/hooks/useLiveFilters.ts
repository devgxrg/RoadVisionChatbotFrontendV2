import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tender } from '@/lib/types/tenderiq';
import { fetchDailyTenders, fetchFilteredTenders } from '@/lib/api/tenderiq';
import { useToast } from '@/hooks/use-toast';

interface UseLiveFiltersParams {
  selectedDate?: string;
  selectedDateRange?: string;
  includeAllDates?: boolean;
  selectedCategory?: string;
  selectedLocation?: string;
  minValue?: number | null;
  maxValue?: number | null;
}

interface UseLiveFiltersResult {
  tenders: Tender[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage live tenders data with caching
 *
 * The /tenders endpoint is now the main source:
 * - When no filters: fetches latest scraped date first, then gets tenders for that date
 * - When filters applied: uses /tenders endpoint with filter params
 *
 * Both paths use the /tenders endpoint which returns tenders organized by queries/categories
 */
export const useLiveFilters = (params: UseLiveFiltersParams): UseLiveFiltersResult => {
  const { toast } = useToast();
  const [tenders, setTenders] = useState<Tender[]>([]);

  // Check if any date/filter params are set
  const hasDateOrFilters = !!(params.selectedDate || params.selectedDateRange || params.includeAllDates);

  // Use React Query for filtered tenders when filters are applied
  const { data: filteredData, isLoading: isLoadingFiltered, error: errorFiltered, refetch: refetchFiltered } = useQuery({
    queryKey: [
      'filteredTenders',
      params.selectedDate,
      params.selectedDateRange,
      params.includeAllDates,
      params.selectedCategory,
      params.selectedLocation,
      params.minValue,
      params.maxValue,
    ],
    queryFn: async () => {
      const minVal = params.minValue ? parseFloat(params.minValue.toString()) : undefined;
      const maxVal = params.maxValue ? parseFloat(params.maxValue.toString()) : undefined;

      const response = await fetchFilteredTenders({
        date: params.selectedDate,
        date_range: params.selectedDateRange as any,
        include_all_dates: params.includeAllDates,
        category: params.selectedCategory !== "all" ? params.selectedCategory : undefined,
        location: params.selectedLocation !== "all" ? params.selectedLocation : undefined,
        min_value: minVal,
        max_value: maxVal,
      });
      return response.tenders;
    },
    enabled: hasDateOrFilters,
  });

  // Use React Query for daily tenders when no date filters are set
  // This internally fetches latest date and gets tenders for that date via /tenders endpoint
  const { data: dailyData, isLoading: isLoadingDaily, error: errorDaily, refetch: refetchDaily } = useQuery({
    queryKey: ['dailyTenders'],
    queryFn: () => fetchDailyTenders(),
    enabled: !hasDateOrFilters,
  });

  // Update tenders based on which query succeeded
  useEffect(() => {
    if (filteredData) {
      setTenders(filteredData);
    } else if (dailyData) {
      setTenders(dailyData);
    }
  }, [filteredData, dailyData]);

  // Handle errors
  useEffect(() => {
    const error = errorFiltered || errorDaily;
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load tenders. Please try again.",
        variant: "destructive",
      });
    }
  }, [errorFiltered, errorDaily, toast]);

  const refetch = () => {
    if (hasDateOrFilters) {
      refetchFiltered();
    } else {
      refetchDaily();
    }
  };

  return {
    tenders,
    isLoading: isLoadingFiltered || isLoadingDaily,
    error: errorFiltered || errorDaily || null,
    refetch,
  };
};
