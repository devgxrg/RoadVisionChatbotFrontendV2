// Import the types (assuming they are in a file like 'tender.types.ts')
import {
  FullTenderDetails,
  AnalysisStatusEnum,
  StatusEnum,
  ReviewStatusEnum,
  TenderActionEnum,
} from "@/lib/types/tenderiq.types";

/**
 * A mock object representing full tender details.
 */
// export const mockFullTenderDetails: FullTenderDetails = {
//   risk_level: "high",
//   // Core IDs and Info
//   id: "tender_12345abc",
//   tender_id_str: "NIT-2025-NHAI-001",
//   tender_name: "Construction of 4-Lane Elevated Highway on NH-44",
//   tender_url:
//     "https://etenders.gov.in/eprocure/app?page=FrontEndViewTender&service=page&tid=12345",
//   city: "New Delhi",
//   summary:
//     "This project involves the design and construction of a 15 km elevated highway section in the Delhi-NCR region to ease congestion.",
//   value: "Approx. Rs. 850 Crores",
//   due_date: "2025-12-20T17:00:00Z",
//
//   // Analysis and Query Info
//   analysis_status: "completed",
//   error_message: "",
//   query_id: "query_highway_delhi_2025",
//   query: "elevated highway construction delhi ncr",
//
//   // From TenderDetailNotice
//   tdr: "TDR-09876",
//   tendering_authority: "National Highways Authority of India (NHAI)",
//   tender_no: "NHAI/HQ/2025/EL/001",
//   tender_id_detail: "2025_NHAI_12345_1",
//   tender_brief:
//     "Design, Engineering, Procurement, and Construction (EPC) of a 4-lane elevated highway.",
//   state: "Delhi",
//   document_fees: "Rs. 50,000",
//   emd: "Rs. 8.5 Crores",
//   tender_value: "8500000000",
//   tender_type: "Open",
//   bidding_type: "Two-Bid System",
//   competition_type: "National Competitive Bidding (NCB)",
//
//   // From TenderDetailDetails
//   tender_details:
//     "The project includes the construction of all associated structures, viaducts, ramps, and utility shifting. The concession period is 30 years.",
//
//   // From TenderDetailKeyDates
//   publish_date: "2025-11-01T10:00:00Z",
//   last_date_of_bid_submission: "2025-12-20T17:00:00Z",
//   tender_opening_date: "2025-12-21T11:00:00Z",
//
//   // From TenderDetailContactInformation
//   company_name: "NHAI Head Office",
//   contact_person: "Mr. R. K. Singh, Project Director",
//   address: "Sector 10, Dwarka, New Delhi, Delhi - 110075",
//
//   // From TenderDetailOtherDetail
//   information_source: "eTenders Gov Portal",
//
//   // Files Array
//   files: [
//     {
//       id: "file_doc_001",
//       file_name: "NIT_Document.pdf",
//       file_url: "https://etenders.gov.in/files/NIT_Document.pdf",
//       file_description: "Notice Inviting Tender (NIT)",
//       file_size: "4.8 MB",
//       dms_path: "/tenders/2025/nit_12345/NIT_Document.pdf",
//       is_cached: "true",
//       cache_status: "COMPLETED",
//       cache_error: "",
//       tender_id: "tender_12345abc",
//       file_type: "pdf",
//     },
//     {
//       id: "file_doc_002",
//       file_name: "BoQ_Elevated_Highway.xlsx",
//       file_url: "https://etenders.gov.in/files/BoQ_Elevated_Highway.xlsx",
//       file_description: "Bill of Quantities (BoQ)",
//       file_size: "1.2 MB",
//       dms_path: "/tenders/2025/nit_12345/BoQ_Elevated_Highway.xlsx",
//       is_cached: "true",
//       cache_status: "COMPLETED",
//       cache_error: "",
//       tender_id: "tender_12345abc",
//       file_type: "excel",
//     },
//   ],
//
//   // From Tender (Internal Fields)
//   tender_ref_number: "REF-NHAI-2025-001",
//   tender_title: "Construction of 4-Lane Elevated Highway on NH-44",
//   description:
//     "This project involves the design and construction of a 15 km elevated highway section in the Delhi-NCR region to ease congestion.",
//   employer_name: "National Highways Authority of India",
//   employer_address: "Sector 10, Dwarka, New Delhi",
//   issuing_authority: "Project Director, NHAI (HQ)",
//   location: "New Delhi",
//   category: "Civil Works",
//   mode: "Online",
//   estimated_cost: 8500000000,
//   bid_security: 85000000,
//   length_km: 15,
//   per_km_cost: 566666666,
//   span_length: 30,
//   road_work_amount: 6000000000,
//   structure_work_amount: 2500000000,
//   e_published_date: "2025-11-01T10:00:00Z",
//   identification_date: "2025-11-02T09:00:00Z",
//   submission_deadline: "2025-12-20T17:00:00Z",
//   prebid_meeting_date: "2025-11-20T11:00:00Z",
//   site_visit_deadline: "2025-11-25T17:00:00Z",
//   portal_source: "https://etenders.gov.in",
//   portal_url: "https://etenders.gov.in/eprocure/app",
//   document_url:
//     "https://etenders.gov.in/eprocure/app?page=FrontEndViewTender&service=page&tid=12345",
//
//   // Status and Review
//   status: "shortlisted",
//   review_status: "shortlisted",
//   reviewed_by_id: "user_manager_01",
//   reviewed_at: "2025-11-05T14:30:00Z",
//   created_at: "2025-11-02T09:05:22Z",
//   updated_at: "2025-11-05T14:30:00Z",
//
//   // Flags
//   is_favorite: true,
//   is_archived: false,
//   is_wishlisted: true,
//
//   // History Array
//   history: [
//     {
//       id: "hist_001",
//       tender_id: "tender_12345abc",
//       user_id: "user_analyst_02",
//       action: "viewed",
//       notes: "Initial review by analyst.",
//       timestamp: "2025-11-03T09:15:00Z",
//     },
//     {
//       id: "hist_002",
//       tender_id: "tender_12345abc",
//       user_id: "user_manager_01",
//       action: "wishlisted",
//       notes: "Added to watchlist for tracking.",
//       timestamp: "2025-11-04T11:22:00Z",
//     },
//     {
//       id: "hist_003",
//       tender_id: "tender_12345abc",
//       user_id: "user_manager_01",
//       action: "shortlisted",
//       notes: "High potential. Moving to shortlist for bidding decision.",
//       timestamp: "2025-11-05T14:30:00Z",
//     },
//   ],
//
//   tender_history: [
//     {
//       id: "hist_001",
//       tender_id: "tender_12345abc",
//       tdr: "12345",
//       type: "due_date_extension",
//       note: "Due date extended by 7 days",
//       update_date: "2025-11-03T09:15:00Z",
//       date_change: {
//         from: "2025-11-20T17:00:00Z",
//         to: "2025-11-27T17:00:00Z",
//       }
//     },
//     {
//       id: "hist_002",
//       tender_id: "tender_12345abc",
//       tdr: "12345",
//       type: "bid_deadline_extension",
//       note: "Bid deadline extended by 7 days",
//       update_date: "2025-11-03T09:15:00Z",
//       date_change: {
//         from: "2025-11-20T17:00:00Z",
//         to: "2025-11-27T17:00:00Z",
//       }
//     },
//     {
//       id: "hist_004",
//       tender_id: "tender_12345abc",
//       tdr: "12345",
//       type: "corrigendum",
//       note: "Corrigendum No.1 - updated technical specifications for pavement thickness",
//       update_date: "2025-11-03T09:15:00Z",
//       files_changed: [
//         {
//           id: "file_doc_001",
//           file_name: "NIT_Document.pdf",
//           file_url: "https://etenders.gov.in/files/NIT_Document.pdf",
//           file_description: "Notice Inviting Tender (NIT)",
//           file_size: "4.8 MB",
//           dms_path: "/tenders/2025/nit_12345/NIT_Document.pdf",
//           is_cached: "true",
//           cache_status: "COMPLETED",
//           cache_error: "",
//           tender_id: "tender_12345abc",
//           file_type: "pdf",
//         },
//         {
//           id: "file_doc_002",
//           file_name: "BoQ_Elevated_Highway.xlsx",
//           file_url: "https://etenders.gov.in/files/BoQ_Elevated_Highway.xlsx",
//           file_description: "Bill of Quantities (BoQ)",
//           file_size: "1.2 MB",
//           dms_path: "/tenders/2025/nit_12345/BoQ_Elevated_Highway.xlsx",
//           is_cached: "true",
//           cache_status: "COMPLETED",
//           cache_error: "",
//           tender_id: "tender_12345abc",
//           file_type: "excel",
//         },
//       ],
//     },
//     {
//       id: "hist_004",
//       tender_id: "tender_12345abc",
//       tdr: "12345",
//       type: "amendment",
//       note: "Amendmend to BOQ - Revised quantities for earthwork",
//       update_date: "2025-11-03T09:15:00Z",
//       files_changed: [
//         {
//           id: "file_doc_001",
//           file_name: "NIT_Document.pdf",
//           file_url: "https://etenders.gov.in/files/NIT_Document.pdf",
//           file_description: "Notice Inviting Tender (NIT)",
//           file_size: "4.8 MB",
//           dms_path: "/tenders/2025/nit_12345/NIT_Document.pdf",
//           is_cached: "true",
//           cache_status: "COMPLETED",
//           cache_error: "",
//           tender_id: "tender_12345abc",
//           file_type: "pdf",
//         },
//         {
//           id: "file_doc_002",
//           file_name: "BoQ_Elevated_Highway.xlsx",
//           file_url: "https://etenders.gov.in/files/BoQ_Elevated_Highway.xlsx",
//           file_description: "Bill of Quantities (BoQ)",
//           file_size: "1.2 MB",
//           dms_path: "/tenders/2025/nit_12345/BoQ_Elevated_Highway.xlsx",
//           is_cached: "true",
//           cache_status: "COMPLETED",
//           cache_error: "",
//           tender_id: "tender_12345abc",
//           file_type: "excel",
//         },
//       ],
//     },
//   ]
// };

