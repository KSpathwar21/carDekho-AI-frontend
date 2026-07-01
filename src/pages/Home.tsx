import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-12 px-6 py-20 md:flex-row md:py-28">
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Find Your Perfect Car
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Answer a few questions and let AI recommend the best cars for you.
        </p>
        <Link
          to="/chat"
          className="mt-8 inline-block rounded-full bg-[#2563eb] px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Start Conversation
        </Link>
      </div>
      <div className="flex-1">
        <img src={heroImage} alt="" className="mx-auto w-full max-w-sm" />
      </div>
    </div>
  )
}

export default Home
