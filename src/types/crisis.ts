export type CrisisStatus = "active" | "escalating" | "underreported";

export interface CrisisStat {
  label: string;
  value: string;
  source: string;
}

export interface DonateAction {
  name: string;
  url: string;
  description: string;
}

export interface CrisisSource {
  title: string;
  url: string;
  org: string;
}

export interface CrisisCoordinates {
  lat: number;
  lng: number;
}

export interface CrisisActions {
  donate: DonateAction[];
  awareness: string[];
  political: string[];
}

export interface Crisis {
  slug: string;
  name: string;
  region: string;
  status: CrisisStatus;
  color: string;
  accent: string;
  coordinates: CrisisCoordinates;
  summary: string;
  context: string;
  stats: CrisisStat[];
  actions: CrisisActions;
  sources: CrisisSource[];
  lastUpdated: string;
}
