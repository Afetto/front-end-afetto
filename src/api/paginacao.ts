/**
 * A API pagina as listagens no formato Spring Page: `{ content: [...], ... }`.
 * Alguns endpoints podem devolver um array puro — então tratamos os dois casos.
 */
export function extrairLista<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    const pagina = data as { content?: T[] } | null;
    return pagina?.content ?? [];
}
