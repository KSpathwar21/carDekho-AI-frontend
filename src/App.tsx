import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './router/AppRoutes'
import { ConversationProvider } from './context/ConversationContext'

function App() {
  return (
    <ConversationProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConversationProvider>
  )
}

export default App
