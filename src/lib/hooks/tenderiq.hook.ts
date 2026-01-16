import { useEffect, useState } from "react"
import { Report, SSEBatchTenders, StreamStatus } from "../types/tenderiq.types"
import { API_BASE_URL } from "../config/api";

// Cache tenders data for instant loading
const TENDERS_CACHE_KEY = 'tenders_cache_v1';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const MAX_CACHED_TENDERS = 100; // Limit cache size to prevent quota issues

const getCachedTenders = (cacheKey: string): Report | null => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // If cache is too old, discard it
    if (now - timestamp > 60 * 60 * 1000) { // 1 hour max
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCachedTenders = (cacheKey: string, data: Report): void => {
  try {
    // Create a lightweight version with only first 100 tenders and essential fields
    const lightweightReport: Report = {
      ...data,
      queries: data.queries.map((query, index) => {
        if (index === 0) {
          // Only cache first MAX_CACHED_TENDERS with essential fields
          const limitedTenders = query.tenders.slice(0, MAX_CACHED_TENDERS).map(t => ({
            id: t.id,
            tender_id_str: t.tender_id_str,
            tdr: t.tdr,
            tender_name: t.tender_name,
            tender_value: t.tender_value,
            emd: t.emd,
            publish_date: t.publish_date,
            submission_date: t.submission_date,
            company_name: t.company_name,
            city: t.city,
            state: t.state,
            is_wishlisted: t.is_wishlisted,
            // Exclude large fields like document_text, extracted_data, etc.
          }));
          
          return {
            ...query,
            tenders: limitedTenders,
          };
        }
        return query;
      })
    };
    
    localStorage.setItem(cacheKey, JSON.stringify({
      data: lightweightReport,
      timestamp: Date.now(),
      cached_count: MAX_CACHED_TENDERS
    }));
  } catch (e) {
    // If still too large, silently ignore
    console.warn('Failed to cache tenders (data too large):', e);
  }
};

const isCacheFresh = (cacheKey: string): boolean => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return false;
    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
};

