import type { PlacedNode } from '../layout'
import { toggleProps } from '../interaction'
import CollapsedTab from './CollapsedTab'

interface Props {
  p: PlacedNode
  onOpenPath: boolean // 패널에 열린 자료가 이 Phase 아래에 있는가
  dimmed: boolean // 팀 강조 중인데 고른 팀이 이 Phase에 없다
  arriveKey?: number // 값이 있으면 '도착' 애니메이션을 재생한다 (바뀔 때마다 처음부터)
  onToggle: (id: string) => void
}

const LINE_CHARS = 24 // 15px 제목이 모듈 폭에 들어가는 대략의 글자 수

// 긴 Phase 이름을 단어 단위로 최대 두 줄로 나눈다
function wrapTitle(title: string) {
  const lines = ['']
  for (const word of title.split(' ')) {
    const last = lines[lines.length - 1]
    if (last && (last + ' ' + word).length > LINE_CHARS && lines.length < 2) lines.push(word)
    else lines[lines.length - 1] = last ? `${last} ${word}` : word
  }
  return lines
}

// Phase = 트러스에 도킹된 팔각 모듈.
function PhaseModule({ p, onOpenPath, dimmed, arriveKey, onToggle }: Props) {
  const c = 10
  const L = p.x - p.w / 2
  const T = p.y - p.h / 2
  const R = L + p.w
  const B = T + p.h
  const lines = wrapTitle(p.node.title)
  const octagon = (d: number) =>
    `${L + c - d * 0.4},${T - d} ${R - c + d * 0.4},${T - d} ${R + d},${T + c - d * 0.4} ${R + d},${B - c + d * 0.4} ${R - c + d * 0.4},${B + d} ${L + c - d * 0.4},${B + d} ${L - d},${B - c + d * 0.4} ${L - d},${T + c - d * 0.4}`
  const clipId = `arrive-clip-${p.node.id.replace(/\./g, '-')}`
  const toggle = toggleProps(p, onToggle)
  return (
    <g data-node-id={p.node.id}>
      {/* 불투명 받침: 팀 강조로 모듈이 어두워져도 뒤의 트러스가 비치지 않게 */}
      <polygon points={octagon(0)} className="module-backing" />
      <g {...toggle} className={[toggle.className, dimmed && 'team-dim'].filter(Boolean).join(' ') || undefined}>
        {onOpenPath && (
          // 열린 자료의 경로: 모듈 바깥에 앰버 링
          <polygon
            points={`${L + c - 1},${T - 4} ${R - c + 1},${T - 4} ${R + 4},${T + c - 1} ${R + 4},${B - c + 1} ${R - c + 1},${B + 4} ${L + c - 1},${B + 4} ${L - 4},${B - c + 1} ${L - 4},${T + c - 1}`}
            className="open-ring"
          />
        )}
        <polygon
          points={`${L + c},${T} ${R - c},${T} ${R},${T + c} ${R},${B - c} ${R - c},${B} ${L + c},${B} ${L},${B - c} ${L},${T + c}`}
          className="frame module"
          strokeWidth={1.2}
        />
        <rect x={L + 10} y={T + 10} width={4} height={p.h - 20} className="module-bar" />
        <text x={L + 24} y={p.y - 6 - (lines.length - 1) * 9} className="lbl node-label">
          {p.label}
        </text>
        <text x={L + 24} y={p.y + 15 - (lines.length - 1) * 9} className="ttl phase">
          {lines.map((line, i) => (
            <tspan key={i} x={L + 24} dy={i === 0 ? 0 : 19}>
              {line}
            </tspan>
          ))}
        </text>
        {arriveKey !== undefined && (
          // 도킹 포착(lock-on): 바깥 링이 모듈 테두리로 좁혀 들어오고, 빛 한 줄기가 모듈을 훑는다
          <g key={arriveKey} className="arrive" aria-hidden="true">
            <clipPath id={clipId}>
              <polygon points={octagon(0)} />
            </clipPath>
            <rect
              x={L - 70}
              y={T}
              width={70}
              height={p.h}
              className="arrive-sweep"
              clipPath={`url(#${clipId})`}
              style={{ ['--sweep' as string]: `${p.w + 70}px` }}
            />
            <polygon points={octagon(4)} className="arrive-ring" />
          </g>
        )}
        <CollapsedTab p={p} />
      </g>
    </g>
  )
}

export default PhaseModule
