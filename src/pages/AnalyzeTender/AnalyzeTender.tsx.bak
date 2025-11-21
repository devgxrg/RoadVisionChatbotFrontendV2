import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchTenderAnalysis } from '@/lib/api/analyze.api';
import { TenderAnalysisResponse } from '@/lib/types/analyze.type';
import AnalyzeTenderUI from './components/AnalyzeTenderUI';

export default function AnalyzeTender() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  });

  const handleBack = () => {
    navigate('/tenderiq');
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
    />
  );
}
