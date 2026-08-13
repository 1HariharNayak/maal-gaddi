// Central place to register local image assets so screens/components
// import from here instead of scattering `require("../../assets/...")`
// paths everywhere.
//
// NOTE: Real PNG/SVG assets (truck.png, pickup.png, etc.) are not
// supplied yet. Until you drop real files into /assets/images, screens
// use icon-based placeholders (Expo Vector Icons) instead of these,
// so the app never crashes on a missing require(). Swap in the real
// paths here once you have final art — no other file needs to change.

const Images = {
  // truckIllustration: require("../assets/images/truck-illustration.png"),
  // vehicleMiniTruck: require("../assets/images/truck.png"),
  // vehiclePickup: require("../assets/images/pickup.png"),
  // vehicleTempo: require("../assets/images/tempo.png"),
  // vehicleEicher: require("../assets/images/eicher.png"),
};

export default Images;
