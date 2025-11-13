/**
 * Mock data for TenderIQ Analyze Module
 * Complete response from single endpoint: GET /api/v1/tenderiq/analyze/{tenderId}
 */

import { TenderAnalysisResponse } from '@/lib/types/analyze.type';

export const mockTenderAnalysis: TenderAnalysisResponse = {
  id: 'analysis-001',
  tender_id: 'tender-2024-001',
  status: 'completed',
  analyzed_at: '2024-01-16T11:45:00Z',

  // ============================================================================
  // One-Pager Section
  // ============================================================================
  one_pager: {
    project_overview:
      'Construction and development of a smart road junction with integrated traffic management, real-time monitoring, and automated control systems. The project includes excavation, foundation work, PCC, reinforced concrete structure, and installation of smart infrastructure.',
    financial_requirements: [
      'Contract Value: ₹50,00,00,000 (Rs. 50 Crore)',
      'EMD: ₹2,50,00,000 (5% of contract value)',
      'Performance Guarantee: ₹5,00,00,000 (10% of contract value)',
      'Tender Document Fee: ₹50,000 (non-refundable)',
      'Total Upfront Cost: ₹7,57,50,000',
      'Payment Terms: 90% on certificate basis, 10% on final completion',
    ],
    eligibility_highlights: [
      'Minimum 10 years of experience in road infrastructure projects',
      'Minimum turnover of ₹25 crore in the last 3 years',
      'Valid GSTIN and statutory compliance required',
      'No blacklisting in past 5 years',
      'MSEs can participate with 50% reduced EMD',
      'Female-led enterprises get 5% price preference',
    ],
    important_dates: [
      'Pre-bid Meeting: 20-Feb-2024 at 14:00 hrs',
      'Bid Submission Deadline: 29-Feb-2024 at 17:00 hrs',
      'Technical Bid Opening: 05-Mar-2024 at 11:00 hrs',
      'Financial Bid Opening: 12-Mar-2024 at 14:00 hrs',
      'Expected Award Date: 20-Mar-2024',
      'Project Start Date: 15-Apr-2024',
      'Project Duration: 18 months from commencement',
    ],
    risk_analysis: {
      summary:
        'Overall Risk Level: MEDIUM\n\n' +
        'Key Risks:\n' +
        '• Weather-dependent construction activities - Impact: HIGH\n' +
        '• Traffic management challenges during implementation - Impact: HIGH\n' +
        '• Coordination with municipal utilities (water, electricity, telecom) - Impact: MEDIUM\n' +
        '• Land acquisition and clearance risks - Impact: MEDIUM\n' +
        '• Regulatory compliance and approvals - Impact: MEDIUM\n' +
        '• Skilled labor availability - Impact: LOW\n\n' +
        'Mitigation Strategy: Comprehensive planning, early coordination with authorities, robust quality control, and experienced project management team.',
    },
  },

  // ============================================================================
  // Scope of Work Section
  // ============================================================================
  scope_of_work: {
    project_details: {
      project_name: 'Smart Road Junction Construction',
      location: 'New Delhi, Central District',
      total_length: '250 meters',
      total_area: '15,000 square meters',
      duration: '18 months',
      contract_value: '₹50,00,00,000',
    },
    work_packages: [
      {
        id: 'wp-001',
        name: 'Site Preparation and Clearance',
        description: 'Land survey, marking, utility identification, and site establishment',
        components: [
          {
            item: 'Land Leveling',
            description: 'Cut and fill operations to achieve required levels',
            quantity: 15000,
            unit: 'Sq.m',
            specifications: 'As per site plan and design drawings',
          },
          {
            item: 'Utility Relocation',
            description: 'Relocation of water, electricity, and telecom lines',
            specifications: 'Coordination with respective authorities',
          },
          {
            item: 'Site Establishment',
            description: 'Office, store, and worker accommodation setup',
            quantity: 5000,
            unit: 'Sq.m',
          },
        ],
        estimated_duration: '3 months',
      },
      {
        id: 'wp-002',
        name: 'Structural Works',
        description: 'Excavation, foundation, and concrete works',
        components: [
          {
            item: 'Excavation',
            description: 'Bulk excavation for foundation and utilities',
            quantity: 50000,
            unit: 'Cu.m',
          },
          {
            item: 'Reinforced Concrete',
            description: 'Foundation, columns, and slab works',
            quantity: 35000,
            unit: 'Cu.m',
            specifications: 'M40 grade concrete, Fe500D reinforcement',
          },
          {
            item: 'Surface Finish',
            description: 'Concrete curing and finish coating',
            quantity: 15000,
            unit: 'Sq.m',
          },
        ],
        estimated_duration: '8 months',
        dependencies: ['wp-001'],
      },
      {
        id: 'wp-003',
        name: 'Smart Systems Installation',
        description: 'Installation of traffic management, sensors, and monitoring systems',
        components: [
          {
            item: 'Traffic Control Devices',
            description: 'Traffic signals, lane control signs, variable message signs',
          },
          {
            item: 'Sensor Installation',
            description: 'Vehicle detection, environmental sensors, IoT devices',
          },
          {
            item: 'Central Control System',
            description: 'Server setup, software installation, network infrastructure',
          },
        ],
        estimated_duration: '5 months',
        dependencies: ['wp-002'],
      },
    ],
    technical_specifications: {
      standards: [
        'Indian Roads Congress (IRC) guidelines - IRC:35-2015',
        'Ministry of Road Transport and Highways specifications',
        'National Building Code of India 2016',
        'ISO 9001:2015 for quality management',
        'ISO 14001:2015 for environmental management',
      ],
      quality_requirements: [
        'Concrete strength: M40 grade minimum',
        'Steel reinforcement: Fe500D grade, high yield strength',
        'Surface finish as per drawing specifications',
        'Quality assurance testing for all materials',
        'Third-party inspection at critical stages',
      ],
      materials_specification: [
        {
          material: 'Cement',
          specification: 'OPC Grade 53, IS 12269',
          source: 'Approved suppliers only',
          testing_standard: 'IS 4031',
        },
        {
          material: 'Steel Reinforcement',
          specification: 'Fe500D deformed bars, IS 1786',
          source: 'BIS certified manufacturers',
          testing_standard: 'IS 1608',
        },
        {
          material: 'Coarse Aggregate',
          specification: '20mm and 10mm graded, IS 2386',
          testing_standard: 'IS 2386',
        },
      ],
      testing_requirements: [
        'Concrete cube testing at 7 and 28 days strength',
        'Steel reinforcement certification',
        'Soil bearing capacity testing',
        'Quality control testing on all materials before use',
      ],
    },
    deliverables: [
      {
        item: 'Site Clearance Completion',
        description: 'All site preparation and utility relocation completed and approved',
        timeline: '3 months',
      },
      {
        item: 'Structural Completion Certificate',
        description: 'Completion of all structural works with inspection approval',
        timeline: '11 months',
      },
      {
        item: 'Smart Systems Operational',
        description: 'All smart systems installed, tested, and operational',
        timeline: '16 months',
      },
      {
        item: 'Project Completion and Handover',
        description: 'Final inspection, defect rectification, and handover to client',
        timeline: '18 months',
      },
    ],
    exclusions: [
      'Land acquisition and clearance (to be done by client)',
      'Utility maintenance post-completion (responsibility of respective authorities)',
      'Permanent staff deployment and operations',
    ],
  },

  // ============================================================================
  // RFP Sections
  // ============================================================================
  rfp_sections: {
    rfp_summary: {
      total_sections: 5,
      total_requirements: 45,
    },
    sections: [
      {
        section_name: 'Eligibility Criteria',
        section_title: 'Bidder Qualification Requirements',
        summary: 'Bidder must meet minimum experience, financial, and organizational requirements to be eligible for this tender.',
        key_requirements: [
          'Minimum 10 years experience in road construction projects',
          'Minimum average annual turnover of ₹25 crore in last 3 years',
          'No blacklisting by any government authority in past 5 years',
          'Valid GSTIN registration and tax compliance',
          'Company must be registered as per Companies Act, 1956',
        ],
        compliance_issues: [
          'Document verification may take 2-3 weeks',
          'CA-certified financials required (not preliminary)',
          'All project certificates must be original or certified copies',
        ],
        page_references: ['Page 15-18', 'Annex A'],
      },
      {
        section_name: 'Technical Specifications',
        section_title: 'Construction Standards and Requirements',
        summary: 'Complete technical requirements including materials, methods, quality standards, and smart systems integration.',
        key_requirements: [
          'M40 grade concrete for all structural elements',
          'Fe500D reinforcement steel with proper testing certificates',
          'All work as per IRC:35-2015 guidelines and NBC 2016',
          'Smart systems integration with ISO 27001 compliance',
          'Environmental and safety compliance as per Building Workers Act',
        ],
        compliance_issues: [
          'Smart systems must be sourced from DIN certified manufacturers only',
          'Third-party inspection required at critical stages (foundation, structural completion)',
          'Weekly quality testing reports mandatory',
        ],
        page_references: ['Page 25-35', 'Annex B-1', 'Annex B-2'],
      },
      {
        section_name: 'Financial Terms',
        section_title: 'Payment, EMD, and Financial Requirements',
        summary: 'EMD, bid security, payment terms, and financial obligations for contract execution.',
        key_requirements: [
          'EMD: ₹2.5 crore (5% of contract value) - mandatory before bid opening',
          'Performance guarantee: ₹5 crore (10% of contract value) - within 7 days of award',
          'Tender document fee: ₹50,000 non-refundable',
          'Payment: 90% on achievement certificates, 10% on final completion',
          'Advance payment up to 10% for material procurement allowed',
        ],
        compliance_issues: [
          'BG submission delay results in disqualification even if awarded',
          'Retention money not released until all defects corrected',
          'Penalty for delay: 0.5% per week up to 10% of contract value',
        ],
        page_references: ['Page 40-45', 'Annex C'],
      },
      {
        section_name: 'Project Execution',
        section_title: 'Timelines, Milestones, and Deliverables',
        summary: 'Project execution schedule, milestones, completion criteria, and timeline requirements.',
        key_requirements: [
          'Total project duration: 18 months from commencement',
          'Milestone-based completion with penalties for delays',
          'Phased completion with specific deliverables at each stage',
          'Monthly progress reports with photographic evidence mandatory',
          'Weekly site meetings and progress reviews required',
        ],
        compliance_issues: [
          'Weather delays covered only up to 2 weeks (must be documented)',
          'Extension beyond 2 weeks requires government authority approval',
          'No grace period for material availability issues',
        ],
        page_references: ['Page 50-55', 'Annex D', 'Schedule-Gantt Chart'],
      },
      {
        section_name: 'Compliance and Regulatory',
        section_title: 'Statutory Requirements and Certifications',
        summary: 'Statutory compliance, permits, licenses, certifications, and regulatory approvals required.',
        key_requirements: [
          'All statutory approvals and permits before work commencement',
          'Environmental clearance and pollution control compliance',
          'Labor law compliance with worker welfare provisions',
          'Safety standards as per Building and Other Construction Workers Act',
          'ISO 45001:2018 (Occupational Health & Safety) certification mandatory',
        ],
        compliance_issues: [
          'Environmental impact assessment required before mobilization',
          'Community engagement plan must be submitted for approval',
          'Regular compliance audits by third-party agencies',
          'Insurance coverage must be maintained throughout project duration',
        ],
        page_references: ['Page 60-65', 'Annex E-1', 'Annex E-2'],
      },
    ],
  },

  // ============================================================================
  // Data Sheet
  // ============================================================================
  data_sheet: {
    project_information: [
      { label: 'Tender Number', value: 'MCD/2024/001', highlight: true },
      { label: 'Project Title', value: 'Construction and Development of Smart Road Junction', highlight: true },
      { label: 'Issuing Organization', value: 'Municipal Corporation of Delhi' },
      { label: 'Project Category', value: 'Civil Works - Road Infrastructure' },
      { label: 'Project Location', value: 'New Delhi, Central District, Delhi' },
    ],
    contract_details: [
      { label: 'Contract Type', value: 'Fixed price competitive bidding', highlight: true },
      { label: 'Contract Period', value: '18 months from project commencement' },
      { label: 'Contract Form', value: 'Standard CPWD Form' },
      { label: 'Governing Law', value: 'Indian Contract Act, 1872' },
    ],
    financial_details: [
      { label: 'Contract Value', value: '₹50,00,00,000', type: 'money', highlight: true },
      { label: 'EMD Amount', value: '₹2,50,00,000', type: 'money' },
      { label: 'EMD Percentage', value: '5% of contract value' },
      { label: 'Performance Guarantee', value: '₹5,00,00,000', type: 'money' },
      { label: 'Tender Document Fee', value: '₹50,000', type: 'money' },
    ],
    technical_summary: [
      { label: 'Scope Area', value: '15,000 square meters' },
      { label: 'Project Duration', value: '18 months' },
      { label: 'Quality Standards', value: 'IRC Guidelines and NBC 2016' },
      { label: 'Special Features', value: 'Smart traffic management and IoT monitoring systems' },
    ],
    important_dates: [
      { label: 'Pre-bid Meeting', value: '20-Feb-2024', type: 'date' },
      { label: 'Bid Submission Deadline', value: '29-Feb-2024 17:00 hrs', type: 'date', highlight: true },
      { label: 'Technical Bid Opening', value: '05-Mar-2024 11:00 hrs', type: 'date' },
      { label: 'Financial Bid Opening', value: '12-Mar-2024 14:00 hrs', type: 'date' },
      { label: 'Expected Award Date', value: '20-Mar-2024', type: 'date' },
      { label: 'Project Start Date', value: '15-Apr-2024', type: 'date' },
    ],
  },

  // ============================================================================
  // Templates
  // ============================================================================
  templates: {
    bid_submission_forms: [
      {
        id: 'form-001',
        name: 'Technical Bid Form',
        description: 'Main technical proposal document containing methodology and approach',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex A',
      },
      {
        id: 'form-002',
        name: 'Financial Bid Template',
        description: 'Detailed financial proposal with rate analysis',
        format: 'excel',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex B',
      },
      {
        id: 'form-003',
        name: 'Cover Letter and Declaration',
        description: 'Bidder information and compliance declaration',
        format: 'word',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex A1',
      },
    ],
    financial_formats: [
      {
        id: 'fin-001',
        name: 'Bill of Quantities (BOQ)',
        description: 'Itemized cost breakdown for all work items',
        format: 'excel',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex B1',
      },
      {
        id: 'fin-002',
        name: 'Rate Analysis Format',
        description: 'Detailed labor, material, and overhead costs analysis',
        format: 'excel',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex B2',
      },
      {
        id: 'fin-003',
        name: 'Financial Capacity Statement',
        description: 'CA-certified statement of financial capacity',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: false,
        annex: 'Annex B3',
      },
    ],
    technical_documents: [
      {
        id: 'tech-001',
        name: 'Construction Methodology Document',
        description: 'Detailed project execution plan and methodology with timelines',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex C',
      },
      {
        id: 'tech-002',
        name: 'Quality Assurance Plan',
        description: 'Quality control and testing procedures with inspection points',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex D',
      },
      {
        id: 'tech-003',
        name: 'Project Schedule (Gantt Chart)',
        description: 'Detailed project timeline with all milestones and dependencies',
        format: 'excel',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex E',
      },
      {
        id: 'tech-004',
        name: 'Safety and Environmental Plan',
        description: 'Comprehensive safety and environmental management strategy',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex F',
      },
    ],
    compliance_formats: [
      {
        id: 'comp-001',
        name: 'Experience Certificate Format',
        description: 'Template for previous project completion certificates',
        format: 'word',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex G',
      },
      {
        id: 'comp-002',
        name: 'Bank Guarantee Format',
        description: 'EMD and Performance Guarantee format as per specifications',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex H',
      },
      {
        id: 'comp-003',
        name: 'Eligibility Compliance Checklist',
        description: 'Checklist for verifying all eligibility requirements',
        format: 'word',
        downloadUrl: '#',
        mandatory: false,
        annex: 'Annex I',
      },
      {
        id: 'comp-004',
        name: 'Authority Compliance Certificate',
        description: 'Certificate of no blacklisting and statutory compliance',
        format: 'pdf',
        downloadUrl: '#',
        mandatory: true,
        annex: 'Annex J',
      },
    ],
  },
};
