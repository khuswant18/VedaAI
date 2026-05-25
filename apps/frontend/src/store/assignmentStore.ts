import { create } from 'zustand';
import { createAssignment } from '@/services/api';
import type { AssignmentInput } from '@vedaai/shared';
import { useToastStore } from './toastStore';

interface AssignmentStore {
  formData: Partial<AssignmentInput>;
  submittedAssignmentId: string | null;
  currentJobId: string | null;
  isSubmitting: boolean;
  setFormData: (data: Partial<AssignmentInput>) => void;
  submitAssignment: (data: AssignmentInput, file?: File | null) => Promise<void>;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  formData: {},
  submittedAssignmentId: null,
  currentJobId: null,
  isSubmitting: false,

  setFormData: (data) => {
    set((state) => ({ formData: { ...state.formData, ...data } }));
  },

  submitAssignment: async (data, file) => {
    set({ isSubmitting: true });

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subject', data.subject);
      formData.append('dueDate', data.dueDate);
      formData.append('questionTypes', JSON.stringify(data.questionTypes));
      formData.append('questionsPerType', JSON.stringify(data.questionsPerType));
      formData.append('marksPerType', JSON.stringify(data.marksPerType));

      if (data.additionalInstructions) {
        formData.append('additionalInstructions', data.additionalInstructions);
      }

      if (data.fileContent) {
        formData.append('fileContent', data.fileContent);
      }

      if (file) {
        formData.append('file', file);
      }

      const result = await createAssignment(formData);

      set({
        submittedAssignmentId: result.assignmentId,
        currentJobId: result.jobId,
        isSubmitting: false,
      });
    } catch (error) {
      set({ isSubmitting: false });
      const message = error instanceof Error ? error.message : 'Failed to create assignment';
      useToastStore.getState().addToast(message, 'error');
      throw error;
    }
  },

  reset: () => {
    set({
      formData: {},
      submittedAssignmentId: null,
      currentJobId: null,
      isSubmitting: false,
    });
  },
}));
