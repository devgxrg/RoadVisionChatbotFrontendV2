import * as XLSX from 'xlsx';
import { WishlistReportData } from '../types/wishlist';
import { format } from 'date-fns';

/**
 * Generate and download an Excel file matching the client's TenderList.xlsx template
 * Creates a single "Bidding" sheet with 21 columns exactly as specified by the client
 */
export function generateWishlistExcel(reportData: WishlistReportData, filename: string = 'Wishlist_Report'): void {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create the "Bidding" sheet with client template structure
    const biddingSheet = createBiddingSheet(reportData);
    XLSX.utils.book_append_sheet(workbook, biddingSheet, 'Bidding');

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
 * Create the "Bidding" sheet matching client's TenderList.xlsx template
 * 21 columns (A-U) with exact formatting and data mapping
 */
function createBiddingSheet(reportData: WishlistReportData): XLSX.WorkSheet {
  const { tenders } = reportData;

  // Define column headers exactly as in client template
  const headers = [
    'S. No',                           // A
    'Tender Id',                       // B
    'Name of the Work',                // C
    'Employer',                        // D
    'State',                           // E
    'Mode',                            // F
    'Estimated Project Cost',          // G
    'e-Published Date',                // H
    'Tender Identification\nDate',     // I (with newline as in template)
    'Last Date',                       // J
    'BID Security in Cr.',             // K
    'Length',                          // L
    'Per Km Cost',                     // M
    'Required Span Length',            // N
    'Amount of Road Work',             // O
    'Amount of Structure Work',        // P
    'Remarks',                         // Q
    'Current Status',                  // R
    '',                                // S (empty)
    '',                                // T (empty)
    '',                                // U (empty)
  ];

  // Prepare data rows with data mapping
  const dataRows = tenders.map((tender) => {
    const scraped = tender.full_scraped_details;

    // Extract numeric values for calculations
    // Convert values from raw numbers to Crores (divide by 10000000)
    const estimatedCostInCrores = tender.value ? tender.value / 10000000 : null;
    const emdInCrores = tender.emd ? tender.emd / 10000000 : null;
    const length = scraped ? parseFloat(String(scraped.total_length || 0)) : 0;

    // Build row array (will add formulas later)
    return {
      // A: S. No - Will be set as formula
      sNo: null as any, // Placeholder, will be replaced with formula
      // B: Tender Id
      tenderId: scraped?.tender_id_detail || '',
      // C: Name of the Work
      nameOfWork: tender.title || '',
      // D: Employer
      employer: tender.authority || scraped?.company_name || '',
      // E: State
      state: scraped?.state || '',
      // F: Mode (Bidding Type)
      mode: scraped?.bidding_type || '',
      // G: Estimated Project Cost (in Crores)
      estimatedCost: estimatedCostInCrores,
      // H: e-Published Date
      ePublishedDate: scraped?.publish_date || '',
      // I: Tender Identification Date
      tenderIdDate: scraped?.publish_date || '',
      // J: Last Date
      lastDate: tender.due_date || '',
      // K: BID Security in Cr.
      bidSecurity: emdInCrores,
      // L: Length
      length: length || null,
      // M: Per Km Cost - Formula: =G/L (will add formula if we have both values)
      perKmCost: null as any, // Will be set as formula
      // N: Required Span Length
      requiredSpanLength: null,
      // O: Amount of Road Work - Formula: =G*49.63%
      roadWork: null as any, // Will be set as formula
      // P: Amount of Structure Work - Formula: =G*50.37%
      structureWork: null as any, // Will be set as formula
      // Q: Remarks
      remarks: scraped?.summary || '',
      // R: Current Status
      currentStatus: tender.results || '',
      // S-U: Empty
      empty1: '',
      empty2: '',
      empty3: '',
    };
  });

  // Convert data objects to array format for XLSX
  const worksheetData: any[][] = [headers];

  dataRows.forEach((row) => {
    worksheetData.push([
      row.sNo,               // A - Will replace with formula
      row.tenderId,          // B
      row.nameOfWork,        // C
      row.employer,          // D
      row.state,             // E
      row.mode,              // F
      row.estimatedCost,     // G
      row.ePublishedDate,    // H
      row.tenderIdDate,      // I
      row.lastDate,          // J
      row.bidSecurity,       // K
      row.length,            // L
      row.perKmCost,         // M - Will replace with formula
      row.requiredSpanLength,// N
      row.roadWork,          // O - Will replace with formula
      row.structureWork,     // P - Will replace with formula
      row.remarks,           // Q
      row.currentStatus,     // R
      row.empty1,            // S
      row.empty2,            // T
      row.empty3,            // U
    ]);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // === Set exact column widths from client template ===
  worksheet['!cols'] = [
    { wch: 5.33 },    // A: S. No
    { wch: 23.66 },   // B: Tender Id
    { wch: 41.55 },   // C: Name of the Work
    { wch: 30.55 },   // D: Employer
    { wch: 17.44 },   // E: State
    { wch: 11.66 },   // F: Mode
    { wch: 9.33 },    // G: Estimated Project Cost
    { wch: 15.33 },   // H: e-Published Date
    { wch: 18.0 },    // I: Tender Identification Date
    { wch: 13.78 },   // J: Last Date
    { wch: 12.89 },   // K: BID Security in Cr.
    { wch: 9.89 },    // L: Length
    { wch: 9.44 },    // M: Per Km Cost
    { wch: 14.0 },    // N: Required Span Length
    { wch: 13.0 },    // O: Amount of Road Work
    { wch: 15.33 },   // P: Amount of Structure Work
    { wch: 56.11 },   // Q: Remarks
    { wch: 40.33 },   // R: Current Status
    { wch: 28.0 },    // S: Empty
    { wch: 185.11 },  // T: Empty
    { wch: 141.66 },  // U: Empty
  ];

  // === Format header row ===
  formatHeaderRow(worksheet, headers.length);

  // === Add formulas and number formatting ===
  addFormulasAndFormatting(worksheet, worksheetData);

  return worksheet;
}

/**
 * Format the header row: Times New Roman 11pt, Bold, Centered, Wrapped
 */
function formatHeaderRow(worksheet: XLSX.WorkSheet, columnCount: number): void {
  for (let c = 0; c < columnCount; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { name: 'Times New Roman', sz: 11, bold: true },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        },
      };
    }
  }
}

