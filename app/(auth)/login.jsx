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
import { requestOtp } from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { setName, setPhoneNumber } = useAuth();
  const { colors } = useTheme();
  const [name, setLocalName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isNameValid = name.trim().length >= 2 && name.trim().length <= 50;
  const isPhoneValid = phone.length === 10;
  const isValid = isNameValid && isPhoneValid;

  const handleContinue = async () => {
    if (!isValid) {
      if (!isNameValid) {
        setError("Please enter a valid name (2-50 characters)");
        return;
      }
      if (!isPhoneValid) {
        setError("Phone number must be exactly 10 digits");
        return;
      }
      return;
    }

    setLoading(true);
    setError("");

    const trimmedName = name.trim();
    const { error: apiError } = await requestOtp({ name: trimmedName, phone });

    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    setName(trimmedName);
    setPhoneNumber(phone);
    router.push("/(auth)/otp");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome to Maal Gaddi</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Enter your details to get started or log in.
          </Text>

          <Input
            placeholder="Full Name"
            icon="person-outline"
            value={name}
            onChangeText={(text) => {
              setLocalName(text);
              setError("");
            }}
            maxLength={50}
            autoCapitalize="words"
          />

          <View style={styles.inputGap} />

          <Input
            placeholder="Mobile Number"
            icon="call-outline"
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^0-9]/g, "").slice(0, 10));
              setError("");
            }}
            keyboardType="number-pad"
            maxLength={10}
          />

          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <View style={styles.buttonSpacing}>
            <PrimaryButton
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              disabled={!isValid}
            />
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
  inputGap: { height: Spacing.md },
  errorText: { fontSize: Fonts.caption, marginTop: Spacing.sm },
  buttonSpacing: { marginTop: Spacing.lg },
  terms: { fontSize: Fonts.caption, textAlign: "center", marginTop: Spacing.xl, lineHeight: 18 },
});