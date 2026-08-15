import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { useBooking } from "../../context/BookingContext";
import { fetchBookings } from "../../services/api";

const TABS = ["Upcoming", "Completed", "Cancelled"];

export default function BookingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setConfirmedBooking } = useBooking();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [displayedBookings, setDisplayedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async (tabStatus) => {
    setLoading(true);
    setError("");
    const { data, error: apiError } = await fetchBookings(tabStatus || activeTab);
    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setDisplayedBookings(data || []);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadBookings(activeTab);
    }, [loadBookings, activeTab])
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadBookings(tab);
  };

  const handleCardPress = (booking) => {
    if (booking.status === "Upcoming") {
      setConfirmedBooking(booking);
      router.push("/booking/tracking");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Bookings</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => handleTabChange(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab}
              style={[
                styles.tab,
                { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[styles.tabText, { color: active ? "#FFFFFF" : colors.textMuted }]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.statusText, { color: colors.textMuted }]}>Loading bookings…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerWrapper}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to load bookings</Text>
          <Text style={[styles.statusText, { color: colors.textMuted }]}>{error}</Text>
          <Pressable
            onPress={() => loadBookings(activeTab)}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : displayedBookings.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={`No ${activeTab.toLowerCase()} bookings`}
          message={`Your ${activeTab.toLowerCase()} bookings will show up here.`}
        />
      ) : (
        <FlatList
          data={displayedBookings}
          key={activeTab}
          keyExtractor={(item) => String(item._id || item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 80).duration(350)}>
              <BookingCard booking={item} onPress={() => handleCardPress(item)} />
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: Fonts.h2, fontWeight: Fonts.weight.bold },
  tabRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  tab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: 999, marginRight: Spacing.sm, borderWidth: 1 },
  tabText: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold },
  loadingWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerWrapper: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  statusText: { fontSize: Fonts.caption, marginTop: Spacing.sm, textAlign: "center" },
  errorTitle: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold, marginTop: Spacing.sm },
  retryButton: { marginTop: Spacing.lg, borderRadius: 999, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  retryButtonText: { color: "#FFFFFF", fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
});