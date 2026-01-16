import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/common/BackButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Calendar,
  Upload,
  Download,
  Clock,
  Scale,
  TrendingUp,
  FileText,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getCaseTrackerData } from "@/lib/api/case-tracker";
import { Case } from "@/lib/types/case-tracker";
import { NewCaseDialog } from "@/components/case-tracker/NewCaseDialog";



export default function CaseTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [upcomingHearingsCount, setUpcomingHearingsCount] = useState(0);
  const [avgDuration, setAvgDuration] = useState("0");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch cases on mount
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await getCaseTrackerData();
      setAllCases(data.cases);
      setActiveCasesCount(data.totalActiveCases);
      setUpcomingHearingsCount(data.upcomingHearings);
      setAvgDuration(data.avgCaseDuration.toFixed(1));

      // Set first case as selected if none selected
      if (data.cases.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data.cases[0].id);
      }
    } catch (error) {
      toast.error("Failed to load cases");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = (newCase: Case) => {
    setAllCases(prev => [newCase, ...prev]);
    setActiveCasesCount(prev => prev + 1);
    setSelectedCaseId(newCase.id);
    toast.success("Case created successfully!");
  };

  const selectedCase = allCases.find(c => c.id === selectedCaseId);

  // Parse today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort hearings chronologically
  const sortedHearings = selectedCase?.hearings
    ? [...selectedCase.hearings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Find the next upcoming hearing
  const nextHearing = sortedHearings.find(h => new Date(h.date) >= today) ||
    (sortedHearings.length > 0 ? sortedHearings[sortedHearings.length - 1] : null);

  const filteredCases = allCases.filter(caseItem => {
    const matchesSearch =
      caseItem.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.courtName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || statusFilter === "all" || caseItem.litigationStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesCourt = !courtFilter || courtFilter === "all" || caseItem.courtName.toLowerCase().includes(courtFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCourt;
  });

  const handleAddCase = () => {
    setDialogOpen(true);
  };

  const handleScheduleHearing = () => {
    toast.success("Schedule Hearing form opened");
  };

  const handleDownloadDocument = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
  };

  const handleUploadDocument = () => {
    toast.success("Upload Document dialog opened");
  };

  // Calculate next hearing for display (only for active cases)
  const allUpcomingHearings = allCases
    .filter(c => !["Closed", "Disposed", "Dismissed"].includes(c.litigationStatus))
    .flatMap(c =>
      c.hearings
        .filter(h => new Date(h.date) >= today)
        .map(h => ({ ...h, caseId: c.caseId, caseTitle: c.caseTitle }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextHearingGlobal = allUpcomingHearings.length > 0 ? allUpcomingHearings[0] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NewCaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCaseCreated={handleCaseCreated}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <BackButton to="/ceigalliq" />
          <h1 className="text-3xl font-bold text-foreground mb-2 mt-2">Case Tracker</h1>
          <p className="text-muted-foreground">
            Comprehensive case management and hearing tracking
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddCase}>
          <Plus className="h-4 w-4" />
          Add New Case
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeCasesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 text-success" /> {allCases.length} total cases
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Hearings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{upcomingHearingsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {nextHearingGlobal
                ? `Next: ${nextHearingGlobal.date}`
                : "No upcoming hearings"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg. Case Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{avgDuration}</div>
            <p className="text-xs text-muted-foreground mt-1">months</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{allCases.length}</div>
            <p className="text-xs text-muted-foreground mt-1">in database</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Case ID, Party Name, or Court..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under review">Under Review</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  <SelectItem value="saket">Saket</SelectItem>
                  <SelectItem value="patiala">Patiala House</SelectItem>
                  <SelectItem value="chandigarh">Chandigarh</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Selector and Info Side by Side */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Case Selector - Left Side */}
        <Card className="shadow-md border-primary/20 lg:col-span-1">
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
            <CardDescription>{filteredCases.length} cases found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredCases.length > 0 ? (
                filteredCases.map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedCaseId === caseItem.id ? 'border-primary border-2 bg-primary/5' : ''
                      }`}
                    onClick={() => setSelectedCaseId(caseItem.id)}
                  >
                    <CardHeader className="pb-3 px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm">{caseItem.caseId}</CardTitle>
                        <Badge
                          variant={caseItem.litigationStatus === "Closed" ? "secondary" :
                            caseItem.litigationStatus === "Pending" ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {caseItem.litigationStatus}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {caseItem.caseTitle}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No cases found. Click "Add New Case" to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Case Info - Right Side */}
        <div className="lg:col-span-2">

          {/* Case Details Tabs */}
          {selectedCase ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Case Overview</TabsTrigger>
                <TabsTrigger value="hearings">Hearings</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Case Overview */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Case Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Case Title</p>
                        <p className="font-medium text-foreground">{selectedCase.caseTitle}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Case ID</p>
                          <p className="font-medium text-foreground">{selectedCase.caseId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CNR Number</p>
                          <p className="font-medium text-foreground">{selectedCase.cnrNumber}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Filing Date</p>
                          <p className="font-medium text-foreground">{selectedCase.filingDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Registration Date</p>
                          <p className="font-medium text-foreground">{selectedCase.registrationDate}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Case Type</p>
                        <Badge>{selectedCase.caseType}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline" className="border-warning text-warning">
                          {selectedCase.litigationStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Court & Jurisdiction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Court Name</p>
                        <p className="font-medium text-foreground">{selectedCase.courtName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Court Number</p>
                          <p className="font-medium text-foreground">{selectedCase.courtNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Jurisdiction</p>
                          <p className="font-medium text-foreground">{selectedCase.jurisdiction}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Judge Name</p>
                        <p className="font-medium text-foreground">{selectedCase.judgeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Case Stage</p>
                        <Badge variant="secondary">{selectedCase.caseStage}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Legal Provisions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Under Act(s)</p>
                        <p className="font-medium text-foreground">{selectedCase.underActs}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Section(s)</p>
                        <p className="font-medium text-foreground">{selectedCase.sections}</p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Police Station</p>
                        <p className="font-medium text-foreground">{selectedCase.policeStation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">FIR Number / Year</p>
                        <p className="font-medium text-foreground">{selectedCase.firNumber}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Parties & Advocates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Petitioner</p>
                        <p className="font-medium text-foreground">{selectedCase.petitioner}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Advocate: {selectedCase.petitionerAdvocate}
                        </p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Respondent</p>
                        <p className="font-medium text-foreground">{selectedCase.respondent}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Advocate: {selectedCase.respondentAdvocate}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Hearings */}
              <TabsContent value="hearings" className="mt-6">
                <div className="space-y-6">
                  {/* Hearing Dates Summary */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">First Hearing Date</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-foreground">
                          {sortedHearings[0]?.date || "N/A"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Next Hearing Date</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {["Closed", "Disposed", "Dismissed"].includes(selectedCase.litigationStatus)
                            ? "N/A"
                            : nextHearing
                              ? nextHearing.date
                              : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {["Closed", "Disposed", "Dismissed"].includes(selectedCase.litigationStatus)
                            ? "Case concluded"
                            : nextHearing
                              ? nextHearing.purpose
                              : "No upcoming hearings"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Total Hearings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-foreground">{selectedCase.hearings.length}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline Visualization */}
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Case Timeline</CardTitle>
                      <CardDescription>Chronological view of all hearings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute top-6 left-6 bottom-6 w-0.5 bg-border" />
                        <div className="space-y-6">
                          {sortedHearings.map((hearing, index) => (
                            <div key={index} className="relative flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="h-3 w-3 rounded-full bg-primary relative z-10" />
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="p-4 rounded-lg bg-secondary">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-foreground">{hearing.date}</p>
                                    <Badge variant="outline">{hearing.purpose}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">Judge: {hearing.judge}</p>
                                  <p className="text-sm text-foreground">{hearing.outcome}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Hearing History</CardTitle>
                          <CardDescription>Total Hearings: {selectedCase.hearings.length}</CardDescription>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handleScheduleHearing}>
                          <Calendar className="h-4 w-4" />
                          Schedule Hearing
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Judge</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Outcome</TableHead>
                            <TableHead>Document</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedHearings.map((hearing, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{hearing.date}</TableCell>
                              <TableCell>{hearing.judge}</TableCell>
                              <TableCell>{hearing.purpose}</TableCell>
                              <TableCell>{hearing.outcome}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDownloadDocument(hearing.document)}
                                >
                                  <Download className="h-3 w-3" />
                                  {hearing.document}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents" className="mt-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Case Documents</CardTitle>
                        <CardDescription>All uploaded documents for this case</CardDescription>
                      </div>
                      <Button className="gap-2" onClick={handleUploadDocument}>
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCase.documents.map((doc, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {doc.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{doc.type}</Badge>
                            </TableCell>
                            <TableCell>{doc.uploadDate}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(doc.name)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Case Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Pending</span>
                            <span className="text-sm text-muted-foreground">
                              {allCases.filter(c => c.litigationStatus === "Pending").length} cases
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-warning" style={{ width: `${(allCases.filter(c => c.litigationStatus === "Pending").length / allCases.length) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Under Review</span>
                            <span className="text-sm text-muted-foreground">
                              {allCases.filter(c => c.litigationStatus === "Under Review").length} cases
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(allCases.filter(c => c.litigationStatus === "Under Review").length / allCases.length) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Closed</span>
                            <span className="text-sm text-muted-foreground">
                              {allCases.filter(c => c.litigationStatus === "Closed").length} cases
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-success" style={{ width: `${(allCases.filter(c => c.litigationStatus === "Closed").length / allCases.length) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-primary/20">
                    <CardHeader>
                      <CardTitle>AI Insights</CardTitle>
                      <CardDescription>AI-powered analysis of case progress and strategy</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium text-foreground mb-1">Case Summary</p>
                        <p className="text-sm text-foreground">{selectedCase.aiInsights?.summary || "Analysis pending..."}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-secondary">
                          <p className="text-sm font-medium text-foreground mb-1">Win Probability</p>
                          <p className="text-lg font-semibold text-success">{selectedCase.aiInsights?.winProbability || "Calculating..."}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary">
                          <p className="text-sm font-medium text-foreground mb-1">Est. Duration</p>
                          <p className="text-lg font-semibold text-foreground">{selectedCase.aiInsights?.estimatedDuration || "Estimating..."}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-secondary border-l-4 border-warning">
                        <p className="text-sm font-medium text-foreground mb-1">Recommended Action</p>
                        <p className="text-sm text-foreground">{selectedCase.aiInsights?.recommendedAction || "No immediate actions required."}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No case selected. Please select a case from the list or add a new case.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
