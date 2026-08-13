import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import PrimaryButton from "../../components/Button";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { createBooking } from "../../services/api";
import { calculateFareBreakdown } from "../../utils/pricing";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "cellphone", family: "MaterialCommunityIcons" },
  { id: "debit", label: "Debit Card", icon: "card-outline", family: "Ionicons" },
  { id: "credit", label: "Credit Card", icon: "card", family: "Ionicons" },
  { id: "wallet", label: "Wallet", icon: "wallet-outline", family: "Ionicons" },
  { id: "cash", label: "Cash", icon: "cash-outline", family: "Ionicons" },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { pickupLocation, dropLocation, selectedVehicle, fare, coupon } = useBooking();
  const { colors } = useTheme();

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paying, setPaying] = useState(false);

  const baseFare = fare ?? selectedVehicle?.price ?? 0;
  const { isCouponApplied, total } = calculateFareBreakdown(baseFare, coupon);

  const handlePay = async () => {
    setPaying(true);
    await createBooking({
      vehicle: selectedVehicle?.name || "Vehicle",
      fare: total,
    });
    setPaying(false);
    router.replace("/booking/booking-success");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title="Payment" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.amountCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amountValue}>₹{total}</Text>
          <Text style={styles.routeSummary} numberOfLines={1}>
            {pickupLocation?.address || "Pickup"} → {dropLocation?.address || "Drop"}
          </Text>
        </View>

        {isCouponApplied && (
          <View style={styles.couponBadge}>
            <Ionicons name="pricetag" size={14} color={colors.success} />
            <Text style={[styles.couponBadgeText, { color: colors.success }]}>Coupon {coupon} applied</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
        <View style={[styles.methodsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PAYMENT_METHODS.map((method, index) => {
            const IconComponent = method.family === "MaterialCommunityIcons" ? MaterialCommunityIcons : Ionicons;
            const selected = selectedMethod === method.id;

            return (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={method.label}
                style={[
                  styles.methodRow,
                  { borderBottomColor: colors.border },
                  index === PAYMENT_METHODS.length - 1 && styles.methodRowLast,
                  selected && { backgroundColor: "rgba(255, 107, 0, 0.08)" },
                ]}
              >
                <View style={[styles.methodIconWrapper, { backgroundColor: colors.background }]}>
                  <IconComponent name={method.icon} size={20} color={colors.secondary} />
                </View>
                <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                <View style={[styles.radioOuter, { borderColor: selected ? colors.primary : colors.border }]}>
                  {selected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <PrimaryButton title={`Pay ₹${total}`} onPress={handlePay} loading={paying} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  amountCard: { borderRadius: Spacing.borderRadius, padding: Spacing.lg, marginBottom: Spacing.md },
  amountLabel: { fontSize: Fonts.caption, color: "rgba(255,255,255,0.7)" },
  amountValue: { fontSize: Fonts.h1, fontWeight: Fonts.weight.bold, color: "#FFFFFF", marginTop: 4 },
  routeSummary: { fontSize: Fonts.caption, color: "rgba(255,255,255,0.7)", marginTop: Spacing.sm },
  couponBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#EAFBF1", borderRadius: Spacing.borderRadius, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  couponBadgeText: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold, marginLeft: Spacing.xs },
  sectionTitle: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold, marginBottom: Spacing.md },
  methodsList: { borderRadius: Spacing.borderRadius, borderWidth: 1, overflow: "hidden" },
  methodRow: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderBottomWidth: 1 },
  methodRowLast: { borderBottomWidth: 0 },
  methodIconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  methodLabel: { flex: 1, fontSize: Fonts.body, fontWeight: Fonts.weight.medium },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  footer: { padding: Spacing.lg, borderTopWidth: 1 },
});