# Documentação Técnica — Sistema de Espelhamento 2D

> Documento técnico detalhado do projeto **Gloss-Rio**.
> Para a visão geral e instruções de uso, consulte o [README.md](../README.md).

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Fluxo de execução](#3-fluxo-de-execução)
4. [Fundamentação matemática](#4-fundamentação-matemática)
5. [Referência dos módulos](#5-referência-dos-módulos)
6. [Formato de entrada](#6-formato-de-entrada)
7. [Interface do usuário](#7-interface-do-usuário)
8. [Decisões de projeto](#8-decisões-de-projeto)
9. [Extensões futuras](#9-extensões-futuras)

---

## 1. Visão geral

O sistema é uma aplicação web client-side que permite ao usuário aplicar **reflexões geométricas** (espelhamentos) sobre pontos e figuras no plano cartesiano e visualizar o resultado em tempo real.

| Item              | Valor                                              |
| ----------------- | -------------------------------------------------- |
| Linguagem         | JavaScript (ES Modules)                            |
| Renderização      | HTML5 Canvas 2D                                    |
| Estilo            | CSS puro                                           |
| Dependências      | Nenhuma                                            |
| Execução          | Navegador moderno (Chrome, Firefox, Edge, Safari)  |

---

## 2. Arquitetura

O projeto segue uma arquitetura **modular** com separação clara de responsabilidades, conforme proposto no documento de planejamento.

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html (UI)                        │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │  Formulário  │  │  Botões      │  │  <canvas>        │  │
│   └──────┬───────┘  └──────┬───────┘  └────────▲─────────┘  │
└──────────┼─────────────────┼───────────────────┼────────────┘
           │ eventos         │ eventos           │ desenho
           ▼                 ▼                   │
┌──────────────────────────────────────────────────────────────┐
│                       src/main.js                            │
│              (Módulo de controle / orquestração)             │
└────┬───────────────────┬───────────────────────────┬─────────┘
     │                   │                           │
     ▼                   ▼                           ▼
┌────────────┐    ┌──────────────────┐      ┌──────────────────┐
│ entrada.js │    │ processamento.js │      │ visualizacao.js  │
│  (parse +  │    │   (reflexões)    │      │  (canvas/render) │
│  figuras)  │    │                  │      │                  │
└────────────┘    └──────────────────┘      └──────────────────┘
```

### Estrutura de pastas

```
gloss-rio/
├── index.html              # Interface (HTML)
├── styles.css              # Estilos visuais
├── README.md               # Visão geral e instruções
├── docs/
│   └── DOCUMENTATION.md    # Este documento
└── src/
    ├── entrada.js          # Módulo de entrada de dados
    ├── processamento.js    # Módulo de processamento (transformações)
    ├── visualizacao.js     # Módulo de visualização
    └── main.js             # Módulo de controle (entry point)
```

---

## 3. Fluxo de execução

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário escolhe figura pré-definida OU digita pontos     │
│ 2. Usuário escolhe o tipo de reflexão                       │
│ 3. Usuário clica em "Aplicar"                               │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ main.js → entrada.js                                         │
│   parsePontos(texto) → [{x, y}, ...]                         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ main.js → processamento.js                                   │
│   aplicarReflexao(pontos, tipo) → [{x, y}, ...]              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ main.js → visualizacao.js                                    │
│   desenhar(canvas, originais, refletidos)                    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Atualiza saída textual + canvas                              │
└─────────────────────────────────────────────────────────────┘
```

A inicialização (`main.js` no carregamento) executa o mesmo fluxo automaticamente com a figura padrão (triângulo).

---

## 4. Fundamentação matemática

A reflexão é uma **isometria** que preserva distâncias e produz uma imagem espelhada da figura original.

### Reflexão em relação ao eixo X

$$
R_x(x, y) = (x, -y)
$$

Em forma matricial:

$$
R_x =
\begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}
$$

### Reflexão em relação ao eixo Y

$$
R_y(x, y) = (-x, y)
$$

$$
R_y =
\begin{bmatrix} -1 & 0 \\ 0 & 1 \end{bmatrix}
$$

### Reflexão em ambos os eixos (equivalente a rotação de 180°)

$$
R_{xy}(x, y) = (-x, -y)
$$

$$
R_{xy} = R_x \cdot R_y =
\begin{bmatrix} -1 & 0 \\ 0 & -1 \end{bmatrix}
$$

### Propriedades preservadas

- Distâncias entre pontos
- Ângulos internos
- Comprimento de segmentos
- Áreas (em valor absoluto)

### Propriedade alterada

- **Orientação**: a reflexão inverte a orientação (sentido horário ↔ anti-horário) dos vértices de um polígono.

---

## 5. Referência dos módulos

### 5.1 `src/entrada.js` — Módulo de entrada de dados

Responsável por receber e validar as coordenadas inseridas pelo usuário.

#### `parsePontos(texto: string): {x, y}[]`

Converte uma string no formato `"x,y; x,y; ..."` em um array de pontos.

**Parâmetros:**
- `texto` — string com os pontos separados por `;` ou nova linha.

**Retorna:** array de objetos `{x: number, y: number}`.

**Lança:** `Error` se algum ponto estiver em formato inválido ou contiver valores não numéricos.

**Exemplo:**
```js
parsePontos("1,1; 4,1; 2,3");
// [{x:1,y:1}, {x:4,y:1}, {x:2,y:3}]
```

#### `FIGURAS: Record<string, {x,y}[]>`

Dicionário com figuras pré-definidas:

| Chave        | Vértices                                              |
| ------------ | ----------------------------------------------------- |
| `triangulo`  | (1,1), (4,1), (2,4)                                   |
| `quadrado`   | (1,1), (4,1), (4,4), (1,4)                            |
| `pentagono`  | (2,1), (5,1), (6,3), (3.5,5), (1,3)                   |
| `ponto`      | (3,2)                                                 |

#### `formatarPontos(pontos): string`

Inverso de `parsePontos` — converte um array de pontos em string formatada.

---

### 5.2 `src/processamento.js` — Módulo de processamento

Aplica as regras de reflexão geométrica.

#### Funções unitárias

| Função              | Transformação        |
| ------------------- | -------------------- |
| `refletirEixoX(p)`  | `(x, y) → (x, -y)`   |
| `refletirEixoY(p)`  | `(x, y) → (-x, y)`   |
| `refletirAmbos(p)`  | `(x, y) → (-x, -y)`  |

Cada função recebe um ponto `{x, y}` e retorna um **novo** objeto (imutabilidade).

#### `aplicarReflexao(pontos, tipo): {x,y}[]`

Aplica a reflexão escolhida a uma lista inteira de pontos.

**Parâmetros:**
- `pontos` — array de pontos.
- `tipo` — `"x"`, `"y"`, `"xy"` ou `"nenhuma"`.

**Retorna:** novo array com os pontos transformados.

---

### 5.3 `src/visualizacao.js` — Módulo de visualização

Renderiza o plano cartesiano e os polígonos sobre um `<canvas>`.

#### `desenhar(canvas, originais, refletidos)`

Função principal exportada pelo módulo.

**Comportamento:**
1. Limpa o canvas.
2. Calcula uma **escala automática** baseada no maior valor absoluto entre todos os pontos (mínimo de 5 unidades em cada direção).
3. Desenha:
   - Grade de fundo
   - Eixos X e Y com rótulos numéricos
   - Polígono original (azul) preenchido com transparência
   - Polígono refletido (vermelho) preenchido com transparência
   - Marcadores e rótulos `O1, O2, ...` e `R1, R2, ...` em cada vértice

**Sistema de coordenadas:**
- Origem matemática `(0, 0)` é mapeada para o **centro do canvas**.
- O eixo Y é **invertido** em relação ao canvas (no canvas, Y cresce para baixo).
- Conversão: `xCanvas = cx + x*escala`, `yCanvas = cy - y*escala`.

#### Constantes de cores

| Constante          | Valor      | Uso                       |
| ------------------ | ---------- | ------------------------- |
| `COR_GRADE`        | `#e2e8f0`  | Linhas de grade           |
| `COR_EIXO`         | `#0f172a`  | Eixos X e Y               |
| `COR_TEXTO`        | `#334155`  | Rótulos numéricos         |
| `COR_ORIGINAL`     | `#2563eb`  | Figura original (azul)    |
| `COR_REFLETIDO`    | `#dc2626`  | Figura refletida (vermelho) |

---

### 5.4 `src/main.js` — Módulo de controle

Ponto de entrada da aplicação. Importa os demais módulos e gerencia eventos da UI.

#### Responsabilidades

- Capturar eventos dos elementos da página (`change`, `click`).
- Chamar `parsePontos` quando o usuário aplicar.
- Chamar `aplicarReflexao` com o tipo selecionado.
- Chamar `desenhar` para atualizar a visualização.
- Atualizar a saída textual com coordenadas originais e transformadas.
- Tratar erros de parsing exibindo mensagens claras ao usuário.

#### Eventos registrados

| Elemento                   | Evento   | Ação                                      |
| -------------------------- | -------- | ----------------------------------------- |
| `<select id="figura">`     | `change` | Carrega figura pré-definida e re-executa  |
| `<button id="aplicar">`    | `click`  | Re-executa o pipeline                     |
| `<button id="limpar">`     | `click`  | Limpa entradas e canvas                   |
| `<input name="reflexao">`  | `change` | Re-executa com novo tipo de reflexão      |

---

## 6. Formato de entrada

### Sintaxe

```
x1,y1; x2,y2; x3,y3; ...
```

### Regras

- Coordenadas separadas por **vírgula** (`,`).
- Pontos separados por **ponto e vírgula** (`;`) ou **quebra de linha**.
- Valores podem ser inteiros ou decimais (use ponto como separador decimal: `3.5`).
- Espaços são ignorados.
- Valores negativos são permitidos: `-2,3; -1,-4`.

### Exemplos válidos

```
1,1; 4,1; 2,3
-2.5, 3 ;  0,0 ; 4,-1
```

### Exemplos inválidos

| Entrada          | Erro                              |
| ---------------- | --------------------------------- |
| `1,1; 2`         | Ponto sem o `y`                   |
| `a,b`            | Valores não numéricos             |
| `1;2;3`          | Faltam vírgulas separando x e y   |

---

## 7. Interface do usuário

### Painel de entrada (esquerda)

- **Figura pré-definida** — seleção rápida de formas (ou "Personalizada" para entrada manual).
- **Pontos** — campo de texto para inserir coordenadas.
- **Tipo de reflexão** — radio buttons com as quatro opções.
- **Aplicar** — executa a transformação.
- **Limpar** — reseta a interface.
- **Saída** — exibe as coordenadas originais e transformadas em formato textual.

### Painel de visualização (direita)

- **Canvas 600×600** — exibe o plano cartesiano com grade, eixos rotulados e os polígonos original (azul) e refletido (vermelho).
- **Legenda** — identifica as cores.

### Responsividade

Em telas com largura ≤ 900px, os dois painéis empilham verticalmente.

---

## 8. Decisões de projeto

| Decisão                            | Justificativa                                                            |
| ---------------------------------- | ------------------------------------------------------------------------ |
| **JavaScript puro (sem framework)** | Simplicidade; nenhum build necessário; fácil de executar.                |
| **ES Modules (`type="module"`)**    | Separação modular nativa, sem bundler.                                   |
| **HTML5 Canvas em vez de SVG**      | Melhor desempenho para redesenhos e adequado para grades densas.         |
| **Funções puras nas reflexões**     | Imutabilidade facilita testes e raciocínio sobre o código.               |
| **Escala automática do canvas**     | Evita que figuras grandes saiam da área visível.                         |
| **Cores em paleta de alto contraste** | Distinção clara entre original e refletido para fins didáticos.        |

---

## 9. Extensões futuras

Sugestões de evolução do projeto:

- **Reflexão em retas arbitrárias** — generalizar para qualquer reta `y = mx + b`.
- **Outras transformações** — translação, rotação e escala.
- **Animação da transformação** — interpolar entre estado original e refletido.
- **Importação/exportação** — salvar e carregar figuras em JSON.
- **Edição interativa** — clicar e arrastar vértices diretamente no canvas.
- **Modo passo a passo** — explicar a transformação coordenada por coordenada.
- **Testes automatizados** — adicionar testes unitários para `processamento.js` e `entrada.js` (Vitest/Jest).
