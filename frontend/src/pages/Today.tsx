import { TaskList } from '../components/TaskList'
import { t } from '../locales'

export default function Today() {
  return (
    <TaskList
      title={t.today.title}
      subtitle={t.today.subtitle}
      emptyTitle={t.inbox.emptyTitle}
      emptySubtitle={t.inbox.emptySubtitle}
      filter={{ taskDateIsToday: true }}
    />
  )
}
