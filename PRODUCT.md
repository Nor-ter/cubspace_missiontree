# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

두 부류가 같은 트리를 쓴다.

**주니어: 신입 코호트.** 인공위성을 처음 만들어 보는 공대생이다. 학생 위성팀에 새로 들어온 코호트(cohort)로, 공학 기초는 있지만 위성 미션과 이 프로젝트의 도메인은 처음이다. 이들이 하는 일:
- 한 단계씩 펼쳐 보며 웹사이트의 구성과 각 Phase에 무엇이 있는지 파악한다 (NASA 수명주기 Phase → Subsystem 팀 → Task Card → Task).
- 자기가 속한 팀의 일만 골라 내어 그 팀의 workflow를 따로 본다.
- 웹사이트 안에서 바로 Technical Manual을 읽고 Workshop(실습 노트북)을 실행하며 학습한다.

**시니어: 팀 리드 · PM.** 전체 Phase 구성이 이미 머릿속에 있다. 이들은 모든 Phase와 각 팀의 Task Card, Manual, Workshop을 한 장에서 보고, 필요한 자료로 바로 들어간다.

지금은 사용자 입력이 없다고 보고 만든다. 사용자 입력은 v3(아래 Capabilities 참고)를 완성한 뒤에 다룬다. 권한으로서의 역할(Admin, Senior, Junior)은 Phase 3부터 생긴다. 그 전까지 주니어 · 시니어는 화면을 쓰는 방식의 차이일 뿐, 계정이나 권한으로 나누지 않는다.

## Product Purpose

신입 학생이 프로젝트를 빠르게 이해하고 "내가 무엇을 하는지"를 빠르게 파악하게 한다. 그래야 학생들이 1U 위성을 실제로 한 번 구현해 보고, 3U로 나아가며 리서치 또는 실무(practical) 경험을 쌓을 수 있다.

성공의 기준:
- **주니어:** 도메인이 처음인 학생이 오래 헤매지 않고 미션 구조와 자기 팀의 다음 할 일을 이해하고, 같은 화면 안에서 학습을 시작한다.
- **시니어:** 한 장의 도면에서 바로, 찾는 Phase · 팀의 Manual이나 Workshop을 연다.

그래서 지금 단계(Phase 1)의 초점은 UI와 UX다.

## Positioning

CubSpace의 독자 제품. Melbourne Space Program(MSP)은 첫 번째 사용 단체다(현재 데이터는 MSP의 ACRUX-II 미션). 다른 학생 위성팀도 쓸 수 있는 제품으로 생각한다.

차별점: 미션 구조(무엇을 언제 하는가)와 학습 자료(매뉴얼, 브라우저 실습 노트북)가 같은 트리 위에 붙어 있다. 학생은 구조를 보다가 그 자리에서 바로 배운다.

## Operating Context

- 데이터 구조: Mission(ACRUX-II) → Phase(Pre-A, A … F, NASA 수명주기) → Subsystem(팀: SYS, BOX, EPS, ADCS, COM, OBC, PAY) → Task Card(PM 카드, 예: A2) → Task(카드의 단계, 예: A2.1). 코드의 level 이름은 각각 mission / phase / subsystem / task / subtask.
- 용어: 카드는 PM 문서처럼 **Task Card**, 카드의 단계는 **Task**, 실습 노트북은 **Workshop**이라 부른다. ("Notebook"이라는 말은 화면에 쓰지 않는다. v1 · v2에서 카드를 "Workshop"이라 부르던 것도 쓰지 않는다.)
- 보기 두 가지 (같은 트리, 사용자가 언제든 바꾼다):
  - **펼쳐 보기 (v1에서 온 것):** 한 단계씩 펼쳐 가며 본다. 주니어가 구조를 익히는 보기다. 접속하면 늘 이 보기로 시작한다.
  - **한눈에 보기 (v2에서 온 것):** 설계 도면 한 장에 모든 Phase와 팀을 펼친다. 각 팀 칸에는 Task Card 코드와, 그 카드에 Manual · Workshop이 있는지 표시하고, 표시를 누르면 그 자료가 바로 열린다. 시니어가 자료를 찾아 들어가는 보기다.
