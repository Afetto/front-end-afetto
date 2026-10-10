import { PerfilCompleto } from "@/services/perfil-completo.service";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  perfil?: PerfilCompleto;
  carregando: boolean;
  onEditar: () => void;
};

function LinhaInfo({
  icone,
  label,
  valor,
  ultima = false,
}: {
  icone: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  valor: string;
  ultima?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 py-3.5 ${ultima ? "" : "border-b border-border dark:border-gray-700"}`}
    >
      <Ionicons name={icone} size={16} color="#9E9589" />
      <View className="flex-1">
        <Text className="mb-0.5 text-[11px] font-medium text-muted dark:text-gray-400">{label}</Text>
        <Text className="text-[15px] text-gray-900 dark:text-white">{valor}</Text>
      </View>
    </View>
  );
}

/**
 * Card "Moradia e endereço" do /perfil: o que foi salvo no "Finalize seu
 * cadastro" (GET /usuario/me/perfil). Editar leva para /completar-perfil, que
 * abre preenchido e salva com PUT /usuario/me/perfil.
 */
export function MoradiaEnderecoCard({ perfil, carregando, onEditar }: Props) {
  const endereco = perfil?.endereco;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted dark:text-gray-400">
          Moradia e endereço
        </Text>
        {perfil?.perfilCompleto && (
          <TouchableOpacity onPress={onEditar} hitSlop={8} className="flex-row items-center gap-1">
            <Ionicons name="pencil-outline" size={14} color="#E8A838" />
            <Text className="text-xs font-semibold text-amber">Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="rounded-2xl bg-white dark:bg-gray-800 px-4 shadow-sm">
        {carregando ? (
          <View className="py-6">
            <ActivityIndicator color="#E8A838" />
          </View>
        ) : !perfil?.perfilCompleto ? (
          <View className="py-4 gap-3">
            <Text className="text-sm text-muted dark:text-gray-400">
              Você ainda não informou sua moradia e seu endereço. Eles ajudam a achar clínicas perto de você.
            </Text>
            <TouchableOpacity
              onPress={onEditar}
              activeOpacity={0.85}
              className="items-center rounded-xl border-[1.5px] border-amber py-3"
            >
              <Text className="text-sm font-semibold text-amber">Preencher agora</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <LinhaInfo
              icone="home-outline"
              label="Moradia"
              valor={[
                perfil.tipoMoradia === "apartamento" ? "Apartamento" : "Casa",
                perfil.telaProtecao === "sim" ? "com tela de proteção" : "sem tela de proteção",
              ].join(", ")}
            />
            <LinhaInfo
              icone="paw-outline"
              label="Pets em casa"
              valor={String(perfil.quantidadePets)}
            />
            {endereco && (
              <LinhaInfo
                icone="location-outline"
                label="Endereço"
                valor={`${endereco.logradouro}, ${endereco.numero}${
                  endereco.complemento ? ` (${endereco.complemento})` : ""
                } — ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} · CEP ${endereco.cep}`}
                ultima
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}
