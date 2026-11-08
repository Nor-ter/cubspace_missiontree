import { useEffect, useState } from 'react'

export type Page = 'tree' | 'workflow'

// 주소의 첫 칸으로 페이지를 고른다: #/workflow… = Workflow, 나머지 = 미션 트리
const pageOf = (hash: string): Page => (/^#\/?workflow(\/|$|\?)/.test(hash) ? 'workflow' : 'tree')

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
