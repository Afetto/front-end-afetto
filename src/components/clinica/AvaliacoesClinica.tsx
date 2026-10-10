import { mensagemDaApi } from "@/api/erros";
import { Estrelas } from "@/components/Estrelas";
import CampoTexto from "@/components/ui/CampoTexto";
import { useApagarAvaliacao, useAvaliacoesClinica, useAvaliarClinica } from "@/hooks/useClinicas";
import { Avaliacao, FormAvaliacao, FormAvaliacaoSchema } from "@/schemas/clinica.schema";
import { converterDataParaBR } from "@/utils/data";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

// "09/10/2026 às 21:10"
function quando(avaliacao: Avaliacao): string {
  if (!avaliacao.data) return "";
  return converterDataParaBR(avaliacao.data) + (avaliacao.hora ? ` às ${avaliacao.hora}` : "");
}

function CardComentario({ avaliacao }: { avaliacao: Avaliacao }) {
  return (
    <View
      className={`rounded-2xl p-4 gap-1.5 ${
        avaliacao.minha ? "bg-golden-pale" : "bg-white dark:bg-gray-800 shadow-sm"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
          <Text className="text-white font-bold">{avaliacao.autor.charAt(0).toUpperCase()}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${avaliacao.minha ? "text-primary-dark" : "text-gray-900 dark:text-white"}`}
            >
              {avaliacao.autor}
            </Text>
            {avaliacao.minha && (
              <View className="bg-primary rounded-full px-2 py-0.5">
                <Text className="text-[10px] font-bold text-white">VOCÊ</Text>
              </View>
            )}
          </View>
          <Text className={`text-[11px] ${avaliacao.minha ? "text-primary-dark" : "text-muted dark:text-gray-400"}`}>
            {quando(avaliacao)}
          </Text>
        </View>
        <Estrelas nota={avaliacao.nota} tamanho={12} />
      </View>
      {avaliacao.comentario ? (
        <Text className={`text-sm ${avaliacao.minha ? "text-primary-dark" : "text-gray-700 dark:text-gray-300"}`}>
          {avaliacao.comentario}
        </Text>
      ) : (
        <Text className={`text-xs italic ${avaliacao.minha ? "text-primary-dark" : "text-muted dark:text-gray-400"}`}>
          Só a nota, sem comentário.
        </Text>
      )}
    </View>
  );
}

// Seção "Avaliações" do detalhe da clínica: a avaliação do tutor (nota de 1 a
// 5 + comentário, avaliar de novo substitui) e, logo abaixo, a caixa com todos
// os comentários (o do tutor em destaque, com "Você"), com nome, data e hora.
// Específico da tela /clinica/{id}.
export function AvaliacoesClinica({ idClinica }: { idClinica: string }) {
  const { data: avaliacoes, isLoading } = useAvaliacoesClinica(idClinica);
  const { mutate: avaliar, isPending: salvando } = useAvaliarClinica(idClinica);
  const { mutate: apagar, isPending: apagando } = useApagarAvaliacao(idClinica);

  const minha = avaliacoes?.find((avaliacao) => avaliacao.minha);
  // O do tutor primeiro; os outros na ordem da API (mais recentes primeiro)
  const comentarios = [...(minha ? [minha] : []), ...(avaliacoes ?? []).filter((avaliacao) => !avaliacao.minha)];
  const [acabouDeSalvar, setAcabouDeSalvar] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormAvaliacao>({
    resolver: zodResolver(FormAvaliacaoSchema),
    defaultValues: { nota: 0, comentario: "" },
  });

  useEffect(() => {
    reset({ nota: minha?.nota ?? 0, comentario: minha?.comentario ?? "" });
  }, [minha?.id, minha?.nota, minha?.comentario, reset]);

  function salvar(dados: FormAvaliacao) {
    setAcabouDeSalvar(false);
    avaliar(dados, {
      onSuccess: () => setAcabouDeSalvar(true),
      onError: (erro) => setError("root", { message: mensagemDaApi(erro) }),
    });
  }

  function aoApagar() {
    Alert.alert("Apagar avaliação", "Tem certeza que deseja apagar a sua avaliação?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: () =>
          apagar(undefined, {
            onSuccess: () => setAcabouDeSalvar(false),
            onError: (erro) => setError("root", { message: mensagemDaApi(erro) }),
          }),
      },
    ]);
  }

  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-gray-900 dark:text-white">Avaliações</Text>

      {/* Sua avaliação */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 gap-3 shadow-sm">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          {minha ? "Sua avaliação" : "Avalie esta clínica"}
        </Text>

        <Controller
          name="nota"
          control={control}
          render={({ field: { value, onChange } }) => (
            <View className="gap-1">
              <Estrelas nota={value} tamanho={28} onChange={onChange} />
              {errors.nota && <Text className="text-red-500 text-xs">{errors.nota.message}</Text>}
            </View>
          )}
        />

        <CampoTexto
          name="comentario"
          control={control}
          placeholder="Conte como foi o atendimento (opcional)"
          multiline
          autoCapitalize="sentences"
        />

        {errors.root && <Text className="text-red-500 text-sm">{errors.root.message}</Text>}

        {acabouDeSalvar && (
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={16} color="#1E3A2F" />
            <Text className="flex-1 text-sm text-primary dark:text-green-medium">
              Avaliação salva! Ela já aparece nos comentários abaixo.
            </Text>
          </View>
        )}

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleSubmit(salvar)}
            disabled={salvando}
            activeOpacity={0.85}
            className={`flex-1 items-center rounded-xl py-3 ${salvando ? "bg-primary/70" : "bg-primary"}`}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">{minha ? "Atualizar avaliação" : "Enviar avaliação"}</Text>
            )}
          </TouchableOpacity>

          {minha && (
            <TouchableOpacity
              onPress={aoApagar}
              disabled={apagando}
              activeOpacity={0.85}
              className="items-center justify-center rounded-xl py-3 px-4 border border-red-500"
            >
              <Text className="text-red-500 font-semibold">Apagar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Caixa de comentários: todos, com o do tutor em destaque */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Comentários{comentarios.length > 0 ? ` (${comentarios.length})` : ""}
        </Text>
        {isLoading ? (
          <ActivityIndicator color="#E8A838" />
        ) : comentarios.length === 0 ? (
          <Text className="text-sm text-muted dark:text-gray-400">
            Ninguém avaliou esta clínica ainda. Seja o primeiro!
          </Text>
        ) : (
          comentarios.map((avaliacao) => <CardComentario key={avaliacao.id} avaliacao={avaliacao} />)
        )}
      </View>
    </View>
  );
}
