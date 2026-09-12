import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  nome: string;
  inicial: string;
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
};

export function PerfilHeader({ nome, inicial, editando, onEditar, onCancelar }: Props) {
  return (
    <View className="items-center bg-primary px-6 pb-8 pt-14">
      <View className="mb-5 w-full flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/15"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>

        <Text className="text-base font-semibold text-white">
          {editando ? "Editar perfil" : "Meu Perfil"}
        </Text>

        {editando ? (
          <TouchableOpacity onPress={onCancelar} activeOpacity={0.7} hitSlop={8}>
            <Text className="text-sm font-semibold text-white">Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onEditar}
            activeOpacity={0.7}
            hitSlop={8}
            className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View className="relative self-center">
        <View className="h-20 w-20 items-center justify-center rounded-full border-[2.5px] border-amber bg-white/15">
          <Text className="text-[32px] font-bold text-white">
            {inicial}
          </Text>
        </View>

        <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-amber">
          <Ionicons
            name="create"
            size={11}
            color="#ffffff"
          />
        </View>
      </View>

      <Text className="mt-3 text-xl font-bold text-white">
        {nome || "Usuário"}
      </Text>

      <Text className="mt-1 text-[13px] text-white/55">
        Plano Gratuito
      </Text>
    </View>
  );
}
