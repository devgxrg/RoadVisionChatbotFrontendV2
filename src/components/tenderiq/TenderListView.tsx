import { Tender } from '@/lib/types/tenderiq.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Archive, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toTitleCase } from '@/lib/utils/text-formatting';

interface TenderListViewProps {
  tenders: Tender[];
  onWishlist?: (tenderId: string) => void;
  onFavorite?: (tenderId: string) => void;
  onArchive?: (tenderId: string) => void;
  isLoading?: boolean;
}

export function TenderListView({
  tenders,
  onWishlist,
  onFavorite,
  onArchive,
  isLoading
}: TenderListViewProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading tenders...</p>
        </div>
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">No tenders found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-secondary text-foreground';
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('road')) return 'bg-blue-100 text-blue-700';
    if (categoryLower.includes('building')) return 'bg-amber-100 text-amber-700';
    if (categoryLower.includes('bridge')) return 'bg-purple-100 text-purple-700';
    if (categoryLower.includes('water')) return 'bg-cyan-100 text-cyan-700';
    return 'bg-secondary text-foreground';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-secondary text-foreground';
    const statusLower = status.toLowerCase();
    if (statusLower === 'new') return 'bg-green-100 text-green-700';
    if (statusLower === 'reviewed') return 'bg-blue-100 text-blue-700';
    if (statusLower === 'bid_preparation') return 'bg-orange-100 text-orange-700';
    if (statusLower === 'submitted') return 'bg-purple-100 text-purple-700';
    return 'bg-secondary text-foreground';
  };

  const formatCost = (cost?: number) => {
    if (!cost) return 'N/A';
    if (cost >= 1) return `₹${cost.toFixed(2)} Cr`;
    return `₹${(cost * 10).toFixed(2)} L`;
  };

  return (
    <div className="space-y-2">
      {tenders.map((tender) => (
        <div
          key={tender.id}
          className="border border-border rounded-lg hover:border-blue-300 hover:shadow-md transition-all p-4 bg-card text-card-foreground"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Title and Details */}
            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/tenderiq/view/${tender.id}`)}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 hover:text-blue-600">
                    {toTitleCase(tender.tender_name || tender.tender_url || 'Tender')}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    TDR: {tender.tdr || tender.tender_id_str}
                  </p>
                </div>
              </div>

              {/* Badges and Status */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Removed status badge since basic Tender doesn't have it */}
                {tender.is_wishlisted && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                    <Star className="w-3 h-3 mr-1 fill-yellow-700" />
                    Wishlisted
                  </Badge>
                )}
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                {tender.city && (
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{toTitleCase(tender.city)}</p>
                  </div>
                )}
                {tender.value && (
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium text-foreground">{tender.value}</p>
                  </div>
                )}
                {tender.publish_date && (
                  <div>
                    <p className="text-muted-foreground">Publish Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(tender.publish_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {tender.last_date_of_bid_submission && (
                  <div>
                    <p className="text-muted-foreground">Bid Deadline</p>
                    <p className="font-medium text-foreground">
                      {new Date(tender.last_date_of_bid_submission).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-col gap-2 ml-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onWishlist?.(tender.id);
                }}
                className="w-10 h-10 p-0"
                title={tender.is_wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Star
                  className={cn(
                    "w-4 h-4",
                    tender.is_wishlisted && "fill-yellow-400 text-yellow-400"
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
