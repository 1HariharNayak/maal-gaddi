import { Pressable, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";

export default function Banner({ title, subtitle, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title}
            style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
        >
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="truck-delivery" size={48} color="rgba(255,255,255,0.35)" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: Colors.secondary,
        borderRadius: Spacing.borderRadius,
        padding: Spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pressed: {
        opacity: 0.9,
    },
    textBlock: {
        flexShrink: 1,
    },
    title: {
        fontSize: Fonts.h3,
        fontWeight: Fonts.weight.bold,
        color: Colors.card,
    },
    subtitle: {
        fontSize: Fonts.caption,
        color: "rgba(255,255,255,0.75)",
        marginTop: 2,
    },
});