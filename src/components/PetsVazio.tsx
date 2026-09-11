import { EstadoVazio } from "@/components/EstadoVazio";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type PetsVazioProps = {
  erro?: boolean;
  aoTentarNovamente?: () => void;
};

export function PetsVazio({ erro, aoTentarNovamente }: PetsVazioProps = {}) {
  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-14 pb-5 bg-primary">
        <Text className="text-xl font-bold text-white">Meus Pets</Text>
        <Text className="text-sm mt-1 text-green-medium">
          Nenhum pet cadastrado
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
            <Text className="text-muted text-xs text-center underline">
              Não foi possível carregar seus pets. Tentar novamente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
