import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { performTenderAction } from '@/lib/api/tenderiq';
import { checkAnalysisExists } from '@/lib/api/analyze';
import { getUserPreferences } from '@/lib/api/auth';
import { TenderActionRequest } from '@/lib/types/tenderiq.types';

/**
 * Unified hook for handling tender actions (wishlist, favorite, archive)
 * Used across TenderIQ and TenderDetails pages
 */
export function useTenderActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggleWishlist = async (tenderId: string, currentState: boolean) => {
    try {
      // Optimistic update - update UI immediately
      queryClient.setQueryData(['wishlist'], (oldData: any[]) => {
        if (!oldData) return oldData;
        if (currentState) {
          // Remove from wishlist
          return oldData.filter(item => item.id !== tenderId);
        } else {
          // Add to wishlist - add a placeholder that will be corrected when we refetch
          return [...oldData, { id: tenderId }];
        }
      });
      
      // For adding to wishlist, check if analysis already exists and user preference
      let descriptionText = 'Tender added to wishlist.';
      if (!currentState) {
        try {
          const userPrefs = await getUserPreferences();
          const analysisExists = await checkAnalysisExists(tenderId);
          
          if (userPrefs.auto_analyze_on_wishlist) {
            descriptionText = analysisExists 
              ? 'Tender added to wishlist. Analysis for the tender already exists.'
              : 'Tender added to wishlist. Analysis for the tender has also begun.';
          } else {
            descriptionText = 'Tender added to wishlist.';
          }
        } catch (error) {
          // If check fails, use the default message
          descriptionText = 'Tender added to wishlist.';
        }
      }
      
      toast({
        title: currentState ? 'Removed from wishlist' : 'Added to wishlist',
        description: currentState
          ? 'Tender removed from wishlist.'
          : descriptionText,
      });
      
      // Sync with backend in the background
      await performTenderAction(tenderId, { action: 'toggle_wishlist' });
      
      // Refetch to ensure we have the correct data
      await queryClient.refetchQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update wishlist';
      console.error('Error toggling wishlist:', error);
      
      // If tender is not found in database, remove it from the UI
      if (errorMessage.includes('not found') || errorMessage.includes('removed from your wishlist')) {
        queryClient.setQueryData(['wishlist'], (oldData: any[]) => {
          if (!oldData) return oldData;
          return oldData.filter(item => item.id !== tenderId);
        });
        
        toast({
          title: 'Tender Removed',
          description: 'This tender is no longer available. It has been removed from your wishlist.',
          variant: 'destructive',
        });
        return; // Don't throw error, just silently remove it
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      // Refetch to revert optimistic update on error
      await queryClient.refetchQueries({ queryKey: ['wishlist'] });
      throw error;
    }
  };

  const handleToggleFavorite = async (tenderId: string, currentState: boolean) => {
    try {
      // Optimistic update - update UI immediately
      queryClient.setQueryData(['favorites'], (oldData: any[]) => {
        if (!oldData) return oldData;
        if (currentState) {
          // Remove from favorites
          return oldData.filter(item => item.id !== tenderId);
        } else {
          // Add to favorites
          return [...oldData, { id: tenderId }];
        }
      });
      
      toast({
        title: currentState ? 'Removed from favorites' : 'Added to favorites',
        description: 'Tender favorites updated successfully',
      });
      
      // Sync with backend in the background
      await performTenderAction(tenderId, { action: 'toggle_favorite' });
      
      // Refetch to ensure we have the correct data
      await queryClient.refetchQueries({ queryKey: ['favorites'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update favorites';
      console.error('Error toggling favorite:', error);
      
      // If tender is not found in database, remove it from the UI
      if (errorMessage.includes('not found') || errorMessage.includes('no longer available')) {
        queryClient.setQueryData(['favorites'], (oldData: any[]) => {
          if (!oldData) return oldData;
          return oldData.filter(item => item.id !== tenderId);
        });
        
        toast({
          title: 'Tender Removed',
          description: 'This tender is no longer available. It has been removed from your favorites.',
          variant: 'destructive',
        });
        return; // Don't throw error, just silently remove it
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      // Refetch to revert optimistic update on error
      await queryClient.refetchQueries({ queryKey: ['favorites'] });
      throw error;
    }
  };

  const handleToggleArchive = async (tenderId: string, currentState: boolean) => {
    try {
      // Optimistic update - update UI immediately
      queryClient.setQueryData(['archived'], (oldData: any[]) => {
        if (!oldData) return oldData;
        if (currentState) {
          // Remove from archive
          return oldData.filter(item => item.id !== tenderId);
        } else {
          // Add to archive
          return [...oldData, { id: tenderId }];
        }
      });
      
      toast({
        title: currentState ? 'Removed from archive' : 'Tender archived',
        description: 'Tender archive updated successfully',
      });
      
      // Sync with backend in the background
      await performTenderAction(tenderId, { action: 'toggle_archive' });
      
      // Refetch to ensure we have the correct data
      await queryClient.refetchQueries({ queryKey: ['archived'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update archive';
      console.error('Error toggling archive:', error);
      
      // If tender is not found in database, remove it from the UI
      if (errorMessage.includes('not found') || errorMessage.includes('no longer available')) {
        queryClient.setQueryData(['archived'], (oldData: any[]) => {
          if (!oldData) return oldData;
          return oldData.filter(item => item.id !== tenderId);
        });
        
        toast({
          title: 'Tender Removed',
          description: 'This tender is no longer available. It has been removed from your archive.',
          variant: 'destructive',
        });
        return; // Don't throw error, just silently remove it
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      // Refetch to revert optimistic update on error
      await queryClient.refetchQueries({ queryKey: ['archived'] });
      throw error;
    }
  };

  const handleToggleAction = async (
    tenderId: string,
    action: 'toggle_wishlist' | 'toggle_favorite' | 'toggle_archive',
    currentState: boolean
  ) => {
    switch (action) {
      case 'toggle_wishlist':
        return handleToggleWishlist(tenderId, currentState);
      case 'toggle_favorite':
        return handleToggleFavorite(tenderId, currentState);
      case 'toggle_archive':
        return handleToggleArchive(tenderId, currentState);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  return {
    handleToggleWishlist,
    handleToggleFavorite,
    handleToggleArchive,
    handleToggleAction,
  };
}


