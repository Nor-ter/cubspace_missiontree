import { useCallback, useState } from 'react'

// 어떤 노드가 펼쳐져 있는지(id 집합)를 관리한다.
export function useExpanded(initial: string[]) {
  const [expanded, setExpanded] = useState(() => new Set(initial))

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const expandAll = useCallback((ids: string[]) => setExpanded(new Set(ids)), [])
  const expandMany = useCallback((ids: string[]) => setExpanded((prev) => new Set([...prev, ...ids])), [])
  const collapseAll = useCallback(() => setExpanded(new Set()), [])

  return { expanded, toggle, expandAll, expandMany, collapseAll }
}
