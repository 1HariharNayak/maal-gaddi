import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { bookings } from "../../services/dummyData";
import Animated, { FadeInDown } from "react-native-reanimated";

const TABS = ["Upcoming", "Completed", "Cancelled"];

export default function BookingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [displayedBookings, setDisplayedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const timer = setTimeout(() => {
        setDisplayedBookings([...bookings]);
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }, [])
  );

  const filteredBookings = displayedBookings.filter((b) => b.status === activeTab);

  const handleCardPress = (booking) => {
    if (booking.status === "Upcoming") router.push("/booking/tracking");
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
              onPress={() => setActiveTab(tab)}
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
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={`No ${activeTab.toLowerCase()} bookings`}
          message={`Your ${activeTab.toLowerCase()} bookings will show up here.`}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          key={activeTab}
          keyExtractor={(item) => item.id}
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
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
});