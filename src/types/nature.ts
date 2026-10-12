export type TaxaCategory = 'bird' | 'flora' | 'fungi' | 'amphibian';

export interface AcousticSignature {
  minFreqHz: number;
  maxFreqHz: number;
  dominantFreqHz: number;
  patternType: 'flute-trill' | 'descending-hoot' | 'harmonic-whistle' | 'pulsed-creak' | 'downward-scream' | 'lament-coo';
  syllableRateHz: number; // syllables per second
  harmonicBands: number;
}

export interface SpeciesProfile {
  id: string;
  commonName: string;
  scientificName: string;
  category: TaxaCategory;
  family: string;
  habitat: string;
  conservationStatus: 'Least Concern' | 'Near Threatened' | 'Vulnerable' | 'Abundant';
  acoustic?: AcousticSignature;
  visual?: {
    leafPattern?: string;
    fallColor?: string;
    edibility?: 'Choice Edible' | 'Edible with Caution' | 'Toxic Hazard' | 'Inedible';
    hazardNote?: string;
    distinguishingTraits: string[];
  };
  fieldNotes: string;
  funFact: string;
  seasonality: string;
  callDescription?: string;
}

export interface AcousticMatchResult {
  species: SpeciesProfile;
  confidence: number;
  dominantFreq: number;
  detectedPattern: string;
  timestamp: number;
  snrDb: number;
}

export interface BotanicalMatchResult {
  species: SpeciesProfile;
  confidence: number;
  foliageStage?: string;
  edibilityNotice?: string;
  matchedTraits: string[];
  timestamp: number;
}

export interface SightingRecord {
  id: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  category: TaxaCategory;
  confidence: number;
  timestamp: number;
  locationName: string;
  lat: number;
  lng: number;
  notes?: string;
  callPattern?: string;
  verifiedOffline: boolean;
}

export interface TrailRoute {
  id: string;
  name: string;
  region: string;
  distanceMiles: number;
  elevationGainFt: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  fallFoliageStatus: 'Emerging' | 'Peak Crimson & Gold' | 'Past Peak' | 'Lush Green';
  foliageScorePercent: number;
  primarySpecies: string[];
  pathPoints: Array<{ lat: number; lng: number; ele: number }>;
  description: string;
}

export interface BioacousticModelStats {
  engineName: string;
  architecture: string;
  quantization: string;
  inferenceLatencyMs: number;
  networkRequests: number;
  cacheStatus: 'Loaded in Memory (Offline Ready)' | 'Initializing' | 'Standby';
  sampleRate: number;
  fftResolution: number;
}
