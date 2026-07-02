export type BodyType = 'HATCHBACK' | 'SEDAN' | 'SUV' | 'MUV' | 'COUPE'
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID'
export type Transmission = 'MANUAL' | 'AUTOMATIC'

export interface CarResponse {
  id: number
  brand: string
  model: string
  variant: string
  bodyType: BodyType
  fuelType: FuelType
  transmission: Transmission
  price: number
  engine: string
  power: string
  torque: string
  mileage: number
  safetyRating: number
  bootSpace: number
  groundClearance: number
  seatCapacity: number
  reviewScore: number
  pros: string[]
  cons: string[]
}
