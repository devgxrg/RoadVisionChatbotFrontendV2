import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, GitCompare, CheckCircle, History, FileEdit } from "lucide-react";
import TenderUpload from "@/components/tenderiq/TenderUpload";
import TenderAnalysisView from "@/components/tenderiq/TenderAnalysisView";
import LiveTenders from "@/components/tenderiq/LiveTenders";
import TenderCompare from "@/components/tenderiq/TenderCompare";
import BidEvaluate from "@/components/tenderiq/BidEvaluate";
import DraftRFP from "@/components/tenderiq/DraftRFP";
import TenderHistory from "@/components/tenderiq/TenderHistory";

const TenderIQ = () => {
  const navigate = useNavigate();
  const [hasAnalyzedTender, setHasAnalyzedTender] = useState(false);

  const handleAnalyzed = () => {
    setHasAnalyzedTender(true);
  };

  const handleBack = () => {
    navigate("/tenderiq");
    setHasAnalyzedTender(false);
  };

  const AnalyzeTenderModule = () => {
    if (!hasAnalyzedTender) {
      return <TenderUpload onAnalyzed={handleAnalyzed} />;
    }
    return <TenderAnalysisView onBack={handleBack} />;
  };

  const ModuleSelectionView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">TenderIQ</h1>
            <p className="text-muted-foreground">AI-powered tender document management suite</p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <Upload className="h-3 w-3 mr-1" />
            Smart Analysis
          </Badge>
          <Badge variant="secondary">
            <GitCompare className="h-3 w-3 mr-1" />
            Document Compare
          </Badge>
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Bid Evaluation
          </Badge>
          <Badge variant="secondary">
            <History className="h-3 w-3 mr-1" />
            History Tracking
          </Badge>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Analyze Tender */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("analyze")}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary">
                Smart Analysis
              </Badge>
            </div>
            <CardTitle>Analyze Tender</CardTitle>
            <CardDescription>Upload tender documents and generate comprehensive analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        {/* Live Tenders */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("live")}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary">
                Real-time
              </Badge>
            </div>
            <CardTitle>Live Tenders</CardTitle>
            <CardDescription>Browse daily scraped live tenders with smart filtering</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        {/* Compare Tenders */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("compare")}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <GitCompare className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary">
                Side-by-side
              </Badge>
            </div>
            <CardTitle>Compare Tenders</CardTitle>
            <CardDescription>Compare two tender documents and identify key differences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        {/* Evaluate Bid */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("evaluate")}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary">
                Compliance Check
              </Badge>
            </div>
            <CardTitle>Evaluate Bid</CardTitle>
            <CardDescription>Check bid completeness and eligibility against RFP requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        {/* Draft RFP */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("draft")}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileEdit className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary">
                Coming Soon
              </Badge>
            </div>
            <CardTitle>Draft RFP</CardTitle>
            <CardDescription>AI-powered RFP document generation and templates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Details</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <p className="text-sm text-muted-foreground">Access your previously analyzed tenders and comparisons</p>
        <TenderHistory />
      </div>
    </div>
  );

  return (
    <Routes>
      <Route index element={<ModuleSelectionView />} />
      <Route path="analyze" element={<AnalyzeTenderModule />} />
      <Route path="live" element={<LiveTenders onBack={handleBack} />} />
      <Route path="compare" element={<TenderCompare onBack={handleBack} />} />
      <Route path="evaluate" element={<BidEvaluate onBack={handleBack} />} />
      <Route path="draft" element={<DraftRFP onBack={handleBack} />} />
    </Routes>
  );
};

export default TenderIQ;
