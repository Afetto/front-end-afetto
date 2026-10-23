import appJson from "../../app.json";
import { conferirApiDoBuild } from "../../app.config";
import easJson from "../../eas.json";

// O APK do Firebase App Distribution sai do perfil "preview" do EAS
describe("Publicação (EAS → Firebase App Distribution)", () => {
  const preview = easJson.build.preview;

  it("o app Android tem nome e pacote no padrão da aula (o mesmo registrado no Firebase)", () => {
    expect(appJson.expo.name).toBe("Afetto");
    expect(appJson.expo.android.package).toBe("br.fiap.mad.afetto");
    // Vínculo com o projeto do EAS (o app.config.ts preserva o `extra` do app.json)
    expect(appJson.expo.extra.eas.projectId).toBe("e79105da-07ef-446f-973a-6c86e8a21287");
  });

  it("o perfil preview gera APK para distribuição interna, com o número do build controlado pelo EAS", () => {
    expect(preview.android.buildType).toBe("apk");
    expect(preview.distribution).toBe("internal");
    expect(preview.autoIncrement).toBe(true);
    expect(easJson.cli.appVersionSource).toBe("remote");
  });

  it("o perfil preview identifica o ambiente mostrado no Sobre o App", () => {
    expect(preview.env.EXPO_PUBLIC_APP_ENV).toBe("preview");
  });

  it("o build aponta para a API do Render em https e passa na conferência do app.config.ts", () => {
    expect(preview.env.EXPO_PUBLIC_API_URL).toBe("https://java-afetto.onrender.com");
    expect(() =>
      conferirApiDoBuild({
        EAS_BUILD: "true",
        EAS_BUILD_PROFILE: "preview",
        EXPO_PUBLIC_API_URL: preview.env.EXPO_PUBLIC_API_URL,
      })
    ).not.toThrow();
  });
});
