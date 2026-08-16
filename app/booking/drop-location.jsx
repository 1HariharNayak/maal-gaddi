import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import PlaceSearchInput from "../../components/LocationSearch/PlaceSearchInput";
import MapLocationPicker from "../../components/LocationPicker/MapLocationPicker";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";

export default function DropLocationScreen() {
    const router = useRouter();
    const { pickupLocation, dropLocation, setDropLocation } = useBooking();
    const { colors } = useTheme();

    const [selectedLocation, setSelectedLocation] = useState(dropLocation || null);

    // Keep local draft synchronized with context on navigation back/forward
    useEffect(() => {
        setSelectedLocation(dropLocation || null);
    }, [dropLocation]);

    const handleSearchSelect = (location) => {
        if (location && typeof location.latitude === "number" && typeof location.longitude === "number") {
            setSelectedLocation(location);
        }
    };

    const handleConfirmLocation = (location) => {
        if (
            !location ||
            typeof location.latitude !== "number" ||
            typeof location.longitude !== "number" ||
            !location.address
        ) {
            return;
        }

        const confirmed = {
            address: location.address.trim(),
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
        };

        // Development coordinate logging
        console.log("[DROP CONFIRMED]", {
            address: confirmed.address,
            latitude: confirmed.latitude,
            longitude: confirmed.longitude,
        });

        setDropLocation(confirmed);
        router.push("/booking/vehicle-selection");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Drop Location" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* Pickup Summary Bar */}
                <View
                    style={[
                        styles.pickupSummaryBar,
                        { backgroundColor: colors.card, borderBottomColor: colors.border },
                    ]}
                >
                    <Ionicons name="ellipse" size={8} color={colors.primary} />
                    <Text
                        style={[styles.pickupSummaryText, { color: colors.textMuted }]}
                        numberOfLines={1}
                    >
                        Pickup: {pickupLocation?.address || "Selected on map"}
                    </Text>
                </View>

                {/* Search Bar with dropdown */}
                <View style={styles.searchContainer}>
                    <PlaceSearchInput
                        placeholder="Search drop destination or landmark"
                        initialValue={selectedLocation?.address || ""}
                        onSelectLocation={handleSearchSelect}
                    />
                </View>

                {/* Interactive Map Picker */}
                <View style={styles.mapContainer}>
                    <MapLocationPicker
                        title="Drop Point"
                        confirmButtonTitle="Confirm Drop Location"
                        initialLocation={selectedLocation}
                        onConfirm={handleConfirmLocation}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    pickupSummaryBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    pickupSummaryText: {
        fontSize: Fonts.caption,
        marginLeft: 8,
        flexShrink: 1,
        fontWeight: Fonts.weight.medium,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        zIndex: 20,
    },
    mapContainer: {
        flex: 1,
        zIndex: 1,
    },
});