import CampoTexto from "@/components/ui/CampoTexto";
import { EditarPerfilInput } from "@/schemas/editar-perfil.schema";
import { mascararData } from "@/utils/mascaras";
import { Ionicons } from "@expo/vector-icons";
import { Control } from "react-hook-form";
import { Text, View } from "react-native";

type Props = {
  control: Control<EditarPerfilInput>;
  cpf: string;
};

export function FormDadosPessoais({ control, cpf }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
        Dados pessoais
      </Text>

      <View className="gap-4 rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm">
        <CampoTexto
          name="nome"
          control={control}
          label="Nome completo"
          autoCapitalize="words"
        />

        <CampoTexto
          name="email"
          control={control}
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Sem máscara: o telefone é salvo como um único número (DDI + DDD + número). */}
        <CampoTexto
          name="telefone"
          control={control}
          label="Telefone"
          keyboardType="phone-pad"
        />

        <CampoTexto
          name="dataNascimento"
          control={control}
          label="Data de nascimento"
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          transformarTexto={mascararData}
        />

        <View className="flex-row items-center gap-3 rounded-xl border border-border dark:border-gray-700 px-4 py-3.5 opacity-60">
          <Ionicons name="lock-closed" size={16} color="#9E9589" />
          <View className="flex-1">
            <Text className="mb-0.5 text-[11px] font-medium text-muted dark:text-gray-400">
              CPF não pode ser alterado
            </Text>
            <Text className="text-[15px] text-gray-900 dark:text-white">{cpf}</Text>
          </View>
        </View>
      </View>

      <View className="gap-1 px-1">
        <Text className="text-[11px] text-muted dark:text-gray-400">
          Digite sua senha atual para confirmar — atenção: se digitar errado,
          sua senha de acesso será alterada para o que for digitado aqui.
        </Text>
        <CampoTexto
          name="senha"
          control={control}
          label="Senha atual"
          placeholder="••••••••"
          campoSenha
          autoComplete="current-password"
          textContentType="password"
        />
      </View>
    </View>
  );
}
