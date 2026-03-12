import React from 'react';

import { ExploreFilterChipGrid } from '@/components/explore/ExploreFilterChipGrid';
import { ExploreFilterOpenNowRow } from '@/components/explore/ExploreFilterOpenNowRow';
import { ExploreFilterPriceSection } from '@/components/explore/ExploreFilterPriceSection';
import { ExploreLookupItem } from '@/utils/exploreScreen';

interface ExploreFilterContentProps {
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  categories: ExploreLookupItem[];
  categoriesLabel: string;
  filterCategories: string[];
  filterMoods: string[];
  filterOpenNow: boolean;
  filterPriceLevel: number;
  getPriceLevelDisplay: (level: number) => string;
  moods: ExploreLookupItem[];
  onSetFilterOpenNow: (value: boolean) => void;
  onSetFilterPriceLevel: (value: number) => void;
  onToggleFilterCategory: (categoryId: string) => void;
  onToggleFilterMood: (moodId: string) => void;
  openNowLabel: string;
  priceLevelLabel: string;
  textColor: string;
  translate: (key: string) => string;
}

export function ExploreFilterContent({
  accentColor,
  backgroundColor,
  borderColor,
  categories,
  categoriesLabel,
  filterCategories,
  filterMoods,
  filterOpenNow,
  filterPriceLevel,
  getPriceLevelDisplay,
  moods,
  onSetFilterOpenNow,
  onSetFilterPriceLevel,
  onToggleFilterCategory,
  onToggleFilterMood,
  openNowLabel,
  priceLevelLabel,
  textColor,
  translate,
}: ExploreFilterContentProps) {
  return (
    <>
      <ExploreFilterChipGrid
        accentColor={accentColor}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        items={moods}
        selectedIds={filterMoods}
        textColor={textColor}
        title="Moods"
        translate={translate}
        onToggle={onToggleFilterMood}
      />

      <ExploreFilterChipGrid
        accentColor={accentColor}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        items={categories}
        selectedIds={filterCategories}
        textColor={textColor}
        title={categoriesLabel}
        translate={translate}
        onToggle={onToggleFilterCategory}
      />

      <ExploreFilterPriceSection
        accentColor={accentColor}
        borderColor={borderColor}
        priceLevel={filterPriceLevel}
        priceLevelLabel={priceLevelLabel}
        textColor={textColor}
        valueLabel={getPriceLevelDisplay(filterPriceLevel)}
        onSetPriceLevel={onSetFilterPriceLevel}
      />

      <ExploreFilterOpenNowRow
        accentColor={accentColor}
        borderColor={borderColor}
        isEnabled={filterOpenNow}
        label={openNowLabel}
        textColor={textColor}
        onToggle={() => onSetFilterOpenNow(!filterOpenNow)}
      />
    </>
  );
}
