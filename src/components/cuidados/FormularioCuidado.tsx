import { EstadoErro } from "@/components/EstadoErro";
import { SeletorTipoCuidado, TipoCuidado } from "@/components/SeletorTipoCuidado";
import { BotaoEnviar } from "@/components/ui/BotaoEnviar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  idPet: string;
  tipo: TipoCuidado;
  editando: boolean;
  /** Título na edição ("Editar vacina"); ao adicionar é sempre "Adicionar cuidado". */
  tituloEdicao: string;
  /** Edição: o cuidado ainda está chegando da API. */
  carregando: boolean;
  /** Edição: o cuidado não carregou — mostra o erro em vez de um formulário vazio. */
  erroAoCarregar?: string;
  onTentarNovamente: () => void;
  /** Mensagem de erro do formulário (API ou conexão). */
  erro?: string;
  enviando: boolean;
  onEnviar: () => void;
  /** Aviso entre o título e os campos (ex.: consulta agendada numa clínica). */
  aviso?: ReactNode;
  /** Os campos do formulário. */
  children: ReactNode;
};

/**
 * Estrutura das telas de vacina, remédio e consulta: carregando, erro ao
 * carregar, título com voltar, seletor de tipo (só ao adicionar), campos,
 * mensagem de erro e o botão Salvar fixo no rodapé.
 */
export function FormularioCuidado({
  idPet,
  tipo,
  editando,
  tituloEdicao,
  carregando,
  erroAoCarregar,
  onTentarNovamente,
  erro,
  enviando,
  onEnviar,
  aviso,
  children,
}: Props) {
  if (editando && carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (editando && erroAoCarregar) {
    return <EstadoErro mensagem={erroAoCarregar} onTentarNovamente={onTentarNovamente} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface dark:bg-gray-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-32 gap-6">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {editando ? tituloEdicao : "Adicionar cuidado"}
            </Text>
          </View>

          {/* Vacina, remédio ou consulta — cada um tem o seu formulário */}
          {!editando && <SeletorTipoCuidado idPet={idPet} atual={tipo} />}

          {aviso}

          <View className="gap-5">
            {children}

            {erro && <Text className="text-red-500 text-sm text-center">{erro}</Text>}
          </View>
        </View>
      </ScrollView>

      <BotaoEnviar enviando={enviando} onPress={onEnviar} texto="Salvar" textoLoading="Salvando..." />
    </KeyboardAvoidingView>
  );
}
