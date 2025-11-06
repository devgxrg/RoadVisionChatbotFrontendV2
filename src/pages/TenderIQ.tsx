/**
 * TenderIQ - Live Tenders Main View
 *
 * The Live Tenders view is now the main TenderIQ interface.
 * Users browse and filter live tenders with smart defaults:
 * - Category: Civil Engineering (default)
 * - Date: Latest scraped date (default)
 * - Min Value: 300 crores (default)
 */

import { useNavigate } from "react-router-dom";
import LiveTenders from "@/components/tenderiq/LiveTenders";

const TenderIQ = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <LiveTenders onBack={handleBack} />;
};

export default TenderIQ;
