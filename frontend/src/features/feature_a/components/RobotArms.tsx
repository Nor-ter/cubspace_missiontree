import type { ArmGroup, ArrayGroup } from '../layout'

// 가지 = 직각으로 꺾이는 로봇 암. 패널에 열린 자료까지의 경로에 신호가 흐른다
interface Props {
  arms: ArmGroup[]
  arrays: ArrayGroup[]
  openPath: Set<string>
  isDim: (id: string) => boolean // 팀 강조 중 어둡게 할 노드
}

function RobotArms({ arms, arrays, openPath, isDim }: Props) {
  return (
    <g>
      {/* Subsystem 배열: Phase에서 나온 암 하나가 태양전지판 배열 틀에 붙는다 */}
      {arrays.map(({ parent, frame, children }) => {
        const x1 = parent.x + parent.w / 2
        const d = `M${x1},${parent.y} H${frame.x}`
        return (
          <g
            key={`array-${parent.node.id}`}
            data-arm={`array-${parent.node.id}`}
            data-sig={`${x1},${parent.y},${frame.x},${frame.y},${frame.w},${frame.h}`}
            className={children.every((c) => isDim(c.node.id)) ? 'team-dim' : undefined}
          >
            <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx={6} className="array-frame" />
            <line x1={x1} y1={parent.y} x2={frame.x} y2={parent.y} className="arm" />
            <circle cx={frame.x} cy={parent.y} r={4.5} className="joint" />
            {children.some((c) => openPath.has(c.node.id)) && <path d={d} className="pulse open" />}
          </g>
        )
      })}
      {arms.map(({ parent, children }) => {
        const x1 = parent.x + parent.w / 2
        const busX = x1 + 32
        const ys = children.map((c) => c.y)
        return (
          <g key={parent.node.id} data-arm={parent.node.id} data-sig={`${x1},${parent.y},${ys.join(',')}`}>
            <line x1={x1} y1={parent.y} x2={busX} y2={parent.y} className="arm" />
            <line x1={busX} y1={Math.min(...ys, parent.y)} x2={busX} y2={Math.max(...ys, parent.y)} className="arm" />
            {children.map((c) => (
              <line
                key={c.node.id}
                x1={busX}
                y1={c.y}
                x2={c.x - c.w / 2}
                y2={c.y}
                className={isDim(c.node.id) ? 'arm team-dim' : 'arm'}
              />
            ))}
            <circle cx={busX} cy={parent.y} r={4.5} className="joint" />
            {children
              .filter((c) => openPath.has(c.node.id))
              .map((c) => (
                <path
                  key={`open-${c.node.id}`}
                  d={`M${x1},${parent.y} H${busX} V${c.y} H${c.x - c.w / 2}`}
                  className="pulse open"
                />
              ))}
          </g>
        )
      })}
    </g>
  )
}

export default RobotArms
