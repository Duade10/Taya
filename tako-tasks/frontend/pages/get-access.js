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
    <div className="flex items-center justify-center min-h-screen bg-[#F7F8FC] px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Request Access</h2>

        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="text-sm text-gray-700">Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Company</label>
            <input
              name="company"
              required
              value={form.company}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Team size</label>
            <input
              name="team_size"
              value={form.team_size}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700" type="submit">
            Request Access
          </button>

          {status && <p className="text-sm text-gray-600">{status}</p>}
        </form>
      </div>
    </div>
  )
}
