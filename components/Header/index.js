import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

export default function Header({ title, onBack, rightIcon, onRightPress }) {
    const router = useRouter();
    const { colors } = useTheme();
    const handleBack = onBack || (() => router.back());

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Pressable onPress={handleBack} accessibilityRole="button" accessibilityLabel="Go back" style={styles.iconButton}>
                <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>

            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>

            {rightIcon ? (
                <Pressable onPress={onRightPress} accessibilityRole="button" accessibilityLabel={rightIcon} style={styles.iconButton}>
                    <Ionicons name={rightIcon} size={22} color={colors.text} />
                </Pressable>
            ) : (
                <View style={styles.iconButton} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1,
    },
    iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, textAlign: "center", fontSize: Fonts.h3, fontWeight: Fonts.weight.semibold },
});