import { EventCard } from './EventCard'
import type { EventClient, Project, EventProfit } from '@/types'

interface Props { events: EventClient[]; projects: Project[]; profits: EventProfit[] }

export function EventsGrid({ events, projects, profits }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map(ev => {
        const evProjects = projects.filter(p => p.event_id === ev.id)
        const profit = profits.find(p => p.name === ev.name) || { name: ev.name, revenue: 0, expenses: 0, net: 0, txnCount: 0 }
        return <EventCard key={ev.id} event={ev} projects={evProjects} profit={profit} />
      })}
    </div>
  )
}
