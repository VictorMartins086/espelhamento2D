// Módulo de controle (main)
// Integra entrada, processamento e visualização, gerenciando o fluxo do programa.

import { parsePontos, formatarPontos, FIGURAS } from "./entrada.js";
import { aplicarReflexao } from "./processamento.js";
import { desenhar } from "./visualizacao.js";

const $ = (id) => document.getElementById(id);

const elFigura = $("figura");
const elPontos = $("pontos");
const elAplicar = $("aplicar");
const elLimpar = $("limpar");
const elSaida = $("saida");
const elCanvas = $("plano");

function getReflexaoSelecionada() {
  const sel = document.querySelector('input[name="reflexao"]:checked');
  return sel ? sel.value : "nenhuma";
}

function carregarFigura(nome) {
  if (nome === "custom") return;
  const fig = FIGURAS[nome];
  if (fig) elPontos.value = formatarPontos(fig);
}

function nomeReflexao(tipo) {
  switch (tipo) {
    case "x": return "Eixo X — (x, y) → (x, -y)";
    case "y": return "Eixo Y — (x, y) → (-x, y)";
    case "xy": return "Ambos os eixos — (x, y) → (-x, -y)";
    default: return "Nenhuma";
  }
}

function executar() {
  try {
    const originais = parsePontos(elPontos.value);
    if (originais.length === 0) {
      elSaida.textContent = "Insira ao menos um ponto.";
      desenhar(elCanvas, [], []);
      return;
    }

    const tipo = getReflexaoSelecionada();
    const refletidos = tipo === "nenhuma" ? [] : aplicarReflexao(originais, tipo);

    let texto = `Reflexão aplicada: ${nomeReflexao(tipo)}\n\n`;
    texto += "Originais:\n";
    originais.forEach((p, i) => {
      texto += `  P${i + 1} = (${p.x}, ${p.y})\n`;
    });
    if (refletidos.length) {
      texto += "\nRefletidos:\n";
      refletidos.forEach((p, i) => {
        texto += `  P${i + 1}' = (${p.x}, ${p.y})\n`;
      });
    }
    elSaida.textContent = texto;

    desenhar(elCanvas, originais, refletidos);
  } catch (err) {
    elSaida.textContent = "Erro: " + err.message;
  }
}

function limpar() {
  elPontos.value = "";
  elFigura.value = "custom";
  document.querySelector('input[name="reflexao"][value="nenhuma"]').checked = true;
  elSaida.textContent = "";
  desenhar(elCanvas, [], []);
}

elFigura.addEventListener("change", (e) => {
  carregarFigura(e.target.value);
  executar();
});

elAplicar.addEventListener("click", executar);
elLimpar.addEventListener("click", limpar);

document.querySelectorAll('input[name="reflexao"]').forEach((r) => {
  r.addEventListener("change", executar);
});

// Inicialização
carregarFigura(elFigura.value);
executar();
