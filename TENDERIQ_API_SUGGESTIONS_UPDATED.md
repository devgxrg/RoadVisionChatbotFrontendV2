# TenderIQ Backend API Requirements - UPDATED

## Issue Identified

**Problem**: Tender details page (`/viewtender/:id`) shows "Tender not found" because:
1. Live Tenders list returns tenders with sequential numeric IDs (1, 2, 3, etc.)
2. Currently uses sample data from `sampleTenders.ts` with hardcoded IDs
3. No backend endpoint exists to fetch complete tender details by ID

**Solution**: Implement the missing `/api/v1/tenderiq/tender/:id` endpoint to fetch full tender details

---

## Required Backend Endpoints

### 1. ✅ EXISTING: Get Daily Tenders (Already Implemented)
```
GET /api/v1/tenderiq/tenders
GET /api/v1/tenderiq/tenders?date=YYYY-MM-DD
GET /api/v1/tenderiq/tenders?date_range=last_5_days
GET /api/v1/tenderiq/dates
```

### 2. 🆕 NEW REQUIRED: Get Single Tender Details

**Endpoint**: `GET /api/v1/tenderiq/tender/:id`

**Purpose**: Fetch complete tender details for a specific tender ID

**Parameters**:
- `id` (path parameter) - Tender ID from live tenders list

**Response**:
```json
{
  "id": "tender_id_string_or_number",
  "title": "Full tender project name",
  "authority": "Tendering organization",
  "organization": "Tendering organization",
  "tdrNumber": "TDR-2025-001",
  "status": "live | won | lost | pending",
  "category": "Civil | Infrastructure | Railway | Energy | Ports",
  "value": 900000000,
  "tenderValue": "₹90 Cr",
  "emd": 900000000,
  "bidSecurity": 900000,
  "dueDate": "2025-12-15",
  "ePublishedDate": "2025-11-01",
  "location": "Maharashtra",
  "description": "Full tender description and scope",
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

**Error Cases**:
```json
{
  "error": "Tender not found",
  "status": 404
}
```

---

## Implementation Strategy

### For Frontend (Already Done ✅)

1. **Live Tenders page** returns list with `id` field
   - Users click "View Tender" button
   - Navigation to `/viewtender/:id`

2. **TenderDetails page** needs real data
   - Option A: Keep sample data for demo (current implementation)
   - **Option B (Recommended)**: Call new `/api/v1/tenderiq/tender/:id` endpoint

### For Backend (TODO)

Need to implement:
1. New endpoint: `GET /api/v1/tenderiq/tender/:id`
2. Fetch complete tender details from database
3. Include all metadata and documents
4. Return properly formatted JSON

---

## Current Data Flow

### Before (Sample Data):
```
Live Tenders List (API)
  → Shows 5 sample tenders
  → Click "View Tender"
  → Navigate to /viewtender/:id
  → Load from sampleTenders.ts ❌ (ID mismatch)
  → "Tender not found" 😞
```

### After (Real Data):
```
Live Tenders List (API)
  → Shows real tenders from /api/v1/tenderiq/tenders
  → Click "View Tender"
  → Navigate to /viewtender/:id
  → Fetch from /api/v1/tenderiq/tender/:id ✅
  → Show complete tender details 🎉
```

---

## Recommended API Endpoint Details

### GET /api/v1/tenderiq/tender/:id

**Full Specification**:

```yaml
endpoint: GET /api/v1/tenderiq/tender/{id}
summary: Get detailed information for a specific tender
description: |
  Retrieves complete tender information by ID, including all metadata,
  documents, and analysis data. Used when user clicks "View Tender"
  on the Live Tenders list.

tags:
  - TenderIQ

parameters:
  - name: id
    in: path
    required: true
    description: Tender ID (from daily tenders list)
    schema:
      type: string
      example: "t001" or "12345"

