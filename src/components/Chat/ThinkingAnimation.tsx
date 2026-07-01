import { useEffect, useState } from 'react'

const STEPS = [
  'Understanding your preferences',
  'Searching database',
  'Comparing cars',
  'Generating recommendations',
]

function ThinkingAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length)
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex w-fit items-center gap-3 rounded-2xl bg-[#eff6ff] px-4 py-3">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#2563eb] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#2563eb] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#2563eb]" />
      </div>
      <span className="text-sm text-gray-600">{STEPS[step]}...</span>
    </div>
  )
}

export default ThinkingAnimation
