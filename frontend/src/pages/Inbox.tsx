import { TaskList } from '../components/TaskList'
import { t } from '../locales'

export default function Inbox() {
  return (
    <TaskList
      title={t.inbox.pageTitle}
      emptyTitle={t.inbox.emptyTitle}
      emptySubtitle={t.inbox.emptySubtitle}
      filter={{ category: 'inbox' }}
      includePlaceholders
    />
  )
}
