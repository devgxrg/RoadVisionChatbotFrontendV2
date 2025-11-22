import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  fetchTenderAnalysis,
  downloadAnalysisReport,
  triggerTenderAnalysis,
} from '@/lib/api/analyze.api';
import { fetchTenderById } from '@/lib/api/tenderiq';
import { TenderAnalysisResponse } from '@/lib/types/analyze.type';
import { useToast } from '@/hooks/use-toast';
import AnalyzeTenderUI from './components/AnalyzeTenderUI';

export default function AnalyzeTender() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('one-pager');
  const [isTriggering, setIsTriggering] = useState(false);

  // Fetch tender details to get TDR
  const { data: tenderDetails } = useQuery({
    queryKey: ['tenderDetails', id],
    queryFn: () => fetchTenderById(id!),
    enabled: !!id,
  });

  const tenderRef = tenderDetails?.tenderNo;

  // Fetch tender analysis with live polling support
  const {
    data: analysis,
    isLoading,
    isError,
    error,
  } = useQuery<TenderAnalysisResponse, Error>({
    queryKey: ['tenderAnalysis', id],
    queryFn: () => fetchTenderAnalysis(id!),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleBack = () => navigate('/tenderiq');

  const handleNavigateToBidSynopsis = () => navigate(`/synopsis/${id}`);

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
      toast({
        title: 'Success',
        description: `Analysis report downloaded as ${format.toUpperCase()}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to download analysis report',
        variant: 'destructive',
      });
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!tenderRef) {
      toast({
        title: 'Error',
        description: 'Tender reference not found',
        variant: 'destructive',
      });
      return;
    }

    setIsTriggering(true);

    try {
      const response = await triggerTenderAnalysis(tenderRef);

      if (response.analysis_exists) {
        toast({
          title: 'Analysis Already Exists',
          description: `This tender has already been analyzed. Status: ${response.status}`,
        });
      } else {
        const queueMessage = response.has_active_analysis
          ? `Analysis queued at position ${response.queue_position}`
          : 'Analysis started successfully';

        toast({
          title: 'Analysis Started',
          description: queueMessage,
        });

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tenderAnalysis', id] });
        }, 2000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to trigger analysis',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
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
      onNavigateToBidSynopsis={handleNavigateToBidSynopsis}
      onTriggerAnalysis={handleTriggerAnalysis}
      isTriggering={isTriggering}
      tenderId={tenderRef}
    />
  );
}
