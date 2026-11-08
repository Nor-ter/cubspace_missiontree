import LoginPage from './pages/LoginPage'
import MissionTreePage from './pages/MissionTreePage'
import WorkflowPage from './pages/WorkflowPage'
import { usePage } from './hooks/usePage'

function App() {
  const page = usePage()
  if (page === 'login') return <LoginPage />
  return page === 'workflow' ? <WorkflowPage /> : <MissionTreePage />
}

export default App
