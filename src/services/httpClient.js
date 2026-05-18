import axios from 'axios'
// Tạo axios instance để gửi request 
const httpClient = axios.create({
   // Đọc base URL từ file .env
  baseURL: import.meta.env.VITE_API_BASE_URL_LOCAL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})
// Bộ lọc response
httpClient.interceptors.response.use(
  //Nếu resquest thành công
  (res) => res.data,
  (err) => {
    const status = err.response?.status ?? 0
    const payload = err.response?.data
    const message =
      payload?.userMsg ||
      payload?.devMsg ||
      payload?.message ||
      payload?.error ||
      err.message ||
      'Network error'
    // Object lỗi được chuẩn hóa
    return Promise.reject({ status, message, data: payload })
  }
)

export default httpClient
