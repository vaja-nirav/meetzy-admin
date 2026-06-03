import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'

export const adminAxios = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: { 'Content-Type': 'application/json' },
})

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})
