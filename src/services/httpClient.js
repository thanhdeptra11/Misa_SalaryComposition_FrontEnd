import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status ?? 0
    const payload = err.response?.data
    const message = payload?.message || payload?.error || err.message || 'Network error'
    return Promise.reject({ status, message, data: payload })
  }
)

export default httpClient
