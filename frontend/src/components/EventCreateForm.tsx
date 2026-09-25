import type { SubmitEvent } from 'react'
import { useState } from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router'
import SelectedTimes from './SelectedTimes'

type FormErrors = {
  name?: string
  dateTimeOptions?: string
  submit?: string
}

type CreateEventResponse = {
  public_token: string
}

type EventCreateFormProps = {
  candidateInstants: Date[]
  timeZone?: string
  onCandidateRemove: (instant: Date) => void
}

export default function EventCreateForm({ candidateInstants, timeZone, onCandidateRemove }: EventCreateFormProps) {
  const navigate = useNavigate()
  const currentTimeZone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const timeOptions = candidateInstants.map(instant => ({starts_at: instant.toISOString()}))

    const nextErrors: FormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Event name is required.'
    }
    if (timeOptions.length === 0) {
      nextErrors.dateTimeOptions = 'At least one date and time option is required.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      const {data} = await axios.post<CreateEventResponse>('http://localhost:3000/api/v1/events', {
        event: {
          name: name.trim(),
          description: description.trim(),
          time_zone: currentTimeZone,
          time_options_attributes: timeOptions,
        },
      })
      void navigate(`/events/${data.public_token}`)
    } catch (error) {
      console.error('Error creating event:', error)
      if (axios.isAxiosError<{ errors?: string[] }>(error)) {
        const messages = error.response?.data.errors
        setErrors({
          submit: messages?.length ? messages.join(' ') : 'Failed to create the event. Please try again.',
        })
      } else {
        setErrors({submit: 'Failed to create the event. Please try again.'})
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="event-create-form">
      <form
        onSubmit={event => {
          void handleSubmit(event)
        }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6 md:flex-row-reverse">
          <SelectedTimes
            candidates={candidateInstants}
            timeZone={currentTimeZone}
            onRemove={instant => onCandidateRemove(instant)}
            className="h-fit md:min-w-0 md:flex-1"
          />
          <div className="self-start space-y-4 rounded-xl border border-border-subtle bg-surface-panel p-5 md:min-w-0 md:flex-1">
            <div>
              <div className="flex items-center gap-4">
                <label htmlFor="event-name" className="block text-sm font-medium text-content-primary">
                  Event Name
                </label>
                {errors.name && (
                  <p className="text-xs text-status-danger">
                    {errors.name}
                  </p>
                )}
              </div>
              <input
                type="text"
                id="event-name"
                name="name"
                placeholder="Year-End Party"
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  setErrors(prev => ({...prev, name: undefined, submit: undefined}))
                }}
                className="mt-1 w-full px-3 py-1.5 rounded-md border-default outline-1 outline-border-default placeholder:text-sm focus:outline-2 focus:outline-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm/6 font-medium text-content-primary">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full mt-1 rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus:outline-2 focus:outline-brand-primary sm:text-sm/6"
              />
            </div>
          </div>
        </div>
        {errors.submit && (
          <p className="text-xs text-status-danger">
            {errors.submit}
          </p>
        )}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-w-28 rounded-full bg-brand-primary px-8 py-3 font-semibold text-white transition hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-brand-primary md:w-auto"
          >
            {isSubmitting ? 'Planning...' : 'Plan an event'}
          </button>
        </div>
      </form>
    </div>
  )
}
