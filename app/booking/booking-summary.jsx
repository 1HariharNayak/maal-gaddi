import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import PrimaryButton from "../../components/Button";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { estimateFare } from "../../services/api";

export default function BookingSummaryScreen() {
    const router = useRouter();
    const {
        pickupLocation,
        dropLocation,
        selectedVehicle,
        fare,
        setFare,
        coupon,
        setCoupon,
    } = useBooking();
    const { colors } = useTheme();

    const [couponInput, setCouponInput] = useState(coupon || "");
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(coupon || null);
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchServerEstimate = useCallback(async (activeCoupon) => {
        if (!selectedVehicle?._id && !selectedVehicle?.id) {
            setError("No vehicle selected");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        const payload = {
            vehicleId: selectedVehicle._id || selectedVehicle.id,
            pickupLocation: pickupLocation || { address: "Pickup Location" },
            dropLocation: dropLocation || { address: "Drop Location" },
            coupon: activeCoupon || undefined,
        };

        // Development Trace: FARE REQUEST
        console.log("[FARE ESTIMATE REQUEST]", {
            pickup: {
                address: payload.pickupLocation.address,
                latitude: payload.pickupLocation.latitude,
                longitude: payload.pickupLocation.longitude,
            },
            drop: {
                address: payload.dropLocation.address,
                latitude: payload.dropLocation.latitude,
                longitude: payload.dropLocation.longitude,
            },
            vehicleId: payload.vehicleId,
            coupon: payload.coupon,
        });

        const { data, error: apiError } = await estimateFare(payload);
        setLoading(false);

        if (apiError) {
            setError(apiError);
        } else if (data) {
            // Development Trace: ROUTES RESULT
            console.log("[ROUTES RESULT]", {
                distanceKm: data.distance?.distanceKm,
                durationMinutes: data.distance?.durationMinutes,
                provider: data.distance?.provider,
                isFallback: data.distance?.isFallback,
                totalFare: data.pricing?.totalFare,
            });

            setEstimate(data);
            setFare(data.pricing.totalFare);
        }
    }, [selectedVehicle, pickupLocation, dropLocation, setFare]);

    useEffect(() => {
        fetchServerEstimate(appliedCoupon);
    }, [fetchServerEstimate, appliedCoupon]);

    const handleApplyCoupon = () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setAppliedCoupon(null);
            setCoupon(null);
            setCouponError("");
            return;
        }
        setAppliedCoupon(code);
        setCoupon(code);
        setCouponError("");
    };

    const handleRemoveCoupon = () => {
        setCouponInput("");
        setAppliedCoupon(null);
        setCoupon(null);
        setCouponError("");
    };

    const handleProceed = () => {
        router.push("/booking/payment");
    };

    const pricing = estimate?.pricing;
    const distance = estimate?.distance;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Booking Summary" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Route Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.routeRow}>
                        <Ionicons name="ellipse" size={8} color={colors.primary} style={styles.routeIcon} />
                        <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={2}>
                            {pickupLocation?.address || "Pickup location selected"}
                        </Text>
                    </View>
                    <View style={[styles.routeDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.routeRow}>
                        <Ionicons name="location" size={12} color={colors.danger} style={styles.routeIcon} />
                        <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={2}>
                            {dropLocation?.address || "Drop location selected"}
                        </Text>
                    </View>
                </View>

                {/* Vehicle & Dynamic Distance Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.vehicleRow}>
                        <View style={[styles.vehicleIconWrapper, { backgroundColor: colors.background }]}>
                            <MaterialCommunityIcons
                                name={selectedVehicle?.icon || "truck"}
                                size={28}
                                color={colors.secondary}
                            />
                        </View>
                        <View style={styles.flexShrink}>
                            <Text style={[styles.vehicleName, { color: colors.text }]}>
                                {selectedVehicle?.name || "Vehicle"}
                            </Text>
                            <Text style={[styles.vehicleMeta, { color: colors.textMuted }]}>
                                {selectedVehicle?.capacity}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                        <View style={styles.statBlock}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Distance</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {distance?.distanceKm !== undefined ? `${distance.distanceKm} km` : "Calculating…"}
                            </Text>
                        </View>
                        <View style={styles.statBlock}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Est. Duration</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {distance?.durationMinutes !== undefined ? `~${distance.durationMinutes} mins` : "Calculating…"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Coupon Code Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textMuted }]}>Coupon</Text>
                    <View style={styles.couponRow}>
                        <TextInput
                            style={[styles.couponInput, { borderColor: colors.border, color: colors.text }]}
                            placeholder="Enter coupon code (e.g. SAVE20)"
                            placeholderTextColor={colors.textMuted}
                            value={couponInput}
                            onChangeText={(text) => {
                                setCouponInput(text);
                                setCouponError("");
                            }}
                            autoCapitalize="characters"
                            accessibilityLabel="Coupon code"
                        />
                        {appliedCoupon ? (
                            <Pressable
                                onPress={handleRemoveCoupon}
                                accessibilityRole="button"
                                accessibilityLabel="Remove coupon"
                                style={[styles.applyButton, { backgroundColor: colors.danger }]}
                            >
                                <Text style={[styles.applyButtonText, { color: "#FFFFFF" }]}>Remove</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={handleApplyCoupon}
                                accessibilityRole="button"
                                accessibilityLabel="Apply coupon"
                                style={[styles.applyButton, { backgroundColor: colors.secondary }]}
                            >
                                <Text style={[styles.applyButtonText, { color: colors.card }]}>Apply</Text>
                            </Pressable>
                        )}
                    </View>
                    {couponError ? (
                        <Text style={[styles.couponError, { color: colors.danger }]}>{couponError}</Text>
                    ) : null}
                    {pricing?.isCouponApplied ? (
                        <Text style={[styles.couponSuccess, { color: colors.success }]}>
                            ✓ Coupon {pricing.coupon} applied (-₹{pricing.discount})
                        </Text>
                    ) : appliedCoupon && !loading ? (
                        <Text style={[styles.couponError, { color: colors.danger }]}>
                            Coupon {appliedCoupon} is invalid or inactive
                        </Text>
                    ) : null}
                </View>

                {/* Server Fare Breakdown Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textMuted }]}>Fare Breakdown</Text>

                    {loading && !pricing ? (
                        <View style={styles.loadingWrapper}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                                Calculating server fare…
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorWrapper}>
                            <Text style={[styles.couponError, { color: colors.danger }]}>{error}</Text>
                            <Pressable onPress={() => fetchServerEstimate(appliedCoupon)}>
                                <Text style={{ color: colors.primary, marginTop: 4 }}>Retry</Text>
                            </Pressable>
                        </View>
                    ) : pricing ? (
                        <>
                            <FareRow
                                label={`Base Fare (first ${pricing.baseDistanceKm} km)`}
                                value={pricing.baseFare}
                                colors={colors}
                            />
                            {pricing.extraDistanceKm > 0 && (
                                <FareRow
                                    label={`Extra Distance (${pricing.extraDistanceKm} km × ₹${pricing.perKmRate})`}
                                    value={pricing.distanceFare}
                                    colors={colors}
                                />
                            )}
                            <FareRow label="Platform Fee" value={pricing.platformFee} colors={colors} />
                            <FareRow label="GST (5%)" value={pricing.gst} colors={colors} />
                            {pricing.isCouponApplied && (
                                <FareRow
                                    label={`Discount (${pricing.coupon})`}
                                    value={-pricing.discount}
                                    colors={colors}
                                    highlight
                                />
                            )}
                            <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
                            <FareRow label="Total Estimated Fare" value={pricing.totalFare} colors={colors} bold />
                        </>
                    ) : null}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
                <PrimaryButton
                    title={`Proceed to Payment · ₹${pricing?.totalFare || fare || 0}`}
                    onPress={handleProceed}
                    disabled={loading || !!error}
                />
            </View>
        </SafeAreaView>
    );
}

function FareRow({ label, value, bold, highlight, colors }) {
    return (
        <View style={styles.fareRow}>
            <Text
                style={[
                    styles.fareLabel,
                    { color: colors.textMuted },
                    bold && [styles.fareLabelBold, { color: colors.text }],
                ]}
            >
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
    loadingWrapper: { paddingVertical: Spacing.md, alignItems: "center" },
    loadingText: { fontSize: Fonts.caption, marginTop: Spacing.xs },
    errorWrapper: { paddingVertical: Spacing.sm },
});