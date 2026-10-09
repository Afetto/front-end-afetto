import { BarraProgresso } from "@/components/BarraProgresso";
import { BotaoSeusPets } from "@/components/BotaoSeusPets";
import { ItemChecklist } from "@/components/ItemChecklist";
import { useSessao } from "@/context/SessaoContext";
import { usePerfilCompleto } from "@/hooks/usePerfilCompleto";
import { usePets } from "@/hooks/usePets";
import { calcularProgressoOnboarding } from "@/utils/onboarding";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TelaInicio() {
  const { sessao } = useSessao();
  const {
    data: pets,
    // isFetching (e não isLoading) para o indicador também aparecer durante o
    // "Tentar novamente" depois de uma falha.
    isFetching: carregandoPets,
    refetch: recarregarPets,
  } = usePets();

  const {
    data: perfil,
    isFetching: carregandoPerfil,
    refetch: recarregarPerfil,
  } = usePerfilCompleto();

  // O progresso depende de duas respostas da API: a lista de pets e o
  // "Finalize seu cadastro" (GET /usuario/me/perfil). Enquanto elas não chegam
  // (ou se uma falhar), a tela não mostra checklist nem barra — mostrar uma
  // etapa pendente sem saber a resposta seria um dado falso.
  const carregouPets = pets !== undefined;
  const carregouProgresso = carregouPets && perfil !== undefined;
  const carregandoProgresso = carregandoPets || carregandoPerfil;

  function recarregarProgresso() {
    if (!carregouPets) recarregarPets();
    if (perfil === undefined) recarregarPerfil();
  }

  const { checklist, percentual, rotuloEtapa, obrigatoriosConcluidos } =
    calcularProgressoOnboarding({
      perfilCompleto: perfil?.perfilCompleto ?? false,
      petCadastrado: (pets?.length ?? 0) > 0,
    });

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
        {carregouProgresso && (
          <Text className="text-base text-amber underline mt-2">
            {obrigatoriosConcluidos
              ? "Tudo certo! Seu pet está protegido."
              : "Vamos começar o perfil do seu pet!"}
          </Text>
        )}

        {/* Barra de progresso */}
        {carregouProgresso && !obrigatoriosConcluidos && (
          <BarraProgresso rotulo={rotuloEtapa} percentual={percentual} />
        )}
      </View>

      {/* Body */}
      <View className="px-6 pt-6 pb-10 gap-6">
        {/* Botão Seus Pets — a quantidade vem da API */}
        <BotaoSeusPets
          quantidade={pets?.length}
          onPress={() => router.push("/(tabs)/pets")}
        />

        {/* Carregando pets e perfil */}
        {!carregouProgresso && carregandoProgresso && (
          <View className="items-center py-6">
            <ActivityIndicator color="#E8A838" />
          </View>
        )}

        {/* Falha ao carregar pets ou perfil */}
        {!carregouProgresso && !carregandoProgresso && (
          <View className="items-center gap-2 py-4">
            <Text className="text-sm text-muted dark:text-gray-400 text-center">
              {carregouPets
                ? "Não foi possível carregar seu cadastro."
                : "Não foi possível carregar seus pets."}
            </Text>
            <TouchableOpacity onPress={recarregarProgresso}>
              <Text className="text-amber font-semibold">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Checklist — some quando os passos obrigatórios estão completos */}
        {carregouProgresso && !obrigatoriosConcluidos && (
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
