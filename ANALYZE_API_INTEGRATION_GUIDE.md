# TenderIQ Analyze Module - API Integration Guide

This guide covers the integration of the TenderIQ Analyze API endpoints with the frontend application.

## Overview

The Analyze module provides comprehensive tender document analysis functionality through the `/api/v1/tenderiq/analyze/*` endpoints. The frontend includes:

- **Type Definitions** (`src/lib/types/analyze.ts`) - Full TypeScript types for all API responses
- **API Service** (`src/lib/api/analyze.ts`) - Service functions for all API endpoints
- **Custom Hook** (`src/hooks/useAnalyzeTender.ts`) - React hook managing analysis lifecycle

## Quick Start

### Basic Analysis Workflow

```typescript
import { useAnalyzeTender } from '@/hooks/useAnalyzeTender';

function MyComponent() {
  const { tenderId } = useParams();
  const {
    startAnalysis,
    analysisStatus,
    analysisResults,
    progress,
    currentStep,
    isLoading,
    error,
  } = useAnalyzeTender({ tenderId });

  return (
    <div>
      <button onClick={() => startAnalysis()}>
        Start Analysis
      </button>

      {isLoading && (
        <div>
          <p>{currentStep}</p>
          <ProgressBar value={progress} />
        </div>
      )}

      {analysisResults && (
        <div>
          <h2>Analysis Complete</h2>
          {/* Display results */}
        </div>
      )}

      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## File Structure

```
src/
├── lib/
│   ├── api/
│   │   └── analyze.ts                    # API service functions
│   └── types/
│       └── analyze.ts                    # TypeScript type definitions
├── hooks/
│   └── useAnalyzeTender.ts               # Analysis state management hook
└── components/
    └── tenderiq/
        ├── AnalyzeTender.tsx             # Main analyze page
        └── TenderAnalysisView.tsx        # Analysis results view
```

## API Endpoints

### Initiate Analysis
```typescript
POST /api/v1/tenderiq/analyze/tender/{tenderId}

// Request
const response = await initiateAnalysis(tenderId, {
  documentIds: ['uuid1', 'uuid2'],      // Optional
  analysisType: 'full',                 // Optional: 'full' | 'summary' | 'risk-only'
  includeRiskAssessment: true,
  includeRfpAnalysis: true,
  includeScopeOfWork: true,
});

// Returns: AnalysisInitiatedResponse
// - analysisId: string (UUID)
// - status: 'pending'
// - estimatedCompletionTime: number (ms)
```

### Check Status (Polling)
```typescript
GET /api/v1/tenderiq/analyze/status/{analysisId}

// Returns: AnalysisStatusResponse
// - status: 'pending' | 'processing' | 'completed' | 'failed'
// - progress: number (0-100)
// - currentStep: string
```

### Get Complete Results
```typescript
GET /api/v1/tenderiq/analyze/results/{analysisId}

// Returns: AnalysisResultsResponse
// - analysisId: string
// - status: string
// - results: AnalysisResults (contains all sub-analyses)
// - completedAt: ISO date-time
// - processingTimeMs: number
```

### Risk Assessment
```typescript
GET /api/v1/tenderiq/analyze/tender/{tenderId}/risks

// Query Parameters:
// - depth: 'summary' | 'detailed' (default: 'summary')
// - include_historical: boolean (default: false)

// Returns: RiskAssessmentResponse
// - overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
// - riskScore: number (0-100)
// - risks: RiskDetailResponse[]
```

### RFP Analysis
```typescript
GET /api/v1/tenderiq/analyze/tender/{tenderId}/rfp-sections

// Query Parameters:
// - section_number: string (optional, e.g., '1.1')
// - include_compliance: boolean (default: false)

// Returns: RFPAnalysisResponse
// - totalSections: number
// - sections: RFPSectionResponse[]
// - summary: RFPSectionSummaryResponse
```

### Scope of Work
```typescript
GET /api/v1/tenderiq/analyze/tender/{tenderId}/scope-of-work

// Returns: ScopeOfWorkResponse
// - scopeOfWork: ScopeOfWorkDetailResponse
//   - workItems: WorkItemResponse[]
//   - keyDeliverables: DeliverableResponse[]
//   - estimatedTotalEffort: number (days)
//   - estimatedTotalDuration: string
```

### One-Pager Generation
```typescript
POST /api/v1/tenderiq/analyze/tender/{tenderId}/one-pager

// Request
const response = await generateOnePager(tenderId, {
  format: 'markdown',                   // 'markdown' | 'html' | 'pdf'
  includeRiskAssessment: true,
  includeScopeOfWork: true,
  includeFinancials: true,
  maxLength: 800,
});

// Returns: OnePagerResponse
// - onePager: { content: string, format: string, generatedAt: string }
```

### Data Sheet Generation
```typescript
GET /api/v1/tenderiq/analyze/tender/{tenderId}/data-sheet

