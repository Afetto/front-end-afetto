import { EstadoErro } from "@/components/EstadoErro";
import { usePet } from "@/hooks/usePets";
import { useVacinasPet } from "@/hooks/useVacinas";
import { Vacina } from "@/schemas/vacina.schema";
import { calcularIdade } from "@/utils/data";
import { ICONE_ESPECIE, LABEL_ESPECIE } from "@/utils/pet";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

function diasRestantes(dataIso: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataIso);
  data.setHours(0, 0, 0, 0);
  return Math.round((data.getTime() - hoje.getTime()) / 86_400_000);
}

function BotaoAcessoRapido({
  icone,
  texto,
  onPress,
}: {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  texto: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 items-center justify-center gap-2 bg-amber rounded-2xl py-4"
    >
      <Ionicons name={icone} size={22} color="#FFFFFF" />
      <Text className="text-white text-xs font-semibold">{texto}</Text>
    </TouchableOpacity>
  );
}

export default function TelaPrincipalPet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pet, isLoading: carregandoPet, isError: erroPet, refetch: refazerPet } = usePet(id);
  const { data: vacinas, isLoading: carregandoVacinas } = useVacinasPet(id);

  if (carregandoPet) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (erroPet || !pet) {
    return (
      <EstadoErro
        mensagem="Erro ao carregar os dados do pet. Tente novamente."
        onTentarNovamente={() => refazerPet()}
      />
    );
  }

  const icone = ICONE_ESPECIE[pet.especie] ?? "🐾";
  const idade = calcularIdade(pet.dataNasc ?? "");

  const proximosCuidados: (Vacina & { dias: number })[] = (vacinas ?? [])
    .map((vacina) => ({ ...vacina, dias: diasRestantes(vacina.dataAplicacao) }))
    .filter((vacina) => vacina.dias > 0)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 3);

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900" numberOfLines={1}>
          {pet.nome}
        </Text>
        <TouchableOpacity onPress={() => router.push(`/pet/${id}/editar`)} hitSlop={8}>
          <Ionicons name="pencil" size={20} color="#1E3A2F" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 gap-6">
        {/* Card do pet */}
        <View className="bg-white rounded-2xl p-5 items-center gap-2 shadow-sm">
          <View className="w-20 h-20 rounded-full items-center justify-center bg-primary">
            <Text className="text-[36px]">{icone}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 mt-1">{pet.nome}</Text>
          <Text className="text-sm text-muted">
            {(pet.raca || LABEL_ESPECIE[pet.especie]) ?? pet.especie} • {idade}
          </Text>
          <View className="bg-green-medium rounded-full px-3 py-1 mt-1">
            <Text className="text-xs font-semibold text-primary-dark">Saúde em dia!</Text>
          </View>
        </View>

        {/* Acesso rápido */}
        <View className="flex-row gap-3">
          <BotaoAcessoRapido
            icone="heart-outline"
            texto="Cuidados"
            onPress={() => router.push(`/pet/${id}/cuidados`)}
          />
          <BotaoAcessoRapido
            icone="document-text-outline"
            texto="Histórico"
            onPress={() => router.push(`/pet/${id}/historico`)}
          />
          <BotaoAcessoRapido
            icone="calendar-outline"
            texto="Calendário"
            onPress={() => router.push(`/pet/${id}/calendario`)}
          />
        </View>

        {/* Próximos cuidados */}
        <View className="gap-3">
          <Text className="text-base font-bold text-gray-900">Próximos cuidados</Text>

          {carregandoVacinas ? (
            <ActivityIndicator color="#E8A838" />
          ) : proximosCuidados.length === 0 ? (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-sm text-muted">Nenhum cuidado agendado</Text>
            </View>
          ) : (
            <View className="gap-2">
              {proximosCuidados.map((vacina) => (
                <View
                  key={vacina.id}
                  className="flex-row items-center gap-3 bg-white rounded-2xl p-4 shadow-sm"
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-golden-pale">
                    <Ionicons name="medkit-outline" size={18} color="#D4921E" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {vacina.nomeVacina}
                    </Text>
                    <Text className="text-xs text-muted">
                      Daqui {vacina.dias} {vacina.dias === 1 ? "dia" : "dias"}
                    </Text>
                  </View>
                  <View className="bg-golden-pale rounded-full px-2 py-1">
                    <Text className="text-[10px] font-semibold text-golden">Vacina</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sugestões */}
        <View className="gap-2 pb-8">
          <Text className="text-base font-bold text-gray-900">Sugestões</Text>
          <Text className="text-sm text-muted leading-relaxed">
            Sem sugestões no momento. Em breve a IA do Afetto irá analisar o histórico do seu pet.
          </Text>
        </View>
      </View>
    </View>
  );
}
