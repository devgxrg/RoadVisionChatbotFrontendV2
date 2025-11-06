# TenderIQ Analyze Submodule - API Endpoint Suggestions

This document specifies the recommended API endpoints for the TenderIQ Analyze submodule. All endpoints should be implemented under the `/api/v1/tenderiq/analyze/` path.

## Overview

The Analyze submodule provides tender document analysis functionality, including:
- Tender document analysis and summarization
- Risk assessment and flagging
- RFP (Request for Proposal) section extraction and analysis
- Scope of work extraction
- One-pager document generation
- Data sheet extraction

## Base URL
```
/api/v1/tenderiq/analyze/
```

---

## Endpoints

### 1. Analyze Tender Document
**POST** `/api/v1/tenderiq/analyze/tender/{tenderId}`

Initiates analysis of a tender document. This is the main endpoint for analyzing a tender's documents.

#### Request
```json
{
  "tenderId": "uuid",
  "documentIds": ["uuid"],  // Optional: specific documents to analyze
  "analysisType": "full|summary|risk-only",  // Optional: type of analysis
  "includeRiskAssessment": true,
  "includeRfpAnalysis": true,
  "includeScopeOfWork": true
}
```

#### Response (202 Accepted - Async)
```json
{
  "analysisId": "uuid",
  "tenderId": "uuid",
  "status": "pending|processing|completed|failed",
  "createdAt": "2025-11-05T10:30:00Z",
  "estimatedCompletionTime": 30000
}
```

#### Status Codes
- `202 Accepted` - Analysis initiated
- `400 Bad Request` - Invalid tender or document ID
- `404 Not Found` - Tender not found
- `503 Service Unavailable` - Analysis service unavailable

---

### 2. Get Analysis Results
**GET** `/api/v1/tenderiq/analyze/results/{analysisId}`

Retrieves the completed analysis results for a tender.

#### Response
```json
{
  "analysisId": "uuid",
  "tenderId": "uuid",
  "status": "completed|failed",
  "results": {
    "summary": {
      "title": "string",
      "overview": "string",
      "keyPoints": ["string"]
    },
    "riskAssessment": {
      "overallRiskLevel": "low|medium|high|critical",
      "riskScore": 0-100,
      "risks": [
        {
          "id": "uuid",
          "level": "low|medium|high|critical",
          "category": "string",
          "title": "string",
          "description": "string",
          "recommendedAction": "string"
        }
      ]
    },
    "rfpAnalysis": {
      "sections": [
        {
          "id": "uuid",
          "number": "string",
          "title": "string",
          "description": "string",
          "keyRequirements": ["string"],
          "estimatedComplexity": "low|medium|high"
        }
      ],
      "missingDocuments": ["string"]
    },
    "scopeOfWork": {
      "description": "string",
      "estimatedDuration": "string",
      "keyDeliverables": ["string"],
      "estimatedEffort": "number (days)"
    },
    "onePager": {
      "content": "string (markdown formatted)",
      "generatedAt": "2025-11-05T10:35:00Z"
    }
  },
  "completedAt": "2025-11-05T10:35:00Z",
  "processingTimeMs": 305000
}
```

#### Status Codes
- `200 OK` - Results retrieved
- `202 Accepted` - Still processing
- `404 Not Found` - Analysis ID not found
- `410 Gone` - Analysis results expired

---

### 3. Get Analysis Status
**GET** `/api/v1/tenderiq/analyze/status/{analysisId}`

Lightweight endpoint to check the current status of an ongoing analysis.

#### Response
```json
{
  "analysisId": "uuid",
  "tenderId": "uuid",
  "status": "pending|processing|completed|failed",
  "progress": 0-100,
  "currentStep": "initializing|parsing-documents|analyzing-risk|extracting-rfp|generating-summary",
  "errorMessage": "string (if failed)"
}
```

#### Status Codes
- `200 OK` - Status retrieved
- `404 Not Found` - Analysis ID not found

---

### 4. Get Risk Assessment
**GET** `/api/v1/tenderiq/analyze/tender/{tenderId}/risks`

Retrieves risk assessment for a tender (can be used independently).

#### Query Parameters
```
- depth: "summary|detailed" (default: summary)
- includeHistorical: boolean (default: false)
```

#### Response
```json
{
  "tenderId": "uuid",
  "overallRiskLevel": "low|medium|high|critical",
  "riskScore": 0-100,
  "executiveSummary": "string",
  "risks": [
    {
      "id": "uuid",
      "level": "low|medium|high|critical",
      "category": "regulatory|financial|operational|contractual|market",
      "title": "string",
      "description": "string",
      "impact": "low|medium|high",
      "likelihood": "low|medium|high",
      "mitigationStrategy": "string",
      "recommendedAction": "string",
      "relatedDocuments": ["documentId"]
    }
  ],
  "analyzedAt": "2025-11-05T10:35:00Z"
}
```

