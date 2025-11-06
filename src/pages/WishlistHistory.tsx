import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Trash2, MapPin, IndianRupee, Calendar, Loader2 } from 'lucide-react';
import { Tender } from '@/lib/types/tenderiq';
import { performTenderAction, fetchWishlistedTenders } from '@/lib/api/tenderiq';
import { useToast } from '@/hooks/use-toast';

const WishlistHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery<Tender[], Error>({
    queryKey: ['wishlist'],
    queryFn: fetchWishlistedTenders,
  });

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      await performTenderAction(id, { action: 'toggle_wishlist' });
      toast({
        title: 'Removed from wishlist',
        description: 'Tender removed successfully.',
      });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove from wishlist.',
        variant: 'destructive',
      });
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
            <h1 className="text-2xl font-bold">Wishlist</h1>
            <p className="text-sm text-muted-foreground">
              Manage your saved tenders
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="space-y-4">
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
                            {item.value ? `₹${(item.value / 10000000).toFixed(2)} Cr` : "Ref Document"}
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
      </div>
    </div>
  );
};

export default WishlistHistory;
