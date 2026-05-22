export interface TransportDirection {
  mode: 'tram' | 'bus' | 'trolleybus' | 'walk';
  line: string;
  stop: string;
  walkMinutes: number;
}

const NEIGHBORHOOD_TRANSIT: Record<string, TransportDirection[]> = {
  'Baščaršija': [
    { mode: 'tram', line: '3', stop: 'Baščaršija', walkMinutes: 1 },
    { mode: 'tram', line: '1', stop: 'Latinska ćuprija', walkMinutes: 3 },
  ],
  'Stari Grad': [
    { mode: 'tram', line: '3', stop: 'Baščaršija', walkMinutes: 5 },
    { mode: 'tram', line: '1', stop: 'Latinska ćuprija', walkMinutes: 4 },
  ],
  'Centar': [
    { mode: 'tram', line: '1', stop: 'Skenderija', walkMinutes: 3 },
    { mode: 'tram', line: '3', stop: 'Marin Dvor', walkMinutes: 4 },
  ],
  'Marijin Dvor': [
    { mode: 'tram', line: '1', stop: 'Marin Dvor', walkMinutes: 2 },
    { mode: 'trolleybus', line: '103', stop: 'Marin Dvor', walkMinutes: 2 },
  ],
  'Novo Sarajevo': [
    { mode: 'tram', line: '3', stop: 'Čengić Vila', walkMinutes: 5 },
    { mode: 'tram', line: '1', stop: 'Otoka', walkMinutes: 4 },
  ],
  'Ilidža': [
    { mode: 'tram', line: '3', stop: 'Ilidža', walkMinutes: 5 },
    { mode: 'bus', line: '31e', stop: 'Ilidža', walkMinutes: 3 },
  ],
  'Vogošća': [
    { mode: 'bus', line: '40', stop: 'Vogošća', walkMinutes: 5 },
  ],
  'Hadžići': [
    { mode: 'bus', line: '31', stop: 'Hadžići', walkMinutes: 5 },
  ],
  'Grbavica': [
    { mode: 'tram', line: '1', stop: 'Grbavica', walkMinutes: 3 },
    { mode: 'trolleybus', line: '103', stop: 'Grbavica', walkMinutes: 4 },
  ],
  'Čengić Vila': [
    { mode: 'tram', line: '3', stop: 'Čengić Vila', walkMinutes: 2 },
    { mode: 'tram', line: '1', stop: 'Čengić Vila', walkMinutes: 2 },
  ],
  'Mejtaš': [
    { mode: 'tram', line: '1', stop: 'Čobanija', walkMinutes: 4 },
    { mode: 'tram', line: '3', stop: 'Čobanija', walkMinutes: 4 },
  ],
  'Vratnik': [
    { mode: 'tram', line: '3', stop: 'Baščaršija', walkMinutes: 10 },
  ],
  'Kovači': [
    { mode: 'tram', line: '3', stop: 'Baščaršija', walkMinutes: 5 },
  ],
  'Ferhadija': [
    { mode: 'tram', line: '1', stop: 'Katedrala', walkMinutes: 2 },
    { mode: 'tram', line: '3', stop: 'Katedrala', walkMinutes: 2 },
  ],
};

export function getTransportDirections(
  neighborhood: string | null
): TransportDirection[] {
  if (!neighborhood) return [];
  // Try exact match first
  if (NEIGHBORHOOD_TRANSIT[neighborhood]) return NEIGHBORHOOD_TRANSIT[neighborhood];
  // Try partial match
  const key = Object.keys(NEIGHBORHOOD_TRANSIT).find(
    k => neighborhood.toLowerCase().includes(k.toLowerCase()) ||
         k.toLowerCase().includes(neighborhood.toLowerCase())
  );
  return key ? NEIGHBORHOOD_TRANSIT[key] : [];
}

export function formatTransportDirection(dir: TransportDirection, language: 'bs' | 'en'): string {
  const modeLabel = language === 'bs'
    ? { tram: 'Tramvaj', bus: 'Autobus', trolleybus: 'Trolejbus', walk: 'Pješice' }
    : { tram: 'Tram', bus: 'Bus', trolleybus: 'Trolleybus', walk: 'Walk' };
  const walkLabel = language === 'bs' ? 'min pješice' : 'min walk';
  return `${modeLabel[dir.mode]} ${dir.line} → ${dir.stop}, ${dir.walkMinutes} ${walkLabel}`;
}
