export default function TaskCard({ title, description, priority, assignee, due }) {
  const badgeStyles = {
    High: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200',
    Low: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full ${badgeStyles[priority] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200'}`}>
          {priority}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-90" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{assignee}</span>
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400">Due: {due}</span>
      </div>
    </div>
  )
}