// Query Parameters:
// - format: 'json' | 'csv' | 'excel' (default: 'json')
// - include_analysis: boolean (default: true)

// Returns: DataSheetResponse
// - dataSheet: DataSheetContentResponse
//   - basicInfo, financialInfo, temporal, scope, analysis
```

### List Analyses
```typescript
GET /api/v1/tenderiq/analyze/analyses

// Query Parameters:
// - limit: number (default: 20, max: 100)
// - offset: number (default: 0)
// - status: string (optional, e.g., 'completed')
// - tender_id: UUID (optional)

// Returns: AnalysesListResponse
// - analyses: AnalysisListItemResponse[]
// - pagination: { total, limit, offset }
```

### Delete Analysis
```typescript
DELETE /api/v1/tenderiq/analyze/results/{analysisId}

// Returns: DeleteAnalysisResponse
// - success: boolean
// - message: string
```

## Using the Custom Hook

### Basic Usage
```typescript
const {
  // State
  analysisId,
  analysisStatus,
  analysisResults,
  riskAssessment,
  rfpAnalysis,
  scopeOfWork,
  onePager,
  dataSheet,

  // Loading & Error
  isInitiating,
  isPolling,
  isLoading,
  error,

  // Progress
  progress,
  currentStep,

  // Actions
  startAnalysis,
  pollStatus,
  fetchResults,
  fetchRisks,
  fetchRFP,
  fetchScope,
  generatePager,
  generateSheet,
  reset,
} = useAnalyzeTender({
  tenderId: '550e8400-e29b-41d4-a716-446655440000',
  autoStartAnalysis: false,    // Set to true to start automatically
  pollInterval: 2000,           // Polling interval in milliseconds
});
```

### Advanced Usage with Manual Control

```typescript
// Start analysis with custom options
await startAnalysis({
  analysisType: 'full',
  includeRiskAssessment: true,
  includeRfpAnalysis: true,
  includeScopeOfWork: true,
});

// Fetch specific analyses independently
await fetchRisks('detailed');
await fetchRFP('1.1');
await fetchScope();

// Generate documents
await generatePager({
  format: 'markdown',
  maxLength: 1000,
});

await generateSheet('json');

// Check status manually
await pollStatus();

// Fetch results when ready
await fetchResults();

// Reset state
reset();
```

## Type Definitions

### Key Types

```typescript
// Request
interface AnalyzeTenderRequest {
  documentIds?: string[];
  analysisType?: 'full' | 'summary' | 'risk-only';
  includeRiskAssessment?: boolean;
  includeRfpAnalysis?: boolean;
  includeScopeOfWork?: boolean;
}

// Status
interface AnalysisStatusResponse {
  analysisId: string;
  tenderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;           // 0-100
  currentStep: string;
  errorMessage?: string;
}

// Results
interface AnalysisResultsResponse {
  analysisId: string;
  tenderId: string;
  status: string;
  results: {
    summary?: SummaryResults;
    riskAssessment?: RiskAssessmentResponse;
    rfpAnalysis?: RFPAnalysisResponse;
    scopeOfWork?: ScopeOfWorkResponse;
    onePager?: OnePagerContent;
    dataSheet?: DataSheetContentResponse;
  };
  completedAt: string;
  processingTimeMs?: number;
}

// Risk
interface RiskAssessmentResponse {
  tenderId: string;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  risks: RiskDetailResponse[];
  analyzedAt: string;
}

interface RiskDetailResponse {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  mitigationStrategy?: string;
  recommendedAction?: string;
  relatedDocuments: string[];
}

// RFP
interface RFPAnalysisResponse {
  tenderId: string;
  totalSections: number;
  sections: RFPSectionResponse[];
  summary: RFPSectionSummaryResponse;
}

interface RFPSectionResponse {
  id: string;
  number: string;
  title: string;
  description: string;
  keyRequirements: string[];
  compliance?: RFPSectionComplianceResponse;
  estimatedComplexity: 'low' | 'medium' | 'high';
  relatedSections: string[];
  documentReferences: DocumentReferenceResponse[];
}

// Scope of Work
interface ScopeOfWorkResponse {
  tenderId: string;
  scopeOfWork: {
    description: string;
    workItems: WorkItemResponse[];
    keyDeliverables: DeliverableResponse[];
    estimatedTotalEffort: number;
    estimatedTotalDuration: string;
    keyDates: KeyDatesResponse;
  };
  analyzedAt: string;
}

interface WorkItemResponse {
  id: string;
  description: string;
  estimatedDuration: string;
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
}

interface DeliverableResponse {
  id: string;
  description: string;
  deliveryDate?: string;
  acceptanceCriteria: string[];
}

