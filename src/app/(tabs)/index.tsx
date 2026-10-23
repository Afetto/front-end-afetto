import { AgendaInicio } from "@/components/AgendaInicio";
import { BarraProgresso } from "@/components/BarraProgresso";
import { BotaoSeusPets } from "@/components/BotaoSeusPets";
import { ItemChecklist } from "@/components/ItemChecklist";
import { useSessao } from "@/context/SessaoContext";
import { useClinicas } from "@/hooks/useClinicas";
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

  // "Vincular sua clínica": concluído quando o tutor tem ao menos uma
  // clínica favorita (GET /clinica?favoritas=true). Favoritar ou desfavoritar
  // invalida as listas de clínicas e a Home se atualiza sozinha.
  const {
    data: clinicasFavoritas,
    isFetching: carregandoClinicas,
    refetch: recarregarClinicas,
  } = useClinicas({ favoritas: true });

  // O progresso depende das respostas da API: a lista de pets, o "Finalize seu
  // cadastro" (GET /usuario/me/perfil) e as clínicas favoritas. Enquanto elas
  // não chegam (ou se uma falhar), a tela não mostra checklist nem barra —
  // mostrar uma etapa pendente sem saber a resposta seria um dado falso.
  const carregouPets = pets !== undefined;
  const carregouPerfil = perfil !== undefined;
  const carregouClinicas = clinicasFavoritas !== undefined;
  const carregandoProgresso = carregandoPets || carregandoPerfil || carregandoClinicas;

  function recarregarProgresso() {
    if (!carregouPets) recarregarPets();
    if (!carregouPerfil) recarregarPerfil();
    if (!carregouClinicas) recarregarClinicas();
  }

  const { checklist, percentual, rotuloEtapa, obrigatoriosConcluidos } =
    calcularProgressoOnboarding({
      perfilCompleto: perfil?.perfilCompleto ?? false,
      petCadastrado: (pets?.length ?? 0) > 0,
      clinicaVinculada: (clinicasFavoritas?.length ?? 0) > 0,
    });

  // A agenda só depende das etapas obrigatórias (pets e perfil): se a busca das
  // favoritas falhar, a Home pós-onboarding continua de pé, só sem o lembrete
  // da clínica. O checklist precisa das três respostas.
  const mostrarAgenda = carregouPets && carregouPerfil && obrigatoriosConcluidos;
  const mostrarChecklist =
    carregouPets && carregouPerfil && carregouClinicas && !obrigatoriosConcluidos;
  const carregouProgresso = mostrarAgenda || mostrarChecklist;

  const mensagemErro = !carregouPets
    ? "Não foi possível carregar seus pets."
    : !carregouPerfil
      ? "Não foi possível carregar seu cadastro."
      : "Não foi possível carregar suas clínicas favoritas.";

  // Etapa opcional: depois das obrigatórias o checklist some, então a clínica
  // pendente continua aparecendo sozinha acima da agenda até ser vinculada
  // (só depois de a resposta das favoritas chegar).
  const clinicaPendente = carregouClinicas
    ? checklist.find((item) => item.id === "clinica" && !item.concluido)
    : undefined;

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

        {/* Subtítulo — sem sublinhado: não é tocável, e sublinhado parece link */}
        {carregouProgresso && (
          <Text className="text-base text-amber font-medium mt-2">
            {obrigatoriosConcluidos
              ? "Tudo certo! Seu pet está protegido."
              : "Vamos começar o perfil do seu pet!"}
          </Text>
        )}

        {/* Barra de progresso */}
        {mostrarChecklist && (
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

        {/* Carregando pets, perfil e clínicas favoritas */}
        {!carregouProgresso && carregandoProgresso && (
          <View className="items-center py-6">
            <ActivityIndicator color="#E8A838" />
          </View>
        )}

        {/* Falha ao carregar pets, perfil ou clínicas favoritas */}
        {!carregouProgresso && !carregandoProgresso && (
          <View className="items-center gap-2 py-4">
            <Text className="text-sm text-muted dark:text-gray-400 text-center">
              {mensagemErro}
            </Text>
            <TouchableOpacity onPress={recarregarProgresso} hitSlop={8}>
              <Text className="text-amber-dark dark:text-amber font-semibold">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Onboarding concluído, mas sem clínica favorita: o item opcional fica à vista */}
        {mostrarAgenda && clinicaPendente && (
          <ItemChecklist
            titulo={clinicaPendente.titulo}
            subtitulo={clinicaPendente.subtitulo}
            concluido={false}
            opcional
            onPress={() => router.push("/(tabs)/clinica")}
          />
        )}

        {/* Onboarding concluído: atalhos, agenda dos pets e remédios em tratamento */}
        {mostrarAgenda && sessao && (
          <AgendaInicio
            idUsuario={sessao.id}
            idPetUnico={pets && pets.length === 1 ? pets[0].id : undefined}
          />
        )}

        {/* Checklist — some quando os passos obrigatórios estão completos */}
        {mostrarChecklist && (
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
                  if (!item.concluido) router.push(item.rota);
                }}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
