import { Search, Calendar as CalendarIcon, Filter, Star, Eye, MessageSquare, Loader2, CurrencyIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Query, Report, ScrapeDate, Tender } from '@/lib/types/tenderiq.types';
import { useEffect, useState, useRef } from 'react';
import { getCurrencyNumberFromText, getCurrencyTextFromNumber } from '@/lib/utils/conversions';
import { toTitleCase } from '@/lib/utils/text-formatting';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { SelectTrigger } from '@radix-ui/react-select';
import { BackButton } from '@/components/common/BackButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, isValid } from 'date-fns';
import { WishlistPreferences } from '@/components/tenderiq/WishlistPreferences';
import { ViewToggle } from '@/components/tenderiq/ViewToggle';
import { TenderListView } from '@/components/tenderiq/TenderListView';

// Helper to format dates in consistent format (e.g., "1 Dec 2025")
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'N/A') return 'Not Specified';

  try {
    const date = parseISO(dateStr);
    if (isValid(date)) {
      return format(date, 'd MMM yyyy');
    }
    return 'Not Specified';
  } catch {
    return 'Not Specified';
  }
};

interface LiveTendersUIProps {
  report: Report | undefined;
  status: "idle" | "streaming" | "complete" | "error";
  onAddToWishlist: (tenderId: string, e: React.MouseEvent) => void;
  onViewTender: (tenderId: string, tdr?: string) => void;
  onNavigateToWishlist: () => void;
  onAskAI: (tenderId: string) => void;
  onChangeDate: (date: string) => void;
  dates: ScrapeDate[];
  currentDateRange?: string;
  currentRunId?: string;
}

// Helper to get display text for current filter
const getFilterDisplayText = (dateRange?: string, runId?: string, dates?: ScrapeDate[]): string => {
  if (dateRange) {
    switch (dateRange) {
      case "last_2_days": return "Last 2 Days";
      case "last_5_days": return "Last 5 Days";
      case "last_7_days": return "Last 7 Days";
      case "last_30_days": return "Last 30 Days";
      default: return "Select Date";
    }
  }
  if (runId && dates) {
    const match = dates.find(d => d.id === runId);
    if (match) {
      try {
        const date = new Date(match.date);
        return format(date, "dd MMM yyyy");
      } catch {
        return match.date;
      }
    }
  }
  return "Select Date";
};

