import CarCard from '../Common/CarCard'
import type { CarResponse } from '../../types/car'

interface RecommendationCardProps {
  car: CarResponse
  featured?: boolean
}

function RecommendationCard({ car, featured = false }: RecommendationCardProps) {
  return (
    <div className="relative">
      {featured && (
        <span className="absolute -top-3 left-4 rounded-full bg-[#2563eb] px-3 py-1 text-xs font-medium text-white shadow">
          Top Recommendation
        </span>
      )}
      <CarCard car={car} large={featured} />
    </div>
  )
}

export default RecommendationCard
