// Módulo de entrada de dados
// Responsável por receber e validar as coordenadas inseridas pelo usuário.

/**
 * Faz o parse de uma string no formato "x,y; x,y; ..." retornando uma lista de pontos.
 * @param {string} texto
 * @returns {{x:number,y:number}[]}
 */
export function parsePontos(texto) {
  if (!texto || typeof texto !== "string") return [];

  return texto
    .split(/;|\n/)
    .map((par) => par.trim())
    .filter((par) => par.length > 0)
    .map((par, idx) => {
      const partes = par.split(",").map((s) => s.trim());
      if (partes.length !== 2) {
        throw new Error(`Ponto ${idx + 1} inválido: "${par}". Use o formato x,y.`);
      }
      const x = Number(partes[0]);
      const y = Number(partes[1]);
      if (Number.isNaN(x) || Number.isNaN(y)) {
        throw new Error(`Ponto ${idx + 1} contém valor não numérico: "${par}".`);
      }
      return { x, y };
    });
}

/** Figuras pré-definidas para facilitar a entrada do usuário. */
export const FIGURAS = {
  triangulo: [
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 2, y: 4 },
  ],
  quadrado: [
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 4, y: 4 },
    { x: 1, y: 4 },
  ],
  pentagono: [
    { x: 2, y: 1 },
    { x: 5, y: 1 },
    { x: 6, y: 3 },
    { x: 3.5, y: 5 },
    { x: 1, y: 3 },
  ],
  ponto: [{ x: 3, y: 2 }],
};

/** Formata uma lista de pontos como string "x,y; x,y; ...". */
export function formatarPontos(pontos) {
  return pontos.map((p) => `${p.x},${p.y}`).join("; ");
}
