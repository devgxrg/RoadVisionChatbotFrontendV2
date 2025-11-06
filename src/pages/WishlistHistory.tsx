import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Heart, History, Trash2, MapPin, IndianRupee, Calendar, Eye, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { WishlistItem, HistoryItem } from '@/lib/types/wishlist';
import { fetchWishlist, removeFromWishlist, fetchHistory } from '@/lib/api/wishlist';

const WishlistHistory = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [wishlistRes, historyRes] = await Promise.all([fetchWishlist(), fetchHistory()]);
        setWishlistItems(wishlistRes.items);
        setHistoryItems(historyRes.items);
      } catch (error) {
        console.error("Failed to fetch wishlist or history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'analyzed':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'viewed':
        return <Badge variant="outline" className="bg-blue-50">Viewed</Badge>;
      case 'analyzed':
        return <Badge variant="outline" className="bg-yellow-50">Analyzed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error(`Failed to remove ${id} from wishlist:`, error);
    }
  };

  const handleViewTender = (id: string) => {
    navigate(`/tenderiq/view/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Wishlist & History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tenderiq')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wishlist & History</h1>
            <p className="text-sm text-muted-foreground">
              Manage your saved tenders and track your tender analysis activities
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wishlist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wishlist" className="gap-2">
            <Heart className="h-4 w-4" />
            Wishlist ({wishlistItems.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Activity History ({historyItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-4">
          {wishlistItems.length === 0 ? (
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
              {wishlistItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                            {item.authority}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                            <IndianRupee className="h-4 w-4 text-primary" />
                            <span className="font-medium">Value:</span>
                            <span className="text-green-600 font-semibold">
                              ₹{(item.value / 10000000).toFixed(2)} Cr
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">Location:</span>
                            <span className="text-muted-foreground">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-md">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Due:</span>
                            <span className="text-muted-foreground">
                              {new Date(item.dueDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-col">
                        <Button
                          size="sm"
                          onClick={() => handleViewTender(item.id)}
                          variant="default"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {historyItems.length === 0 ? (
            <Card className="p-12 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activity history yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 pt-1">
                        {getActionIcon(item.lastAction)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {item.title}
                          </h4>
                          {getActionBadge(item.lastAction)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(item.viewedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewTender(item.id)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WishlistHistory;
