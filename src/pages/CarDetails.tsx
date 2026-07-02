import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaCarSide, FaCheckCircle, FaTimes, FaTimesCircle } from 'react-icons/fa'
import { getCar } from '../services/api'
import type { CarResponse } from '../types/car'
import type { ErrorResponse } from '../types/error'
import { formatPrice } from '../utils/formatPrice'
import { formatEnumLabel } from '../utils/formatEnumLabel'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import ErrorBanner from '../components/Common/ErrorBanner'

const SPECS: { label: string; render: (car: CarResponse) => string }[] = [
  { label: 'Body Type', render: (car) => formatEnumLabel(car.bodyType) },
  { label: 'Fuel', render: (car) => formatEnumLabel(car.fuelType) },
  { label: 'Transmission', render: (car) => formatEnumLabel(car.transmission) },
  { label: 'Engine', render: (car) => car.engine },
  { label: 'Power', render: (car) => car.power },
  { label: 'Torque', render: (car) => car.torque },
  { label: 'Mileage', render: (car) => `${car.mileage} km/l` },
  { label: 'Safety Rating', render: (car) => `${car.safetyRating}/5` },
  { label: 'Seats', render: (car) => `${car.seatCapacity}` },
  { label: 'Boot Space', render: (car) => `${car.bootSpace} L` },
  { label: 'Ground Clearance', render: (car) => `${car.groundClearance} mm` },
  { label: 'Review Score', render: (car) => `${car.reviewScore}` },
]

function CarDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [car, setCar] = useState<CarResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getCar(Number(id))
      .then(setCar)
      .catch((err: unknown) => setError(err as ErrorResponse))
      .finally(() => setLoading(false))
  }, [id])

  const close = () => navigate(-1)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <ErrorBanner error={error ?? { timestamp: '', status: 404, error: 'Not Found', message: 'Car not found.', path: '' }} />
        <button type="button" onClick={close} className="mt-4 text-sm font-medium text-[#2563eb] hover:underline">
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {car.brand} {car.model}
            </h1>
            <p className="text-sm text-gray-500">{car.variant}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-6 flex h-48 items-center justify-center rounded-xl bg-[#eff6ff]">
          <FaCarSide className="text-[#2563eb]" size={64} />
        </div>

        <p className="mt-6 text-2xl font-bold text-gray-900">{formatPrice(car.price)}</p>

        <h2 className="mt-8 text-base font-semibold text-gray-900">Specifications</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-600 sm:grid-cols-3">
          {SPECS.map((spec) => (
            <div key={spec.label}>
              <dt className="text-gray-400">{spec.label}</dt>
              <dd className="font-medium text-gray-900">{spec.render(car)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Pros</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {car.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-green-500" size={14} />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Cons</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {car.cons.map((con) => (
                <li key={con} className="flex items-start gap-2">
                  <FaTimesCircle className="mt-0.5 shrink-0 text-red-400" size={14} />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetails
