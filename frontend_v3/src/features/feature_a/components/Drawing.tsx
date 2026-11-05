import type { CSSProperties } from 'react'
import { teamColor, teamOn } from '../teams'
import type { Tab } from '../hooks/useRoute'
import './drawing.css'

// 팀 표시: 팀(레이어) 색 견본. 번호는 쓰지 않는다 (순서로 오해할 수 있어서): 팀은 색과 코드(SYS · BOX …)로만 구분한다
export function Balloon({ code, size = 'sm' }: { code: string; size?: 'sm' | 'md' }) {
  return <span className={`balloon ${size}`} style={{ '--c': teamColor(code), '--on': teamOn(code) } as CSSProperties} aria-hidden="true" />
}

// 자료 칸 두 개: 왼쪽 = Technical Manual, 오른쪽 = Workshop(실습 노트북). 없으면 빈 칸(점선).
// onOpen이 있으면 칸마다 단추가 되어 그 자료를 패널에 바로 연다 (빈 칸은 "아직 없음" 안내로 열린다)
export function Slots({
  manual,
  notebook,
  label,
  onOpen,
}: {
  manual: boolean
  notebook: boolean
  label?: string // 단추가 될 때 읽어 줄 카드 이름 (예: "ADCS A2")
  onOpen?: (tab: Extract<Tab, 'manual' | 'workshop'>) => void
}) {
  if (onOpen)
    return (
      <span className="slots slot-buttons">
        <button
          type="button"
          className="slot-btn"
          aria-label={`${label}: technical manual${manual ? '' : ' (not written yet)'}`}
          title={manual ? 'Technical manual' : 'Technical manual: not written yet'}
          onClick={() => onOpen('manual')}
        >
          <span className={manual ? 'slot on' : 'slot'} />
        </button>
        <button
          type="button"
          className="slot-btn"
          aria-label={`${label}: workshop${notebook ? '' : ' (not written yet)'}`}
          title={notebook ? 'Workshop' : 'Workshop: not written yet'}
          onClick={() => onOpen('workshop')}
        >
          <span className={notebook ? 'slot on' : 'slot'} />
        </button>
      </span>
    )
  return (
    <span className="slots" aria-hidden="true">
      <span className={manual ? 'slot on' : 'slot'} />
      <span className={notebook ? 'slot on' : 'slot'} />
    </span>
  )
}

// Phase 단추의 그림 (낮 = 지구, 밤 = 인공위성). 보이는 쪽은 테마 토큰(--station-globe / --station-wings)이 고른다.
// 단추(44 × 44, 상세도 64 × 64)와 같은 좌표에 그리고, 태양전지판은 단추 바깥으로 나온다
export function StationArt() {
  return (
    <svg className="station-art" viewBox="0 0 44 44" aria-hidden="true">
      <g className="globe">
        <path d="M1.5 22h41M5.5 11.5h33M5.5 32.5h33M22 1.5v41" />
        <ellipse cx="22" cy="22" rx="9" ry="20.5" />
        <ellipse cx="22" cy="22" rx="16" ry="20.5" />
      </g>
      <g className="sat">
        {/* 날개는 접혀 있다가 단추에 마우스를 올리면 몸체 쪽에서부터 펼쳐진다 (sheet.css) */}
        <g className="wing left">
          <path className="strut" d="M-3 22h3" />
          <rect className="sat-panel" x="-15" y="13" width="12" height="18" />
          <path className="cells" d="M-9 13v18M-15 19h12M-15 25h12" />
        </g>
        <g className="wing right">
          <path className="strut" d="M44 22h3" />
          <rect className="sat-panel" x="47" y="13" width="12" height="18" />
          <path className="cells" d="M53 13v18M47 19h12M47 25h12" />
        </g>
      </g>
    </svg>
  )
}

type IconName = 'left' | 'right' | 'up' | 'close' | 'expand' | 'shrink' | 'external' | 'download' | 'minus' | 'steps' | 'sheet'

const PATHS: Record<IconName, string> = {
  left: 'M10 3.5 5.5 8l4.5 4.5',
  right: 'M6 3.5 10.5 8 6 12.5',
  up: 'M3.5 10 8 5.5l4.5 4.5',
  close: 'M4 4l8 8M12 4l-8 8',
  expand: 'M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9',
  shrink: 'M13.5 6.5h-4v-4M2.5 9.5h4v4M9.5 6.5l4-4M6.5 9.5l-4 4',
  external: 'M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9.5v4h-9v-9h4',
  download: 'M8 2.5v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11',
  minus: 'M4 8h8',
  // 펼쳐 보기: 한 줄기에서 한 단계씩 들여 나가는 가지
  steps: 'M2.5 3h4M4 3v10M4 8h3.5M4 13h3.5M9.5 8h4M9.5 13h4',
  // 전체 보기: 도면 한 장 (줄기 + 열)
  sheet: 'M2.5 2.5h11v11h-11zM2.5 5.5h11M6.2 5.5v8M9.8 5.5v8',
}

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
