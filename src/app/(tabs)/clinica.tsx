import { EstadoVazio } from "@/components/EstadoVazio";
import { Text, View } from "react-native";

// A API real (confirmada em GET /v3/api-docs) ainda não expõe nenhum
// endpoint de clínica — não é uma falha temporária de rede, então a tela
// não tenta nenhuma chamada e mostra direto o estado de "em breve" (ver
// clinica.service.ts).
export default function TelaClinica() {
  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="px-5 pt-14 pb-5 bg-primary">
        <Text className="text-xl font-bold text-white">Clínicas Parceiras</Text>
        <Text className="text-sm mt-1 text-green-medium">
          Vincule seu pet a uma clínica
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <EstadoVazio
          icone="business-outline"
          tamanhoIcone={48}
          titulo="Em breve"
          subtitulo="A vinculação com clínicas parceiras estará disponível em uma próxima versão do Afetto."
        />
      </View>
    </View>
  );
}
