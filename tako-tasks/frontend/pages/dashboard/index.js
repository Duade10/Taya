import { useEffect, useState } from 'react'
import { Filter, RefreshCw, WifiOff } from 'lucide-react'
import TaskCard from '../../components/TaskCard'
import { DashboardShell } from '@/components/ui/dashboard-with-collapsible-sidebar'
import { fetchTasks, loginWithWorkspace } from '../../utils/api'

const formatDate = (value) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No due date' : date.toLocaleDateString()
}

export default function Dashboard() {
  const [workspaceId, setWorkspaceId] = useState('')
  const [token, setToken] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', assignee: '', search: '' })
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data } = await loginWithWorkspace(workspaceId)
      setToken(data.access_token)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const { data } = await fetchTasks(token, Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))
      setTasks(data)
    }
    load()
  }, [token, filters])

  const updateFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  return (
    <DashboardShell
      title="Task dashboard"
      subtitle="Connect your workspace and filter synced tasks from the Slack bot."
      extraActions={
        <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm">
          + New Task
        </button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <section className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workspace access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Authenticate with your Slack workspace to load tasks.</p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                token
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
              }`}
            >
              {token ? 'Connected' : 'Awaiting login'}
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">Workspace Slack Team ID</label>
              <input
                placeholder="T012345"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition shadow-sm font-semibold" type="submit">
                {token ? 'Reconnect' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setFilters({ status: '', priority: '', assignee: '', search: '' })}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Reset filters
              </button>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {!token && <p className="text-sm text-gray-500 dark:text-gray-400">Enter your workspace ID to fetch tasks synced from the Slack bot.</p>}
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Refine the task list by status, priority, assignee, or keywords.</p>
            </div>
          </div>
          <div className="space-y-3">
            {['status', 'priority', 'assignee', 'search'].map((field) => (
              <div key={field} className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-200 capitalize">{field}</label>
                <input
                  name={field}
                  placeholder={field}
                  value={filters[field]}
                  onChange={updateFilter}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-4" id="tasks">
        {!token && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-100 px-4 py-3 rounded-lg">
            <WifiOff className="h-4 w-4" />
            Connect your workspace to pull the latest tasks from Tako Tasks.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {token && tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description || 'No description provided'}
              priority={task.priority || 'Low'}
              assignee={task.assignee_user_id || 'Unassigned'}
              due={formatDate(task.due_date)}
            />
          ))}

          {token && tasks.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks match your filters</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting the filters or creating a new task to get started.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
