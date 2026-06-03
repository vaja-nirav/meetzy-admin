import { adminAxios } from './axios'

export const blockedApi = {
  getBlocked: async (params) => {
    const res = await adminAxios.get('/blocked', { params })
    return res.data
  },

  removeBlock: async (blockId) => {
    const res = await adminAxios.delete(`/blocked/${blockId}`)
    return res.data
  },
}
