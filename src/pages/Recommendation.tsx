import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useConversation } from '../hooks/useConversation'
import RecommendationCard from '../components/Recommendation/RecommendationCard'
import ComparisonTable from '../components/Recommendation/ComparisonTable'
import EmptyState from '../components/Common/EmptyState'

const markdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-4 text-lg font-semibold text-gray-900 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-4 text-base font-semibold text-gray-900">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => <p className="mt-2 leading-relaxed first:mt-0">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>,
  li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
}

function Recommendation() {
  const { messages, completed, recommendations, comparison, reset } = useConversation()
  const navigate = useNavigate()

  const summary = [...messages].reverse().find((message) => message.role === 'assistant')?.text

  const startNewSearch = () => {
    reset()
    navigate('/chat')
  }

  if (!completed) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Start a conversation with the AI Car Buying Assistant to get personalized recommendations."
        actionLabel="Start Conversation"
        onAction={() => navigate('/chat')}
      />
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        {summary && (
          <div className="mb-8 rounded-2xl bg-[#eff6ff] p-6 text-sm text-gray-900">
            <ReactMarkdown components={markdownComponents}>{summary}</ReactMarkdown>
          </div>
        )}
        <EmptyState
          title="No matching cars found"
          description="Try relaxing your budget or one of your other preferences."
          actionLabel="Start a New Search"
          onAction={startNewSearch}
        />
      </div>
    )
  }

  const [topPick, ...rest] = recommendations

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Recommended Cars</h1>

      {summary && (
        <div className="mt-4 rounded-2xl bg-[#eff6ff] p-6 text-sm text-gray-900">
          <ReactMarkdown components={markdownComponents}>{summary}</ReactMarkdown>
        </div>
      )}

      <div className="mt-8">
        <RecommendationCard car={topPick} featured />
      </div>

      {rest.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((car) => (
            <RecommendationCard key={car.id} car={car} />
          ))}
        </div>
      )}

      {comparison.length > 0 && (
        <div id="comparison" className="mt-12 scroll-mt-6">
          <h2 className="text-xl font-semibold text-gray-900">Compare Cars</h2>
          <div className="mt-4">
            <ComparisonTable cars={comparison} />
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={startNewSearch}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Start a New Search
        </button>
      </div>
    </div>
  )
}

export default Recommendation
