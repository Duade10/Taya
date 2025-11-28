import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const requestAccess = (payload) => axios.post(`${API_BASE}/request-access`, payload)
export const verifyKey = (payload) => axios.post(`${API_BASE}/verify-key`, payload)
export const fetchTasks = (token, params = {}) =>
  axios.get(`${API_BASE}/tasks`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })
export const loginWithWorkspace = (workspaceId) =>
  axios.post(
    `${API_BASE}/auth/login`,
    new URLSearchParams({ username: workspaceId, password: 'placeholder' }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  )
