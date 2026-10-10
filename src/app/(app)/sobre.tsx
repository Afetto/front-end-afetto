import { versaoDoApp } from "@/utils/versao";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const EQUIPE = [
  "Gustavo Souto de Melo",
  "Iago Liziero Pereira",
  "Ícaro José dos Santos",
  "Leonardo Barbosa Santos",
];

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
        {titulo}
      </Text>
      <View className="rounded-2xl bg-white dark:bg-gray-800 px-4 shadow-sm">{children}</View>
    </View>
  );
}

function Linha({ rotulo, valor, destaque, ultima }: { rotulo: string; valor: string; destaque?: boolean; ultima?: boolean }) {
  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${
        ultima ? "" : "border-b border-border dark:border-gray-700"
      }`}
    >
      <Text className="text-sm text-muted dark:text-gray-400">{rotulo}</Text>
      <Text
        selectable
        className={`text-[15px] ${destaque ? "font-bold text-primary dark:text-white" : "text-gray-900 dark:text-white"}`}
      >
        {valor}
      </Text>
    </View>
  );
}

/**
 * "Sobre o App": versão do app.json e o commit da versão instalada. O hash não
 * é escrito à mão — o app.config.ts lê do git (ou do EAS) na hora do build e
 * ele chega aqui em `Constants.expoConfig.extra`.
 */
export default function TelaSobre() {
  const versao = versaoDoApp(Constants.expoConfig);

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="flex-row items-center gap-3 bg-primary px-6 pb-6 pt-14">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Sobre o App</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-5 px-5 py-6">
          <View className="items-center gap-3 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            {/* Fundo branco nos dois temas: o logo tem letras escuras */}
            <View className="rounded-3xl bg-white p-2">
              <Image
                source={require("../../../assets/images/logo.png")}
                className="h-28 w-28"
                resizeMode="contain"
                accessibilityLabel="Logo do Afetto"
              />
            </View>
            <Text className="text-center text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              A saúde do seu pet acompanhada de perto: vacinas, remédios, consultas, lembretes e clínicas
              parceiras num lugar só.
            </Text>
            <Text className="text-center text-xs text-muted dark:text-gray-400">
              Challenge FIAP 2026 · em parceria com a CLYVO VET
            </Text>
          </View>

          <View className="gap-2">
            <Secao titulo="Versão">
              <Linha rotulo="Versão do app" valor={versao.versao} />
              <Linha
                rotulo="Commit"
                valor={versao.commitCurto ?? "não informado"}
                destaque
                ultima={!versao.dataCommit && !versao.commitCompleto}
              />
              {versao.dataCommit && (
                <Linha rotulo="Data do commit" valor={versao.dataCommit} ultima={!versao.commitCompleto} />
              )}
              {versao.commitCompleto && (
                <View className="py-3.5">
                  <Text className="text-sm text-muted dark:text-gray-400">Hash completo</Text>
                  <Text selectable className="mt-1 text-xs text-gray-900 dark:text-white">
                    {versao.commitCompleto}
                  </Text>
                </View>
              )}
            </Secao>

            {versao.comAlteracoes && (
              <Text className="px-1 text-xs text-amber">
                Gerado com alterações que ainda não estão em nenhum commit. Faça o commit antes de publicar.
              </Text>
            )}
            {!versao.commitCompleto && (
              <Text className="px-1 text-xs text-muted dark:text-gray-400">
                O hash é lido do git na hora do build (app.config.ts).
              </Text>
            )}
          </View>

          <Secao titulo="Equipe">
            {EQUIPE.map((nome, indice) => (
              <View
                key={nome}
                className={`flex-row items-center gap-3 py-3 ${
                  indice < EQUIPE.length - 1 ? "border-b border-border dark:border-gray-700" : ""
                }`}
              >
                <Ionicons name="person-circle-outline" size={20} color="#9E9589" />
                <Text className="text-[15px] text-gray-900 dark:text-white">{nome}</Text>
              </View>
            ))}
          </Secao>
        </View>
      </ScrollView>
    </View>
  );
}
