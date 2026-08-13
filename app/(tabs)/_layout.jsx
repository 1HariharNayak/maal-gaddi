import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Fonts from "../../constants/Fonts";
import { useTheme } from "../../context/ThemeContext";

function TabIcon({ focused, color, size, activeName, inactiveName }) {
  return <Ionicons name={focused ? activeName : inactiveName} size={size} color={color} />;
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: Fonts.caption, fontWeight: Fonts.weight.medium },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="home" inactiveName="home-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="receipt" inactiveName="receipt-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="person" inactiveName="person-outline" />
          ),
        }}
      />
    </Tabs>
  );
}