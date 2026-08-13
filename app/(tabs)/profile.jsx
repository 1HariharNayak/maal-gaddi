import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import BottomSheet from "../../components/BottomSheet";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { key: "bookings", label: "My Bookings", icon: "receipt-outline" },
  { key: "addresses", label: "Saved Addresses", icon: "location-outline" },
  { key: "payment", label: "Payment Methods", icon: "card-outline" },
  { key: "coupons", label: "Coupons", icon: "pricetag-outline" },
  { key: "help", label: "Help", icon: "help-circle-outline" },
  { key: "privacy", label: "Privacy Policy", icon: "shield-checkmark-outline" },
  { key: "about", label: "About", icon: "information-circle-outline" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, phoneNumber, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);

  const handleOptionPress = (option) => {
    if (option.key === "bookings") {
      router.push("/(tabs)/bookings");
      return;
    }
    Alert.alert(option.label, "Coming soon!");
  };

  const handleConfirmLogout = () => {
    setLogoutSheetVisible(false);
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person" size={32} color={colors.card} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name || "Guest"}</Text>
            <Text style={[styles.phone, { color: colors.textMuted }]}>
              {phoneNumber ? `+91 ${phoneNumber}` : "No number on file"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.optionsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.optionRow, { borderBottomColor: colors.border }]}>
            <Ionicons
              name={isDark ? "moon" : "moon-outline"}
              size={20}
              color={colors.secondary}
            />
            <Text style={[styles.optionLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>

        <View
          style={[
            styles.optionsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {OPTIONS.map((option, index) => (
            <Pressable
              key={option.key}
              onPress={() => handleOptionPress(option)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={[
                styles.optionRow,
                { borderBottomColor: colors.border },
                index === OPTIONS.length - 1 && styles.optionRowLast,
              ]}
            >
              <Ionicons name={option.icon} size={20} color={colors.secondary} />
              <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setLogoutSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          style={styles.logoutRow}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutLabel, { color: colors.danger }]}>Logout</Text>
        </Pressable>
      </ScrollView>

      <BottomSheet visible={logoutSheetVisible} onClose={() => setLogoutSheetVisible(false)}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>Log out of Maal Gaddi?</Text>
        <Text style={[styles.sheetMessage, { color: colors.textMuted }]}>
          You'll need to verify your number again to log back in.
        </Text>
        <Pressable
          style={[styles.sheetConfirmButton, { backgroundColor: colors.danger }]}
          onPress={handleConfirmLogout}
          accessibilityRole="button"
          accessibilityLabel="Yes, logout"
        >
          <Text style={styles.sheetConfirmText}>Yes, Logout</Text>
        </Pressable>
        <Pressable
          style={styles.sheetDismissButton}
          onPress={() => setLogoutSheetVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={[styles.sheetDismissText, { color: colors.textMuted }]}>Cancel</Text>
        </Pressable>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: Fonts.h2, fontWeight: Fonts.weight.bold },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Spacing.borderRadius,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  flexShrink: { flexShrink: 1 },
  name: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold },
  phone: { fontSize: Fonts.caption, marginTop: 2 },
  optionsCard: {
    borderRadius: Spacing.borderRadius,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  optionRowLast: { borderBottomWidth: 0 },
  optionLabel: { flex: 1, fontSize: Fonts.body, marginLeft: Spacing.md },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  logoutLabel: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold, marginLeft: Spacing.sm },
  sheetTitle: { fontSize: Fonts.h3, fontWeight: Fonts.weight.bold },
  sheetMessage: { fontSize: Fonts.body, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  sheetConfirmButton: {
    borderRadius: Spacing.borderRadius,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sheetConfirmText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold, color: "#FFFFFF" },
  sheetDismissButton: { paddingVertical: Spacing.md, alignItems: "center" },
  sheetDismissText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
});