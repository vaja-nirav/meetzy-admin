import { adminAxios } from './axios'

export const usersApi = {
  getUsers: async (params) => {
    const res = await adminAxios.get('/users', { params })
    return res.data
  },

  getUserById: async (userId) => {
    const res = await adminAxios.get(`/users/${userId}`)
    return res.data
  },

  banUser: async (userId, action, reason) => {
    const res = await adminAxios.patch(`/users/${userId}/ban`, { action, reason })
    return res.data
  },

  updateVip: async (userId, action, durationDays) => {
    const res = await adminAxios.patch(`/users/${userId}/vip`, { action, durationDays })
    return res.data
  },

  updateCoins: async (userId, action, amount, reason) => {
    const res = await adminAxios.post(`/users/${userId}/coins`, { action, amount, reason })
    return res.data
  },
}
