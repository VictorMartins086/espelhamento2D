// Módulo de controle (main)
// Integra entrada, processamento e visualização, gerenciando o fluxo do programa.

import { parsePontos, formatarPontos, FIGURAS } from "./entrada.js";
import { desenhar } from "./visualizacao.js";

const $ = (id) => document.getElementById(id);

const elFigura = $("figura");
const elPontosBoxes = $("pontos-boxes");
const elAplicar = $("aplicar");
const elLimpar = $("limpar");
const elSaida = $("saida");
const elCanvas = $("plano");
const btnAddPonto = $("add-ponto");
const btnRemPonto = $("rem-ponto");
const elEixoX = $("eixo-x");
const elEixoY = $("eixo-y");

function getReflexaoSelecionada() {
  const x = !!elEixoX?.checked;
  const y = !!elEixoY?.checked;
  if (x && y) return "xy";
  if (x) return "x";
  if (y) return "y";
  return "nenhuma";
}

function carregarFigura(nome) {
  // Figuras pré-definidas têm quantidade fixa de pontos.
  // Em "Personalizada", o usuário controla a quantidade.
  const isCustom = nome === 'custom';
  const fig = FIGURAS[nome];

  if (isCustom) {
    setPontosEditavel(true);
    // não sobrescreve os pontos do usuário ao alternar para custom
    if (elPontosBoxes.children.length === 0) renderPontos([]);
  } else {
    setPontosEditavel(false);
    renderPontos(fig || []);
  }

  // Ao trocar figura, volta para "nenhuma" reflexão para evitar confusão
  if (elEixoX) elEixoX.checked = false;
  if (elEixoY) elEixoY.checked = false;
}

function setPontosEditavel(ativo) {
  if (btnAddPonto) btnAddPonto.disabled = !ativo;
  if (btnRemPonto) btnRemPonto.disabled = !ativo;
}

function renderPontos(pontos) {
  elPontosBoxes.innerHTML = '';
  pontos.forEach((p) => addPontoBox(p.x, p.y));
  if (pontos.length === 0) addPontoBox('', '');
}

function addPontoBox(x = '', y = '') {
  const idx = elPontosBoxes.children.length;
  const row = document.createElement('div');
  row.className = 'point-row';
  row.dataset.index = idx;

  const inX = document.createElement('input');
  inX.type = 'text';
  inX.inputMode = 'decimal';
  inX.placeholder = 'x';
  inX.value = x;
  inX.className = 'point-input';

  const inY = document.createElement('input');
  inY.type = 'text';
  inY.inputMode = 'decimal';
  inY.placeholder = 'y';
  inY.value = y;
  inY.className = 'point-input';

  row.appendChild(inX);
  row.appendChild(inY);
  elPontosBoxes.appendChild(row);
}

function parseNumero(texto) {
  const raw = String(texto ?? '').trim();
  if (raw.length === 0) return null;
  const normalizado = raw.replace(',', '.');
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

function removeLastPontoBox() {
  if (elPontosBoxes.children.length > 1) {
    elPontosBoxes.removeChild(elPontosBoxes.lastElementChild);
  } else {
    // clear the only one
    const inputs = elPontosBoxes.querySelectorAll('input');
    inputs.forEach(i => i.value = '');
  }
}

function getPontosFromBoxes() {
  const rows = Array.from(elPontosBoxes.querySelectorAll('.point-row'));
  const pontos = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    if (inputs.length < 2) continue;
    const x = parseNumero(inputs[0].value);
    const y = parseNumero(inputs[1].value);
    if (x === null || y === null) continue;
    pontos.push({ x, y });
  }
  return pontos;
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
    const originais = getPontosFromBoxes();
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
  renderPontos([]);
  elFigura.value = "custom";
  if (elEixoX) elEixoX.checked = false;
  if (elEixoY) elEixoY.checked = false;
  elSaida.textContent = "";
  desenhar(elCanvas, [], []);
}

elFigura.addEventListener("change", (e) => {
  carregarFigura(e.target.value);
  executar();
});

btnAddPonto.addEventListener('click', () => { addPontoBox(); });
btnRemPonto.addEventListener('click', () => { removeLastPontoBox(); });

elAplicar.addEventListener("click", executar);
elLimpar.addEventListener("click", limpar);

elEixoX?.addEventListener('change', executar);
elEixoY?.addEventListener('change', executar);

// Inicialização
carregarFigura(elFigura.value);
executar();
