import { useState } from 'react'
import { verifyKey } from '../utils/api'

export default function Unlock() {
  const [key, setKey] = useState('')
  const [installUrl, setInstallUrl] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await verifyKey({ key })
      setInstallUrl(data.slack_install_url)
      setStatus('Key verified! Install the Slack app below.')
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Invalid or used key')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-16">
      <h1 className="text-3xl font-semibold mb-4">Unlock the Slack App</h1>
      <p className="mb-6 text-slate-600">Paste the key from your email to continue to the Slack installation.</p>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Access key</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
            required
          />
        </div>
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded w-full">
          Verify key
        </button>
        {status && <p className="text-sm text-slate-700">{status}</p>}
        {installUrl && (
          <a
            className="inline-block bg-indigo-700 text-white px-4 py-2 rounded"
            href={installUrl}
          >
            Install Tako Tasks to Slack
          </a>
        )}
      </form>
    </div>
  )
}
