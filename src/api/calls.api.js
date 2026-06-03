import { adminAxios } from './axios'

export const callsApi = {
  getCalls: async (params) => {
    const res = await adminAxios.get('/calls', { params })
    return res.data
  },

  getActiveCalls: async () => {
    const res = await adminAxios.get('/calls/active')
    return res.data
  },

  terminateCall: async (roomId) => {
    const res = await adminAxios.delete(`/calls/${roomId}/terminate`)
    return res.data
  },
}
