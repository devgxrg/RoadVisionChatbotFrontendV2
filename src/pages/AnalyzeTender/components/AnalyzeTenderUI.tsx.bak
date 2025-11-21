import { ArrowLeft, AlertTriangle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenderAnalysisResponse } from '@/lib/types/analyze.type';
import OnePager from './OnePager';
import ScopeOfWork from './ScopeOfWork';
import RFPSections from './RFPSections';
import DataSheet from './DataSheet';
import Templates from './Templates';

interface AnalyzeTenderUIProps {
  analysis: TenderAnalysisResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
}

export default function AnalyzeTenderUI({
  analysis,
  isLoading,
  isError,
  error,
  activeTab,
  onTabChange,
  onBack,
}: AnalyzeTenderUIProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analyze Tender</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading
                  ? 'Loading analysis...'
                  : analysis
                    ? `Status: ${analysis.status}`
                    : 'Analysis Results'}
              </p>
            </div>
          </div>
          {analysis && (
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          )}
        </div>

        {/* Error State */}
        {isError && error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading tender analysis...</p>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="one-pager">One Pager</TabsTrigger>
              <TabsTrigger value="scope" disabled={analysis.scope_of_work === null}>Scope of Work</TabsTrigger>
              <TabsTrigger value="sections" disabled={analysis.rfp_sections === null}>RFP Sections</TabsTrigger>
              <TabsTrigger value="datasheet" disabled={analysis.data_sheet === null}>Data Sheet</TabsTrigger>
              <TabsTrigger value="templates" disabled={analysis.templates === null}>Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="one-pager" className="mt-6">
              <OnePager onePager={analysis.one_pager} />
            </TabsContent>

            <TabsContent value="scope" className="mt-6">
              <ScopeOfWork scopeOfWork={analysis.scope_of_work} />
            </TabsContent>

            <TabsContent value="sections" className="mt-6">
              <RFPSections rfpSections={analysis.rfp_sections} />
            </TabsContent>

            <TabsContent value="datasheet" className="mt-6">
              <DataSheet dataSheet={analysis.data_sheet} />
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <Templates templates={analysis.templates} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
