import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Header from "../../components/Header";
import BottomSheet from "../../components/BottomSheet";
import { useBooking } from "../../context/BookingContext";
import { useTheme } from "../../context/ThemeContext";
import { bookings } from "../../services/dummyData";
import { cancelBooking } from "../../services/api";

const DRIVER_NAME = "Suresh Yadav";
const TRUCK_NUMBER = "KA 05 AB 1234";
const ETA_TEXT = "8 mins away";

const TIMELINE_STEPS = [
    { id: 1, label: "Order Placed", done: true },
    { id: 2, label: "Driver Assigned", done: true },
    { id: 3, label: "Truck En Route", done: true, current: true },
    { id: 4, label: "Arrived at Pickup", done: false },
    { id: 5, label: "Delivered", done: false },
];

export default function TrackingScreen() {
    const router = useRouter();
    const { resetBooking } = useBooking();
    const { colors, isDark } = useTheme();
    const [cancelSheetVisible, setCancelSheetVisible] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [otp] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));

    const latestBooking = bookings[0];

    const handleConfirmCancel = async () => {
        if (latestBooking) {
            setCancelling(true);
            await cancelBooking(latestBooking.id);
            setCancelling(false);
        }
        setCancelSheetVisible(false);
        resetBooking();
        router.replace("/(tabs)/home");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <Header title="Track Booking" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? "#1E293B" : "#E4ECF7" }]}>
                    <MaterialCommunityIcons name="truck-fast" size={40} color={colors.primary} />
                    <Text style={[styles.mapCaption, { color: colors.textMuted }]}>Live tracking</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.driverRow}>
                        <Ionicons name="person-circle" size={52} color={colors.secondary} />
                        <View style={styles.flexShrink}>
                            <Text style={[styles.driverName, { color: colors.text }]}>{DRIVER_NAME}</Text>
                            <Text style={[styles.truckNumber, { color: colors.textMuted }]}>{TRUCK_NUMBER}</Text>
                        </View>
                        <View style={[styles.otpBox, { backgroundColor: colors.background }]}>
                            <Text style={[styles.otpLabel, { color: colors.textMuted }]}>OTP</Text>
                            <Text style={[styles.otpValue, { color: colors.primary }]}>{otp}</Text>
                        </View>
                    </View>

                    <View style={[styles.etaRow, { borderTopColor: colors.border }]}>
                        <Ionicons name="time-outline" size={16} color={colors.primary} />
                        <Text style={[styles.etaText, { color: colors.text }]}>{ETA_TEXT}</Text>
                    </View>

                    <View style={styles.actionsRow}>
                        <Pressable style={[styles.actionButton, { borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Call driver">
                            <Ionicons name="call" size={18} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.primary }]}>Call Driver</Text>
                        </Pressable>
                        <Pressable style={[styles.actionButton, { borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Chat with driver">
                            <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.primary }]}>Chat</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textMuted }]}>Status</Text>
                    {TIMELINE_STEPS.map((step, index) => (
                        <View key={step.id} style={styles.timelineRow}>
                            <View style={styles.timelineIconColumn}>
                                <View
                                    style={[
                                        styles.timelineDot,
                                        { borderColor: colors.border, backgroundColor: colors.card },
                                        step.done && { borderColor: colors.primary, backgroundColor: colors.primary },
                                        step.current && { backgroundColor: colors.card },
                                    ]}
                                />
                                {index < TIMELINE_STEPS.length - 1 && (
                                    <View style={[styles.timelineLine, { backgroundColor: step.done ? colors.primary : colors.border }]} />
                                )}
                            </View>
                            <Text style={[styles.timelineLabel, { color: step.current ? colors.text : colors.textMuted }, step.current && styles.timelineLabelCurrent]}>
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>

                <Pressable
                    style={[styles.cancelButton, { borderColor: colors.danger }]}
                    onPress={() => setCancelSheetVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel booking"
                >
                    <Text style={[styles.cancelButtonText, { color: colors.danger }]}>Cancel Booking</Text>
                </Pressable>
            </ScrollView>

            <BottomSheet visible={cancelSheetVisible} onClose={() => setCancelSheetVisible(false)}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Cancel this booking?</Text>
                <Text style={[styles.sheetMessage, { color: colors.textMuted }]}>
                    This can't be undone. Your driver will be notified immediately.
                </Text>
                <Pressable
                    style={[styles.sheetConfirmButton, { backgroundColor: colors.danger }, cancelling && styles.sheetConfirmButtonDisabled]}
                    onPress={handleConfirmCancel}
                    disabled={cancelling}
                    accessibilityRole="button"
                    accessibilityLabel="Yes, cancel booking"
                >
                    {cancelling ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.sheetConfirmText}>Yes, Cancel Booking</Text>
                    )}
                </Pressable>
                <Pressable
                    style={styles.sheetDismissButton}
                    onPress={() => setCancelSheetVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel="No, keep booking"
                >
                    <Text style={[styles.sheetDismissText, { color: colors.textMuted }]}>No, Keep It</Text>
                </Pressable>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
    mapPlaceholder: { height: 160, borderRadius: Spacing.borderRadius, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
    mapCaption: { fontSize: Fonts.caption, marginTop: Spacing.xs },
    card: { borderRadius: Spacing.borderRadius, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
    cardTitle: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold, textTransform: "uppercase", marginBottom: Spacing.md },
    driverRow: { flexDirection: "row", alignItems: "center" },
    flexShrink: { flex: 1, marginLeft: Spacing.sm },
    driverName: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
    truckNumber: { fontSize: Fonts.caption, marginTop: 2 },
    otpBox: { alignItems: "center", borderRadius: Spacing.borderRadius, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
    otpLabel: { fontSize: 10 },
    otpValue: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold, letterSpacing: 2 },
    etaRow: { flexDirection: "row", alignItems: "center", marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
    etaText: { fontSize: Fonts.body, fontWeight: Fonts.weight.medium, marginLeft: Spacing.xs },
    actionsRow: { flexDirection: "row", marginTop: Spacing.md },
    actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: Spacing.borderRadius, paddingVertical: Spacing.sm, marginRight: Spacing.sm },
    actionText: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold, marginLeft: Spacing.xs },
    timelineRow: { flexDirection: "row", alignItems: "flex-start" },
    timelineIconColumn: { alignItems: "center", width: 20, marginRight: Spacing.sm },
    timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
    timelineLine: { width: 2, flex: 1, minHeight: 24 },
    timelineLabel: { fontSize: Fonts.body, paddingBottom: Spacing.md },
    timelineLabelCurrent: { fontWeight: Fonts.weight.semibold },
    cancelButton: { borderWidth: 1, borderRadius: Spacing.borderRadius, paddingVertical: Spacing.md, alignItems: "center" },
    cancelButtonText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
    sheetTitle: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold },
    sheetMessage: { fontSize: Fonts.body, marginTop: Spacing.xs, marginBottom: Spacing.lg },
    sheetConfirmButton: { borderRadius: Spacing.borderRadius, paddingVertical: Spacing.md, alignItems: "center", marginBottom: Spacing.sm },
    sheetConfirmButtonDisabled: { opacity: 0.7 },
    sheetConfirmText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold, color: "#FFFFFF" },
    sheetDismissButton: { paddingVertical: Spacing.md, alignItems: "center" },
    sheetDismissText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
});