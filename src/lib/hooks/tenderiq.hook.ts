import { useEffect, useState } from "react"
import { Report, SSEBatchTenders, StreamStatus } from "../types/tenderiq.types"
import { API_BASE_URL } from "../config/api";


export const useReportStream = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<StreamStatus>("idle")

  useEffect(() => {
    const evtSource = new EventSource(`${API_BASE_URL}/tenderiq/tenders-sse`)
    setStatus("streaming")

    const handleInitialData = (event: MessageEvent) => {
      const initialReport = JSON.parse(event.data) as Report
      console.log("Recieved initial data: ", initialReport)
      setReport(initialReport)
    }

    const handleBatch = (event: MessageEvent) => {
      const batch = JSON.parse(event.data) as SSEBatchTenders
      setReport((prevReport) => {
        if (!prevReport) return null
        const newQueries = prevReport.queries.map((query) => {
          console.log(batch.query_id)
          if (query.id != batch.query_id) {
            console.log(query.id, batch.query_id)
            return query
          }
          console.log(query)
          return {
            ...query,
            tenders: [...query.tenders, ...batch.data],
          }
        })
        return {
          ...prevReport,
          queries: newQueries
        }
      })
    }

    const handleComplete = (event: MessageEvent) => {
      console.log("Stream completed")
      setStatus("complete")
      evtSource.close()
    }

    const handleError = (event: MessageEvent) => {
      setStatus("error")
      console.error("Stream error:", event)
      evtSource.close()
    }

    evtSource.addEventListener("initial_data", handleInitialData)
    evtSource.addEventListener("batch", handleBatch)
    evtSource.addEventListener("complete", handleComplete)
    evtSource.onerror = handleError

  },[])

  return { report, status }
}
