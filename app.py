from flask import Flask, request, jsonify, send_from_directory
from math import isfinite
import os

app = Flask(__name__, static_folder='.', static_url_path='')


@app.after_request
def add_no_cache_headers(response):
    # Evita que o navegador use arquivos antigos (HTML/JS/CSS) durante o desenvolvimento.
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


def refletir_eixo_x(p):
    return {'x': p['x'], 'y': -p['y']}


def refletir_eixo_y(p):
    return {'x': -p['x'], 'y': p['y']}


def refletir_ambos(p):
    return {'x': -p['x'], 'y': -p['y']}


def aplicar_reflexao(pontos, tipo):
    if tipo == 'x':
        fn = refletir_eixo_x
    elif tipo == 'y':
        fn = refletir_eixo_y
    elif tipo == 'xy':
        fn = refletir_ambos
    else:
        fn = lambda p: {'x': p['x'], 'y': p['y']}
    return [fn(p) for p in pontos]


def validar_pontos(pontos):
    if not isinstance(pontos, list):
        raise ValueError('pontos deve ser uma lista')
    for i, p in enumerate(pontos):
        if not isinstance(p, dict) or 'x' not in p or 'y' not in p:
            raise ValueError(f'Ponto {i+1} inválido')
        x = p['x']
        y = p['y']
        if not (isinstance(x, (int, float)) and isinstance(y, (int, float))):
            raise ValueError(f'Ponto {i+1} contém valor não numérico')
        if not (isfinite(x) and isfinite(y)):
            raise ValueError(f'Ponto {i+1} contém valor inválido')


def formatar_pontos(pontos):
    return '; '.join(f"{p['x']},{p['y']}" for p in pontos)


def nome_reflexao(tipo):
    return {
        'x': 'Eixo X — (x, y) → (x, -y)',
        'y': 'Eixo Y — (x, y) → (-x, y)',
        'xy': 'Ambos os eixos — (x, y) → (-x, -y)',
        'nenhuma': 'Nenhuma'
    }.get(tipo, 'Nenhuma')


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    # Serve arquivos estáticos do diretório do projeto
    if os.path.exists(filename):
        return send_from_directory('.', filename)
    return ('', 404)


@app.route('/api/reflect', methods=['POST'])
def api_reflect():
    data = request.get_json(force=True)
    pontos = data.get('points')
    tipo = data.get('tipo', 'nenhuma')
    try:
        validar_pontos(pontos)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    refletidos = [] if tipo == 'nenhuma' else aplicar_reflexao(pontos, tipo)

    texto = f"Reflexão aplicada: {nome_reflexao(tipo)}\n\n"
    texto += 'Originais:\n'
    for i, p in enumerate(pontos):
        texto += f"  P{i+1} = ({p['x']}, {p['y']})\n"
    if refletidos:
        texto += '\nRefletidos:\n'
        for i, p in enumerate(refletidos):
            texto += f"  P{i+1}' = ({p['x']}, {p['y']})\n"

    return jsonify({
        'originais': pontos,
        'refletidos': refletidos,
        'texto': texto
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