#### Status Codes
- `200 OK` - Risk assessment retrieved
- `202 Accepted` - Analysis in progress
- `404 Not Found` - Tender not found

---

### 5. Get RFP Section Analysis
**GET** `/api/v1/tenderiq/analyze/tender/{tenderId}/rfp-sections`

Extracts and analyzes RFP sections from tender documents.

#### Query Parameters
```
- sectionNumber: "string" (optional: get specific section)
- includeCompliance: boolean (default: false)
```

#### Response
```json
{
  "tenderId": "uuid",
  "totalSections": 15,
  "sections": [
    {
      "id": "uuid",
      "number": "1.1",
      "title": "Eligibility Criteria",
      "description": "string",
      "keyRequirements": ["string"],
      "compliance": {
        "status": "compliant|non-compliant|requires-review",
        "issues": ["string"]
      },
      "estimatedComplexity": "low|medium|high",
      "relatedSections": ["1.2", "2.3"],
      "documentReferences": [
        {
          "documentId": "uuid",
          "pageNumber": 5
        }
      ]
    }
  ],
  "summary": {
    "totalRequirements": 45,
    "criticality": {
      "high": 12,
      "medium": 23,
      "low": 10
    }
  }
}
```

#### Status Codes
- `200 OK` - RFP analysis retrieved
- `202 Accepted` - Analysis in progress
- `404 Not Found` - Tender not found

---

### 6. Get Scope of Work
**GET** `/api/v1/tenderiq/analyze/tender/{tenderId}/scope-of-work`

Extracts and analyzes the scope of work from tender documents.

#### Response
```json
{
  "tenderId": "uuid",
  "scopeOfWork": {
    "description": "string",
    "workItems": [
      {
        "id": "uuid",
        "description": "string",
        "estimatedDuration": "string",
        "priority": "high|medium|low",
        "dependencies": ["uuid"]
      }
    ],
    "keyDelierables": [
      {
        "id": "uuid",
        "description": "string",
        "deliveryDate": "2025-12-31",
        "acceptance criteria": ["string"]
      }
    ],
    "estimatedTotalEffort": 120,
    "estimatedTotalDuration": "120 days",
    "keyDates": {
      "startDate": "2025-12-01",
      "endDate": "2026-04-09"
    }
  },
  "analyzedAt": "2025-11-05T10:35:00Z"
}
```

#### Status Codes
- `200 OK` - Scope analysis retrieved
- `202 Accepted` - Analysis in progress
- `404 Not Found` - Tender not found

---

### 7. Generate One-Pager
**POST** `/api/v1/tenderiq/analyze/tender/{tenderId}/one-pager`

Generates a one-page executive summary of the tender analysis.

#### Request
```json
{
  "format": "markdown|html|pdf",
  "includeRiskAssessment": true,
  "includeScopeOfWork": true,
  "includeFinancials": true,
  "maxLength": 800  // words
}
```

#### Response
```json
{
  "tenderId": "uuid",
  "onePager": {
    "content": "string (markdown/html formatted)",
    "format": "markdown|html|pdf",
    "generatedAt": "2025-11-05T10:35:00Z"
  }
}
```

#### Status Codes
- `200 OK` - One-pager generated
- `202 Accepted` - Generation in progress
- `404 Not Found` - Tender not found
- `503 Service Unavailable` - Generation service unavailable

---

### 8. Generate Data Sheet
**GET** `/api/v1/tenderiq/analyze/tender/{tenderId}/data-sheet`

Generates a structured data sheet with key tender information.

#### Query Parameters
```
- format: "json|csv|excel" (default: json)
- includeAnalysis: boolean (default: true)
```

#### Response (JSON)
```json
{
  "tenderId": "uuid",
  "dataSheet": {
    "basicInfo": {
      "tenderNumber": "string",
      "tenderName": "string",
      "tenderingAuthority": "string",
      "tenderURL": "string"
    },
    "financialInfo": {
      "estimatedValue": 10000000,
      "currency": "INR",
      "emd": 500000,
      "bidSecurityRequired": true
    },
    "temporal": {
      "releaseDate": "2025-11-05",
      "dueDate": "2025-12-15",
      "openingDate": "2025-12-20"
    },
    "scope": {
      "location": "string",
      "category": "string",
      "description": "string"
    },
    "analysis": {
      "riskLevel": "low|medium|high|critical",
      "estimatedEffort": 120,
      "complexityLevel": "low|medium|high"
    }
  },
  "generatedAt": "2025-11-05T10:35:00Z"
}
```

