import { mensagemDaApi } from "@/api/erros";
import { AvaliacoesClinica } from "@/components/clinica/AvaliacoesClinica";
import { EstadoErro } from "@/components/EstadoErro";
import { Estrelas } from "@/components/Estrelas";
import { useAlternarFavorita, useClinica } from "@/hooks/useClinicas";
import {
  capitalizar,
  enderecoCompleto,
  formatarDistancia,
  formatarNota,
  LABEL_TURNO,
  localDaClinica,
} from "@/utils/clinica";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

function LinhaContato({ icone, texto, url }: { icone: NomeIcone; texto: string; url: string }) {
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(url).catch(() => {})}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-2"
    >
      <Ionicons name={icone} size={18} color="#E8A838" />
      <Text className="flex-1 text-sm text-gray-900 dark:text-white">{texto}</Text>
      <Ionicons name="open-outline" size={14} color="#9E9589" />
    </TouchableOpacity>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-base font-bold text-gray-900 dark:text-white">{titulo}</Text>
      <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm">{children}</View>
    </View>
  );
}

// Detalhe da clínica parceira: agendar consulta, contatos, endereço, horário, equipe e avaliações
export default function TelaClinicaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: clinica, isLoading, isError, refetch } = useClinica(id);
  const { mutate: alternarFavorita, isPending: salvandoFavorita } = useAlternarFavorita();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (isError || !clinica) {
    return (
      <EstadoErro mensagem="Erro ao carregar a clínica. Tente novamente." onTentarNovamente={() => refetch()} />
    );
  }

  function aoAlternarFavorita() {
    if (!clinica) return;
    alternarFavorita(
      { id: clinica.id, favorita: clinica.favorita },
      { onError: (erro) => Alert.alert("Não deu para salvar", mensagemDaApi(erro)) }
    );
  }

  const site = clinica.site && (clinica.site.startsWith("http") ? clinica.site : `https://${clinica.site}`);

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-gray-900" showsVerticalScrollIndicator={false}>
      {/* Foto + voltar + favorita */}
      <View>
        {clinica.imagemUrl ? (
          <Image source={{ uri: clinica.imagemUrl }} className="w-full h-56" resizeMode="cover" />
        ) : (
          <View className="w-full h-40 bg-primary items-center justify-center">
            <Ionicons name="business-outline" size={40} color="#FFFFFF" />
          </View>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Voltar"
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={aoAlternarFavorita}
          disabled={salvandoFavorita}
          hitSlop={8}
          accessibilityLabel={clinica.favorita ? "Tirar das favoritas" : "Favoritar"}
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center"
        >
          <Ionicons name={clinica.favorita ? "heart" : "heart-outline"} size={22} color="#E8A838" />
        </TouchableOpacity>
      </View>

      <View className="px-6 pt-5 pb-12 gap-6">
        {/* Nome, local, nota e distância */}
        <View className="gap-1">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">{clinica.nome}</Text>
          {!!localDaClinica(clinica.endereco) && (
            <Text className="text-sm text-muted dark:text-gray-400">{localDaClinica(clinica.endereco)}</Text>
          )}
          <View className="flex-row flex-wrap items-center gap-2 mt-1">
            {clinica.notaMedia !== undefined ? (
              <View className="flex-row items-center gap-1">
                <Estrelas nota={clinica.notaMedia} />
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  {formatarNota(clinica.notaMedia)} · {clinica.totalAvaliacoes}{" "}
                  {clinica.totalAvaliacoes === 1 ? "avaliação" : "avaliações"}
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-muted dark:text-gray-400">Sem avaliações</Text>
            )}
            {clinica.distanciaKm !== undefined && (
              <Text className="text-sm text-muted dark:text-gray-400">· {formatarDistancia(clinica.distanciaKm)}</Text>
            )}
            {clinica.perto && (
              <View className="bg-green-medium rounded-full px-2 py-0.5">
                <Text className="text-[10px] font-bold text-primary-dark">PERTO DE VOCÊ</Text>
              </View>
            )}
          </View>
        </View>

        {/* Agendar: escolhe o pet, o dia e um horário livre da clínica */}
        <TouchableOpacity
          // `as any`: rota gerada por template literal, fora do que o typedRoutes infere.
          onPress={() => router.push(`/agendamento/${clinica.id}` as any)}
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-2 rounded-2xl py-4 bg-primary"
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text className="text-base font-semibold text-white">Agendar consulta</Text>
        </TouchableOpacity>

        {clinica.descricao && (
          <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{clinica.descricao}</Text>
        )}

        {(clinica.telefone || clinica.email || site) && (
          <Secao titulo="Contato">
            {clinica.telefone && (
              <LinhaContato
                icone="call-outline"
                texto={clinica.telefone}
                url={`tel:${clinica.telefone.replace(/\D/g, "")}`}
              />
            )}
            {clinica.email && <LinhaContato icone="mail-outline" texto={clinica.email} url={`mailto:${clinica.email}`} />}
            {site && <LinhaContato icone="globe-outline" texto={clinica.site ?? site} url={site} />}
          </Secao>
        )}

        {!!enderecoCompleto(clinica.endereco) && (
          <Secao titulo="Endereço">
            <View className="flex-row items-start gap-3 py-2">
              <Ionicons name="location-outline" size={18} color="#E8A838" />
              <Text className="flex-1 text-sm text-gray-900 dark:text-white">{enderecoCompleto(clinica.endereco)}</Text>
            </View>
          </Secao>
        )}

        {clinica.expediente.length > 0 && (
          <Secao titulo="Horário de atendimento">
            {clinica.expediente.map((dia) => (
              <View key={dia.diaSemana} className="flex-row justify-between py-1.5">
                <Text className="text-sm text-gray-700 dark:text-gray-300">{capitalizar(dia.diaSemana)}</Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {dia.abertura} – {dia.fechamento}
                </Text>
              </View>
            ))}
          </Secao>
        )}

        {clinica.veterinarios.length > 0 && (
          <Secao titulo="Equipe">
            {clinica.veterinarios.map((vet) => (
              <View key={vet.nome} className="flex-row items-center gap-3 py-2">
                <View className="w-9 h-9 rounded-full bg-green-medium items-center justify-center">
                  <Ionicons name="medical-outline" size={16} color="#1E3A2F" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-white">{vet.nome}</Text>
                  <Text className="text-xs text-muted dark:text-gray-400">
                    {[vet.especialidade, vet.turno && LABEL_TURNO[vet.turno]].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              </View>
            ))}
          </Secao>
        )}

        <AvaliacoesClinica idClinica={clinica.id} />
      </View>
    </ScrollView>
  );
}
