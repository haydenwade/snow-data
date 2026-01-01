
export type GenericLink = {
  label: string;
  url: string;
};

export type MountainLocation = {
  id: string;
  stationId: string;
  name: string;
  city: string;
  state: string;
  network: string;
  county: string;
  elevation: string;
  lat: number;
  lon: number;
  huc: string;
  timezone: string;
  stationTriplet: string;
  logoUrl?: string;
  socialMediaLinks: GenericLink[];
  resortInfoLinks: GenericLink[];
  avalancheInfoLinks: GenericLink[];
  trafficInfoLinks: GenericLink[];
  radarLink: string;
  isHidden: boolean;
};
