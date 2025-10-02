import axios from 'axios'

// Set the base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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