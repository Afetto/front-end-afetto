import {
    Text,
    TouchableOpacity,
    View,
  } from "react-native";
  
  type Props = {
    salvando: boolean;
    onPress: () => void;
  };
  
  export function BotaoSalvar({
    salvando,
    onPress,
  }: Props) {
    return (
      <View className="absolute bottom-0 left-0 right-0 bg-[#F5F0E8]/95 px-5 pb-[34px] pt-3">
        <TouchableOpacity
          onPress={onPress}
          disabled={salvando}
          activeOpacity={0.85}
          className={`items-center rounded-2xl bg-primary py-4 ${
            salvando ? "opacity-70" : ""
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }