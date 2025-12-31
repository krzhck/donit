import { TaskList } from '../components/TaskList'
import { t } from '../locales'

export default function Today() {
  return (
    <div className="">
      <div className="page-header">
        <h2 className="page-title">{t.today.title}</h2>
        <p className="page-subtitle">{t.today.subtitle}</p>
      </div>
      <div className="page-content">
        <TaskList
          emptyTitle={t.inbox.emptyTitle}
          emptySubtitle={t.inbox.emptySubtitle}
          filter={{ taskDateIsToday: true }}
        />
      </div>
    </div>
  )
}
