import { Stack } from "expo-router";

export default function BookingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="pickup-location" />
            <Stack.Screen name="drop-location" />
            <Stack.Screen name="vehicle-selection" />
            <Stack.Screen name="booking-summary" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="booking-success" />
            <Stack.Screen name="tracking" />
        </Stack>
    );
}