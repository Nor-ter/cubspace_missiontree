import './cadSpace.css'

// 배경의 우주: 사진이 아니라 CAD로 작도한 우주. 모눈 위, 내용 뒤에 아주 옅게 고정된다.
// 화면 비율이 달라도 커지거나 잘리지 않도록, 한 장으로 늘리지 않고 묶음마다 화면 모서리에 붙인다 (cadSpace.css):
//   지구 묶음 = 오른쪽 아래 모서리. 지구는 모서리를 중심으로 한 원이라 4분의 1만 보인다. 보이는 면은 호주:
//              해안선 · 경위선을 정사영(지구본을 멀리서 본 모양)으로 투영해 CAD 선으로 그린다.
//              같은 중심의 궤도(점선) 위에 위성 노드, 치수선 R(반지름) · h(고도), 멜버른의 MSP 표시.
//   달       = 왼쪽 위 모서리. 작은 원 + 중심 표시 + 지시선 주석.
//   별       = 화면 전체에 % 위치로 흩뿌린 + 점 표시 (크기는 화면과 상관없이 같다).
//   전이 궤도 = 화면 전체를 가로지르는 일점쇄선 타원 (선 굵기 · 점선 간격은 화면과 상관없이 같다).

// ── 지구 묶음: 560 × 520 도면, 지구 중심은 오른쪽 아래 모서리 ──
const W = 560
const H = 520
const E = { x: W, y: H, r: 380 }
const ORBIT = 430
const rad = (d: number) => (d * Math.PI) / 180
const onCircle = (r: number, deg: number) => ({ x: E.x + r * Math.cos(rad(deg)), y: E.y + r * Math.sin(rad(deg)) })
const SAT = onCircle(ORBIT, -112)
const R_END = onCircle(E.r, -168)

// 정사영: 투영 중심을 호주 남동쪽 바다(경도 166°, 위도 -61°)에 두면, 호주가 보이는 4분의 1 원의 가운데(모서리에서 45° 방향)에 온다
const LON0 = rad(166)
const LAT0 = rad(-61)
function project(lon: number, lat: number) {
  const l = rad(lon) - LON0
  const p = rad(lat)
  const front = Math.sin(LAT0) * Math.sin(p) + Math.cos(LAT0) * Math.cos(p) * Math.cos(l) > 0
  const x = Math.cos(p) * Math.sin(l)
  const y = Math.cos(LAT0) * Math.sin(p) - Math.sin(LAT0) * Math.cos(p) * Math.cos(l)
  return { x: E.x + E.r * x, y: E.y - E.r * y, front }
}
const toPath = (pts: [number, number][], close = false) =>
  pts
    .map(([lon, lat], i) => {
      const q = project(lon, lat)
      return `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`
    })
    .join('') + (close ? 'Z' : '')

// 호주 해안선 (경도, 위도): 주요 곶 · 만만 남긴 단순화
const AUSTRALIA: [number, number][] = [
  [113.6, -22.0], [114.1, -26.0], [115.0, -29.5], [115.7, -32.0], [115.0, -33.6], [115.1, -34.4], [117.9, -35.1],
  [121.9, -33.9], [124.0, -32.9], [126.2, -32.3], [129.0, -31.7], [131.1, -31.5], [134.2, -32.6], [135.6, -34.9],
  [136.8, -33.6], [137.8, -32.8], [137.6, -35.0], [138.5, -35.0], [138.0, -35.7], [139.7, -36.9], [140.9, -38.1],
  [143.5, -38.8], [144.9, -37.9], [146.4, -39.1], [148.0, -37.8], [150.0, -37.5], [150.9, -34.4], [151.2, -33.9],
  [152.5, -32.4], [153.6, -28.6], [153.1, -27.0], [153.2, -25.0], [150.8, -22.6], [149.2, -21.0], [146.8, -19.3],
  [145.4, -16.4], [145.3, -14.9], [143.5, -14.0], [142.5, -10.7], [141.6, -12.6], [141.6, -15.0], [141.3, -17.0],
  [140.0, -17.7], [137.7, -16.2], [135.9, -15.0], [136.8, -12.3], [135.0, -12.0], [132.6, -11.5], [130.8, -12.4],
  [129.5, -14.9], [128.1, -15.0], [126.8, -13.9], [125.0, -14.6], [123.6, -16.4], [122.2, -17.9], [120.0, -19.8],
  [118.6, -20.3], [116.7, -20.6], [114.6, -21.8],
]
const TASMANIA: [number, number][] = [
  [144.6, -40.7], [148.3, -40.9], [148.0, -42.9], [147.0, -43.6], [145.5, -42.9], [144.7, -41.5],
]
const LAND = toPath(AUSTRALIA, true) + toPath(TASMANIA, true)
const AU_LABEL = project(121, -21)
// MSP (Melbourne Space Program): 빅토리아주 멜버른
const MSP = project(144.96, -37.81)

