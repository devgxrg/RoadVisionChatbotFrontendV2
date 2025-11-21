import { Download, Badge as BadgeIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplatesData, TemplateItem } from '@/lib/types/analyze.type';

interface TemplatesProps {
  templates: TemplatesData;
}

interface TemplateSection {
  title: string;
  templates: TemplateItem[];
}

export default function Templates({ templates }: TemplatesProps) {
  const templateSections: TemplateSection[] = [
    {
      title: 'Bid Submission Forms',
      templates: templates.bid_submission_forms || [],
    },
    {
      title: 'Financial Formats',
      templates: templates.financial_formats || [],
    },
    {
      title: 'Technical Documents',
      templates: templates.technical_documents || [],
    },
    {
      title: 'Compliance Formats',
      templates: templates.compliance_formats || [],
    },
  ];

  const formatIcon = (format: string) => {
    const icons: Record<string, string> = {
      pdf: '📄',
      excel: '📊',
      word: '📝',
      dwg: '🏗️',
    };
    return icons[format] || '📎';
  };

  const renderTemplateItem = (template: TemplateItem) => (
    <Card key={template.id} className="p-4 border hover:border-primary transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{formatIcon(template.format)}</span>
            <div>
              <h4 className="font-semibold">{template.name}</h4>
              <p className="text-xs text-muted-foreground">{template.annex}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
          <div className="flex items-center gap-2 text-xs">
            {template.mandatory ? (
              <Badge variant="destructive">Mandatory</Badge>
            ) : (
              <Badge variant="outline">Optional</Badge>
            )}
            <span className="text-muted-foreground uppercase tracking-wide">
              {template.format}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => template.downloadUrl && window.open(template.downloadUrl)}
          disabled={!template.downloadUrl}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {templateSections.map((section) => {
        if (!section.templates || section.templates.length === 0) return null;

        return (
          <div key={section.title} className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">
                {section.templates.filter((t) => t.mandatory).length} mandatory,{' '}
                {section.templates.filter((t) => !t.mandatory).length} optional
              </p>
            </div>
            <div className="grid gap-4">
              {section.templates.map((template) => renderTemplateItem(template))}
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <BadgeIcon className="h-5 w-5" />
          Template Submission Checklist
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Templates</p>
            <p className="text-2xl font-bold">
              {templateSections.reduce((acc, s) => acc + s.templates.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Mandatory Documents</p>
            <p className="text-2xl font-bold text-red-600">
              {templateSections.reduce(
                (acc, s) => acc + s.templates.filter((t) => t.mandatory).length,
                0
              )}
            </p>
          </div>
        </div>
        <p className="text-sm text-blue-900">
          Ensure all mandatory templates are filled correctly and attached with your bid submission.
        </p>
      </Card>
    </div>
  );
}
