import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  titulo: string;
  mensagem: ReactNode;
  textoBotao: string;
  onConfirmar: () => void;
  /** Se definido, confirma sozinho depois deste tempo (ms). */
  confirmarSozinhoEm?: number;
};

/**
 * Cartão de sucesso sobre fundo escuro, usado pelas rotas modais de sucesso
 * (`/cadastro-sucesso`, `/senha-alterada`). A rota é registrada no
 * `(auth)/_layout.tsx` com `presentation: "transparentModal"`.
 */
export function ModalSucesso({ titulo, mensagem, textoBotao, onConfirmar, confirmarSozinhoEm }: Props) {
  const escala = useSharedValue(0.7);
  const opacidade = useSharedValue(0);

  // Sempre a versão mais recente do callback, sem reiniciar a animação
  const confirmar = useRef(onConfirmar);
  confirmar.current = onConfirmar;

  useEffect(() => {
    escala.value = withSpring(1, { damping: 14, mass: 0.8 });
    opacidade.value = withTiming(1, { duration: 250 });

    if (!confirmarSozinhoEm) return;
    const temporizador = setTimeout(() => confirmar.current(), confirmarSozinhoEm);
    return () => clearTimeout(temporizador);
  }, [escala, opacidade, confirmarSozinhoEm]);

  const estiloCartao = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
    opacity: opacidade.value,
  }));

  return (
    <View className="flex-1 bg-black/60 items-center justify-center px-8">
      <Animated.View
        style={estiloCartao}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center gap-5 w-full"
      >
        <View className="w-20 h-20 rounded-full bg-green-medium items-center justify-center">
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>

        <View className="items-center gap-2">
          <Text className="text-2xl font-bold text-primary dark:text-white text-center">{titulo}</Text>
          <Text className="text-sm text-muted dark:text-gray-400 text-center leading-relaxed">
            {mensagem}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onConfirmar}
          activeOpacity={0.85}
          className="bg-primary items-center justify-center py-3 px-8 rounded-2xl w-full"
        >
          <Text className="text-white text-base font-semibold">{textoBotao}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
