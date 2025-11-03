import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Loader2, ChevronDown } from "lucide-react";
import { fetchAvailableDates, AvailableDate } from "@/lib/api/tenderiq";
import { useToast } from "@/hooks/use-toast";

/**
 * Format a date string (ISO 8601 or timestamp) to a readable format
 * Uses run_at timestamp as the reliable source instead of date_str from backend
 */
const formatDateFromRunAt = (runAt: string): string => {
  try {
    const date = new Date(runAt);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown Date';
  }
};

interface DateSelectorProps {
  onDateSelect: (date: string | null, dateRange: string | null, includeAll: boolean) => void;
  selectedDate?: string;
  selectedDateRange?: string;
  includeAllDates?: boolean;
}

const DateSelector = ({
  onDateSelect,
  selectedDate,
  selectedDateRange,
  includeAllDates
}: DateSelectorProps) => {
  const { toast } = useToast();
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLabel, setDisplayLabel] = useState("Loading dates...");

  useEffect(() => {
    const loadDates = async () => {
      setLoading(true);
      try {
        const dates = await fetchAvailableDates();
        setAvailableDates(dates);

        // Set default to latest date
        if (dates.length > 0 && !selectedDate && !selectedDateRange && !includeAllDates) {
          const latestDate = dates.find(d => d.is_latest);
          if (latestDate) {
            onDateSelect(latestDate.date, null, false);
            setDisplayLabel(`Latest (${latestDate.date_str})`);
          }
        }
      } catch (error) {
        console.error('Failed to load available dates:', error);
        toast({
          title: "Error",
          description: "Failed to load available dates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDates();
  }, []);

  // Update display label based on current selection
  useEffect(() => {
    if (includeAllDates) {
      setDisplayLabel("All Dates");
    } else if (selectedDateRange) {
      const rangeLabels: Record<string, string> = {
        last_1_day: "Last 1 Day",
        last_5_days: "Last 5 Days",
        last_7_days: "Last 7 Days",
        last_30_days: "Last 30 Days",
      };
      setDisplayLabel(rangeLabels[selectedDateRange] || selectedDateRange);
    } else if (selectedDate) {
      const selectedDateObj = availableDates.find(d => d.date === selectedDate);
      if (selectedDateObj) {
        // Use run_at as reliable source for formatting instead of date_str
        const formattedDate = formatDateFromRunAt(selectedDateObj.run_at);
        setDisplayLabel(`${formattedDate} (${selectedDateObj.tender_count} tenders)`);
      } else {
        setDisplayLabel(selectedDate);
      }
    }
  }, [selectedDate, selectedDateRange, includeAllDates, availableDates]);

  const handleDateSelect = (date: string) => {
    onDateSelect(date, null, false);
  };

  const handleDateRangeSelect = (range: 'last_1_day' | 'last_5_days' | 'last_7_days' | 'last_30_days') => {
    onDateSelect(null, range, false);
  };

  const handleAllDates = () => {
    onDateSelect(null, null, true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={loading}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              {displayLabel}
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
        {/* Quick Filters */}
        <DropdownMenuLabel className="font-semibold">Quick Filters</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleDateRangeSelect('last_1_day')}>
          <span>Last 1 Day</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDateRangeSelect('last_5_days')}>
          <span>Last 5 Days</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDateRangeSelect('last_7_days')}>
          <span>Last 7 Days</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDateRangeSelect('last_30_days')}>
          <span>Last 30 Days</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAllDates}>
          <span>All Dates</span>
        </DropdownMenuItem>

        {/* Separator */}
        {availableDates.length > 0 && <DropdownMenuSeparator />}

        {/* Available Dates */}
        {availableDates.length > 0 && (
          <>
            <DropdownMenuLabel className="font-semibold">Specific Dates</DropdownMenuLabel>
            {availableDates.map((dateObj) => (
              <DropdownMenuItem
                key={`${dateObj.date}-${dateObj.run_at}`}
                onClick={() => handleDateSelect(dateObj.date)}
              >
                <div className="flex justify-between w-full">
                  {/* Use run_at as reliable source instead of date_str */}
                  <span>{formatDateFromRunAt(dateObj.run_at)}</span>
                  <span className="text-xs text-muted-foreground ml-4">
                    ({dateObj.tender_count})
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Empty State */}
        {!loading && availableDates.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No dates available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DateSelector;
