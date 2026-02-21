import { MountainLocation } from "./location";

export type GeoBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type StationSummary = {
  stationTriplet: string;
  stationId: string;
  stateCode: string;
  stateName: string;
  networkCode: string;
  name: string;
  countyName: string;
  huc: string | null;
  elevationFt: number | null;
  latitude: number;
  longitude: number;
  dataTimeZone: number | null;
  locationId: string | null;
  logoUrl: string | null;
  hasLocationDetails: boolean;
};

export type StationDetailResponse = {
  station: StationSummary;
  location: MountainLocation;
  locationMatch: MountainLocation | null;
};
