import { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { vehicles } from "../../services/dummyData";

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const { pickupLocation, dropLocation, selectedVehicle, setSelectedVehicle, setFare } = useBooking();
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState(selectedVehicle?.id ?? null);

  const handleSelect = (vehicle) => {
    setSelectedId(vehicle.id);
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

      <FlatList
        data={vehicles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <VehicleListItem
            vehicle={item}
            selected={item.id === selectedId}
            onSelect={() => handleSelect(item)}
            onBook={() => handleBook(item)}
            colors={colors}
          />
        )}
      />
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
        <MaterialCommunityIcons name={vehicle.icon} size={32} color={colors.secondary} />
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