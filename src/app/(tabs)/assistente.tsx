import { RespostaAssistente } from "@/components/assistente/RespostaAssistente";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { useSessao } from "@/context/SessaoContext";
import { useConsultasPet } from "@/hooks/useConsultas";
import { usePets } from "@/hooks/usePets";
import { useRemediosPet } from "@/hooks/useRemedios";
import { useVacinasPet } from "@/hooks/useVacinas";
import {
  DestinoResposta,
  IdPergunta,
  PERGUNTAS,
  Resposta,
  responder,
} from "@/utils/assistente";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ICONE_PERGUNTA: Record<
  IdPergunta,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  proxima_vacina: "medical-outline",
  remedios_hoje: "medkit-outline",
  proxima_consulta: "calendar-outline",
  vacinacao: "shield-checkmark-outline",
};

// Os quatro botões em duas linhas de dois
const LINHAS_DE_PERGUNTAS = [PERGUNTAS.slice(0, 2), PERGUNTAS.slice(2, 4)];

type Mensagem = {
  id: number;
  pergunta: string;
  resposta: Resposta;
  idPet: string;
};

/**
 * Assistente: perguntas prontas respondidas com os dados reais do pet (vacinas,
 * remédios e consultas da API) — sem IA e sem texto livre. As respostas saem de
 * `utils/assistente.ts`; cada uma tem um botão para a tela relacionada.
 */
