import type { ReactNode } from 'react'
import type { CarResponse } from '../../types/car'
import { formatPrice } from '../../utils/formatPrice'
import { formatEnumLabel } from '../../utils/formatEnumLabel'

interface ComparisonTableProps {
  cars: CarResponse[]
}

const ROWS: { label: string; render: (car: CarResponse) => ReactNode }[] = [
  { label: 'Price', render: (car) => formatPrice(car.price) },
  { label: 'Mileage', render: (car) => `${car.mileage} km/l` },
  { label: 'Safety', render: (car) => `${car.safetyRating}/5` },
  { label: 'Fuel', render: (car) => formatEnumLabel(car.fuelType) },
  { label: 'Transmission', render: (car) => formatEnumLabel(car.transmission) },
  { label: 'Seats', render: (car) => car.seatCapacity },
  { label: 'Boot Space', render: (car) => `${car.bootSpace} L` },
  { label: 'Ground Clearance', render: (car) => `${car.groundClearance} mm` },
  { label: 'Review Score', render: (car) => car.reviewScore },
  { label: 'Engine', render: (car) => car.engine },
  { label: 'Power', render: (car) => car.power },
]

function ComparisonTable({ cars }: ComparisonTableProps) {
  if (cars.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="w-40 px-4 py-3"></th>
            {cars.map((car) => (
              <th key={car.id} className="px-4 py-3">
                <span className="font-semibold text-gray-900">
                  {car.brand} {car.model}
                </span>
                <div className="text-xs font-normal text-gray-500">{car.variant}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-gray-50 last:border-0">
              <th className="px-4 py-3 text-left font-medium text-gray-400">{row.label}</th>
              {cars.map((car) => (
                <td key={car.id} className="px-4 py-3 text-gray-700">
                  {row.render(car)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
