# Codebase Cleanup - Files to Delete

## Files to Remove (In Order)

### 1. Legacy Directory (59 files)
- [ ] Delete entire directory: `/src/askai-old/`

### 2. Duplicate API Files
- [ ] Delete: `/src/lib/api/analyze.ts` (404 lines - abandoned analysis workflow)
- [ ] Delete: `/src/lib/api/tenderiq.ts` (422 lines - replaced by tenderiq.api.ts)
  - ⚠️ BEFORE deleting, update imports in these files:
    - `/src/hooks/useLiveFilters.ts` - import from `tenderiq.api.ts` instead
    - `/src/hooks/useDateSelector.ts` - import from `tenderiq.api.ts` instead
    - `/src/components/tenderiq/LiveTenders.tsx` - import from `tenderiq.api.ts` instead
    - `/src/components/tenderiq/TenderHistory.tsx` - import from `tenderiq.api.ts` instead

### 3. Duplicate Type Files
- [ ] Delete: `/src/lib/types/analyze.ts` (200+ lines - replaced by analyze.type.ts)

### 4. Unused Hooks
- [ ] Delete: `/src/hooks/useAnalyzeTender.ts` (150+ lines - no imports, abandoned workflow)

### 5. Unused UI Components (Old TenderIQ Features)
- [ ] Delete: `/src/components/tenderiq/TenderAnalysisView.tsx`
- [ ] Delete: `/src/components/tenderiq/BidEvaluate.tsx` (182 lines)
- [ ] Delete: `/src/components/tenderiq/DraftRFP.tsx` (74 lines)
- [ ] Delete: `/src/components/tenderiq/TenderCompare.tsx` (136 lines)

### 6. Unused Mock Data
- [ ] Delete: `/src/lib/mocks/analyze.mock.ts` (15 KB - only used by abandoned analyze.ts)

---

## Summary
- **Total files to delete**: ~75 files
- **Total lines removed**: ~2500+ lines
- **Estimated cleanup time**: 30 minutes (including import updates)

## Delete Order (Safest to Riskiest)
1. Legacy `/src/askai-old/` directory first (no dependencies)
2. Unused components (BidEvaluate, DraftRFP, TenderCompare, TenderAnalysisView)
3. Update imports in 4 hook/component files
4. Delete old `tenderiq.ts` API file
5. Delete old `analyze.ts` API file
6. Delete old type files
7. Delete unused hooks and mocks

---

## Components NOT to Delete (Still Used)
✅ `/src/components/tenderiq/TenderOnePager.tsx` - Used by AnalyzeTender page
✅ `/src/components/tenderiq/TenderScopeOfWork.tsx` - Used by AnalyzeTender page
✅ `/src/components/tenderiq/TenderSections.tsx` - Used by AnalyzeTender page
✅ `/src/components/tenderiq/TenderDataSheet.tsx` - Used by AnalyzeTender page
✅ `/src/components/tenderiq/TenderTemplates.tsx` - Used by AnalyzeTender page
