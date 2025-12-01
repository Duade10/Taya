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
    <div className="flex items-center justify-center min-h-screen bg-[#F7F8FC] px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Unlock Installation</h2>

        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="text-sm text-gray-700">Access Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="KEY-XXXXXX-TK"
              required
            />
          </div>

          <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700" type="submit">
            Unlock
          </button>

          {status && <p className="text-sm text-gray-600">{status}</p>}
          {installUrl && (
            <a className="inline-block bg-indigo-700 text-white px-4 py-2 rounded mt-2" href={installUrl}>
              Install Tako Tasks to Slack
            </a>
          )}
        </form>
      </div>
    </div>
  )
}
