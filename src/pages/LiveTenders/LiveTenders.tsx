import { Card } from "@/components/ui/card";
import { Report } from "@/lib/types/tenderiq.types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import LiveTendersUI from "./components/LiveTendersUI";
import { getTodayTenders } from "@/lib/api/tenderiq.api";

export default function LiveTenders() {
  const [report, setReport] = useState<Report | null>(undefined)

  useEffect(() => {
    const fetchReport = async () => {
      const report = await getTodayTenders()
      setReport(report)
    }
    fetchReport()
  }, [])

  return <LiveTendersUI
    report={report}
    searchQuery={""}
    onSearchChange={function (query: string): void {
    }}
    onAddToWishlist={function (tenderId: string, e: React.MouseEvent): void {
    }}
    onViewTender={function (tenderId: string): void {
    }}
    onNavigateToWishlist={function (): void {
    }}
    isInWishlist={function (tenderId: string): boolean {
      return false
    }}
  />

}
