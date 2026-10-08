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

// expo-notifications: módulo nativo — nos testes vira funções vazias, para as
// telas e hooks que passam pelo notificacao.service não dependerem do aparelho.
// O service tem teste próprio, com mock detalhado (notificacao.service.test.ts).
jest.mock("expo-notifications", () => ({
  AndroidImportance: { HIGH: 6 },
  SchedulableTriggerInputTypes: { DATE: "date" },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  clearLastNotificationResponse: jest.fn(),
  useLastNotificationResponse: jest.fn(() => null),
}));
