# Maal Gaddi — Progress Log

Source of truth if context is ever lost. Read this before resuming work
in a new session.

## Concepts already taught (don't re-explain from scratch)
- Expo Router route groups — `(auth)`, `(tabs)`
- Root `_layout.jsx` and provider wrapping
- React Context + custom hook pattern (`useAuth`, `useBooking`)

## Completed

### Steps 1–4: Project Setup, Folder Structure, Theme, Navigation
- Full folder structure created per spec (app/, components/, constants/,
  context/, hooks/, services/, assets/, utils/).
- `package.json` with pinned dependency versions (Expo SDK ~51).
- `constants/Spacing.js` — 8px grid scale (xs–xxl) + shared borderRadius.
- `constants/Fonts.js` — type scale (h1–caption) + weight tokens.
- `constants/Colors.js` — **structured as `{ light: {...} }` internally**,
  default-exported as a flat object for now. This is a deliberate
  forward-compat decision so Dark Mode (step 19) is additive, not a
  refactor of every screen's `Colors.primary` usage.
- `constants/Images.js` — central asset registry, currently empty/commented
  out because no real PNG/SVG art has been supplied yet. Screens use
  Expo Vector Icons as placeholders until real assets are dropped in.
- `context/AuthContext.js` and `context/BookingContext.js` created with
  full provider + custom hook pattern, dummy-data-ready.
- `app/_layout.jsx` — root layout, wraps app in
  GestureHandlerRootView > SafeAreaProvider > AuthProvider > BookingProvider.
- `app/(auth)/_layout.jsx` and `app/(tabs)/_layout.jsx` — nested navigators.
- Placeholder screens created for `login`, `otp`, `home`, `bookings`,
  `profile`, and root `index` so the app runs end-to-end without
  crashing before each screen's dedicated build step. **These are
  temporary and get overwritten in their respective steps — this is
  expected, not a bug.**

### Architectural decisions made
1. **Route-param question resolved**: pickup and drop are two separate
   route files (not one shared screen), so no route param is ever
   needed to distinguish them — both write straight to `BookingContext`.
2. **Colors.js forward-compat structure** (see above).
3. **Dependency versions pinned** rather than "latest", to avoid the
   SDK drifting mid-project across many sessions. Currently Expo SDK 51.
   If you deliberately want to upgrade later, that should be its own
   explicit step, not an incidental one.
4. **Icon family**: not yet chosen — will be decided and documented
   when the first icon actually appears on screen (Splash or Login).

### Correction: Expo SDK 51 → 54
Original pin was SDK 51. Real device's Expo Go app only supports the
current SDK (54), and Expo Go does not stay backward compatible across
SDKs — so the project had to move to match, not the other way around.
Changes made:
- All Expo/React Native package versions bumped to SDK 54-compatible
  ranges (`expo ~54.0.0`, `react-native 0.81.4`, `react 19.1.0`, etc).
- **`react-native-reanimated` v3 → v4**, which introduced a required
  peer dependency, `react-native-worklets` (~0.5.1) — added explicitly.
- **`babel.config.js`**: removed the manual `react-native-reanimated/plugin`
  entry. `babel-preset-expo` auto-manages this as of Reanimated v4;
  keeping the manual entry causes a duplicate-plugin conflict.
- **`app.json`**: added `"newArchEnabled": true` explicitly — SDK 54
  defaults to the New Architecture, which Reanimated v4 requires.
- Lesson for future sessions: don't hand-pin exact patch versions again.
  After `npm install`, also run `npx expo install --fix` — it corrects
  every Expo-managed package to the exact version your installed SDK
  expects, which is more reliable than any version list written by hand.

### Correction: install requires --legacy-peer-deps
`expo-router`'s web/tab-bar support pulls in Radix UI packages that want
a slightly newer `react-dom` than the pinned `react` version. This is a
real upstream peer-dependency mismatch inside `expo-router`'s own
dependency tree, not something wrong in this project's own package.json.
Verified fix (reproduced and tested): a fully clean install — deleting
`node_modules`, `package-lock.json`, and `.expo` first — followed by
`npm install --legacy-peer-deps` completes cleanly and installs
`react-native-worklets` correctly. A stale `package-lock.json` left over
from an earlier attempt appears to make npm resolve more strictly and
hard-fail instead of just warning, so the delete-first step matters.
**Always use `--legacy-peer-deps` for `npm install` in this project
going forward**, including after any future `npm install <new-package>`.

### Step 5: Splash Screen
- `app/index.jsx` replaced with the real Splash Screen: fade-in animation
  (React Native Reanimated `useSharedValue`/`useAnimatedStyle`/`withTiming`),
  truck icon, app name, tagline, on a brand-color (`Colors.primary`)
  full-bleed background.
- After ~1.8s, `router.replace()` sends the user to `/(auth)/login`
  (or `/(tabs)/home` if `useAuth().isAuthenticated` is true — always
  false for now since Login/OTP aren't built yet).
- **Icon family decision**: MaterialCommunityIcons for vehicle/logistics
  imagery (has a proper truck icon; Ionicons doesn't). Ionicons for
  general UI icons (back arrows, bell, search, etc.) going forward.
  Keep this consistent across all remaining screens.

## Open questions / TODOs
- Real image assets (truck.png, pickup.png, tempo.png, eicher.png,
  truck illustration for splash) have not been supplied. Using icon
  placeholders until provided.
- Icon family (Ionicons vs Feather vs MaterialCommunityIcons) to be
  decided at first use.

## Next step
Step 5: Splash Screen (logo, truck illustration placeholder, app name,
tagline, fade animation, redirect logic based on `useAuth()`).
