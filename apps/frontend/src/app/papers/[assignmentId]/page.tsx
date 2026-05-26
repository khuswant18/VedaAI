'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { PaperView } from '@/components/paper/PaperView';
import { JobProgress } from '@/components/progress/JobProgress';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { usePaperStore } from '@/store/paperStore';
import { useSocket } from '@/hooks/useSocket';
import { useJobStatus } from '@/hooks/useJobStatus';
import { useToastStore } from '@/store/toastStore';
import { getAssignment } from '@/services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { GeneratedPaper } from '@vedaai/shared';

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;

  const { paper, isLoading, error, fetchPaper, regenerate, clearPaper } =
    usePaperStore();
  const { addToast } = useToastStore();

  const [assignmentDueDate, setAssignmentDueDate] = useState<string>('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const jobStatus = useJobStatus(currentJobId);

  useEffect(() => {
    async function loadAssignment() {
      try {
        const assignment = await getAssignment(assignmentId);
        setAssignmentDueDate(assignment.dueDate);
      } catch {
      }
    }
    loadAssignment();
  }, [assignmentId]);

  useEffect(() => {
    fetchPaper(assignmentId);
    return () => clearPaper();
  }, [assignmentId, fetchPaper, clearPaper]);

  const handleCompleted = useCallback(() => {
    setCurrentJobId(null);
    setIsRegenerating(false);
    fetchPaper(assignmentId);
    addToast('Paper regenerated successfully!', 'success');
  }, [assignmentId, fetchPaper, addToast]);

  useSocket(currentJobId, {
    onCompleted: handleCompleted,
    onFailed: (data) => {
      setIsRegenerating(false);
      addToast(`Regeneration failed: ${data.error}`, 'error');
    },
  });

  useEffect(() => {
    if (jobStatus?.status === 'completed' && currentJobId) {
      handleCompleted();
    }
  }, [jobStatus, currentJobId, handleCompleted]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const jobId = await regenerate(assignmentId);
    if (jobId) {
      setCurrentJobId(jobId);
    } else {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!paper) return;

    try {
      const { generatePaperPDF } = await import('@/lib/pdfExport');
      await generatePaperPDF(paper as GeneratedPaper);
      addToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      addToast('Failed to generate PDF. Please try again.', 'error');
      console.error('PDF generation error:', err);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Question Paper" showBack backHref="/" />

      <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-4xl mx-auto">
        {isLoading && !paper ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500 mt-4 text-center px-4 animate-pulse">
              Render backend is starting up, this might take up to a minute...
            </p>
          </div>
        ) : error && !paper ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to load paper
            </h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => fetchPaper(assignmentId)}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          </div>
        ) : paper ? (
          <PaperView
            paper={paper}
            dueDate={assignmentDueDate}
            onRegenerate={handleRegenerate}
            onDownloadPDF={handleDownloadPDF}
            isRegenerating={isRegenerating}
          />
        ) : null}
      </div>

      {}
      {isRegenerating && currentJobId && (
        <JobProgress
          step={jobStatus?.step}
          status={jobStatus?.status ?? 'pending'}
          error={jobStatus?.error}
          onRetry={handleRegenerate}
        />
      )}
    </div>
  );
}
