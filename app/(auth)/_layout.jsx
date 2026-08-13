import { Stack } from "expo-router";

// Everything under app/(auth)/ (login.jsx, otp.jsx) shares this Stack.
// It has no tab bar because a logged-out user shouldn't see app
// navigation yet.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
