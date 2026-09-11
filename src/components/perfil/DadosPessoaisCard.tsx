import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

type Props = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  erro: string;

  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onTelefoneChange: (value: string) => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  returnKeyType?: "next" | "done";
  border?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  returnKeyType = "next",
  border = true,
}: FieldProps) {
  return (
    <View
      className={`py-3.5 ${
        border ? "border-b border-border" : ""
      }`}
    >
      <Text className="mb-1 text-[11px] font-medium text-muted">
        {label}
      </Text>

      <TextInput
        className="m-0 p-0 text-[15px] text-gray-900"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        underlineColorAndroid="transparent"
        placeholderTextColor="#9E9589"
      />
    </View>
  );
}

export function DadosPessoaisCard({
  nome,
  email,
  telefone,
  cpf,
  erro,
  onNomeChange,
  onEmailChange,
  onTelefoneChange,
}: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted">
        Dados pessoais
      </Text>

      <View className="rounded-2xl bg-white px-4 shadow-sm">
        <Field
          label="Nome completo"
          value={nome}
          onChangeText={onNomeChange}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Field
          label="Email"
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />

        <Field
          label="WhatsApp"
          value={telefone}
          onChangeText={onTelefoneChange}
          keyboardType="phone-pad"
          returnKeyType="done"
        />

        <View className="flex-row items-center py-3.5">
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-muted">
              CPF • não editável
            </Text>

            <Text className="text-[15px] text-gray-900">
              {cpf}
            </Text>
          </View>

          <Ionicons
            name="lock-closed"
            size={16}
            color="#E8A838"
          />
        </View>
      </View>

      {erro !== "" && (
        <Text className="px-1 text-center text-xs text-red">
          {erro}
        </Text>
      )}
    </View>
  );
}