import { Report, ScrapeDate, Tender } from "@/lib/types/tenderiq.types";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import LiveTendersUI from "./components/LiveTendersUI";
import { getScrapeDates, fetchWishlistedTenders } from "@/lib/api/tenderiq.api";
import { useNavigate } from "react-router-dom";
import { useReportStream } from "@/lib/hooks/tenderiq.hook";
import { useTenderActions } from "@/hooks/useTenderActions";

export default function LiveTenders() {
  const [runId, setRunId] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<string | undefined>("last_5_days")
  const { report: streamReport, status, error } = useReportStream(runId, dateRange)
  const [localReport, setLocalReport] = useState<Report | undefined>(undefined)
  const [dates, setDate] = useState<ScrapeDate[]>([])
  const [wishlistedTenderIds, setWishlistedTenderIds] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const { handleToggleWishlist } = useTenderActions()

  // Fetch user's wishlist on mount to know which tenders are wishlisted
  useEffect(() => {
    fetchWishlistedTenders()
      .then(wishlistedTenders => {
        // Extract tender IDs (using tdr/tender_id_str as the key since that's what matches)
        const ids = new Set(wishlistedTenders.map(t => t.tdr || t.tender_id_str))
        setWishlistedTenderIds(ids)
      })
      .catch(err => {
        console.error('Error fetching wishlist:', err)
      })
  }, [])

  // Sync local report with stream report and merge wishlist status
  useEffect(() => {
    if (streamReport) {
      // Merge wishlist status into the report
      const reportWithWishlistStatus: Report = {
        ...streamReport,
        queries: streamReport.queries.map(query => ({
          ...query,
          tenders: query.tenders.map(tender => ({
            ...tender,
            is_wishlisted: wishlistedTenderIds.has(tender.tdr) || wishlistedTenderIds.has(tender.tender_id_str) || tender.is_wishlisted
          }))
        }))
      }
      setLocalReport(reportWithWishlistStatus)
    }
  }, [streamReport, wishlistedTenderIds])

  const onDateSelect = async (dateValue: string) => {
    console.log("Selected date/range: ", dateValue)

    // Handle quick date filters
    if (dateValue.startsWith("last_")) {
      setRunId(undefined)
      setDateRange(dateValue)
      return
    }

    // Handle specific date selection - find matching run_id
    const matchingDate = dates.find(d => d.date === dateValue || d.id === dateValue)
    if (matchingDate) {
      console.log("Found matching date, setting runId to:", matchingDate.id)
      setDateRange(undefined)
      setRunId(matchingDate.id)
    } else {
      console.warn("No matching date found for:", dateValue)
      setRunId(undefined)
      setDateRange(undefined)
    }
  }

  useEffect(() => {
    getScrapeDates().then(scrape_dates => {
      setDate(scrape_dates.dates)
    })
  }, [])

  // Handle 401 errors - redirect to login
  useEffect(() => {
    if (error === "You've been logged in for a while, login again") {
      // Show error and redirect after a short delay
      alert(error)
      navigate("/login")
    }
  }, [error, navigate])

  // Helper function to update tender's is_wishlisted in local report
  const updateTenderWishlistStatus = useCallback((tenderId: string, isWishlisted: boolean) => {
    setLocalReport(prevReport => {
      if (!prevReport) return prevReport
      return {
        ...prevReport,
        queries: prevReport.queries.map(query => ({
          ...query,
          tenders: query.tenders.map(tender => 
            tender.id === tenderId 
              ? { ...tender, is_wishlisted: isWishlisted }
              : tender
          )
        }))
      }
    })
  }, [])

  const handleAddToWishlist = useCallback(async function (tenderId: string, e: React.MouseEvent): Promise<void> {
    // Prevent event from bubbling up (e.g., if card has click handler)
    e.stopPropagation()
    
    // Find the tender to get current wishlist status
    let currentTender: Tender | undefined
    if (localReport?.queries) {
      for (const query of localReport.queries) {
        const found = query.tenders.find(t => t.id === tenderId)
        if (found) {
          currentTender = found
          break
        }
      }
    }

    const isCurrentlyWishlisted = currentTender?.is_wishlisted ?? false

    // Optimistic update - toggle the wishlist status immediately
    updateTenderWishlistStatus(tenderId, !isCurrentlyWishlisted)

    try {
      await handleToggleWishlist(tenderId, isCurrentlyWishlisted)
      // Stay on the page - don't navigate, just toggle the star
    } catch (error) {
      // Revert on error
      updateTenderWishlistStatus(tenderId, isCurrentlyWishlisted)
      console.error('Error in onAddToWishlist:', error)
    }
  }, [localReport, handleToggleWishlist, updateTenderWishlistStatus])

  const handleViewTender = useCallback(function (tenderId: string, tdr?: string): void {
    const tdrParam = tdr ? `?tdr=${encodeURIComponent(tdr)}` : ''
    navigate(`/tenderiq/view/${tenderId}${tdrParam}`)
  }, [navigate])

  const handleNavigateToWishlist = useCallback(function (): void {
    navigate(`/tenderiq/wishlist-history`)
  }, [navigate])

  return <LiveTendersUI
    report={localReport}
    status={status}
    onChangeDate={onDateSelect}
    dates={dates}
    currentDateRange={dateRange}
    currentRunId={runId}
    onAddToWishlist={handleAddToWishlist}
    onViewTender={handleViewTender}
    onNavigateToWishlist={handleNavigateToWishlist}
  />

}
