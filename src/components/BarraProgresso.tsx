import { Text, View } from "react-native";

type Props = {
  rotulo: string;
  /** Progresso de 0 a 1. */
  percentual: number;
};

export function BarraProgresso({ rotulo, percentual }: Props) {
  return (
    <View className="mt-5">
      <Text className="text-xs text-white/70 mb-2">{rotulo}</Text>
      <View className="h-2 bg-white/20 rounded-full overflow-hidden">
        <View
          className="h-2 bg-amber rounded-full"
          style={{ width: `${percentual * 100}%` }}
        />
      </View>
    </View>
  );
}
