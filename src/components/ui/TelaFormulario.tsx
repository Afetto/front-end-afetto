import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

type Props = {
  /** Título grande da tela; use "\n" para quebrar a linha. */
  titulo: string;
  subtitulo?: string;
  /** Erro geral do formulário (ex.: `errors.root?.message`), mostrado depois dos campos. */
  erro?: string;
  /** Botão de envio (`BotaoEnviar`), que fica fixo no rodapé. */
  rodape: ReactNode;
  children: ReactNode;
};

/**
 * Estrutura das telas de formulário (login, cadastro, esqueci a senha e
 * Finalize seu cadastro): teclado sem cobrir os campos, rolagem, título,
 * erro geral e o botão fixo no rodapé. A tela só passa os campos.
 */
export function TelaFormulario({ titulo, subtitulo, erro, rodape, children }: Props) {
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
        {/* pb-32: espaço para o botão fixo do rodapé não cobrir o último campo */}
        <View className="flex-1 px-6 pt-10 pb-32 gap-8">
          <View className="gap-1">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {titulo}
            </Text>
            {subtitulo && (
              <Text className="text-sm text-muted dark:text-gray-400 mt-1">{subtitulo}</Text>
            )}
          </View>

          {children}

          {erro && <Text className="text-red-500 text-sm text-center">{erro}</Text>}

          <View className="flex-1" />

          {rodape}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
