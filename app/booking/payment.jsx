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

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "cellphone", family: "MaterialCommunityIcons" },
  { id: "debit", label: "Debit Card", icon: "card-outline", family: "Ionicons" },
  { id: "credit", label: "Credit Card", icon: "card", family: "Ionicons" },
  { id: "wallet", label: "Wallet", icon: "wallet-outline", family: "Ionicons" },
  { id: "cash", label: "Cash", icon: "cash-outline", family: "Ionicons" },
];

export default function PaymentScreen() {
  const router = useRouter();
  const {
    pickupLocation,
    dropLocation,
    selectedVehicle,
    fare,
    coupon,
    setConfirmedBooking,
  } = useBooking();
  const { colors } = useTheme();

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const displayTotal = fare ?? selectedVehicle?.price ?? 0;

  const handlePay = async () => {
    if (!selectedVehicle?._id && !selectedVehicle?.id) {
      setError("Please select a valid vehicle before proceeding");
      return;
    }

    setPaying(true);
    setError("");

    // Send only route and vehicle parameters — backend authoritatively calculates and verifies the final fare
    const payload = {
      vehicleId: selectedVehicle._id || selectedVehicle.id,
      pickupLocation: {
        address: pickupLocation?.address || "Pickup Location",
        latitude: pickupLocation?.latitude ?? null,
        longitude: pickupLocation?.longitude ?? null,
      },
      dropLocation: {
        address: dropLocation?.address || "Drop Location",
        latitude: dropLocation?.latitude ?? null,
        longitude: dropLocation?.longitude ?? null,
      },
      coupon: coupon || undefined,
    };

    const { data, error: apiError } = await createBooking(payload);
    setPaying(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    setConfirmedBooking(data);
    router.replace("/booking/booking-success");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header title="Payment" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.amountCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.amountLabel}>Estimated Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{displayTotal}</Text>
          <Text style={styles.routeSummary} numberOfLines={1}>
            {pickupLocation?.address || "Pickup"} → {dropLocation?.address || "Drop"}
          </Text>
        </View>

        {coupon ? (
          <View style={styles.couponBadge}>
            <Ionicons name="pricetag" size={14} color={colors.success} />
            <Text style={[styles.couponBadgeText, { color: colors.success }]}>
              Coupon {coupon} Applied
            </Text>
          </View>
        ) : null}

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

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <PrimaryButton title={`Pay ₹${displayTotal}`} onPress={handlePay} loading={paying} />
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
  errorBox: { flexDirection: "row", alignItems: "center", marginTop: Spacing.md, paddingHorizontal: Spacing.sm },
  errorText: { fontSize: Fonts.caption, marginLeft: Spacing.xs },
  footer: { padding: Spacing.lg, borderTopWidth: 1 },
});