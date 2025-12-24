import { t } from '../locales'

export default function Today() {
  return (
    <div className="px-8 pt-8 pb-4">
      <h2 className="text-2xl font-bold text-gray-900">{t.today.title}</h2>
      <p className="text-sm text-gray-500">{t.today.subtitle}</p>
    </div>
  )
}
