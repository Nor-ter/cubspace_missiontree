export type Status = 'done' | 'active' | 'pending'

export type Level = 'mission' | 'phase' | 'subsystem' | 'task' | 'subtask'

export interface MissionNode {
  id: string
  level: Level
  title: string
  // 짧은 코드: Phase = NASA 수명주기(Pre-A, A … F), Subsystem = PM 키(SYS, BOX, EPS, ADCS, COM, OBC, PAY),
  // Task = PM 카드 번호(A2). Subtask 번호(A2.1)는 위치로 붙인다.
  code?: string
  // 카드에는 짧은 이름(title)만 쓰고, PM 원문은 여기에 두어 툴팁으로 보여 준다
  detail?: string
  // 상태는 Subtask(잎)에만 적는다. 위 단계의 상태는 아래에서 계산한다.
  status?: Status
  // Technical Manual은 Subsystem 단위로 붙는다.
  manual?: Manual
  // 실습 노트북은 Task(따라 하기)와 Subtask(직접 해 보기)에 붙는다.
  notebook?: Notebook
  children?: MissionNode[]
}

export interface Manual {
  title: string
  url: string // public/ 아래 경로 (예: /manuals/xxx.pdf)
}

export interface NodeStats {
  status: Status
  progress: number
}

export interface Notebook {
  path: string // jupyterlite/content/ 기준 경로 (예: adcs/xxx.ipynb)
}
