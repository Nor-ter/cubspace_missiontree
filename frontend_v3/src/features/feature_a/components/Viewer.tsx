import { useEffect, useRef, useState } from 'react'
import { Icon } from './Drawing'

type Kind = 'pdf' | 'notebook'
type FailReason = 'missing' | 'network' | 'timeout'

interface Props {
  kind: Kind
  src: string // iframe에 띄울 주소
  checkUrls: string[] // 실제 파일이 있는지 확인할 주소들
  title: string
}

// 처음 한 번은 Python(Pyodide)을 내려받느라 오래 걸릴 수 있어 넉넉히 잡는다
const TIMEOUT_MS: Record<Kind, number> = { pdf: 20000, notebook: 30000 }
const READY_POLL_MS = 400

// 자료(PDF, 노트북)를 iframe으로 띄우면서 로딩 · 오류 상태를 보여 준다.
// "Try again"은 attempt를 올려 안쪽을 통째로 다시 만든다 (상태 초기화가 확실하다).
function Viewer(props: Props) {
  const [attempt, setAttempt] = useState(0)
  return <Attempt key={`${props.src}#${attempt}`} {...props} onRetry={() => setAttempt((a) => a + 1)} />
}

// Vite는 없는 파일을 요청하면 404 대신 앱의 index.html을 돌려준다. 그래서 형식까지 확인한다.
// 큰 PDF를 두 번 받지 않게 머리 정보(HEAD)만 받고, 서버가 HEAD를 못 받으면 GET으로 다시 묻는다.
async function fileExists(url: string) {
  let res = await fetch(url, { method: 'HEAD', cache: 'no-store' })
  if (res.status === 405 || res.status === 501) res = await fetch(url, { cache: 'no-store' })
  const type = res.headers.get('content-type') ?? ''
  return res.ok && !type.includes('text/html')
}

function Attempt({ kind, src, checkUrls, title, onRetry }: Props & { onRetry: () => void }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reason, setReason] = useState<FailReason>('timeout')
  const frameRef = useRef<HTMLIFrameElement>(null)
  // 준비 완료 = (PDF) 파일 확인만 / (노트북) 셀이 그려짐 + 파일 확인.
  // PDF는 브라우저 뷰어가 자체 로딩 표시를 갖고 있고, iframe load 이벤트가 늦거나 오지 않는 브라우저가 있다.
  const progress = useRef({ loaded: kind === 'pdf', checked: false, done: false })

  useEffect(() => {
    const p = progress.current
    // 개발 모드의 StrictMode는 effect를 "실행 → 정리 → 다시 실행"한다. 정리에서 켠 done을 여기서 되돌린다.
    p.done = false
    const finish = (result: 'ready' | FailReason) => {
      if (p.done) return
      if (result === 'ready' && !(p.loaded && p.checked)) return
      p.done = true
      if (result === 'ready') setStatus('ready')
      else {
        setReason(result)
        setStatus('error')
      }
    }

    Promise.all(checkUrls.map(fileExists))
      .then((oks) => {
        if (oks.every(Boolean)) {
          p.checked = true
          finish('ready')
        } else finish('missing')
      })
      .catch(() => finish('network'))

    const timer = window.setTimeout(() => finish('timeout'), TIMEOUT_MS[kind])
    // 노트북: JupyterLite가 셀을 그리면 준비된 것으로 본다 (같은 출처라 iframe 안을 볼 수 있다)
    const poll =
      kind === 'notebook'
        ? window.setInterval(() => {
            if (frameRef.current?.contentDocument?.querySelector('.jp-Notebook .jp-Cell')) {
              p.loaded = true
              finish('ready')
            }
          }, READY_POLL_MS)
        : undefined

    return () => {
      p.done = true
      window.clearTimeout(timer)
      window.clearInterval(poll)
    }
    // 한 번의 시도 동안 한 번만 실행한다 (다시 시도는 컴포넌트를 새로 만든다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const thing = kind === 'pdf' ? 'manual' : 'workshop'

  return (
    <div className="viewer">
      <iframe ref={frameRef} src={src} title={title} data-ready={status === 'ready' || kind === 'pdf' || undefined} />

      {status === 'loading' && (
        <div className="viewer-state" role="status">
          <span className="viewer-bar" aria-hidden="true" />
          <p className="viewer-title">Opening the {thing}</p>
          <p className="viewer-text">
            {kind === 'notebook'
              ? 'The first time, the lab environment takes 10 to 30 seconds to download. After that it opens quickly.'
              : 'Large files can take a moment.'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="viewer-state" role="alert">
          <p className="viewer-title error">
            {reason === 'missing' && `Couldn’t find the ${thing} file`}
            {reason === 'network' && 'Couldn’t reach the server'}
            {reason === 'timeout' && `The ${thing} is taking too long to open`}
          </p>
          <p className="viewer-text">
            {reason === 'missing' &&
              (kind === 'notebook'
                ? 'The lab environment may not be built yet. Run frontend/jupyterlite/build.sh, then try again.'
                : 'The PDF is missing from frontend/public/manuals/.')}
            {reason === 'network' && 'Check your connection, then try again.'}
            {reason === 'timeout' && 'A slow connection can delay the first download. Try again, or open it in a new tab.'}
          </p>
          <div className="viewer-actions">
            <button type="button" className="btn" onClick={onRetry}>
              Try again
            </button>
            <a className="btn" href={src} target="_blank" rel="noreferrer">
              <Icon name="external" />
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default Viewer