// 경위선: 경선 · 위선 15°마다. 보이는 반구(front)에 있는 구간만 잇는다
function graticule() {
  const lines: string[] = []
  const trace = (pts: [number, number][]) => {
    let d = ''
    let pen = false
    for (const [lon, lat] of pts) {
      const q = project(lon, lat)
      if (!q.front) {
        pen = false
        continue
      }
      d += `${pen ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`
      pen = true
    }
    if (d) lines.push(d)
  }
  for (let lon = 0; lon < 360; lon += 15) trace(Array.from({ length: 61 }, (_, i): [number, number] => [lon, -90 + i * 3]))
  for (let lat = -75; lat <= 15; lat += 15) trace(Array.from({ length: 181 }, (_, i): [number, number] => [i * 2, lat]))
  return lines.join('')
}
const GRATICULE = graticule()

// ── 별: 화면 전체에 % 위치로. 매번 같은 자리에 찍히도록 고정된 씨앗으로 만든다 ──
const STARS = (() => {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const stars = Array.from({ length: 90 }, () => ({ x: rand() * 100, y: 8 + rand() * 92, s: 2 + rand() * 2.5, o: 0.25 + rand() * 0.6 }))
  // 오른쪽 아래(지구 자리)에는 찍지 않는다
  return stars.filter((st) => !(st.x > 62 && st.y > 50))
})()

function CadSpace() {
  return (
    <div className="cad-space" aria-hidden="true">
      {/* 하늘: 별 + 전이 궤도 */}
      <svg className="cs-sky">
        {STARS.map((st, i) => (
          <svg key={i} x={`${st.x}%`} y={`${st.y}%`} overflow="visible" opacity={st.o}>
            <path className="cs-star" d={`M${-st.s} 0h${st.s * 2}M0 ${-st.s}v${st.s * 2}`} />
          </svg>
        ))}
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" width="100%" height="100%" overflow="visible">
          <ellipse
            className="cs-faint cs-center"
            cx="900"
            cy="300"
            rx="640"
            ry="230"
            transform="rotate(-14 900 300)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </svg>

      {/* 지구 묶음: 오른쪽 아래 모서리 */}
      <svg className="cs-earth" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="cs-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 10 5 0 9z" />
          </marker>
        </defs>

        {/* 지구: 속은 비워 모눈이 보이게 한다 */}
        <circle className="cs-globe" cx={E.x} cy={E.y} r={E.r} />
        <path className="cs-faint cs-dash" d={GRATICULE} />
        {/* 호주 (+ 태즈메이니아) 해안선 */}
        <path className="cs-land" d={LAND} />
        <text className="cs-label" x={AU_LABEL.x} y={AU_LABEL.y}>
          AUSTRALIA
        </text>

        {/* MSP: CAD 목표 표시(원 + 십자선) + 지시선 주석. 배경에서 "여기"를 가리키므로 다른 선보다 진하다 */}
        <g className="cs-msp">
          <circle cx={MSP.x} cy={MSP.y} r="5" />
          <path d={`M${MSP.x - 11} ${MSP.y}h22M${MSP.x} ${MSP.y - 11}v22`} />
          <path d={`M${MSP.x - 3} ${MSP.y + 5}l-40 70h-112`} />
          <text x={MSP.x - 155} y={MSP.y + 69}>
            MSP · MELBOURNE
          </text>
        </g>

        {/* 궤도 (LEO) */}
        <circle className="cs-line cs-dash" cx={E.x} cy={E.y} r={ORBIT} />

        {/* 치수: 고도 h (지표 ~ 궤도), 위쪽 반지름 방향. CAD 건축식 빗금 끝 */}
        <g className="cs-dim">
          <path d={`M${E.x - 24} ${E.y - E.r}V${E.y - ORBIT}`} />
          <path d={`M${E.x - 29} ${E.y - E.r + 5}l10 -10M${E.x - 29} ${E.y - ORBIT + 5}l10 -10`} />
          <text x={E.x - 34} y={E.y - (E.r + ORBIT) / 2 + 4} textAnchor="end">
            h 500 km
          </text>
        </g>

        {/* 치수: 지구 반지름 R (왼쪽 아래 방향) */}
        <g className="cs-dim">
          <path d={`M${E.x} ${E.y}L${R_END.x} ${R_END.y}`} markerEnd="url(#cs-arrow)" />
          <text x={R_END.x + 30} y={R_END.y - 6} transform={`rotate(12 ${R_END.x + 30} ${R_END.y - 6})`}>
            R 6,371 km
          </text>
        </g>

        {/* 위성: 궤도 위의 노드 + 지시선 주석 */}
        <g className="cs-dim">
          <rect className="cs-node" x={SAT.x - 4} y={SAT.y - 4} width="8" height="8" />
          <path d={`M${SAT.x - 4} ${SAT.y - 4}l-36 -36h-122`} />
          <text x={SAT.x - 162} y={SAT.y - 46}>
            ACRUX-II · LEO
          </text>
        </g>
      </svg>

      {/* 달: 왼쪽 아래, 미니맵 위 (위쪽은 펼친 Phase 이름과 겹친다) */}
      <svg className="cs-moon" viewBox="0 0 300 140">
        <circle className="cs-line" cx="70" cy="60" r="36" />
        <path className="cs-faint cs-center" d="M22 60h96M70 12v96" />
        <path className="cs-line" d="M64 60h12M70 54v12" />
        <g className="cs-dim">
          <path d="M95 85l26 26h86" />
          <text x="125" y="105">
            MOON · R 1,737 km
          </text>
        </g>
      </svg>
    </div>
  )
}

export default CadSpace
