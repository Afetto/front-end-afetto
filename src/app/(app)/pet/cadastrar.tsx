import { FormPet } from "@/components/FormPet";
import { useSessao } from "@/context/SessaoContext";
import { useCriarPet } from "@/hooks/usePets";
import { FormCadastroPet, FormCadastroPetSchema } from "@/schemas/pet.schema";
import { converterDataParaISO } from "@/utils/data";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TelaCadastrarPet() {
  const { sessao } = useSessao();
  const { mutate: criarPet, isPending: enviando } = useCriarPet();
  const idUsuario = sessao?.id ?? "";

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormCadastroPet>({
    resolver: zodResolver(FormCadastroPetSchema),
    mode: "onTouched",
    defaultValues: {
      nome: "",
      especie: undefined,
      sexo: undefined,
      raca: "",
      peso: "",
      dataNasc: "",
      descricao: "",
    },
  });

  function aoEnviar(form: FormCadastroPet) {
    if (!idUsuario) {
      setError("root", {
        message:
          "Não foi possível identificar seu usuário. Verifique a conexão com a API e entre novamente.",
      });
      return;
    }

    criarPet(
      {
        nome: form.nome,
        especie: form.especie,
        sexo: form.sexo,
        raca: form.raca?.trim() || "",
        peso: form.peso ? Number(form.peso.replace(",", ".")) : undefined,
        dataNasc: form.dataNasc ? converterDataParaISO(form.dataNasc) : "",
        descricao: form.descricao?.trim() || "",
        idUsuario,
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          setError("root", {
            message: "Erro ao cadastrar o pet. Tente novamente.",
          }),
      }
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface dark:bg-gray-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-10 pb-10 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color="#1E3A2F" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">Novo pet</Text>
          </View>

          <FormPet
            control={control}
            errors={errors}
            isPending={enviando}
            textoBotao="Cadastrar pet"
            onSubmit={handleSubmit(aoEnviar)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
