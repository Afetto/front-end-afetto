import { Clinica } from "@/schemas/clinica.schema";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type CorEspecialidade = { bg: string; border: string; text: string };

const CORES_ESPECIALIDADE: Record<string, CorEspecialidade> = {
  "Clínica Geral": {
    bg: "bg-green-medium/10",
    border: "border-green-medium",
    text: "text-green-medium",
  },
  "24h": { bg: "bg-amber/10", border: "border-amber", text: "text-amber" },
  Exóticos: { bg: "bg-muted/10", border: "border-muted", text: "text-muted" },
  Cirurgia: { bg: "bg-primary/10", border: "border-primary", text: "text-primary" },
};

const COR_PADRAO: CorEspecialidade = {
  bg: "bg-muted/10",
  border: "border-muted",
  text: "text-muted",
};

type Props = {
  clinica: Clinica;
  vinculando: boolean;
  onVincular: (clinicaId: string) => void;
};

export function CardClinica({ clinica, vinculando, onVincular }: Props) {
  const inicial = clinica.nome.charAt(0).toUpperCase();
  const cor = CORES_ESPECIALIDADE[clinica.especialidade] ?? COR_PADRAO;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full items-center justify-center bg-amber">
          <Text className="text-white font-bold text-lg">{inicial}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-primary">{clinica.nome}</Text>
          <Text className="text-xs text-muted mt-0.5">
            {clinica.bairro}, {clinica.cidade}
          </Text>
          <View
            className={`self-start mt-1 px-2 py-0.5 rounded-full border ${cor.bg} ${cor.border}`}
          >
            <Text className={`text-xs font-medium ${cor.text}`}>
              {clinica.especialidade}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-3">
        {clinica.vinculada ? (
          <View className="flex-row items-center justify-center gap-1 py-2 rounded-xl bg-green-50 border border-green-300">
            <Ionicons name="checkmark-circle" size={16} color="#A8C5A0" />
            <Text className="text-sm font-medium text-primary">Vinculada</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onVincular(clinica.id)}
            disabled={vinculando}
            className="py-2 rounded-xl border items-center border-amber"
          >
            {vinculando ? (
              <ActivityIndicator size="small" color="#E8A838" />
            ) : (
              <Text className="text-sm font-medium text-amber-dark">Vincular</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
