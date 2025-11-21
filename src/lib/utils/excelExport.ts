import * as XLSX from 'xlsx';
import { WishlistReportData } from '../types/wishlist';
import { format, parse, isValid } from 'date-fns';

/**
 * Parse date string to Excel date number
 */
function parseToExcelDate(dateStr: string): number | string {
  if (!dateStr) return '';
  
  try {
    let date: Date | null = null;
    
    // DD-MM-YYYY: 13-11-2025
    if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
      date = parse(dateStr, 'dd-MM-yyyy', new Date());
    }
    // DD-MMM-YYYY: 11-Nov-2025 or 13-Nov-2025
    else if (dateStr.match(/\d{1,2}-[A-Za-z]{3}-\d{4}/)) {
      date = parse(dateStr, 'dd-MMM-yyyy', new Date());
    }
    // ISO format: 2025-11-11T00:00:00 or 2025-11-11
    else if (dateStr.includes('T') || (dateStr.includes('-') && dateStr.length >= 10)) {
      date = new Date(dateStr);
    }
    // DD MMM: "15 Dec" (assume current year)
    else if (dateStr.match(/\d{1,2}\s+[A-Za-z]{3}/)) {
      const currentYear = new Date().getFullYear();
      date = parse(`${dateStr} ${currentYear}`, 'dd MMM yyyy', new Date());
    }
    
    if (date && isValid(date) && !isNaN(date.getTime())) {
      // Convert to Excel serial date number (days since 1900-01-01)
      // Excel incorrectly treats 1900 as a leap year, so we add 1 for dates after Feb 28, 1900
      const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
      const daysSinceEpoch = Math.floor((date.getTime() - excelEpoch.getTime()) / (24 * 60 * 60 * 1000));
      console.log(`Date parsed: "${dateStr}" -> ${date.toISOString()} -> Excel: ${daysSinceEpoch}`);
      return daysSinceEpoch;
    }
    
    console.warn('Date parsing failed for:', dateStr);
  } catch (e) {
    console.warn('Date parse error:', dateStr, e);
  }
  
  return ''; // Return empty string if parsing fails
}

/**
 * Generate and download an Excel file matching the client's TenderList.xlsx template
 * Creates a single "Bidding" sheet with 21 columns exactly as specified by the client
 */
