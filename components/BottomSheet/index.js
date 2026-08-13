import { Modal, Pressable, View, StyleSheet } from "react-native";
import Spacing from "../../constants/Spacing";
import { useTheme } from "../../context/ThemeContext";

export default function BottomSheet({ visible, onClose, children }) {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
                <View style={[styles.sheet, { backgroundColor: colors.card }]}>{children}</View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17, 24, 39, 0.4)" },
    sheet: { borderTopLeftRadius: Spacing.borderRadius * 1.5, borderTopRightRadius: Spacing.borderRadius * 1.5, padding: Spacing.lg, paddingBottom: Spacing.xl },
});