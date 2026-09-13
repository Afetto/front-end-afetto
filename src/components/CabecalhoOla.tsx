import { useSessao } from "@/context/SessaoContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  /** Mostra uma seta de voltar antes da saudação — usado em telas empilhadas
   * (ex.: tela principal do pet), diferente das abas raiz. */
  mostrarVoltar?: boolean;
};

/** Header verde "Olá, {nome}!" + botão de perfil — usado em telas fora da Home
 * que precisam do mesmo cabeçalho simples (Meus Pets, tela principal do pet). */
export function CabecalhoOla({ mostrarVoltar }: Props) {
  const { sessao } = useSessao();

  return (
    <View className="bg-primary px-6 pt-14 pb-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          {mostrarVoltar && (
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text className="text-2xl font-bold text-white" numberOfLines={1}>
            Olá, {sessao?.nome ?? "Usuário"}!
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/perfil")}
          activeOpacity={0.7}
          className="w-11 h-11 rounded-full bg-white/20 items-center justify-center"
        >
          <Ionicons name="person" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
