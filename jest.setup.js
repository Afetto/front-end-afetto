// Variável normalmente injetada pelo Expo a partir do .env — definida aqui para o runtime de teste.
process.env.EXPO_PUBLIC_API_URL = "https://api.test.local";

// react-native-reanimated: mock leve e manual (evita o runtime de worklets nos testes).
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c) => c },
    View,
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withSpring: (toValue) => toValue,
    withTiming: (toValue) => toValue,
  };
});

// expo-router: stub da API imperativa de navegação.
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  },
}));
