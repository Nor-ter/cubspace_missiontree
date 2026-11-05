import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { MissionNode } from '../types'
import type { Tab } from '../hooks/useRoute'
import { cardId, cardTitle, nextNotebook, notebooksOf, shortLabel } from '../tree'
import { Balloon, Icon } from './Drawing'
import Viewer from './Viewer'
import './workshopPanel.css'

// JupyterLite 빌드 결과(public/jupyter/) 안의 주소
const notebookViewUrl = (path: string) => `/jupyter/notebooks/index.html?path=${encodeURIComponent(path)}`
const notebookFileUrl = (path: string) => `/jupyter/files/${path}`

interface Props {
  phase: MissionNode
  team: MissionNode
  workshop: MissionNode
  parents: Map<string, MissionNode>
  tab: Tab
  notebookKey?: string
  full: boolean
  elsewhere: { phase: string; team: string; card: string; label: string }[] // 노트북이 있는 다른 Workshop
  onTab: (tab: Tab, notebook?: string) => void
  onGo: (phase: string, card: string) => void
  onToggleFull: () => void
  onClose: () => void
}

// 실습 순서 안내 (안내만 하고, 순서를 강제하지는 않는다)
function guideFor(node: MissionNode, parents: Map<string, MissionNode>) {
  if (node.level === 'task') {
    const next = (node.children ?? []).filter((c) => c.notebook)
    if (!next.length) return 'Run the finished code from top to bottom and follow along.'
    const names = next.map((c) => `${shortLabel(c, parents)} ${c.title}`).join(' and ')
    return `Run the finished code from top to bottom and follow along. Then build it yourself in ${names}.`
  }
  const ws = parents.get(node.id)
  if (!ws?.notebook) return 'Fill in the blanks and run the check cells.'
  return `Fill in the blanks and run the check cells. If you get stuck, go back through ${shortLabel(ws, parents)} ${ws.title}.`
}

