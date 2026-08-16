import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import PrimaryButton from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import {
    getCurrentCoordinates,
    reverseGeocodeCoords,
} from "../../services/locationService";

const DEFAULT_REGION = {
    latitude: 20.2961,
    longitude: 85.8245,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
};

export default function MapLocationPicker({
    initialLocation = null,
    title = "Select Location",
    confirmButtonTitle = "Confirm Location",
    onConfirm,
}) {
    const { colors } = useTheme();
    const mapRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const isProgrammaticMoveRef = useRef(false);

    const [region, setRegion] = useState({
        latitude: initialLocation?.latitude || DEFAULT_REGION.latitude,
        longitude: initialLocation?.longitude || DEFAULT_REGION.longitude,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
    });

    const [selectedCoords, setSelectedCoords] = useState({
        latitude: initialLocation?.latitude || DEFAULT_REGION.latitude,
        longitude: initialLocation?.longitude || DEFAULT_REGION.longitude,
    });

    const [resolvedAddress, setResolvedAddress] = useState(
        initialLocation?.address || ""
    );
    const [hasExplicitLocation, setHasExplicitLocation] = useState(
        Boolean(initialLocation?.address && initialLocation?.latitude && initialLocation?.longitude)
    );
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [permissionError, setPermissionError] = useState("");

    // Resolve address on manual coordinate update (debounced)
    const resolveAddress = useCallback(async (lat, lng) => {
        setGeocodingLoading(true);
        setPermissionError("");
        const { data } = await reverseGeocodeCoords(lat, lng);
        setGeocodingLoading(false);
        if (data?.address) {
            setResolvedAddress(data.address);
            setHasExplicitLocation(true);
        }
    }, []);

    // Listen to changes in initialLocation (e.g. from Search Result or Back navigation)
    useEffect(() => {
        if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
            isProgrammaticMoveRef.current = true;
            const nextCoords = {
                latitude: Number(initialLocation.latitude),
                longitude: Number(initialLocation.longitude),
            };
            const nextRegion = {
                ...nextCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setSelectedCoords(nextCoords);
            setRegion(nextRegion);
            setResolvedAddress(initialLocation.address || "Selected location");
            setHasExplicitLocation(true);

            if (mapRef.current) {
                mapRef.current.animateToRegion(nextRegion, 500);
            }

            // Release programmatic lock after animation completes
            setTimeout(() => {
                isProgrammaticMoveRef.current = false;
            }, 600);
        }
    }, [initialLocation]);

    const handleRegionChangeComplete = (newRegion) => {
        if (!newRegion) return;
        const newCoords = {
            latitude: Number(newRegion.latitude),
            longitude: Number(newRegion.longitude),
        };
        setSelectedCoords(newCoords);

        // If camera move was caused by search selection or GPS button, do NOT overwrite the address
        if (isProgrammaticMoveRef.current) {
            return;
        }

        // Manual user drag — debounced reverse geocoding
        setHasExplicitLocation(true);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            resolveAddress(newCoords.latitude, newCoords.longitude);
        }, 400);
    };

    const handleUseCurrentLocation = async () => {
        setGpsLoading(true);
        setPermissionError("");
        const { data, error } = await getCurrentCoordinates();
        setGpsLoading(false);

        if (error) {
            setPermissionError(error);
            return;
        }

        if (data) {
            isProgrammaticMoveRef.current = true;
            const nextCoords = {
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
            };
            const nextRegion = {
                ...nextCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setSelectedCoords(nextCoords);
            setRegion(nextRegion);
            setHasExplicitLocation(true);

            if (mapRef.current) {
                mapRef.current.animateToRegion(nextRegion, 600);
            }

            resolveAddress(data.latitude, data.longitude);

            setTimeout(() => {
                isProgrammaticMoveRef.current = false;
            }, 700);
        }
    };

    const handleConfirm = () => {
        if (!onConfirm) return;

        // Ensure we pass a confirmed, valid location
        const finalAddress =
            resolvedAddress && resolvedAddress.trim()
                ? resolvedAddress.trim()
                : `Location (${selectedCoords.latitude.toFixed(4)}, ${selectedCoords.longitude.toFixed(4)})`;

        onConfirm({
            address: finalAddress,
            latitude: Number(selectedCoords.latitude),
            longitude: Number(selectedCoords.longitude),
        });
    };

    return (
        <View style={styles.container}>
            {/* Map Container */}
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                    style={styles.map}
                    initialRegion={region}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    showsUserLocation
                    showsMyLocationButton={false}
                >
                    <Marker
                        coordinate={selectedCoords}
                        title={title}
                        description={resolvedAddress || "Location point"}
                    />
                </MapView>

                {/* Center Pin Overlay */}
                <View style={styles.centerPinContainer} pointerEvents="none">
                    <View style={[styles.centerPinCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="location" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.centerPinShadow} />
                </View>

                {/* Current Location GPS Button */}
                <Pressable
                    style={[
                        styles.gpsButton,
                        { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={handleUseCurrentLocation}
                    accessibilityRole="button"
                    accessibilityLabel="Use current location"
                >
                    {gpsLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <MaterialCommunityIcons
                            name="crosshairs-gps"
                            size={22}
                            color={colors.primary}
                        />
                    )}
                </Pressable>
            </View>

            {/* Permission Warning Banner if rejected */}
            {permissionError ? (
                <View style={[styles.warningBanner, { backgroundColor: colors.card, borderColor: colors.danger }]}>
                    <Ionicons name="warning-outline" size={16} color={colors.danger} />
                    <Text style={[styles.warningText, { color: colors.danger }]}>
                        {permissionError}. Move the pin manually.
                    </Text>
                </View>
            ) : null}

            {/* Selected Location Card & Confirm Bar */}
            <View
                style={[
                    styles.bottomCard,
                    { backgroundColor: colors.card, borderTopColor: colors.border },
                ]}
            >
                <View style={styles.addressRow}>
                    <View
                        style={[
                            styles.addressIconWrapper,
                            { backgroundColor: "rgba(255, 107, 0, 0.12)" },
                        ]}
                    >
                        <Ionicons name="navigate" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.addressTextWrapper}>
                        <Text style={[styles.addressTitle, { color: colors.textMuted }]}>
                            {title}
                        </Text>
                        <Text
                            style={[styles.addressContent, { color: colors.text }]}
                            numberOfLines={2}
                        >
                            {geocodingLoading
                                ? "Resolving address…"
                                : resolvedAddress || "Move pin or search to select address"}
                        </Text>
                    </View>
                    {geocodingLoading && (
                        <ActivityIndicator size="small" color={colors.primary} />
                    )}
                </View>

                <View style={styles.coordsBadge}>
                    <Text style={[styles.coordsText, { color: colors.textMuted }]}>
                        📍 {selectedCoords.latitude.toFixed(5)}, {selectedCoords.longitude.toFixed(5)}
                    </Text>
                </View>

                <View style={styles.confirmWrapper}>
                    <PrimaryButton
                        title={confirmButtonTitle}
                        onPress={handleConfirm}
                        disabled={geocodingLoading}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    mapWrapper: {
        flex: 1,
        position: "relative",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    centerPinContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    centerPinCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
    },
    centerPinShadow: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(0,0,0,0.3)",
        marginTop: 4,
    },
    gpsButton: {
        position: "absolute",
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    warningBanner: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderRadius: Spacing.borderRadius,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xs,
    },
    warningText: {
        fontSize: Fonts.caption,
        marginLeft: Spacing.xs,
        flexShrink: 1,
    },
    bottomCard: {
        borderTopWidth: 1,
        padding: Spacing.lg,
        borderTopLeftRadius: Spacing.borderRadius * 1.5,
        borderTopRightRadius: Spacing.borderRadius * 1.5,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    addressIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: Spacing.md,
    },
    addressTextWrapper: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 11,
        fontWeight: Fonts.weight.semibold,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    addressContent: {
        fontSize: Fonts.body,
        fontWeight: Fonts.weight.semibold,
        marginTop: 2,
    },
    coordsBadge: {
        marginTop: Spacing.xs,
        marginLeft: 48,
    },
    coordsText: {
        fontSize: 11,
    },
    confirmWrapper: {
        marginTop: Spacing.md,
    },
});
