import { BarraProgresso } from "@/components/BarraProgresso";
import { BotaoSeusPets } from "@/components/BotaoSeusPets";
import { ItemChecklist } from "@/components/ItemChecklist";
import { useSessao } from "@/context/SessaoContext";
import { calcularProgressoOnboarding } from "@/utils/onboarding";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const PROGRESSO_PADRAO = {
  perfilCompleto: false,
  petCadastrado: false,
  clinicaVinculada: false,
};

export default function TelaInicio() {
  const { sessao } = useSessao();
  const [temPets, setTemPets] = useState(false);

  const { checklist, percentual, rotuloEtapa, obrigatoriosConcluidos } =
    calcularProgressoOnboarding(sessao?.progresso ?? PROGRESSO_PADRAO);

  return (
    <ScrollView
      className="flex-1 bg-surface dark:bg-gray-900"
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
              Olá, {sessao?.nome ?? "Usuário"}!
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
          <BarraProgresso rotulo={rotuloEtapa} percentual={percentual} />
        )}
      </View>

      {/* Body */}
      <View className="px-6 pt-6 pb-10 gap-6">
        {/* Botão Seus Pets */}
        <BotaoSeusPets
          ativo={temPets}
          onAtivoChange={setTemPets}
          onPress={() => router.push("/(tabs)/pets")}
        />

        {/* Checklist — some apenas enquanto os passos obrigatórios não estiverem completos */}
        {!obrigatoriosConcluidos && (
          <View className="gap-3">
            <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Sua configuração
            </Text>

            {checklist.map((item) => (
              <ItemChecklist
                key={item.id}
                titulo={item.titulo}
                subtitulo={item.subtitulo}
                concluido={item.concluido}
                opcional={item.opcional}
                onPress={() => {
                  if (!item.concluido) router.push(item.rota as any);
                }}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
