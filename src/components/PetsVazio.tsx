import { CabecalhoOla } from "@/components/CabecalhoOla";
import { EstadoVazio } from "@/components/EstadoVazio";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type PetsVazioProps = {
  erro?: boolean;
  aoTentarNovamente?: () => void;
};

export function PetsVazio({ erro, aoTentarNovamente }: PetsVazioProps = {}) {
  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <CabecalhoOla />

      <View className="px-6 pt-6 pb-2">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Meus Pets</Text>
        <Text className="text-sm text-muted dark:text-gray-400 mt-0.5">
          {erro ? "Não foi possível carregar" : "Nenhum pet cadastrado"}
        </Text>
      </View>

      {/* Empty */}
      <View className="flex-1 items-center justify-center gap-4">
        <EstadoVazio
          icone="paw-outline"
          tamanhoIcone={56}
          titulo="Você ainda não tem pets"
          subtitulo="Adicione seu primeiro pet para começar a acompanhar a saúde dele."
          textoAcao="Adicionar novo pet"
          onAcao={() => router.push("/pet/cadastrar" as any)}
        />

        {erro && (
          <TouchableOpacity onPress={aoTentarNovamente} className="mt-1">
            <Text className="text-muted dark:text-gray-400 text-xs text-center underline">
              Não foi possível carregar seus pets. Tentar novamente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
