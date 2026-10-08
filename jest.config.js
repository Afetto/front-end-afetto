// Os testes de data rodam no fuso do público do app. Em UTC (padrão de muitos
// servidores de CI) o bug clássico de `new Date("AAAA-MM-DD")` cair no dia
// anterior não aparece, e o teste passaria sem testar nada.
process.env.TZ = "America/Sao_Paulo";

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // A primeira renderização de um teste "frio" (babel + primeiro render) passa dos 5s padrão.
  testTimeout: 15000,
};
