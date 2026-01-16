import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw, ExternalLink, MessageSquare, MapPin, Calendar, IndianRupee, Loader2, Heart, History, Star, Archive } from "lucide-react";
import { Tender } from "@/lib/types/tenderiq";
import { filterTenders, groupTendersByCategory, getAvailableCategories, getAvailableLocations } from "@/lib/utils/tender-filters";
import { useLiveFilters } from "@/hooks/useLiveFilters";
import { useToast } from "@/hooks/use-toast";
import { fetchWishlistedTenders, fetchFavoriteTenders, fetchArchivedTenders } from "@/lib/api/tenderiq";
import { useTenderActions } from "@/hooks/useTenderActions";
import { toTitleCase } from "@/lib/utils/text-formatting";

interface LiveTendersProps {
  onBack?: () => void;
}

const LiveTenders = ({ onBack }: LiveTendersProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleToggleAction: handleTenderAction } = useTenderActions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedDateRange, setSelectedDateRange] = useState<string>();
  const [includeAllDates, setIncludeAllDates] = useState(false);

  // Fetch tenders using custom hook
  // Note: Convert minValue/maxValue from crores to rupees for API
  const { tenders, isLoading, refetch } = useLiveFilters({
    selectedDate,
    selectedDateRange,
    includeAllDates,
    selectedCategory: selectedCategory !== "all" ? selectedCategory : undefined,
    selectedLocation: selectedLocation !== "all" ? selectedLocation : undefined,
    minValue: minValue ? parseFloat(minValue) * 10000000 : null, // Convert crores to rupees
    maxValue: maxValue ? parseFloat(maxValue) * 10000000 : null, // Convert crores to rupees
  });

  const { data: wishlist } = useQuery<Tender[], Error>({
    queryKey: ['wishlist'],
    queryFn: fetchWishlistedTenders,
  });
  const { data: favorites } = useQuery<Tender[], Error>({
    queryKey: ['favorites'],
    queryFn: fetchFavoriteTenders,
  });
  const { data: archived } = useQuery<Tender[], Error>({
    queryKey: ['archived'],
    queryFn: fetchArchivedTenders,
  });

  const isWishlisted = (tenderId: string) => wishlist?.some(t => t.id === tenderId) ?? false;
  const isFavorited = (tenderId: string) => favorites?.some(t => t.id === tenderId) ?? false;
  const isArchived = (tenderId: string) => archived?.some(t => t.id === tenderId) ?? false;

  const handleToggleAction = async (tenderId: string, action: 'toggle_wishlist' | 'toggle_favorite' | 'toggle_archive') => {
    try {
      // Check current state BEFORE performing the action
      const wasWishlisted = isWishlisted(tenderId);
      const wasFavorited = isFavorited(tenderId);
      const wasArchived = isArchived(tenderId);

      // Determine current state based on action
      let currentState = false;
      if (action === 'toggle_wishlist') {
        currentState = wasWishlisted;
      } else if (action === 'toggle_favorite') {
        currentState = wasFavorited;
      } else if (action === 'toggle_archive') {
        currentState = wasArchived;
      }

      await handleTenderAction(tenderId, action, currentState);
    } catch (error) {
      // Error handling is done in the hook, just log here
      console.error('Error in handleToggleAction:', error);
    }
  };

  const handleDateSelect = (date: string | null, dateRange: string | null, includeAll: boolean) => {
    setSelectedDate(date || undefined);
    setSelectedDateRange(dateRange || undefined);
    setIncludeAllDates(includeAll);
  };

  // Extract unique categories and locations
  const categories = useMemo(() => {
    const cats = getAvailableCategories(tenders);
    return ["all", ...cats];
  }, [tenders]);

  const locations = useMemo(() => {
    const locs = getAvailableLocations(tenders);
    return ["all", ...locs];
  }, [tenders]);

  /**
   * Format date string for display
   * Handles multiple date formats: DD-MM-YYYY, DD-Mon-YYYY (08-Nov-2025), ISO, and raw strings
   */
  const formatDateForDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr || typeof dateStr !== 'string') return 'N/A';
    const trimmed = dateStr.trim();
    if (!trimmed || trimmed === 'N/A') return 'N/A';
    
    try {
      let date: Date | null = null;
      
      // Try ISO format first (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
      if (trimmed.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
        }
      }
      
      // Try DD-MM-YYYY format
      const ddmmyyyyParts = trimmed.split('-');
      if (ddmmyyyyParts.length === 3) {
        const day = ddmmyyyyParts[0].trim();
        const month = ddmmyyyyParts[1].trim();
        const year = ddmmyyyyParts[2].trim();
        
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        
        // Check if it's all numbers (DD-MM-YYYY format)
        if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
          if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
            date = new Date(yearNum, monthNum - 1, dayNum);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              });
            }
          }
        }
        
        // Try DD-Mon-YYYY format (e.g., 08-Nov-2025)
        const monthAbbr = month.substring(0, 3);
        const monthMap: { [key: string]: number } = {
          'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };
        const mappedMonth = monthMap[monthAbbr.toLowerCase()];
        
        if (mappedMonth !== undefined && dayNum >= 1 && dayNum <= 31 && yearNum >= 1900) {
          date = new Date(yearNum, mappedMonth, dayNum);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            });
          }
        }
      }
      
      // Try generic Date parsing as last resort
      date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
      }
    } catch (e) {
      console.warn(`Failed to format date: ${dateStr}`, e);
    }
    
    // If all parsing fails, show the raw value for debugging
    return trimmed.length > 0 ? trimmed : 'N/A';
  };


  // Filter tenders based on UI state
  // Note: minValue and maxValue inputs are in crores, need to convert to rupees for filtering
  const filteredTenders = useMemo(() => {
    const minValueRupees = minValue ? parseFloat(minValue) * 10000000 : null; // Convert crores to rupees
    const maxValueRupees = maxValue ? parseFloat(maxValue) * 10000000 : null; // Convert crores to rupees

    // First, filter out corrigendum tenders from listings (they should only appear in tender history)
    const nonCorrigendumTenders = tenders.filter(tender => {
      if (!tender) return true;
      
      // Check all relevant fields for corrigendum/amendment keywords
      const fieldsToCheck = [
        tender.tender_name || '',
        tender.summary || '',
        tender.tender_brief || '',
        tender.tender_details || '',
        tender.description || '',
        tender.tdr || '',
      ];
      
      const fullText = fieldsToCheck.join(' ').toLowerCase();
      
      // Filter out if contains corrigendum or amendment keywords
      return !fullText.includes('corrigendum') && 
             !fullText.includes('amendment');
    });

    return filterTenders(nonCorrigendumTenders, {
      searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      minValue: minValueRupees,
      maxValue: maxValueRupees,
    });
  }, [tenders, searchTerm, selectedCategory, selectedLocation, minValue, maxValue]);

  // Group by category
  const groupedTenders = useMemo(() => {
    return groupTendersByCategory(filteredTenders);
  }, [filteredTenders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ExternalLink className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Live Tenders</h1>
            <p className="text-sm text-muted-foreground">Browse daily scraped live tenders with smart filtering</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/tenderiq/wishlist-history")}
          className="gap-2"
        >
          <Heart className="h-4 w-4" />
          <History className="h-4 w-4" />
          Wishlist & History
        </Button>
      </div>

      {/* Search & Filter Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Search & Filter Tenders</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>Search by title or tender number • Filter by category, location, value, and date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Search Tenders</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, tender ID, organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Filter Row 1: Category, Location, Min/Max Value */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-3 block">Filters</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>
                        {loc === "all" ? "All Locations" : toTitleCase(loc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Min Value (Crore)</label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  step="10"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Max Value (Crore)</label>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  step="10"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Date Selector */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-3 block">Date Filter</label>
            <div className="space-y-4">
              {/* Quick date range buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <Button
                  variant={includeAllDates ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateSelect(null, null, true)}
                  className="text-xs"
                >
                  All Dates
                </Button>
                <Button
                  variant={selectedDateRange === 'last_2_days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateSelect(null, 'last_2_days', false)}
                  className="text-xs"
                >
                  Last 2 Days
                </Button>
                <Button
                  variant={selectedDateRange === 'last_5_days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateSelect(null, 'last_5_days', false)}
                  className="text-xs"
                >
                  Last 5 Days
                </Button>
                <Button
                  variant={selectedDateRange === 'last_7_days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateSelect(null, 'last_7_days', false)}
                  className="text-xs"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={selectedDateRange === 'last_30_days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateSelect(null, 'last_30_days', false)}
                  className="text-xs"
                >
                  Last 30 Days
                </Button>
              </div>

              {/* Specific date picker */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Or Select Specific Date (DD-MM-YYYY)</label>
                  <Input
                    type="date"
                    placeholder="Select a specific date"
                    value={selectedDate ? selectedDate.split('-').reverse().join('-') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        // Convert YYYY-MM-DD to DD-MM-YYYY
                        const [year, month, day] = e.target.value.split('-');
                        const formattedDate = `${day}-${month}-${year}`;
                        handleDateSelect(formattedDate, null, false);
                      } else {
                        handleDateSelect(null, null, true);
                      }
                    }}
                  />
                </div>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateSelect(null, null, true)}
                    className="mt-6"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary & Active Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
          <div className="text-sm">
            <p className="text-muted-foreground">Results</p>
            <p className="font-semibold text-lg text-foreground">{filteredTenders.length} of {tenders.length} tenders</p>
          </div>
          
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                {selectedCategory} ✕
              </div>
            )}
            {selectedLocation !== "all" && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                {toTitleCase(selectedLocation)} ✕
              </div>
            )}
            {(minValue || maxValue) && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                ₹{minValue || '0'}-{maxValue || '∞'} Cr ✕
              </div>
            )}
            {selectedDate && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                Date: {selectedDate} ✕
              </div>
            )}
            {selectedDateRange && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                {selectedDateRange.replace(/_/g, ' ')} ✕
              </div>
            )}
            {includeAllDates && !selectedDate && !selectedDateRange && (
              <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                All Dates ✕
              </div>
            )}
            {searchTerm && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Search: "{searchTerm}" ✕
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading daily tenders...</p>
        </Card>
      )}

      {/* Grouped Tender Lists */}
      {!isLoading && (
        <div className="space-y-6">
          {Object.entries(groupedTenders).map(([category, categoryTenders]) => (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="bg-primary rounded-lg px-6 py-4">
                <h2 className="text-xl font-bold text-primary-foreground">{category}</h2>
                <p className="text-sm text-primary-foreground/80">{categoryTenders.length} tenders available</p>
              </div>

              {/* Tender Cards */}
              <div className="space-y-4">
                {categoryTenders.map((tender, index) => (
                  <Card key={tender.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Index Badge */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-lg border border-primary/20">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-foreground">{tender.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4" />
                                <span>{toTitleCase(tender.location)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded inline-block">{toTitleCase(tender.authority)}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleAction(tender.id, 'toggle_wishlist')}>
                                <Star className={`h-4 w-4 ${isWishlisted(tender.id) ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleAction(tender.id, 'toggle_favorite')}>
                                <Heart className={`h-4 w-4 ${isFavorited(tender.id) ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleAction(tender.id, 'toggle_archive')}>
                                <Archive className={`h-4 w-4 ${isArchived(tender.id) ? 'fill-current' : ''}`} />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                              <IndianRupee className="h-4 w-4 text-primary" />
                              <span className="font-medium">Tender Value:</span>
                              <span className="text-green-600 font-semibold">{tender.value}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              <span className="font-medium">Due Date:</span>
                              <span className={`${formatDateForDisplay(tender.due_date) === 'N/A' ? 'text-gray-400' : ''}`}>
                                {formatDateForDisplay(tender.due_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Published:</span>
                              <span className={`${formatDateForDisplay(tender.publish_date) === 'N/A' ? 'text-gray-400' : ''}`}>
                                {formatDateForDisplay(tender.publish_date)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="hover-scale"
                              onClick={() => navigate(`/tenderiq/view/${tender.id}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Tender
                            </Button>
                            <Button size="sm" variant="outline" className="hover-scale">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat with CeigallAI
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredTenders.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tenders found matching your filters.</p>
        </Card>
      )}
    </div>
  );
};

export default LiveTenders;
