import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import EmptyState from "../../components/EmptyState";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { fetchVehicles } from "../../services/api";

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const { pickupLocation, dropLocation, selectedVehicle, setSelectedVehicle, setFare } = useBooking();
  const { colors } = useTheme();

  const [vehiclesList, setVehiclesList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(selectedVehicle?._id || selectedVehicle?.id || null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: apiError } = await fetchVehicles();
    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setVehiclesList(data || []);
      // If a vehicle was previously selected, retain it
      if (selectedVehicle) {
        setSelectedId(selectedVehicle._id || selectedVehicle.id);
      }
    }
  }, [selectedVehicle]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSelect = (vehicle) => {
    const vId = vehicle._id || vehicle.id;
    setSelectedId(vId);
    setSelectedVehicle(vehicle);
  };

  const handleBook = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFare(vehicle.price);
    router.push("/booking/booking-summary");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title="Select Vehicle" />

      <View style={[styles.routeSummary, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.routeRow}>
          <Ionicons name="ellipse" size={8} color={colors.primary} />
          <Text style={[styles.routeText, { color: colors.textMuted }]} numberOfLines={1}>
            {pickupLocation?.address || "Pickup not set"}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="location" size={10} color={colors.danger} />
          <Text style={[styles.routeText, { color: colors.textMuted }]} numberOfLines={1}>
            {dropLocation?.address || "Drop not set"}
          </Text>
        </View>
      </View>

      {loading && !vehiclesList ? (
        <View style={styles.centerWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.textMuted }]}>Loading available vehicles…</Text>
        </View>
      ) : error && !vehiclesList ? (
        <View style={styles.centerWrapper}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load vehicles</Text>
          <Text style={[styles.statusText, { color: colors.textMuted }]}>{error}</Text>
          <Pressable
            onPress={loadVehicles}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : vehiclesList && vehiclesList.length === 0 ? (
        <View style={styles.centerWrapper}>
          <EmptyState
            icon="car-outline"
            title="No vehicles available"
            message="No active vehicles found in your service area. Please try again later."
          />
        </View>
      ) : (
        <FlatList
          data={vehiclesList || []}
          keyExtractor={(item) => String(item._id || item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VehicleListItem
              vehicle={item}
              selected={String(item._id || item.id) === String(selectedId)}
              onSelect={() => handleSelect(item)}
              onBook={() => handleBook(item)}
              colors={colors}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function VehicleListItem({ vehicle, selected, onSelect, onBook, colors }) {
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`Select ${vehicle.name}`}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border },
        selected && styles.cardSelectedWidth,
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name={vehicle.icon || "truck"} size={32} color={colors.secondary} />
      </View>

      <View style={styles.details}>
        <Text style={[styles.name, { color: colors.text }]}>{vehicle.name}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{vehicle.capacity} • {vehicle.eta}</Text>
      </View>

      <View style={styles.rightBlock}>
        <Text style={[styles.price, { color: colors.text }]}>₹{vehicle.price}</Text>
        <Pressable
          onPress={onBook}
          accessibilityRole="button"
          accessibilityLabel={`Book ${vehicle.name}`}
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  routeSummary: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  routeRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  routeText: { fontSize: Fonts.caption, marginLeft: Spacing.sm, flexShrink: 1 },
  listContent: { padding: Spacing.lg },
  centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  statusText: { fontSize: Fonts.caption, marginTop: Spacing.sm, textAlign: "center" },
  errorTitle: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold, marginTop: Spacing.md },
  retryButton: { marginTop: Spacing.lg, borderRadius: 999, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  retryButtonText: { color: "#FFFFFF", fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
  card: { flexDirection: "row", alignItems: "center", borderRadius: Spacing.borderRadius, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  cardSelectedWidth: { borderWidth: 2 },
  iconWrapper: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  details: { flex: 1 },
  name: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
  meta: { fontSize: Fonts.caption, marginTop: 2 },
  rightBlock: { alignItems: "flex-end" },
  price: { fontSize: Fonts.body, fontWeight: Fonts.weight.bold, marginBottom: Spacing.xs },
  bookButton: { borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  bookButtonText: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold, color: "#FFFFFF" },
});