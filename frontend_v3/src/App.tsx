import MissionTreePage from './pages/MissionTreePage'
import WorkflowPage from './pages/WorkflowPage'
import { usePage } from './hooks/usePage'

function App() {
  return usePage() === 'workflow' ? <WorkflowPage /> : <MissionTreePage />
}

export default App
