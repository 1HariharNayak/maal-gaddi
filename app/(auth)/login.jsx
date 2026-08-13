import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import Input from "../../components/Input";
import PrimaryButton from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { setPhoneNumber } = useAuth();
  const { colors } = useTheme();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = phone.length === 10;

  const handleContinue = () => {
    if (!isValid) return;
    setLoading(true);
    setPhoneNumber(phone);
    setTimeout(() => {
      setLoading(false);
      router.push("/(auth)/otp");
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Enter your mobile number</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            We'll send you a one-time code to verify it's you.
          </Text>

          <Input
            placeholder="Mobile Number"
            icon="call-outline"
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, "").slice(0, 10))}
            keyboardType="number-pad"
            maxLength={10}
          />

          <View style={styles.buttonSpacing}>
            <PrimaryButton title="Continue" onPress={handleContinue} loading={loading} disabled={!isValid} />
          </View>

          <Text style={[styles.terms, { color: colors.textMuted }]}>
            By continuing, you agree to Maal Gaddi's Terms of Service and Privacy Policy.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: Spacing.lg },
  title: { fontSize: Fonts.h2, fontWeight: Fonts.weight.bold, marginBottom: Spacing.xs },
  subtitle: { fontSize: Fonts.body, marginBottom: Spacing.xl },
  buttonSpacing: { marginTop: Spacing.lg },
  terms: { fontSize: Fonts.caption, textAlign: "center", marginTop: Spacing.xl, lineHeight: 18 },
});