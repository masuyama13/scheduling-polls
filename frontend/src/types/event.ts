export type EventDetail = {
  id: number
  name: string
  description: string | null
  time_zone: string
  public_token: string
  time_options: TimeOption[]
  responses: Response[]
}

export type TimeOption = {
  id: number
  event_id: number
  starts_at: string
}

export type Response = {
  id: number
  event_id: number
  name: string
  comment: string | null
  time_zone: string
  availabilities: Availability[]
}

export type Availability = {
  id: number
  response_id: number
  time_option_id: number
  status: 'unavailable' | 'available'
}
