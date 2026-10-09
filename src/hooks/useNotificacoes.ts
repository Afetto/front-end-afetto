import { notificacaoService } from "@/services/notificacao.service";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

type Opcoes = {
  /**
   * Chamado quando o usuário toca num lembrete de vacina — com o app aberto,
   * em segundo plano ou fechado. A navegação fica com quem chama (o layout
   * raiz): hooks não navegam.
   */
  aoAbrirPet: (idPet: string) => void;
};

/**
 * Liga as notificações locais ao app. Chamar uma única vez, no layout raiz:
 * 1. configura a exibição com o app aberto e o canal do Android;
 * 2. reage ao toque numa notificação.
 */
function useNotificacoesNativo({ aoAbrirPet }: Opcoes) {
  useEffect(() => {
    // Notificação é recurso secundário: falhar aqui não pode impedir o app de abrir.
    notificacaoService.configurar().catch(() => {});
  }, []);

  // Sempre a versão mais recente do callback, sem refazer o efeito do toque.
  const aoAbrirPetAtual = useRef(aoAbrirPet);
  useEffect(() => {
    aoAbrirPetAtual.current = aoAbrirPet;
  }, [aoAbrirPet]);

  // Cobre os três casos: toque com o app aberto, em segundo plano e o toque
  // que abriu o app do zero.
  const toque = Notifications.useLastNotificationResponse();
  const ultimoToqueTratado = useRef<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    if (!toque || toque === ultimoToqueTratado.current) return;
    ultimoToqueTratado.current = toque;

    const idPet = notificacaoService.idPetDoToque(toque);
    notificacaoService.limparUltimoToque();

    if (idPet) aoAbrirPetAtual.current(idPet);
  }, [toque]);
}

// Na web o `expo-notifications` não entrega notificações locais e o hook de
// toque da biblioteca lança erro — então não há nada a ligar.
function useNotificacoesWeb(_opcoes: Opcoes) {}

export const useNotificacoes =
  Platform.OS === "web" ? useNotificacoesWeb : useNotificacoesNativo;
