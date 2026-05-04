// Módulo de processamento
// Aplica as regras de reflexão geométrica sobre os pontos.
//
//   Reflexão no eixo X: (x, y) → (x, -y)
//   Reflexão no eixo Y: (x, y) → (-x, y)
//   Reflexão em ambos:  (x, y) → (-x, -y)

export function refletirEixoX(p) {
  return { x: p.x, y: -p.y };
}

export function refletirEixoY(p) {
  return { x: -p.x, y: p.y };
}

export function refletirAmbos(p) {
  return { x: -p.x, y: -p.y };
}

/**
 * Aplica a transformação escolhida a uma lista de pontos.
 * @param {{x:number,y:number}[]} pontos
 * @param {"x"|"y"|"xy"|"nenhuma"} tipo
 */
export function aplicarReflexao(pontos, tipo) {
  const fn =
    tipo === "x" ? refletirEixoX :
    tipo === "y" ? refletirEixoY :
    tipo === "xy" ? refletirAmbos :
    (p) => ({ ...p });
  return pontos.map(fn);
}
