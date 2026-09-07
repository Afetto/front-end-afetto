import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function PetsVazio() {
  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View style={{ backgroundColor: "#1F3B30" }} className="px-5 pt-14 pb-5">
        <Text className="text-xl font-bold text-white">Meus Pets</Text>
        <Text className="text-sm mt-1" style={{ color: "#A8C5A0" }}>
          Nenhum pet cadastrado
        </Text>
      </View>
      {/* Empty */}
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Ionicons name="paw-outline" size={56} color="#9A9585" />
        <Text className="text-primary font-bold text-lg text-center">
          Você ainda não tem pets
        </Text>
        <Text className="text-muted text-sm text-center">
          Adicione seu primeiro pet para começar a acompanhar a saúde dele.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ borderColor: "#E8A838" }}
          className="flex-row items-center gap-2 mt-2 px-6 py-3 rounded-2xl border"
        >
          <Ionicons name="add-circle-outline" size={18} color="#B07A0A" />
          <Text style={{ color: "#B07A0A" }} className="text-sm font-semibold">
            Adicionar novo pet
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}