import { useEffect, useState } from 'react'
import { readRole } from '../features/login/role'

export type Page = 'login' | 'tree' | 'workflow'

// 주소의 첫 칸으로 페이지를 고른다: #/login 또는 아직 역할을 고르지 않았으면 로그인, #/workflow… = Workflow, 나머지 = 미션 트리
function pageOf(hash: string): Page {
  if (/^#\/?login(\/|$|\?)/.test(hash) || !readRole()) return 'login'
  return /^#\/?workflow(\/|$|\?)/.test(hash) ? 'workflow' : 'tree'
}

export function usePage(): Page {
  const [page, setPage] = useState(() => pageOf(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      const next = pageOf(window.location.hash)
      setPage((prev) => {
        // 페이지를 바꾸면 맨 위부터 보여 준다
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return page
}
