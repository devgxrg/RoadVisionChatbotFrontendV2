# LegalIQ Module Documentation

**Date:** January 14, 2026
**Module:** LegalIQ

This document provides a comprehensive overview of the functionalities available within the LegalIQ module of the application. LegalIQ is designed to assist legal professionals with case management, document drafting, anonymization, research, and analysis.

## 1. Case Tracker

**Route:** `/legaliq/cases`
**Description:** A comprehensive case management system for tracking legal cases and hearings.

### Key Features:
-   **Dashboard Overview:**
    -   **Total Active Cases:** Real-time count of ongoing cases.
    -   **Upcoming Hearings:** Aggregated count of future hearings across all cases, with a highlight of the next immediate hearing.
    -   **Avg. Case Duration:** Statistical insight into the average lifecycle of cases.
    -   **Recent Cases:** Total count of cases in the database.
-   **Case List & Filtering:**
    -   Searchable list of cases by Case ID, Party Name, or Court.
    -   Filters for Case Status (Pending, Under Review, Closed) and Court.
-   **Detailed Case View:**
    -   **Overview:** Displays core case details (CNR, Filing Date, Case Type, Judge, Acts/Sections, Parties & Advocates).
    -   **Hearings:**
        -   **Timeline:** Visual chronological view of hearing history.
        -   **History Table:** Detailed record of past hearings with outcomes and downloadable orders.
        -   **Next Hearing:** Widget showing the date and purpose of the upcoming hearing.
    -   **Documents:** Repository of case-related files (Awards, Petitions, Orders) with download capabilities.
    -   **Analytics (AI Insights):**
        -   **Case Summary:** AI-generated brief of the case status.
        -   **Win Probability:** Estimated success rate.
        -   **Estimated Duration:** Projected timeline.
        -   **Recommended Action:** Strategic advice based on the current stage.

## 2. Document Drafting

**Route:** `/legaliq/drafting`
**Description:** An automated tool for generating legal documents from standardized templates.

### Key Features:
-   **Template Gallery:** Selection of pre-defined legal templates (e.g., Notices, Contracts, Affidavits).
-   **Dynamic Form Generation:**
    -   Automatically generates input fields based on the selected template's schema.
    -   Supports various field types (Text, Date, Dropdown).
-   **Live Preview:** Real-time document preview that updates as the user fills out the form.
-   **AI Assistance:** Option to generate or refine draft content using AI.
-   **Export Options:**
    -   **PDF Export:** Generates a professional PDF with proper formatting, headers, and page numbers.
    -   **DOCX Export:** Downloads an editable Word document.
-   **Save Draft:** Functionality to save the current draft state for later editing.

## 3. Document Anonymization (Document Compare)

**Route:** `/legaliq/anonymization`
**Description:** A privacy tool for redacting sensitive information from legal documents.

### Key Features:
-   **File Upload:** Supports PDF, DOC, and DOCX file formats.
-   **Granular Redaction Controls:** Toggle switches for specific data types:
    -   Names, Emails, Phone Numbers, Addresses
    -   Dates, Financial Info, Organization Names
    -   Govt IDs, Bank Details, Medical Info, etc.
-   **Side-by-Side Preview:**
    -   **Original:** View the uploaded document.
    -   **Anonymized:** Preview the redacted version with sensitive data masked (e.g., `[REDACTED]`).
-   **Automated Processing:** One-click anonymization process.
-   **Download:** Export the fully anonymized document.

## 4. Legal Research

**Route:** `/legaliq/research`
**Description:** A search engine for finding and analyzing legal precedents and case laws.

### Key Features:
-   **Natural Language Search:** Allows users to query legal databases using natural language.
-   **Search Results:** Displays relevant case laws, statutes, and precedents.
-   **Save to Case:** Ability to link found research directly to an active case in the Case Tracker.

## 5. Analyze Document

**Route:** `/legaliq/analyze`
**Description:** An AI-powered tool for extracting insights and summaries from legal documents.

### Key Features:
-   **Document Upload:** Upload legal documents for analysis.
-   **AI Analysis:**
    -   Extracts key clauses, dates, and parties.
    -   Identifies risks and obligations.
    -   Generates a summary of the document.
-   **History:** Tracks previous analyses for quick access.
-   **Reporting:**
    -   **Download Report:** Export a detailed analysis report for a single document.
    -   **Bulk Download:** Download a ZIP file containing reports for all previously analyzed documents.

---

**Note:** This documentation reflects the current state of the LegalIQ module as of January 14, 2026.
