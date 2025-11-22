import { Download, Star, FileText, AlertCircle, MapPin, Calendar, DollarSign, Heart, Archive, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TenderDetailsType } from '@/lib/types/tenderiq';
import { FullTenderDetails } from '@/lib/types/tenderiq.types';

interface TenderDetailsUIProps {
  tender: FullTenderDetails;
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
  isWishlisted,
  onAddToWishlist,
  isFavorited,
  onToggleFavorite,
  isArchived,
  onToggleArchive,
  onNavigate,
}: TenderDetailsUIProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{tender.tender_name}</h1>
              <Badge variant="outline" className={`${
                tender.status === 'new' ? 'border-success text-success' :
                tender.status === 'won' ? 'border-success text-success' :
                tender.status === 'lost' ? 'border-destructive text-destructive' :
                'border-warning text-warning'
              }`}>
                {tender.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{tender.tendering_authority}</p>
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
                    <p className="text-sm text-muted-foreground">{tender.tender_no || tender.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tender Value</p>
                    <p className="text-lg font-bold text-primary">
                      {tender.value ? `₹${(parseInt(tender.tender_value) / 10000000).toFixed(2)} Cr` : "Ref Document"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tender.due_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{tender.location}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="secondary">{tender.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">EMD</p>
                    <p className="text-sm font-semibold">{tender.emd}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Published Date</p>
                    <p className="text-sm font-semibold">
                      {new Date(tender.publish_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tender Source</p>
                    <a className="text-sm font-semibold text-blue underline" href={tender.portal_source} target='_blank'>{tender.portal_source}</a>
                  </div>
                </div>

              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h2 className="font-semibold text-lg mb-3">Actions History</h2>
              <div className="space-y-3">
                {tender.history.map((historyItem) => (
                  <Card key={historyItem.id} className="flex flex-col p-2 gap-2">
                    <div className='flex gap-2 items-center'>
                      <p className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{historyItem.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(historyItem.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{historyItem.notes}</p>
                  </Card>
                ))}
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
                {tender.files.map((doc) => (
                  <Card key={doc.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.file_name}</p>
                            {/*{doc.isAIGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                AI Generated
                              </Badge>
                            )}*/}
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
                ))}
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

            <Card className="mt-6 p-6">
              <h2 className="font-semibold text-lg mb-3">Tender History</h2>
              <div className="space-y-3 flex flex-col gap-2">
                {tender.tender_history.map((historyItem) => (
                  <div key={historyItem.id} className="flex justify-between gap-4 border-b-2 p-2">
                    <div>
                      <div className='p-2 bg-warning rounded-full'>
                        <Calendar className='w-4 h-4 text-white' />
                      </div>
                    </div>
                    <div className='w-full'>
                      <div className='flex flex-row items-center gap-1'>
                        <span className='px-2 py-1 bg-muted rounded-full text-xs'>{historyItem.type}</span>
                        <span>{new Date(historyItem.update_date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div>{historyItem.note}</div>
                      <div>
                        {historyItem.date_change && (
                          <div className='flex text-xs items-center gap-2'><s className='text-muted-foreground'>{historyItem.date_change.from}</s> <ArrowRight className='w-4 h-4' /> <span>{historyItem.date_change.to}</span> </div>
                        )}
                        {historyItem.files_changed && (
                          <div className='flex flex-col gap-1'>
                            {historyItem.files_changed.map((doc) => (
                              <Card key={doc.id} className="p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{doc.file_name}</p>
                                        {/* {doc.isAIGenerated && (
                                          <Badge variant="secondary" className="text-xs">
                                            AI Generated
                                          </Badge>
                                        )} */}
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
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
