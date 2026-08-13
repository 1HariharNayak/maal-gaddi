import { Pressable, View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

export default function SearchBar({ placeholder, value, onChangeText, onPress, icon = "search", editable = true }) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.wrapper, { backgroundColor: colors.card }]}>
      <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.icon} />
      {onChangeText ? (
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          accessibilityLabel={placeholder}
        />
      ) : (
        <Text style={[styles.input, { color: value ? colors.text : colors.textMuted }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={placeholder}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row", alignItems: "center", borderRadius: Spacing.borderRadius,
    paddingHorizontal: Spacing.md, height: 48,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Fonts.body },
});