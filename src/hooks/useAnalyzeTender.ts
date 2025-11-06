/**
 * Custom Hook for Tender Analysis Workflow
 * Manages the complete analysis lifecycle from initiation to results
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  initiateAnalysis,
  getAnalysisStatus,
  getAnalysisResults,
  pollAnalysisCompletion,
  getRiskAssessment,
  getRFPAnalysis,
  getScopeOfWork,
  generateOnePager,
  generateDataSheet,
  deleteAnalysis,
} from '@/lib/api/analyze';
import {
  AnalyzeTenderRequest,
  AnalysisInitiatedResponse,
  AnalysisStatusResponse,
  AnalysisResultsResponse,
  RiskAssessmentResponse,
  RFPAnalysisResponse,
  ScopeOfWorkResponse,
  OnePagerResponse,
  DataSheetResponse,
  GenerateOnePagerRequest,
} from '@/lib/types/analyze';
import { useToast } from '@/hooks/use-toast';

interface UseAnalyzeTenderOptions {
  tenderId: string;
  autoStartAnalysis?: boolean;
  pollInterval?: number; // milliseconds
}

interface UseAnalyzeTenderResult {
  // State
  analysisId: string | null;
  analysisStatus: AnalysisStatusResponse | null;
  analysisResults: AnalysisResultsResponse | null;
  riskAssessment: RiskAssessmentResponse | null;
  rfpAnalysis: RFPAnalysisResponse | null;
  scopeOfWork: ScopeOfWorkResponse | null;
  onePager: OnePagerResponse | null;
  dataSheet: DataSheetResponse | null;

  // Loading & Error States
  isInitiating: boolean;
  isPolling: boolean;
  isLoading: boolean;
  error: Error | null;

  // Progress
  progress: number; // 0-100
  currentStep: string;

  // Actions
  startAnalysis: (options?: AnalyzeTenderRequest) => Promise<void>;
  pollStatus: () => Promise<void>;
  fetchResults: () => Promise<void>;
  fetchRisks: (depth?: 'summary' | 'detailed') => Promise<void>;
  fetchRFP: (sectionNumber?: string) => Promise<void>;
  fetchScope: () => Promise<void>;
  generatePager: (options?: GenerateOnePagerRequest) => Promise<void>;
  generateSheet: (format?: 'json' | 'csv' | 'excel') => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing tender analysis workflow
 * Handles initiation, polling, and result retrieval
 */
