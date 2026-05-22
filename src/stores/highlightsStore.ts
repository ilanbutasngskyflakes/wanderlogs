import { create } from "zustand";

export const HIGHLIGHT_TAGS = [
  "food",
  "nature",
  "culture",
  "adventure",
  "city",
  "people",
  "night",
  "beach",
  "mountains",
  "architecture",
] as const;

export type HighlightTag = (typeof HIGHLIGHT_TAGS)[number];

interface HighlightsState {
  selectedTags: HighlightTag[];
  toggleTag: (tag: HighlightTag) => void;
  setSelectedTags: (tags: HighlightTag[]) => void;
  clearSelectedTags: () => void;
}

export const useHighlightsStore = create<HighlightsState>((set) => ({
  selectedTags: [],

  toggleTag: (tag: HighlightTag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),

  setSelectedTags: (tags: HighlightTag[]) => set({ selectedTags: tags }),

  clearSelectedTags: () => set({ selectedTags: [] }),
}));
