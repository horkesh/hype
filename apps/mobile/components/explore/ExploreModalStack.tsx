import React from 'react';

import { ExploreFilterModal } from '@/components/explore/ExploreFilterModal';
import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreModalStackProps {
  accentColor: string;
  applyFiltersLabel: string;
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
  categories: ExploreLookupItem[];
  categoriesLabel: string;
  close: () => void;
  filterCategories: string[];
  filterMoods: string[];
  filterOpenNow: boolean;
  filterPriceLevel: number;
  getPriceLevelDisplay: (level: number) => string;
  moods: ExploreLookupItem[];
  onApply: () => void;
  onReset: () => void;
  onSetFilterOpenNow: (value: boolean) => void;
  onSetFilterPriceLevel: (value: number) => void;
  onToggleFilterCategory: (categoryId: string) => void;
  onToggleFilterMood: (moodId: string) => void;
  openNowLabel: string;
  priceLevelLabel: string;
  resetLabel: string;
  textColor: string;
  title: string;
  translate: (key: string) => string;
  visible: boolean;
}

export function ExploreModalStack(props: ExploreModalStackProps) {
  return <ExploreFilterModal {...props} />;
}
