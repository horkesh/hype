import { HomeEventItem, HomeEventSeries } from '@/utils/homeData';
import {
  formatEventDateLabel,
  getSeriesCountdownLabel,
  HomeLanguage,
} from '@/utils/homeScreenContent';

export interface HomeEventCardContent {
  title: string;
  dateLabel: string;
  venueName: string;
  priceLabel: string;
}

export interface HomeSeriesCardContent {
  title: string;
  countdownLabel: string;
}

export function getHomeEventCardContent(
  language: HomeLanguage,
  event: HomeEventItem
): HomeEventCardContent {
  return {
    title: language === 'bs' ? event.title_bs : (event.title_en || event.title_bs),
    dateLabel: formatEventDateLabel(language, event.start_datetime),
    venueName: event.venues?.[0]?.name || event.location_name || '',
    priceLabel: event.price_bam
      ? `${event.price_bam} KM`
      : (language === 'bs' ? 'Besplatno' : 'Free'),
  };
}

export function getHomeSeriesCardContent(
  language: HomeLanguage,
  series: HomeEventSeries
): HomeSeriesCardContent {
  return {
    title: language === 'bs' ? series.name_bs : series.name_en,
    countdownLabel: getSeriesCountdownLabel(language, series.start_date, series.end_date),
  };
}
