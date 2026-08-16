import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeInDown } from "react-native-reanimated";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import SearchBar from "../../components/SearchBar";
import Banner from "../../components/Banner";
import VehicleCard from "../../components/VehicleCard";
import OfferCard from "../../components/OfferCard";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { offers, popularRoutes } from "../../services/dummyData";
import { fetchBookings, fetchVehicles } from "../../services/api";

const PRIMARY_TINT = "rgba(255, 107, 0, 0.15)";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { setSelectedVehicle, setConfirmedBooking, resetBooking } = useBooking();
  const { colors } = useTheme();

  const [vehiclesList, setVehiclesList] = useState(null);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");
  const [recentBookings, setRecentBookings] = useState(null);

  const loadVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    setVehiclesError("");
    const { data, error } = await fetchVehicles();
    setVehiclesLoading(false);
    if (error) {
      setVehiclesError(error);
    } else {
      setVehiclesList(data || []);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      loadVehicles();
      const { data } = await fetchBookings();
      if (isMounted) setRecentBookings(data ? data.slice(0, 2) : []);
    })();
    return () => {
      isMounted = false;
    };
  }, [loadVehicles]);

  // Starting a fresh booking from home resets all previous draft booking locations and states
  const goToBookingStart = () => {
    resetBooking();
    router.push("/booking/pickup-location");
  };

  const handleVehiclePress = (vehicle) => {
    resetBooking();
    setSelectedVehicle(vehicle);
    router.push("/booking/pickup-location");
  };

  const handleBookingPress = (booking) => {
    if (booking.status === "Upcoming") {
      setConfirmedBooking(booking);
      router.push("/booking/tracking");
    } else {
      router.push("/(tabs)/bookings");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={[styles.greeting, { color: colors.text }]}>Hello {user?.name || "there"} 👋</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={[styles.notificationButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.locationIconWrapper, { backgroundColor: PRIMARY_TINT }]}>
              <Ionicons name="navigate" size={18} color={colors.primary} />
            </View>
            <View style={styles.flexShrink}>
              <Text style={[styles.locationTitle, { color: colors.text }]}>Current Location</Text>
              <Text style={[styles.locationSubtitle, { color: colors.textMuted }]}>Detecting your location…</Text>
            </View>
          </View>

          <View style={styles.searchStack}>
            <SearchBar placeholder="Pickup Location" icon="ellipse-outline" onPress={goToBookingStart} />
            <View style={styles.searchGap} />
            <SearchBar placeholder="Where to?" icon="location" onPress={goToBookingStart} />
          </View>

          <View style={styles.section}>
            <Banner title="Book a truck in minutes" subtitle="Reliable drivers, transparent pricing" onPress={goToBookingStart} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Categories</Text>
              {vehiclesError ? (
                <Pressable onPress={loadVehicles} accessibilityRole="button" accessibilityLabel="Retry loading vehicles">
                  <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
                </Pressable>
              ) : null}
            </View>

            {vehiclesLoading && !vehiclesList ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : vehiclesError && !vehiclesList ? (
              <View style={[styles.errorWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>{vehiclesError}</Text>
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
              <View style={[styles.errorWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>No vehicles available</Text>
              </View>
            ) : (
              <FlatList
                data={vehiclesList || []}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id || item._id)}
                contentContainerStyle={styles.horizontalListContent}
                renderItem={({ item, index }) => (
                  <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
                    <VehicleCard
                      title={item.name}
                      capacity={item.capacity}
                      price={item.price}
                      eta={item.eta}
                      icon={item.icon}
                      onPress={() => handleVehiclePress(item)}
                    />
                  </Animated.View>
                )}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Offers</Text>
            <FlatList
              data={offers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.horizontalListContent}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
                  <OfferCard title={item.title} description={item.description} />
                </Animated.View>
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Routes</Text>
            <FlatList
              data={popularRoutes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.horizontalListContent}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.routeChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={goToBookingStart}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.from} to ${item.to}`}
                >
                  <MaterialCommunityIcons name="map-marker-path" size={16} color={colors.primary} />
                  <Text style={[styles.routeText, { color: colors.text }]}>{item.from} → {item.to}</Text>
                </Pressable>
              )}
            />
          </View>

          <View style={[styles.section, styles.lastSection]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Bookings</Text>

            {recentBookings === null ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : recentBookings.length === 0 ? (
              <EmptyState icon="receipt-outline" title="No bookings yet" message="Your recent bookings will show up here." />
            ) : (
              <FlatList
                data={recentBookings}
                scrollEnabled={false}
                keyExtractor={(item) => String(item._id || item.id)}
                renderItem={({ item, index }) => (
                  <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                    <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
                  </Animated.View>
                )}
              />
            )}
          </View>
        </ScrollView>

        <Pressable
          onPress={goToBookingStart}
          accessibilityRole="button"
          accessibilityLabel="Book now"
          style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary }, pressed && styles.fabPressed]}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.md },
  greeting: { fontSize: Fonts.h2, fontWeight: Fonts.weight.bold },
  notificationButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  locationCard: { flexDirection: "row", alignItems: "center", borderRadius: Spacing.borderRadius, borderWidth: 1, padding: Spacing.md, marginTop: Spacing.lg },
  locationIconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: Spacing.sm },
  flexShrink: { flexShrink: 1 },
  locationTitle: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
  locationSubtitle: { fontSize: Fonts.caption, marginTop: 2 },
  searchStack: { marginTop: Spacing.md },
  searchGap: { height: Spacing.sm },
  section: { marginTop: Spacing.xl },
  lastSection: { marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  sectionTitle: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold },
  retryText: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold },
  horizontalListContent: { paddingRight: Spacing.lg },
  routeChip: { flexDirection: "row", alignItems: "center", borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginRight: Spacing.sm },
  routeText: { fontSize: Fonts.caption, marginLeft: Spacing.xs, fontWeight: Fonts.weight.medium },
  loadingWrapper: { paddingVertical: Spacing.xl, alignItems: "center" },
  errorWrapper: { padding: Spacing.lg, borderRadius: Spacing.borderRadius, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  errorSubtitle: { fontSize: Fonts.caption, marginTop: Spacing.xs, textAlign: "center" },
  retryButton: { marginTop: Spacing.md, borderRadius: 999, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  retryButtonText: { color: "#FFFFFF", fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold },
  fab: {
    position: "absolute", bottom: Spacing.xl, right: Spacing.lg, width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabPressed: { opacity: 0.9 },
});