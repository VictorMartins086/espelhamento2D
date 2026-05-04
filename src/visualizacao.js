// Módulo de visualização
// Desenha o plano cartesiano e os polígonos (original e refletido) sobre um <canvas>.

const COR_GRADE = "#e2e8f0";
const COR_EIXO = "#0f172a";
const COR_TEXTO = "#334155";
const COR_ORIGINAL = "#2563eb";
const COR_REFLETIDO = "#dc2626";

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{x:number,y:number}[]} originais
 * @param {{x:number,y:number}[]} refletidos
 */
export function desenhar(canvas, originais, refletidos) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const todos = [...originais, ...refletidos];
  const escala = calcularEscala(todos, w, h);
  const cx = w / 2;
  const cy = h / 2;

  const toCanvas = (p) => ({
    x: cx + p.x * escala,
    y: cy - p.y * escala,
  });

  desenharGrade(ctx, w, h, cx, cy, escala);
  desenharEixos(ctx, w, h, cx, cy, escala);

  if (originais.length) desenharFigura(ctx, originais.map(toCanvas), COR_ORIGINAL, "O");
  if (refletidos.length) desenharFigura(ctx, refletidos.map(toCanvas), COR_REFLETIDO, "R");
}

function calcularEscala(pontos, w, h) {
  let max = 5;
  for (const p of pontos) {
    max = Math.max(max, Math.abs(p.x), Math.abs(p.y));
  }
  const margem = 30;
  return Math.min((w - margem * 2) / (max * 2), (h - margem * 2) / (max * 2));
}

function desenharGrade(ctx, w, h, cx, cy, escala) {
  ctx.strokeStyle = COR_GRADE;
  ctx.lineWidth = 1;

  for (let x = cx % escala; x < w; x += escala) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = cy % escala; y < h; y += escala) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function desenharEixos(ctx, w, h, cx, cy, escala) {
  ctx.strokeStyle = COR_EIXO;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, h);
  ctx.stroke();

  ctx.fillStyle = COR_TEXTO;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const passo = escolherPasso(escala);
  for (let i = -20; i <= 20; i++) {
    if (i === 0) continue;
    if (i % passo !== 0) continue;
    const px = cx + i * escala;
    const py = cy - i * escala;
    if (px > 10 && px < w - 10) {
      ctx.fillText(String(i), px, cy + 4);
    }
    if (py > 10 && py < h - 10) {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i), cx - 4, py);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
    }
  }

  ctx.fillStyle = COR_EIXO;
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("x", w - 12, cy + 6);
  ctx.textAlign = "center";
  ctx.fillText("y", cx + 10, 4);
}

function escolherPasso(escala) {
  if (escala >= 40) return 1;
  if (escala >= 20) return 2;
  if (escala >= 10) return 5;
  return 10;
}

function desenharFigura(ctx, pontos, cor, prefixo) {
  // Polígono (apenas se houver mais de 1 ponto)
  if (pontos.length > 1) {
    ctx.strokeStyle = cor;
    ctx.fillStyle = cor + "33";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pontos[0].x, pontos[0].y);
    for (let i = 1; i < pontos.length; i++) {
      ctx.lineTo(pontos[i].x, pontos[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Pontos e rótulos
  ctx.fillStyle = cor;
  ctx.font = "11px sans-serif";
  pontos.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`${prefixo}${i + 1}`, p.x + 6, p.y - 6);
  });
}
