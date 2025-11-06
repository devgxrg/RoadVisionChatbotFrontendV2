import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCode,
  DollarSign,
  Calendar,
  MapPin,
  Building2,
  BarChart3,
  Shield,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalyzeTender } from '@/hooks/useAnalyzeTender';
import { fetchTenderById } from '@/lib/api/tenderiq';
import { useState, useEffect } from 'react';
import {
  TenderAnalysisResponse,
  MoneyAmount,
  KeyValuePair,
  RFPSection,
  WorkPackage,
  TemplateItem,
  RiskItem,
  ComplianceItem,
  WinFactor,
} from '@/lib/types/analyze';

export default function AnalyzeTender() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState<any>(null);
  const [tenderLoading, setTenderLoading] = useState(true);
  const [tenderError, setTenderError] = useState<string | null>(null);

  // Initialize analysis hook
  const analysis = useAnalyzeTender({
    tenderId: id || '',
    autoStartAnalysis: false,
    pollInterval: 2000,
  });

  // Fetch tender details on mount
  useEffect(() => {
    const loadTender = async () => {
      if (!id) {
        setTenderError('No tender ID provided');
        setTenderLoading(false);
        return;
      }

      try {
        setTenderLoading(true);
        const tenderData = await fetchTenderById(id);
        setTender(tenderData);
        setTenderError(null);
      } catch (error) {
        setTenderError(error instanceof Error ? error.message : 'Failed to load tender');
        console.error('Error loading tender:', error);
      } finally {
        setTenderLoading(false);
      }
    };

    loadTender();
  }, [id]);

  const analysisResults = analysis.analysisResults as TenderAnalysisResponse | null;
  const isAnalysisComplete = analysis.analysisStatus?.status === 'completed' || analysisResults;

  // Helper function to render money amounts
  const renderMoney = (amount: MoneyAmount) => amount.displayText;

  // Helper function to render key-value pairs
  const renderKeyValuePair = (pair: KeyValuePair) => (
    <div
      key={pair.label}
      className={`flex justify-between items-center p-3 rounded-lg ${
        pair.highlight ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
      }`}
    >
      <span className="text-sm text-muted-foreground">{pair.label}</span>
      <span className={pair.highlight ? 'font-bold text-primary' : 'font-medium'}>{pair.value}</span>
    </div>
  );

  // Helper function to get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Helper function to get recommendation color
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'bg-green-50 border-green-200';
      case 'recommended':
        return 'bg-blue-50 border-blue-200';
      case 'proceed_with_caution':
        return 'bg-yellow-50 border-yellow-200';
      case 'not_recommended':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Helper function to get recommendation text
  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'Highly Recommended';
      case 'recommended':
        return 'Recommended';
      case 'proceed_with_caution':
        return 'Proceed with Caution';
      case 'not_recommended':
        return 'Not Recommended';
      default:
        return recommendation;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/tenderiq')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analyze Tender</h1>
              <p className="text-muted-foreground mt-1">
                {tenderLoading
                  ? 'Loading tender details...'
                  : tender
                  ? tender.title
                  : analysisResults?.tenderInfo.title || 'Analysis Results'}
              </p>
            </div>
          </div>
          {isAnalysisComplete && (
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          )}
        </div>

        {/* Error State */}
        {tenderError && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{tenderError}</p>
            </div>
          </Card>
        )}

        {/* Loading Tender */}
        {tenderLoading && (
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading tender details...</p>
            </div>
          </Card>
        )}

        {/* Start Analysis Button */}
        {!tenderLoading && tender && !analysis.analysisId && !isAnalysisComplete && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Start AI-powered analysis of this tender to get comprehensive insights including risk assessment,
                  scope extraction, financial analysis, and more.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => analysis.startAnalysis()}
                disabled={analysis.isInitiating}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {analysis.isInitiating ? 'Starting Analysis...' : 'Start Analysis'}
              </Button>
            </div>
          </Card>
        )}

        {/* Analysis Loading Progress */}
        {(analysis.isPolling || analysis.analysisStatus?.status === 'in_progress') && (
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI Analysis in Progress</h3>
              <p className="text-sm text-muted-foreground">
                {analysis.currentStep || 'Processing tender documents...'}
              </p>
              <Progress value={analysis.progress} className="w-full max-w-md" />
              <p className="text-xs text-muted-foreground">{analysis.progress}% Complete</p>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {isAnalysisComplete && analysisResults && (
          <>
            {/* Tender Info Header */}
            <Card className="p-6 border-2 border-primary/20 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Tender Reference</p>
                      <p className="font-bold text-lg">{analysisResults.tenderInfo.referenceNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Project Title</p>
                      <p className="font-semibold">{analysisResults.tenderInfo.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Issuing Organization</p>
                      <p className="font-medium">{analysisResults.tenderInfo.issuingOrganization}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Project Location</p>
                      <p className="font-medium">
                        {analysisResults.tenderInfo.projectLocation.state}
                        {analysisResults.tenderInfo.projectLocation.city && `, ${analysisResults.tenderInfo.projectLocation.city}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Estimated Value</p>
                      <p className="font-bold text-lg text-primary">
                        {renderMoney(analysisResults.tenderInfo.estimatedValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">{analysisResults.tenderInfo.tenderType}</Badge>
                    <Badge
                      variant={analysisResults.tenderInfo.status === 'active' ? 'default' : 'secondary'}
                    >
                      {analysisResults.tenderInfo.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="one-pager" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="one-pager">One Pager</TabsTrigger>
                <TabsTrigger value="scope">Scope of Work</TabsTrigger>
                <TabsTrigger value="rfp-sections">RFP Sections</TabsTrigger>
                <TabsTrigger value="data-sheet">Data Sheet</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              </TabsList>

              {/* ======================== ONE PAGER TAB ======================== */}
              <TabsContent value="one-pager" className="space-y-6">
                {/* Project Overview */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Project Overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysisResults.onePager.projectOverview.description}
                  </p>
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Key Highlights</h4>
                    <ul className="space-y-2">
                      {analysisResults.onePager.projectOverview.keyHighlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                {/* Financial Requirements */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Contract Value</p>
                        <p className="text-2xl font-bold text-primary">
                          {renderMoney(analysisResults.onePager.financialRequirements.contractValue)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">
                          EMD Amount ({analysisResults.onePager.financialRequirements.emdPercentage}%)
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {renderMoney(analysisResults.onePager.financialRequirements.emdAmount)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs text-muted-foreground mb-1">
                          Performance Bank Guarantee ({analysisResults.onePager.financialRequirements.pbgPercentage}%)
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {renderMoney(analysisResults.onePager.financialRequirements.performanceBankGuarantee)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Tender Document Fee</p>
                        <p className="font-semibold">
                          {renderMoney(analysisResults.onePager.financialRequirements.tenderDocumentFee)}
                        </p>
                      </div>
                      {analysisResults.onePager.financialRequirements.processingFee && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Processing Fee</p>
                          <p className="font-semibold">
                            {renderMoney(analysisResults.onePager.financialRequirements.processingFee)}
                          </p>
                        </div>
                      )}
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Total Upfront Cost</p>
                        <p className="text-xl font-bold text-green-700">
                          {renderMoney(analysisResults.onePager.financialRequirements.totalUpfrontCost)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Eligibility Highlights */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Eligibility Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Minimum Experience</p>
                        <p className="font-semibold">{analysisResults.onePager.eligibilityHighlights.minimumExperience}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Minimum Turnover</p>
                        <p className="font-semibold">
                          {renderMoney(analysisResults.onePager.eligibilityHighlights.minimumTurnover)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Similar Projects Required</p>
                        <p className="font-semibold">
                          {analysisResults.onePager.eligibilityHighlights.requiredSimilarProjects.count} projects worth{' '}
                          {renderMoney(analysisResults.onePager.eligibilityHighlights.requiredSimilarProjects.minimumValue)}{' '}
                          each in {analysisResults.onePager.eligibilityHighlights.requiredSimilarProjects.timePeriod}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs text-muted-foreground mb-3 font-semibold">Special Relaxations</p>
                        <ul className="space-y-2">
                          {analysisResults.onePager.eligibilityHighlights.specialRelaxations.map((relaxation, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>{relaxation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Key Dates */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Key Dates & Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResults.onePager.keyDates.prebidMeeting && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Pre-bid Meeting</p>
                        <p className="font-semibold">
                          {new Date(analysisResults.onePager.keyDates.prebidMeeting).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs text-muted-foreground mb-1 font-semibold">Bid Submission Deadline</p>
                      <p className="font-bold text-red-700">
                        {new Date(analysisResults.onePager.keyDates.bidSubmissionDeadline).toLocaleDateString(
                          'en-IN',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Technical Evaluation</p>
                      <p className="font-semibold">
                        {new Date(analysisResults.onePager.keyDates.technicalEvaluation).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Financial Bid Opening</p>
                      <p className="font-semibold">
                        {new Date(analysisResults.onePager.keyDates.financialBidOpening).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {analysisResults.onePager.keyDates.expectedAwardDate && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Expected Award Date</p>
                        <p className="font-semibold">
                          {new Date(analysisResults.onePager.keyDates.expectedAwardDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    )}
                    {analysisResults.onePager.keyDates.projectStartDate && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Project Start Date</p>
                        <p className="font-semibold">
                          {new Date(analysisResults.onePager.keyDates.projectStartDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Project Duration</p>
                      <p className="text-lg font-bold text-blue-700">
                        {analysisResults.onePager.keyDates.projectDuration.displayText}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Risk Factors */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Factors
                  </h3>
                  <div className="mb-4">
                    <Badge
                      variant={
                        analysisResults.onePager.riskFactors.level === 'high'
                          ? 'destructive'
                          : analysisResults.onePager.riskFactors.level === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      Overall Risk Level: {analysisResults.onePager.riskFactors.level}
                    </Badge>
                  </div>
                  <ul className="space-y-2">
                    {analysisResults.onePager.riskFactors.factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm p-3 bg-muted/30 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Competitive Analysis */}
                {analysisResults.onePager.competitiveAnalysis && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Competitive Analysis</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Estimated Competition</p>
                        <p className="font-semibold">{analysisResults.onePager.competitiveAnalysis.estimatedBidders}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Complexity</p>
                        <Badge variant="outline">{analysisResults.onePager.competitiveAnalysis.complexity}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-3 font-semibold">Entry Barriers</p>
                        <ul className="space-y-2">
                          {analysisResults.onePager.competitiveAnalysis.barriers.map((barrier, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span>{barrier}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* ======================== SCOPE OF WORK TAB ======================== */}
              <TabsContent value="scope" className="space-y-6">
                {/* Project Details */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderKeyValuePair({
                      label: 'Project Name',
                      value: analysisResults.scopeOfWork.projectDetails.projectName,
                    })}
                    {renderKeyValuePair({
                      label: 'Location',
                      value: analysisResults.scopeOfWork.projectDetails.location,
                    })}
                    {analysisResults.scopeOfWork.projectDetails.totalLength &&
                      renderKeyValuePair({
                        label: 'Total Length',
                        value: analysisResults.scopeOfWork.projectDetails.totalLength,
                      })}
                    {analysisResults.scopeOfWork.projectDetails.totalArea &&
                      renderKeyValuePair({
                        label: 'Total Area',
                        value: analysisResults.scopeOfWork.projectDetails.totalArea,
                      })}
                    {renderKeyValuePair({
                      label: 'Duration',
                      value: analysisResults.scopeOfWork.projectDetails.duration,
                      type: 'duration',
                      highlight: true,
                    })}
                    {renderKeyValuePair({
                      label: 'Contract Value',
                      value: analysisResults.scopeOfWork.projectDetails.contractValue,
                      type: 'money',
                      highlight: true,
                    })}
                  </div>
                </Card>

                {/* Work Packages */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Work Packages</h3>
                  <div className="space-y-4">
                    {analysisResults.scopeOfWork.workPackages.map((pkg: WorkPackage, pkgIdx: number) => (
                      <Card key={pkg.id} className="p-4 border-l-4 border-primary">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold text-lg">
                              {pkg.id} - {pkg.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                          </div>
                          {pkg.estimatedDuration && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Est. Duration: </span>
                              <span className="font-semibold">{pkg.estimatedDuration}</span>
                            </p>
                          )}
                          {pkg.dependencies && pkg.dependencies.length > 0 && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Dependencies: </span>
                              <span className="font-semibold">{pkg.dependencies.join(', ')}</span>
                            </p>
                          )}
                          <div className="mt-3">
                            <p className="text-sm font-semibold mb-2">Components:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {pkg.components.map((comp, compIdx) => (
                                <div key={compIdx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                  <p className="font-medium">{comp.item}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                                  {(comp.quantity || comp.unit || comp.specifications) && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {comp.quantity && `Qty: ${comp.quantity} ${comp.unit || ''}`}
                                      {comp.specifications && ` | ${comp.specifications}`}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Technical Specifications */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Technical Specifications</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Standards</h4>
                      <ul className="space-y-2">
                        {analysisResults.scopeOfWork.technicalSpecifications.standards.map((std, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{std}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Quality Requirements</h4>
                      <ul className="space-y-2">
                        {analysisResults.scopeOfWork.technicalSpecifications.qualityRequirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Materials Specification</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {analysisResults.scopeOfWork.technicalSpecifications.materialsSpecification.map((mat, i) => (
                          <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                            <p className="font-semibold">{mat.material}</p>
                            <p className="text-xs text-muted-foreground mt-1">{mat.specification}</p>
                            {mat.source && (
                              <p className="text-xs text-muted-foreground mt-1">Source: {mat.source}</p>
                            )}
                            {mat.testingStandard && (
                              <p className="text-xs text-muted-foreground mt-1">Testing: {mat.testingStandard}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Testing Requirements</h4>
                      <ul className="space-y-2">
                        {analysisResults.scopeOfWork.technicalSpecifications.testingRequirements.map((test, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-2 bg-muted/30 rounded">
                            <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>{test}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Deliverables */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Deliverables</h3>
                  <div className="space-y-3">
                    {analysisResults.scopeOfWork.deliverables.map((del, i) => (
                      <div key={i} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckSquare className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold">{del.item}</p>
                            <p className="text-sm text-muted-foreground mt-1">{del.description}</p>
                            {del.timeline && (
                              <p className="text-xs text-muted-foreground mt-2">Timeline: {del.timeline}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Exclusions */}
                {analysisResults.scopeOfWork.exclusions && analysisResults.scopeOfWork.exclusions.length > 0 && (
                  <Card className="p-6 space-y-4 border-l-4 border-orange-400">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Exclusions (Not Included)
                    </h3>
                    <ul className="space-y-2">
                      {analysisResults.scopeOfWork.exclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 bg-orange-50 rounded">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </TabsContent>

              {/* ======================== RFP SECTIONS TAB ======================== */}
              <TabsContent value="rfp-sections" className="space-y-6">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">RFP Section Analysis</h3>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export (Excel)
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {analysisResults.rfpSections.map((section: RFPSection, idx: number) => (
                      <Card key={idx} className="p-5 border-l-4 border-primary">
                        <div className="space-y-4">
                          {/* Section Header */}
                          <div>
                            <h4 className="text-lg font-bold">
                              Section {section.sectionNumber}: {section.sectionName}
                            </h4>
                          </div>

                          {/* Summary */}
                          <div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{section.summary}</p>
                          </div>

                          {/* Key Points */}
                          <div>
                            <p className="font-semibold text-sm mb-2">Key Points</p>
                            <ul className="space-y-1">
                              {section.keyPoints.map((point, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Critical Requirements */}
                          <div>
                            <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              Critical Requirements
                            </p>
                            <ul className="space-y-1">
                              {section.criticalRequirements.map((req, i) => (
                                <li key={i} className="text-sm flex items-start gap-2 p-2 bg-red-50 rounded">
                                  <CheckSquare className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Considerations */}
                            <div>
                              <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                                <Info className="h-4 w-4 text-blue-600" />
                                Considerations
                              </p>
                              <ul className="space-y-1">
                                {section.considerations.map((cons, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>{cons}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Risks */}
                            <div>
                              <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                Section Risks
                              </p>
                              <ul className="space-y-1">
                                {section.risks.map((risk, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Items */}
                          <div>
                            <p className="font-semibold text-sm mb-2">Action Items</p>
                            <ul className="space-y-1">
                              {section.actionItems.map((action, i) => (
                                <li key={i} className="text-sm flex items-start gap-2 p-2 bg-blue-50 rounded">
                                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Required Documents */}
                          <div>
                            <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                              <FileCode className="h-4 w-4 text-purple-600" />
                              Required Documents
                            </p>
                            <ul className="space-y-1">
                              {section.documents.map((doc, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* ======================== DATA SHEET TAB ======================== */}
              <TabsContent value="data-sheet" className="space-y-6">
                {/* Project Information */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Project Information</h3>
                  <div className="space-y-2">
                    {analysisResults.dataSheet.projectInformation.map((item: KeyValuePair) =>
                      renderKeyValuePair(item)
                    )}
                  </div>
                </Card>

                {/* Contract Details */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Contract Details</h3>
                  <div className="space-y-2">
                    {analysisResults.dataSheet.contractDetails.map((item: KeyValuePair) =>
                      renderKeyValuePair(item)
                    )}
                  </div>
                </Card>

                {/* Financial Details */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Financial Details</h3>
                  <div className="space-y-2">
                    {analysisResults.dataSheet.financialDetails.map((item: KeyValuePair) =>
                      renderKeyValuePair(item)
                    )}
                  </div>
                </Card>

                {/* Technical Summary */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Technical Summary</h3>
                  <div className="space-y-2">
                    {analysisResults.dataSheet.technicalSummary.map((item: KeyValuePair) =>
                      renderKeyValuePair(item)
                    )}
                  </div>
                </Card>

                {/* Important Dates */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Important Dates</h3>
                  <div className="space-y-2">
                    {analysisResults.dataSheet.importantDates.map((item: KeyValuePair) =>
                      renderKeyValuePair(item)
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* ======================== TEMPLATES TAB ======================== */}
              <TabsContent value="templates" className="space-y-6">
                {/* Bid Submission Forms */}
                {analysisResults.templates.bidSubmissionForms.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Bid Submission Forms</h3>
                    <div className="space-y-3">
                      {analysisResults.templates.bidSubmissionForms.map((template: TemplateItem) => (
                        <Card key={template.id} className="p-4 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold">{template.name}</h4>
                                {template.mandatory && (
                                  <Badge variant="destructive" className="ml-auto">
                                    Mandatory
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline">{template.format}</Badge>
                                <span className="text-muted-foreground">{template.annex}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Financial Formats */}
                {analysisResults.templates.financialFormats.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Financial Formats</h3>
                    <div className="space-y-3">
                      {analysisResults.templates.financialFormats.map((template: TemplateItem) => (
                        <Card key={template.id} className="p-4 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold">{template.name}</h4>
                                {template.mandatory && (
                                  <Badge variant="destructive" className="ml-auto">
                                    Mandatory
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline">{template.format}</Badge>
                                <span className="text-muted-foreground">{template.annex}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Technical Documents */}
                {analysisResults.templates.technicalDocuments.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Technical Documents</h3>
                    <div className="space-y-3">
                      {analysisResults.templates.technicalDocuments.map((template: TemplateItem) => (
                        <Card key={template.id} className="p-4 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileCode className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold">{template.name}</h4>
                                {template.mandatory && (
                                  <Badge variant="destructive" className="ml-auto">
                                    Mandatory
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline">{template.format}</Badge>
                                <span className="text-muted-foreground">{template.annex}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Compliance Formats */}
                {analysisResults.templates.complianceFormats.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Compliance Formats</h3>
                    <div className="space-y-3">
                      {analysisResults.templates.complianceFormats.map((template: TemplateItem) => (
                        <Card key={template.id} className="p-4 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckSquare className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold">{template.name}</h4>
                                {template.mandatory && (
                                  <Badge variant="destructive" className="ml-auto">
                                    Mandatory
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline">{template.format}</Badge>
                                <span className="text-muted-foreground">{template.annex}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* ======================== AI INSIGHTS TAB ======================== */}
              <TabsContent value="ai-insights" className="space-y-6">
                {/* Bid Decision Recommendation */}
                <Card
                  className={`p-6 border-2 ${getRecommendationColor(
                    analysisResults.aiInsights.bidDecisionRecommendation.recommendation
                  )}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Bid Decision Recommendation</h3>
                      <div className="text-right">
                        <Badge
                          variant={
                            analysisResults.aiInsights.bidDecisionRecommendation.recommendation ===
                            'highly_recommended'
                              ? 'default'
                              : analysisResults.aiInsights.bidDecisionRecommendation.recommendation === 'recommended'
                              ? 'secondary'
                              : analysisResults.aiInsights.bidDecisionRecommendation.recommendation ===
                                'proceed_with_caution'
                              ? 'destructive'
                              : 'destructive'
                          }
                        >
                          {getRecommendationText(
                            analysisResults.aiInsights.bidDecisionRecommendation.recommendation
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">AI Score:</span>
                        <span className="text-2xl font-bold text-primary">
                          {analysisResults.aiInsights.bidDecisionRecommendation.score}/100
                        </span>
                      </div>
                      <Progress
                        value={analysisResults.aiInsights.bidDecisionRecommendation.score}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-3">Reasoning:</p>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.bidDecisionRecommendation.reasoning.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* SWOT Analysis */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">SWOT Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.strengthsWeaknessesAnalysis.strengths.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.strengthsWeaknessesAnalysis.weaknesses.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Opportunities
                      </h4>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.strengthsWeaknessesAnalysis.opportunities.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Threats */}
                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Threats
                      </h4>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.strengthsWeaknessesAnalysis.threats.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Competitive Intelligence */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Competitive Intelligence</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2">Estimated Competition</p>
                      <p className="font-semibold">
                        {analysisResults.aiInsights.competitiveIntelligence.estimatedCompetition}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Competitive Advantages
                      </p>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.competitiveIntelligence.competitiveAdvantages.map(
                          (adv, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-2 bg-green-50 rounded">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{adv}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Competitive Challenges
                      </p>
                      <ul className="space-y-2">
                        {analysisResults.aiInsights.competitiveIntelligence.competitiveChallenges.map((ch, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-2 bg-red-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{ch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Risk Assessment */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Detailed Risk Assessment</h3>
                  <div className="space-y-3">
                    {analysisResults.aiInsights.riskAssessment.map((risk: RiskItem, i: number) => (
                      <Card key={i} className="p-4 border-l-4 border-orange-400">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              {getSeverityIcon(risk.severity)}
                              {risk.risk}
                            </h4>
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  risk.severity === 'critical'
                                    ? 'destructive'
                                    : risk.severity === 'high'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {risk.severity}
                              </Badge>
                              <Badge variant="outline">P: {risk.probability}</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <span className="font-semibold">Impact:</span> {risk.impact}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-semibold text-blue-900">Mitigation:</span>
                            </p>
                            <p className="text-sm text-blue-900">{risk.mitigation}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Compliance Checklist */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Compliance Checklist</h3>
                  <div className="space-y-3">
                    {analysisResults.aiInsights.complianceChecklist.map((item: ComplianceItem, i: number) => (
                      <Card key={i} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-sm">{item.requirement}</h4>
                            <Badge
                              variant={
                                item.status === 'compliant'
                                  ? 'secondary'
                                  : item.status === 'non_compliant'
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                          <Badge variant="outline" className="text-xs">
                            Priority: {item.priority}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Estimated Costs */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estimated Costs Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Upfront Costs</p>
                      <p className="text-2xl font-bold text-primary">
                        {renderMoney(analysisResults.aiInsights.estimatedCosts.upfrontCosts)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-xs text-muted-foreground mb-1">Estimated Project Costs</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {renderMoney(analysisResults.aiInsights.estimatedCosts.estimatedProjectCosts)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="text-xs text-muted-foreground mb-1">Contingency (10%)</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {renderMoney(analysisResults.aiInsights.estimatedCosts.contingency)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs text-muted-foreground mb-1">Total Estimated</p>
                      <p className="text-2xl font-bold text-green-700">
                        {renderMoney(analysisResults.aiInsights.estimatedCosts.totalEstimated)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-3">Cost Breakdown by Category</p>
                    <div className="space-y-2">
                      {analysisResults.aiInsights.estimatedCosts.breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-semibold">{renderMoney(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Win Probability */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Win Probability Analysis
                  </h3>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Overall Win Score:</span>
                      <span className="text-3xl font-bold text-primary">
                        {analysisResults.aiInsights.winProbability.score}%
                      </span>
                    </div>
                    <Progress value={analysisResults.aiInsights.winProbability.score} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    {analysisResults.aiInsights.winProbability.factors.map((factor: WinFactor, i: number) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          factor.impact === 'positive'
                            ? 'bg-green-50 border-green-200'
                            : factor.impact === 'negative'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {factor.impact === 'positive' && (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                            {factor.impact === 'negative' && (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            {factor.impact === 'neutral' && (
                              <Minus className="h-4 w-4 text-gray-600" />
                            )}
                            {factor.factor}
                          </h4>
                          <Badge variant="outline">Weight: {factor.weight}/10</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
