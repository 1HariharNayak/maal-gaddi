import { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import PrimaryButton from "../../components/Button";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { bookings } from "../../services/dummyData";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const { resetBooking } = useBooking();
  const { colors } = useTheme();

  const latestBooking = bookings[0];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleTrackBooking = () => {
    router.push("/booking/tracking");
  };

  const handleGoHome = () => {
    resetBooking();
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, { backgroundColor: colors.success }, animatedStyle]}>
          <Ionicons name="checkmark" size={56} color="#FFFFFF" />
        </Animated.View>

        <Text style={[styles.title, { color: colors.text }]}>Booking Confirmed!</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Your truck has been booked. We'll notify you once a driver is assigned.
        </Text>

        <View style={[styles.idCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.idLabel, { color: colors.textMuted }]}>Booking ID</Text>
          <Text style={[styles.idValue, { color: colors.primary }]}>{latestBooking?.id || "—"}</Text>
        </View>

        <View style={styles.buttonStack}>
          <PrimaryButton title="Track Booking" onPress={handleTrackBooking} />
          <Pressable
            onPress={handleGoHome}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            style={styles.goHomeButton}
          >
            <Text style={[styles.goHomeText, { color: colors.textMuted }]}>Go Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.lg },
  iconWrapper: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  title: { fontSize: Fonts.h1, fontWeight: Fonts.weight.bold, textAlign: "center" },
  subtitle: { fontSize: Fonts.body, textAlign: "center", marginTop: Spacing.sm, lineHeight: 20 },
  idCard: { borderRadius: Spacing.borderRadius, borderWidth: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: "center", marginTop: Spacing.xl },
  idLabel: { fontSize: Fonts.caption },
  idValue: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold, marginTop: 2 },
  buttonStack: { width: "100%", marginTop: Spacing.xxl },
  goHomeButton: { marginTop: Spacing.md, paddingVertical: Spacing.md, alignItems: "center" },
  goHomeText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
});