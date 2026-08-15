import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchMe } from "../services/api";
import { TOKEN_STORAGE_KEY } from "../services/apiClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedToken) {
          setToken(storedToken);
          const { data, error } = await fetchMe();
          if (data && !error) {
            setUser(data);
            if (data.name) setName(data.name);
            if (data.phone || data.phoneNumber) setPhoneNumber(data.phone || data.phoneNumber);
          } else {
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
            setToken(null);
          }
        }
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (userData?.name) setName(userData.name);
    if (userData?.phone || userData?.phoneNumber) {
      setPhoneNumber(userData.phone || userData.phoneNumber);
    }
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setName("");
    setPhoneNumber("");
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const value = {
    name,
    setName,
    phoneNumber: user?.phone || user?.phoneNumber || phoneNumber,
    setPhoneNumber,
    user,
    token,
    isAuthenticated: !!user,
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}