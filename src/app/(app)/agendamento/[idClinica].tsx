import { mensagemDaApi } from "@/api/erros";
import { EstadoErro } from "@/components/EstadoErro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import CampoTexto from "@/components/ui/CampoTexto";
import { useSessao } from "@/context/SessaoContext";
import { useAgendarConsulta, useHorariosClinica } from "@/hooks/useClinicas";
import { usePets } from "@/hooks/usePets";
import { FormAgendamento, FormAgendamentoSchema } from "@/schemas/clinica.schema";
import { converterDataParaBR } from "@/utils/data";
import { ICONE_ESPECIE, petEhDoUsuario } from "@/utils/pet";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// "segunda-feira" → "seg"
function diaCurto(diaSemana: string): string {
  return diaSemana.slice(0, 3);
}

function Chip({
  texto,
  subtexto,
  selecionado,
  desabilitado,
  onPress,
}: {
  texto: string;
  subtexto?: string;
  selecionado: boolean;
  desabilitado?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={desabilitado}
      activeOpacity={0.8}
      className={`items-center justify-center rounded-2xl border px-3 py-2 ${
        selecionado
          ? "bg-primary border-primary"
          : desabilitado
            ? "bg-white dark:bg-gray-800 border-border dark:border-gray-700 opacity-40"
            : "bg-white dark:bg-gray-800 border-border dark:border-gray-700"
      }`}
    >
      <Text className={`text-sm font-semibold ${selecionado ? "text-white" : "text-gray-900 dark:text-white"}`}>
        {texto}
      </Text>
      {subtexto && (
        <Text className={`text-[10px] ${selecionado ? "text-white" : "text-muted dark:text-gray-400"}`}>{subtexto}</Text>
      )}
    </TouchableOpacity>
  );
}

function Titulo({ texto, erro }: { texto: string; erro?: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white">{texto}</Text>
      {erro && <Text className="text-red-500 text-xs">{erro}</Text>}
    </View>
  );
}

