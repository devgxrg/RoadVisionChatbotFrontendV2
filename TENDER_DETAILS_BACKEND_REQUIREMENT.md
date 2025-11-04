# Tender Details Page - Backend API Requirement

## Issue Summary

**Problem**: When users click "View Tender" from the Live Tenders list and navigate to `/viewtender/:id`, they see "Tender not found".

**Root Cause**:
- Live Tenders list returns tenders from the backend API
- Each tender has an ID (numeric or string format from backend)
- TenderDetails page currently uses sample hardcoded data from `sampleTenders.ts`
- The ID from the live list doesn't match the sample data IDs
- Result: Tender not found

**Status**: ✅ **WORKAROUND IMPLEMENTED** (with fallback to sample data)

---

## Current Solution (Implemented)

The TenderDetails page has been updated with a smart fallback:

```
Try Backend API (/api/v1/tenderiq/tender/:id)
  ↓
If API call fails, use Sample Data (for demo)
  ↓
If no data found, show "Tender not found" with back button
```

### How It Works

1. **First attempt**: Try to fetch from `/api/v1/tenderiq/tender/:id`
   - If backend endpoint exists → Use real data
   - If endpoint fails → Fall back to sample data

2. **Fallback**: Use sample data from `sampleTenders.ts`
   - Allows testing the UI without backend
   - Shows demo tenders with IDs 1-5
   - **Limitation**: Won't work with real tender IDs from live list

3. **Error handling**: Show friendly error message if no tender found

### Code Implementation

```typescript
useEffect(() => {
  const fetchTender = async () => {
    // Try API first
    const response = await fetch(`/api/v1/tenderiq/tender/${id}`);
    if (response.ok) {
      const data = await response.json();
      setTender(data);
      return;  // Success!
    }

    // Fall back to sample data
    const sampleTender = getTenderById(id || '');
    setTender(sampleTender || null);
  };

  fetchTender();
}, [id]);
```

---

## What You Need to Know

### ✅ What Works Now
- Click "View Tender" button from Live Tenders list
- See loading state while fetching
- If API endpoint doesn't exist:
  - Falls back to sample data
  - Shows demo tenders (IDs: 1, 2, 3, 4, 5)
  - UI displays correctly
- All features work (Wishlist, Quick Actions, Documents, etc.)

### ❌ What Needs Backend
To work with real tender IDs from your live list:
- Backend endpoint: `/api/v1/tenderiq/tender/:id`
- Should fetch complete tender details
- Should return documents, metadata, etc.

### 🎯 For Testing/Demo Right Now
- Use sample tenders with IDs: 1, 2, 3, 4, 5
- Or navigate directly to URLs:
  - `/viewtender/1` - Highway Construction
  - `/viewtender/2` - Smart City Development
  - `/viewtender/3` - Railway Station Renovation
  - `/viewtender/4` - Solar Park
  - `/viewtender/5` - Port Terminal

---

## Required Backend Endpoint

### Specification

**Endpoint**: `GET /api/v1/tenderiq/tender/:id`

**Purpose**: Return complete tender details for the given ID

**Parameters**:
- `id` (path) - Tender ID from `/api/v1/tenderiq/tenders` response

**Response Format**:
```json
{
  "id": "tender_id",
  "title": "Full tender name",
  "authority": "Organization name",
  "organization": "Organization name (duplicate of authority)",
  "tdrNumber": "TDR-2025-001",
  "status": "live | won | lost | pending",
  "category": "Civil | Infrastructure | Railway | Energy | Ports",
  "value": 900000000,
  "emd": 900000000,
  "bidSecurity": 900000,
  "dueDate": "2025-12-15",
  "ePublishedDate": "2025-11-01",
  "location": "Maharashtra",
  "description": "Full tender description and scope...",
  "length": "120 km",
  "costPerKm": 7500000,
  "progressPct": 0,
  "riskLevel": "high | medium | low",
  "documents": [
    {
      "id": "doc_id",
      "name": "RFP_Document.pdf",
      "type": "pdf | doc | excel",
      "pages": 45,
      "isAIGenerated": false
    }
  ]
}
```

**Error Response**:
```json
{
  "error": "Tender not found",
  "status": 404
}
```

---

## Migration Path

### Phase 1: Now (Sample Data + Fallback) ✅
- **Status**: Implemented
- **Features**: Works with sample tenders (IDs 1-5)
- **Real tender IDs**: Won't work yet
- **Use case**: Demo, testing, development