- 상태(done / active / pending)는 잎 노드에만 적고 위 단계는 계산한다. 사용자 입력이 생기기 전(Phase 1)에는 화면에 보여 주지 않는다.
- Technical Manual은 Subsystem 단위(팀 × Phase)로, Workshop은 Task Card(따라 하기)와 Task(직접 해 보기)에 붙는다.
- 배우는 순서는 Manual → Workshop → Tasks다. Manual과 Workshop은 배우는 자료이고, Task는 그다음 실제 프로젝트에서 해야 하는 일이다. 그래서 Task Card를 열면 어디서 열든 Manual부터 보여 준다. (한눈에 보기에서 Manual · Workshop 표시를 직접 누른 경우는 그 자료를 연다.)
- 학생은 넓은 화면에서 트리 옆 패널로 PDF 매뉴얼과 Workshop을 함께 본다.
- 실습 순서는 안내만 하고 강제하지 않는다. Workshop이 없는 Task Card에서는 같은 팀의 Workshop만 안내한다(다른 팀 것은 관련이 없다).
- Phase가 끝나는 조건: 각 Phase의 마지막 SYS 카드("Phase gate")의 단계(완료 보고서 → 우주급 기준 확인 → MSP/ASA 검토 → Phase 종료)와 그 Phase를 닫는 검토 회의. 검토 회의 이름은 팀이 정하기 전까지 NASA 표준(NASA/SP-2016-6105 Rev 2)을 출처와 함께 쓴다.
- 코호트는 "연도 cohort" 형식으로 부른다(예: 2026 cohort).
- 운영 규칙(Task Code 등)은 ClickUp Project Rule이 다루고, 코드 작성 규칙은 `docs/rules.md`가 다룬다.

## Capabilities and Constraints

로드맵:
- **Phase 1 (지금):** 프론트엔드 프로토타입. 사용자 입력 없음. 데이터는 PM 문서에서 옮긴 정적 데이터(`frontend/src/features/feature_a/api.ts`). 단, 나중에 사용자 입력을 받을 것을 고려해 만든다.
  - 화면 버전: v1(태그 `mission-tree-v1`, 펼쳐 보기)과 v2(태그 `mission-tree-v2`, 설계 도면)를 합친 것이 **v3**다. v3를 완성한 뒤에 사용자 입력을 다룬다.
- **Phase 2:** DB(Neo4j 그래프 DB)와 백엔드(FastAPI)를 구축하고, 저장된 내용에 대해 학생이 LLM 챗봇에게 질문할 수 있게 한다. Workshop과 Technical Manual 사이의 의존성을 챗봇으로 파악하는 것도 이 방향이다. 지금은 구현하지 않는다.
- **Phase 3:** 사용자를 Admin, Senior, Junior로 나누고 입력을 받는다. 사용자가 Technical Manual을 업로드·업데이트하고, 한 코호트가 끝나면 최종 업데이트된 매뉴얼을 종합해 그 코호트의 최종 문서를 레거시로 남긴다.

제약:
- UI 문구는 영어. 코드 주석은 한국어.
- 데스크톱 우선. 좁은 화면은 보조.
- 학생 컴퓨터에 아무것도 설치하지 않는다. 실습은 모두 브라우저 안(JupyterLite)에서 끝난다.
- Phase 3 전까지는 역할 구분 없이 모두 같은 트리를 본다. 펼쳐 보기와 한눈에 보기는 역할이 아니라 사용자가 고른다.
- JEV(평가 파이프라인)는 쓰지 않는다. 설계에서 JEV를 전제로 하지 않는다.
- 모노레포: `db/`, `backend/`, `frontend/`, `docs/`. Onboarding Web은 포함하지 않는다.
- 스택: React + TypeScript + Vite (프론트), FastAPI (백엔드), Neo4j (DB).

