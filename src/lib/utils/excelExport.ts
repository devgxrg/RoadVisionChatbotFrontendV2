import * as XLSX from 'xlsx';
import { WishlistReportData } from '../types/wishlist';
import { format } from 'date-fns';

/**
 * Generate and download an Excel file with wishlist report data
 * Creates a professional multi-sheet Excel workbook with summary and detailed data
 */
export function generateWishlistExcel(reportData: WishlistReportData, filename: string = 'Wishlist_Report'): void {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // === Sheet 1: Summary ===
    const summarySheet = createSummarySheet(reportData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // === Sheet 2: Detailed Wishlist ===
    const detailSheet = createDetailSheet(reportData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Wishlist Details');

    // === Generate filename with timestamp ===
    const timestamp = format(new Date(reportData.generatedAt), 'yyyy-MM-dd_HHmmss');
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // === Write and download the file ===
    XLSX.writeFile(workbook, finalFilename);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Failed to generate Excel file');
  }
}

/**
 * Create the Summary sheet with metrics and financial overview
 */
function createSummarySheet(reportData: WishlistReportData): XLSX.WorkSheet {
  const { metrics, generatedAt } = reportData;

  // Prepare summary data for the sheet
  const summaryData: any[] = [
    ['WISHLIST REPORT - EXECUTIVE SUMMARY'],
    [''],
    [`Generated: ${format(new Date(generatedAt), 'MMM dd, yyyy HH:mm')}`],
    [''],
    ['STATUS OVERVIEW'],
    ['Metric', 'Count', 'Percentage'],
    ['Total Saved', metrics.totalSaved, '100%'],
    ['Total Analyzed', metrics.totalAnalyzed, `${((metrics.totalAnalyzed / metrics.totalSaved) * 100).toFixed(1)}%`],
    ['Total Won', metrics.totalWon, `${((metrics.totalWon / metrics.totalSaved) * 100).toFixed(1)}%`],
    ['Total Pending', metrics.totalPending, `${((metrics.totalPending / metrics.totalSaved) * 100).toFixed(1)}%`],
    ['Total Rejected', metrics.totalRejected, `${((metrics.totalRejected / metrics.totalSaved) * 100).toFixed(1)}%`],
    ['Total Incomplete', metrics.totalIncomplete, `${((metrics.totalIncomplete / metrics.totalSaved) * 100).toFixed(1)}%`],
    [''],
    ['FINANCIAL SUMMARY'],
    ['Metric', 'Amount (INR)'],
    ['Total Tender Value', metrics.totalTenderValue],
    ['Average Tender Value', metrics.averageTenderValue],
    ['Total EMD', metrics.totalEMD],
    ['Average EMD', metrics.averageEMD],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Column A
    { wch: 15 }, // Column B
    { wch: 15 }, // Column C
  ];

  // Apply styling to headers (bold)
  const headerRows = [0, 4, 13]; // Row indices for headers
  headerRows.forEach((rowIdx) => {
    const cell = worksheet[XLSX.utils.encode_cell({ r: rowIdx, c: 0 })];
    if (cell) {
      cell.s = { font: { bold: true, sz: 12 } };
    }
  });

  return worksheet;
}

/**
 * Create the Detailed Wishlist sheet with all tender information
 */
function createDetailSheet(reportData: WishlistReportData): XLSX.WorkSheet {
  const { tenders } = reportData;

  // Prepare headers
  const headers = [
    'S.No',
    'Tender Title',
    'Tender ID',
    'Authority',
    'Tender Value (INR)',
    'EMD (INR)',
    'Due Date',
    'Category',
    'Status',
    'Analysis State',
  ];

  // Prepare data rows
  const dataRows = tenders.map((tender, index) => [
    index + 1,
    tender.title,
    tender.id,
    tender.authority,
    tender.value,
    tender.emd,
    tender.due_date,
    tender.category,
    tender.statusLabel,
    tender.analysisStateLabel,
  ]);

  // Combine headers with data
  const worksheetData = [headers, ...dataRows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 6 },   // S.No
    { wch: 35 },  // Tender Title
    { wch: 12 },  // Tender ID
    { wch: 25 },  // Authority
    { wch: 18 },  // Tender Value
    { wch: 15 },  // EMD
    { wch: 14 },  // Due Date
    { wch: 15 },  // Category
    { wch: 12 },  // Status
    { wch: 15 },  // Analysis State
  ];

  // Make header row bold
  for (let c = 0; c < headers.length; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
      };
    }
  }

  // Format currency columns (columns D and E, indices 4 and 5)
  for (let r = 1; r < worksheetData.length; r++) {
    const tenderValueCell = XLSX.utils.encode_cell({ r, c: 4 });
    const emdCell = XLSX.utils.encode_cell({ r, c: 5 });

    if (worksheet[tenderValueCell]) {
      worksheet[tenderValueCell].z = '#,##0.00';
    }
    if (worksheet[emdCell]) {
      worksheet[emdCell].z = '#,##0.00';
    }
  }

  return worksheet;
}
