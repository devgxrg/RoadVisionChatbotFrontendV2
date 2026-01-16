import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchTenderAnalysis, downloadAnalysisReport, triggerTenderAnalysis } from '@/lib/api/analyze.api';
import { TenderAnalysisResponse } from '@/lib/types/analyze.type';
import { useToast } from '@/hooks/use-toast';
import AnalyzeTenderUI from './components/AnalyzeTenderUI';

export default function AnalyzeTender() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('one-pager');

  // Get return path from state if provided
  const returnPath = (location.state as any)?.returnPath;

  // Debug: log component mount and params
  console.log('AnalyzeTender component mounted with id:', id);

  // Fetch complete analysis in one query
  const {
    data: analysis,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TenderAnalysisResponse, Error>({
    queryKey: ['tenderAnalysis', id],
    queryFn: () => fetchTenderAnalysis(id!),
    enabled: !!id,
    retry: 0, // Don't retry on 404
    // Poll when analysis is in progress or data exists
    refetchInterval: (query) => {
      const data = query.state.data as TenderAnalysisResponse | undefined;
      
      // Poll if:
      // 1. Data exists and status is not completed/failed
      // 2. No data exists yet (analysis might be initializing)
      if (!data) {
        // No data yet - poll every 5 seconds to catch initial status
        return 5000;
      }
      
      const isProcessing = data.status && 
        data.status !== 'completed' && 
        data.status !== 'failed';
      
      if (isProcessing) {
        // Poll every 10 seconds while processing (faster than 20s for better UX)
        return 10000;
      }
      
      // Don't poll: completed, failed, or just exists
      return false;
    },
    refetchIntervalInBackground: true,
  });

  const handleBack = () => {
    if (returnPath) {
      navigate(returnPath);
    } else {
      navigate('/tenderiq');
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'excel' | 'word') => {
    if (!id) {
      toast({
        title: 'Error',
        description: 'No analysis data available to download',
        variant: 'destructive',
      });
      return;
    }

    try {
      await downloadAnalysisReport(id, format);
      const formatNames = { pdf: 'PDF', excel: 'Excel', word: 'Word' };
      toast({
        title: 'Success',
        description: `Analysis report downloaded as ${formatNames[format]}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download analysis report',
        variant: 'destructive',
      });
    }
  };

  const handleViewBidSynopsis = () => {
    if (id) {
      navigate(`/synopsis/${id}`);
    }
  };

  const handleStartAnalysis = async () => {
    if (!id) return;
    
    // Show toast immediately without waiting
    toast({
      title: 'Analysis Started! 🚀',
      description: 'Analysis is being processed. This page will update automatically with progress.',
    });
    
    console.log('Starting analysis for tender:', id);
    
    try {
      // Trigger analysis
      const result = await triggerTenderAnalysis(id);
      console.log('Analysis trigger result:', result);
      
      if (result.status === 'already_analyzed') {
        toast({
          title: 'Analysis already exists',
          description: result.message || 'We found an existing analysis for this tender.',
        });
      }
      
      // Immediately refetch to get updated status and activate polling
      // Use skipCache to ensure fresh data from server
      await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start analysis';
      console.error('Analysis start error:', err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AnalyzeTenderUI
      analysis={analysis}
      isLoading={isLoading}
      isError={isError}
      error={error?.message || null}
      activeTab={activeTab}
      tenderId={id}
      onTabChange={setActiveTab}
      onBack={handleBack}
      onDownloadReport={handleDownloadReport}
      onViewBidSynopsis={handleViewBidSynopsis}
      onStartAnalysis={handleStartAnalysis}
    />
  );
}