// One-Pager
interface OnePagerResponse {
  tenderId: string;
  onePager: {
    content: string;
    format: 'markdown' | 'html' | 'pdf';
    generatedAt: string;
  };
}

// Data Sheet
interface DataSheetResponse {
  tenderId: string;
  dataSheet: {
    basicInfo: BasicInfoResponse;
    financialInfo: FinancialInfoResponse;
    temporal: TemporalInfoResponse;
    scope: ScopeInfoResponse;
    analysis?: AnalysisInfoResponse;
  };
  generatedAt: string;
}
```

## Error Handling

All API functions throw errors when requests fail. Handle them appropriately:

```typescript
try {
  const response = await initiateAnalysis(tenderId, {});
} catch (error) {
  if (error instanceof Error) {
    console.error('Analysis failed:', error.message);
    // Handle error - show user message, etc.
  }
}
```

The custom hook manages errors automatically and displays toast notifications:

```typescript
const { error, isLoading } = useAnalyzeTender({ tenderId });

if (error) {
  return <p>Error: {error.message}</p>;
}
```

## Status Flow

```
┌─────────────┐
│   Pending   │ ← Analysis initiated
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Processing     │ ← Polling for updates (progress 0-99)
│ (Various Steps) │
└──────┬──────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
   ┌────────┐        ┌────────┐
   │Completed│        │ Failed │
   │         │        │        │
   └─────────┘        └────────┘
```

## Best Practices

### 1. Auto-Start with Polling
```typescript
const analysis = useAnalyzeTender({
  tenderId,
  autoStartAnalysis: true,  // Automatically start analysis
  pollInterval: 2000,       // Poll every 2 seconds
});

useEffect(() => {
  if (analysis.analysisStatus?.status === 'completed') {
    // Show completion message
  }
}, [analysis.analysisStatus?.status]);
```

### 2. Manual Control with Error Handling
```typescript
const [startClicked, setStartClicked] = useState(false);

const handleStartAnalysis = async () => {
  setStartClicked(true);
  try {
    await analysis.startAnalysis({
      analysisType: 'full',
    });
  } catch (err) {
    console.error('Failed to start analysis:', err);
  }
};
```

### 3. Fetching Specific Results
```typescript
useEffect(() => {
  if (analysis.analysisStatus?.status === 'completed') {
    // Fetch specific analyses as needed
    Promise.all([
      analysis.fetchRisks('detailed'),
      analysis.fetchRFP(),
      analysis.fetchScope(),
    ]);
  }
}, [analysis.analysisStatus?.status]);
```

### 4. Generating Documents
```typescript
const handleGenerateOnePager = async () => {
  await analysis.generatePager({
    format: 'markdown',
    includeRiskAssessment: true,
    includeScopeOfWork: true,
    includeFinancials: true,
    maxLength: 1000,
  });

  if (analysis.onePager) {
    // Display or download the one-pager
    downloadDocument(analysis.onePager.onePager.content);
  }
};
```

## Testing

### Mock API Responses
For testing without a live backend, you can mock the API functions:

```typescript
// __mocks__/lib/api/analyze.ts
export const initiateAnalysis = jest.fn(() =>
  Promise.resolve({
    analysisId: '123e4567-e89b-12d3-a456-426614174000',
    tenderId: 'tender-id',
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedCompletionTime: 30000,
  })
);
```

## Troubleshooting

### Analysis Stuck in Processing
1. Check network connectivity
2. Verify API server is running (`http://localhost:5000`)
3. Check browser console for error messages
4. Call `reset()` to clear state and retry

### No Results Returned
1. Ensure analysis status is 'completed'
2. Call `fetchResults()` explicitly
3. Check `analysisResults` object structure
4. Verify all required fields are present in response

### Polling Not Stopping
1. Ensure `isPolling` becomes false when status is 'completed'
2. Check that status query is properly configured
3. Manually call `reset()` if needed

## API Rate Limiting

- **Standard**: 100 requests per minute per user
- **Analysis endpoints**: 10 concurrent analyses per user
- **Bulk operations**: Contact support for higher limits

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Performance Considerations

1. **Polling Interval**: Default 2000ms balances responsiveness vs. API load
2. **Result Caching**: React Query caches results automatically
3. **Progress Updates**: UI updates only when progress value changes
4. **Network**: Use exponential backoff for retries (implemented in helper function)

## Next Steps

1. Integrate the hook into the `AnalyzeTender` page component
2. Create UI components for displaying analysis results
3. Add document download functionality for one-pagers and data sheets
4. Implement analysis history/dashboard
5. Add risk visualization components

## Support

For issues or questions about the API integration:
1. Check the OpenAPI spec at `http://localhost:5000/openapi.json`
2. Review error messages in browser console
3. Check network requests in browser DevTools
4. Verify authentication token is present in requests
