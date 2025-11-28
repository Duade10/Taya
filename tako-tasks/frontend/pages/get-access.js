import { useState } from 'react'
import { requestAccess } from '../utils/api'

export default function GetAccess() {
  const [form, setForm] = useState({ name: '', email: '', company: '', team_size: '' })
  const [status, setStatus] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      await requestAccess(form)
      setStatus('Access key sent! Check your inbox.')
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Failed to request access')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-16">
      <h1 className="text-3xl font-semibold mb-4">Request Tako Tasks Access</h1>
      <p className="mb-6 text-slate-600">Share a few details and we will email you a single-use unlock key.</p>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">
        {['name', 'email', 'company', 'team_size'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field.replace('_', ' ')}</label>
            <input
              required
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
            />
          </div>
        ))}
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">
          Send access key
        </button>
        {status && <p className="text-sm text-slate-700">{status}</p>}
      </form>
    </div>
  )
}
