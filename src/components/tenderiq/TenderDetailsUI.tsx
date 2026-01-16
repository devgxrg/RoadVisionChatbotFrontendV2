import { Download, Star, FileText, AlertCircle, MapPin, Calendar, IndianRupee, Heart, Archive, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TenderDetailsType } from '@/lib/types/tenderiq';
import { FullTenderDetails, TenderHistoryItem } from '@/lib/types/tenderiq.types';
import { BackButton } from '@/components/common/BackButton';
import { TenderChangeHistory } from './TenderChangeHistory';
import { toTitleCase } from '@/lib/utils/text-formatting';

// Reusable document card component to eliminate repetition
const DocumentCard = ({ doc }: { doc: any }) => (
  <Card className="p-4 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{doc.file_name}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="uppercase">{doc.file_type}</span>
            {doc.file_size && <span>•</span>}
            {doc.file_size && <span>{doc.file_size}</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url, '_blank')} disabled={!doc.file_url}>
          View
        </Button>
      </div>
    </div>
  </Card>
);

// Helper function to safely parse dates in various formats (ISO and DD-MM-YYYY)
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'N/A') return 'Not Specified';

  try {
    let date: Date;

    // Try ISO format first (YYYY-MM-DD)
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Try DD-MM-YYYY format (Indian format)
      const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Try standard Date parsing (ISO or other formats)
        date = new Date(dateStr);
      }
    }

    if (isNaN(date.getTime())) return 'Not Specified';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return 'Not Specified';
  }
};

// Helper function to group and deduplicate history items by action and date
const deduplicateHistory = (history: any[]) => {
  if (!history || history.length === 0) return [];

  // Group by action + date combination
  const grouped: { [key: string]: any } = {};

  history.forEach((item) => {
    const dateStr = new Date(item.timestamp).toLocaleDateString('en-IN');
    const key = `${item.action}|${dateStr}`;

    // Keep the first occurrence, skip duplicates
    if (!grouped[key]) {
      grouped[key] = { ...item, count: 1 };
    } else {
      grouped[key].count += 1;
    }
  });

  return Object.values(grouped);
};

interface TenderDetailsUIProps {
  tender: FullTenderDetails;
  tenderHistory?: TenderHistoryItem[];
  isLoadingHistory?: boolean;
  isWishlisted: boolean;
  onAddToWishlist: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  isArchived: boolean;
  onToggleArchive: () => void;
  onNavigate: (path: string) => void;
}

export default function TenderDetailsUI({
  tender,
  tenderHistory = [],
  isLoadingHistory = false,
  isWishlisted,
  onAddToWishlist,
  isFavorited,
  onToggleFavorite,
  isArchived,
  onToggleArchive,
  onNavigate,
}: TenderDetailsUIProps) {
  // Debug: Check what we're getting
  console.log('=== TENDER DETAILS UI RENDER ===');
  console.log('tender_history array:', tender.tender_history);
  console.log('tender_history length:', tender.tender_history?.length ?? 'undefined');
  if (tender.tender_history && tender.tender_history.length > 0) {
    console.log('First tender history item:', tender.tender_history[0]);
  }
  console.log('===== END DEBUG =====');

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Back Button */}
        <BackButton to="/tenderiq" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/')}>
            Dashboard
          </Button>
          <span>/</span>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/tenderiq')}>
            TenderIQ
          </Button>
          <span>/</span>
          <span className="text-foreground">Tender Details</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{tender.tender_name}</h1>
            {tender.tendering_authority && tender.tendering_authority.toLowerCase() !== tender.tender_name.toLowerCase() && (
              <p className="text-muted-foreground">{tender.tendering_authority}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onAddToWishlist}>
              <Star className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-yellow-400 text-yellow-500' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => onNavigate(`/tenderiq/analyze/${tender.id}`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Analyze Tender
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => onNavigate(`/synopsis/${tender.id}`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Draft Bid Synopsis
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Metadata & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tender Metadata */}
            <Card className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Tender Information</h2>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tender No.</p>
                    <p className="text-sm text-muted-foreground">{tender.tender_no || tender.tdr || tender.tender_id_str || tender.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IndianRupee className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tender Value</p>
                    <p className="text-lg font-bold text-primary">
                      {tender.tender_value ? (() => {
                        const value = typeof tender.tender_value === 'string'
                          ? parseInt(tender.tender_value, 10)
                          : tender.tender_value;
                        if (isNaN(value)) return "Ref Document";
                        if (value >= 10000000) {
                          return `₹${(value / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
                        } else if (value >= 100000) {
                          return `₹${(value / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
                        } else {
                          return `₹${value.toLocaleString('en-IN')}`;
                        }
                      })() : "Ref Document"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tender.due_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{toTitleCase(tender.city || tender.location) || 'Not Specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="secondary">{tender.category || 'Uncategorized'}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">EMD</p>
                    <p className="text-sm font-semibold">
                      {tender.emd ? (() => {
                        const emdValue = typeof tender.emd === 'string'
                          ? parseInt(tender.emd, 10)
                          : tender.emd;
                        if (isNaN(emdValue) || emdValue === 0) return 'N/A';
                        if (emdValue >= 10000000) {
                          return `₹${(emdValue / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
                        } else if (emdValue >= 100000) {
                          return `₹${(emdValue / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
                        } else {
                          return `₹${emdValue.toLocaleString('en-IN')}`;
                        }
                      })() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Published Date</p>
                    <p className="text-sm font-semibold">
                      {formatDate(tender.publish_date)}
                    </p>
                  </div>
                  {tender.information_source && tender.information_source.trim() ? (() => {
                    try {
                      const url = new URL(tender.information_source);
                      return (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tender Source</p>
                          <a
                            className="text-sm font-semibold text-blue-600 hover:underline truncate"
                            href={url.href}
                            target='_blank'
                            rel="noopener noreferrer"
                          >
                            {url.hostname}
                          </a>
                        </div>
                      );
                    } catch (e) {
                      // If it's not a valid URL, just display the text
                      return (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tender Source</p>
                          <p className="text-sm font-semibold">{tender.information_source}</p>
                        </div>
                      );
                    }
                  })() : null}
                </div>

              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h2 className="font-semibold text-lg mb-3">Actions History</h2>
              <div className="space-y-3">
                {tender.history && tender.history.length > 0 ? (
                  deduplicateHistory(tender.history).map((historyItem, idx) => (
                    <Card key={`${historyItem.action}-${idx}`} className="flex flex-col p-2 gap-2">
                      <div className='flex gap-2 items-center justify-between'>
                        <div className='flex gap-2 items-center'>
                          <p className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full capitalize">{historyItem.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(historyItem.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {historyItem.count > 1 && (
                          <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            ×{historyItem.count}
                          </p>
                        )}
                      </div>
                      {historyItem.notes && (
                        <p className="text-sm font-medium text-muted-foreground">{historyItem.notes}</p>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No action history yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Documents */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-xl">Documents</h2>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>

              <div className="space-y-3">
                {tender.files && tender.files.length > 0 ? (
                  tender.files.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No documents available</p>
                  </div>
                )}
              </div>

              {tender.risk_level && (
                <Card className="mt-6 p-4 bg-warning/5 border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Risk Assessment</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This tender has been identified as <span className="font-semibold capitalize">{tender.risk_level}</span> risk.
                        Review the analysis report for details.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </Card>

            {/* Render the new robust change history component */}
            <div className="mt-6">
              <TenderChangeHistory
                history={tenderHistory}
                isLoading={isLoadingHistory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
