import { useEffect, useState } from 'react'
import { fetchTasks, loginWithWorkspace } from '../../utils/api'

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
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      <aside className="bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-semibold">Dashboard Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            placeholder="Workspace Slack Team ID"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button className="bg-indigo-600 text-white px-3 py-2 rounded w-full">Sign in</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        <div className="pt-6 border-t space-y-3">
          <h3 className="font-semibold">Filters</h3>
          {['status', 'priority', 'assignee', 'search'].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field}
              value={filters[field]}
              onChange={updateFilter}
              className="w-full border rounded px-3 py-2"
            />
          ))}
        </div>
      </aside>
      <main className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Tako Tasks</h1>
            <p className="text-slate-600">Slack workspace tasks, synced with the bot.</p>
          </div>
        </div>
        {!token && <p className="text-slate-600">Login with your workspace ID to view tasks.</p>}
        {token && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white shadow rounded p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-slate-600 text-sm">{task.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-slate-100">{task.status}</span>
                </div>
                <div className="text-sm text-slate-700 mt-3 space-y-1">
                  <p>Assignee: {task.assignee_user_id}</p>
                  <p>Priority: {task.priority}</p>
                  <p>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</p>
                  <p>Tags: {task.tags || '—'}</p>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-slate-500">No tasks match your filters yet.</p>}
          </div>
        )}
      </main>
    </div>
  )
}
