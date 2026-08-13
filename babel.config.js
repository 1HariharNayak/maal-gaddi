module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // NOTE: no react-native-reanimated/plugin entry here.
    // As of Reanimated v4 (SDK 54+), babel-preset-expo manages the
    // Reanimated/Worklets Babel plugin automatically. Adding it manually,
    // like we did on SDK 51/Reanimated v3, now causes a duplicate-plugin
    // conflict instead of doing nothing.
    plugins: [],
  };
};
