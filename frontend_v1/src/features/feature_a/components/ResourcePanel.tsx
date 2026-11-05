import { useEffect, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent } from 'react'
import type { MissionNode } from '../types'
import type { ResourceKind } from './PanelButton'
import ResourceViewer from './ResourceViewer'
import './resourcePanel.css'

export const PANEL_DEFAULT = 560
const PANEL_MIN = 320
const TREE_MIN = 320 // 왼쪽 트리 영역이 최소한 이만큼은 남게 한다
const KEY_STEP = 40

// JupyterLite 빌드 결과(public/jupyter/) 안의 주소
const notebookViewUrl = (path: string) => `/jupyter/notebooks/index.html?path=${encodeURIComponent(path)}`
const notebookFileUrl = (path: string) => `/jupyter/files/${path}`

interface Props {
  subsystem?: MissionNode // 매뉴얼을 가진 Subsystem
  work?: MissionNode // 실습 노트북을 가진 Task / Subtask
  workLabel: string // "TASK A", "A-1"
  guide?: string // 실습 순서 안내
  trail: { id: string; label: string }[] // 트리 위치 (Phase › Subsystem › Task)
  next?: { label: string; onOpen: () => void } // 실습 순서상 다음 노트북
  onReveal: (id: string) => void // 트리에서 그 위치 보여 주기
  tab: ResourceKind
  width: number
  full: boolean
  onTabChange: (tab: ResourceKind) => void
  onWidthChange: (w: number) => void
  onToggleFull: () => void
  onClose: () => void
}

const clamp = (w: number) => Math.min(Math.max(w, PANEL_MIN), window.innerWidth - TREE_MIN)

// 오른쪽 사이드 패널: Subsystem의 Technical Manual(PDF)과 Task/Subtask의 실습 노트북을 탭으로 오간다.
// - 왼쪽 가장자리를 드래그하면 트리/패널 너비가 바뀐다 (더블클릭 = 기본 너비)
// - 전체 화면 버튼으로 화면 전체에 띄운다
// - 두 iframe은 탭을 바꿔도 지우지 않고 숨기기만 한다 (노트북의 Python이 다시 시작되지 않게)
function ResourcePanel(props: Props) {
  const { subsystem, work, workLabel, guide, trail, next, tab, width, full } = props
  const { onTabChange, onWidthChange, onToggleFull, onClose, onReveal } = props
  const [dragging, setDragging] = useState(false)
  const manual = subsystem?.manual
  const notebook = work?.notebook

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (full) onToggleFull()
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full, onToggleFull, onClose])

  useEffect(() => {
    if (!dragging) return
    const stop = () => setDragging(false)
    window.addEventListener('blur', stop)
    return () => window.removeEventListener('blur', stop)
  }, [dragging])

  if (!manual && !notebook) return null
  const showing: ResourceKind = tab === 'notebook' && notebook ? 'notebook' : manual ? 'manual' : 'notebook'

  // 포인터 캡처: 드래그 중 마우스가 iframe 위로 가도 이벤트를 계속 받는다
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) onWidthChange(clamp(window.innerWidth - e.clientX))
  }
  const onPointerUp = () => setDragging(false)
  const onHandleKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowLeft') onWidthChange(clamp(width + KEY_STEP))
    if (e.key === 'ArrowRight') onWidthChange(clamp(width - KEY_STEP))
  }

  const mode = work?.level === 'task' ? 'Follow-along' : 'Practice'
  const title = showing === 'manual' ? manual?.title : `${workLabel} ${work?.title}`
  const subtitle = showing === 'manual' ? `${subsystem?.title} technical manual` : `${mode} notebook`
  const className = ['res-panel', full && 'full', dragging && 'dragging'].filter(Boolean).join(' ')

  return (
    <aside className={className} style={full ? undefined : { width }} aria-label="Resources">
      {!full && (
        <div
          className="resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel (left and right arrow keys)"
          aria-valuenow={width}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={onPointerUp}
          onDoubleClick={() => onWidthChange(clamp(PANEL_DEFAULT))}
          onKeyDown={onHandleKey}
        />
      )}
      <header className="res-head">
        <div className="res-meta">
          <h2>{title}</h2>
          <div className="res-sub">
            <span>{subtitle}</span>
            <nav className="res-trail" aria-label="Location in tree">
              {trail.map((t) => (
                <button key={t.id} type="button" onClick={() => onReveal(t.id)} title="Show in tree">
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="res-head-buttons">
          <button
            type="button"
            className="icon-btn text"
            onClick={onToggleFull}
            title={full ? 'Esc also works' : undefined}
          >
            {full ? 'Back to panel' : 'Full screen'}
          </button>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" title="Close">
            ✕
          </button>
        </div>
      </header>

      {manual && notebook && (
        <div className="res-tabs" role="tablist" aria-label="Resource type">
          <button type="button" role="tab" aria-selected={showing === 'manual'} onClick={() => onTabChange('manual')}>
            Manual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showing === 'notebook'}
            onClick={() => onTabChange('notebook')}
          >
            Notebook
          </button>
        </div>
      )}

      <div className="res-actions">
        {showing === 'manual' && manual && (
          <>
            <a className="primary" href={manual.url} download={manual.url.split('/').pop()}>
              Download
            </a>
            <a href={manual.url} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </>
        )}
        {showing === 'notebook' && notebook && (
          <>
            {next && (
              <button type="button" className="primary" onClick={next.onOpen}>
                Next: {next.label}
                <svg className="next-icon" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M4 2 L8 6 L4 10" />
                </svg>
              </button>
            )}
            <a href={notebookFileUrl(notebook.path)} download={notebook.path.split('/').pop()}>
              Download notebook (.ipynb)
            </a>
            <a href={notebookViewUrl(notebook.path)} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
            <p className="res-note">Your changes aren’t saved. Download the notebook to keep your work.</p>
          </>
        )}
      </div>

      {showing === 'notebook' && (
        <p className="res-guide">{guide}</p>
      )}

      {manual && (
        <ResourceViewer
          key={manual.url}
          kind="pdf"
          src={manual.url}
          checkUrls={[manual.url]}
          title={manual.title}
          hidden={showing !== 'manual'}
          openUrl={manual.url}
          download={{ url: manual.url, name: manual.url.split('/').pop() ?? 'manual.pdf' }}
        />
      )}
      {notebook && (
        <ResourceViewer
          key={notebook.path}
          kind="notebook"
          src={notebookViewUrl(notebook.path)}
          checkUrls={['/jupyter/jupyter-lite.json', notebookFileUrl(notebook.path)]}
          title={`${work?.title} notebook`}
          hidden={showing !== 'notebook'}
          openUrl={notebookViewUrl(notebook.path)}
          download={{ url: notebookFileUrl(notebook.path), name: notebook.path.split('/').pop() ?? 'notebook.ipynb' }}
        />
      )}
    </aside>
  )
}

export default ResourcePanel
