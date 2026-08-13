import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

export default function Input({
  placeholder, icon, value, onChangeText, keyboardType = "default", maxLength, accessibilityLabel,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {icon && <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.icon} />}
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel || placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row", alignItems: "center", borderRadius: Spacing.borderRadius,
    borderWidth: 1, paddingHorizontal: Spacing.md, height: 52,
  },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Fonts.body },
});