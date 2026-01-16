import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { fetchFullTenderDetails, fetchTenderHistory } from '@/lib/api/tenderiq.api';
import { TenderDetailsType } from '@/lib/types/tenderiq';
import TenderDetailsUI from '@/components/tenderiq/TenderDetailsUI';
import { Button } from '@/components/ui/button';
import {
  fetchWishlistedTenders,
  fetchFavoriteTenders,
  fetchArchivedTenders,
} from '@/lib/api/tenderiq';
import { Tender, FullTenderDetails, TenderHistoryItem } from '@/lib/types/tenderiq.types';
import { useTenderActions } from '@/hooks/useTenderActions';

export default function TenderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tdr = searchParams.get('tdr');
  const { handleToggleWishlist, handleToggleFavorite, handleToggleArchive } = useTenderActions();

  const { data: tender, isLoading, isError, refetch: refetchTenderDetails } = useQuery<FullTenderDetails, Error>({
    queryKey: ['tenderDetails', id, tdr],
    queryFn: () => fetchFullTenderDetails(id!, tdr || undefined),
    enabled: !!id,
    staleTime: 0,  // Always treat as stale to ensure fresh data
    gcTime: 0,     // Don't cache in background
    refetchOnMount: true,  // Always refetch when component mounts
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

  // Fetch tender history/changes from dedicated corrigendum endpoint
  // Use TDR if present, otherwise UUID
  const historyKey = tdr ? ['tenderHistory', tdr] : ['tenderHistory', id];
  const {
    data: tenderHistory = [],
    isLoading: isLoadingHistory,
  } = useQuery<TenderHistoryItem[], Error>({
    queryKey: historyKey,
    queryFn: () => fetchTenderHistory(tdr || id!),
    enabled: !!(id || tdr),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });

  // Use is_wishlisted field from the tender object itself (from backend)
  // This is the authoritative source of truth for the tender's state
  const isWishlisted = tender?.is_wishlisted ?? false;
  const isFavorited = tender?.is_favorite ?? false;
  const isArchived = tender?.is_archived ?? false;

  const handleAddToWishlist = async () => {
    if (!tender) return;
    // Update with backend, then refetch tender details to get updated flag
    try {
      await handleToggleWishlist(tender.id, isWishlisted);
      // Refetch tender details to update the is_wishlisted flag
      await refetchTenderDetails();
    } catch (error) {
      // Error is already handled by the hook with toast
    }
  };

  const handleToggleFavoriteAction = async () => {
    if (!tender) return;
    try {
      await handleToggleFavorite(tender.id, isFavorited);
      // Refetch tender details to update the is_favorite flag
      await refetchTenderDetails();
    } catch (error) {
      // Error is already handled by the hook with toast
    }
  };

  const handleToggleArchiveAction = async () => {
    if (!tender) return;
    try {
      await handleToggleArchive(tender.id, isArchived);
      // Refetch tender details to update the is_archived flag
      await refetchTenderDetails();
    } catch (error) {
      // Error is already handled by the hook with toast
    }
  };
  
  const handleNavigate = (path: string) => {
    // If navigating to analyze page, pass the current tender details URL as return path
    if (path.includes('/analyze/')) {
      navigate(path, { state: { returnPath: `/tenderiq/view/${id}` } });
    } else {
      navigate(path);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading tender details...</p>
        </div>
      </div>
    );
  }

  if (isError || !tender) {
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

  return (
    <TenderDetailsUI
      tender={tender}
      tenderHistory={tenderHistory || []}
      isLoadingHistory={isLoadingHistory}
      isWishlisted={isWishlisted}
      onAddToWishlist={handleAddToWishlist}
      isFavorited={isFavorited}
      onToggleFavorite={handleToggleFavoriteAction}
      isArchived={isArchived}
      onToggleArchive={handleToggleArchiveAction}
      onNavigate={handleNavigate}
    />
  );
}