// Agendar uma consulta numa clínica parceira: pet → dia → horário livre → motivo.
// A consulta entra no histórico, no calendário e nos próximos cuidados do pet.
export default function TelaAgendamento() {
  const { idClinica } = useLocalSearchParams<{ idClinica: string }>();
  const { sessao } = useSessao();

  const { data: pets, isLoading: carregandoPets } = usePets();
  const {
    data: agenda,
    isLoading: carregandoAgenda,
    isError: erroAgenda,
    refetch: buscarAgenda,
  } = useHorariosClinica(idClinica);
  const { mutate: agendar, isPending: agendando } = useAgendarConsulta(idClinica);

  // Só os pets da conta (ver petEhDoUsuario)
  const meusPets = (pets ?? []).filter((pet) => !sessao || petEhDoUsuario(pet, sessao.id));

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormAgendamento>({
    resolver: zodResolver(FormAgendamentoSchema),
    defaultValues: { idPet: "", data: "", hora: "", descricao: "", observacoes: "" },
  });

  const idPet = useWatch({ control, name: "idPet" });
  const dataEscolhida = useWatch({ control, name: "data" });
  const horaEscolhida = useWatch({ control, name: "hora" });

  // Com um pet só, ele já vem escolhido
  useEffect(() => {
    if (!idPet && meusPets.length === 1) setValue("idPet", meusPets[0].id);
  }, [idPet, meusPets, setValue]);

  // Abre no primeiro dia com horário livre
  useEffect(() => {
    if (dataEscolhida || !agenda) return;
    const primeiroLivre = agenda.dias.find((dia) => dia.horarios.length > 0);
    if (primeiroLivre) setValue("data", primeiroLivre.data);
  }, [agenda, dataEscolhida, setValue]);

  const diaSelecionado = agenda?.dias.find((dia) => dia.data === dataEscolhida);

  function escolherDia(data: string) {
    setValue("data", data, { shouldValidate: true });
    setValue("hora", "");
  }

  function confirmar(dados: FormAgendamento) {
    agendar(dados, {
      onSuccess: () => {
        const pet = meusPets.find((item) => item.id === dados.idPet);
        Alert.alert(
          "Consulta agendada!",
          `${pet?.nome ?? "Seu pet"} · ${converterDataParaBR(dados.data)} às ${dados.hora}${
            agenda ? ` na ${agenda.nomeClinica}` : ""
          }. Ela já está no histórico do pet.`
        );
        // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
        router.replace(`/pet/${dados.idPet}/historico` as any);
      },
      onError: (erro) => {
        // Ex.: 409 "Esse horário já foi agendado. Escolha outro" — a lista de horários é atualizada
        setValue("hora", "");
        setError("root", { message: mensagemDaApi(erro) });
      },
    });
  }

  if (carregandoPets || carregandoAgenda) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (erroAgenda || !agenda) {
    return (
      <EstadoErro mensagem="Erro ao carregar os horários da clínica. Tente novamente." onTentarNovamente={() => buscarAgenda()} />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface dark:bg-gray-900"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14 pb-32 gap-6">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">Agendar consulta</Text>
              <Text className="text-xs text-muted dark:text-gray-400">
                {agenda.nomeClinica} · {agenda.duracaoMinutos} min
              </Text>
            </View>
          </View>

          {meusPets.length === 0 ? (
            <EstadoVazio
              icone="paw-outline"
              titulo="Cadastre um pet primeiro"
              subtitulo="A consulta é marcada para um dos seus pets."
              textoAcao="Cadastrar pet"
              onAcao={() => router.push("/pet/cadastrar")}
            />
          ) : (
            <>
              {/* Pet */}
              <View className="gap-2">
                <Titulo texto="Para qual pet?" erro={errors.idPet?.message} />
                <View className="flex-row flex-wrap gap-2">
                  {meusPets.map((pet) => (
                    <Chip
                      key={pet.id}
                      texto={`${ICONE_ESPECIE[pet.especie] ?? "🐾"} ${pet.nome}`}
                      selecionado={pet.id === idPet}
                      onPress={() => setValue("idPet", pet.id, { shouldValidate: true })}
                    />
                  ))}
                </View>
              </View>

              {/* Dia */}
              <View className="gap-2">
                <Titulo texto="Dia" erro={errors.data?.message} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {agenda.dias.map((dia) => (
                      <Chip
                        key={dia.data}
                        texto={`${diaCurto(dia.diaSemana)} ${converterDataParaBR(dia.data).slice(0, 5)}`}
                        subtexto={!dia.aberta ? "fechada" : dia.horarios.length === 0 ? "lotado" : `${dia.horarios.length} livres`}
                        selecionado={dia.data === dataEscolhida}
                        desabilitado={dia.horarios.length === 0}
                        onPress={() => escolherDia(dia.data)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Horário */}
              <View className="gap-2">
                <Titulo texto="Horário" erro={errors.hora?.message} />
                {!diaSelecionado || diaSelecionado.horarios.length === 0 ? (
                  <Text className="text-sm text-muted dark:text-gray-400">
                    Escolha um dia com horários livres.
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {diaSelecionado.horarios.map((hora) => (
                      <Chip
                        key={hora}
                        texto={hora}
                        selecionado={hora === horaEscolhida}
                        onPress={() => setValue("hora", hora, { shouldValidate: true })}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Motivo e observação */}
              <View className="gap-5">
                <CampoTexto
                  name="descricao"
                  control={control}
                  label="Motivo (opcional)"
                  placeholder="Check-up, vacina, retorno..."
                  autoCapitalize="sentences"
                />
                <CampoTexto
                  name="observacoes"
                  control={control}
                  label="Observação (opcional)"
                  placeholder="Ele tem medo de outros cães..."
                  autoCapitalize="sentences"
                />
              </View>

              {errors.root && <Text className="text-red-500 text-sm text-center">{errors.root.message}</Text>}
            </>
          )}
        </View>
      </ScrollView>

      {meusPets.length > 0 && (
        <BotaoEnviar
          enviando={agendando}
          onPress={handleSubmit(confirmar)}
          texto="Confirmar agendamento"
          textoLoading="Agendando..."
        />
      )}
    </KeyboardAvoidingView>
  );
}
