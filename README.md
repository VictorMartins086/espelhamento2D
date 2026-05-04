# Gloss-Rio · Sistema de Espelhamento 2D

Sistema web interativo para visualização de **reflexões geométricas** (espelhamento) em relação aos eixos X e Y do plano cartesiano.

## Descrição

Permite ao usuário inserir pontos ou figuras e observar como suas coordenadas se transformam após cada reflexão, promovendo a compreensão da interpretação geométrica dessas transformações.

## Linguagem

**JavaScript** (com HTML5 Canvas e CSS), executado diretamente no navegador. Não requer instalação de dependências.

## Regras de transformação

| Reflexão       | Regra                  |
| -------------- | ---------------------- |
| Eixo X         | (x, y) → (x, -y)       |
| Eixo Y         | (x, y) → (-x, y)       |
| Ambos os eixos | (x, y) → (-x, -y)      |

## Estrutura do projeto

```
gloss-rio/
├── index.html              # Interface principal
├── styles.css              # Estilos
└── src/
    ├── entrada.js          # Módulo de entrada de dados
    ├── processamento.js    # Módulo de processamento (reflexões)
    ├── visualizacao.js     # Módulo de visualização (canvas)
    └── main.js             # Módulo de controle (integração)
```

### Módulos

- **Entrada (`entrada.js`)**: faz o parse das coordenadas digitadas e fornece figuras pré-definidas (triângulo, quadrado, pentágono, ponto).
- **Processamento (`processamento.js`)**: aplica as regras de reflexão sobre cada ponto.
- **Visualização (`visualizacao.js`)**: desenha o plano cartesiano, a grade, os eixos e os polígonos original e refletido.
- **Controle (`main.js`)**: integra os módulos e gerencia eventos da interface.

## Como executar

Basta abrir o arquivo `index.html` em um navegador moderno.

> Como o projeto usa módulos ES (`type="module"`), alguns navegadores exigem servidor HTTP. Se necessário, rode um servidor local na pasta do projeto:
>
> ```powershell
> # Python 3
> python -m http.server 8000
> ```
>
> Em seguida acesse `http://localhost:8000`.

## Uso

1. Escolha uma figura pré-definida ou edite manualmente as coordenadas no formato `x,y; x,y; ...`.
2. Selecione o tipo de reflexão desejada (eixo X, eixo Y, ambos, ou nenhuma).
3. Clique em **Aplicar** para visualizar.
4. O painel exibe os pontos originais (azul) e os refletidos (vermelho) sobre o plano cartesiano, junto com as coordenadas correspondentes em formato textual.

## Funcionalidades

- Entrada manual de coordenadas ou seleção de figuras pré-definidas
- Reflexão no eixo X, eixo Y ou em ambos simultaneamente
- Plotagem de figuras geométricas completas (polígonos)
- Visualização do plano cartesiano com grade, eixos rotulados e escala automática
- Saída textual com as coordenadas antes e depois da transformação

## Documentação

A documentação técnica completa, com referência das funções, fundamentação matemática e decisões de projeto, está em [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md).
