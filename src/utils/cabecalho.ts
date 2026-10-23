/** Fundo das telas: `bg-surface` no claro e `dark:bg-gray-900` no escuro. */
const FUNDO_CLARO = "#F5F0E8";
const FUNDO_ESCURO = "#111827";

/**
 * Cores do cabeçalho nativo do Stack (a barra com a seta de voltar do login,
 * cadastro, esqueci a senha e "Finalize seu cadastro"). O className não chega
 * nele: sem isso, no tema escuro a barra ficava branca e os ícones da status bar
 * (claros no escuro) sumiam em cima dela. Usa a mesma cor do fundo da tela e
 * tira a linha de sombra, para a barra se misturar com a tela.
 */
export function opcoesCabecalhoNativo(escuro: boolean) {
  return {
    headerStyle: { backgroundColor: escuro ? FUNDO_ESCURO : FUNDO_CLARO },
    headerTintColor: escuro ? "#FFFFFF" : "#111827",
    headerShadowVisible: false,
  };
}
