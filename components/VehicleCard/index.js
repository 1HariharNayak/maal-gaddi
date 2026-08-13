import { memo } from "react";
import { Pressable, Text, View, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

function VehicleCard({ image, icon, title, capacity, price, eta, selected, onPress }) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${price} rupees, ${capacity}`}
            style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border },
                selected && styles.cardSelectedWidth,
            ]}
        >
            <View style={[styles.iconWrapper, { backgroundColor: colors.background }]}>
                {image ? (
                    <Image source={image} style={styles.image} resizeMode="contain" />
                ) : (
                    <MaterialCommunityIcons name={icon || "truck"} size={40} color={colors.secondary} />
                )}
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{capacity}</Text>
            <View style={styles.footer}>
                <Text style={[styles.eta, { color: colors.textMuted }]}>{eta}</Text>
                <Text style={[styles.price, { color: colors.primary }]}>₹{price}</Text>
            </View>
        </Pressable>
    );
}

export default memo(VehicleCard);

const styles = StyleSheet.create({
    card: { width: 140, borderRadius: Spacing.borderRadius, borderWidth: 1, padding: Spacing.md, marginRight: Spacing.md },
    cardSelectedWidth: { borderWidth: 2 },
    iconWrapper: { height: 56, borderRadius: Spacing.borderRadius, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
    image: { width: 56, height: 56 },
    name: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
    meta: { fontSize: Fonts.caption, marginTop: 2 },
    footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.sm },
    eta: { fontSize: Fonts.caption },
    price: { fontSize: Fonts.body, fontWeight: Fonts.weight.bold },
});