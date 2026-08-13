import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

export default function PrimaryButton({ title, onPress, loading = false, disabled = false }) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isDisabled) return;
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[styles.button, { backgroundColor: isDisabled ? colors.textMuted : colors.primary }]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Spacing.borderRadius,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: Fonts.body,
    fontWeight: Fonts.weight.semibold,
  },
});