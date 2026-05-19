import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Plus, Trash } from 'lucide-react'
import type { SubmitEvent } from 'react'
import { useState } from 'react'

type DateTimeOption = {
  id: string
  value: Date | null
}

const buildDefaultDateTime = () => {
  const date = new Date()
  date.setHours(18, 0, 0, 0)
  return date
}

export default function EventCreateForm() {
  const defaultDateTime = buildDefaultDateTime()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dateTimeOptions, setDateTimeOptions] = useState<DateTimeOption[]>([
    {id: crypto.randomUUID(), value: defaultDateTime},
    {id: crypto.randomUUID(), value: defaultDateTime},
  ])
  const [lastSelectedDateTime, setLastSelectedDateTime] = useState(defaultDateTime)

  const handleDateTimeChange = (id: string, value: Date | null) => {
    setDateTimeOptions(prev =>
      prev.map(item =>
        item.id === id ? {...item, value} : item,
      ),
    )
    if (value) {
      setLastSelectedDateTime(value)
    }
  }

  const handleAddDateTimeOption = () => {
    setDateTimeOptions(prev => [
      ...prev,
      {id: crypto.randomUUID(), value: lastSelectedDateTime},
    ])
  }

  const handleDeleteDateTimeOption = (id: string) => {
    setDateTimeOptions(prev => prev.filter(item => item.id !== id))
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Submitting form with:', {name, description, timeZone, dateTimeOptions})
  }

  return (
    <div className="event-create-form bg-surface-panel">
      <h2 className="text-xl font-bold mb-4">Create Your Event Page</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="event-name" className="block text-sm font-medium text-content-primary">
            Event Name
          </label>
          <input
            type="text"
            id="event-name"
            name="name"
            placeholder="Year-End Party"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 px-3 py-1.5 rounded-md border-default outline-1 outline-border-default placeholder:text-sm focus:outline-2 focus:outline-brand-primary"
          />
        </div>
        <label htmlFor="description" className="text-sm/6 font-medium text-content-primary">
          Description (Optional)
        </label>
        <div>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full mt-1 rounded-md px-3 py-1.5 text-base outline-1 outline-border-default focus:outline-2 focus:outline-brand-primary sm:text-sm/6"
          />
        </div>
        <div>
          <label htmlFor="event-date" className="block text-sm font-medium text-content-primary">
            Event Date & Time Options
          </label>
          <div className="space-y-2">
            {dateTimeOptions.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <DatePicker
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  timeIntervals={30}
                  dateFormat="yyyy-MM-dd hh:mm aa"
                  selected={item.value}
                  onChange={(date: Date | null) => handleDateTimeChange(item.id, date)}
                  className="block w-full mt-1 px-3 py-1.5 rounded-md bg-surface-panel text-base text-shadow-content-secondary outline-1 outline-border-default placeholder:text-content-secondary focus:outline-2 focus:outline-brand-primary sm:text-sm/6"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteDateTimeOption(item.id)}
                  disabled={dateTimeOptions.length === 1}
                  className="ml-1 text-content-muted hover:text-status-danger transition"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
          <div
            onClick={handleAddDateTimeOption}
            className="mt-2 p-1 rounded-3xl bg-brand-primary/30 inline-flex items-center gap-1 cursor-pointer hover:bg-brand-primary/20 transition">
            <Plus size={16} />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 transition bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          Create
        </button>
      </form>
    </div>
  )
}
