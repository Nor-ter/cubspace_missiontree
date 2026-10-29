import type { KeyboardEvent } from 'react'
import type { PlacedNode } from './layout'

// 자식이 있는 노드를 클릭/키보드(Enter, Space)로 펼치고 접을 수 있게 하는 속성
export function toggleProps(p: PlacedNode, onToggle: (id: string) => void) {
  if (!p.node.children?.length) return {}
  return {
    role: 'button',
    tabIndex: 0,
    'aria-expanded': p.expanded,
    'aria-label': `${p.expanded ? 'Collapse' : 'Expand'} ${p.label} ${p.node.detail ?? p.node.title}`,
    className: 'node clickable',
    onClick: () => onToggle(p.node.id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle(p.node.id)
      }
    },
  }
}
