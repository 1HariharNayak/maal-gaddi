import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import Fonts from "../constants/Fonts";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Shared value starts at 0 (fully transparent). Reanimated updates this
  // on the native thread, so the animation stays smooth even while JS is busy.
  const opacity = useSharedValue(0);

  // Turns the shared value into an actual style object Animated.View can use.
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    // Fade in over 800ms as soon as the screen mounts.
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // After giving the user a moment to see the branding, move on.
    // isAuthenticated is false for everyone right now since Login/OTP
    // aren't built yet — this always sends you to Login for now, and
    // will correctly skip it once real auth exists.
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? "/(tabs)/home" : "/(auth)/login");
    }, 1800);

    // Cleanup: if this screen were ever unmounted before the timer fires,
    // this cancels it so we don't navigate from a screen that's gone.
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View
          style={styles.iconWrapper}
          accessibilityLabel="Maal Gaddi logo"
          accessibilityRole="image"
        >
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={72}
            color={Colors.card}
          />
        </View>
        <Text style={styles.appName}>Maal Gaddi</Text>
        <Text style={styles.tagline}>Move Anything, Anytime</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: Fonts.h1,
    fontWeight: Fonts.weight.bold,
    color: Colors.card,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: Fonts.body,
    color: "rgba(255,255,255,0.85)",
    marginTop: Spacing.xs,
  },
});
