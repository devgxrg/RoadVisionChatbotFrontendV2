export interface Hearing {
  date: string;
  judge: string;
  purpose: string;
  outcome: string;
  document: string;
}

export interface CaseDocument {
  name: string;
  uploadDate: string;
  type: string;
}

export interface AIInsights {
  summary: string;
  winProbability: string;
  estimatedDuration: string;
  recommendedAction: string;
}

export interface Case {
  id: number;
  caseTitle: string;
  caseId: string;
  filingNumber: string;
  filingDate: string;
  registrationNumber: string;
  registrationDate: string;
  cnrNumber: string;
  caseType: string;
  jurisdiction: string;
  courtName: string;
  courtNumber: string;
  judgeName: string;
  caseStage: string;
  litigationStatus: string;
  underActs: string;
  sections: string;
  policeStation: string;
  firNumber: string;
  petitioner: string;
  petitionerAdvocate: string;
  respondent: string;
  respondentAdvocate: string;
  hearings: Hearing[];
  documents: CaseDocument[];
  aiInsights?: AIInsights;
}

export interface CaseTrackerData {
  cases: Case[];
  totalActiveCases: number;
  upcomingHearings: number;
  avgCaseDuration: number;
}

