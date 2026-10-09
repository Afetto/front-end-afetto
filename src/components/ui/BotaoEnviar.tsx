import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  enviando: boolean;
  onPress: () => void;
  texto?: string;
  textoLoading?: string;
};

export function BotaoEnviar({
  enviando,
  onPress,
  texto = "Entrar",
  textoLoading = "Enviando...",
}: Props) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-surface/95 dark:bg-gray-900/95 px-5 pb-[34px] pt-3">
      <TouchableOpacity
        onPress={onPress}
        disabled={enviando}
        activeOpacity={0.85}
        className={`items-center justify-center rounded-2xl py-4 ${
          enviando ? "bg-primary/70" : "bg-primary"
        }`}
      >
        {enviando ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text className="text-base font-semibold text-white">
              {textoLoading}
            </Text>
          </View>
        ) : (
          <Text className="text-base font-semibold text-white">
            {texto}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