export default function TelaAssistente() {
  const { sessao } = useSessao();
  const {
    data: pets,
    isLoading: carregandoPets,
    isError: erroPets,
    refetch: recarregarPets,
  } = usePets();

  const [idPetEscolhido, setIdPetEscolhido] = useState<string>();
  const [conversa, setConversa] = useState<Mensagem[]>([]);
  const proximoId = useRef(1);
  const rolagem = useRef<ScrollView>(null);

  // O pet que o tutor tocou; antes disso (ou se ele foi excluído), o primeiro
  const pet = pets?.find((item) => item.id === idPetEscolhido) ?? pets?.[0];
  const idPet = pet?.id ?? "";

  const vacinas = useVacinasPet(idPet);
  const remedios = useRemediosPet(idPet);
  const consultas = useConsultasPet(idPet);
  const cuidados = [vacinas, remedios, consultas];
  const erroCuidados = cuidados.some((consulta) => consulta.isError);
  const cuidadosProntos =
    vacinas.data !== undefined &&
    remedios.data !== undefined &&
    consultas.data !== undefined;

  useEffect(() => {
    if (conversa.length > 0) rolagem.current?.scrollToEnd({ animated: true });
  }, [conversa.length]);

  function perguntar(id: IdPergunta, texto: string) {
    if (!pet || !vacinas.data || !remedios.data || !consultas.data) return;

    const resposta = responder(id, {
      nomePet: pet.nome,
      vacinas: vacinas.data,
      remedios: remedios.data,
      consultas: consultas.data,
    });
    setConversa((atual) => [
      ...atual,
      { id: proximoId.current++, pergunta: texto, resposta, idPet: pet.id },
    ]);
  }

  function abrir(destino: DestinoResposta, idPetDaResposta: string) {
    switch (destino) {
      case "historico":
        router.push({
          pathname: "/pet/[id]/historico",
          params: { id: idPetDaResposta },
        });
        break;
      case "nova_vacina":
        router.push({
          pathname: "/pet/[id]/cuidados",
          params: { id: idPetDaResposta },
        });
        break;
      case "novo_remedio":
        router.push({
          pathname: "/pet/[id]/remedio",
          params: { id: idPetDaResposta },
        });
        break;
      case "agendar":
        router.push("/(tabs)/clinica");
        break;
    }
  }

  function recarregarCuidados() {
    cuidados
      .filter((consulta) => consulta.isError)
      .forEach((consulta) => consulta.refetch());
  }

  return (
    <View className="flex-1 bg-surface dark:bg-gray-900">
      <View className="px-5 pt-14 pb-5 bg-primary">
        <Text className="text-xl font-bold text-white">Assistente</Text>
        <Text className="text-sm text-white/80 mt-1">
          Respostas com os dados do seu pet
        </Text>
      </View>

      {carregandoPets && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E8A838" size="large" />
        </View>
      )}

      {!carregandoPets && erroPets && (
        <EstadoErro
          mensagem="Não foi possível carregar seus pets."
          onTentarNovamente={recarregarPets}
        />
      )}

      {!carregandoPets && !erroPets && pets?.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <EstadoVazio
            icone="paw-outline"
            titulo="Cadastre um pet para começar"
            subtitulo="O assistente responde com as vacinas, os remédios e as consultas do seu pet."
            textoAcao="Cadastrar pet"
            onAcao={() => router.push("/pet/cadastrar")}
          />
        </View>
      )}

      {pet && pets && (
        <>
          {/* Mais de um pet: escolher sobre qual perguntar */}
          {pets.length > 1 && (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="grow-0"
              >
                <View className="flex-row gap-2 px-5 pt-4">
                  {pets.map((item) => {
                    const escolhido = item.id === pet.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setIdPetEscolhido(item.id)}
                        activeOpacity={0.7}
                        accessibilityState={{ selected: escolhido }}
                        className={`px-4 py-2 rounded-full border ${
                          escolhido
                            ? "bg-primary border-primary"
                            : "bg-white dark:bg-gray-800 border-border dark:border-gray-700"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            escolhido
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Conversa */}
          <ScrollView ref={rolagem} className="flex-1">
            <View className="px-5 py-4 gap-3">
              <View className="self-start mr-10 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <Text className="text-sm text-gray-900 dark:text-white">
                  Oi, {sessao?.nome ?? "tutor"}! Escolha uma pergunta abaixo e
                  eu respondo com o que está cadastrado no app sobre {pet.nome}:
                  vacinas, remédios e consultas.
                </Text>
              </View>

              {conversa.map((mensagem) => (
                <View key={mensagem.id} className="gap-3">
                  <View className="self-end ml-10 bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
                    <Text className="text-sm text-white">
                      {mensagem.pergunta}
                    </Text>
                  </View>
                  <RespostaAssistente
                    resposta={mensagem.resposta}
                    onAcao={() =>
                      abrir(mensagem.resposta.acao.destino, mensagem.idPet)
                    }
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Perguntas prontas */}
          <View className="px-5 pt-3 pb-4 gap-2 border-t border-border dark:border-gray-700 bg-surface dark:bg-gray-900">
            {erroCuidados ? (
              <View className="items-center gap-1 py-2">
                <Text className="text-sm text-muted dark:text-gray-400 text-center">
                  Não foi possível carregar os cuidados de {pet.nome}.
                </Text>
                <TouchableOpacity onPress={recarregarCuidados}>
                  <Text className="text-amber font-semibold">
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </View>
            ) : !cuidadosProntos ? (
              <View className="flex-row items-center justify-center gap-2 py-2">
                <ActivityIndicator color="#E8A838" />
                <Text className="text-sm text-muted dark:text-gray-400">
                  Buscando os cuidados de {pet.nome}…
                </Text>
              </View>
            ) : (
              <>
                <View className="gap-2">
                  {LINHAS_DE_PERGUNTAS.map((linha, indice) => (
                    <View key={indice} className="flex-row gap-2">
                      {linha.map((pergunta) => (
                        <TouchableOpacity
                          key={pergunta.id}
                          onPress={() => perguntar(pergunta.id, pergunta.texto)}
                          activeOpacity={0.7}
                          accessibilityLabel={pergunta.texto}
                          className="flex-1 flex-row items-center gap-2 px-3 py-3 rounded-2xl bg-amber/10 border border-amber"
                        >
                          <Ionicons
                            name={ICONE_PERGUNTA[pergunta.id]}
                            size={18}
                            color="#E8A838"
                          />
                          <Text className="flex-1 text-sm font-semibold text-primary dark:text-white">
                            {pergunta.rotulo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
                {conversa.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setConversa([])}
                    className="self-center mt-1"
                  >
                    <Text className="text-xs text-muted dark:text-gray-400 underline">
                      Limpar conversa
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}
