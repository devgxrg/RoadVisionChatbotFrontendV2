import { WishlistReportData } from '@/lib/types/wishlist';
import { getCurrencyTextFromNumber } from '@/lib/utils/conversions';
import { format } from 'date-fns';
import { forwardRef } from 'react';
import { toTitleCase } from '@/lib/utils/text-formatting';

interface WishlistReportTemplateProps {
  reportData: WishlistReportData;
}

/**
 * Printable template for wishlist reports
 * Designed to be rendered in a print dialog or converted to PDF
 * Follows the same pattern as BidSynopsisUI for consistency
 */
const WishlistReportTemplate = forwardRef<HTMLDivElement, WishlistReportTemplateProps>(
  ({ reportData }, ref) => {
    const { metrics, tenders, generatedAt, totalCount } = reportData;

    const formattedDate = format(new Date(generatedAt), 'MMM dd, yyyy HH:mm');
    const totalTenderValue = getCurrencyTextFromNumber(metrics.totalTenderValue);
    const averageTenderValue = getCurrencyTextFromNumber(metrics.averageTenderValue);
    const totalEMD = getCurrencyTextFromNumber(metrics.totalEMD);
    const averageEMD = getCurrencyTextFromNumber(metrics.averageEMD);

    return (
      <div
        ref={ref}
        className="max-w-6xl mx-auto p-8 bg-white dark:bg-background space-y-8"
      >
        {/* ===== HEADER SECTION ===== */}
        <div className="border-b-2 border-foreground pb-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">WISHLIST REPORT</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {formattedDate}
            </p>
            <p className="text-xs text-muted-foreground">
              CEIGALL INDIA LIMITED - Tender Analysis System
            </p>
          </div>
        </div>

        {/* ===== EXECUTIVE SUMMARY SECTION ===== */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-center">EXECUTIVE SUMMARY</h2>

          {/* Summary Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Total Saved */}
            <div className="border border-foreground rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Saved
              </div>
              <div className="text-3xl font-bold text-foreground mt-2">
                {metrics.totalSaved}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Wishlist Items</div>
            </div>

            {/* Total Analyzed */}
            <div className="border border-foreground rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Analyzed
              </div>
              <div className="text-3xl font-bold text-foreground mt-2">
                {metrics.totalAnalyzed}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ({((metrics.totalAnalyzed / metrics.totalSaved) * 100).toFixed(1)}%)
              </div>
            </div>

            {/* Total Won */}
            <div className="border border-foreground rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Won
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {metrics.totalWon}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ({((metrics.totalWon / metrics.totalSaved) * 100).toFixed(1)}%)
              </div>
            </div>

            {/* Total Pending */}
            <div className="border border-foreground rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Pending
              </div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {metrics.totalPending}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ({((metrics.totalPending / metrics.totalSaved) * 100).toFixed(1)}%)
              </div>
            </div>

            {/* Total Rejected */}
            <div className="border border-foreground rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Rejected
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {metrics.totalRejected}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ({((metrics.totalRejected / metrics.totalSaved) * 100).toFixed(1)}%)
              </div>
            </div>

            {/* Total Incomplete */}
            <div className="border border-foreground rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Incomplete
              </div>
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {metrics.totalIncomplete}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ({((metrics.totalIncomplete / metrics.totalSaved) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border-2 border-foreground rounded-lg p-4 bg-slate-100 dark:bg-slate-800">
              <h3 className="text-sm font-semibold uppercase text-foreground mb-3">
                Tender Value Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-semibold text-foreground">{totalTenderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Value:</span>
                  <span className="font-semibold text-foreground">{averageTenderValue}</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-foreground rounded-lg p-4 bg-slate-100 dark:bg-slate-800">
              <h3 className="text-sm font-semibold uppercase text-foreground mb-3">
                EMD Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total EMD:</span>
                  <span className="font-semibold text-foreground">{totalEMD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average EMD:</span>
                  <span className="font-semibold text-foreground">{averageEMD}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PAGE BREAK ===== */}
        <div className="page-break-before" />

        {/* ===== DETAILED WISHLIST TABLE ===== */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-center">WISHLIST DETAILS</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-foreground text-sm">
              <thead>
                <tr className="bg-slate-400 dark:bg-slate-600">
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    S.No
                  </th>
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    Tender Title
                  </th>
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    Authority
                  </th>
                  <th className="border border-foreground px-3 py-2 text-right font-semibold text-foreground">
                    Value
                  </th>
                  <th className="border border-foreground px-3 py-2 text-right font-semibold text-foreground">
                    EMD
                  </th>
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    Bid Deadline
                  </th>
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    Published Date
                  </th>
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    Status
                  </th>
                  <th className="border border-foreground px-3 py-2 text-left font-semibold text-foreground">
                    Analysis
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((tender, index) => (
                  <tr key={tender.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="border border-foreground px-3 py-2 text-foreground font-semibold">
                      {index + 1}
                    </td>
                    <td className="border border-foreground px-3 py-2 text-foreground">
                      <div className="font-semibold">{toTitleCase(tender.title)}</div>
                      <div className="text-xs text-muted-foreground">TDR: {tender.tender_no || 'N/A'}</div>
                    </td>
                    <td className="border border-foreground px-3 py-2 text-foreground">
                      {toTitleCase(tender.authority)}
                    </td>
                    <td className="border border-foreground px-3 py-2 text-right font-semibold text-foreground">
                      {tender.formattedValue}
                    </td>
                    <td className="border border-foreground px-3 py-2 text-right font-semibold text-foreground">
                      {tender.formattedEMD}
                    </td>
                    <td className="border border-foreground px-3 py-2 text-foreground text-sm">
                      {tender.last_date_of_bid_submission || 'N/A'}
                    </td>
                    <td className="border border-foreground px-3 py-2 text-foreground text-sm">
                      {tender.publish_date || 'N/A'}
                    </td>
                    <td className="border border-foreground px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBgColor(
                          tender.results
                        )}`}
                      >
                        {tender.statusLabel}
                      </span>
                    </td>
                    <td className="border border-foreground px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getAnalysisBgColor(
                          tender.analysis_state
                        )}`}
                      >
                        {tender.analysisStateLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No wishlist items to display
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="border-t-2 border-foreground pt-4 mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            This is an automatically generated report from CEIGALL Tender Analysis System
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Generated on: {formattedDate}
          </p>
        </div>
      </div>
    );
  }
);

WishlistReportTemplate.displayName = 'WishlistReportTemplate';

export default WishlistReportTemplate;

/**
 * Get background color class for status badge
 */
function getStatusBgColor(status: string): string {
  const colorMap: Record<string, string> = {
    won: 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-200',
    rejected: 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200',
    incomplete: 'bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-200',
    pending: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200',
  };
  return colorMap[status] || 'bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-200';
}

/**
 * Get background color class for analysis state badge
 */
function getAnalysisBgColor(state: string | boolean): string {
  const analyzed = state === true || state === 'true';
  return analyzed
    ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200'
    : 'bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-200';
}
