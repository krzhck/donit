import { TaskList } from '../components/TaskList'
import { t } from '../locales'

export default function Inbox() {
  return (
    <div className="">
      <div className="page-header">
        <h2 className="page-title">{t.inbox.pageTitle}</h2>
      </div>
      <div className="page-content">
        <TaskList
          emptyTitle={t.inbox.emptyTitle}
          emptySubtitle={t.inbox.emptySubtitle}
          filter={{ category: 'inbox' }}
          includePlaceholders
        />
      </div>
    </div>
  )
}
