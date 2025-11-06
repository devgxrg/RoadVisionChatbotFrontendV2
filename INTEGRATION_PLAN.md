# TenderIQ UI Integration Plan

## Overview
This document outlines the integration of the teammate's TenderIQ component design and UI/UX into the main ceigall-suite codebase. The teammate has created a comprehensive design for:
- Tender Details Page (`/viewtender/:id`)
- Tender Analysis Page (`/analyze/:id`)
- Supporting components and pages

## Current State Analysis

### Existing Implementation
- **Live Tenders List**: Fully implemented with date filtering, category, location, and value filters
- **API Integration**: Date filtering endpoints implemented and working
- **Routing**: TenderIQ main module exists, needs new routes

### Teammate's Design Files Location
```
/home/autumn/Apache/roadvision/tenderiq/
├── TenderDetails.tsx
├── AnalyzeTender.tsx
├── Dashboard.tsx
├── Wishlist.tsx
├── CompareTenders.tsx
├── BidSynopsis.tsx
├── EvaluateBid.tsx
└── ui-and-flow-docs.md
```

## Integration Tasks

### Phase 1: Core Route Setup

#### Task 1.1: Create `/viewtender/:id` Route
**File**: `src/App.tsx` or main routing configuration

```typescript
// Add new route
<Route path="/viewtender/:id" element={<TenderDetails />} />
```

**Files Affected**:
- App.tsx - Add route

#### Task 1.2: Update "View Tender" Button Navigation
**File**: `src/components/tenderiq/LiveTenders.tsx` (line ~279)

Current:
```typescript
onClick={() => tender.driveUrl && window.open(tender.driveUrl, '_blank')}
```

Updated:
```typescript
onClick={() => navigate(`/viewtender/${tender.id}`)}
```

**Dependencies**: Import `useNavigate` from react-router-dom

---

### Phase 2: Component Integration

#### Task 2.1: Integrate TenderDetails Component
**Source**: `/home/autumn/Apache/roadvision/tenderiq/TenderDetails.tsx`
**Destination**: `src/pages/TenderDetails.tsx`

**Steps**:
1. Copy TenderDetails.tsx to src/pages/
2. Update imports:
   - `@/components/ui/...` paths should work as-is
   - Update `@/data/sampleTenders` imports
   - Ensure `@/hooks/use-toast` exists
3. Component expects:
   - `getTenderById(id)` function from sampleTenders.ts
   - `addToWishlist(id)` function
   - `isInWishlist(id)` function
4. Status colors: Align with existing theme (already using primary/success/warning/destructive)

#### Task 2.2: Create Sample Data Structure
**File**: `src/data/sampleTenders.ts`

**Required Structure**:
```typescript
export interface Tender {
  id: string;
  title: string;
  authority: string;
  value: number;
  dueDate: string;
  status: 'live' | 'analyzed' | 'won' | 'lost' | 'pending';
  category: string;
  emd: number;
  bidSecurity: number;
  location: string;
  length?: string;
  costPerKm?: number;
  documents: Document[];
  riskLevel?: 'high' | 'medium' | 'low';
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'excel';
  pages?: number;
  isAIGenerated?: boolean;
}
```

**Functions Needed**:
- `getTenderById(id: string): Tender | null`
- `addToWishlist(id: string): void`
- `removeFromWishlist(id: string): void`
- `isInWishlist(id: string): boolean`
- `getWishlistTenders(): Tender[]`

**Initial Data Source**:
- Convert API response tenders to this structure
- Create enriched sample data with documents and risk levels

#### Task 2.3: Integrate AnalyzeTender Component
**Source**: `/home/autumn/Apache/roadvision/tenderiq/AnalyzeTender.tsx`
**Destination**: `src/pages/AnalyzeTender.tsx`

**Steps**:
1. Copy component
2. Update imports for UI components
3. Component expects:
   - `getTenderById(id)` - same as Task 2.2
   - Routes to `/synopsis/:id` for next workflow step
4. Mock RFP sections provided in component - can be replaced with real API data

**Note**: This page has a workflow state (upload → analyzing → complete). The UI is mockup-ready.

---

### Phase 3: Navigation Integration

#### Task 3.1: Update TenderIQ Main Module Navigation
**File**: `src/pages/TenderIQ.tsx`

Current: Has module selection cards for sub-features
Update: Ensure "Live Tenders" card navigates to live tenders list, which now has working "View Tender" buttons

#### Task 3.2: Update LiveTenders Component Navigation
**File**: `src/components/tenderiq/LiveTenders.tsx`

Add import:
```typescript
import { useNavigate } from 'react-router-dom';
```

