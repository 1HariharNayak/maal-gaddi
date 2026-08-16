import * as Location from "expo-location";
import axios from "axios";
import { recentLocations, savedLocations } from "./dummyData";

// Google Maps API Key from environment (optional for development fallback)
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/**
 * Generate a unique session token for Places API (New) to group autocomplete queries.
 */
export function createSessionToken() {
    return "session-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
}

/**
 * Request device foreground location permission.
 * Handles permission rejection gracefully without throwing.
 */
export async function requestLocationPermission() {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return {
            granted: status === "granted",
            status,
            error: status !== "granted" ? "Location permission denied" : null,
        };
    } catch (err) {
        return {
            granted: false,
            status: "error",
            error: err.message || "Failed to request location permission",
        };
    }
}

/**
 * Get device current GPS coordinates.
 * Balanced accuracy used to minimize device battery and fetch quickly.
 */
export async function getCurrentCoordinates() {
    try {
        const permission = await requestLocationPermission();
        if (!permission.granted) {
            return { data: null, error: permission.error };
        }

        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        if (!position || !position.coords) {
            return { data: null, error: "Could not obtain current location" };
        }

        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };

        return { data: coords, error: null };
    } catch (err) {
        return {
            data: null,
            error: err.message || "Failed to get current location",
        };
    }
}

/**
 * Reverse geocode latitude and longitude to a human-readable address.
 * 1. Tries Google Maps Geocoding REST API if key is configured.
 * 2. Falls back to expo-location device reverse geocoder.
 * 3. Falls back to a clean coordinate-based string label.
 * Never throws.
 */
export async function reverseGeocodeCoords(latitude, longitude) {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return {
            data: { address: "Unknown Location", latitude: null, longitude: null },
            error: "Invalid coordinates",
        };
    }

    // 1. Google Geocoding API if key is present
    if (GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes("YOUR_GOOGLE_MAPS_API_KEY")) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await axios.get(url, { timeout: 6000 });
            if (response.data?.status === "OK" && response.data?.results?.length > 0) {
                const bestResult = response.data.results[0];
                return {
                    data: {
                        address: bestResult.formatted_address,
                        latitude,
                        longitude,
                        placeId: bestResult.place_id,
                    },
                    error: null,
                };
            }
        } catch {
            // Fall through to expo-location fallback
        }
    }

    // 2. Fallback: expo-location reverse geocoder
    try {
        const reverseResults = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        if (reverseResults && reverseResults.length > 0) {
            const r = reverseResults[0];
            const parts = [
                r.name || r.street,
                r.subregion || r.district,
                r.city || r.region,
                r.postalCode,
            ].filter(Boolean);

            const addressString = parts.length > 0
                ? parts.join(", ")
                : `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

            return {
                data: {
                    address: addressString,
                    latitude,
                    longitude,
                },
                error: null,
            };
        }
    } catch {
        // Fall through to coordinate label
    }

    // 3. Fallback: Coordinate description
    return {
        data: {
            address: `Pin at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
        },
        error: null,
    };
}

/**
 * Search places autocomplete using Places API (New) with Session Token.
 * Falls back to local saved/recent locations if API key is not configured or fails.
 */
export async function searchPlacesAutocomplete(query, sessionToken) {
    const trimmed = (query || "").trim();
    if (!trimmed || trimmed.length < 2) {
        return { data: [], error: null };
    }

    // 1. Google Places API (New) Autocomplete
    if (GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes("YOUR_GOOGLE_MAPS_API_KEY")) {
        try {
            const url = "https://places.googleapis.com/v1/places:autocomplete";
            const response = await axios.post(
                url,
                {
                    input: trimmed,
                    sessionToken: sessionToken || createSessionToken(),
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                    },
                    timeout: 6000,
                }
            );

            if (response.data?.suggestions) {
                const mapped = response.data.suggestions
                    .filter((s) => s.placePrediction)
                    .map((s) => {
                        const p = s.placePrediction;
                        return {
                            id: p.placeId,
                            placeId: p.placeId,
                            primaryText: p.structuredFormat?.mainText?.text || p.text?.text || trimmed,
                            secondaryText: p.structuredFormat?.secondaryText?.text || "",
                            fullText: p.text?.text || trimmed,
                        };
                    });
                return { data: mapped, error: null };
            }
        } catch {
            // Fall through to local fallback
        }
    }

    // 2. Local fallback filter (saved & recent locations)
    const normalized = trimmed.toLowerCase();
    const all = [...savedLocations, ...recentLocations];
    const filtered = all
        .filter(
            (l) =>
                l.label.toLowerCase().includes(normalized) ||
                l.address.toLowerCase().includes(normalized)
        )
        .map((l) => ({
            id: `local-${l.id}`,
            placeId: null,
            primaryText: l.label,
            secondaryText: l.address,
            fullText: `${l.label}, ${l.address}`,
            latitude: l.latitude || 20.2961,
            longitude: l.longitude || 85.8245,
        }));

    return { data: filtered, error: null };
}

/**
 * Resolve placeId to geographic coordinates.
 */
export async function getPlaceCoordinates(placeId, fallbackAddress) {
    if (!placeId) {
        // Geocode the fallback address if available
        if (fallbackAddress) {
            try {
                const geo = await Location.geocodeAsync(fallbackAddress);
                if (geo && geo.length > 0) {
                    return {
                        data: {
                            latitude: geo[0].latitude,
                            longitude: geo[0].longitude,
                        },
                        error: null,
                    };
                }
            } catch {
                // Return default fallback
            }
        }
        return {
            data: { latitude: 20.2961, longitude: 85.8245 },
            error: null,
        };
    }

    if (GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes("YOUR_GOOGLE_MAPS_API_KEY")) {
        try {
            const url = `https://places.googleapis.com/v1/places/${placeId}`;
            const response = await axios.get(url, {
                headers: {
                    "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                    "X-Goog-FieldMask": "location,formattedAddress,displayName",
                },
                timeout: 6000,
            });

            if (response.data?.location) {
                return {
                    data: {
                        latitude: response.data.location.latitude,
                        longitude: response.data.location.longitude,
                        address: response.data.formattedAddress || response.data.displayName?.text,
                    },
                    error: null,
                };
            }
        } catch {
            // Fallback
        }
    }

    return {
        data: { latitude: 20.2961, longitude: 85.8245 },
        error: null,
    };
}
