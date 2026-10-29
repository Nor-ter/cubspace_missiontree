# JupyterLite (실습 노트북)

Task(따라 하기)와 Subtask(직접 해 보기) 실습 노트북을 브라우저 안에서 실행하기 위한 설정입니다.
학생 컴퓨터에는 아무것도 설치하지 않아도 됩니다.

- `content/` : 노트북 원본 (`.ipynb`). 여기에 추가하고 `src/features/feature_a/api.ts`의 `NOTEBOOKS`에 연결합니다.
- `jupyter-lite.json` : 설정. 브라우저 저장을 끄고(memory storage), numpy와 matplotlib을 미리 불러옵니다.
- 빌드 결과는 `../public/jupyter/`에 생기며 git에는 올리지 않습니다.

## 빌드

```bash
cd frontend/jupyterlite
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt   # 처음 한 번만
./build.sh
```

노트북을 고친 뒤에는 `./build.sh`를 다시 실행하세요.
