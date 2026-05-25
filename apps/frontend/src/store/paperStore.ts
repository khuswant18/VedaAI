import { create } from 'zustand';
import { getPaper, regenerateAssignment } from '@/services/api';
import type { GeneratedPaper } from '@vedaai/shared';
import { useToastStore } from './toastStore';

interface PaperStore {
  paper: GeneratedPaper | null;
  isLoading: boolean;
  error: string | null;
  fetchPaper: (assignmentId: string) => Promise<void>;
  clearPaper: () => void;
  regenerate: (assignmentId: string) => Promise<string | null>;
}

export const usePaperStore = create<PaperStore>((set) => ({
  paper: null,
  isLoading: false,
  error: null,

  fetchPaper: async (assignmentId: string) => {
    set({ isLoading: true, error: null });

    try {
      const paper = await getPaper(assignmentId);

      if (paper) {
        set({ paper, isLoading: false });
      } else {
        set({ isLoading: false, error: 'Paper not found or still generating' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch paper';
      set({ isLoading: false, error: message });
      useToastStore.getState().addToast(message, 'error');
    }
  },

  clearPaper: () => {
    set({ paper: null, isLoading: false, error: null });
  },

  regenerate: async (assignmentId: string) => {
    try {
      set({ paper: null, isLoading: true, error: null });
      const result = await regenerateAssignment(assignmentId);
      useToastStore.getState().addToast('Regeneration started!', 'info');
      return result.jobId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to regenerate';
      set({ isLoading: false, error: message });
      useToastStore.getState().addToast(message, 'error');
      return null;
    }
  },
}));
