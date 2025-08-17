import { create } from 'zustand';
import { Bug, BugFormData, BugFilters, BugStats } from '../types/Bug';
import BugAPI from '../api/bugApi';
import { sampleBugs, getBugStats } from '../utils/sampleData';

interface BugStore {
  // State
  bugs: Bug[];
  loading: boolean;
  error: string | null;
  filters: BugFilters;
  
  // Actions
  loadBugs: () => Promise<void>;
  createBug: (bugData: BugFormData, reporter: string) => Promise<Bug | null>;
  updateBug: (id: string, updates: Partial<Bug>) => Promise<Bug | null>;
  deleteBug: (id: string) => Promise<boolean>;
  searchBugs: (query: string) => Promise<Bug[]>;
  setFilters: (filters: BugFilters) => void;
  clearError: () => void;
  
  // Computed values
  getStats: () => BugStats;
  getFilteredBugs: () => Bug[];
  getBugById: (id: string) => Bug | undefined;
}

export const useBugStore = create<BugStore>((set, get) => {
  // Initialize API with sample data
  BugAPI.initializeWithSampleData(sampleBugs);

  return {
    // Initial state
    bugs: [],
    loading: false,
    error: null,
    filters: {},

    // Actions
    loadBugs: async () => {
      set({ loading: true, error: null });
      try {
        const bugs = await BugAPI.getBugs(get().filters);
        set({ bugs, loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load bugs',
          loading: false 
        });
      }
    },

    createBug: async (bugData: BugFormData, reporter: string) => {
      set({ loading: true, error: null });
      try {
        const newBug = await BugAPI.createBug(bugData, reporter);
        const currentBugs = get().bugs;
        set({ 
          bugs: [newBug, ...currentBugs],
          loading: false 
        });
        return newBug;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to create bug',
          loading: false 
        });
        return null;
      }
    },

    updateBug: async (id: string, updates: Partial<Bug>) => {
      set({ loading: true, error: null });
      try {
        const updatedBug = await BugAPI.updateBug(id, updates);
        if (updatedBug) {
          const currentBugs = get().bugs;
          const updatedBugs = currentBugs.map(bug =>
            bug.id === id ? updatedBug : bug
          );
          set({ 
            bugs: updatedBugs,
            loading: false 
          });
          return updatedBug;
        }
        set({ loading: false });
        return null;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update bug',
          loading: false 
        });
        return null;
      }
    },

    deleteBug: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const success = await BugAPI.deleteBug(id);
        if (success) {
          const currentBugs = get().bugs;
          const filteredBugs = currentBugs.filter(bug => bug.id !== id);
          set({ 
            bugs: filteredBugs,
            loading: false 
          });
        }
        set({ loading: false });
        return success;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to delete bug',
          loading: false 
        });
        return false;
      }
    },

    searchBugs: async (query: string) => {
      set({ loading: true, error: null });
      try {
        const bugs = await BugAPI.searchBugs(query);
        set({ bugs, loading: false });
        return bugs;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to search bugs',
          loading: false 
        });
        return [];
      }
    },

    setFilters: (filters: BugFilters) => {
      set({ filters });
      // Reload bugs with new filters
      get().loadBugs();
    },

    clearError: () => {
      set({ error: null });
    },

    // Computed values
    getStats: () => {
      const bugs = get().bugs;
      return getBugStats(bugs);
    },

    getFilteredBugs: () => {
      const { bugs, filters } = get();
      
      if (!filters || Object.keys(filters).length === 0) {
        return bugs;
      }

      let filtered = [...bugs];

      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(bug => 
          filters.status!.includes(bug.status)
        );
      }

      if (filters.priority && filters.priority.length > 0) {
        filtered = filtered.filter(bug => 
          filters.priority!.includes(bug.priority)
        );
      }

      if (filters.assignee && filters.assignee.length > 0) {
        filtered = filtered.filter(bug => 
          bug.assignee && filters.assignee!.includes(bug.assignee)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(bug => 
          bug.tags.some(tag => filters.tags!.includes(tag))
        );
      }

      return filtered;
    },

    getBugById: (id: string) => {
      return get().bugs.find(bug => bug.id === id);
    },
  };
});
