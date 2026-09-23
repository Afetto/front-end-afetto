import { useSessao } from "@/context/SessaoContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

type RotaProtegidaProps = {
  children: React.ReactNode;
};

export function RotaProtegida({ children }: RotaProtegidaProps) {
  const { sessao, carregando } = useSessao();

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-gray-900">
        <ActivityIndicator color="#E8A838" size="large" />
      </View>
    );
  }

  if (!sessao) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
