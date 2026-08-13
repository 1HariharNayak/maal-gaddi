import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Spacing from "../../constants/Spacing";
import Fonts from "../../constants/Fonts";
import PrimaryButton from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const { phoneNumber, login } = useAuth();
  const { colors } = useTheme();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  const isComplete = digits.every((d) => d !== "");

  useEffect(() => {
    if (secondsLeft === 0) return;
    const interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleChangeDigit = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const next = [...digits];
    next[index] = cleaned.slice(-1);
    setDigits(next);
    if (cleaned && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    if (!isComplete) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      login("Arya");
      router.replace("/(tabs)/home");
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Verify your number</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Enter the 6-digit code sent to {phoneNumber ? `+91 ${phoneNumber}` : "your phone"}
        </Text>

        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                { borderColor: digit ? colors.primary : colors.border, backgroundColor: colors.card, color: colors.text },
              ]}
              value={digit}
              onChangeText={(text) => handleChangeDigit(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          {secondsLeft > 0 ? (
            <Text style={[styles.timerText, { color: colors.textMuted }]}>
              Resend OTP in 0:{secondsLeft.toString().padStart(2, "0")}
            </Text>
          ) : (
            <Pressable onPress={handleResend} accessibilityRole="button" accessibilityLabel="Resend OTP">
              <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.buttonSpacing}>
          <PrimaryButton title="Verify" onPress={handleVerify} loading={verifying} disabled={!isComplete} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: Spacing.lg },
  title: { fontSize: Fonts.h2, fontWeight: Fonts.weight.bold, marginBottom: Spacing.xs },
  subtitle: { fontSize: Fonts.body, marginBottom: Spacing.xl },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.lg },
  otpBox: { width: 48, height: 56, borderRadius: Spacing.borderRadius, borderWidth: 1, fontSize: Fonts.h3, textAlign: "center" },
  resendRow: { alignItems: "center", marginBottom: Spacing.lg },
  timerText: { fontSize: Fonts.body },
  resendText: { fontSize: Fonts.body, fontWeight: Fonts.weight.semibold },
  buttonSpacing: { marginTop: Spacing.sm },
});