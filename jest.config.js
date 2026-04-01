module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|expo-font|expo-linear-gradient|@react-navigation/.*|react-native-svg|@react-native-async-storage/async-storage))'
  ]
};