/**
 * Add formulas and number formatting to data cells
 */
function addFormulasAndFormatting(worksheet: XLSX.WorkSheet, worksheetData: any[][]): void {
  // Process each data row (skip header at index 0)
  for (let r = 1; r < worksheetData.length; r++) {
    const currentRow = r + 1; // XLSX uses 1-based indexing

    // === Column A: S. No - Auto-increment formula ===
    const cellA = XLSX.utils.encode_cell({ r, c: 0 });
    if (r === 1) {
      // First data row: set value to 1
      worksheet[cellA] = { v: 1, t: 'n' };
    } else {
      // Subsequent rows: use formula =+A(previous)+1
      const prevRow = currentRow - 1;
      worksheet[cellA] = { f: `=+A${prevRow}+1`, t: 'n' };
    }

    // === Column G: Estimated Project Cost - Currency format ===
    const cellG = XLSX.utils.encode_cell({ r, c: 6 });
    if (worksheet[cellG] && worksheet[cellG].v !== null && worksheet[cellG].v !== undefined) {
      worksheet[cellG].z = '_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * "-"??_ ;_ @_';
    }

    // === Column K: BID Security in Cr. - Currency format ===
    const cellK = XLSX.utils.encode_cell({ r, c: 10 });
    if (worksheet[cellK] && worksheet[cellK].v !== null && worksheet[cellK].v !== undefined) {
      worksheet[cellK].z = '_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * "-"??_ ;_ @_';
    }

    // === Column L: Length - Currency format ===
    const cellL = XLSX.utils.encode_cell({ r, c: 11 });
    if (worksheet[cellL] && worksheet[cellL].v !== null && worksheet[cellL].v !== undefined) {
      worksheet[cellL].z = '_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * "-"??_ ;_ @_';
    }

    // === Column M: Per Km Cost - Formula =G/L ===
    const cellM = XLSX.utils.encode_cell({ r, c: 12 });
    const cellGValue = worksheetData[r][6]; // G column
    const cellLValue = worksheetData[r][11]; // L column
    if (cellGValue && cellLValue) {
      worksheet[cellM] = { f: `=+G${currentRow}/L${currentRow}`, t: 'n' };
      worksheet[cellM].z = '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* "-"??_);_(@_)';
    }

    // === Column O: Amount of Road Work - Formula =G*49.63% ===
    // const cellO = XLSX.utils.encode_cell({ r, c: 14 });
    // if (cellGValue) {
    //   worksheet[cellO] = { f: `=+G${currentRow}*49.63%`, t: 'n' };
    // }

    // === Column P: Amount of Structure Work - Formula =G*50.37% ===
    // const cellP = XLSX.utils.encode_cell({ r, c: 15 });
    // if (cellGValue) {
    //   worksheet[cellP] = { f: `=+G${currentRow}*50.37%`, t: 'n' };
    // }
  }

  // === Date/Time formatting for columns H, I, J ===
  for (let r = 1; r < worksheetData.length; r++) {
    // Column H: e-Published Date
    const cellH = XLSX.utils.encode_cell({ r, c: 7 });
    if (worksheet[cellH] && typeof worksheet[cellH].v === 'number') {
      worksheet[cellH].z = 'm/d/yy h:mm';
    }

    // Column I: Tender Identification Date
    const cellI = XLSX.utils.encode_cell({ r, c: 8 });
    if (worksheet[cellI] && typeof worksheet[cellI].v === 'number') {
      worksheet[cellI].z = 'm/d/yy h:mm';
    }

    // Column J: Last Date
    const cellJ = XLSX.utils.encode_cell({ r, c: 9 });
    if (worksheet[cellJ] && typeof worksheet[cellJ].v === 'number') {
      worksheet[cellJ].z = 'm/d/yy h:mm';
    }
  }
}
