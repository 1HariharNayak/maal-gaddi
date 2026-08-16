import {
    offers,
    popularRoutes,
    recentLocations,
    savedLocations,
} from "./dummyData";
import apiClient from "./apiClient";

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- REAL backend calls (vehicles) ---
export async function fetchVehicles() {
    try {
        const response = await apiClient.get("/vehicles");
        const vehiclesList = (Array.isArray(response.data) ? response.data : []).map((v) => ({
            id: v._id || v.id,
            _id: v._id || v.id,
            name: v.name,
            price: v.price,
            pricing: v.pricing || {
                baseFare: v.price || 200,
                baseDistanceKm: 2.0,
                perKmRate: 18,
                minimumFare: v.price || 200,
            },
            capacity: v.capacity,
            eta: v.eta,
            icon: v.icon,
            isActive: v.isActive !== false,
        }));
        return { data: vehiclesList, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Failed to load vehicles. Please try again.",
        };
    }
}

// --- REAL backend calls (bookings & pricing) ---
function mapBooking(b) {
    if (!b) return null;
    return {
        id: b.bookingId || b._id,
        _id: b._id,
        bookingId: b.bookingId,
        vehicle: typeof b.vehicle === "object" ? b.vehicle?.name : (b.vehicle || "Vehicle"),
        vehicleData: typeof b.vehicle === "object" ? b.vehicle : null,
        driver: b.driver || "Assigning driver…",
        status: b.status || "Upcoming",
        fare: b.fare,
        pricingBreakdown: b.pricingBreakdown,
        coupon: b.coupon,
        pickupLocation: b.pickupLocation,
        dropLocation: b.dropLocation,
        date: b.createdAt
            ? new Date(b.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              })
            : "Today",
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

export async function estimateFare(payload) {
    try {
        const response = await apiClient.post("/bookings/estimate-fare", {
            vehicleId: payload.vehicleId,
            pickupLocation: payload.pickupLocation,
            dropLocation: payload.dropLocation,
            coupon: payload.coupon,
        });
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Failed to calculate fare estimate",
        };
    }
}

export async function fetchBookings(status) {
    try {
        const response = await apiClient.get("/bookings", {
            params: status ? { status } : undefined,
        });
        const bookingsList = (Array.isArray(response.data) ? response.data : []).map(mapBooking);
        return { data: bookingsList, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Failed to load bookings",
        };
    }
}

export async function createBooking(payload) {
    try {
        const response = await apiClient.post("/bookings", {
            vehicleId: payload.vehicleId,
            pickupLocation: payload.pickupLocation,
            dropLocation: payload.dropLocation,
            coupon: payload.coupon,
        });
        return { data: mapBooking(response.data), error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Failed to create booking",
        };
    }
}

export async function cancelBooking(id) {
    try {
        const response = await apiClient.patch(`/bookings/${id}/cancel`);
        return { data: mapBooking(response.data), error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Failed to cancel booking",
        };
    }
}

export async function fetchBookingById(id) {
    try {
        const response = await apiClient.get(`/bookings/${id}`);
        return { data: mapBooking(response.data), error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Failed to fetch booking details",
        };
    }
}

// --- Static discovery mocks ---
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

// --- REAL backend calls (auth) ---
export async function requestOtp(payload) {
    try {
        const body = typeof payload === "object"
            ? { name: payload.name, phone: payload.phone || payload.phoneNumber }
            : { phone: payload };
        const response = await apiClient.post("/auth/request-otp", body);
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Something went wrong. Please try again.",
        };
    }
}

export async function verifyOtp(payloadOrPhone, otpArg, nameArg) {
    try {
        const body = typeof payloadOrPhone === "object"
            ? {
                phone: payloadOrPhone.phone || payloadOrPhone.phoneNumber,
                otp: payloadOrPhone.otp,
                name: payloadOrPhone.name,
            }
            : {
                phone: payloadOrPhone,
                otp: otpArg,
                name: nameArg,
            };
        const response = await apiClient.post("/auth/verify-otp", body);
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Invalid OTP. Please try again.",
        };
    }
}

export async function fetchMe() {
    try {
        const response = await apiClient.get("/auth/me");
        return { data: response.data, error: null };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.message || "Session expired",
        };
    }
}