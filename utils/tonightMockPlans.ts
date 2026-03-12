import { AIPlan, MoodId, Venue } from '@/utils/tonightScreen';

function getSeededVenueName(list: Venue[], fallback: string, seed: number): string {
  if (list.length === 0) {
    return fallback;
  }

  const venue = list[seed % list.length];
  return venue?.name || fallback;
}

function buildVenuePicker(mood: MoodId, index: number) {
  const moodSeed = [
    'date_night',
    'party',
    'chill',
    'culture',
    'girlsnight',
    'outdoor',
    'foodie',
    'live_music',
    'sports',
    'art',
    'coffee',
    'drinks',
  ].indexOf(mood);
  let offset = 0;

  return (list: Venue[], fallback: string) => {
    const seed = Math.max(moodSeed, 0) * 7 + index * 5 + offset;
    offset += 1;
    return getSeededVenueName(list, fallback, seed);
  };
}

export function generateMockTonightPlan(mood: MoodId, index: number, venues: Venue[]): AIPlan {
  const restaurantVenues = venues.filter((venue) => venue.category === 'restaurant');
  const barVenues = venues.filter((venue) => venue.category === 'bar');
  const clubVenues = venues.filter((venue) => venue.category === 'club');
  const pickVenueName = buildVenuePicker(mood, index);

  const plans: Record<MoodId, AIPlan[]> = {
    date_night: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 45 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Zlatna Ribica'), activity: 'Kokteli', price: 30 },
        ],
        total: 75,
      },
      {
        stops: [
          { time: '19:30', venueName: pickVenueName(restaurantVenues, 'Park Princeva'), activity: 'Vecera', price: 50 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Kino Bosna'), activity: 'Pice', price: 25 },
        ],
        total: 75,
      },
    ],
    party: [
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Burger Inc'), activity: 'Vecera', price: 30 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Hacienda'), activity: 'Kokteli', price: 35 },
          { time: '00:00', venueName: pickVenueName(clubVenues, 'Club Trezor'), activity: 'Party', price: 15 },
        ],
        total: 80,
      },
      {
        stops: [
          { time: '21:00', venueName: pickVenueName(barVenues, 'Blind Tiger'), activity: 'Drinks', price: 40 },
          { time: '23:30', venueName: pickVenueName(clubVenues, 'Kino Bosna'), activity: 'Party', price: 20 },
        ],
        total: 60,
      },
    ],
    chill: [
      {
        stops: [
          { time: '18:00', venueName: pickVenueName(restaurantVenues, 'Karuzo'), activity: 'Vecera', price: 35 },
          { time: '20:30', venueName: pickVenueName(barVenues, 'Cafe Tito'), activity: 'Pice', price: 20 },
        ],
        total: 55,
      },
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Mala Kuhinja'), activity: 'Vecera', price: 40 },
          { time: '21:00', venueName: pickVenueName(barVenues, 'Pivnica HS'), activity: 'Pivo', price: 15 },
        ],
        total: 55,
      },
    ],
    culture: [
      {
        stops: [
          { time: '18:00', venueName: 'Narodno pozoriste', activity: 'Predstava', price: 20 },
          { time: '21:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 45 },
        ],
        total: 65,
      },
      {
        stops: [
          { time: '19:00', venueName: 'Kino Meeting Point', activity: 'Film', price: 10 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Zlatna Ribica'), activity: 'Pice', price: 25 },
        ],
        total: 35,
      },
    ],
    girlsnight: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Mash'), activity: 'Vecera', price: 40 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Hacienda'), activity: 'Kokteli', price: 35 },
          { time: '23:30', venueName: pickVenueName(clubVenues, 'Club Trezor'), activity: 'Party', price: 15 },
        ],
        total: 90,
      },
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Karuzo'), activity: 'Vecera', price: 35 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Blind Tiger'), activity: 'Drinks', price: 30 },
        ],
        total: 65,
      },
    ],
    outdoor: [
      {
        stops: [
          { time: '18:00', venueName: pickVenueName(restaurantVenues, 'Park Princeva'), activity: 'Vecera', price: 45 },
          { time: '20:30', venueName: pickVenueName(barVenues, 'Cafe Tito'), activity: 'Pice', price: 25 },
        ],
        total: 70,
      },
    ],
    foodie: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 50 },
          { time: '21:30', venueName: pickVenueName(barVenues, 'Zlatna Ribica'), activity: 'Digestiv', price: 20 },
        ],
        total: 70,
      },
    ],
    live_music: [
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Karuzo'), activity: 'Vecera', price: 35 },
          { time: '22:00', venueName: pickVenueName(barVenues, 'Kino Bosna'), activity: 'Live muzika', price: 25 },
        ],
        total: 60,
      },
    ],
    sports: [
      {
        stops: [
          { time: '19:00', venueName: pickVenueName(barVenues, 'Pivnica HS'), activity: 'Utakmica', price: 20 },
          { time: '21:30', venueName: pickVenueName(restaurantVenues, 'Burger Inc'), activity: 'Vecera', price: 30 },
        ],
        total: 50,
      },
    ],
    art: [
      {
        stops: [
          { time: '18:00', venueName: 'Galerija 11/07/95', activity: 'Izlozba', price: 10 },
          { time: '20:00', venueName: pickVenueName(restaurantVenues, 'Dveri'), activity: 'Vecera', price: 45 },
        ],
        total: 55,
      },
    ],
    coffee: [
      {
        stops: [
          { time: '17:00', venueName: pickVenueName(barVenues, 'Cafe Tito'), activity: 'Kafa', price: 10 },
          { time: '19:00', venueName: pickVenueName(restaurantVenues, 'Mala Kuhinja'), activity: 'Vecera', price: 40 },
        ],
        total: 50,
      },
    ],
    drinks: [
      {
        stops: [
          { time: '20:00', venueName: pickVenueName(barVenues, 'Hacienda'), activity: 'Kokteli', price: 35 },
          { time: '22:30', venueName: pickVenueName(barVenues, 'Blind Tiger'), activity: 'Drinks', price: 30 },
        ],
        total: 65,
      },
    ],
  };

  const moodPlans = plans[mood] || plans.chill;
  return moodPlans[index % moodPlans.length];
}
