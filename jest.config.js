module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // A primeira renderização de um teste "frio" (babel + primeiro render) passa dos 5s padrão.
  testTimeout: 15000,
};
