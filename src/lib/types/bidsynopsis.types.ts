/**
 * Type definitions for Bid Synopsis functionality
 */

export interface BasicInfoItem {
  sno: number;
  item: string;
  description: string;
}

export interface RequirementItem {
  description: string;
  requirement: string;
  extractedValue: string;
  ceigallValue: string;
}

export interface SynopsisContent {
  basicInfo: BasicInfoItem[];
  allRequirements: RequirementItem[];
}

export interface BidSynopsisData {
  ceigallData: Record<number, string>;
  requirementData: Record<number, string>;
  extractedValueData: Record<number, string>;
  synopsisContent: SynopsisContent;
  timestamp?: string;
}

export interface BidSynopsisProps {
  tenderId: string;
  tenderTitle?: string;
  tenderAuthority?: string;
  tenderValue?: number;
  tenderEmd?: number;
  tenderDueDate?: string;
  tenderLength?: string;
}
