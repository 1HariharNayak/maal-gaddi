import { createContext, useContext, useState } from "react";

const BookingContext = createContext(undefined);

export function BookingProvider({ children }) {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fare, setFare] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const resetBooking = () => {
    setPickupLocation(null);
    setDropLocation(null);
    setSelectedVehicle(null);
    setFare(null);
    setCoupon(null);
    setConfirmedBooking(null);
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
    confirmedBooking,
    setConfirmedBooking,
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