responses:
  200:
    description: Tender details successfully retrieved
    content:
      application/json:
        schema:
          type: object
          properties:
            id:
              type: string
              description: Unique tender identifier
              example: "t001"
            title:
              type: string
              description: Full tender project name/title
              example: "Construction of 4-lane highway with interchanges"
            authority:
              type: string
              description: Tendering authority/organization
              example: "National Highways Authority"
            organization:
              type: string
              description: Same as authority (for compatibility)
            tdrNumber:
              type: string
              description: Tender reference number
              example: "TDR-2025-00147"
            status:
              type: string
              enum: [live, won, lost, pending, analyzed, synopsis, evaluated]
              description: Current tender status
              example: "live"
            category:
              type: string
              description: Tender category/type
              example: "Civil"
            value:
              type: number
              description: Tender value in rupees
              example: 900000000
            tenderValue:
              type: string
              description: Formatted tender value string
              example: "₹90 Cr"
            emd:
              type: number
              description: Earnest Money Deposit in rupees
              example: 900000000
            bidSecurity:
              type: number
              description: Bid security amount in rupees
              example: 900000
            dueDate:
              type: string
              format: date
              description: Bid submission due date
              example: "2025-12-15"
            ePublishedDate:
              type: string
              format: date
              description: Tender published/issued date
              example: "2025-11-01"
            location:
              type: string
              description: Project location/city/state
              example: "Maharashtra"
            description:
              type: string
              description: Full tender description and scope
              example: "Construction of 4-lane highway..."
            length:
              type: string
              description: Project length (optional)
              example: "120 km"
            costPerKm:
              type: number
              description: Cost per kilometer (optional)
              example: 7500000
            progressPct:
              type: integer
              minimum: 0
              maximum: 100
              description: Tender handling progress percentage
              example: 0
            riskLevel:
              type: string
              enum: [high, medium, low]
              description: Risk assessment level
              example: "medium"
            documents:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                    description: Document identifier
                  name:
                    type: string
                    description: Document filename
                    example: "RFP_Document.pdf"
                  type:
                    type: string
                    enum: [pdf, doc, excel]
                    description: Document file type
                  pages:
                    type: integer
                    description: Number of pages (for PDFs)
                    example: 45
                  isAIGenerated:
                    type: boolean
                    description: Whether document is AI-generated
                    example: false
              description: Associated tender documents

  404:
    description: Tender not found
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Tender not found"
            status:
              type: integer
              example: 404

  401:
    description: Unauthorized - missing or invalid authentication token

  500:
    description: Server error
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Internal server error"
```

---

## Database Considerations

### Required Data Fields in Tender Table

```sql
-- Minimum required fields for tender details endpoint
CREATE TABLE tenders (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  authority VARCHAR(255) NOT NULL,
  tdr_number VARCHAR(100),
  status ENUM('live', 'won', 'lost', 'pending', 'analyzed', 'synopsis', 'evaluated'),
  category VARCHAR(100),
  value BIGINT,
  emd BIGINT,
  bid_security BIGINT,
  due_date DATE,
  published_date DATE,
  location VARCHAR(255),
  description TEXT,
  length VARCHAR(50),
  cost_per_km BIGINT,
  risk_level ENUM('high', 'medium', 'low'),
  scraped_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Documents table
CREATE TABLE tender_documents (
  id VARCHAR(50) PRIMARY KEY,
  tender_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('pdf', 'doc', 'excel'),
  pages INT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  document_url VARCHAR(500),
  created_at TIMESTAMP,
  FOREIGN KEY (tender_id) REFERENCES tenders(id)
);
```

---

## Testing the Endpoint

### cURL Example:
```bash
curl -X GET \
  'https://aware-thoroughly-goldfish.ngrok-free.app/api/v1/tenderiq/tender/t001' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

### Expected Response:
```json
{
  "id": "t001",
  "title": "Construction of 4-lane highway with interchanges, service roads, and drainage",
  "authority": "National Highways Authority",
  "organization": "National Highways Authority",
  "tdrNumber": "TDR-2025-00147",
  "status": "live",
  "category": "Civil",
  "value": 900000000,
  "tenderValue": "₹90 Cr",
  "emd": 900000000,
  "bidSecurity": 900000,
  "dueDate": "2025-12-15",
  "ePublishedDate": "2025-11-01",
  "location": "Maharashtra",
  "description": "Construction of 4-lane highway with interchanges, service roads, and drainage system...",
  "length": "120 km",
  "costPerKm": 7500000,
  "progressPct": 0,
  "riskLevel": "medium",
  "documents": [
    {
      "id": "d1",
      "name": "RFP_Document.pdf",
      "type": "pdf",
      "pages": 45,
      "isAIGenerated": false
    },
    {
      "id": "d2",
      "name": "Technical_Specifications.pdf",
      "type": "pdf",
      "pages": 32,
      "isAIGenerated": false
    }
  ]
}
```

---

## Integration Notes for Frontend

### Current Implementation:

The frontend is ready to use this endpoint. In `src/pages/TenderDetails.tsx`:
```typescript
const tender = getTenderById(id || '');  // Currently uses sample data
```

### To switch to real API:

```typescript
// Option 1: Fetch on component mount
useEffect(() => {
  const fetchTender = async () => {
    const response = await fetch(`/api/v1/tenderiq/tender/${id}`);
    const data = await response.json();
    setTender(data);
  };
  fetchTender();
}, [id]);

// Option 2: Keep sample data for development, use real API for production
const tender = process.env.NODE_ENV === 'production'
  ? await fetchTenderFromAPI(id)
  : getTenderById(id);
```

---

## Migration Plan

### Phase 1: Keep Sample Data (Current ✅)
- Use `sampleTenders.ts` for development/demo
- Shows "Tender not found" when clicking from live list
- **Status**: Works with sample IDs

### Phase 2: Add Backend Endpoint (TODO)
- Implement `/api/v1/tenderiq/tender/:id` endpoint
- **Status**: Backend team to implement

### Phase 3: Switch to Real Data (TODO)
- Update `TenderDetails.tsx` to call API instead of using sample data
- Remove dependency on `sampleTenders.ts` for detail pages
- Keep sample data only for demo purposes
- **Status**: Frontend to update when API ready

---

## Summary of Changes Needed

### Backend (Required)

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/api/v1/tenderiq/tenders` | GET | ✅ Done | P0 |
| `/api/v1/tenderiq/tenders?date=...` | GET | ✅ Done | P0 |
| `/api/v1/tenderiq/dates` | GET | ✅ Done | P0 |
| `/api/v1/tenderiq/tender/:id` | GET | ❌ **NEEDED** | **P1** |

### Frontend (Ready)
- ✅ TenderDetails page component
- ✅ AnalyzeTender page component
- ✅ Routes configured
- ⏳ Ready to call `/api/v1/tenderiq/tender/:id` when available

---

## Questions for Backend Team

1. **Tender ID Format**: What is the ID format used in your database? (numeric, UUID, TDR number, etc.)?
2. **ID Return**: Does `/api/v1/tenderiq/tenders` already return the tender ID that should be used for `/api/v1/tenderiq/tender/:id`?
3. **Documents Storage**: Where are tender documents stored? (API response, S3, local file storage?)
4. **Timeline**: When can `/api/v1/tenderiq/tender/:id` endpoint be ready?

---

## Workaround for Now

Until the backend endpoint is ready:

**Option A**: Keep using sample data
- ✅ Demo and test the UI fully
- ✅ Show stakeholders
- ❌ IDs won't match live tenders
- ❌ Still shows "Tender not found"

**Option B**: Modify Live Tenders to use sample data
- Create hybrid approach: use sample tenders for details until real endpoint available
- Map live tender IDs to sample IDs temporarily

**Option C**: Wait for backend endpoint
- Most reliable long-term solution
- Best user experience when ready

---

## Files to Send to Backend Team

- This file: `TENDERIQ_API_SUGGESTIONS_UPDATED.md`
- Original: `TENDERIQ_API_SUGGESTIONS.json`
- Context: Share the UI integration is complete, just need data endpoints

---

**Last Updated**: 2025-11-04
**Status**: Waiting for backend `/api/v1/tenderiq/tender/:id` endpoint
**Impact**: Cannot display tender details from live list until this endpoint exists
