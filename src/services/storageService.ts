import { SightingRecord } from '../types/nature';

const SIGHTINGS_KEY = 'biotrail_sightings_v1';
const SCREEN_SAVED_KEY = 'biotrail_screen_time_saved_min';

const INITIAL_SIGHTINGS: SightingRecord[] = [
  {
    id: 'sighting-1',
    speciesId: 'wood-thrush',
    speciesName: 'Wood Thrush',
    scientificName: 'Hylocichla mustelina',
    category: 'bird',
    confidence: 96,
    timestamp: Date.now() - 3600000 * 2,
    locationName: 'Deep Hemlock Ravine (Trail Mile 1.4)',
    lat: 35.856,
    lng: -82.338,
    notes: 'Heard ethereal flute song echoing between canyon walls during morning mist.',
    callPattern: 'flute-trill',
    verifiedOffline: true,
  },
  {
    id: 'sighting-2',
    speciesId: 'golden-chanterelle',
    speciesName: 'Golden Chanterelle',
    scientificName: 'Cantharellus cibarius',
    category: 'fungi',
    confidence: 94,
    timestamp: Date.now() - 3600000 * 5,
    locationName: 'Old Growth River Bottomwood (Oak clearing)',
    lat: 45.319,
    lng: -122.748,
    notes: 'Cluster of 6 fruiting bodies in damp moss. Decurrent blunt ridges verified; faint apricot fragrance.',
    verifiedOffline: true,
  },
  {
    id: 'sighting-3',
    speciesId: 'black-capped-chickadee',
    speciesName: 'Black-capped Chickadee',
    scientificName: 'Poecile atricapillus',
    category: 'bird',
    confidence: 98,
    timestamp: Date.now() - 3600000 * 24,
    locationName: 'Pinecrest Ridge Overlook',
    lat: 42.135,
    lng: -87.885,
    notes: 'Active flock caching spruce seeds in bark crevices. Two-note fee-bee call followed by alarm rattle.',
    callPattern: 'harmonic-whistle',
    verifiedOffline: true,
  },
];

export const storageService = {
  getSightings(): SightingRecord[] {
    try {
      const raw = localStorage.getItem(SIGHTINGS_KEY);
      if (!raw) {
        localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(INITIAL_SIGHTINGS));
        return INITIAL_SIGHTINGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SIGHTINGS;
    }
  },

  saveSighting(sighting: SightingRecord): SightingRecord[] {
    try {
      const current = this.getSightings();
      const updated = [sighting, ...current];
      localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  deleteSighting(id: string): SightingRecord[] {
    try {
      const current = this.getSightings();
      const updated = current.filter((s) => s.id !== id);
      localStorage.setItem(SIGHTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  getScreenTimeSavedMinutes(): number {
    try {
      const val = localStorage.getItem(SCREEN_SAVED_KEY);
      return val ? parseInt(val, 10) : 42; // default 42 outdoor minutes saved
    } catch {
      return 42;
    }
  },

  addScreenTimeSavedMinutes(minutes: number) {
    try {
      const current = this.getScreenTimeSavedMinutes();
      localStorage.setItem(SCREEN_SAVED_KEY, (current + minutes).toString());
    } catch {
      // no-op
    }
  },

  exportToDarwinCoreCSV(sightings: SightingRecord[]): string {
    const headers = [
      'occurrenceID',
      'vernacularName',
      'scientificName',
      'taxonRank',
      'eventDate',
      'decimalLatitude',
      'decimalLongitude',
      'locality',
      'identificationConfidence',
      'identificationVerificationStatus',
      'occurrenceRemarks',
    ];

    const rows = sightings.map((s) => {
      const date = new Date(s.timestamp).toISOString();
      const escape = (val: string | number | undefined) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      return [
        escape(s.id),
        escape(s.speciesName),
        escape(s.scientificName),
        escape('species'),
        escape(date),
        escape(s.lat),
        escape(s.lng),
        escape(s.locationName),
        escape(`${s.confidence}%`),
        escape(s.verifiedOffline ? 'Verified Offline via Open-Weights Model' : 'Manual'),
        escape(s.notes || ''),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },
};
