import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CarResponse } from '../../types/car'
import { formatPrice } from '../../utils/formatPrice'
import { formatEnumLabel } from '../../utils/formatEnumLabel'

interface CarCardProps {
  car: CarResponse
  large?: boolean
  showCompareLink?: boolean
}

function CarCard({ car, large = false, showCompareLink = false }: CarCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(37, 99, 235, 0.25)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${large ? 'p-6' : 'p-5'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className={`font-semibold text-gray-900 ${large ? 'text-xl' : 'text-base'}`}>
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-gray-500">{car.variant}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb]">
          {formatEnumLabel(car.bodyType)}
        </span>
      </div>

      <p className={`mt-3 font-bold text-gray-900 ${large ? 'text-2xl' : 'text-xl'}`}>{formatPrice(car.price)}</p>

      <dl className={`mt-4 grid gap-y-2 text-sm text-gray-600 ${large ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
        <div>
          <dt className="inline text-gray-400">Fuel </dt>
          <dd className="inline">{formatEnumLabel(car.fuelType)}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">Transmission </dt>
          <dd className="inline">{formatEnumLabel(car.transmission)}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">Mileage </dt>
          <dd className="inline">{car.mileage} km/l</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">Safety </dt>
          <dd className="inline">{car.safetyRating}/5</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/car/${car.id}`}
          className="flex-1 rounded-full border border-[#2563eb] px-4 py-2 text-center text-sm font-medium text-[#2563eb] hover:bg-[#eff6ff]"
        >
          View Details
        </Link>
        {showCompareLink && (
          <a
            href="#comparison"
            className="flex-1 rounded-full bg-[#2563eb] px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Compare
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default CarCard
