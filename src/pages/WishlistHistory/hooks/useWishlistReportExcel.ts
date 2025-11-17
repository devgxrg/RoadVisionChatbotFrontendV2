import { useCallback } from 'react';
import { WishlistReportData } from '@/lib/types/wishlist';
import { generateWishlistExcel } from '@/lib/utils/excelExport';

/**
 * Hook to handle Excel export for wishlist reports
 * Provides a simple function to trigger Excel file generation and download
 */
export function useWishlistReportExcel() {
  const handleExportToExcel = useCallback((reportData: WishlistReportData) => {
    try {
      generateWishlistExcel(reportData, 'Wishlist_Report');
    } catch (error) {
      console.error('Failed to export report to Excel:', error);
      throw error;
    }
  }, []);

  return {
    handleExportToExcel,
  };
}