Update ViewTender button (line ~279):
```typescript
const navigate = useNavigate();

// Change from:
onClick={() => tender.driveUrl && window.open(tender.driveUrl, '_blank')}

// To:
onClick={() => navigate(`/viewtender/${tender.id}`)}
```

---

### Phase 4: Data Adaptation

#### Task 4.1: Map API Tender Structure to Sample Tender Structure

**Current API Response Structure** (from fetchFilteredTenders):
```typescript
{
  id: number,
  organization: string,
  tdrNumber: string,
  description: string,
  tenderValue: string,
  dueDate: string,
  location: string,
  category: string,
  scrapedDate: string,
  driveUrl?: string,
}
```

**Transform to Sample Tender**:
```typescript
// Create adapter function
const adaptApiTenderToSampleTender = (apiTender: Tender): SampleTender => ({
  id: apiTender.id.toString(),
  title: apiTender.description,
  authority: apiTender.organization,
  value: parseValue(apiTender.tenderValue),
  dueDate: apiTender.dueDate,
  status: 'live',
  category: apiTender.category,
  emd: 0, // From API if available
  bidSecurity: 0, // From API if available
  location: apiTender.location,
  documents: [], // Would come from separate API call
  riskLevel: 'medium' // Default or from analysis
})
```

#### Task 4.2: Enhance Sample Data with Documents
Sample tenders need documents array. Create mock documents for demo:
```typescript
documents: [
  { id: 'd1', name: 'RFP.pdf', type: 'pdf', pages: 45 },
  { id: 'd2', name: 'Technical_Spec.pdf', type: 'pdf', pages: 32 },
  { id: 'd3', name: 'BOQ.xlsx', type: 'excel' }
]
```

---

### Phase 5: Component Refactoring (Optional but Recommended)

The documentation suggests breaking down components for maintainability:

**TenderDetails Sub-Components**:
- TenderHeader.tsx
- TenderMetadata.tsx
- TenderQuickActions.tsx
- TenderDocuments.tsx
- TenderRiskAssessment.tsx

**AnalyzeTender Sub-Components**:
- AnalysisHeader.tsx
- DocumentUpload.tsx
- AnalysisProgress.tsx
- Tabs (OnePager, ScopeWork, RFPSections, DataSheet, Templates)

This is optional for MVP but important for maintenance.

---

## Integration Checklist

### Pre-Integration
- [ ] Review all files in /home/autumn/Apache/roadvision/tenderiq/
- [ ] Understand the Tender interface and required fields
- [ ] Check UI component compatibility (shadcn/ui)
- [ ] Review existing routes in App.tsx

### Phase 1: Routes
- [ ] Add `/viewtender/:id` route pointing to TenderDetails
- [ ] Add `/analyze/:id` route pointing to AnalyzeTender
- [ ] Update LiveTenders "View Tender" button to use new route

### Phase 2: Components
- [ ] Copy TenderDetails.tsx to src/pages/
- [ ] Copy AnalyzeTender.tsx to src/pages/
- [ ] Create src/data/sampleTenders.ts with all required functions
- [ ] Update all imports in copied components
- [ ] Copy other components as needed (Wishlist, CompareTenders, etc.)

### Phase 3: Data
- [ ] Create sample tender data in sampleTenders.ts
- [ ] Add documents to tender samples
- [ ] Implement data adapter if using API tenders
- [ ] Test data structure with TenderDetails page

### Phase 4: Integration
- [ ] Test navigation from LiveTenders → TenderDetails
- [ ] Test TenderDetails page loads with correct data
- [ ] Test Quick Actions navigation
- [ ] Test Wishlist functionality
- [ ] Test breadcrumb navigation

### Phase 5: Styling & Polish
- [ ] Verify colors match theme (status badges, risk levels)
- [ ] Test responsive design on mobile/tablet
- [ ] Check accessibility (keyboard nav, screen readers)
- [ ] Verify button states and hover effects

### Phase 6: Testing
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Build project: `npm run build`
- [ ] Test in browser at multiple breakpoints
- [ ] Test all navigation flows
- [ ] Verify all routes work

---

## File Structure After Integration

```
src/
├── components/
│   ├── tenderiq/
│   │   ├── LiveTenders.tsx (UPDATED)
│   │   ├── DateSelector.tsx
│   │   └── ...
│   └── ui/
├── pages/
│   ├── TenderIQ.tsx
│   ├── TenderDetails.tsx (NEW)
│   ├── AnalyzeTender.tsx (NEW)
│   ├── BidSynopsis.tsx (NEW)
│   ├── EvaluateBid.tsx (NEW)
│   ├── CompareTenders.tsx (NEW)
│   └── ...
├── data/
│   └── sampleTenders.ts (NEW)
├── lib/
│   ├── api/
│   │   └── tenderiq.ts
│   ├── types/
│   │   └── tenderiq.ts
│   └── ...
├── App.tsx (UPDATED)
└── ...
```

