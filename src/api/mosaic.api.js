import { adminAxios } from './axios'

export const mosaicApi = {
  getAll: async (params) => {
    const res = await adminAxios.get('/mosaic', { params })
    return res.data
  },

  create: async (data) => {
    const res = await adminAxios.post('/mosaic', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await adminAxios.patch(`/mosaic/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await adminAxios.delete(`/mosaic/${id}`)
    return res.data
  },

  updateStatus: async (id, status) => {
    const res = await adminAxios.patch(`/mosaic/${id}/status`, { status })
    return res.data
  },
}
