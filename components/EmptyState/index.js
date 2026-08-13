import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import PrimaryButton from "../Button";
import { useTheme } from "../../context/ThemeContext";

export default function EmptyState({ icon = "file-tray-outline", title, message, actionLabel, onAction }) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.background }]}>
                <Ionicons name={icon} size={32} color={colors.textMuted} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
            {actionLabel && onAction ? (
                <View style={styles.actionWrapper}>
                    <PrimaryButton title={actionLabel} onPress={onAction} />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
    iconWrapper: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
    title: { fontSize: Fonts.h3, fontWeight: Fonts.weight.semibold, textAlign: "center" },
    message: { fontSize: Fonts.body, textAlign: "center", marginTop: Spacing.xs },
    actionWrapper: { marginTop: Spacing.lg, width: "60%" },
});