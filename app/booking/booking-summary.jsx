import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import PrimaryButton from "../../components/Button";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { VALID_COUPON, PLATFORM_FEE, calculateFareBreakdown } from "../../utils/pricing";

const DUMMY_DISTANCE = "12.4 km";
const DUMMY_DURATION = "38 mins";

export default function BookingSummaryScreen() {
    const router = useRouter();
    const { pickupLocation, dropLocation, selectedVehicle, fare, coupon, setCoupon } = useBooking();
    const { colors } = useTheme();

    const [couponInput, setCouponInput] = useState(coupon || "");
    const [couponError, setCouponError] = useState("");

    const baseFare = fare ?? selectedVehicle?.price ?? 0;
    const { gst, isCouponApplied, discount, total } = calculateFareBreakdown(baseFare, coupon);

    const handleApplyCoupon = () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        if (code === VALID_COUPON) {
            setCoupon(code);
            setCouponError("");
        } else {
            setCoupon(null);
            setCouponError("Invalid coupon code");
        }
    };

    const handleProceed = () => {
        router.push("/booking/payment");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Booking Summary" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.routeRow}>
                        <Ionicons name="ellipse" size={8} color={colors.primary} style={styles.routeIcon} />
                        <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={2}>
                            {pickupLocation?.address || "Pickup not set"}
                        </Text>
                    </View>
                    <View style={[styles.routeDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.routeRow}>
                        <Ionicons name="location" size={12} color={colors.danger} style={styles.routeIcon} />
                        <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={2}>
                            {dropLocation?.address || "Drop not set"}
                        </Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.vehicleRow}>
                        <View style={[styles.vehicleIconWrapper, { backgroundColor: colors.background }]}>
                            <MaterialCommunityIcons name={selectedVehicle?.icon || "truck"} size={28} color={colors.secondary} />
                        </View>
                        <View style={styles.flexShrink}>
                            <Text style={[styles.vehicleName, { color: colors.text }]}>{selectedVehicle?.name || "Vehicle not selected"}</Text>
                            <Text style={[styles.vehicleMeta, { color: colors.textMuted }]}>{selectedVehicle?.capacity}</Text>
                        </View>
                    </View>
                    <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                        <View style={styles.statBlock}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Distance</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{DUMMY_DISTANCE}</Text>
                        </View>
                        <View style={styles.statBlock}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Duration</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{DUMMY_DURATION}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textMuted }]}>Coupon</Text>
                    <View style={styles.couponRow}>
                        <TextInput
                            style={[styles.couponInput, { borderColor: colors.border, color: colors.text }]}
                            placeholder="Enter coupon code"
                            placeholderTextColor={colors.textMuted}
                            value={couponInput}
                            onChangeText={(text) => {
                                setCouponInput(text);
                                setCouponError("");
                            }}
                            autoCapitalize="characters"
                            accessibilityLabel="Coupon code"
                        />
                        <Pressable
                            onPress={handleApplyCoupon}
                            accessibilityRole="button"
                            accessibilityLabel="Apply coupon"
                            style={[styles.applyButton, { backgroundColor: colors.secondary }]}
                        >
                            <Text style={[styles.applyButtonText, { color: colors.card }]}>Apply</Text>
                        </Pressable>
                    </View>
                    {couponError ? <Text style={[styles.couponError, { color: colors.danger }]}>{couponError}</Text> : null}
                    {isCouponApplied ? (
                        <Text style={[styles.couponSuccess, { color: colors.success }]}>Coupon applied — 20% off fare</Text>
                    ) : null}
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <FareRow label="Fare" value={baseFare} colors={colors} />
                    <FareRow label="GST (5%)" value={gst} colors={colors} />
                    <FareRow label="Platform Fee" value={PLATFORM_FEE} colors={colors} />
                    {isCouponApplied && <FareRow label="Coupon Discount" value={-discount} colors={colors} highlight />}
                    <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
                    <FareRow label="Total Amount" value={total} colors={colors} bold />
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
                <PrimaryButton title={`Proceed to Payment · ₹${total}`} onPress={handleProceed} />
            </View>
        </SafeAreaView>
    );
}

function FareRow({ label, value, bold, highlight, colors }) {
    return (
        <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textMuted }, bold && [styles.fareLabelBold, { color: colors.text }]]}>
                {label}
            </Text>
            <Text
                style={[
                    styles.fareValue,
                    { color: colors.text },
                    bold && styles.fareValueBold,
                    highlight && { color: colors.success },
                ]}
            >
                {value < 0 ? "-" : ""}₹{Math.abs(value)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
    card: { borderRadius: Spacing.borderRadius, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
    cardTitle: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold, textTransform: "uppercase", marginBottom: Spacing.sm },
    routeRow: { flexDirection: "row", alignItems: "flex-start" },
    routeIcon: { marginTop: 4, marginRight: Spacing.sm },
    routeText: { fontSize: Fonts.body, flexShrink: 1 },
    routeDivider: { height: 1, marginVertical: Spacing.sm, marginLeft: 12 },
    vehicleRow: { flexDirection: "row", alignItems: "center" },
    vehicleIconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
    flexShrink: { flexShrink: 1 },
    vehicleName: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
    vehicleMeta: { fontSize: Fonts.caption, marginTop: 2 },
    statsRow: { flexDirection: "row", marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
    statBlock: { flex: 1 },
    statLabel: { fontSize: Fonts.caption },
    statValue: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold, marginTop: 2 },
    couponRow: { flexDirection: "row" },
    couponInput: { flex: 1, borderWidth: 1, borderRadius: Spacing.borderRadius, paddingHorizontal: Spacing.md, height: 44, fontSize: Fonts.body, marginRight: Spacing.sm },
    applyButton: { paddingHorizontal: Spacing.md, height: 44, borderRadius: Spacing.borderRadius, alignItems: "center", justifyContent: "center" },
    applyButtonText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
    couponError: { fontSize: Fonts.caption, marginTop: Spacing.sm },
    couponSuccess: { fontSize: Fonts.caption, marginTop: Spacing.sm },
    fareRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
    fareLabel: { fontSize: Fonts.body },
    fareLabelBold: { fontWeight: Fonts.weight.bold, fontSize: Fonts.h3 },
    fareValue: { fontSize: Fonts.body },
    fareValueBold: { fontWeight: Fonts.weight.bold, fontSize: Fonts.h3 },
    totalDivider: { height: 1, marginVertical: Spacing.sm },
    footer: { padding: Spacing.lg, borderTopWidth: 1 },
});