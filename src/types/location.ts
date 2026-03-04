
export type GenericLink = {
  label: string;
  url: string;
};

export type CuratedLocation = {
  id: string;
  name: string;
  stationTriplet: string;
  logoUrl?: string;
  socialMediaLinks: GenericLink[];
  resortInfoLinks: GenericLink[];
  trafficInfoLinks: GenericLink[];
};

export type MountainLocation = {
  id: string;
  stationId: string;
  name: string;
  city: string;
  state: string;
  network: string;
  county: string;
  elevationFt?: number | null;
  latitude: number;
  longitude: number;
  huc: string;
  timezone: string;
  stationTriplet: string;
  logoUrl?: string;
  socialMediaLinks: GenericLink[];
  resortInfoLinks: GenericLink[];
  trafficInfoLinks: GenericLink[];
  radarLink: string;
};
