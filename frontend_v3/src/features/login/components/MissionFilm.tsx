import { useEffect, useRef } from 'react'
import { TEAMS, teamColor } from '../../feature_a/teams'
import './missionFilm.css'

// 로그인 화면 가운데의 영상: 미션 트리가 이어져 1U 위성이 되고, 그 1U에서 다음 미션 트리가 빠져나와 3U 위성을 만든다.
// 영상 파일이 생기면 src를 넘긴다 (그때는 이 그림 대신 영상을 반복 재생한다)
const DURATION = 16000
const HOLD_END = 0.9 // 다 그린 모양을 이때까지 두었다가 사라지고 처음부터

type Pt = readonly [number, number]

// 등각 투영. (ox, oy) = 바닥 뒤 꼭짓점, s = 한 칸(1U)의 변
const projector = (ox: number, oy: number, s: number) => (x: number, y: number, z: number): Pt => [
  ox + (x - y) * s * 0.866,
  oy + (x + y) * s * 0.5 - z * s,
]
type Iso = ReturnType<typeof projector>

const line = (a: Pt, b: Pt) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`
const poly = (pts: Pt[]) => `M${pts.map((p) => p.join(' ')).join('L')}Z`
// z 높이의 수평 사각형 (i = 안쪽으로 들인 정도: 0 = 외곽, 0.12 = 안쪽 보드)
const level = (iso: Iso, z: number, i = 0) => poly([iso(1 - i, 1 - i, z), iso(1 - i, i, z), iso(i, i, z), iso(i, 1 - i, z)])

interface Stroke {
  d: string
  from: number
  to: number
  kind: 'trunk' | 'branch' | 'rail' | 'edge' | 'hidden' | 'panel' | 'board'
  color?: string
}

// 위성 한 칸(n번째, 0부터): 세로 레일 → 윗면 → 안쪽 보드 → 옆판의 창. 참고: CubeSat 분해도의 레일 프레임 · 옆판 · 보드 스택
function unit(iso: Iso, n: number, at: number, step: number, boards: boolean): Stroke[] {
  const z = n
  const corners: [number, number][] = [[1, 1], [1, 0], [0, 1], [0, 0]]
  const win = (face: 'x' | 'y', a: number, b: number) => {
    // 앞 두 면(x = 1, y = 1)의 창: 면 안쪽으로 들인 사각형
    const p = (u: number, w: number) => (face === 'x' ? iso(1, u, z + w) : iso(u, 1, z + w))
    return poly([p(a, 0.18), p(b, 0.18), p(b, 0.82), p(a, 0.82)])
  }
  return [
    ...corners.map(([x, y], i) => ({
      d: line(iso(x, y, z), iso(x, y, z + 1)),
      from: at + i * step * 0.15,
      to: at + step + i * step * 0.15,
      kind: (i === 3 ? 'hidden' : 'rail') as Stroke['kind'], // 뒤 레일은 가려진 선처럼 옅게
    })),
    { d: level(iso, z + 1), from: at + step, to: at + step * 2, kind: 'edge' },
    ...(boards
      ? [0.28, 0.5, 0.72].map((h, i) => ({ d: level(iso, z + h, 0.12), from: at + step * (2 + i * 0.3), to: at + step * (2.6 + i * 0.3), kind: 'board' as const }))
      : []),
    { d: win('x', 0.18, 0.46) + win('x', 0.54, 0.82), from: at + step * 2.4, to: at + step * 3.2, kind: 'panel' },
    { d: win('y', 0.18, 0.46) + win('y', 0.54, 0.82), from: at + step * 2.4, to: at + step * 3.2, kind: 'panel' },
  ]
}

// 미션 트리 한 그루: Pre-A → F 줄기 + Phase마다 내려오는 팀 가지 (펼쳐 보기와 같은 둥근 ㄴ자, 팀 색)
interface Tree {
  stations: number[]
  y: number
  r: number
  reach: number // 가지 길이
}

function branches(t: Tree, from: number, span: number): Stroke[] {
  return t.stations.slice(1, 6).map((x, i) => ({
    d: `M${x} ${t.y + t.r}V${t.y + t.r + t.reach}q0 12 12 12H${x + t.reach * 2}`,
    from: from + (span * i) / 5,
    to: from + (span * i) / 5 + 0.05,
    kind: 'branch' as const,
    color: teamColor(TEAMS[i + 1].code),
  }))
}

const PHASES = ['Pre-A', 'A', 'B', 'C', 'D', 'E', 'F']

// 1U: 첫 미션 트리가 만든다
const ONE = projector(900, 570, 120)
const TREE1: Tree = { stations: PHASES.map((_, i) => 230 + i * 92), y: 760, r: 16, reach: 26 }
const ONE_FRONT = ONE(1, 1, 0)

// 3U: 1U의 오른쪽 아래 꼭짓점에서 빠져나온 두 번째 미션 트리가 만든다
const THREE = projector(1420, 520, 100)
const TREE2: Tree = { stations: PHASES.map((_, i) => 1084 + i * 41), y: 700, r: 12, reach: 16 }
const ONE_OUT = ONE(1, 0, 0)
const THREE_FRONT = THREE(1, 1, 0)

const STROKES: Stroke[] = [
  // 1. 첫 미션 트리 → 1U
  { d: `M${TREE1.stations[0]} ${TREE1.y}H${ONE_FRONT[0] - 40}`, from: 0.02, to: 0.16, kind: 'trunk' },
  ...branches(TREE1, 0.05, 0.1),
  { d: `M${ONE_FRONT[0] - 40} ${TREE1.y}q40 0 40 -40V${ONE_FRONT[1]}`, from: 0.16, to: 0.19, kind: 'trunk' },
  { d: level(ONE, 0), from: 0.19, to: 0.23, kind: 'edge' },
  ...unit(ONE, 0, 0.23, 0.045, true),

  // 2. 1U에서 다음 미션 트리가 빠져나온다 → 3U (3U는 칸이 많아 안쪽 보드는 생략: 프레임 · 옆판만)
  {
    d: `M${ONE_OUT[0]} ${ONE_OUT[1]}h20q20 0 20 20V${TREE2.y - 20}q0 20 20 20H${THREE_FRONT[0] - 40}`,
    from: 0.47,
    to: 0.58,
    kind: 'trunk',
  },
  ...branches(TREE2, 0.5, 0.07),
  { d: `M${THREE_FRONT[0] - 40} ${TREE2.y}q40 0 40 -40V${THREE_FRONT[1]}`, from: 0.58, to: 0.6, kind: 'trunk' },
  { d: level(THREE, 0), from: 0.6, to: 0.63, kind: 'edge' },
  ...unit(THREE, 0, 0.63, 0.02, false),
  ...unit(THREE, 1, 0.68, 0.02, false),
  ...unit(THREE, 2, 0.73, 0.02, false),
]

// Phase 정거장: 줄기가 지나갈 때 하나씩 켜진다 [트리, 켜지기 시작, 줄기가 다 지나가는 때]
const STATIONS: [Tree, number, number][] = [
  [TREE1, 0.02, 0.15],
  [TREE2, 0.5, 0.57],
]

// 단계 표시: 다 그린 칸의 윗면 위에
const LABELS = [
  { text: '1U', at: ONE(0, 0, 1), from: 0.44 },
  { text: '3U', at: THREE(0, 0, 3), from: 0.8 },
]

function MissionFilm({ src }: { src?: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg || src) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return // 움직임을 줄이면 다 그린 모양만
    const timing = { duration: DURATION, iterations: Infinity }
    const anims = [
      ...[...svg.querySelectorAll<SVGPathElement>('[data-from]')].map((el) => {
        const from = Number(el.dataset.from)
        const to = Number(el.dataset.to)
        return el.animate(
          [
            { strokeDashoffset: 1, offset: 0 },
            { strokeDashoffset: 1, offset: from },
            { strokeDashoffset: 0, offset: to, easing: 'ease-out' },
            { strokeDashoffset: 0, offset: 1 },
          ],
          timing,
        )
      }),
      ...[...svg.querySelectorAll<SVGElement>('[data-pop]')].map((el) => {
        const from = Number(el.dataset.pop)
        return el.animate(
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: from },
            { opacity: 1, offset: from + 0.015 },
            { opacity: 1, offset: 1 },
          ],
          timing,
        )
      }),
      // 한 바퀴 끝: 다 그린 모양이 사라지고 처음부터
      svg.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.02 },
          { opacity: 1, offset: HOLD_END },
          { opacity: 0, offset: 0.98 },
          { opacity: 0, offset: 1 },
        ],
        timing,
      ),
    ]
    return () => anims.forEach((a) => a.cancel())
  }, [src])

  if (src) return <video className="film" src={src} autoPlay muted loop playsInline aria-hidden="true" />

  return (
    // 그림이 있는 자리만 잘라 보고(viewBox), 패널 비율이 어떻든 통째로 들어오게(meet) 오른쪽 아래에 붙인다
    <svg ref={ref} className="film" viewBox="200 130 1330 700" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      {STROKES.map((s, i) => (
        <path
          key={i}
          className={`film-${s.kind}`}
          d={s.d}
          pathLength={1}
          data-from={s.from}
          data-to={s.to}
          style={s.color ? { stroke: s.color } : undefined}
        />
      ))}
      {STATIONS.map(([t, from, to], k) =>
        PHASES.map((code, i) => (
          <g key={`${k}-${code}`} className="film-station" data-pop={from + ((to - from) * i) / 6}>
            <circle cx={t.stations[i]} cy={t.y} r={t.r} />
            <text x={t.stations[i]} y={t.y} dy="0.35em" data-station={code} data-small={k === 1 || undefined}>
              {code}
            </text>
          </g>
        )),
      )}
      {LABELS.map((l) => (
        <text key={l.text} className="film-label" x={l.at[0]} y={l.at[1] - 34} data-pop={l.from}>
          {l.text}
        </text>
      ))}
    </svg>
  )
}

export default MissionFilm
