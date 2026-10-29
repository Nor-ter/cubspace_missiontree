import type { Manual, MissionNode, Notebook } from './types'
import { PM_CARDS } from './pmCards'
import { TEAMS } from './teams'

// 지금은 백엔드가 없으므로 PM 문서에서 옮긴 데이터로 트리를 만든다.
// 나중에 이 함수 안쪽만 fetch('/api/...')로 바꾸면 된다.

// Phase와 Subsystem은 PM의 ACRUX-II Mission Tree와 같다
const PHASES = [
  ['Pre-A', 'Concept Studies'],
  ['A', 'Concept and Technology Development'],
  ['B', 'Preliminary Design and Technology Completion'],
  ['C', 'Final Design and Fabrication'],
  ['D', 'Assembly, Integration, Test and Launch'],
  ['E', 'Operations and Sustainment'],
  ['F', 'Closeout'],
] as const

// public/manuals/ 에 넣은 PDF
const MANUALS = {
  bdot: { title: 'The B-dot Earth Average Magnetic Field (NASA MSFC)', url: '/manuals/adcs-bdot-average-field.pdf' },
  control: { title: 'Control Systems, Lecture 11 (UiO FYS3240)', url: '/manuals/adcs-control-systems-lecture.pdf' },
} satisfies Record<string, Manual>
// 어느 Phase의 어느 Subsystem에 어떤 매뉴얼을 붙이는가 ("Phase/Subsystem")
// B-dot 내용(A 연구, C 비행 SW, E 궤도 데이터)에는 B-dot 문서, 나머지 ADCS에는 제어 강의
const MANUAL_AT: Record<string, Manual> = {
  'A/ADCS': MANUALS.bdot,
  'B/ADCS': MANUALS.control,
  'C/ADCS': MANUALS.bdot,
  'D/ADCS': MANUALS.control,
  'E/ADCS': MANUALS.bdot,
}

// jupyterlite/content/ 에 넣은 노트북 (빌드하면 public/jupyter/ 로 들어간다)
// 키 = PM 카드 id (Task 노트북) 또는 "카드 id.단계 번호" (Subtask 노트북)
// WS-ADCS-1(Magnetic detumbling) 워크숍이 연결된 카드에 붙인다
const NOTEBOOK_AT: Record<string, Notebook> = {
  'TC-ADCS-A2': { path: 'adcs/a2-bdot-study.ipynb' }, // 따라 하기
  'TC-ADCS-A2.1': { path: 'adcs/a2-1-detumble-sim.ipynb' }, // 직접 해 보기
  'TC-ADCS-E1.1': { path: 'adcs/e1-1-detumble-data.ipynb' }, // 궤도에서 받은 자이로 데이터
}

const cardCode = (id: string) => id.split('-').at(-1) // TC-ADCS-A2 → A2

// id를 위치 기반으로 붙인다 (예: m.5.1.0 = Phase E > 두 번째 Subsystem > 첫 Task)
function assignIds(n: MissionNode, id: string): MissionNode {
  return { ...n, id, children: n.children?.map((c, i) => assignIds(c, `${id}.${i}`)) }
}

// 카드가 있는 Subsystem만 그 Phase에 놓는다 (Pre-A = SYS / A~E = 7개 / F = SYS, PAY)
const missionData: MissionNode = {
  id: '',
  level: 'mission',
  title: 'ACRUX-II',
  children: PHASES.map(([code, title]) => ({
    id: '',
    level: 'phase',
    code,
    title,
    // Subsystem(팀)은 TEAMS 순서로 놓는다
    children: TEAMS.flatMap(({ code: sub, name: subTitle }) => {
      const cards = PM_CARDS.filter((c) => c.phase === code && c.sub === sub)
      if (!cards.length) return []
      return [
        {
          id: '',
          level: 'subsystem',
          code: sub,
          title: subTitle,
          manual: MANUAL_AT[`${code}/${sub}`],
          children: cards.map((c) => ({
            id: '',
            level: 'task',
            code: cardCode(c.id),
            title: c.short,
            detail: `${c.id} ${c.title}`,
            notebook: NOTEBOOK_AT[c.id],
            children: c.steps.map(([short, full], i) => ({
              id: '',
              level: 'subtask',
              title: short,
              detail: full,
              notebook: NOTEBOOK_AT[`${c.id}.${i + 1}`],
            })),
          })),
        } satisfies MissionNode,
      ]
    }),
  })),
}

export function getMissionTree(): MissionNode {
  return assignIds(missionData, 'm')
}
