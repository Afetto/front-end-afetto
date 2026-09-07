import { Ionicons } from "@expo/vector-icons";
import { useSessao } from "@/context/SessaoContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TelaInicio() {
  const { sessao } = useSessao();
  const [temPets, setTemPets] = useState(false);

  const progresso = sessao?.progresso ?? {
    perfilCompleto: false,
    petCadastrado: false,
    clinicaVinculada: false,
  };

  const checklist = [
    {
      id: "cadastro",
      title: "Finalize seu cadastro!",
      subtitle: "Coloque suas infos adicionais!",
      completed: progresso.perfilCompleto,
      optional: false,
      route: "/completar-perfil",
    },
    {
      id: "pet",
      title: "Cadastrar seu Pet",
      subtitle: "Nome, raça, idade e histórico",
      completed: progresso.petCadastrado,
      optional: false,
      route: "/(tabs)/pets",
    },
    {
      id: "clinica",
      title: "Vincular sua clínica",
      subtitle: "Nunca perca uma vacina",
      completed: progresso.clinicaVinculada,
      optional: true,
      route: "/(tabs)/clinica",
    },
  ];

  const total = checklist.length;
  const concluidos = checklist.filter((i) => i.completed).length;
  const etapaAtual = Math.min(concluidos + 1, total);
  const percentual = etapaAtual / total;
  const proximoPendente = checklist.find((i) => !i.completed);
  const rotuloEtapa = `Etapa ${etapaAtual} de ${total} — ${proximoPendente?.title}`;

  const obrigatoriosConcluidos = checklist
    .filter((i) => !i.optional)
    .every((i) => i.completed);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-8">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-sm text-white/80">
              Bem-vindo ao Afe
              <Text className="text-amber">tto</Text>
            </Text>
            <Text className="text-3xl font-bold text-white mt-1">
              Olá, {sessao?.name ?? "Usuário"}!
            </Text>
          </View>

          {/* Avatar */}
          <TouchableOpacity
            onPress={() => router.push("/perfil")}
            activeOpacity={0.7}
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="person" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Subtítulo */}
        <Text className="text-base text-amber underline mt-2">
          {obrigatoriosConcluidos
            ? "Tudo certo! Seu pet está protegido."
            : "Vamos começar o perfil do seu pet!"}
        </Text>

        {/* Barra de progresso */}
        {!obrigatoriosConcluidos && (
          <View className="mt-5">
            <Text className="text-xs text-white/70 mb-2">{rotuloEtapa}</Text>
            <View className="h-2 bg-white/20 rounded-full overflow-hidden">
              <View
                className="h-2 bg-amber rounded-full"
                style={{ width: `${percentual * 100}%` }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Body */}
      <View className="px-6 pt-6 pb-10 gap-6">
        {/* Botão Seus Pets */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="bg-primary flex-row items-center px-5 py-4 rounded-2xl"
          onPress={() => router.push("/(tabs)/pets")}
        >
          <Ionicons name="paw" size={22} color="#E8A838" />
          <Text className="flex-1 text-white text-base font-semibold ml-3">
            Seus <Text className="text-amber">Pets</Text>
          </Text>
          <Switch
            value={temPets}
            onValueChange={setTemPets}
            trackColor={{ false: "rgba(255,255,255,0.25)", true: "#E8A838" }}
            thumbColor="#fff"
          />
        </TouchableOpacity>

        {/* Checklist — some apenas enquanto os passos obrigatórios não estiverem completos */}
        {!obrigatoriosConcluidos && (
        <View className="gap-3">
          <Text className="text-base font-semibold text-gray-800">
            Sua configuração
          </Text>

          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={item.completed ? 1 : 0.7}
              onPress={() => {
                if (!item.completed && item.route) {
                  router.push(item.route as any);
                }
              }}
              className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Ícone de status */}
              {item.completed ? (
                <View className="w-8 h-8 rounded-full bg-green-medium items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              ) : (
                <View className="w-8 h-8 rounded-full bg-amber/10 items-center justify-center">
                  <Ionicons name="time-outline" size={18} color="#E8A838" />
                </View>
              )}

              {/* Texto */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </Text>
                  {item.optional && (
                    <View className="bg-golden-pale px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-golden">opcional</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-muted mt-0.5">
                  {item.subtitle}
                </Text>
              </View>

              {/* Seta */}
              {!item.completed && (
                <Ionicons name="chevron-forward" size={16} color="#9E9589" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        )}
      </View>
    </ScrollView>
  );
}