#### Status Codes
- `200 OK` - Data sheet retrieved
- `202 Accepted` - Generation in progress
- `404 Not Found` - Tender not found

---

### 9. List Recent Analyses
**GET** `/api/v1/tenderiq/analyze/analyses`

Lists recent analyses for the authenticated user.

#### Query Parameters
```
- limit: number (default: 20, max: 100)
- offset: number (default: 0)
- status: "pending|processing|completed|failed" (optional)
- tenderId: "uuid" (optional)
```

#### Response
```json
{
  "analyses": [
    {
      "analysisId": "uuid",
      "tenderId": "uuid",
      "tenderName": "string",
      "status": "pending|processing|completed|failed",
      "createdAt": "2025-11-05T10:30:00Z",
      "completedAt": "2025-11-05T10:35:00Z",
      "processingTimeMs": 305000
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### Status Codes
- `200 OK` - Analyses retrieved
- `401 Unauthorized` - Authentication required

---

### 10. Delete Analysis
**DELETE** `/api/v1/tenderiq/analyze/results/{analysisId}`

Deletes a completed analysis and its results.

#### Response
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

#### Status Codes
- `204 No Content` - Deletion successful
- `404 Not Found` - Analysis ID not found
- `403 Forbidden` - Insufficient permissions

---

## Authentication

All endpoints require Bearer token authentication via the `Authorization` header:

```
Authorization: Bearer {token}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "string",
  "code": "ERROR_CODE",
  "details": "string (optional)",
  "timestamp": "2025-11-05T10:35:00Z"
}
```

### Common Error Codes
- `INVALID_REQUEST` - Request validation failed
- `UNAUTHORIZED` - Authentication failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `RATE_LIMITED` - Rate limit exceeded
- `SERVICE_ERROR` - Internal service error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

---

## Data Models

### RiskLevel
- `low` - Low risk, minimal impact
- `medium` - Medium risk, moderate impact
- `high` - High risk, significant impact
- `critical` - Critical risk, severe impact

### AnalysisStatus
- `pending` - Analysis queued, waiting to start
- `processing` - Analysis in progress
- `completed` - Analysis finished successfully
- `failed` - Analysis failed with error

### DocumentAnalysisType
- `full` - Complete analysis of all aspects
- `summary` - Quick summary analysis
- `risk-only` - Risk assessment only

---

## Rate Limiting

All endpoints are rate-limited per authenticated user:
- **Standard**: 100 requests per minute
- **Analysis endpoints**: 10 concurrent analyses per user
- **Bulk operations**: Contact support for higher limits

---

## Pagination

List endpoints support pagination with the following parameters:
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Number of results to skip (default: 0)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Implementation Notes

1. **Async Processing**: Analysis endpoints (1, 2, 6, 7, 8) should support async processing with status polling
2. **Caching**: Consider caching analysis results for 24 hours
3. **Database Schema**: Maintain normalized tables for:
   - `tender_analyses` - Analysis metadata
   - `analysis_results` - Cached results
   - `analysis_risks` - Risk assessment details
   - `analysis_rfp_sections` - RFP section analysis

4. **Webhooks** (future enhancement): Consider implementing webhooks for analysis completion
5. **Bulk Operations** (future enhancement): Support bulk analysis of multiple tenders

---

## Frontend Integration Points

### Current Components Using Analyze Functionality
1. **AnalyzeTender** (`src/pages/AnalyzeTender.tsx`)
   - Main analysis page with tabs
   - Needs: Endpoint 1, 2, 3, 7

2. **TenderAnalysisView** (`src/components/tenderiq/TenderAnalysisView.tsx`)
   - Reusable analysis view component
   - Needs: Endpoint 2, 4, 5, 6

3. **TenderDetailsUI** (`src/components/tenderiq/TenderDetailsUI.tsx`)
   - Triggers analysis via button
   - Navigates to `/tenderiq/analyze/{tenderId}`

### Future Components
- Analysis Dashboard (lists recent analyses)
- Risk Assessment Widget
- RFP Comparison Tool
- Bid Preparation Assistant

---

## Testing

### Test Cases to Implement
1. Analyze a valid tender - should return 202 with analysisId
2. Poll status until completed - verify progress updates
3. Retrieve completed results - verify all sections present
4. Analyze invalid tender - should return 404
5. Concurrent analyses - verify queue handling
6. Results expiration - verify 410 response after 7 days

---

## Version History

- **v1.0** (2025-11-05) - Initial specification
  - Core analysis endpoints
  - Risk assessment
  - RFP analysis
  - One-pager generation

---

## Contact & Support

For API questions or to discuss implementation details, contact the backend team.
