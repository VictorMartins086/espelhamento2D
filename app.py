from flask import Flask, request, jsonify, send_from_directory
from math import isfinite
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=None)


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


def refletir_em_y(p, y0):
    # Reflexão em relação à linha horizontal y = y0
    return {'x': p['x'], 'y': 2 * y0 - p['y']}


def refletir_em_x(p, x0):
    # Reflexão em relação à linha vertical x = x0
    return {'x': 2 * x0 - p['x'], 'y': p['y']}


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


def aplicar_reflexao_com_offset(pontos, reflect_x, reflect_y, axis_x, axis_y):
    # reflect_x: refletir em relação à linha y = axis_x ("Eixo X")
    # reflect_y: refletir em relação à linha x = axis_y ("Eixo Y")
    out = []
    for p in pontos:
        q = {'x': p['x'], 'y': p['y']}
        if reflect_x:
            q = refletir_em_y(q, axis_x)
        if reflect_y:
            q = refletir_em_x(q, axis_y)
        out.append(q)
    return out


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


def nome_reflexao_com_offset(reflect_x, reflect_y, axis_x, axis_y):
    if reflect_x and reflect_y:
        return f"Eixo X em y={axis_x} e Eixo Y em x={axis_y}"
    if reflect_x:
        return f"Eixo X em y={axis_x}"
    if reflect_y:
        return f"Eixo Y em x={axis_y}"
    return "Nenhuma"


def matriz_homogenea(reflect_x, reflect_y, axis_x, axis_y):
    # Matriz 3x3 (homogênea) para transformação afim em 2D.
    # Reflexão em y=axis_x: y' = -y + 2*axis_x
    # Reflexão em x=axis_y: x' = -x + 2*axis_y
    if not (reflect_x or reflect_y):
        return [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ]

    # Começa com identidade
    m = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]

    def mul(a, b):
        out = [[0.0, 0.0, 0.0] for _ in range(3)]
        for i in range(3):
            for j in range(3):
                out[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]
        return out

    if reflect_x:
        rx = [
            [1.0, 0.0, 0.0],
            [0.0, -1.0, 2.0 * axis_x],
            [0.0, 0.0, 1.0],
        ]
        m = mul(rx, m)

    if reflect_y:
        ry = [
            [-1.0, 0.0, 2.0 * axis_y],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ]
        m = mul(ry, m)

    return m


@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    # Serve arquivos estáticos do diretório do projeto
    safe_path = os.path.abspath(os.path.join(BASE_DIR, filename))
    if not safe_path.startswith(BASE_DIR + os.sep):
        return ('', 404)

    if os.path.exists(safe_path) and os.path.isfile(safe_path):
        return send_from_directory(BASE_DIR, filename)
    return ('', 404)


@app.route('/api/reflect', methods=['POST'])
def api_reflect():
    data = request.get_json(force=True)
    pontos = data.get('points')
    tipo = data.get('tipo', 'nenhuma')
    reflect_x = bool(data.get('reflectX', False))
    reflect_y = bool(data.get('reflectY', False))
    axis_x = data.get('axisX', 0)
    axis_y = data.get('axisY', 0)
    try:
        validar_pontos(pontos)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # Se o frontend enviar flags/offsets, usa reflexão por linha; caso contrário, usa o modo antigo.
    usar_offset = 'reflectX' in data or 'reflectY' in data or 'axisX' in data or 'axisY' in data
    try:
        axis_x = float(axis_x)
        axis_y = float(axis_y)
    except Exception:
        axis_x = 0.0
        axis_y = 0.0

    if usar_offset:
        if not (reflect_x or reflect_y):
            refletidos = []
        else:
            refletidos = aplicar_reflexao_com_offset(pontos, reflect_x, reflect_y, axis_x, axis_y)
        nome = nome_reflexao_com_offset(reflect_x, reflect_y, axis_x, axis_y)
        mat = matriz_homogenea(reflect_x, reflect_y, axis_x, axis_y)
    else:
        refletidos = [] if tipo == 'nenhuma' else aplicar_reflexao(pontos, tipo)
        nome = nome_reflexao(tipo)
        # modo antigo: eixo em 0
        reflect_x_old = tipo in ('x', 'xy')
        reflect_y_old = tipo in ('y', 'xy')
        mat = matriz_homogenea(reflect_x_old, reflect_y_old, 0.0, 0.0)

    texto = f"Reflexão aplicada: {nome}\n\n"
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
        'texto': texto,
        'matriz': mat,
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
