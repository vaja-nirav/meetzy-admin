import { adminAxios } from './axios'

export const authApi = {
  login: async (email, password) => {
    const res = await adminAxios.post('/login', { email, password })
    return res.data
  },
}
