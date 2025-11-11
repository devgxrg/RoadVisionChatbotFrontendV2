import { Card } from "@/components/ui/card";
import { Report, Tender } from "@/lib/types/tenderiq.types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import LiveTendersUI from "./components/LiveTendersUI";
import { getTodayTenders, fetchWishlistedTenders, performTenderAction } from "@/lib/api/tenderiq.api";
import { useNavigate } from "react-router-dom";
import { useReportStream } from "@/lib/hooks/tenderiq.hook";

export default function LiveTenders() {
  const { report, status } = useReportStream()
  // const [report, setReport] = useState<Report | null>(undefined)
  const [wishlisted, setWishlisted] = useState<Tender[]>([])
  const navigate = useNavigate()

  const fetchWishlisted = async () => {
    const wishlisted_tenders = await fetchWishlistedTenders()
    setWishlisted(wishlisted_tenders)
  }

  useEffect(() => {
    fetchWishlisted()
  }, [])

  return <LiveTendersUI
    report={report}
    onAddToWishlist={function (tenderId: string, e: React.MouseEvent): void {
      performTenderAction(tenderId, { action: 'toggle_wishlist' }).then(async () => {
        const wishlisted_tenders = await fetchWishlistedTenders()
        setWishlisted(wishlisted_tenders)
      })
    }}
    onViewTender={function (tenderId: string): void {
      navigate(`/tenderiq/view/${tenderId}`)
    }}
    onNavigateToWishlist={function (): void {
      navigate(`/tenderiq/wishlist-history`)
    }}
    isInWishlist={function (tenderId: string): boolean {
      return wishlisted.some(t => t.id === tenderId)
    }}
  />

}
