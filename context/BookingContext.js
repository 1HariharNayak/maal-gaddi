import { createContext, useContext, useState } from "react";

// Shape of what this context holds:
// {
//   pickupLocation: { address, latitude, longitude } | null,
//   dropLocation: { address, latitude, longitude } | null,
//   selectedVehicle: object | null,
//   fare: number | null,
//   coupon: string | null
// }
//
// Why a Context instead of route params: the booking flow spans six
// screens (pickup -> drop -> vehicle -> summary -> payment -> success).
// Passing all of that through router params would mean re-serializing
// objects into strings at every navigation call. Keeping it in one
// Context means every screen reads/writes the same object directly.

const BookingContext = createContext(undefined);

export function BookingProvider({ children }) {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fare, setFare] = useState(null);
  const [coupon, setCoupon] = useState(null);

  const resetBooking = () => {
    setPickupLocation(null);
    setDropLocation(null);
    setSelectedVehicle(null);
    setFare(null);
    setCoupon(null);
  };

  const value = {
    pickupLocation,
    setPickupLocation,
    dropLocation,
    setDropLocation,
    selectedVehicle,
    setSelectedVehicle,
    fare,
    setFare,
    coupon,
    setCoupon,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