---

## Routing Map After Integration

```
/tenderiq/                          → TenderIQ (main module)
  ├── /live-tenders                 → LiveTenders list
  │   └── /viewtender/:id           → TenderDetails (NEW)
  │       ├── → /analyze/:id        → AnalyzeTender (NEW)
  │       ├── → /synopsis/:id       → BidSynopsis (NEW)
  │       └── → /evaluate/:id       → EvaluateBid (NEW)
  ├── /wishlist                     → Wishlist (NEW)
  └── /compare                      → CompareTenders (NEW)
```

---

## API Integration Points

The current design is mockup-ready with sample data. When connecting to real APIs:

### Tender Details Page APIs:
1. `GET /api/v1/tenderiq/tenders/:id` - Fetch specific tender details
2. `GET /api/v1/tenderiq/tenders/:id/documents` - Fetch tender documents
3. `POST /api/v1/wishlist/add` - Add tender to wishlist
4. `DELETE /api/v1/wishlist/:tenderId` - Remove from wishlist

### Analysis Submodule APIs (Under `/api/v1/tenderiq/analyze/`):
1. `POST /api/v1/tenderiq/analyze/tender/{tenderId}` - Initiate tender analysis
2. `GET /api/v1/tenderiq/analyze/results/{analysisId}` - Fetch analysis results
3. `GET /api/v1/tenderiq/analyze/status/{analysisId}` - Check analysis status
4. `GET /api/v1/tenderiq/analyze/tender/{tenderId}/risks` - Fetch risk assessment
5. `GET /api/v1/tenderiq/analyze/tender/{tenderId}/rfp-sections` - Fetch RFP analysis
6. `GET /api/v1/tenderiq/analyze/tender/{tenderId}/scope-of-work` - Fetch scope of work
7. `POST /api/v1/tenderiq/analyze/tender/{tenderId}/one-pager` - Generate one-pager
8. `GET /api/v1/tenderiq/analyze/tender/{tenderId}/data-sheet` - Generate data sheet
9. `GET /api/v1/tenderiq/analyze/analyses` - List recent analyses
10. `DELETE /api/v1/tenderiq/analyze/results/{analysisId}` - Delete analysis

*See `TENDERIQ_ANALYZE_API_SUGGESTIONS.md` for detailed specification.*

---

## Known Considerations

1. **Sample Data**: Initial implementation uses mock data. Replace with API calls when backend is ready.

2. **Wishlist Storage**: Currently uses localStorage. Should persist to backend.

3. **Document Handling**: Mock documents shown. Real documents would require:
   - PDF viewer integration
   - Download functionality
   - Real document metadata from API

4. **Analysis Workflow**: Currently simulated. Real analysis would:
   - Upload actual documents
   - Call backend AI/parsing service
   - Display real extracted data

5. **Status Workflow**: Tender status should flow through the system:
   - live → analyzed → synopsis → evaluated → won/lost

6. **Risk Assessment**: Currently shown in TenderDetails. Would be enhanced by analysis page results.

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|-----------------|
| Phase 1 | Routes & Navigation | 30 minutes |
| Phase 2 | Component Integration | 1 hour |
| Phase 3 | Data Structure | 45 minutes |
| Phase 4 | Integration & Testing | 1 hour |
| Phase 5 | Polish & Responsive | 45 minutes |
| **Total** | | **~4 hours** |

---

## Next Steps

1. **Review this plan** with the team
2. **Begin Phase 1** - Add routes and update navigation
3. **Proceed with Phase 2** - Copy and integrate components
4. **Test thoroughly** at each phase
5. **Document any changes** from the original design
6. **Plan backend API integration** for when services are ready

---

## Questions & Clarifications Needed

1. Should wishlist persist to backend or use localStorage?
2. Are there real document files to link for the sample tenders?
3. When will the backend API be ready for tender details, documents, and analysis?
4. Should the analysis workflow integrate with a real AI service or stay as demo?
5. How should the status field flow through the application?
6. Should we keep the sample data or immediately adapt real API responses?

---

## Contact & Support

For questions about:
- **UI/UX Design**: Refer to ui-and-flow-docs.md
- **Component Details**: Check individual component files
- **Integration Issues**: Review this plan and INTEGRATION_PLAN.md
- **Data Structures**: See sampleTenders.ts template

---

*Last Updated: 2025-11-04*
*Status: Ready for Implementation*
