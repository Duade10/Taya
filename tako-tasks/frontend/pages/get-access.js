import { useState } from 'react'
import { Sparkles, ShieldCheck, Mail, Users } from 'lucide-react'
import { DashboardShell } from '@/components/ui/dashboard-with-collapsible-sidebar'
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
    <DashboardShell
      title="Request early access"
      subtitle="Tell us about your team to reserve your spot for Tako Tasks."
      extraActions={
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Early adopter</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Share your details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">We&apos;ll use this to tailor onboarding to your workflow.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 font-semibold">
              2 min form
            </span>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
            <div className="space-y-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">Name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">Company</label>
              <input
                name="company"
                required
                value={form.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Org name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">Team size</label>
              <input
                name="team_size"
                value={form.team_size}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. 12"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-sm transition" type="submit">
                Request Access
              </button>
              {status && (
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                  {status}
                </p>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Why we gate access</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">We ensure every workspace starts with security best practices and guided onboarding.</p>
            </div>
          </div>

          <div className="space-y-3">
            <InfoRow icon={<Users className="h-4 w-4" />} title="Best-fit teams" desc="We prioritize teams collaborating in Slack daily." />
            <InfoRow icon={<Mail className="h-4 w-4" />} title="Concierge rollout" desc="We share your key and a setup runbook tailored to your workspace." />
            <InfoRow icon={<Sparkles className="h-4 w-4" />} title="Fast responses" desc="Expect a reply in under 1 business day." />
          </div>

          <div className="rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-3 text-sm text-indigo-900 dark:text-indigo-100">
            Looking to unlock multiple workspaces? Mention it in the form and we&apos;ll bundle the onboarding.
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

const InfoRow = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  </div>
)
