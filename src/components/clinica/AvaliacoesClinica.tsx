import { mensagemDaApi } from "@/api/erros";
import { Estrelas } from "@/components/Estrelas";
import CampoTexto from "@/components/ui/CampoTexto";
import { useApagarAvaliacao, useAvaliacoesClinica, useAvaliarClinica } from "@/hooks/useClinicas";
import { FormAvaliacao, FormAvaliacaoSchema } from "@/schemas/clinica.schema";
import { converterDataParaBR } from "@/utils/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

// Seção "Avaliações" do detalhe da clínica: a avaliação do tutor (nota de 1 a
// 5 + comentário, avaliar de novo substitui) e as dos outros tutores.
// Específico da tela /clinica/{id}.
export function AvaliacoesClinica({ idClinica }: { idClinica: string }) {
  const { data: avaliacoes, isLoading } = useAvaliacoesClinica(idClinica);
  const { mutate: avaliar, isPending: salvando } = useAvaliarClinica(idClinica);
  const { mutate: apagar, isPending: apagando } = useApagarAvaliacao(idClinica);

  const minha = avaliacoes?.find((avaliacao) => avaliacao.minha);
  const outras = (avaliacoes ?? []).filter((avaliacao) => !avaliacao.minha);

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
    avaliar(dados, { onError: (erro) => setError("root", { message: mensagemDaApi(erro) }) });
  }

  function aoApagar() {
    Alert.alert("Apagar avaliação", "Tem certeza que deseja apagar a sua avaliação?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: () => apagar(undefined, { onError: (erro) => setError("root", { message: mensagemDaApi(erro) }) }),
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

      {/* Dos outros tutores */}
      {isLoading ? (
        <ActivityIndicator color="#E8A838" />
      ) : outras.length === 0 ? (
        <Text className="text-sm text-muted dark:text-gray-400">
          {minha ? "Nenhum outro tutor avaliou ainda." : "Ninguém avaliou esta clínica ainda."}
        </Text>
      ) : (
        outras.map((avaliacao) => (
          <View key={avaliacao.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 gap-1 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">{avaliacao.autor}</Text>
              {!!avaliacao.data && (
                <Text className="text-[11px] text-muted dark:text-gray-400">{converterDataParaBR(avaliacao.data)}</Text>
              )}
            </View>
            <Estrelas nota={avaliacao.nota} tamanho={12} />
            {avaliacao.comentario && (
              <Text className="text-sm text-gray-700 dark:text-gray-300 mt-1">{avaliacao.comentario}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}
