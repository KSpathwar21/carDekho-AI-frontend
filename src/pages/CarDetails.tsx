import { useParams } from 'react-router-dom'

function CarDetails() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <h1 className="text-2xl font-semibold text-gray-900">Car Details — {id}</h1>
    </div>
  )
}

export default CarDetails