export function generateWishlistExcel(reportData: WishlistReportData, filename: string = 'Wishlist_Report'): void {
  console.log('==================== EXCEL EXPORT STARTED ====================');
  console.log('Total tenders to export:', reportData.tenders.length);
  
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

  // Helper to extract state from city field (e.g., "Aizawl Mizoram" -> "Mizoram")
  const extractState = (city: string | undefined): string => {
    if (!city) return '';
    const parts = city.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : city;
  };

  // Prepare data rows with data mapping
  const dataRows = tenders.map((tender, index) => {
    const scraped = tender.full_scraped_details;

    // Helper to safely parse numeric values
    const parseNum = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;
      const str = String(value).replace(/,/g, '').trim();
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    };
    
    // Helper to get clean status - try scraped.current_status first
    const getStatus = (): string => {
      // First priority: use current_status from backend (already cleaned)
      if (scraped?.current_status) {
        return String(scraped.current_status);
      }
      
      // Second priority: use results from tender
      if (tender.results) {
        const status = String(tender.results).toLowerCase();
        if (status.includes('pending') || status.includes('open')) return 'Pending';
        if (status.includes('won')) return 'Won';
        if (status.includes('lost') || status.includes('reject')) return 'Lost';
        if (status.includes('closed')) return 'Closed';
        return String(tender.results).charAt(0).toUpperCase() + String(tender.results).slice(1);
      }
      return 'Pending';
    };

    // Extract numeric values - tender.value and tender.emd are in RUPEES
    const tenderValue = parseNum(tender.value);
    const emdValue = parseNum(tender.emd);
    
    // Convert from rupees to crores
    const estimatedCost = tenderValue ? tenderValue / 10000000 : null;
    const bidSecurity = emdValue ? emdValue / 10000000 : null;
    
    // Get values from full_scraped_details with better fallbacks
    const lengthKm = parseNum(scraped?.length_km);
    const spanLengthValue = parseNum(scraped?.span_length);
    const roadWorkAmountValue = parseNum(scraped?.road_work_amount);
    const structureWorkAmountValue = parseNum(scraped?.structure_work_amount);
    
    // per_km_cost from backend (already in rupees, convert to crores)
    const perKmCostBackend = scraped?.per_km_cost ? parseNum(scraped.per_km_cost) / 10000000 : null;
    
    // Convert to crores if values exist
    const roadWork = roadWorkAmountValue ? roadWorkAmountValue / 10000000 : null;
    const structureWork = structureWorkAmountValue ? structureWorkAmountValue / 10000000 : null;
    
    // Log first tender to debug data structure
    if (index === 0) {
      console.log('Excel Export - First Tender FULL DATA:', JSON.stringify(tender, null, 2));
      console.log('Excel Export - Scraped Details:', JSON.stringify(scraped, null, 2));
      console.log('Excel Export - Parsed Values:', {
        lengthKm,
        spanLengthValue,
        roadWorkAmountValue,
        structureWorkAmountValue,
        perKmCostBackend,
        estimatedCost,
        bidSecurity
      });
    }

    // Parse dates - try multiple field sources
    const publishDate = parseToExcelDate(scraped?.publish_date || (scraped as any)?.published_date || (scraped as any)?.e_published_date || '');
    const dueDate = parseToExcelDate(tender.due_date || scraped?.last_date_of_bid_submission || (scraped as any)?.last_date || '');

    // Build row array
    return {
      // A: S. No - Will be set as formula
      sNo: null as any,
      // B: Tender Id
      tenderId: scraped?.tender_id_detail || scraped?.tender_no || scraped?.tdr || scraped?.tender_id_str || tender.id || '',
      // C: Name of the Work
      nameOfWork: tender.title || scraped?.tender_name || scraped?.tender_brief || '',
      // D: Employer
      employer: tender.authority || scraped?.tendering_authority || scraped?.company_name || '',
      // E: State
      state: extractState(scraped?.city),
      // F: Mode (Bidding Type)
      mode: scraped?.bidding_type || scraped?.tender_type || scraped?.competition_type || 'Open Tender',
      // G: Estimated Project Cost (in Crores)
      estimatedCost: estimatedCost,
      // H: e-Published Date
      ePublishedDate: publishDate,
      // I: Tender Identification Date
      tenderIdDate: publishDate,
      // J: Last Date
      lastDate: dueDate,
      // K: BID Security in Cr.
      bidSecurity: bidSecurity,
      // L: Length - NO CONVERSION, store as-is
      length: lengthKm,
      // M: Per Km Cost - NO CONVERSION, use formula or store as-is
      perKmCost: perKmCostBackend,
      // N: Required Span Length - NO CONVERSION
      requiredSpanLength: spanLengthValue,
      // O: Amount of Road Work (in Crores)
      roadWork: roadWork,
      // P: Amount of Structure Work (in Crores)
      structureWork: structureWork,
      // Q: Remarks - use backend cleaned remarks first
      remarks: scraped?.remarks || scraped?.summary || scraped?.tender_brief || scraped?.tender_details || '',
      // R: Current Status - use backend current_status first
      currentStatus: getStatus(),
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

    // === Column M: Per Km Cost - Use backend value or Formula =G/L ===
    const cellM = XLSX.utils.encode_cell({ r, c: 12 });
    const cellGValue = worksheetData[r][6]; // G column
    const cellLValue = worksheetData[r][11]; // L column
    const perKmCostValue = worksheetData[r][12]; // M column - check if backend provided value
    
    if (perKmCostValue && typeof perKmCostValue === 'number') {
      // Use backend-provided per_km_cost value
      worksheet[cellM] = { v: perKmCostValue, t: 'n' };
      worksheet[cellM].z = '_(* #,##0.00_);_(* \(#,##0.00\);_(* "-"??_);_(@_)';
    } else if (cellGValue && cellLValue) {
      // Calculate using formula if backend didn't provide value
      worksheet[cellM] = { f: `=+G${currentRow}/L${currentRow}`, t: 'n' };
      worksheet[cellM].z = '_(* #,##0.00_);_(* \(#,##0.00\);_(* "-"??_);_(@_)';
    }

    // === Column N: Required Span Length - Number format ===
    const cellN = XLSX.utils.encode_cell({ r, c: 13 });
    if (worksheet[cellN] && worksheet[cellN].v !== null && worksheet[cellN].v !== undefined) {
      worksheet[cellN].z = '_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * "-"??_ ;_ @_';
    }

    // === Column O: Amount of Road Work - Number format ===
    const cellO = XLSX.utils.encode_cell({ r, c: 14 });
    if (worksheet[cellO] && worksheet[cellO].v !== null && worksheet[cellO].v !== undefined) {
      worksheet[cellO].z = '_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * "-"??_ ;_ @_';
    }

    // === Column P: Amount of Structure Work - Number format ===
    const cellP = XLSX.utils.encode_cell({ r, c: 15 });
    if (worksheet[cellP] && worksheet[cellP].v !== null && worksheet[cellP].v !== undefined) {
      worksheet[cellP].z = '_ * #,##0.00_ ;_ * \\-#,##0.00_ ;_ * "-"??_ ;_ @_';
    }
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
