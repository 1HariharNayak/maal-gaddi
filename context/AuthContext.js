import { createContext, useContext, useState } from "react";

// Shape of what this context holds, kept as a comment for quick reference:
// {
//   phoneNumber: string,
//   isOtpVerified: boolean,
//   user: { name: string } | null,
//   isAuthenticated: boolean
// }

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [user, setUser] = useState(null);

  const login = (name) => {
    // Dummy login: in a real app this would come from an API response
    // after OTP verification succeeds.
    setUser({ name });
    setIsOtpVerified(true);
  };

  const logout = () => {
    setUser(null);
    setIsOtpVerified(false);
    setPhoneNumber("");
  };

  const value = {
    phoneNumber,
    setPhoneNumber,
    isOtpVerified,
    setIsOtpVerified,
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so screens never import AuthContext directly (per the
// project's state management rules) — they call useAuth() instead.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
