import { useQuery } from "@tanstack/react-query";
import { fetchReverseGeocode } from "./geocoding";

export const locationKeys = {
  all: ["location"] as const,
  reverseGeocode: (lat: number, lon: number) =>
    [...locationKeys.all, "reverseGeocode", lat, lon] as const,
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
