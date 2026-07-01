import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'

const Home = lazy(() => import('../pages/Home'))
const Chat = lazy(() => import('../pages/Chat'))
const Recommendation = lazy(() => import('../pages/Recommendation'))
const CarDetails = lazy(() => import('../pages/CarDetails'))
const NotFound = lazy(() => import('../pages/NotFound'))

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