export default function LiveTendersUI({
  report,
  status,
  onAddToWishlist,
  onViewTender,
  onNavigateToWishlist,
  onAskAI,
  onChangeDate,
  dates,
  currentDateRange,
  currentRunId
}: LiveTendersUIProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQueries, setFilteredQueries] = useState<Query[]>(report ? report.queries : []);
  const [totalTenders, setTotalTenders] = useState(0);
  const [shownTenders, setShownTenders] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('tender-view-preference') as 'grid' | 'list') || 'grid';
  });

  const filterReport = () => {
    if (!report || report == null) {
      return;
    }

    const filtered: Query[] = []

    report.queries.forEach((query) => {
      let tenders: Tender[] = []
      query.tenders.forEach((tender) => {
        const lowerSearchQuery = searchQuery.toLowerCase()
        const matchesSearch = (
          (tender.tender_name?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (query.query_name?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.company_name?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.state?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.city?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.tendering_authority?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.tender_id?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.tdr?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.tender_no?.toLowerCase() || '').includes(lowerSearchQuery) ||
          (tender.tender_id_str?.toLowerCase() || '').includes(lowerSearchQuery)
        )
        
        if (matchesSearch && getCurrencyNumberFromText(tender.tender_value) >= (parseFloat(minPrice) || 0) * 10000000) {
          tenders.push(tender)
        }
      })
      if (tenders.length > 0) {
        filtered.push({ ...query, tenders })
      }
    })

    setFilteredQueries(filtered)
  }

  useEffect(() => {
    filterReport()
  }, [searchQuery, report, minPrice])

  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewType(newView);
    localStorage.setItem('tender-view-preference', newView);
  };

  useEffect(() => {
    if (!report || report == null) return
    let count = 0;
    report.queries.forEach((query) => {
      count += query.tenders.length
    })
    setTotalTenders(count)
  }, [report])

  useEffect(() => {
    let count = 0;
    filteredQueries.forEach((query) => {
      count += query.tenders.length
    })
    setShownTenders(count)
  }, [filteredQueries])

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Back Button */}
        <BackButton to="/" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Tenders</h1>
            <p className="text-muted-foreground mt-1">Daily scraped opportunities from government portals</p>
          </div>
          <div className="flex gap-2">
            <WishlistPreferences />
            <Button
              variant="outline"
              className="gap-2"
              onClick={onNavigateToWishlist}
            >
              <Star className="h-4 w-4" />
              View Wishlist
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 border-2">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px_180px] gap-3 items-center">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by title, authority, tender no."
                  className="pl-10 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Minimum Price */}
            <div className="w-full">
              <Input
                type='number'
                placeholder='Minimum Price (in crores)'
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Date Filter Dropdown */}
            <div className="w-full">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {getFilterDisplayText(currentDateRange, currentRunId, dates)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end" sideOffset={4}>
                  <div className="px-1 pt-1 pb-1.5 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-9 px-2"
                      onClick={() => {
                        setCalendarOpen(false);
                        onChangeDate("last_2_days");
                      }}
                    >
                      Last 2 Days
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-9 px-2"
                      onClick={() => {
                        setCalendarOpen(false);
                        onChangeDate("last_5_days");
                      }}
                    >
                      Last 5 Days
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-9 px-2"
                      onClick={() => {
                        setCalendarOpen(false);
                        onChangeDate("last_7_days");
                      }}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-9 px-2"
                      onClick={() => {
                        setCalendarOpen(false);
                        onChangeDate("last_30_days");
                      }}
                    >
                      Last 30 Days
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{shownTenders}</span> of <span className="font-semibold text-foreground">{totalTenders}</span> tenders
            </p>
            {status === "streaming" && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-md">
                <div className="relative">
                  <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                  <div className="absolute inset-0 h-3.5 w-3.5 bg-emerald-400/30 rounded-full animate-ping" />
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Syncing...</span>
              </div>
            )}
          </div>
          <ViewToggle
            currentView={viewType}
            onViewChange={handleViewChange}
          />
        </div>

        {report == undefined &&
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading daily tenders...</p>
          </Card>
        }

        {/* Tender Grid or List */}
        {report != undefined &&
          viewType === 'grid' ? (
          <div className="">
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredQueries.map((query) => (
                query.tenders.map((tender, index) => (
                  <Card
                    key={tender.id}
                    className="p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="space-y-4 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 
                          className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors flex-1 cursor-pointer"
                          onClick={() => onViewTender(tender.id, tender.tdr)}
                        >
                          {toTitleCase(tender.tender_name)}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 cursor-pointer"
                          onClick={(e) => onAddToWishlist(tender.id, e)}
                        >
                          <Star className={`h-4 w-4 ${tender.is_wishlisted ? 'fill-warning text-warning' : ''}`} />
                        </Button>
                      </div>

                      {/* TDR */}
                      <p className="text-xs text-muted-foreground">
                        TDR: {tender.tdr || tender.tender_id_str || 'N/A'}
                      </p>

                      {/* Authority & Location */}
                      <div className="space-y-2">
                        {tender.company_name && tender.company_name.toLowerCase() !== tender.tender_name.toLowerCase() && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{tender.company_name}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {query.query_name}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${tender.state === 'live' ? 'border-success text-success' :
                              tender.state === 'won' ? 'border-success text-success' :
                                tender.state === 'lost' ? 'border-destructive text-destructive' :
                                  'border-warning text-warning'
                              }`}
                          >
                            {toTitleCase(tender.city)}
                          </Badge>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="space-y-1.5 py-3 border-y">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tender Value</span>
                          <span className="font-semibold text-primary">
                            {tender.tender_value ? (() => {
                              // Parse tender value - it comes as number or string
                              let value = 0;
                              if (typeof tender.tender_value === 'string') {
                                const match = tender.tender_value.match(/[\d.]+/);
                                if (match) {
                                  value = parseFloat(match[0]);
                                }
                              } else {
                                value = tender.tender_value;
                              }
                              if (isNaN(value) || value === 0) return tender.value || 'Ref Document';
                              if (value >= 10000000) {
                                return `₹${(value / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
                              } else if (value >= 100000) {
                                return `₹${(value / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
                              } else {
                                return `₹${value.toLocaleString('en-IN')}`;
                              }
                            })() : (tender.value || 'Ref Document')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">EMD</span>
                          <span className="font-medium">
                            {tender.emd ? (() => {
                              // Parse EMD - it comes in format "INR 10703000.0 /-" or "Refer document"
                              let emdValue = 0;
                              if (typeof tender.emd === 'string') {
                                // Extract number from string like "INR 10703000.0 /-"
                                const match = tender.emd.match(/[\d.]+/);
                                if (match) {
                                  emdValue = parseFloat(match[0]);
                                }
                              } else {
                                emdValue = tender.emd;
                              }

                              if (isNaN(emdValue) || emdValue === 0) return 'Refer Document';
                              if (emdValue >= 10000000) {
                                return `₹${(emdValue / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
                              } else if (emdValue >= 100000) {
                                return `₹${(emdValue / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
                              } else {
                                return `₹${emdValue.toLocaleString('en-IN')}`;
                              }
                            })() : 'Refer Document'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Publish Date</span>
                          <span className="font-medium">
                            {formatDate(tender.publish_date)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bid Deadline</span>
                          <span className="font-medium">
                            {formatDate(tender.last_date_of_bid_submission)}
                          </span>
                        </div>
                      </div>

                      {/* Tags 
                      {tender.tags && (
                        <div className="flex flex-wrap gap-1.5">
                          {tender.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      */}

                      {/* Actions */}
                      <div className="flex gap-2 w-full grow items-end">
                        <Button
                          size="sm"
                          className="gap-2 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewTender(tender.id, tender.tdr);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskAI(tender.id);
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Ask AI
                        </Button> */}
                      </div>
                    </div>
                  </Card>
                ))
              ))}
            </div>
          </div>
          ) : (
          <TenderListView
            tenders={filteredQueries.flatMap(q => q.tenders)}
            onWishlist={(tenderId) => {
              const event = new MouseEvent('click', { bubbles: true });
              onAddToWishlist(tenderId, event as any);
            }}
          />
        )}
      </div>
    </div>
  );
}

