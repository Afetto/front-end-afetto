import { useConexaoLenta } from "@/hooks/useConexaoLenta";
import { ActivityIndicator, Text, View } from "react-native";

/**
 * "Conectando ao servidor…" por cima de qualquer tela enquanto uma chamada à
 * API demora (ex.: a API do Render acordando). Não bloqueia toques e some
 * sozinho quando a resposta chega. Montado uma vez, no `_layout.tsx` raiz.
 */
export function AvisoConexaoLenta() {
  const conexaoLenta = useConexaoLenta();

  if (!conexaoLenta) return null;

  return (
    <View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      className="absolute left-4 right-4 bottom-28 items-center"
    >
      <View className="flex-row items-center gap-3 bg-primary rounded-2xl px-4 py-3 shadow-sm">
        <ActivityIndicator color="#E8A838" />
        <View className="flex-shrink">
          <Text className="text-sm font-semibold text-white">Conectando ao servidor…</Text>
          <Text className="text-xs text-white/80">
            Se ele estava parado, leva cerca de 1 minuto para acordar.
          </Text>
        </View>
      </View>
    </View>
  );
}
