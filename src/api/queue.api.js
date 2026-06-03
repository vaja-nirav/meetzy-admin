import { adminAxios } from './axios'

export const queueApi = {
  getQueue: async () => {
    const res = await adminAxios.get('/queue')
    return res.data
  },

  removeFromQueue: async (userId) => {
    const res = await adminAxios.delete(`/queue/${userId}`)
    return res.data
  },
}
