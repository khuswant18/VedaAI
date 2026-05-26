'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { AssignmentForm } from '@/components/forms/AssignmentForm';
import { JobProgress } from '@/components/progress/JobProgress';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useSocket } from '@/hooks/useSocket';
import { useJobStatus } from '@/hooks/useJobStatus';

export default function NewAssignmentPage() {
  const router = useRouter();
  const {
    currentJobId,
    submittedAssignmentId,
    reset,
  } = useAssignmentStore();
  const [showProgress, setShowProgress] = useState(false);

  const jobStatus = useJobStatus(currentJobId);

  const handleCompleted = useCallback(
    (data: { assignmentId: string }) => {
      setTimeout(() => {
        router.push(`/papers/${data.assignmentId}`);
      }, 1000);
    },
    [router]
  );

  useSocket(currentJobId, {
    onCompleted: handleCompleted,
  });

  const handleSubmitSuccess = () => {
    setShowProgress(true);
  };

  const handleRetry = () => {
    reset();
    setShowProgress(false);
  };

  React.useEffect(() => {
    if (
      jobStatus?.status === 'completed' &&
      submittedAssignmentId
    ) {
      setTimeout(() => {
        router.push(`/papers/${submittedAssignmentId}`);
      }, 1000);
    }
  }, [jobStatus, submittedAssignmentId, router]);

  return (
    <div className="min-h-screen">
      <Header title="Assignment" showBack backHref="/" />

      <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 max-w-3xl mx-auto">
        {}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Create Assignment
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Set up a new assignment for your students
          </p>
        </div>

        {}
        <AssignmentForm onSubmitSuccess={handleSubmitSuccess} />
      </div>

      {}
      {showProgress && currentJobId && (
        <JobProgress
          step={jobStatus?.step}
          status={jobStatus?.status ?? 'pending'}
          error={jobStatus?.error}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
