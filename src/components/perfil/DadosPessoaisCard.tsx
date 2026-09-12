import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  email: string;
  telefone: string;
  dataNascimento: string; // já formatada DD/MM/AAAA
  cpf: string;
};

function LinhaInfo({
  icone,
  label,
  valor,
}: {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  valor: string;
}) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border py-3.5">
      <Ionicons name={icone} size={16} color="#9E9589" />
      <View className="flex-1">
        <Text className="mb-0.5 text-[11px] font-medium text-muted">{label}</Text>
        <Text className="text-[15px] text-gray-900">{valor}</Text>
      </View>
    </View>
  );
}

export function DadosPessoaisCard({ email, telefone, dataNascimento, cpf }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
        Dados pessoais
      </Text>

      <View className="rounded-2xl bg-white px-4 shadow-sm">
        <LinhaInfo icone="mail-outline" label="Email" valor={email} />
        <LinhaInfo icone="call-outline" label="Telefone" valor={telefone || "Não informado"} />
        <LinhaInfo
          icone="calendar-outline"
          label="Data de nascimento"
          valor={dataNascimento || "Não informada"}
        />

        <View className="flex-row items-center gap-3 py-3.5">
          <Ionicons name="lock-closed" size={16} color="#E8A838" />
          <View className="flex-1">
            <Text className="mb-0.5 text-[11px] font-medium text-muted">
              CPF • não editável
            </Text>
            <Text className="text-[15px] text-gray-900">{cpf}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
