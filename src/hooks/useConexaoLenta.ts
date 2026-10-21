import { assinarConexaoLenta, haConexaoLenta } from "@/api/conexaoLenta";
import { useSyncExternalStore } from "react";

/** `true` enquanto alguma chamada à API espera há mais de alguns segundos (ver `api/conexaoLenta.ts`). */
export function useConexaoLenta(): boolean {
  return useSyncExternalStore(assinarConexaoLenta, haConexaoLenta, haConexaoLenta);
}
