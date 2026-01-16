import { Tender, TenderFilterParams } from '@/lib/types/tenderiq';

/**
 * Filter tenders based on multiple criteria
 * @param tenders - Array of tenders to filter
 * @param params - Filter parameters
 * @returns Filtered array of tenders
 */
/**
 * Filter tenders based on multiple criteria
 * @param tenders - Array of tenders to filter
 * @param params - Filter parameters
 * @returns Filtered array of tenders
 */
export const filterTenders = (
  tenders: Tender[],
  params: TenderFilterParams
): Tender[] => {
  return tenders.filter(tender => {
    // Search filter - search title, authority, category, tender ID, TDR, and tender number
    if (params.searchTerm) {
      const search = params.searchTerm.toLowerCase();
      const matchesSearch =
        tender.title.toLowerCase().includes(search) ||
        tender.authority.toLowerCase().includes(search) ||
        tender.category.toLowerCase().includes(search) ||
        (tender.id && tender.id.toLowerCase().includes(search)) ||
        (tender.ePublishedDate && tender.ePublishedDate.toLowerCase().includes(search)) ||
        // Add TDR and tender_no search (if available in tender object)
        ((tender as any).tdr && String((tender as any).tdr).toLowerCase().includes(search)) ||
        ((tender as any).tender_no && String((tender as any).tender_no).toLowerCase().includes(search)) ||
        ((tender as any).tender_id_str && String((tender as any).tender_id_str).toLowerCase().includes(search));

      if (!matchesSearch) return false;
    }

    // Category filter
    if (params.category && params.category !== "all") {
      if (tender.category !== params.category) return false;
    }

    // Location filter
    if (params.location && params.location !== "all") {
      if (!tender.location.includes(params.location)) return false;
    }

    // Value range filter
    if (params.minValue !== undefined && params.minValue !== null) {
      if (tender.value < params.minValue) return false;
    }
    if (params.maxValue !== undefined && params.maxValue !== null) {
      if (tender.value > params.maxValue) return false;
    }

    return true;
  });
};

/**
 * Filter tenders by category (query_name)
 * @param tenders - Array of tenders to filter
 * @param category - Category/query_name to filter by
 * @returns Filtered tenders matching the category
 */
export const filterTendersByCategory = (tenders: Tender[], category: string): Tender[] => {
  if (category === "all" || !category) {
    return tenders;
  }
  return tenders.filter(tender => tender.category === category);
};

/**
 * Get all available categories from tenders
 * @param tenders - Array of tenders
 * @returns Array of unique categories
 */
export const getAvailableCategories = (tenders: Tender[]): string[] => {
  const categories = new Set(tenders.map(t => t.category));
  return Array.from(categories).sort();
};

/**
 * Get all available locations from tenders
 * @param tenders - Array of tenders
 * @returns Array of unique locations
 */
export const getAvailableLocations = (tenders: Tender[]): string[] => {
  const locations = new Set(tenders.map(t => t.location).filter(loc => loc && loc !== 'N/A'));
  return Array.from(locations).sort();
};

/**
 * Parse date string to Date object for comparison
 * Handles multiple date formats used in the app
 */
const parseDate = (dateStr?: string | null): Date => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0);
  
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === 'N/A') return new Date(0);
  
  try {
    // Try ISO format first (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
    if (trimmed.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try DD-MM-YYYY or DD-Mon-YYYY format
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      const dayStr = parts[0].trim();
      const monthStr = parts[1].trim();
      const yearStr = parts[2].trim();
      
      const dayNum = parseInt(dayStr, 10);
      const yearNum = parseInt(yearStr, 10);
      
      // Check if it's DD-MM-YYYY format (all numbers)
      const monthNum = parseInt(monthStr, 10);
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
          return new Date(yearNum, monthNum - 1, dayNum);
        }
      }
      
      // Check if it's DD-Mon-YYYY format (e.g., 08-Nov-2025)
      const monthMap: { [key: string]: number } = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const monthAbbr = monthStr.substring(0, 3).toLowerCase();
      const mappedMonth = monthMap[monthAbbr];
      
      if (mappedMonth !== undefined && dayNum >= 1 && dayNum <= 31 && yearNum >= 1900) {
        return new Date(yearNum, mappedMonth, dayNum);
      }
    }
    
    // Try generic Date parsing as last resort
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    // Silently handle parsing errors
  }
  
  return new Date(0);
};

/**
 * Group tenders by category and sort each group by publish date (descending)
 * @param tenders - Array of tenders to group
 * @returns Object with categories as keys and tender arrays as values, sorted by publish date descending
 */
export const groupTendersByCategory = (
  tenders: Tender[]
): Record<string, Tender[]> => {
  const grouped: Record<string, Tender[]> = {};
  tenders.forEach(tender => {
    if (!grouped[tender.category]) {
      grouped[tender.category] = [];
    }
    grouped[tender.category].push(tender);
  });
  
  // Sort tenders in each category by publish date (descending - newest first)
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const dateStrA = a.publish_date || a.ePublishedDate;
      const dateStrB = b.publish_date || b.ePublishedDate;
      const dateA = parseDate(dateStrA);
      const dateB = parseDate(dateStrB);
      const result = dateB.getTime() - dateA.getTime(); // Descending order
      
      // Debug logging (remove after testing)
      if (grouped[category].length <= 3) {
        console.debug(`Sorting ${category}: "${dateStrA}" (${dateA.toISOString()}) vs "${dateStrB}" (${dateB.toISOString()}) = ${result}`);
      }
      
      return result;
    });
  });
  
  return grouped;
};

/**
 * Auto-select the first "Civil" category from available categories
 * @param tenders - Array of tenders
 * @returns Selected category or "all"
 */
export const getDefaultCategory = (tenders: Tender[]): string => {
  const categories = new Set(tenders.map(t => t.category));
  for (const cat of categories) {
    if (cat.includes("Civil")) {
      return cat;
    }
  }
  return "all";
};
