import {
    vehicles,
    offers,
    popularRoutes,
    recentLocations,
    savedLocations,
    bookings,
} from "./dummyData";

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchVehicles() {
    await delay(400);
    return { data: vehicles, error: null };
}

export async function fetchOffers() {
    await delay(350);
    return { data: offers, error: null };
}

export async function fetchPopularRoutes() {
    await delay(300);
    return { data: popularRoutes, error: null };
}

export async function fetchRecentLocations() {
    await delay(300);
    return { data: recentLocations, error: null };
}

export async function fetchSavedLocations() {
    await delay(300);
    return { data: savedLocations, error: null };
}

export async function fetchBookings() {
    await delay(400);
    return { data: [...bookings], error: null };
}

export async function createBooking(bookingData) {
    await delay(1000);
    const newBooking = {
        id: `#MG${Math.floor(10000 + Math.random() * 89999)}`,
        status: "Upcoming",
        driver: "Assigning driver…",
        date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
        ...bookingData,
    };
    bookings.unshift(newBooking);
    return { data: newBooking, error: null };
}

export async function cancelBooking(bookingId) {
    await delay(500);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
        return { data: null, error: "Booking not found" };
    }
    booking.status = "Cancelled";
    return { data: booking, error: null };
}