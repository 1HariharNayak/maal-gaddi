// Centralized dummy data. Screens import from here instead of each
// defining their own copies — Home, Vehicle Selection, and Bookings
// all read the same vehicles/bookings arrays.

export const vehicles = [
    { id: 1, name: "Mini Truck", price: 499, capacity: "750 kg", eta: "30 mins", icon: "truck" },
    { id: 2, name: "Pickup 8ft", price: 699, capacity: "1000 kg", eta: "35 mins", icon: "truck-flatbed" },
    { id: 3, name: "Tempo", price: 899, capacity: "1200 kg", eta: "25 mins", icon: "truck-fast" },
    { id: 4, name: "Eicher", price: 1499, capacity: "3000 kg", eta: "40 mins", icon: "truck-trailer" },
];

export const offers = [
    { id: 1, title: "20% OFF", description: "First Booking" },
    { id: 2, title: "FREE Toll", description: "Orders above ₹999" },
];

export const bookings = [
    {
        id: "#MG12345",
        vehicle: "Mini Truck",
        driver: "Ramesh Kumar",
        status: "Completed",
        fare: 899,
        date: "20 July 2026",
    },
    {
        id: "#MG12346",
        vehicle: "Tempo",
        driver: "Suresh Yadav",
        status: "Upcoming",
        fare: 1299,
        date: "2 August 2026",
    },
    {
        id: "#MG12340",
        vehicle: "Pickup 8ft",
        driver: "Vikram Singh",
        status: "Cancelled",
        fare: 699,
        date: "15 July 2026",
    },
];

export const popularRoutes = [
    { id: 1, from: "Andheri", to: "Bandra" },
    { id: 2, from: "Powai", to: "Thane" },
    { id: 3, from: "Dadar", to: "Worli" },
];
export const recentLocations = [
    { id: 1, label: "MG Road Metro Station", address: "MG Road, Bengaluru" },
    { id: 2, label: "Forum Mall", address: "Koramangala, Bengaluru" },
];

export const savedLocations = [
    { id: 1, label: "Home", address: "12th Cross, Indiranagar", icon: "home" },
    { id: 2, label: "Work", address: "Prestige Tech Park, Bengaluru", icon: "briefcase" },
];