### Phase 2: When Backend Ready (Real Data)
- **What**: Backend implements `/api/v1/tenderiq/tender/:id`
- **Then**: Frontend automatically uses real API
- **No changes needed**: Fallback code already in place
- **Result**: Seamless upgrade to production

### Phase 3: Optional (Remove Sample Data)
- **When**: After backend is stable
- **What**: Remove `sampleTenders.ts` dependency
- **Why**: Cleaner code, single source of truth

---

## For Backend Team

### To Implement the Endpoint

1. **Get tender ID from request**
   ```
   GET /api/v1/tenderiq/tender/t001
   ↑
   Use this 't001' to look up in your database
   ```

2. **Query tender details table**
   - Fetch by ID
   - Include all metadata fields
   - Join with documents table

3. **Return complete JSON response**
   - Follow format specified above
   - Ensure all fields are populated
   - Handle 404 if not found

4. **Add to OpenAPI spec**
   - Document the endpoint
   - Define request/response schemas
   - Add to API definition file

### Timeline

- **Quick**: 1-2 hours (basic implementation)
- **Complete**: 2-3 hours (with error handling, docs)

### Questions?

See `TENDERIQ_API_SUGGESTIONS_UPDATED.md` for detailed endpoint specification

---

## Testing Instructions

### Test with Sample Data (Right Now)

1. Start the app: `npm run dev`
2. Navigate to `/tenderiq`
3. Click "View Tender" on any tender
4. **Expected**: "Tender not found" (because IDs don't match)
5. **Workaround**: Go directly to `/viewtender/1` to see sample data

### Test with Real Data (When Backend Ready)

1. Backend team implements `/api/v1/tenderiq/tender/:id`
2. Restart dev server
3. Click "View Tender" from Live Tenders list
4. **Expected**: Shows tender details with real data
5. **No code changes needed**: Frontend auto-detects and uses real API

---

## Troubleshooting

### "Tender not found" appears
**Cause**: Using live tender ID but backend endpoint doesn't exist
**Solution**:
- Option A: Wait for backend endpoint
- Option B: Use sample IDs (1-5) to test UI

### Wrong data appears
**Cause**: API endpoint exists but returns incomplete data
**Solution**: Check that response includes all required fields:
- ✅ id, title, authority, status, category
- ✅ value, emd, bidSecurity, dueDate, ePublishedDate
- ✅ location, description, documents array
- ❌ Any missing fields will break the page

### Loading state persists
**Cause**: API call hanging or timing out
**Solution**: Check network tab in browser dev tools
- Is the request being made?
- Is it getting a response?
- What's the response status?

---

## Files Affected

### Modified
- `src/pages/TenderDetails.tsx` - Added API fetch with fallback

### Created (Documentation)
- `TENDER_DETAILS_BACKEND_REQUIREMENT.md` - This file
- `TENDERIQ_API_SUGGESTIONS_UPDATED.md` - Detailed backend spec

### Unchanged
- `src/data/sampleTenders.ts` - Still used as fallback
- Routes, navigation, all UI components

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **UI Component** | ✅ Complete | Fully functional, responsive |
| **Sample Data** | ✅ Available | IDs 1-5 work for demo |
| **Backend API** | ❌ Needed | `/api/v1/tenderiq/tender/:id` |
| **Fallback** | ✅ Implemented | Falls back to sample data |
| **Error Handling** | ✅ Implemented | Shows friendly error message |
| **Live List Integration** | ⏳ Pending | Will work once API exists |

---

## Next Steps

### For Backend Team
1. Review `TENDERIQ_API_SUGGESTIONS_UPDATED.md`
2. Implement `/api/v1/tenderiq/tender/:id` endpoint
3. Ensure response format matches specification
4. Test with sample IDs and real tenders
5. Deploy to API

### For Frontend Team
1. Wait for backend endpoint
2. No code changes needed
3. Fallback will automatically switch to real API when available
4. Test after backend deployment

### For Testing
1. Use sample data now (IDs 1-5)
2. Test all features (wishlist, documents, etc.)
3. Verify responsive design
4. Demo to stakeholders
5. Switch to real API when backend ready

---

**Created**: 2025-11-04
**Status**: ✅ Workaround Implemented, ⏳ Backend Endpoint Pending
**Impact**: Demo works now, Production requires backend
