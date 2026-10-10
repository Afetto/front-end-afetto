import { TipoEventoCalendario } from "@/services/calendario.service";
import { celulasDoMes, INICIAIS_SEMANA, MesCalendario } from "@/utils/calendario";
import { Text, TouchableOpacity, View } from "react-native";

// Cor do marcador de cada tipo de cuidado (mesmas cores da legenda e dos selos)
export const COR_TIPO_CALENDARIO: Record<TipoEventoCalendario, string> = {
  VACINA: "bg-green-medium",
  PROXIMA_DOSE: "bg-blue-400",
  REMEDIO: "bg-amber",
  CONSULTA: "bg-primary",
};

const ORDEM_TIPOS: TipoEventoCalendario[] = ["CONSULTA", "PROXIMA_DOSE", "VACINA", "REMEDIO"];

type Props = {
  mes: MesCalendario;
  /** Tipos de cuidado de cada dia ("YYYY-MM-DD") — vira os pontinhos embaixo do número. */
  tiposPorDia: Record<string, TipoEventoCalendario[]>;
  diaSelecionado: string;
  hoje: string;
  onSelecionarDia: (dia: string) => void;
};

/** Grade do mês (domingo a sábado) com um ponto colorido por tipo de cuidado no dia. */
export function CalendarioMes({ mes, tiposPorDia, diaSelecionado, hoje, onSelecionarDia }: Props) {
  const celulas = celulasDoMes(mes);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
      <View className="flex-row">
        {INICIAIS_SEMANA.map((inicial, indice) => (
          <Text
            key={indice}
            className="w-[14.28%] text-center text-[11px] font-semibold text-muted dark:text-gray-400 pb-2"
          >
            {inicial}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {celulas.map((dia, indice) => {
          if (!dia) return <View key={`vazio-${indice}`} className="w-[14.28%] h-11" />;

          const selecionado = dia === diaSelecionado;
          const ehHoje = dia === hoje;
          const tipos = ORDEM_TIPOS.filter((tipo) => tiposPorDia[dia]?.includes(tipo));

          return (
            <TouchableOpacity
              key={dia}
              onPress={() => onSelecionarDia(dia)}
              activeOpacity={0.7}
              accessibilityLabel={`Dia ${Number(dia.slice(8))}${tipos.length ? ", com cuidados" : ""}`}
              className="w-[14.28%] h-11 items-center justify-center"
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  selecionado ? "bg-primary" : ehHoje ? "border border-amber" : ""
                }`}
              >
                <Text
                  className={`text-sm ${
                    selecionado ? "text-white font-bold" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {Number(dia.slice(8))}
                </Text>
              </View>
              <View className="flex-row gap-0.5 h-1.5 mt-0.5">
                {tipos.map((tipo) => (
                  <View key={tipo} className={`w-1.5 h-1.5 rounded-full ${COR_TIPO_CALENDARIO[tipo]}`} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
