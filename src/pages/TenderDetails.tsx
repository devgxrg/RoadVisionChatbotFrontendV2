import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Star, FileText, AlertCircle, MapPin, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTenderById, addToWishlist, isInWishlist } from '@/data/sampleTenders';
import { useToast } from '@/hooks/use-toast';

export default function TenderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTender = async () => {
      setLoading(true);
      try {
        // Try to fetch from backend API first
        const response = await fetch(`/api/tenderiq/tenders/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Transform API response if needed to match expected format
          console.log(data);
          setTender({
            ...data,
            documents: data.documents || [],
            category: data.category || 'Uncategorized',
            emd: data.emd || 0,
            bidSecurity: data.bidSecurity || 0,
            ePublishedDate: data.ePublishedDate || new Date().toISOString().split('T')[0],
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('API fetch failed, falling back to sample data');
      }

      // // Fallback to sample data for demo/development
      // const sampleTender = getTenderById(id || '');
      // if (sampleTender) {
      //   // Map sample tender format to expected format
      //   const mappedTender = {
      //     id: sampleTender.id,
      //     title: sampleTender.title,
      //     authority: sampleTender.authority,
      //     value: sampleTender.value,
      //     dueDate: sampleTender.dueDate,
      //     status: sampleTender.status,
      //     category: sampleTender.category,
      //     emd: sampleTender.emd,
      //     bidSecurity: sampleTender.bidSecurity,
      //     location: sampleTender.location,
      //     length: sampleTender.length,
      //     costPerKm: sampleTender.costPerKm,
      //     ePublishedDate: sampleTender.ePublishedDate,
      //     documents: sampleTender.documents,
      //     riskLevel: sampleTender.riskLevel,
      //   };
      //   setTender(mappedTender);
      // } else {
      //   setTender(null);
      // }
      setLoading(false);
    };

    fetchTender();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading tender details...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">Tender not found</p>
          <p className="text-muted-foreground text-sm">
            The tender you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => navigate('/tenderiq')} variant="outline">
            Back to TenderIQ
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToWishlist = () => {
    if (isInWishlist(tender.id)) {
      toast({ title: 'Already in wishlist' });
      return;
    }
    addToWishlist(tender.id);
    toast({ title: 'Added to wishlist', description: 'Tender saved successfully' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <span>/</span>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tenderiq')}>
            TenderIQ
          </Button>
          <span>/</span>
          <span className="text-foreground">Tender Details</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{tender.title}</h1>
              <Badge variant="outline" className={`${
                tender.status === 'live' ? 'border-success text-success' :
                tender.status === 'won' ? 'border-success text-success' :
                tender.status === 'lost' ? 'border-destructive text-destructive' :
                'border-warning text-warning'
              }`}>
                {tender.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{tender.authority}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddToWishlist}>
              <Star className={`h-4 w-4 mr-2 ${isInWishlist(tender.id) ? 'fill-warning text-warning' : ''}`} />
              {isInWishlist(tender.id) ? 'In Wishlist' : 'Add to Wishlist'}
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
                    <p className="text-sm font-medium">Tender ID</p>
                    <p className="text-sm text-muted-foreground">{tender.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tender Value</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{(tender.value / 10000000).toFixed(2)} Cr
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tender.dueDate).toLocaleDateString('en-IN', {
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
                    <p className="text-sm font-semibold">₹{(tender.emd / 100000).toFixed(2)} L</p>
                  </div>
                </div>

                {tender.length && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Length</p>
                      <p className="text-sm font-semibold">{tender.length}</p>
                    </div>
                    {tender.costPerKm && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cost/Km</p>
                        <p className="text-sm font-semibold">
                          ₹{(tender.costPerKm / 100000).toFixed(2)} L
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Published Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(tender.ePublishedDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 space-y-3">
              <h2 className="font-semibold text-lg mb-3">Quick Actions</h2>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/analyze/${tender.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Analyze Document
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/synopsis/${tender.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Draft Bid Synopsis
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/evaluate/${tender.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Evaluate Bid
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/compare')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Compare
              </Button>
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
                {tender.documents.map((doc) => (
                  <Card key={doc.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.name}</p>
                            {doc.isAIGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="uppercase">{doc.type}</span>
                            {doc.pages && <span>•</span>}
                            {doc.pages && <span>{doc.pages} pages</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {!doc.isAIGenerated && (
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90"
                            onClick={() => navigate(`/analyze/${tender.id}`)}
                          >
                            Analyze
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {tender.riskLevel && (
                <Card className="mt-6 p-4 bg-warning/5 border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Risk Assessment</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This tender has been identified as <span className="font-semibold capitalize">{tender.riskLevel}</span> risk.
                        Review the analysis report for details.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