아직 정하지 않은 것 (만드는 쪽이 마음대로 정하지 않는다):
- **검토 회의 이름:** 지금은 NASA 표준. 팀의 실제 회의(PM 카드에는 SRR, PDR, CDR, SIR이 있다)로 바꿀지 정해야 한다.
- **출처 · 단체 표시:** 화면에서 출처 문서(PM Task Cards CUB-TM-00-1U R6)와 단체 이름(MSP) 표시를 뺐다. 다시 보여 줄지, 어디에 둘지 정해야 한다.

## Brand Commitments

- 제품은 CubSpace의 것이다. 화면 머리에는 제품 이름(Mission Tree)과 미션(Mission: ACRUX-II), 코호트만 쓴다. MSP 로고(`frontend/src/assets/msp-mark.png`)는 지금 화면에 쓰지 않는다.
- AI가 자주 쓰는 상투적인 문구, 그리고 AI가 흔히 고르는 글자 크기·색상·글씨체를 피한다.

## Evidence on Hand

- PM 문서에서 옮긴 ACRUX-II 미션 카드 데이터: `frontend/src/features/feature_a/pmCards.ts`, `api.ts`.
- Technical Manual PDF 2개(외부 자료): NASA MSFC B-dot 문서, UiO FYS3240 제어 강의 (`frontend/public/manuals/`).
- ADCS Workshop(실습 노트북) 3개 (`frontend/jupyterlite/content/adcs/`).
- 팀원 피드백 (v1 · v2 비교): 주니어에게는 v1처럼 한 단계씩 펼쳐지는 화면이 웹 자체와 각 Phase에 무엇이 있는지 파악하기 편하다. 시니어는 전체 Phase가 이미 머릿속에 있어서, v2의 도면이 한눈에 보는 용도로 좋다.
- MSP 로고 (`frontend/src/assets/msp-mark.png`, 지금은 화면에 쓰지 않음).

없는 것 (만들어 넣지 말 것): 사용자 후기, 사용 통계, 다른 사용 단체, ADCS 외 팀의 매뉴얼과 노트북, 백엔드 데이터.

## Product Principles

1. **처음 온 학생 기준으로 시작한다.** 도메인을 모르는 학생이 바로 이해할 수 있어야 한다. 용어와 구조는 설명 없이도 따라갈 수 있게. 그래서 첫 화면은 늘 펼쳐 보기다.
2. **펼쳐서 배우고, 한 장으로 찾는다.** 펼쳐 보기와 한눈에 보기는 같은 트리를 보는 두 방법이다. 한쪽에만 있는 내용을 만들지 않고, 언제든 오갈 수 있다.
3. **구조와 학습은 한자리에.** 미션 구조를 보던 자리에서 바로 매뉴얼과 노트북으로 넘어간다. 다른 도구로 내보내지 않는다.
4. **내 팀의 일이 먼저 보인다.** 전체 흐름을 잃지 않으면서 자기 팀의 workflow만 골라 볼 수 있다.
5. **안내하되 강제하지 않는다.** 다음 단계를 알려 주지만 순서를 막지 않는다.
6. **다음 Phase를 막지 않는다.** 지금은 읽기 전용이지만, 매뉴얼 업데이트, 코호트 최종 문서, 역할, 챗봇이 들어올 자리를 고려한다.

## Accessibility & Inclusion

- 팀은 색만으로 구분하지 않는다: 번호(①–⑦)와 이름을 함께 쓰고, 색은 색각 이상에서도 밝기로 갈리게 고른다.
- 밝은 / 어두운 화면을 사용자가 직접 고를 수 있어야 한다. 브라우저가 한쪽으로 고정돼 있어도(예: Chrome 모양 설정) 바꿀 수 있게, 컴퓨터 설정을 따르는 Auto와 함께 둔다.
- 컴퓨터의 "동작 줄이기" 설정을 따른다: 화면 전환과 움직임은 그 설정이 켜져 있으면 바로 바뀐다.
- 키보드만으로도 쓸 수 있다: Esc로 패널 · 상세도를 닫고, ← →로 Phase를 넘긴다.
- 마우스를 올려야 보이는 정보는 터치 화면에서는 늘 보이게 한다 (예: Phase별 카드 수).