export const useAnalyzeTender = (options: UseAnalyzeTenderOptions): UseAnalyzeTenderResult => {
  const { tenderId, autoStartAnalysis = false, pollInterval = 2000 } = options;
  const { toast } = useToast();

  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatusResponse | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultsResponse | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResponse | null>(null);
  const [rfpAnalysis, setRfpAnalysis] = useState<RFPAnalysisResponse | null>(null);
  const [scopeOfWork, setScopeOfWork] = useState<ScopeOfWorkResponse | null>(null);
  const [onePager, setOnePager] = useState<OnePagerResponse | null>(null);
  const [dataSheet, setDataSheet] = useState<DataSheetResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Mutation: Initiate analysis
  const initiateAnalysisMutation = useMutation({
    mutationFn: async (request: AnalyzeTenderRequest) => {
      return initiateAnalysis(tenderId, request);
    },
    onSuccess: (response) => {
      setAnalysisId(response.analysis_id);
      setError(null);
      toast({
        title: 'Analysis Started',
        description: `Analysis for tender has been initiated. Processing time: ~${(response.estimated_completion_time / 1000).toFixed(0)}s`,
      });
    },
    onError: (err: Error) => {
      setError(err);
      toast({
        title: 'Error',
        description: `Failed to initiate analysis: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  // Query: Analysis status
  const statusQuery = useQuery({
    queryKey: ['analysisStatus', analysisId],
    queryFn: () => (analysisId ? getAnalysisStatus(analysisId) : null),
    enabled: !!analysisId && isPolling,
    refetchInterval: pollInterval,
    staleTime: 0,
  });

  // Update local status when query succeeds
  useEffect(() => {
    if (statusQuery.data) {
      setAnalysisStatus(statusQuery.data);
    }
  }, [statusQuery.data]);

  // Stop polling when analysis completes
  useEffect(() => {
    if (analysisStatus?.status === 'completed') {
      setIsPolling(false);
    }
  }, [analysisStatus?.status]);

  // Query: Analysis results
  const resultsQuery = useQuery({
    queryKey: ['analysisResults', analysisId],
    queryFn: () => (analysisId ? getAnalysisResults(analysisId) : null),
    enabled: !!analysisId && analysisStatus?.status === 'completed',
  });

  useEffect(() => {
    if (resultsQuery.data) {
      setAnalysisResults(resultsQuery.data);
    }
  }, [resultsQuery.data]);

  // Query: Risk assessment
  const riskQuery = useQuery({
    queryKey: ['riskAssessment', tenderId],
    queryFn: () => getRiskAssessment(tenderId, { depth: 'detailed' }),
    enabled: false, // Manual fetch
  });

  // Query: RFP analysis
  const rfpQuery = useQuery({
    queryKey: ['rfpAnalysis', tenderId],
    queryFn: () => getRFPAnalysis(tenderId, { includeCompliance: true }),
    enabled: false, // Manual fetch
  });

  // Query: Scope of work
  const scopeQuery = useQuery({
    queryKey: ['scopeOfWork', tenderId],
    queryFn: () => getScopeOfWork(tenderId),
    enabled: false, // Manual fetch
  });

  // Mutation: Generate one-pager
  const onePagerMutation = useMutation({
    mutationFn: (request: GenerateOnePagerRequest) => generateOnePager(tenderId, request),
    onSuccess: (response) => {
      setOnePager(response);
      toast({
        title: 'One-Pager Generated',
        description: 'Executive summary has been generated successfully',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Error',
        description: `Failed to generate one-pager: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation: Generate data sheet
  const dataSheetMutation = useMutation({
    mutationFn: (format: 'json' | 'csv' | 'excel' = 'json') =>
      generateDataSheet(tenderId, { format, includeAnalysis: true }),
    onSuccess: (response) => {
      setDataSheet(response);
      toast({
        title: 'Data Sheet Generated',
        description: 'Tender data sheet has been generated successfully',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Error',
        description: `Failed to generate data sheet: ${err.message}`,
        variant: 'destructive',
      });
    },
  });

  // Actions
  const startAnalysis = useCallback(
    async (request: AnalyzeTenderRequest = {}) => {
      setError(null);
      setAnalysisResults(null);
      setIsPolling(true);
      await initiateAnalysisMutation.mutateAsync(request);
    },
    [initiateAnalysisMutation]
  );

  const pollStatus = useCallback(async () => {
    if (!analysisId) return;
    setIsPolling(true);
    try {
      const status = await getAnalysisStatus(analysisId);
      setAnalysisStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [analysisId]);

  const fetchResults = useCallback(async () => {
    if (!analysisId) return;
    try {
      const results = await getAnalysisResults(analysisId);
      setAnalysisResults(results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [analysisId]);

  const fetchRisks = useCallback(
    async (depth: 'summary' | 'detailed' = 'detailed') => {
      try {
        const risks = await getRiskAssessment(tenderId, { depth });
        setRiskAssessment(risks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [tenderId]
  );

  const fetchRFP = useCallback(
    async (sectionNumber?: string) => {
      try {
        const rfp = await getRFPAnalysis(tenderId, { sectionNumber, includeCompliance: true });
        setRfpAnalysis(rfp);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [tenderId]
  );

  const fetchScope = useCallback(async () => {
    try {
      const scope = await getScopeOfWork(tenderId);
      setScopeOfWork(scope);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [tenderId]);

  const generatePager = useCallback(
    async (request: GenerateOnePagerRequest = {}) => {
      await onePagerMutation.mutateAsync(request);
    },
    [onePagerMutation]
  );

  const generateSheet = useCallback(
    async (format: 'json' | 'csv' | 'excel' = 'json') => {
      await dataSheetMutation.mutateAsync(format);
    },
    [dataSheetMutation]
  );

  const reset = useCallback(() => {
    setAnalysisId(null);
    setAnalysisStatus(null);
    setAnalysisResults(null);
    setRiskAssessment(null);
    setRfpAnalysis(null);
    setScopeOfWork(null);
    setOnePager(null);
    setDataSheet(null);
    setError(null);
    setIsPolling(false);
  }, []);

  // Auto-start analysis if enabled
  useEffect(() => {
    if (autoStartAnalysis && !analysisId) {
      startAnalysis();
    }
  }, [autoStartAnalysis, analysisId, startAnalysis]);

  // Calculate progress based on status
  const progress = analysisStatus?.progress || 0;
  const currentStep = analysisStatus?.current_step || '';

  return {
    // State
    analysisId,
    analysisStatus,
    analysisResults,
    riskAssessment,
    rfpAnalysis,
    scopeOfWork,
    onePager,
    dataSheet,

    // Loading & Error
    isInitiating: initiateAnalysisMutation.isPending,
    isPolling: statusQuery.isFetching,
    isLoading:
      initiateAnalysisMutation.isPending ||
      statusQuery.isFetching ||
      resultsQuery.isFetching ||
      riskQuery.isFetching ||
      rfpQuery.isFetching ||
      scopeQuery.isFetching ||
      onePagerMutation.isPending ||
      dataSheetMutation.isPending,
    error: error || initiateAnalysisMutation.error || null,

    // Progress
    progress,
    currentStep,

    // Actions
    startAnalysis,
    pollStatus,
    fetchResults,
    fetchRisks,
    fetchRFP,
    fetchScope,
    generatePager,
    generateSheet,
    reset,
  };
};
