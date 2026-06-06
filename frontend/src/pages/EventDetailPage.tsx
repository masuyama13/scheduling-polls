import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import axios from 'axios'
import type { EventDetail } from '../types/event.ts'

export default function EventDetailPage() {
  const {slug} = useParams()
  const [event, setEvent] = useState<EventDetail | null>(null)

  useEffect(() => {
    const getEventDetail = async () => {
      try {
        const {data} = await axios.get(`http://localhost:3000/api/v1/events/${slug}`)
        setEvent(data)
      } catch (error) {
        console.error('Error fetching event details:', error)
      }
    }
    if (slug) {
      void getEventDetail()
    }
  }, [slug])

  return (
    <div className="event-detail-page text-content-primary w-full">
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8">
        <h1 className="text-2xl font-bold">
          {event?.name ?? 'Event Detail Page'}
        </h1>
        {event && (
          <div className="space-y-2">
            {event.description && (
              <p>{event.description}</p>
            )}
            <p>Time zone: {event.time_zone}</p>
            <p>Date/time options: {event.time_options.length}</p>
            <p>Responses: {event.responses.length}</p>
          </div>
        )}
      </main>
    </div>
  )
}
