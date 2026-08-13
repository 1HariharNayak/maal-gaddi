import { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { light, dark } from "../constants/Colors";

const THEME_STORAGE_KEY = "@maalgaddi_theme_preference";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
          setIsDark(stored === "dark");
        }
      } catch (e) {
        // Silently keep system-scheme default.
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch (e) {
      // Non-fatal.
    }
  };

  const colors = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}