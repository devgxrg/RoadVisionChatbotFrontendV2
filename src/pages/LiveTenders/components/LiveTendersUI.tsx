import { Search, Calendar, Filter, Star, Eye, MessageSquare, Loader2, CurrencyIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Query, Report, Tender } from '@/lib/types/tenderiq.types';
import { useEffect, useState } from 'react';

interface LiveTendersUIProps {
  report: Report | undefined;
  onAddToWishlist: (tenderId: string, e: React.MouseEvent) => void;
  onViewTender: (tenderId: string) => void;
  onNavigateToWishlist: () => void;
  isInWishlist: (tenderId: string) => boolean;
}

export default function LiveTendersUI({
  report,
  onAddToWishlist,
  onViewTender,
  onNavigateToWishlist,
  isInWishlist,
}: LiveTendersUIProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQueries, setFilteredQueries] = useState<Query[]>(report ? report.queries : []);
  const [totalTenders, setTotalTenders] = useState(0);
  const [shownTenders, setShownTenders] = useState(0);
  const [minPrice, setMinPrice] = useState("");

  const filterReport = () => {
    if (!report) {
      return;
    }

    const filtered: Query[] = []

    report.queries.forEach((query) => {
      let tenders: Tender[] = []
      query.tenders.forEach((tender) => {
        if ((tender.tender_name.toLowerCase().includes(searchQuery.toLowerCase()) 
          || query.query_name.toLowerCase().includes(searchQuery.toLowerCase())
          || tender.company_name.toLowerCase().includes(searchQuery.toLowerCase())
          || tender.state.toLowerCase().includes(searchQuery.toLowerCase()))
          && parseFloat(tender.tender_value) >= (parseFloat(minPrice) || 0) * 10000000) {
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

  useEffect(() => {
    setFilteredQueries(report ? report.queries : [])
    if (!report) return
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Tenders</h1>
            <p className="text-muted-foreground mt-1">Daily scraped opportunities from government portals</p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onNavigateToWishlist}
          >
            <Star className="h-4 w-4" />
            View Wishlist
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, authority, category, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Input
                type='number'
                placeholder='Minimum price (in crores)'
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {shownTenders} of {totalTenders} tenders
          </p>
        </div>

        {report == undefined && 
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading daily tenders...</p>
          </Card>
        }

        {/* Tender Grid */}
        {report != undefined && 
          <div className="">
            {filteredQueries.map((query) => (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {query.tenders.map((tender) => (
                  <Card 
                    key={tender.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="space-y-4 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors flex-1">
                          {tender.tender_name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => onAddToWishlist(tender.id, e)}
                        >
                          <Star className={`h-4 w-4 ${isInWishlist(tender.id) ? 'fill-warning text-warning' : ''}`} />
                        </Button>
                      </div>

                      {/* Authority & Category */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-1">{tender.company_name}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {query.query_name}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              tender.state === 'live' ? 'border-success text-success' :
                              tender.state === 'won' ? 'border-success text-success' :
                              tender.state === 'lost' ? 'border-destructive text-destructive' :
                              'border-warning text-warning'
                            }`}
                          >
                            {tender.state}
                          </Badge>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="space-y-1.5 py-3 border-y">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tender Value</span>
                          <span className="font-semibold text-primary">
                            {tender.value}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">EMD</span>
                          <span className="font-medium">{tender.emd}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Due Date</span>
                          <span className="font-medium">
                            {new Date(tender.due_date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
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
                            onViewTender(tender.id);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open chat for this specific tender
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Ask AI
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

