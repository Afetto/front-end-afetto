import { conferirApiDoBuild } from "../../app.config";

// O build do EAS (o APK do Firebase App Distribution) precisa saber onde está a
// API: no celular não há Expo no computador para achar a API local.
describe("conferirApiDoBuild", () => {
  it("fora do EAS (npx expo start, testes) não exige nada", () => {
    expect(() => conferirApiDoBuild({})).not.toThrow();
  });

  it("build do EAS sem EXPO_PUBLIC_API_URL para com a explicação", () => {
    expect(() =>
      conferirApiDoBuild({ EAS_BUILD: "true", EAS_BUILD_PROFILE: "preview" })
    ).toThrow(/EXPO_PUBLIC_API_URL não definida/);
  });

  it("build do EAS com http:// também para (o Android bloqueia http em produção)", () => {
    expect(() =>
      conferirApiDoBuild({
        EAS_BUILD: "true",
        EAS_BUILD_PROFILE: "production",
        EXPO_PUBLIC_API_URL: "http://192.168.0.10:8080",
      })
    ).toThrow(/precisa ser https/);
  });

  it("build do EAS com a API do Render em https passa", () => {
    expect(() =>
      conferirApiDoBuild({
        EAS_BUILD: "true",
        EAS_BUILD_PROFILE: "preview",
        EXPO_PUBLIC_API_URL: "https://afetto.onrender.com",
      })
    ).not.toThrow();
  });

  it("perfil development (dev client) fica de fora: ele usa o Expo do computador", () => {
    expect(() =>
      conferirApiDoBuild({ EAS_BUILD: "true", EAS_BUILD_PROFILE: "development" })
    ).not.toThrow();
  });
});
