import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
      <Link to="/" className="text-[#2563eb] underline">
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound
