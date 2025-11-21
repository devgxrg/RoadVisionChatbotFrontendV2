import { DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { OnePagerData } from '@/lib/types/analyze.type';

interface OnePagerProps {
  onePager: OnePagerData;
}

export default function OnePager({ onePager }: OnePagerProps) {
  // Handle cases where onePager is undefined or null
  if (!onePager) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">One-pager data is not available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      {onePager.project_overview && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Project Overview</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {onePager.project_overview}
          </p>
        </Card>
      )}

      {/* Financial Requirements */}
      {onePager.financial_requirements && onePager.financial_requirements.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Requirements
          </h3>
          <ul className="space-y-2">
            {onePager.financial_requirements.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Eligibility Highlights */}
      {onePager.eligibility_highlights && onePager.eligibility_highlights.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Eligibility Highlights</h3>
          <ul className="space-y-2">
            {onePager.eligibility_highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Key Dates */}
      {onePager.important_dates && onePager.important_dates.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </h3>
          <ul className="space-y-2">
            {onePager.important_dates.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Risk Analysis */}
      {onePager.risk_analysis?.summary && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Analysis
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {onePager.risk_analysis.summary}
          </p>
        </Card>
      )}
    </div>
  );
}