// 옆 패널: Workshop의 Task 목록, Technical Manual, 실습 노트북
function WorkshopPanel(props: Props) {
  const { phase, team, workshop, parents, tab, notebookKey, full, elsewhere, onTab, onGo, onToggleFull, onClose } = props
  const tasks = workshop.children ?? []
  const notebooks = notebooksOf(workshop)
  const label = (n: MissionNode) => shortLabel(n, parents)
  const current = notebooks.find((n) => label(n) === notebookKey) ?? notebooks[0]
  // 노트북이 없을 때 안내할 곳: 같은 팀의 노트북만 (다른 팀의 것은 이 Workshop과 관련이 없다)
  const related = elsewhere.filter((e) => e.team === team.code)
  const next = current && nextNotebook(current, parents)

  // 배우고(매뉴얼 → 노트북) 해 본다(Task) 순서
  const tabs: { id: Tab; name: string; count?: number; empty: boolean }[] = [
    { id: 'manual', name: 'Manual', empty: !team.manual },
    { id: 'notebook', name: 'Notebook', count: notebooks.length || undefined, empty: !notebooks.length },
    { id: 'tasks', name: 'Tasks', count: tasks.length, empty: false },
  ]

  return (
    <aside className={full ? 'panel full' : 'panel'} aria-label={`Workshop ${workshop.code} ${workshop.title}`}>
      <header className="panel-head">
        <p className="panel-crumb">
          Phase {phase.code}
          <Icon name="right" />
          <Balloon code={team.code ?? ''} />
          {team.title}
        </p>
        <div className="panel-actions">
          <button
            type="button"
            className="btn icon-only"
            aria-label={full ? 'Show the drawing beside' : 'Widen to full screen'}
            title={full ? 'Show the drawing beside' : 'Widen to full screen'}
            onClick={onToggleFull}
          >
            <Icon name={full ? 'shrink' : 'expand'} />
          </button>
          <button type="button" className="btn icon-only" aria-label="Close" title="Close (Esc)" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <h2 className="panel-title">
          <span className="panel-code">{workshop.code}</span> {workshop.title}
        </h2>
        <p className="panel-full">
          {cardTitle(workshop)} <span className="panel-card">{cardId(workshop)}</span>
        </p>
      </header>

      <div className="tabs" role="tablist" aria-label="Workshop material">
        {/* 배우는 순서대로 이어진 한 줄의 단계: |Manual > Notebook > Tasks > — 화살표가 다음 탭에 맞물린다 */}
        {tabs.map((t, i) => (
          <Fragment key={t.id}>
            <button
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="panel-body"
              className="tab"
              onClick={() => onTab(t.id)}
            >
              {t.name}
              {t.count !== undefined && <span className="tab-count">{t.count}</span>}
              {t.empty && <span className="slot" aria-label="not written yet" />}
              {/* 오른쪽 끝 화살표 (다음 탭과의 경계, 마지막은 막대의 끝): 끊김 없는 선. 양옆 중 하나가 지금 단계면 먹색 */}
              <svg
                className="tab-tip"
                data-active={tab === t.id || tab === tabs[i + 1]?.id || undefined}
                viewBox="0 0 13 38"
                aria-hidden="true"
              >
                <path d="M0.75 0 L12.2 19 L0.75 38" />
              </svg>
            </button>
          </Fragment>
        ))}
      </div>

      <div className="panel-body" id="panel-body" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'tasks' && (
          <ol className="tasks">
            {tasks.map((t) => (
              <li key={t.id} className="task">
                <span className="task-code">{label(t)}</span>
                <div className="task-text">
                  <p className="task-name">{t.title}</p>
                  <p className="task-full">{t.detail}</p>
                </div>
                {t.notebook && (
                  <button type="button" className="btn" onClick={() => onTab('notebook', label(t))}>
                    Open notebook
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}

        {tab === 'manual' &&
          (team.manual ? (
            <div className="resource">
              <div className="resource-bar">
                <p className="resource-name">{team.manual.title}</p>
                <a className="btn" href={team.manual.url} target="_blank" rel="noreferrer">
                  <Icon name="external" />
                  New tab
                </a>
              </div>
              <Viewer kind="pdf" src={team.manual.url} checkUrls={[team.manual.url]} title={team.manual.title} />
            </div>
          ) : (
            <Empty
              title={`No technical manual for ${team.code} in Phase ${phase.code} yet`}
              text="Manuals belong to a team in each phase. When one is added, it opens here beside the drawing."
            />
          ))}

        {tab === 'notebook' &&
          (current?.notebook ? (
            <div className="resource">
              <div className="resource-bar">
                {notebooks.length > 1 ? (
                  <div className="nb-switch" role="group" aria-label="Notebooks in this workshop">
                    {notebooks.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        aria-pressed={n === current}
                        onClick={() => onTab('notebook', label(n))}
                      >
                        <span className="nb-code">{label(n)}</span> {n.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="resource-name">
                    {label(current)} {current.title}
                  </p>
                )}
                <a
                  className="btn"
                  href={notebookFileUrl(current.notebook.path)}
                  download={current.notebook.path.split('/').pop()}
                >
                  <Icon name="download" />
                  .ipynb
                </a>
              </div>
              <p className="guide">
                {guideFor(current, parents)}
                {next && (
                  <button type="button" className="guide-next" onClick={() => onTab('notebook', label(next))}>
                    Next: {label(next)} {next.title}
                    <Icon name="right" />
                  </button>
                )}
              </p>
              <Viewer
                kind="notebook"
                src={notebookViewUrl(current.notebook.path)}
                checkUrls={['/jupyter/jupyter-lite.json', notebookFileUrl(current.notebook.path)]}
                title={`${label(current)} ${current.title} notebook`}
              />
            </div>
          ) : (
            <Empty
              title={`No lab notebook for ${workshop.code} yet`}
              text={
                related.length
                  ? `Lab notebooks run inside the browser, so there is nothing to install. These ${team.code} workshops already have one:`
                  : 'Lab notebooks run inside the browser, so there is nothing to install.'
              }
            >
              {related.length > 0 && (
                <ul className="elsewhere">
                  {related.map((e) => (
                    <li key={e.card}>
                      <button type="button" className="btn" onClick={() => onGo(e.phase, e.card)}>
                        {e.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Empty>
          ))}
      </div>
    </aside>
  )
}

function Empty({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-slot" aria-hidden="true" />
      <p className="empty-title">{title}</p>
      <p className="empty-text">{text}</p>
      {children}
    </div>
  )
}

export default WorkshopPanel
