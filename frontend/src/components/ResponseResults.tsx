import { Check, X } from 'lucide-react'
import { CITY_CATALOG } from '../data/cityCatalog.ts'
import type { Response, TimeOption } from '../types/event.ts'

type ResponseResultsProps = {
  eventTimeZone: string
  responses: Response[]
  timeOptions: TimeOption[]
}

function formatTimeOption(timeOption: TimeOption, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(timeOption.starts_at))
}

function formatTimeZone(timeZone: string) {
  const city = CITY_CATALOG.find((item) => item.timeZone === timeZone)
  return city ? `${city.name} (${city.timeZone})` : timeZone
}

export default function ResponseResults({ eventTimeZone, responses, timeOptions }: ResponseResultsProps) {
  const availableCounts = timeOptions.map((timeOption) =>
    responses.reduce((count, response) => {
      const availability = response.availabilities.find((item) => item.time_option_id === timeOption.id)
      return count + (availability?.status === 'available' ? 1 : 0)
    }, 0),
  )
  const maximumAvailable = Math.max(0, ...availableCounts)

  return (
    <section className="grid gap-4" aria-labelledby="responses-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="responses-heading" className="text-lg font-bold">
          Responses
        </h2>
        <span className="text-sm text-content-muted">
          {responses.length} {responses.length === 1 ? 'response' : 'responses'}
        </span>
      </div>
      {responses.length === 0 ? (
        <p className="text-sm text-content-secondary">No responses yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-panel">
          <table className="w-max min-w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-content-secondary">
                <th scope="col" className="w-32 px-3 py-4 text-left text-sm font-bold">
                  Name
                </th>
                {timeOptions.map((timeOption) => (
                  <th
                    key={timeOption.id}
                    scope="col"
                    className="w-28 border-l border-border-subtle px-2 py-3 text-center text-xs font-bold"
                  >
                    {formatTimeOption(timeOption, eventTimeZone)}
                  </th>
                ))}
                <th scope="col" className="w-40 border-l border-border-subtle px-3 py-4 text-left text-sm font-bold">
                  Comment
                </th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id} className="border-b border-border-subtle last:border-b-0">
                  <th scope="row" className="break-words px-3 py-4 align-top text-sm font-bold">
                    <span className="block">{response.name}</span>
                    <span className="mt-1 block text-xs font-normal text-content-muted">
                      {formatTimeZone(response.time_zone)}
                    </span>
                  </th>
                  {timeOptions.map((timeOption) => {
                    const availability = response.availabilities.find((item) => item.time_option_id === timeOption.id)
                    const isAvailable = availability?.status === 'available'

                    return (
                      <td
                        key={timeOption.id}
                        aria-label={`${isAvailable ? 'Available' : 'Not available'}: ${formatTimeOption(timeOption, eventTimeZone)}`}
                        className="border-l border-border-subtle px-2 py-4 text-center text-xl font-bold"
                      >
                        {isAvailable ? (
                          <Check className="mx-auto text-status-success" size={20} strokeWidth={4} aria-hidden="true" />
                        ) : (
                          <X className="mx-auto text-content-muted" size={16} strokeWidth={2.5} aria-hidden="true" />
                        )}
                      </td>
                    )
                  })}
                  <td className="break-words border-l border-border-subtle px-3 py-4 align-top text-sm text-content-secondary">
                    {response.comment || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-subtle text-content-secondary">
                <th scope="row" className="px-3 py-4 text-left text-sm font-bold">
                  Available
                </th>
                {availableCounts.map((count, index) => {
                  const isMostAvailable = maximumAvailable > 0 && count === maximumAvailable

                  return (
                    <td
                      key={timeOptions[index].id}
                      aria-label={`${count} available: ${formatTimeOption(timeOptions[index], eventTimeZone)}`}
                      className={`border-l border-border-subtle px-2 py-4 text-center text-lg ${isMostAvailable ? 'font-bold text-brand-primary' : 'font-normal'}`}
                    >
                      {count}
                    </td>
                  )
                })}
                <td className="border-l border-border-subtle" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
