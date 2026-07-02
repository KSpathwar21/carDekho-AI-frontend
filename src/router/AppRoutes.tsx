import { lazy, Suspense } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const Home = lazy(() => import('../pages/Home'))
const Chat = lazy(() => import('../pages/Chat'))
const Recommendation = lazy(() => import('../pages/Recommendation'))
const CarDetails = lazy(() => import('../pages/CarDetails'))
const NotFound = lazy(() => import('../pages/NotFound'))

// Keyed by :id so navigating directly between two /car/:id pages remounts
// CarDetails with fresh state, rather than needing to reset state for a
// changed id inside an effect.
function CarDetailsRoute() {
  const { id } = useParams()
  return <CarDetails key={id} />
}

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/car/:id" element={<CarDetailsRoute />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
