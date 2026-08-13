// Shared pricing logic. Previously duplicated as identical constants in
// both booking-summary.jsx and payment.jsx — consolidated here so a rate
// change only needs to happen in one place.

export const GST_RATE = 0.05;
export const PLATFORM_FEE = 20;
export const VALID_COUPON = "SAVE20";
export const COUPON_DISCOUNT_RATE = 0.2;

export function calculateFareBreakdown(baseFare, appliedCoupon) {
    const gst = Math.round(baseFare * GST_RATE);
    const isCouponApplied = appliedCoupon === VALID_COUPON;
    const discount = isCouponApplied ? Math.round(baseFare * COUPON_DISCOUNT_RATE) : 0;
    const total = baseFare + gst + PLATFORM_FEE - discount;
    return { gst, isCouponApplied, discount, total };
}