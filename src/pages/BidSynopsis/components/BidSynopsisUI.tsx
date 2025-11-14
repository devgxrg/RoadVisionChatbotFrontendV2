import { Download, Save, RefreshCw, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { SynopsisContent } from '@/lib/types/bidsynopsis.types';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

interface BidSynopsisUIProps {
  tenderTitle?: string;
  synopsisContent: SynopsisContent;
  ceigallData: Record<number, string>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCeigallChange: (index: number, value: string) => void;
  onSave: () => void;
  onExportPDF: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BidSynopsisUI({
  tenderTitle,
  synopsisContent,
  ceigallData,
  activeTab,
  onTabChange,
  onCeigallChange,
  onSave,
  onExportPDF,
  onFileUpload,
}: BidSynopsisUIProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef })

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bid Synopsis</h1>
            <p className="text-muted-foreground mt-1">
              {tenderTitle || 'Create comprehensive bid summary'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reactToPrintFn}>
              <Download className="h-4 w-4 mr-2" />
              Export To PDF
            </Button>
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Document Upload Section
        <Card className="p-6 bg-muted/50">
          <div className="flex items-center gap-4">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="font-medium">Upload Tender Documents</h3>
              <p className="text-sm text-muted-foreground">Upload NIT, RFP, BOQ, or other tender documents to extract information</p>
            </div>
            <div>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={onFileUpload}
                className="max-w-xs"
              />
            </div>
          </div>
        </Card>
        */}

        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 w-16">S.No</th>
                        <th className="text-left p-3 w-48">ITEM</th>
                        <th className="text-left p-3">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {synopsisContent.basicInfo.map((item) => (
                        <tr key={item.sno} className="border-b">
                          <td className="p-3">{item.sno}</td>
                          <td className="p-3 font-medium">{item.item}</td>
                          <td className="p-3">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="ghost" size="sm" className="mt-2">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Regenerate Section
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Qualification Criteria, Similar Work & Financial Capacity</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 w-40">DESCRIPTION</th>
                        <th className="text-left p-3">REQUIREMENT</th>
                        <th className="text-left p-3 w-32">Requirement</th>
                        <th className="text-left p-3 w-48">CEIGALL INDIA LIMITED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {synopsisContent.allRequirements.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-3 align-top font-medium">{item.description}</td>
                          <td className="p-3 align-top">{item.requirement}</td>
                          <td className="p-3 align-top">
                            <Input
                              placeholder="Extracted value"
                              className="text-sm h-8"
                              disabled
                            />
                          </td>
                          <td className="p-3 align-top">
                            <Input
                              placeholder="Enter your data"
                              value={ceigallData[idx] || item.ceigallValue}
                              onChange={(e) => onCeigallChange(idx, e.target.value)}
                              className="text-sm h-8 font-semibold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Button variant="ghost" size="sm" className="mt-2">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Regenerate Section
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-info/5 border-info/20">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Version History</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 versions saved • Last edited 2 minutes ago
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="p-8 bg-white dark:bg-background">
              <div className="max-w-5xl mx-auto space-y-8 p-6" ref={contentRef}>
                {/* Header */}
                <div className="text-center border-foreground">
                  <h1 className="text-2xl font-bold mb-4">BID SYNOPSIS</h1>
                </div>

                {/* Basic Information Table */}
                <div>
                  <table className="w-full text-sm border-2 border-foreground">
                    <thead>
                      <tr className="border-b-2 border-foreground bg-slate-400">
                        <th className="text-left p-3 border-r-2 border-foreground font-bold w-16">S.No</th>
                        <th className="text-left p-3 border-r-2 border-foreground font-bold w-48">ITEM</th>
                        <th className="text-left p-3 font-bold">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {synopsisContent.basicInfo.map((item, idx) => (
                        <tr key={item.sno} className={idx < synopsisContent.basicInfo.length - 1 ? 'border-b border-foreground' : ''}>
                          <td className="p-3 border-r-2 border-foreground align-top">{item.sno}.</td>
                          <td className="p-3 border-r-2 border-foreground align-top font-medium">{item.item}</td>
                          <td className="p-3 align-top">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Qualification Criteria, Similar Work & Financial Capacity - Unified Table */}
                <div className="page-break-before">
                  <h2 className="text-2xl font-bold mb-4 text-center">QUALIFICATION CRITERIA</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-2 border-foreground">
                      <thead>
                        <tr className="border-b-2 border-foreground bg-slate-400">
                          <th className="text-left p-2 border-r-2 border-foreground font-bold align-top" style={{width: '15%'}}>DESCRIPTION</th>
                          <th className="text-left p-2 border-r-2 border-foreground font-bold align-top" style={{width: '50%'}}>REQUIREMENT</th>
                          <th className="text-left p-2 border-r-2 border-foreground font-bold align-top" style={{width: '10%'}}>Requirement</th>
                          <th className="text-left p-2 font-bold align-top" style={{width: '25%'}}>CEIGALL INDIA LIMITED</th>
                        </tr>
                      </thead>
                      <tbody>
                        {synopsisContent.allRequirements.map((item, idx) => (
                          <tr key={idx} className={idx < synopsisContent.allRequirements.length - 1 ? 'border-b border-foreground' : ''}>
                            <td className="p-2 border-r-2 border-foreground align-top font-semibold">{item.description}</td>
                            <td className="p-2 border-r-2 border-foreground align-top leading-relaxed">{item.requirement}</td>
                            <td className="p-2 border-r-2 border-foreground align-top"></td>
                            <td className="p-2 align-top font-semibold">{ceigallData[idx] || item.ceigallValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground pt-8 border-t-2 border-foreground">
                  <p className="font-semibold">Generated by TenderIQ AI</p>
                  <p className="mt-1">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
