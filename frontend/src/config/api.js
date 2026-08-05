import axios from 'axios'

// Set the base URL for API requests.
// VITE_API_URL should be set for local dev (http://localhost:5000, since
// the frontend and backend run on different ports there). In production
// the frontend and backend are deployed together on the same Vercel
// domain (see vercel.json), so if VITE_API_URL isn't set we must NOT fall
// back to localhost:5000 — that would make every visitor's browser try to
// reach their own machine and silently fail every request. Falling back
// to '' instead makes axios use same-origin relative paths, which is
// exactly right for the combined Vercel deployment.
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : '')

axios.defaults.baseURL = API_BASE_URL

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axios
export { API_BASE_URL }