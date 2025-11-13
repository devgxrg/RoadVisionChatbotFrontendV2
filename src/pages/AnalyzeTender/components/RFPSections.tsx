import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { RFPSectionsData } from '@/lib/types/analyze.type';

interface RFPSectionsProps {
  rfpSections: RFPSectionsData | null;
}

export default function RFPSections({ rfpSections }: RFPSectionsProps) {
  if (!rfpSections) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No RFP sections data available for this analysis.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold">RFP Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Sections</p>
            <p className="text-2xl font-bold">{rfpSections.rfp_summary.total_sections}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Requirements</p>
            <p className="text-2xl font-bold">{rfpSections.rfp_summary.total_requirements}</p>
          </div>
        </div>
      </Card>

      {/* RFP Sections */}
      <Card className="p-6 space-y-4">
        <h3 className="text-2xl font-bold">Detailed Sections</h3>
        <Accordion type="single" collapsible className="space-y-2">
          {rfpSections.sections.map((section, idx) => (
            <AccordionItem key={idx} value={`section-${idx}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-lg">{section.section_title}</p>
                      <p className="text-xs text-muted-foreground">{section.summary.substring(0, 60)}...</p>
                    </div>
                    {/*<Badge variant="outline" className="bg-blue-50">
                      {section.section_name}
                    </Badge>*/}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {/* Summary */}
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.summary}</p>
                  </div>

                  {/* Key Requirements */}
                  {section.key_requirements && section.key_requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Key Information</h4>
                      <ul className="space-y-2">
                        {section.key_requirements.map((req, ridx) => (
                          <li key={ridx} className="flex gap-3 text-sm">
                            <span className="text-green-600 font-bold">✓</span>
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compliance Issues */}
                  {section.compliance_issues && section.compliance_issues.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold mb-2 text-orange-800">Compliance Requirements to note</h4>
                      <ul className="space-y-2">
                        {section.compliance_issues.map((issue, iidx) => (
                          <li key={iidx} className="flex gap-3 text-sm">
                            <span className="text-orange-600 font-bold">⚠</span>
                            <span className="text-orange-900">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Page References */}
                  {section.page_references && section.page_references.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h4 className="font-semibold mb-2 text-blue-900 text-sm">Page References</h4>
                      <p className="text-sm text-blue-800">{section.page_references.join(' • ')}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">📋 Total Requirements:</span> All {rfpSections.rfp_summary.total_requirements} requirements across {rfpSections.rfp_summary.total_sections} sections must be met for a compliant bid.
        </p>
      </Card>
    </div>
  );
}
