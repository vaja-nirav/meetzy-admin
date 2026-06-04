import { adminAxios, publicAxios } from './axios'

export const peopleApi = {
  getAll: async (params) => {
    const res = await adminAxios.get('/people', { params })
    return res.data
  },

  create: async (data) => {
    const res = await adminAxios.post('/people', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await adminAxios.patch(`/people/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await adminAxios.delete(`/people/${id}`)
    return res.data
  },

  updateStatus: async (id, status) => {
    const res = await adminAxios.patch(`/people/${id}/status`, { status })
    return res.data
  },

  // Public countries list (for the country dropdown)
  getCountries: async () => {
    const res = await publicAxios.get('/countries')
    return res.data
  },
}
