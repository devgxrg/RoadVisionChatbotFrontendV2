import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchTenderAnalysis, downloadAnalysisReport } from '@/lib/api/analyze.api';
import { TenderAnalysisResponse } from '@/lib/types/analyze.type';
import { useToast } from '@/hooks/use-toast';
import AnalyzeTenderUI from './components/AnalyzeTenderUI';

export default function AnalyzeTender() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('one-pager');

  // Fetch complete analysis in one query
  const {
    data: analysis,
    isLoading,
    isError,
    error,
  } = useQuery<TenderAnalysisResponse, Error>({
    queryKey: ['tenderAnalysis', id],
    queryFn: () => fetchTenderAnalysis(id!),
    enabled: !!id,
    // Poll every 2 seconds if analysis is in progress
    refetchInterval: (data) => {
      if (!data) return false;
      const isInProgress = data.status !== 'completed' && data.status !== 'failed';
      return isInProgress ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const handleBack = () => {
    navigate('/tenderiq');
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

  return (
    <AnalyzeTenderUI
      analysis={analysis}
      isLoading={isLoading}
      isError={isError}
      error={error?.message || null}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={handleBack}
      onDownloadReport={handleDownloadReport}
    />
  );
}
