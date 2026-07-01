export interface QuickReplyOption {
  label: string
  message: string
}

// Fuel/body-type labels here follow the backend's real enums
// (FuelType/BodyType in carDekho-AI-Backend), not CLAUDE_FRONTEND.md's
// original planned chip set — see IMPLEMENTATION.md section 4.
export const FUEL_TYPE_OPTIONS: QuickReplyOption[] = [
  { label: 'Petrol', message: 'I prefer a petrol car.' },
  { label: 'Diesel', message: 'I prefer a diesel car.' },
  { label: 'CNG', message: 'I prefer a CNG car.' },
  { label: 'Electric', message: 'I prefer an electric car.' },
  { label: 'Hybrid', message: 'I prefer a hybrid car.' },
  { label: 'Not Sure', message: "I'm not sure about the fuel type." },
]

export const TRANSMISSION_OPTIONS: QuickReplyOption[] = [
  { label: 'Manual', message: 'I prefer a manual transmission.' },
  { label: 'Automatic', message: 'I prefer an automatic transmission.' },
  { label: 'Either', message: 'Either transmission works for me.' },
]

export const BODY_TYPE_OPTIONS: QuickReplyOption[] = [
  { label: 'SUV', message: 'I want an SUV.' },
  { label: 'Sedan', message: 'I want a sedan.' },
  { label: 'Hatchback', message: 'I want a hatchback.' },
  { label: 'MUV', message: 'I want an MUV.' },
  { label: 'Coupe', message: 'I want a coupe.' },
  { label: 'Not Sure', message: "I'm not sure about the body type." },
]
