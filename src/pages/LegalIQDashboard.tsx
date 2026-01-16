import { LegalIQDashboardUI } from "@/components/legaliq/LegalIQDashboardUI";

const legaliqModules = [
  {
    id: 'case-tracker',
    name: 'Case Tracker',
    route: '/legaliq/cases',
    icon: 'Briefcase',
    description: 'Track and manage your legal cases',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'document-drafting',
    name: 'Document Drafting',
    route: '/legaliq/drafting',
    icon: 'FileEdit',
    description: 'Generate legal documents from templates',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'document-compare',
    name: 'Document Compare',
    route: '/legaliq/compare',
    icon: 'FileDiff',
    description: 'Compare two versions of a document',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'legal-research',
    name: 'Legal Research',
    route: '/legaliq/research',
    icon: 'Search',
    description: 'Search and analyze legal precedents',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'analyze-document',
    name: 'Analyze Document',
    route: '/legaliq/analyze',
    icon: 'FileSearch',
    description: 'Extract insights from legal documents',
    color: 'from-pink-500 to-rose-500',
  },
];

export default function LegalIQDashboard() {
  return <LegalIQDashboardUI modules={legaliqModules} />;
}