import { useQuery } from "@tanstack/react-query";
import { fetchCoordinates, fetchReverseGeocode } from "./geocoding";

export const locationKeys = {
  all: ["location"] as const,
  geocode: (address: string) =>
    [...locationKeys.all, "geocode", address] as const,
  reverseGeocode: (lat: number, lon: number) =>
    [...locationKeys.all, "reverseGeocode", lat, lon] as const,
};

export const useGeocodeQuery = (address: string, enabled = true) => {
  return useQuery({
    queryKey: locationKeys.geocode(address),
    queryFn: () => fetchCoordinates(address),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    enabled: enabled && !!address,
  });
};

export const useReverseGeocodeQuery = (
  lat: number,
  lon: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: locationKeys.reverseGeocode(lat, lon),
    queryFn: () => fetchReverseGeocode(lat, lon),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    enabled,
  });
};
