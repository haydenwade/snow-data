import { MountainLocation } from "./location";

export type GeoBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type StationAvalancheRegion = {
  id: string;
  name: string | null;
  center: string | null;
  centerId: string | null;
  state: string | null;
  danger: string | null;
  dangerLevel: number | null;
  color: string | null;
  stroke: string | null;
  fontColor: string | null;
  link: string | null;
  centerLink: string | null;
  timezone: string | null;
  startDate: string | null;
  endDate: string | null;
  warningProduct: string | null;
  warningInEffect: boolean;
};

export type StationNearbyAvalancheRegion = StationAvalancheRegion & {
  distanceMiles: number;
};

export type StationDetailResponse = {
  station: MountainLocation;
  avalancheRegion?: StationAvalancheRegion | null;
  nearbyAvalancheRegions?: StationNearbyAvalancheRegion[];
};
