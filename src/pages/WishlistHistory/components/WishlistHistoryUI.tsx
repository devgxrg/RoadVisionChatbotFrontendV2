import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryData, HistoryPageResponse, MetadataCardProps, WishlistHistoryUIProps } from "@/lib/types/wishlist";
import { getCurrencyTextFromNumber } from "@/lib/utils/conversions";
import { ArrowLeft, Check, Circle, Download, Eye, Filter, Heart, IndianRupee, SquareCheck, Trash2, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import WishlistReportPreview from "./WishlistReportPreview";
import { useWishlistReportData } from "../hooks/useWishlistReportData";
import { useWishlistReportExcel } from "../hooks/useWishlistReportExcel";
import { BackButton } from "@/components/common/BackButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateWishlistTenderResults } from "@/lib/api/wishlist";

export function MetadataCard({ title, value, LucideIcon, description }: MetadataCardProps) {
  return (
    <div className="p-4 border rounded-lg flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center w-full">
        <span className="text-sm font-medium">{title}</span>
        <LucideIcon className="h-6 w-6 text-primary flex-shrink-0" />
      </div>
      <h1 className="text-2xl font-bold break-words">{value}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// Helper to capitalize analysis state labels
const capitalizeAnalysisState = (state: string): string => {
  const stateMap: Record<string, string> = {
    'completed': 'Completed',
    'pending': 'Pending',
    'parsing': 'Parsing',
    'processing': 'Processing',
    'analyzing': 'Analyzing',
    'failed': 'Failed',
  };
  return stateMap[state] || state.charAt(0).toUpperCase() + state.slice(1);
};

export function TenderCard({ data, handleViewTender, handleRemoveFromWishlist, onUpdateResults }: { data: HistoryData, handleViewTender: (id: string) => void, handleRemoveFromWishlist: (id: string) => Promise<void>, onUpdateResults?: (id: string, results: 'won' | 'rejected' | 'incomplete' | 'pending') => Promise<void> }) {
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);

  const handleResultsChange = async (newResults: string) => {
    if (onUpdateResults && newResults !== data.results) {
      setIsUpdatingResults(true);
      try {
        await onUpdateResults(data.id, newResults as 'won' | 'rejected' | 'incomplete' | 'pending');
      } finally {
        setIsUpdatingResults(false);
      }
    }
  };

  const getResultsColor = (results: string) => {
    switch(results) {
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-center gap-4">
          <h3 className="flex-1">{data.title}</h3>
          <div className="flex gap-2 items-center">
            <span className="bg-muted rounded-xl px-2 py-1 text-xs font-bold">{capitalizeAnalysisState(data.analysis_state)}</span>
            <Select value={data.results} onValueChange={handleResultsChange} disabled={isUpdatingResults}>
              <SelectTrigger className={`w-32 text-xs ${getResultsColor(data.results)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{data.authority}</div>
        <hr className="my-2" />
        <div className="grid grid-cols-4 grid-rows-2 gap-1">
          <div className="text-xs text-muted-foreground">Tender Value</div>
          <div className="text-xs text-muted-foreground">EMD</div>
          <div className="text-xs text-muted-foreground">Due Date</div>
          <div className="text-xs text-muted-foreground">Category</div>
          <div className="font-bold text-blue" >{getCurrencyTextFromNumber(data.value)}</div>
          <div className="font-bold" >{getCurrencyTextFromNumber(data.emd)}</div>
          <div className="font-bold" >{data.due_date}</div>
          <div>
            <span className="text-xs bg-muted rounded-xl px-2 py-1">
              {data.category}
            </span>
          </div>
        </div>
        <hr className="my-2" />
        <div className="w-full flex justify-between items-center">
          <div>Progress</div>
          <div className="flex gap-4 items-center">
            {/* <div className="flex gap-1 items-center">
              <span className={`text-xs ${data.analysis_state == "completed" ? 'text-primary' : 'text-muted-foreground'}`}>Analysis</span>
              {data.analysis_state == "completed" ? <Check className="h-3 w-3 text-primary" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="flex gap-1 items-center">
              <span className={`text-xs ${data.synopsis_state ? 'text-primary' : 'text-muted-foreground'}`}>Synopsis</span>
              {data.synopsis_state ? <Check className="h-3 w-3 text-primary" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="flex gap-1 items-center">
              <span className={`text-xs ${data.evaluated_state ? 'text-primary' : 'text-muted-foreground'}`}>Evaluation</span>
              {data.evaluated_state ? <Check className="h-3 w-3 text-primary" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            </div> */}
            <span className="text-xs">{data.progress} %</span>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-xl">
          <div className="bg-blue h-2 rounded-xl" style={{ width: `${data.progress}%` }}></div>
        </div>
        <div className="w-full flex justify-between items-center mt-4">
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => handleViewTender(data.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View Tender
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Button variant="destructive" size="sm" onClick={() => handleRemoveFromWishlist(data.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove from wishlist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WishlistHistoryUI({ navigate, data, handleViewTender, handleRemoveFromWishlist }: WishlistHistoryUIProps) {
  const [metadata, setMetadata] = useState<MetadataCardProps[]>([])
  const [filteredTenders, setFilteredTenders] = useState<HistoryData[]>([]);
  const [uniqueTenders, setUniqueTenders] = useState<HistoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Process data for report
  const reportData = useWishlistReportData(data);
  const { handleExportToExcel } = useWishlistReportExcel();

  const handleUpdateResults = async (tenderId: string, results: 'won' | 'rejected' | 'incomplete' | 'pending') => {
    try {
      await updateWishlistTenderResults(tenderId, results);
      // Update local state to reflect the change
      setUniqueTenders(prev => 
        prev.map(tender => 
          tender.id === tenderId ? { ...tender, results } : tender
        )
      );
    } catch (error) {
      console.error('Failed to update tender results:', error);
      alert('Failed to update tender results. Please try again.');
    }
  };

  // Deduplicate tenders on data change
  useEffect(() => {
    // Deduplicate tenders using multiple strategies to catch all duplicates
    const uniqueTendersMap = new Map<string, HistoryData>();
    const seenIds = new Set<string>();
    
    data.tenders.forEach(tender => {
      // Strategy 1: Use tender ID (most reliable)
      if (tender.id && !seenIds.has(tender.id)) {
        seenIds.add(tender.id);
        uniqueTendersMap.set(tender.id, tender);
        return;
      }
      
      // Strategy 2: Use tender_id_str from full_scraped_details
      const tenderIdStr = tender.full_scraped_details?.tender_id_str;
      if (tenderIdStr && !uniqueTendersMap.has(`ref_${tenderIdStr}`)) {
        uniqueTendersMap.set(`ref_${tenderIdStr}`, tender);
        return;
      }
      
      // Strategy 3: Use combination of title + authority (fallback for edge cases)
      const titleAuthKey = `${tender.title}_${tender.authority}`.toLowerCase();
      if (!uniqueTendersMap.has(`title_${titleAuthKey}`)) {
        uniqueTendersMap.set(`title_${titleAuthKey}`, tender);
      }
    });
    
    const uniqueList = Array.from(uniqueTendersMap.values());
    setUniqueTenders(uniqueList);
  }, [data.tenders]);

  // Filter unique tenders based on search query
  useEffect(() => {
    const filtered = uniqueTenders.filter((tender) => 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTenders(filtered);
  }, [searchQuery, uniqueTenders]);

  useEffect(() => {
    // Use uniqueTenders for metadata calculations to avoid counting duplicates
    const tendersToUse = uniqueTenders.length > 0 ? uniqueTenders : data.tenders;
    
    const totalSavedMetadata: MetadataCardProps = {
      title: 'Total Saved',
      value: tendersToUse.length.toString(),
      LucideIcon: Heart,
      description: 'Active Opportunities',
    }
    const tendersAnalyzedMetadata: MetadataCardProps = {
      title: 'Tenders Analyzed',
      value: tendersToUse.filter(tender => tender.analysis_state === 'completed').length.toString(),
      LucideIcon: SquareCheck,
      description: 'AI-powered insights',
    }
    const tendersWonMetadata: MetadataCardProps = {
      title: 'Tenders Won',
      value: tendersToUse.filter(tender => tender.results === 'won').length.toString(),
      LucideIcon: TrendingUp,
      description: 'Successful bids',
    }
    const tendersWonValueMetadata: MetadataCardProps = {
      title: 'Tenders Won Value',
      value: getCurrencyTextFromNumber(tendersToUse.filter(tender => tender.results === 'won').reduce((total, tender) => total + tender.value, 0)),
      LucideIcon: IndianRupee,
      description: 'Total value won',
    }
    const pendingTendersMetadata: MetadataCardProps = {
      title: 'Pending Tenders',
      value: tendersToUse.filter(tender => tender.results === 'pending').length.toString(),
      LucideIcon: Clock,
      description: 'Awaiting results',
    }

    setMetadata([totalSavedMetadata, tendersAnalyzedMetadata, tendersWonMetadata, tendersWonValueMetadata, pendingTendersMetadata])
  }, [uniqueTenders, data.tenders])

  const handleOpenReportPreview = () => {
    setIsReportPreviewOpen(true);
  };

  const handleCloseReportPreview = () => {
    setIsReportPreviewOpen(false);
  };

  const handleExportReport = () => {
    setIsExporting(true);
    try {
      handleExportToExcel(reportData);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      handleCloseReportPreview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/tenderiq" />
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold leading-tight">Wishlist</h1>
              <p className="text-xs text-muted-foreground">
                Manage your saved tenders
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={handleOpenReportPreview}
          disabled={data.tenders.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Preview Modal */}
      <WishlistReportPreview
        isOpen={isReportPreviewOpen}
        onClose={handleCloseReportPreview}
        reportData={reportData}
        onExportToPDF={handleExportReport}
        isExporting={isExporting}
      />

      {/* Metadata area */}
      <div className="grid grid-cols-5 gap-4">
        {metadata.map((item, index) => (
          <MetadataCard key={index} {...item} />
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-4 p-2 border rounded-lg">
        <input
          type="text"
          placeholder="Search by tender title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />
        {/* <Button variant="default" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button> */}
      </div>

      {/* Wishlist Content */}
      <div className="space-y-4">
        {uniqueTenders.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tenders in your wishlist yet.</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/tenderiq')}
            >
              Browse Tenders
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTenders.map((item) => (
              <TenderCard
                key={item.id}
                data={item}
                handleViewTender={handleViewTender}
                handleRemoveFromWishlist={handleRemoveFromWishlist}
                onUpdateResults={handleUpdateResults}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
