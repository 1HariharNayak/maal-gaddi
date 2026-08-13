import { memo } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

const STATUS_COLORS = {
    Completed: Colors.success,
    Upcoming: Colors.primary,
    Cancelled: Colors.danger,
};

function BookingCard({ booking, onPress }) {
    const { colors } = useTheme();
    const statusColor = STATUS_COLORS[booking.status] || colors.textMuted;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Booking ${booking.id}, ${booking.status}`}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
            ]}
        >
            <View style={[styles.iconWrapper, { backgroundColor: colors.background }]}>
                <MaterialCommunityIcons name="truck-outline" size={24} color={colors.secondary} />
            </View>

            <View style={styles.details}>
                <View style={styles.topRow}>
                    <Text style={[styles.id, { color: colors.text }]}>{booking.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1A` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{booking.status}</Text>
                    </View>
                </View>
                <Text style={[styles.vehicle, { color: colors.textMuted }]}>{booking.vehicle} • {booking.driver}</Text>
                <View style={styles.bottomRow}>
                    <Text style={[styles.date, { color: colors.textMuted }]}>{booking.date}</Text>
                    <Text style={[styles.fare, { color: colors.text }]}>₹{booking.fare}</Text>
                </View>
            </View>
        </Pressable>
    );
}

export default memo(BookingCard);

const styles = StyleSheet.create({
    card: { flexDirection: "row", borderRadius: Spacing.borderRadius, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
    pressed: { opacity: 0.9 },
    iconWrapper: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
    details: { flex: 1 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    id: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
    statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 999 },
    statusText: { fontSize: Fonts.caption, fontWeight: Fonts.weight.semibold },
    vehicle: { fontSize: Fonts.caption, marginTop: 4 },
    bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.xs },
    date: { fontSize: Fonts.caption },
    fare: { fontSize: Fonts.body, fontWeight: Fonts.weight.bold },
});