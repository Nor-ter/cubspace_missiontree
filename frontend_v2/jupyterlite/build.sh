#!/usr/bin/env bash
# JupyterLite 빌드: content/ 의 노트북을 넣어 ../public/jupyter/ 로 출력한다.
# 처음 한 번: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
set -euo pipefail
cd "$(dirname "$0")"
PY="${PYTHON:-.venv/bin/python}"
"$PY" -m jupyter lite build --contents content --output-dir ../public/jupyter
