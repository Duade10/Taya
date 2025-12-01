import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TaskCard from '../../components/TaskCard'
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
    <div>
      <Sidebar />

      <main className="ml-60 p-10 min-h-screen bg-[#F7F8FC]">
        <header className="flex justify-between items-center mb-10">
          <div>
            <p className="text-sm text-gray-500">Welcome back</p>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          </div>

          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            + New Task
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Workspace access</h3>
                <p className="text-sm text-gray-500">Authenticate with your Slack workspace to load tasks.</p>
              </div>
              {token && <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">Connected</span>}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">Workspace Slack Team ID</label>
                <input
                  placeholder="T012345"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition" type="submit">
                {token ? 'Reconnect' : 'Sign in'}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!token && <p className="text-sm text-gray-500">Enter your workspace ID to fetch tasks synced from the Slack bot.</p>}
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <p className="text-sm text-gray-500 mb-4">Refine the task list by status, priority, assignee, or keywords.</p>
            <div className="space-y-3">
              {['status', 'priority', 'assignee', 'search'].map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-700 capitalize">{field}</label>
                  <input
                    name={field}
                    placeholder={field}
                    value={filters[field]}
                    onChange={updateFilter}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!token && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to view tasks</h3>
              <p className="text-sm text-gray-600">Connect your workspace to pull the latest tasks from Tako Tasks.</p>
            </div>
          )}

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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks match your filters</h3>
              <p className="text-sm text-gray-600">Try adjusting the filters or creating a new task to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
