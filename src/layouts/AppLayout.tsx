import { Outlet } from 'react-router-dom'
import Navbar from '../components/Common/Navbar'
import Footer from '../components/Common/Footer'

function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