export const useReportStream = (run_id?: string, dateRange?: string) => {
  // Create cache key based on run_id and dateRange
  const cacheKey = `${TENDERS_CACHE_KEY}_${run_id || 'none'}_${dateRange || 'none'}`;
  
  console.log('[Cache Debug] Cache key:', cacheKey);
  console.log('[Cache Debug] Checking for cached data...');
  
  // Initialize with cached data if available
  const initialCachedData = getCachedTenders(cacheKey);
  console.log('[Cache Debug] Initial cached data found:', !!initialCachedData, 'tenders:', initialCachedData?.queries[0]?.tenders?.length || 0);
  
  const [report, setReport] = useState<Report | null>(initialCachedData);
  const [status, setStatus] = useState<StreamStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [shouldWarn401, setShouldWarn401] = useState(false)

  // Helper function to normalize dates to YYYY-MM-DD for proper sorting
  const normalizeDateToYYYYMMDD = (dateStr: string): string => {
    if (!dateStr) return '0000-00-00'
    
    dateStr = dateStr.trim()
    
    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr // Already in correct format
    }
    
    // Try to parse DD-MM-YYYY or DD/MM/YYYY format
    let parts = dateStr.split('-')
    if (parts.length !== 3) {
      parts = dateStr.split('/')
    }
    
    if (parts.length === 3) {
      try {
        let day = parts[0].trim()
        let month = parts[1].trim()
        let year = parts[2].trim()
        
        // Parse as integers to handle both "2" and "02" formats
        const dayNum = parseInt(day, 10)
        const monthNum = parseInt(month, 10)
        const yearNum = parseInt(year, 10)
        
        // Validate ranges
        if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2100) {
          return '0000-00-00'
        }
        
        // Return in YYYY-MM-DD format with zero padding
        return `${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`
      } catch {
        return '0000-00-00'
      }
    }
    return '0000-00-00'
  }

  useEffect(() => {
    // Check if we have fresh cached data - show it immediately but still fetch in background
    const cachedData = getCachedTenders(cacheKey);
    const hasFreshCache = cachedData && isCacheFresh(cacheKey);
    
    if (hasFreshCache) {
      console.log('Using fresh cached tenders data, refreshing in background...');
      console.log('Cached tenders count:', cachedData?.queries[0]?.tenders?.length || 0);
      setStatus('complete'); // Set to complete initially to show cached data
      // Continue to fetch fresh data in background
    }
    
    let url = `${API_BASE_URL}/tenderiq/tenders-sse`
    const params = new URLSearchParams()
    
    if (run_id) {
      params.append('scrape_run_id', run_id)
    }
    if (dateRange) {
      params.append('date_range', dateRange)
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    console.log("Connecting to SSE with URL:", url)
    const evtSource = new EventSource(url)
    
    // Only set streaming status if we don't have fresh cache
    if (!hasFreshCache) {
      setStatus("streaming")
    }
    
    setError(null)
    setShouldWarn401(true)

    const handleInitialData = (event: MessageEvent) => {
      const initialReport = JSON.parse(event.data) as Report
      console.log("Recieved initial data: ", initialReport)
      
      // Collect all tenders from all queries
      const allTenders = new Map<string, any>()
      initialReport.queries.forEach(query => {
        query.tenders.forEach(t => {
          if (t.tender_id_str) {
            allTenders.set(t.tender_id_str, t)
          }
        })
      })
      
      // Sort by publish_date descending
      const sortedTenders = Array.from(allTenders.values()).sort((a, b) => {
        const dateA = normalizeDateToYYYYMMDD(a.publish_date || '')
        const dateB = normalizeDateToYYYYMMDD(b.publish_date || '')
        const result = dateB.localeCompare(dateA) // Descending order (newest first)
        
        return result
      })
      
      console.log("Initial data sorted - first 5 tenders:", sortedTenders.slice(0, 5).map(t => ({
        name: t.tender_name,
        publish_date: t.publish_date,
        normalized: normalizeDateToYYYYMMDD(t.publish_date || '')
      })))
      
      // Put all sorted tenders in first query
      const sortedReport = {
        ...initialReport,
        queries: initialReport.queries.map((query, index) => {
          if (index === 0) {
            return {
              ...query,
              tenders: sortedTenders,
            }
          } else {
            return {
              ...query,
              tenders: [],
            }
          }
        })
      }
      
      setReport(sortedReport)
      setCachedTenders(cacheKey, sortedReport)
      // Reset 401 warning on successful connection
      setShouldWarn401(false)
    }

    const handleBatch = (event: MessageEvent) => {
      const batch = JSON.parse(event.data) as SSEBatchTenders
      setReport((prevReport) => {
        if (!prevReport) return null
        
        // Collect all existing tenders from all queries
        const allExistingTenders = new Map<string, any>()
        prevReport.queries.forEach(query => {
          query.tenders.forEach(t => {
            if (t.tender_id_str) {
              allExistingTenders.set(t.tender_id_str, t)
            }
          })
        })
        
        // Add new tenders from batch (will overwrite if duplicate)
        batch.data.forEach(t => {
          if (t.tender_id_str) {
            allExistingTenders.set(t.tender_id_str, t)
          }
        })
        
        // Convert to array and sort by publish_date descending
        const sortedAllTenders = Array.from(allExistingTenders.values()).sort((a, b) => {
          const dateA = normalizeDateToYYYYMMDD(a.publish_date || '')
          const dateB = normalizeDateToYYYYMMDD(b.publish_date || '')
          const comparison = dateB.localeCompare(dateA) // Descending order (newest first)
          
          return comparison
        })
        
        if (sortedAllTenders.length > 0) {
          console.log(`[Batch ${new Date().toLocaleTimeString()}] Total tenders now: ${sortedAllTenders.length}`)
          console.log("Top 3 tenders after sort:", sortedAllTenders.slice(0, 3).map(t => ({
            name: t.tender_name?.substring(0, 50),
            date: t.publish_date,
            normalized: normalizeDateToYYYYMMDD(t.publish_date || '')
          })))
        }
        
        // Put all sorted tenders in the first query (Civil Works)
        const newQueries = prevReport.queries.map((query, index) => {
          if (index === 0) {
            // First query gets all sorted tenders
            return {
              ...query,
              tenders: sortedAllTenders,
            }
          } else {
            // Other queries get empty array
            return {
              ...query,
              tenders: [],
            }
          }
        })
        
        const updatedReport = {
          ...prevReport,
          queries: newQueries
        }
        
        // Cache the updated report
        setCachedTenders(cacheKey, updatedReport)
        
        return updatedReport
      })
    }

    const handleComplete = (event: MessageEvent) => {
      console.log("Stream completed")
      setStatus("complete")
      evtSource.close()
    }

    const handleError = (event: Event) => {
      console.error("Stream error:", event)
      setStatus("error")
      
      // Only show 401 error if we had a successful connection that got closed
      // This prevents false positives on initial connection failures
      if (shouldWarn401 && report) {
        setError("You've been logged in for a while, login again")
      }
      
      evtSource.close()
    }

    evtSource.addEventListener("initial_data", handleInitialData)
    evtSource.addEventListener("batch", handleBatch)
    evtSource.addEventListener("complete", handleComplete)
    evtSource.onerror = handleError

    return () => {
      evtSource.close()
    }

  }, [run_id, dateRange])

  return { report, status, error }
}
