import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Header from "../../components/Header";
import PlaceSearchInput from "../../components/LocationSearch/PlaceSearchInput";
import MapLocationPicker from "../../components/LocationPicker/MapLocationPicker";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";

export default function PickupLocationScreen() {
    const router = useRouter();
    const { pickupLocation, setPickupLocation } = useBooking();
    const { colors } = useTheme();

    const [selectedLocation, setSelectedLocation] = useState(pickupLocation || null);

    // Keep local draft synchronized with context on navigation back/forward
    useEffect(() => {
        setSelectedLocation(pickupLocation || null);
    }, [pickupLocation]);

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
        console.log("[PICKUP CONFIRMED]", {
            address: confirmed.address,
            latitude: confirmed.latitude,
            longitude: confirmed.longitude,
        });

        setPickupLocation(confirmed);
        router.push("/booking/drop-location");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Pickup Location" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* Search Bar on top with suggestions dropdown */}
                <View style={styles.searchContainer}>
                    <PlaceSearchInput
                        placeholder="Search pickup address or landmark"
                        initialValue={selectedLocation?.address || ""}
                        onSelectLocation={handleSearchSelect}
                    />
                </View>

                {/* Interactive Map Picker */}
                <View style={styles.mapContainer}>
                    <MapLocationPicker
                        title="Pickup Point"
                        confirmButtonTitle="Confirm Pickup Location"
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