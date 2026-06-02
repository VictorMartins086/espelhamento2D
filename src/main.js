// Módulo de controle (main)
// Integra entrada, processamento e visualização, gerenciando o fluxo do programa.

import { parsePontos, formatarPontos, FIGURAS } from "./entrada.js";
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

async function executar() {
  try {
    const originais = parsePontos(elPontos.value);
    if (originais.length === 0) {
      elSaida.textContent = "Insira ao menos um ponto.";
      desenhar(elCanvas, [], []);
      return;
    }

    const tipo = getReflexaoSelecionada();
    // Envia os pontos ao backend Python para processamento
    let refletidos = [];
    try {
      const resp = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: originais, tipo })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error || resp.statusText || 'Erro no servidor');
      }
      const data = await resp.json();
      refletidos = data.refletidos || [];
      elSaida.textContent = data.texto || '';
      desenhar(elCanvas, originais, refletidos);
      return;
    } catch (e) {
      elSaida.textContent = 'Erro: ' + e.message;
      desenhar(elCanvas, originais, []);
      return;
    }
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
