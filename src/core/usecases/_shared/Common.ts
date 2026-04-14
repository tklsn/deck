export interface UseCase<I, O> {
  execute: (input: I) => Promise<O> | Promise<void>
}

export function langInstruction(lang: string): string {
  return `Você deve retornar os resultados no seguinte idioma: ${lang}`;
}
