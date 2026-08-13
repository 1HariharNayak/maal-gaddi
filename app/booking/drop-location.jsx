import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { recentLocations, savedLocations } from "../../services/dummyData";

export default function DropLocationScreen() {
    const router = useRouter();
    const { pickupLocation, setDropLocation } = useBooking();
    const { colors, isDark } = useTheme();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const selectLocation = (address) => {
        setDropLocation({ address, latitude: null, longitude: null });
        router.push("/booking/vehicle-selection");
    };

    const normalizedQuery = query.trim().toLowerCase();
    const filteredSaved = normalizedQuery
        ? savedLocations.filter((l) => l.label.toLowerCase().includes(normalizedQuery) || l.address.toLowerCase().includes(normalizedQuery))
        : savedLocations;
    const filteredRecent = normalizedQuery
        ? recentLocations.filter((l) => l.label.toLowerCase().includes(normalizedQuery) || l.address.toLowerCase().includes(normalizedQuery))
        : recentLocations;
    const nothingFound = normalizedQuery && filteredSaved.length === 0 && filteredRecent.length === 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Drop Location" />

            <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? "#1E293B" : "#E4ECF7" }]}>
                <Ionicons name="flag" size={36} color={colors.primary} />
                <Text style={[styles.mapCaption, { color: colors.textMuted }]}>Map preview</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.pickupSummary}>
                    <Ionicons name="ellipse" size={10} color={colors.textMuted} />
                    <Text style={[styles.pickupSummaryText, { color: colors.textMuted }]} numberOfLines={1}>
                        From: {pickupLocation?.address || "Not set"}
                    </Text>
                </View>

                <SearchBar placeholder="Search for a drop address" value={query} onChangeText={setQuery} />

                {normalizedQuery.length > 0 && (
                    <Pressable
                        style={styles.useTypedRow}
                        onPress={() => selectLocation(query.trim())}
                        accessibilityRole="button"
                        accessibilityLabel={`Use ${query.trim()} as drop address`}
                    >
                        <Ionicons name="pin-outline" size={18} color={colors.primary} />
                        <Text style={[styles.useTypedText, { color: colors.primary }]} numberOfLines={1}>
                            Use "{query.trim()}"
                        </Text>
                    </Pressable>
                )}

                {loading ? (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : nothingFound ? (
                    <EmptyState icon="search-outline" title="No matching addresses" message="Try a different search term." />
                ) : (
                    <>
                        {filteredSaved.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Saved Locations</Text>
                                <FlatList
                                    data={filteredSaved}
                                    scrollEnabled={false}
                                    keyExtractor={(item) => `saved-${item.id}`}
                                    renderItem={({ item }) => (
                                        <LocationRow icon={item.icon} label={item.label} address={item.address} onPress={() => selectLocation(item.address)} colors={colors} />
                                    )}
                                />
                            </View>
                        )}

                        {filteredRecent.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Recent Locations</Text>
                                <FlatList
                                    data={filteredRecent}
                                    scrollEnabled={false}
                                    keyExtractor={(item) => `recent-${item.id}`}
                                    renderItem={({ item }) => (
                                        <LocationRow icon="time-outline" label={item.label} address={item.address} onPress={() => selectLocation(item.address)} colors={colors} />
                                    )}
                                />
                            </View>
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

function LocationRow({ icon, label, address, onPress, colors }) {
    return (
        <Pressable style={styles.locationRow} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}, ${address}`}>
            <View style={[styles.locationIconWrapper, { backgroundColor: colors.background }]}>
                <Ionicons name={icon || "location-outline"} size={18} color={colors.secondary} />
            </View>
            <View style={styles.flexShrink}>
                <Text style={[styles.locationLabel, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.locationAddress, { color: colors.textMuted }]} numberOfLines={1}>{address}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    mapPlaceholder: { height: 180, alignItems: "center", justifyContent: "center" },
    mapCaption: { fontSize: Fonts.caption, marginTop: Spacing.xs },
    content: { flex: 1, padding: Spacing.lg },
    pickupSummary: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
    pickupSummaryText: { fontSize: Fonts.caption, marginLeft: Spacing.sm, flexShrink: 1 },
    useTypedRow: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.md },
    useTypedText: { fontSize: Fonts.body, fontWeight: Fonts.weight.medium, marginLeft: Spacing.sm, flexShrink: 1 },
    loadingWrapper: { paddingVertical: Spacing.xl, alignItems: "center" },
    section: { marginTop: Spacing.md },
    sectionTitle: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold, textTransform: "uppercase", marginBottom: Spacing.sm },
    locationRow: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm },
    locationIconWrapper: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: Spacing.sm },
    flexShrink: { flexShrink: 1 },
    locationLabel: { fontSize: Fonts.body, fontWeight: Fonts.weight.medium },
    locationAddress: { fontSize: Fonts.caption },
});