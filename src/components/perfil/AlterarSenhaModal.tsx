import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;

  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;

  erro: string;
  salvando: boolean;

  onClose: () => void;

  onSenhaAtualChange: (value: string) => void;
  onNovaSenhaChange: (value: string) => void;
  onConfirmarSenhaChange: (value: string) => void;

  onConfirmar: () => void;
};

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  returnKeyType: "next" | "done";
  onSubmitEditing?: () => void;
};

function PasswordField({
  label,
  value,
  onChangeText,
  returnKeyType,
  onSubmitEditing,
}: PasswordFieldProps) {
  return (
    <View className="rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 pb-1 pt-2">
      <Text className="mb-1 text-[11px] font-medium text-muted dark:text-gray-400">
        {label}
      </Text>

      <TextInput
        className="p-0 py-2 text-[15px] text-gray-900 dark:text-white"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        placeholder="••••••••"
        placeholderTextColor="#9E9589"
        underlineColorAndroid="transparent"
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

export function AlterarSenhaModal({
  visible,
  senhaAtual,
  novaSenha,
  confirmarSenha,
  erro,
  salvando,
  onClose,
  onSenhaAtualChange,
  onNovaSenhaChange,
  onConfirmarSenhaChange,
  onConfirmar,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-[24px] bg-white dark:bg-gray-800 px-6 pb-10 pt-6">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-primary dark:text-white">
              Alterar senha
            </Text>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={22}
                color="#9E9589"
              />
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <PasswordField
              label="Senha atual"
              value={senhaAtual}
              onChangeText={onSenhaAtualChange}
              returnKeyType="next"
            />

            <PasswordField
              label="Nova senha"
              value={novaSenha}
              onChangeText={onNovaSenhaChange}
              returnKeyType="next"
            />

            <PasswordField
              label="Confirmar nova senha"
              value={confirmarSenha}
              onChangeText={onConfirmarSenhaChange}
              returnKeyType="done"
              onSubmitEditing={onConfirmar}
            />

            {erro !== "" && (
              <Text className="text-center text-xs text-red-500">
                {erro}
              </Text>
            )}

            <TouchableOpacity
              onPress={onConfirmar}
              disabled={salvando}
              activeOpacity={0.85}
              className={`mt-1 items-center rounded-2xl bg-primary py-4 ${
                salvando ? "opacity-70" : ""
              }`}
            >
              <Text className="text-base font-semibold text-white">
                {salvando
                  ? "Confirmando..."
                  : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}