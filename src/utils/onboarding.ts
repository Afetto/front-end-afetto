export type EtapasOnboarding = {
  perfilCompleto: boolean;
  petCadastrado: boolean;
  clinicaVinculada: boolean;
};

export type ItemOnboarding = {
  id: string;
  titulo: string;
  subtitulo: string;
  concluido: boolean;
  opcional: boolean;
  rota: string;
};

export type ProgressoCalculado = {
  checklist: ItemOnboarding[];
  percentual: number;
  rotuloEtapa: string;
  obrigatoriosConcluidos: boolean;
};

/** Deriva o checklist, a etapa atual e o percentual de progresso do onboarding a partir dos dados da API. */
export function calcularProgressoOnboarding(etapas: EtapasOnboarding): ProgressoCalculado {
  const checklist: ItemOnboarding[] = [
    {
      id: "cadastro",
      titulo: "Finalize seu cadastro!",
      subtitulo: "Coloque suas infos adicionais!",
      concluido: etapas.perfilCompleto,
      opcional: false,
      rota: "/completar-perfil",
    },
    {
      id: "pet",
      titulo: "Cadastrar seu Pet",
      subtitulo: "Nome, raça, idade e histórico",
      concluido: etapas.petCadastrado,
      opcional: false,
      rota: "/(tabs)/pets",
    },
    // Opcional e por último: enquanto houver etapa obrigatória pendente, o
    // rótulo da barra sempre aponta para ela.
    {
      id: "clinica",
      titulo: "Vincular sua clínica",
      subtitulo: "Favorite a clínica do seu pet",
      concluido: etapas.clinicaVinculada,
      opcional: true,
      rota: "/(tabs)/clinica",
    },
  ];

  const total = checklist.length;
  const concluidos = checklist.filter((item) => item.concluido).length;
  const etapaAtual = Math.min(concluidos + 1, total);
  const percentual = etapaAtual / total;
  const proximoPendente = checklist.find((item) => !item.concluido);
  const rotuloEtapa = `Etapa ${etapaAtual} de ${total} — ${proximoPendente?.titulo}`;
  const obrigatoriosConcluidos = checklist
    .filter((item) => !item.opcional)
    .every((item) => item.concluido);

  return { checklist, percentual, rotuloEtapa, obrigatoriosConcluidos };
}
