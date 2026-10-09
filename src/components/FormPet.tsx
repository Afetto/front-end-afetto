import { SeletorEspecie } from "@/components/SeletorEspecie";
import { CampoSelecao } from "@/components/ui/CampoSelecao";
import CampoTexto from "@/components/ui/CampoTexto";
import { FormCadastroPet } from "@/schemas/pet.schema";
import { mascararData } from "@/utils/mascaras";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  control: Control<FormCadastroPet>;
  errors: FieldErrors<FormCadastroPet>;
  isPending: boolean;
  textoBotao: string;
  onSubmit: () => void;
};

/** Campos + botão de submit do formulário de pet — usado em criar e editar. */
export function FormPet({ control, errors, isPending, textoBotao, onSubmit }: Props) {
  return (
    <View className="gap-5">
      <CampoTexto
        name="nome"
        control={control}
        label="Nome"
        placeholder="Rex"
        autoCapitalize="words"
      />

      <Controller
        name="especie"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <SeletorEspecie value={value} onChange={onChange} error={error?.message} />
        )}
      />

      <Controller
        name="sexo"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CampoSelecao
            label="Sexo"
            value={value ?? ""}
            onChange={onChange}
            error={error?.message}
            opcoes={[
              { label: "Macho", value: "MACHO" },
              { label: "Fêmea", value: "FEMEA" },
            ]}
          />
        )}
      />

      <CampoTexto
        name="raca"
        control={control}
        label="Raça (opcional)"
        placeholder="Vira-lata"
        autoCapitalize="words"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <CampoTexto
            name="peso"
            control={control}
            label="Peso em kg (opcional)"
            placeholder="12.5"
            keyboardType="decimal-pad"
          />
        </View>
        <View className="flex-1">
          <CampoTexto
            name="dataNasc"
            control={control}
            label="Nascimento (opcional)"
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            transformarTexto={mascararData}
          />
        </View>
      </View>

      <CampoTexto
        name="descricao"
        control={control}
        label="Descrição (opcional)"
        placeholder="Comportamento, cuidados..."
        autoCapitalize="sentences"
      />

      {errors.root && (
        <Text className="text-red-500 text-sm text-center">{errors.root.message}</Text>
      )}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={isPending}
        activeOpacity={0.85}
        className={`items-center justify-center py-4 rounded-2xl ${
          isPending ? "bg-primary/70" : "bg-primary"
        }`}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">{textoBotao}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
