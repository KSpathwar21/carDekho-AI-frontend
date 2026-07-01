import { Outlet } from 'react-router-dom'
import Navbar from '../components/Common/Navbar'
import Footer from '../components/Common/Footer'

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
