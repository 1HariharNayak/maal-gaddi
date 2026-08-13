import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

const PRIMARY_TINT = "rgba(255, 107, 0, 0.15)";

function OfferCard({ title, description }) {
    const { colors } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconWrapper, { backgroundColor: PRIMARY_TINT }]}>
                <Ionicons name="pricetag" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        </View>
    );
}

export default memo(OfferCard);

const styles = StyleSheet.create({
    card: { width: 160, borderRadius: Spacing.borderRadius, padding: Spacing.md, marginRight: Spacing.md, borderWidth: 1 },
    iconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
    title: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold },
    description: { fontSize: Fonts.caption, marginTop: 2 },
});