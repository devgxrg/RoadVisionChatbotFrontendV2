import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { WishlistReportPreviewProps } from '@/lib/types/wishlist';
import WishlistReportTemplate from './WishlistReportTemplate';
import { useRef } from 'react';

/**
 * Modal dialog for previewing and exporting wishlist reports
 * Exports data to Excel format for easy manipulation and analysis
 */
export default function WishlistReportPreview({
  isOpen,
  onClose,
  reportData,
  onExportToPDF,
  isExporting = false,
}: WishlistReportPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    // Call the parent's export handler (now exports to Excel)
    onExportToPDF();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-background border-b px-6 py-4 z-10">
          <DialogTitle className="text-2xl font-bold">
            Wishlist Report Preview
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Preview the report before exporting to Excel
          </p>
        </DialogHeader>

        {/* Report Content */}
        <div className="p-0 overflow-auto">
          <WishlistReportTemplate ref={contentRef} reportData={reportData} />
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="sticky bottom-0 bg-background border-t px-6 py-4 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            variant="default"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
