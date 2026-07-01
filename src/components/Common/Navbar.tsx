import { FaCarSide } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FaCarSide className="text-[#2563eb]" size={22} />
          CarDekho AI
        </Link>
        <Link
          to="/chat"
          className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start Conversation
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
