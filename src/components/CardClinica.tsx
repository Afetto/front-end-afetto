import { Estrelas } from "@/components/Estrelas";
import { ClinicaResumo } from "@/schemas/clinica.schema";
import { formatarDistancia, formatarNota, localDaClinica } from "@/utils/clinica";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  clinica: ClinicaResumo;
  onPress: () => void;
  onAlternarFavorita: () => void;
};

/** Card de clínica na lista da aba Clínica: foto, local, distância, nota e favorita. */
export function CardClinica({ clinica, onPress, onAlternarFavorita }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-2xl mb-3 shadow-sm overflow-hidden"
    >
      {clinica.imagemUrl ? (
        <Image source={{ uri: clinica.imagemUrl }} className="w-full h-32" resizeMode="cover" />
      ) : (
        <View className="w-full h-20 bg-green-medium items-center justify-center">
          <Ionicons name="business-outline" size={28} color="#1E3A2F" />
        </View>
      )}

      <View className="p-4 gap-1">
        <View className="flex-row items-start gap-2">
          <Text className="flex-1 text-base font-bold text-gray-900 dark:text-white">{clinica.nome}</Text>
          <TouchableOpacity
            onPress={onAlternarFavorita}
            hitSlop={10}
            accessibilityLabel={clinica.favorita ? "Tirar das favoritas" : "Favoritar"}
          >
            <Ionicons name={clinica.favorita ? "heart" : "heart-outline"} size={22} color="#E8A838" />
          </TouchableOpacity>
        </View>

        {!!localDaClinica(clinica.endereco) && (
          <Text className="text-xs text-muted dark:text-gray-400">{localDaClinica(clinica.endereco)}</Text>
        )}

        <View className="flex-row flex-wrap items-center gap-2 mt-1">
          {clinica.notaMedia !== undefined ? (
            <View className="flex-row items-center gap-1">
              <Estrelas nota={clinica.notaMedia} tamanho={12} />
              <Text className="text-xs text-gray-700 dark:text-gray-300">
                {formatarNota(clinica.notaMedia)} ({clinica.totalAvaliacoes})
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-muted dark:text-gray-400">Sem avaliações</Text>
          )}

          {clinica.distanciaKm !== undefined && (
            <Text className="text-xs text-muted dark:text-gray-400">· {formatarDistancia(clinica.distanciaKm)}</Text>
          )}

          {clinica.perto && (
            <View className="bg-green-medium rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-primary-dark">PERTO DE VOCÊ</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
