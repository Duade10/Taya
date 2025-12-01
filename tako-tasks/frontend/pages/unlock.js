import { useState } from 'react'
import { KeyRound, ExternalLink, Shield, Clock4 } from 'lucide-react'
import { DashboardShell } from '@/components/ui/dashboard-with-collapsible-sidebar'
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
    <DashboardShell
      title="Unlock installation"
      subtitle="Verify your access key to add Tako Tasks to your Slack workspace."
      extraActions={
        installUrl && (
          <a
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            href={installUrl}
          >
            Install now
            <ExternalLink className="h-4 w-4" />
          </a>
        )
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enter your key</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">We&apos;ll confirm it and unlock your workspace install link.</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 font-semibold">
              Secure
            </span>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">Access Key</label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest"
                placeholder="KEY-XXXXXX-TK"
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-sm transition" type="submit">
                Verify & Unlock
              </button>

              {status && (
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                  {status}
                </p>
              )}

              {installUrl && (
                <a
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold shadow-sm"
                  href={installUrl}
                >
                  Install Tako Tasks to Slack
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-indigo-500" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">What happens next</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Once verified, we generate a workspace-specific install link to keep tokens safe.</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <StepRow label="Validate the key" detail="Single-use keys keep unauthorized installs out." />
            <StepRow label="Confirm workspace" detail="Install URL is scoped to your Slack team ID for safety." />
            <StepRow label="Launch the app" detail="Follow Slack&apos;s prompt and you&apos;re ready to manage tasks." />
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <Clock4 className="h-4 w-4" />
            Typical verification time: under 10 seconds.
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

const StepRow = ({ label, detail }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
    <div>
      <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
      <p className="text-gray-600 dark:text-gray-400">{detail}</p>
    </div>
  </div>
)
