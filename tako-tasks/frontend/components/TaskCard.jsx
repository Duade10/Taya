export default function TaskCard({ title, description, priority, assignee, due }) {
  const badgeStyles = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-yellow-100 text-yellow-600',
    Low: 'bg-green-100 text-green-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full ${badgeStyles[priority] || 'bg-gray-100 text-gray-600'}`}>
          {priority}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-indigo-200" />
          <span className="text-sm text-gray-600">{assignee}</span>
        </div>

        <span className="text-sm text-gray-500">Due: {due}</span>
      </div>
    </div>
  )
}