export const mockFullTenderDetails: FullTenderDetails = {
    "risk_level": "low",
    "id": "a2d5b8da-816d-45f9-8bc6-86d19cf6fb31",
    "tender_id_str": "51655667",
    "tender_name": "1.Railtel Corporation Of India Limited",
    "tender_url": "https://www.tenderdetail.com/Indian-Tenders/TenderNotice/51655667/E5E242EB-8512-4BAA-93B7-F29692BF9D00/147107/47136136/7c7651b5-98f3-4956-9404-913de95abb79",
    "city": "Visakhapatnam Andhra Pradesh",
    "summary": "TDR:51655667  Corrigendum :Supply Installation And Commissioning For Smart Video Surveillance, Artificial Intelligence (Ai)/Machine Learning (Ml) Based Video Analytics (Va)",
    "value": "30.40 Crore",
    "due_date": "01-Nov-2025",
    "analysis_status": "pending",
    "error_message": "",
    "query_id": "64223459-e1bf-44d3-8e9f-f351d9352a9b",
    "query": "",
    "tdr": "51655667",
    "tendering_authority": "Railtel Corporation Of India Limited",
    "tender_no": "RailTel/SR/SC/Mktg/ 2025-26/EoI/027",
    "tender_id_detail": "2025_RTCIL_815059_1",
    "tender_brief": "Corrigendum : Tender For Supply Installation And Commissioning For Smart Video Surveillance, Artificial Intelligence (Ai)/Machine Learning (Ml) Based Video Analytics (Va)",
    "state": "Andhra Pradesh",
    "document_fees": "Refer document",
    "emd": "INR 3041000.0 /-",
    "tender_value": "INR 30.40 Crore /-",
    "tender_type": "Tender",
    "bidding_type": "Open Tender",
    "competition_type": "Indian",
    "tender_details": "Supply Installation And Commissioning For Smart Video Surveillance, Artificial Intelligence (Ai)/Machine Learning (Ml) Based Video Analytics (Va)",
    "publish_date": "31-10-2025",
    "last_date_of_bid_submission": "08-11-2025",
    "tender_opening_date": "08-11-2025",
    "company_name": "Railtel Corporation Of India Limited",
    "contact_person": "Sr.DGM/Marketing",
    "address": "1-10-39 to 44, 6A, 6th Floor, Begumpet Airport Road, opp. Shoppers Stop, Begumpet, Hyderabad- 500 016",
    "information_source": "https://eprocure.gov.in/epublish/app",
    "files": [
        {
            "id": "dbb966f1-39d5-43a8-a826-aaafeaff81b0",
            "file_name": "Tendernotice_1.pdf",
            "file_url": "https://www.tenderfiles.com/TenderDocument//102025\\9\\e5e242eb-8512-4baa-93b7-f29692bf9d00?FileName=Tendernotice_1.pdf",
            "dms_path": "/tenders/2025/10/12/51655667/files/Tendernotice_1.pdf",
            "file_description": "Tender Documents",
            "file_size": "0 KB",
            "is_cached": false,
            "cache_status": "pending",
            "file_type": "Unknown"
        },
        {
            "id": "ae6c4c89-197e-4465-8e2b-0759eeddba03",
            "file_name": "e5e242eb-8512-4baa-93b7-f29692bf9d00.html",
            "file_url": "https://www.tenderfiles.com/TenderDocument//102025\\9\\e5e242eb-8512-4baa-93b7-f29692bf9d00?FileName=e5e242eb-8512-4baa-93b7-f29692bf9d00.html",
            "dms_path": "/tenders/2025/10/12/51655667/files/e5e242eb-8512-4baa-93b7-f29692bf9d00.html",
            "file_description": "Tender Documents",
            "file_size": "0 KB",
            "is_cached": false,
            "cache_status": "pending",
            "file_type": "Unknown"
        },
        {
            "id": "3ea30191-6f8c-4301-8f62-03b3d0cf6eac",
            "file_name": "EOI.pdf",
            "file_url": "https://www.tenderfiles.com/TenderDocument//102025\\9\\e5e242eb-8512-4baa-93b7-f29692bf9d00?FileName=EOI.pdf",
            "dms_path": "/tenders/2025/10/12/51655667/files/EOI.pdf",
            "file_description": "Tender Documents",
            "file_size": "0 KB",
            "is_cached": false,
            "cache_status": "pending",
            "file_type": "Unknown"
        }
    ],
    "tender_ref_number": "51655667",
    "tender_title": "1.Railtel Corporation Of India Limited",
    "description": "TDR:51655667  Corrigendum :Supply Installation And Commissioning For Smart Video Surveillance, Artificial Intelligence (Ai)/Machine Learning (Ml) Based Video Analytics (Va)",
    "employer_name": "Railtel Corporation Of India Limited",
    "employer_address": "",
    "issuing_authority": "Railtel Corporation Of India Limited",
    "location": "Visakhapatnam Andhra Pradesh",
    "category": "\r\n                                    AI/Block Chain\r\n                                ",
    "mode": "",
    "estimated_cost": 30,
    "bid_security": 0,
    "length_km": 0,
    "per_km_cost": 0,
    "span_length": 0,
    "road_work_amount": 0,
    "structure_work_amount": 0,
    "e_published_date": "0001-01-01T00:00:00Z",
    "identification_date": "0001-01-01T00:00:00Z",
    "submission_deadline": "2025-08-11T00:00:00",
    "prebid_meeting_date": "0001-01-01T00:00:00Z",
    "site_visit_deadline": "0001-01-01T00:00:00Z",
    "portal_source": "",
    "portal_url": "https://www.tenderdetail.com/Indian-Tenders/TenderNotice/51655667/E5E242EB-8512-4BAA-93B7-F29692BF9D00/147107/47136136/7c7651b5-98f3-4956-9404-913de95abb79",
    "document_url": "",
    "status": "new",
    "review_status": "Not_Reviewed",
    "reviewed_by_id": "",
    "reviewed_at": "0001-01-01T00:00:00Z",
    "created_at": "2025-11-06T20:22:29.285232",
    "updated_at": "2025-11-06T20:26:02.454637",
    "is_favorite": false,
    "is_archived": false,
    "is_wishlisted": true,
    "history": [
        {
            "id": "c545fa4c-e5fa-4508-bc8b-33479ec9be61",
            "tender_id": "a2d5b8da-816d-45f9-8bc6-86d19cf6fb31",
            "user_id": "da5d1c7d-f6a4-41e8-af0e-9937ba7fe31b",
            "action": "wishlisted",
            "notes": "",
            "timestamp": "2025-11-10T12:55:05.181089Z"
        }
    ],
    "tender_history": [
        {
            "id": "c545fa4c-e5fa-4508-bc8b-33479ec9be61",
            "tender_id": "a2d5b8da-816d-45f9-8bc6-86d19cf6fb31",
            "tdr": "",
            "type": "other",
            "note": "",
            "update_date": "2025-11-10T12:55:05.181089+00:00",
            "files_changed": [],
            "date_change": {
                "from_date": "0001-01-01T00:00:00+00:00",
                "to_date": "0001-01-01T00:00:00+00:00"
            }
        }
    ]
}

